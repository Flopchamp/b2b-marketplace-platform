import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface KYCDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'bank_statement' | 'identity_document';
  filename: string;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface KYCSubmission {
  retailerId: string;
  documents: KYCDocument[];
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
  references?: {
    supplierName: string;
    contactEmail: string;
    relationshipYears: number;
  }[];
}

export interface KYCResult {
  status: 'approved' | 'rejected' | 'pending_review';
  creditScore: number;
  creditLimit: number;
  approvedAt?: Date;
  notes?: string;
  nextReviewDate?: Date;
}

export class KYCService {
  /**
   * Submit KYC documents and information for review
   */
  static async submitKYC(submission: KYCSubmission): Promise<{ success: boolean; submissionId: string }> {
    try {
      // Update retailer with KYC submission
      const updatedRetailer = await prisma.retailer.update({
        where: { id: submission.retailerId },
        data: {
          businessLicense: submission.businessInfo.registrationNumber,
          taxId: submission.businessInfo.taxId,
          status: 'PENDING_VERIFICATION',
          // Store additional KYC data in a JSON field (if you add one to schema)
        }
      });

      // TODO: Store documents in file storage service
      // TODO: Create KYC submission record for tracking
      
      return {
        success: true,
        submissionId: `kyc_${Date.now()}_${submission.retailerId.slice(-6)}`
      };
    } catch (error) {
      console.error('KYC submission error:', error);
      throw new Error('Failed to submit KYC application');
    }
  }

  /**
   * Process KYC review (admin function)
   */
  static async processKYCReview(
    retailerId: string, 
    decision: 'approved' | 'rejected',
    reviewData: {
      creditScore: number;
      creditLimit: number;
      notes?: string;
    }
  ): Promise<KYCResult> {
    try {
      const result = await prisma.retailer.update({
        where: { id: retailerId },
        data: {
          isKYCVerified: decision === 'approved',
          creditScore: reviewData.creditScore,
          creditLimit: reviewData.creditLimit,
          status: decision === 'approved' ? 'ACTIVE' : 'SUSPENDED',
        }
      });

      // TODO: Send notification to retailer
      // TODO: Create audit log entry
      
      return {
        status: decision,
        creditScore: reviewData.creditScore,
        creditLimit: reviewData.creditLimit,
        approvedAt: decision === 'approved' ? new Date() : undefined,
        notes: reviewData.notes,
      };
    } catch (error) {
      console.error('KYC review processing error:', error);
      throw new Error('Failed to process KYC review');
    }
  }

  /**
   * Get KYC status for a retailer
   */
  static async getKYCStatus(retailerId: string): Promise<{
    status: string;
    isVerified: boolean;
    creditScore: number;
    creditLimit: number;
    documentsRequired: string[];
  }> {
    try {
      const retailer = await prisma.retailer.findUnique({
        where: { id: retailerId }
      });

      if (!retailer) {
        throw new Error('Retailer not found');
      }

      // Determine missing documents
      const documentsRequired = [];
      if (!retailer.businessLicense) documentsRequired.push('Business License');
      if (!retailer.taxId) documentsRequired.push('Tax ID Certificate');

      return {
        status: retailer.status,
        isVerified: retailer.isKYCVerified,
        creditScore: retailer.creditScore,
        creditLimit: retailer.creditLimit,
        documentsRequired,
      };
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw new Error('Failed to fetch KYC status');
    }
  }

  /**
   * Calculate credit score based on business data
   */
  static calculateCreditScore(businessData: {
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
    const employees = parseInt(businessData.employeeCount) || 0;
    if (employees > 50) score += 100;
    else if (employees > 10) score += 50;
    else if (employees > 5) score += 25;

    // Banking history (max 100 points)
    score += Math.min(businessData.bankingHistory * 5, 100);

    // References (max 50 points)
    score += Math.min(businessData.references * 25, 50);

    return Math.min(score, 850); // Cap at 850
  }

  /**
   * Determine credit limit based on credit score and business data
   */
  static calculateCreditLimit(creditScore: number, annualRevenue?: number): number {
    const baseLimit = creditScore * 10; // Base calculation
    
    if (annualRevenue) {
      // Limit to 5% of annual revenue or score-based limit, whichever is lower
      const revenueBasedLimit = annualRevenue * 0.05;
      return Math.min(baseLimit, revenueBasedLimit);
    }
    
    return baseLimit;
  }
}

export default KYCService;
