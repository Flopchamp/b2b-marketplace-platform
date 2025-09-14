'use client';

import { useState } from 'react';
import { DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface KYCDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'bank_statement' | 'identity_document';
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
}

interface KYCFormData {
  businessInfo: {
    legalName: string;
    registrationNumber: string;
    taxId: string;
    yearEstablished: number;
    annualRevenue: number;
    employeeCount: string;
  };
  bankingInfo: {
    bankName: string;
    accountType: 'business' | 'corporate';
    monthsInBusiness: number;
  };
  documents: File[];
}

export default function KYCForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    businessInfo: {
      legalName: '',
      registrationNumber: '',
      taxId: '',
      yearEstablished: new Date().getFullYear(),
      annualRevenue: 0,
      employeeCount: '1-5',
    },
    bankingInfo: {
      bankName: '',
      accountType: 'business',
      monthsInBusiness: 12,
    },
    documents: [],
  });

  const [uploadedDocs, setUploadedDocs] = useState<KYCDocument[]>([]);

  const handleFileUpload = (files: FileList | null, docType: KYCDocument['type']) => {
    if (files && files.length > 0) {
      const file = files[0];
      const newDoc: KYCDocument = {
        id: `doc_${Date.now()}`,
        type: docType,
        filename: file.name,
        status: 'pending',
        uploadedAt: new Date(),
      };
      setUploadedDocs(prev => [...prev, newDoc]);
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement actual KYC submission
      console.log('Submitting KYC:', formData);
      alert('KYC application submitted successfully! We will review your application within 2-3 business days.');
    } catch (error) {
      console.error('KYC submission error:', error);
      alert('Failed to submit KYC application. Please try again.');
    }
  };

  const documentTypes = [
    { type: 'business_license', label: 'Business License', required: true },
    { type: 'tax_certificate', label: 'Tax Certificate', required: true },
    { type: 'bank_statement', label: 'Bank Statement (Last 3 months)', required: true },
    { type: 'identity_document', label: 'Owner ID Document', required: true },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your KYC Verification</h1>
          <p className="text-gray-600 mt-2">
            Please provide the required information and documents to verify your business.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum, index) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepNum ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {stepNum === 1 ? 'Business Info' : stepNum === 2 ? 'Banking Info' : 'Documents'}
                </span>
                {index < 2 && (
                  <div className={`ml-4 mr-4 h-px w-16 ${
                    step > stepNum ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.legalName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, legalName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.registrationNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, registrationNumber: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID Number *
                  </label>
                  <input
                    type="text"
                    value={formData.businessInfo.taxId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, taxId: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Established *
                  </label>
                  <input
                    type="number"
                    value={formData.businessInfo.yearEstablished}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, yearEstablished: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.businessInfo.annualRevenue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, annualRevenue: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees *
                  </label>
                  <select
                    value={formData.businessInfo.employeeCount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, employeeCount: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="1-5">1-5 employees</option>
                    <option value="6-10">6-10 employees</option>
                    <option value="11-25">11-25 employees</option>
                    <option value="26-50">26-50 employees</option>
                    <option value="51-100">51-100 employees</option>
                    <option value="100+">100+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Banking Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankingInfo.bankName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingInfo: { ...prev.bankingInfo, bankName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type *
                  </label>
                  <select
                    value={formData.bankingInfo.accountType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingInfo: { ...prev.bankingInfo, accountType: e.target.value as 'business' | 'corporate' }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="business">Business Account</option>
                    <option value="corporate">Corporate Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Months in Business *
                  </label>
                  <input
                    type="number"
                    value={formData.bankingInfo.monthsInBusiness}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingInfo: { ...prev.bankingInfo, monthsInBusiness: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
              <p className="text-gray-600">
                Please upload clear, high-quality images or PDFs of the following documents:
              </p>
              
              <div className="space-y-4">
                {documentTypes.map((docType) => (
                  <div key={docType.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{docType.label}</h4>
                      {docType.required && <span className="text-red-500 text-sm">*Required</span>}
                    </div>
                    
                    <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center">
                      <DocumentArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop or click to upload
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files, docType.type)}
                        className="hidden"
                        id={`upload-${docType.type}`}
                      />
                      <label
                        htmlFor={`upload-${docType.type}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-purple-700"
                      >
                        Choose File
                      </label>
                    </div>
                    
                    {uploadedDocs.filter(doc => doc.type === docType.type).map((doc) => (
                      <div key={doc.id} className="mt-2 flex items-center space-x-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{doc.filename}</span>
                        <span className="text-gray-500">Uploaded</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit KYC Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
