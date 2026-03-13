import { Store } from 'lucide-react';
import { Store as StoreType } from '@/types';

interface HeaderProps {
  selectedStore: StoreType | null;
}

export default function Header({ selectedStore }: HeaderProps) {
  return (
    <header className="bg-mumuso-dark text-white px-8 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-mumuso-gold rounded-lg flex items-center justify-center">
          <Store className="w-7 h-7 text-mumuso-dark" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">MUMUSO POS Terminal</h1>
          <p className="text-sm text-gray-400">Mock Demo Interface</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-gray-400">Current Store</p>
          <p className="font-semibold text-lg">
            {selectedStore?.name || 'Select Store'}
          </p>
          {selectedStore && (
            <p className="text-xs text-gray-400">{selectedStore.city}</p>
          )}
        </div>
      </div>
    </header>
  );
}
