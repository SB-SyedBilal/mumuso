import { QrCode, User } from 'lucide-react';
import { Store as StoreType } from '@/types';

interface MemberValidationProps {
  memberId: string;
  setMemberId: (id: string) => void;
  onValidate: () => void;
  stores: StoreType[];
  selectedStore: StoreType | null;
  setSelectedStore: (store: StoreType) => void;
  isValidating: boolean;
}

export default function MemberValidation({
  memberId,
  setMemberId,
  onValidate,
  stores,
  selectedStore,
  setSelectedStore,
  isValidating,
}: MemberValidationProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <User className="w-6 h-6 text-mumuso-gold" />
        Member Validation
      </h2>

      {/* Store Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Store
        </label>
        <select
          className="input-field"
          value={selectedStore?.store_id || ''}
          onChange={(e) => {
            const store = stores.find(s => s.store_id === e.target.value);
            if (store) setSelectedStore(store);
          }}
        >
          {stores.map((store) => (
            <option key={store.store_id} value={store.store_id}>
              {store.name} - {store.city}
            </option>
          ))}
        </select>
      </div>

      {/* Member ID Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Member ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="MUM-12345"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && memberId) {
                onValidate();
              }
            }}
          />
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={onValidate}
            disabled={!memberId || isValidating}
          >
            <QrCode className="w-5 h-5" />
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter member ID or scan QR code
        </p>
      </div>
    </div>
  );
}
