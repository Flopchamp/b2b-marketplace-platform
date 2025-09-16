import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface KYCSubmissionData {
  businessInfo: {
    legalName: string;
    registrationNumber: string;
    taxId: string;
    yearEstablished: number;
    annualRevenue?: number;
    employeeCount: string;
  };
  bankingInfo: {
    bankName: string;
    accountType: 'business' | 'corporate';
    monthsInBusiness: number;
  };
  documents: Array<{
    fileId: string;
    documentType: string;
    fileName: string;
  }>;
}

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

    // Ensure user is a retailer
    if (authResult.user.role !== 'retailer') {
      return NextResponse.json(
        { success: false, error: 'Only retailers can submit KYC applications' },
        { status: 403 }
      );
    }

    const submissionData: KYCSubmissionData = await request.json();

    // Validate submission data
    if (!submissionData.businessInfo || !submissionData.bankingInfo) {
      return NextResponse.json(
        { success: false, error: 'Business and banking information are required' },
        { status: 400 }
      );
    }

    // Validate required business info
    const { businessInfo } = submissionData;
    if (!businessInfo.legalName || !businessInfo.registrationNumber || !businessInfo.taxId) {
      return NextResponse.json(
        { success: false, error: 'Legal name, registration number, and tax ID are required' },
        { status: 400 }
      );
    }

    // Validate year established
    const currentYear = new Date().getFullYear();
    if (businessInfo.yearEstablished < 1900 || businessInfo.yearEstablished > currentYear) {
      return NextResponse.json(
        { success: false, error: 'Invalid year established' },
        { status: 400 }
      );
    }

    // Validate banking info
    const { bankingInfo } = submissionData;
    if (!bankingInfo.bankName || bankingInfo.monthsInBusiness < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid banking information is required' },
        { status: 400 }
      );
    }

    // Check required documents
    const requiredDocuments = ['business_license', 'tax_certificate', 'bank_statement', 'identity_document'];
    const submittedDocTypes = submissionData.documents?.map(doc => doc.documentType) || [];
    const missingDocs = requiredDocuments.filter(docType => !submittedDocTypes.includes(docType));

    if (missingDocs.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required documents: ${missingDocs.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user's retailer information
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      include: { retailer: true }
    });

    if (!user?.retailer) {
      return NextResponse.json(
        { success: false, error: 'Retailer profile not found' },
        { status: 400 }
      );
    }

    // Calculate preliminary credit score
    const creditScore = calculateCreditScore({
      yearEstablished: businessInfo.yearEstablished,
      annualRevenue: businessInfo.annualRevenue,
      employeeCount: businessInfo.employeeCount,
      bankingHistory: bankingInfo.monthsInBusiness,
      references: 0 // TODO: Add references in future
    });

    // Calculate credit limit
    const creditLimit = calculateCreditLimit(creditScore, businessInfo.annualRevenue);

    // Update retailer with KYC submission data
    const updatedRetailer = await prisma.retailer.update({
      where: { id: user.retailer.id },
      data: {
        businessLicense: businessInfo.registrationNumber,
        taxId: businessInfo.taxId,
        status: 'PENDING_VERIFICATION',
        // Store additional business info in description for now
        description: JSON.stringify({
          businessInfo,
          bankingInfo,
          submissionDate: new Date().toISOString(),
          documents: submissionData.documents
        })
      }
    });

    // TODO: Store documents in proper KYC documents table
    // TODO: Create KYC submission record for tracking
    // TODO: Send notification to admin for review
    // TODO: Send confirmation email to retailer

    const submissionId = `kyc_${Date.now()}_${user.retailer.id.slice(-6)}`;

    return NextResponse.json({
      success: true,
      data: {
        submissionId,
        status: 'submitted',
        preliminaryCreditScore: creditScore,
        estimatedCreditLimit: creditLimit,
        submissionDate: new Date().toISOString(),
        reviewTimeline: '2-3 business days',
        message: 'KYC application submitted successfully. You will receive an email confirmation shortly.'
      }
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Submission failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's KYC status
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      include: { retailer: true }
    });

    if (!user?.retailer) {
      return NextResponse.json(
        { success: false, error: 'Retailer profile not found' },
        { status: 400 }
      );
    }

    // Parse stored KYC data
    let kycData = null;
    try {
      kycData = user.retailer.description ? JSON.parse(user.retailer.description) : null;
    } catch (e) {
      // Description might not be JSON
    }

    // Determine missing documents
    const requiredDocuments = ['business_license', 'tax_certificate', 'bank_statement', 'identity_document'];
    const documentsRequired = [];
    if (!user.retailer.businessLicense) documentsRequired.push('Business License');
    if (!user.retailer.taxId) documentsRequired.push('Tax ID Certificate');

    return NextResponse.json({
      success: true,
      data: {
        status: user.retailer.status,
        isKYCVerified: user.retailer.isKYCVerified,
        creditScore: user.retailer.creditScore,
        creditLimit: user.retailer.creditLimit,
        documentsRequired,
        submissionDate: kycData?.submissionDate,
        businessInfo: kycData?.businessInfo,
        bankingInfo: kycData?.bankingInfo,
        hasSubmittedKYC: !!kycData,
        reviewNotes: null // TODO: Add review notes field to schema
      }
    });

  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KYC status' },
      { status: 500 }
    );
  }
}

// Helper function to calculate credit score
function calculateCreditScore(businessData: {
  yearEstablished: number;
  annualRevenue?: number;
  employeeCount: string;
  bankingHistory: number; // months
  references: number; // count
}): number {
  let score = 500; // Base score

  // Years in business (max 200 points)
  const yearsInBusiness = new Date().getFullYear() - businessData.yearEstablished;
  score += Math.min(yearsInBusiness * 20, 200);

  // Revenue scoring (max 150 points)
  if (businessData.annualRevenue) {
    if (businessData.annualRevenue > 1000000) score += 150;
    else if (businessData.annualRevenue > 500000) score += 100;
    else if (businessData.annualRevenue > 100000) score += 50;
  }

  // Employee count (max 100 points)
  const employees = parseInt(businessData.employeeCount.split('-')[0]) || 0;
  if (employees > 50) score += 100;
  else if (employees > 10) score += 50;
  else if (employees > 5) score += 25;

  // Banking history (max 100 points)
  score += Math.min(businessData.bankingHistory * 2, 100);

  // References (max 50 points)
  score += Math.min(businessData.references * 25, 50);

  return Math.min(score, 850); // Cap at 850
}

// Helper function to calculate credit limit
function calculateCreditLimit(creditScore: number, annualRevenue?: number): number {
  const baseLimit = creditScore * 10; // Base calculation
  
  if (annualRevenue) {
    // Limit to 5% of annual revenue or score-based limit, whichever is lower
    const revenueBasedLimit = annualRevenue * 0.05;
    return Math.min(baseLimit, revenueBasedLimit);
  }
  
  return baseLimit;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
