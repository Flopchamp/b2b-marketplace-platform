import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Temporary file storage simulation (replace with actual AWS S3 when ready)
const uploadedFiles = new Map<string, {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
}>();

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
        { success: false, error: 'Only retailers can upload KYC documents' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { success: false, error: 'Document type is required' },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes = [
      'business_license',
      'tax_certificate', 
      'bank_statement',
      'identity_document',
      'utility_bill',
      'financial_statement'
    ];

    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
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

    // Simulate file upload (replace with actual S3 upload)
    const fileId = `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const fileUrl = `https://mock-s3-bucket.com/kyc-documents/${fileId}_${file.name}`;
    
    // Store file metadata
    uploadedFiles.set(fileId, {
      id: fileId,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      url: fileUrl
    });

    // TODO: Store KYC document in database
    // For now, we'll just return the upload success
    
    return NextResponse.json({
      success: true,
      data: {
        fileId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        documentType,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('KYC document upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
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

    // Get user's uploaded documents
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

    // TODO: Get actual KYC documents from database
    // For now, return mock data
    const documents = [
      {
        id: 'doc_1',
        type: 'business_license',
        fileName: 'business_license.pdf',
        status: 'pending',
        uploadedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        documents,
        kycStatus: user.retailer.isKYCVerified ? 'approved' : 'pending'
      }
    });

  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Check if file exists
    const fileData = uploadedFiles.get(fileId);
    if (!fileData) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // TODO: Verify file belongs to the authenticated user
    // TODO: Delete file from S3
    // TODO: Remove from database

    // Remove from temporary storage
    uploadedFiles.delete(fileId);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting KYC document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
