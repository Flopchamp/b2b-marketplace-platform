import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, allow retailers to access for demo purposes
    // TODO: Add proper admin role to User model
    if (authResult.user.role !== 'retailer' && authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch all retailers with KYC data
    const retailers = await prisma.retailer.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform data for admin interface
    const submissions = retailers.map(retailer => {
      let kycData = null;
      try {
        kycData = retailer.description ? JSON.parse(retailer.description) : null;
      } catch {
        // Description might not be JSON
      }

      const primaryUser = retailer.users[0];

      return {
        id: retailer.id,
        retailerName: primaryUser?.name || retailer.businessName,
        retailerId: primaryUser?.id || retailer.id,
        submissionDate: kycData?.submissionDate || retailer.updatedAt.toISOString(),
        status: mapRetailerStatusToKYCStatus(retailer.status),
        businessInfo: kycData?.businessInfo || {
          legalName: retailer.businessName,
          registrationNumber: retailer.businessLicense || 'N/A',
          taxId: retailer.taxId || 'N/A',
          yearEstablished: retailer.yearEstablished || new Date().getFullYear() - 1,
          employeeCount: retailer.employeeCount || '1-5'
        },
        bankingInfo: kycData?.bankingInfo || {
          bankName: 'Not provided',
          accountType: 'business',
          monthsInBusiness: 12
        },
        documents: kycData?.documents || [],
        creditScore: retailer.creditScore || 0,
        creditLimit: retailer.creditLimit || 0,
        reviewNotes: null,
        isKYCVerified: retailer.isKYCVerified
      };
    });

    // Filter to only show retailers with KYC submissions or that need review
    const kycSubmissions = submissions.filter(submission => 
      submission.businessInfo.registrationNumber !== 'N/A' || 
      submission.status !== 'pending'
    );

    return NextResponse.json({
      success: true,
      submissions: kycSubmissions
    });

  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

function mapRetailerStatusToKYCStatus(status: string) {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return 'pending';
    case 'UNDER_REVIEW':
      return 'under_review';
    case 'ACTIVE':
      return 'approved';
    case 'SUSPENDED':
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
}
