import { NextRequest, NextResponse } from 'next/server';
import { AuthService, CompanyRegistration, RetailerRegistration } from '@/lib/auth/postgresql-auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userType, ...userData } = body;

    if (!userType || !['company', 'retailer'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type. Must be either "company" or "retailer".' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!userData.email || !userData.password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    let user;

    if (userType === 'company') {
      // Validate company-specific fields
      if (!userData.name) {
        return NextResponse.json(
          { error: 'Company name is required.' },
          { status: 400 }
        );
      }

      const companyData: CompanyRegistration = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        businessRegistration: userData.businessRegistration,
        website: userData.website,
        address: userData.address,
      };

      user = await AuthService.registerCompany(companyData);
    } else {
      // Validate retailer-specific fields
      if (!userData.businessName || !userData.contactPerson) {
        return NextResponse.json(
          { error: 'Business name and contact person are required.' },
          { status: 400 }
        );
      }

      const retailerData: RetailerRegistration = {
        businessName: userData.businessName,
        contactPerson: userData.contactPerson,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        address: userData.address,
      };

      user = await AuthService.registerRetailer(retailerData);
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: user,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);

    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}