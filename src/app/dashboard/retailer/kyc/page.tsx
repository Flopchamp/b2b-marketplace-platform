'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KYCForm from '@/components/auth/KYCForm';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface KYCStatus {
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submissionDate?: string;
  reviewNotes?: string;
  creditScore?: number;
  creditLimit?: number;
}

export default function KYCPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: 'pending' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!accessToken || !userData) {
      router.push('/auth/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'retailer') {
        router.push('/dashboard/company');
        return;
      }
      
      setUser(parsedUser);
      
      // Load KYC status
      loadKYCStatus(accessToken);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/signin');
    }
  }, [router]);

  const loadKYCStatus = async (token: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/kyc/status', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Mock KYC status for now
      setKycStatus({
        status: user?.kycStatus || 'pending',
        submissionDate: undefined,
        creditScore: 0,
        creditLimit: 0,
      });
    } catch (error) {
      console.error('Error loading KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (kycStatus.status) {
      case 'approved':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case 'in_review':
        return <ClockIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return <ClockIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (kycStatus.status) {
      case 'approved':
        return {
          title: 'KYC Verification Approved! 🎉',
          message: 'Your business has been verified. You can now access credit terms and place larger orders.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        };
      case 'rejected':
        return {
          title: 'KYC Verification Requires Attention',
          message: 'Please review our feedback and resubmit your application with the requested changes.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        };
      case 'in_review':
        return {
          title: 'KYC Under Review',
          message: 'Our team is reviewing your submission. This typically takes 2-3 business days.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };
      default:
        return {
          title: 'Complete Your KYC Verification',
          message: 'Verify your business to unlock credit terms, higher order limits, and better pricing.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading KYC status...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/retailer')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">KYC Verification</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6 mb-8`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="ml-4">
              <h2 className={`text-lg font-medium ${statusInfo.textColor}`}>
                {statusInfo.title}
              </h2>
              <p className={`mt-1 ${statusInfo.textColor}`}>
                {statusInfo.message}
              </p>
              
              {kycStatus.status === 'approved' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Credit Score</p>
                    <p className="text-2xl font-bold text-gray-900">{kycStatus.creditScore || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(kycStatus.creditLimit || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {kycStatus.submissionDate && (
                <p className={`mt-2 text-sm ${statusInfo.textColor}`}>
                  Submitted: {new Date(kycStatus.submissionDate).toLocaleDateString()}
                </p>
              )}

              {kycStatus.reviewNotes && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm font-medium text-gray-900">Review Notes:</p>
                  <p className="text-sm text-gray-700 mt-1">{kycStatus.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KYC Form or Resubmission */}
        {(kycStatus.status === 'pending' || kycStatus.status === 'rejected') && (
          <KYCForm />
        )}

        {/* Benefits Section */}
        {kycStatus.status === 'pending' && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Benefits of KYC Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Credit Terms</h4>
                  <p className="text-gray-600 text-sm">Get 30, 60, or 90-day payment terms</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Higher Order Limits</h4>
                  <p className="text-gray-600 text-sm">Place larger orders with approved credit</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Better Pricing</h4>
                  <p className="text-gray-600 text-sm">Access to volume discounts and special pricing</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Priority Support</h4>
                  <p className="text-gray-600 text-sm">Dedicated account management and faster processing</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
