import { Plus, X, ShoppingCart } from 'lucide-react';
import { CartItem } from '@/types';
import { useState } from 'react';

interface CartItemsProps {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
}

export default function CartItems({ items, setItems }: CartItemsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    quantity: 1,
    unit_price: 0,
  });

  const handleAddItem = () => {
    if (!newItem.sku || !newItem.name || newItem.unit_price <= 0) {
      alert('Please fill all fields');
      return;
    }

    const item: CartItem = {
      ...newItem,
      subtotal: newItem.quantity * newItem.unit_price,
    };

    setItems([...items, item]);
    setNewItem({ sku: '', name: '', quantity: 1, unit_price: 0 });
    setShowAddForm(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-mumuso-gold" />
          Cart Items
        </h2>
        <button
          className="btn-secondary text-sm flex items-center gap-1"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="SKU"
              className="input-field text-sm"
              value={newItem.sku}
              onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
            />
            <input
              type="text"
              placeholder="Item Name"
              className="input-field text-sm"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="input-field text-sm"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              min="1"
            />
            <input
              type="number"
              placeholder="Unit Price"
              className="input-field text-sm"
              value={newItem.unit_price || ''}
              onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm flex-1" onClick={handleAddItem}>
              Add to Cart
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No items in cart</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">
                  SKU: {item.sku} | Qty: {item.quantity} × Rs. {item.unit_price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-lg">Rs. {item.subtotal.toFixed(2)}</p>
                <button
                  className="text-red-500 hover:text-red-700 p-1"
                  onClick={() => handleRemoveItem(index)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
