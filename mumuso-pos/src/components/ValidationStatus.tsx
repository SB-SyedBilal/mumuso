import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ValidationResult } from '@/types';

interface ValidationStatusProps {
  result: ValidationResult;
}

export default function ValidationStatus({ result }: ValidationStatusProps) {
  const isValid = result.valid;
  const isExpired = result.member_status === 'expired';
  const isNotFound = result.member_status === 'not_found';
  const isSuspended = result.member_status === 'suspended';

  return (
    <div
      className={`card border-2 ${
        isValid
          ? 'border-mumuso-success bg-green-50'
          : 'border-mumuso-error bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {isValid ? (
          <CheckCircle className="w-8 h-8 text-mumuso-success flex-shrink-0" />
        ) : (
          <XCircle className="w-8 h-8 text-mumuso-error flex-shrink-0" />
        )}
        
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-2 ${isValid ? 'text-green-800' : 'text-red-800'}`}>
            {isValid ? '✓ Valid Membership' : '✗ Invalid Membership'}
          </h3>
          
          {isValid && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Member Name</p>
                  <p className="font-semibold">{result.member_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member ID</p>
                  <p className="font-semibold">{result.member_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="font-semibold text-mumuso-success text-xl">
                    {result.discount_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="font-semibold">
                    {result.expiry_date ? new Date(result.expiry_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-3">
                <p className="text-green-800 font-medium">{result.message}</p>
              </div>
            </div>
          )}

          {!isValid && (
            <div className="space-y-2">
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-800 font-medium">{result.message}</p>
              </div>
              
              {isExpired && result.expired_on && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Membership expired on {new Date(result.expired_on).toLocaleDateString()}.
                    Ask customer to renew in their mobile app.
                  </p>
                </div>
              )}
              
              {isNotFound && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Member ID not found in system. Please verify the ID with customer.
                  </p>
                </div>
              )}
              
              {isSuspended && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Account suspended. Direct customer to Mumuso support.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
