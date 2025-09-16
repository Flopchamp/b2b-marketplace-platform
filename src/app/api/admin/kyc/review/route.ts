import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For demo purposes, allow retailers to review (in production, restrict to admin)
    if (authResult.user.role !== 'retailer' && authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const { submissionId, status, reviewNotes } = await request.json();

    if (!submissionId || !status) {
      return NextResponse.json(
        { success: false, error: 'Submission ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find the retailer by submission ID
    const retailer = await prisma.retailer.findUnique({
      where: { id: submissionId }
    });

    if (!retailer) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Map review status to retailer status
    let newRetailerStatus;
    let isKYCVerified = false;

    switch (status) {
      case 'approved':
        newRetailerStatus = 'ACTIVE';
        isKYCVerified = true;
        break;
      case 'rejected':
        newRetailerStatus = 'REJECTED';
        isKYCVerified = false;
        break;
      case 'under_review':
        newRetailerStatus = 'UNDER_REVIEW';
        isKYCVerified = false;
        break;
      default:
        newRetailerStatus = 'PENDING_VERIFICATION';
    }

    // Update retailer status
    const updatedRetailer = await prisma.retailer.update({
      where: { id: submissionId },
      data: {
        status: newRetailerStatus as any,
        isKYCVerified,
        // Store review notes in description for now
        description: retailer.description ? 
          updateDescriptionWithReviewNotes(retailer.description, reviewNotes || '') :
          JSON.stringify({ reviewNotes: reviewNotes || '', reviewDate: new Date().toISOString() })
      }
    });

    // TODO: Send notification email to retailer
    // TODO: Create audit log entry
    // TODO: Update user status if needed

    return NextResponse.json({
      success: true,
      data: {
        submissionId,
        newStatus: status,
        retailerStatus: newRetailerStatus,
        isKYCVerified,
        reviewDate: new Date().toISOString(),
        message: `KYC submission ${status} successfully`
      }
    });

  } catch (error) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
}

function updateDescriptionWithReviewNotes(currentDescription: string, reviewNotes: string): string {
  try {
    const data = JSON.parse(currentDescription);
    data.reviewNotes = reviewNotes;
    data.reviewDate = new Date().toISOString();
    return JSON.stringify(data);
  } catch {
    // If description is not JSON, create new structure
    return JSON.stringify({
      originalDescription: currentDescription,
      reviewNotes,
      reviewDate: new Date().toISOString()
    });
  }
}
