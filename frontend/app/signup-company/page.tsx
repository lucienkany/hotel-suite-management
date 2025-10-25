// frontend/app/signup-company/page.tsx
'use client';

import { ArrowLeft, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../lib/api-client';

export default function SignupCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    domain: '',
    companyAddress: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.adminPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Build payload matching the backend DTO
      const payload: any = {
        companyName: formData.companyName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminPassword: formData.adminPassword,
      };

      // Add optional fields only if they have values
      if (formData.domain.trim()) {
        payload.domain = formData.domain.trim();
      }

      if (formData.companyAddress.trim()) {
        payload.companyAddress = formData.companyAddress.trim();
      }

      if (formData.adminFirstName.trim()) {
        payload.adminFirstName = formData.adminFirstName.trim();
      }

      if (formData.adminLastName.trim()) {
        payload.adminLastName = formData.adminLastName.trim();
      }

      console.log('Sending signup request with payload:', {
        ...payload,
        adminPassword: '[HIDDEN]',
      });

      const response = await apiClient.signupCompany(payload);

      console.log('Signup successful:', response);

      // Redirect to login with success message
      router.push(
        `/login?signup=success&email=${encodeURIComponent(
          formData.adminEmail
        )}&message=Company created successfully! Please sign in with your credentials.`
      );
    } catch (err: any) {
      console.error('Full error object:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);

      let errorMessage = 'Signup failed. Please try again.';

      if (err.response?.data) {
        const errorData = err.response.data;

        console.log(
          'Error data structure:',
          JSON.stringify(errorData, null, 2)
        );

        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors
            .map((e: any) => e.msg || e.message)
            .join(', ');
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HotelSuite</span>
          </div>
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Start Your Free Trial
              </h1>
              <p className="text-gray-600">
                Create your hotel management account in minutes
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Company Information
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Company Name"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Hotels Inc."
                    required
                  />
                  <Input
                    label="Company Domain (Optional)"
                    name="domain"
                    type="text"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="acmehotels.com"
                  />
                  <Input
                    label="Company Address (Optional)"
                    name="companyAddress"
                    type="text"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street, New York, NY 10001"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Administrator Account
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name (Optional)"
                      name="adminFirstName"
                      type="text"
                      value={formData.adminFirstName}
                      onChange={handleChange}
                      placeholder="John"
                    />
                    <Input
                      label="Last Name (Optional)"
                      name="adminLastName"
                      type="text"
                      value={formData.adminLastName}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                  </div>
                  <Input
                    label="Email Address"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@acmehotels.com"
                    required
                  />
                  <Input
                    label="Password"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    helperText="Minimum 8 characters"
                  />
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✓ 14-day free trial • No credit card required • Cancel anytime
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
