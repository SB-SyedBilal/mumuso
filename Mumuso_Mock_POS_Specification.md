# MUMUSO MOCK POS INTERFACE - CLIENT DEMO

**Purpose:** A web-based mock POS terminal interface to simulate the CBS POS integration for client demos. This tool validates memberships and records transactions in real-time, syncing instantly with the admin dashboard.

---

## CRITICAL INSTRUCTIONS FOR AI

**What to Build:**
- A clean, professional web interface that simulates a retail POS terminal
- Must call the ACTUAL backend APIs (not mock data)
- Must sync in real-time with the admin dashboard via WebSocket
- Should look like a real POS system that store staff would use
- Must be intuitive enough for demo purposes (no training required)

**What NOT to Build:**
- Do NOT build a full POS system with inventory, receipts, etc.
- Do NOT add complex features beyond membership validation and transaction recording
- Do NOT make it look like a generic admin panel - it should look like a cashier's terminal

---

## 1. TECHNICAL REQUIREMENTS

### Tech Stack
```json
{
  "framework": "React 18+ or Next.js 14+",
  "styling": "TailwindCSS",
  "http_client": "axios or fetch",
  "state": "useState/useReducer (no complex state management needed)",
  "icons": "lucide-react",
  "deployment": "Vercel or similar (should be accessible via URL)"
}
```

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.mumuso.com
NEXT_PUBLIC_CBS_API_KEY=your_cbs_api_key_here
```

**CRITICAL:** The CBS_API_KEY should be hardcoded in the demo app (NOT exposed to user). This is a demo tool, not a production POS.

---

## 2. API ENDPOINTS TO INTEGRATE

### Endpoint 1: Validate Membership
```http
POST /api/pos/validate-membership
Authorization: Bearer {CBS_API_KEY}
Content-Type: application/json

Request Body:
{
  "member_id": "MUM-12345",
  "store_id": "STORE-001",
  "cart_total": 2500.00,
  "timestamp": "2026-03-13T14:30:00Z"
}

Response (Success):
{
  "valid": true,
  "member_id": "MUM-12345",
  "member_name": "Ahmed Khan",
  "member_status": "active",
  "discount_percentage": 10,
  "discount_amount": 250.00,
  "expiry_date": "2027-03-13",
  "message": "Discount applied successfully"
}

Response (Expired):
{
  "valid": false,
  "member_id": "MUM-12345",
  "member_status": "expired",
  "discount_percentage": 0,
  "discount_amount": 0,
  "expiry_date": "2025-12-31",
  "message": "Membership expired on 31/12/2025"
}

Response (Not Found):
{
  "valid": false,
  "member_status": "not_found",
  "discount_percentage": 0,
  "discount_amount": 0,
  "message": "Member ID not found"
}

Response (Suspended):
{
  "valid": false,
  "member_id": "MUM-12345",
  "member_status": "suspended",
  "discount_percentage": 0,
  "discount_amount": 0,
  "message": "Membership has been suspended"
}
```

### Endpoint 2: Record Transaction
```http
POST /api/pos/record-transaction
Authorization: Bearer {CBS_API_KEY}
Content-Type: application/json

Request Body:
{
  "transaction_id": "TXN-20260313-001234",
  "member_id": "MUM-12345",
  "store_id": "STORE-001",
  "store_name": "Dolmen Mall Clifton",
  "timestamp": "2026-03-13T14:30:00Z",
  "original_amount": 2500.00,
  "discount_amount": 250.00,
  "final_amount": 2250.00,
  "tax_amount": 337.50,
  "payment_method": "cash",
  "items": [
    {
      "sku": "SKU-001",
      "name": "Water Bottle",
      "quantity": 2,
      "unit_price": 300.00,
      "subtotal": 600.00
    },
    {
      "sku": "SKU-002",
      "name": "Notebook Set",
      "quantity": 1,
      "unit_price": 1900.00,
      "subtotal": 1900.00
    }
  ],
  "cashier_id": "CASHIER-042",
  "pos_terminal_id": "POS-TERMINAL-001"
}

Response:
{
  "success": true,
  "transaction_id": "TXN-20260313-001234",
  "message": "Transaction recorded successfully"
}
```

### Endpoint 3: Get Stores (for dropdown)
```http
GET /api/stores
Authorization: Bearer {CBS_API_KEY}

Response:
{
  "stores": [
    {
      "store_id": "STORE-001",
      "name": "Dolmen Mall Clifton",
      "city": "Karachi",
      "address": "HC 3, Rahat Commercial Area, Clifton Block 5"
    },
    {
      "store_id": "STORE-002",
      "name": "Dolmen City",
      "city": "Lahore",
      "address": "109 Main Boulevard, Lahore"
    }
    // ... more stores
  ]
}
```

---

## 3. COMPLETE UI/UX SPECIFICATION

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      MUMUSO POS TERMINAL                        │  ← Header
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LEFT PANEL (60%)              │  RIGHT PANEL (40%)            │
│  ────────────────              │  ───────────────              │
│                                │                               │
│  [SCAN QR / ENTER MEMBER ID]  │  ORDER SUMMARY                │
│                                │                               │
│  Member ID Input               │  Subtotal:      Rs. 0         │
│  [MUM-_____]  [SCAN]          │  Discount:      Rs. 0         │
│                                │  ─────────────────────         │
│  Store Selection               │  Total:         Rs. 0         │
│  [Dolmen Mall Clifton ▼]      │                               │
│                                │  Payment Method:              │
│  Cart Items                    │  ○ Cash  ○ Card  ○ Mobile    │
│  ┌─────────────────────────┐  │                               │
│  │ [+] Add Item            │  │  [COMPLETE PURCHASE]          │
│  ├─────────────────────────┤  │  (disabled until validated)   │
│  │ Water Bottle            │  │                               │
│  │ Qty: 2 × Rs. 300        │  │                               │
│  │ = Rs. 600        [×]    │  │                               │
│  ├─────────────────────────┤  │                               │
│  │ Notebook Set            │  │                               │
│  │ Qty: 1 × Rs. 1,900      │  │                               │
│  │ = Rs. 1,900      [×]    │  │                               │
│  └─────────────────────────┘  │                               │
│                                │                               │
│  MEMBER VALIDATION STATUS      │  TRANSACTION HISTORY          │
│  ─────────────────────────     │  ──────────────────          │
│  [Empty initially]             │  Last 5 transactions          │
│                                │  (with timestamps)            │
│                                │                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. DETAILED COMPONENT SPECIFICATIONS

### 4.1 Header Component

```javascript
// Header at top of screen
<header className="bg-[#1C1C1E] text-white px-8 py-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-[#C8A96E] rounded-lg flex items-center justify-center">
      <Store className="w-6 h-6 text-[#1C1C1E]" />
    </div>
    <div>
      <h1 className="text-xl font-semibold">MUMUSO POS Terminal</h1>
      <p className="text-sm text-gray-400">Mock Demo Interface</p>
    </div>
  </div>
  
  <div className="flex items-center gap-6">
    {/* Current Store Display */}
    <div className="text-right">
      <p className="text-sm text-gray-400">Current Store</p>
      <p className="font-medium">{selectedStore?.name || 'Select Store'}</p>
    </div>
    
    {/* Connection Status */}
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      <span className="text-sm">{isConnected ? 'Connected' : 'Offline'}</span>
    </div>
    
    {/* Current Time */}
    <div className="text-right">
      <p className="text-sm text-gray-400">Time</p>
      <p className="font-mono">{currentTime}</p>
    </div>
  </div>
</header>
```

**Requirements:**
- Header should be sticky at top
- Store name updates when dropdown changes
- Connection status checks API health
- Time updates every second
- Dark background (#1C1C1E) with white text

---

### 4.2 Store Selection Dropdown

```javascript
// Location: Top of left panel
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Store Location
  </label>
  <select
    value={selectedStoreId}
    onChange={(e) => setSelectedStoreId(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent"
  >
    <option value="">Select a store...</option>
    {stores.map(store => (
      <option key={store.store_id} value={store.store_id}>
        {store.name} - {store.city}
      </option>
    ))}
  </select>
</div>
```

**Requirements:**
- Fetch stores from `GET /api/stores` on component mount
- Store selection is REQUIRED before transaction can proceed
- Selected store_id is sent in all API calls

---

### 4.3 Member ID Input & QR Scanner

```javascript
<div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
    <CreditCard className="w-5 h-5 text-[#C8A96E]" />
    Member Identification
  </h3>
  
  <div className="flex gap-3">
    <div className="flex-1">
      <input
        type="text"
        placeholder="Enter Member ID (e.g., MUM-12345)"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value.toUpperCase())}
        onKeyPress={(e) => e.key === 'Enter' && handleValidateMember()}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent"
        disabled={isValidating}
      />
      <p className="text-xs text-gray-500 mt-1">
        Format: MUM-XXXXX (press Enter to validate)
      </p>
    </div>
    
    <button
      onClick={handleValidateMember}
      disabled={!memberId || isValidating || !selectedStoreId}
      className="px-6 py-3 bg-[#C8A96E] text-white rounded-lg font-semibold hover:bg-[#B09860] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isValidating ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Validating...
        </>
      ) : (
        <>
          <ScanLine className="w-5 h-5" />
          Validate
        </>
      )}
    </button>
  </div>
</div>
```

**Requirements:**
- Input automatically converts to uppercase
- Validates format: MUM-XXXXX
- Enter key triggers validation
- Button disabled if no store selected or no member ID entered
- Shows loading spinner during validation
- After successful validation, input is disabled (locked)

---

### 4.4 Member Validation Status Display

```javascript
// Shows after validation API call
{validationResult && (
  <div className={`rounded-xl p-6 mb-6 border-2 ${
    validationResult.valid 
      ? 'bg-green-50 border-green-500' 
      : 'bg-red-50 border-red-500'
  }`}>
    <div className="flex items-start gap-4">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        validationResult.valid ? 'bg-green-500' : 'bg-red-500'
      }`}>
        {validationResult.valid ? (
          <CheckCircle className="w-7 h-7 text-white" />
        ) : (
          <XCircle className="w-7 h-7 text-white" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <h4 className={`font-semibold text-lg mb-1 ${
          validationResult.valid ? 'text-green-900' : 'text-red-900'
        }`}>
          {validationResult.valid ? 'Valid Membership' : 'Invalid Membership'}
        </h4>
        
        {validationResult.valid ? (
          <>
            <p className="text-green-700 mb-3">{validationResult.message}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide">Member</p>
                <p className="font-semibold text-green-900">{validationResult.member_name}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide">Status</p>
                <p className="font-semibold text-green-900">{validationResult.member_status}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide">Discount</p>
                <p className="font-semibold text-green-900">{validationResult.discount_percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide">Valid Until</p>
                <p className="font-semibold text-green-900">
                  {formatDate(validationResult.expiry_date)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-red-700 mb-2">{validationResult.message}</p>
            <p className="text-sm text-red-600">
              {validationResult.member_status === 'expired' && 'Ask customer to renew membership'}
              {validationResult.member_status === 'suspended' && 'Contact management for assistance'}
              {validationResult.member_status === 'not_found' && 'Member ID does not exist in system'}
            </p>
          </>
        )}
        
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Scan Different Member
        </button>
      </div>
    </div>
  </div>
)}
```

**Requirements:**
- Show AFTER validation API call completes
- Green if valid, red if invalid
- Display all relevant member information
- Show appropriate error messages for each status
- "Scan Different Member" button clears state and allows new scan

---

### 4.5 Cart Items Section

```javascript
<div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-lg flex items-center gap-2">
      <ShoppingCart className="w-5 h-5 text-[#C8A96E]" />
      Cart Items
    </h3>
    <button
      onClick={() => setShowAddItem(true)}
      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Add Item
    </button>
  </div>
  
  {cartItems.length === 0 ? (
    <div className="text-center py-12 text-gray-400">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No items in cart</p>
      <p className="text-sm">Click "Add Item" to start</p>
    </div>
  ) : (
    <div className="space-y-3">
      {cartItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">
              {item.quantity} × Rs. {formatNumber(item.unit_price)}
            </p>
          </div>
          <div className="text-right mr-4">
            <p className="font-semibold text-lg">
              Rs. {formatNumber(item.subtotal)}
            </p>
          </div>
          <button
            onClick={() => removeCartItem(index)}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>
```

**Add Item Modal:**

```javascript
{showAddItem && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <h3 className="font-semibold text-lg mb-4">Add Item to Cart</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name
          </label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Water Bottle"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Rs."
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Subtotal</p>
          <p className="text-2xl font-semibold">
            Rs. {formatNumber(newItem.quantity * newItem.unit_price)}
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowAddItem(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleAddItem}
          disabled={!newItem.name || newItem.quantity < 1 || newItem.unit_price <= 0}
          className="flex-1 px-4 py-2 bg-[#C8A96E] text-white rounded-lg hover:bg-[#B09860] disabled:bg-gray-300"
        >
          Add Item
        </button>
      </div>
    </div>
  </div>
)}
```

**Requirements:**
- Empty state with illustration
- Each item shows name, quantity, unit price, subtotal
- Trash icon to remove items
- "Add Item" button opens modal
- Modal has name, quantity, unit price fields
- Subtotal auto-calculates
- Auto-generate SKU (SKU-001, SKU-002, etc.)

---

### 4.6 Order Summary Panel (Right Side)

```javascript
<div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-6">
  <h3 className="font-semibold text-lg mb-6">Order Summary</h3>
  
  {/* Subtotal */}
  <div className="flex justify-between py-3 border-b border-gray-200">
    <span className="text-gray-600">Subtotal</span>
    <span className="font-semibold">Rs. {formatNumber(cartTotal)}</span>
  </div>
  
  {/* Discount */}
  <div className="flex justify-between py-3 border-b border-gray-200">
    <span className="text-gray-600">
      Discount 
      {validationResult?.valid && (
        <span className="text-green-600 text-sm ml-1">
          ({validationResult.discount_percentage}%)
        </span>
      )}
    </span>
    <span className={`font-semibold ${discountAmount > 0 ? 'text-green-600' : ''}`}>
      - Rs. {formatNumber(discountAmount)}
    </span>
  </div>
  
  {/* Tax (optional) */}
  <div className="flex justify-between py-3 border-b border-gray-200">
    <span className="text-gray-600">Tax (15%)</span>
    <span className="font-semibold">Rs. {formatNumber(taxAmount)}</span>
  </div>
  
  {/* Total */}
  <div className="flex justify-between py-4 border-t-2 border-gray-900 mt-2">
    <span className="text-xl font-semibold">Total</span>
    <span className="text-2xl font-bold text-[#C8A96E]">
      Rs. {formatNumber(finalAmount)}
    </span>
  </div>
  
  {/* Payment Method */}
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Payment Method
    </label>
    <div className="space-y-2">
      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="payment"
          value="cash"
          checked={paymentMethod === 'cash'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-4 h-4 text-[#C8A96E]"
        />
        <span className="ml-3">Cash</span>
      </label>
      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="payment"
          value="card"
          checked={paymentMethod === 'card'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-4 h-4 text-[#C8A96E]"
        />
        <span className="ml-3">Card</span>
      </label>
      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="payment"
          value="mobile"
          checked={paymentMethod === 'mobile'}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-4 h-4 text-[#C8A96E]"
        />
        <span className="ml-3">Mobile Wallet</span>
      </label>
    </div>
  </div>
  
  {/* Complete Purchase Button */}
  <button
    onClick={handleCompletePurchase}
    disabled={!canCompletePurchase}
    className="w-full mt-6 px-6 py-4 bg-[#C8A96E] text-white rounded-xl font-semibold text-lg hover:bg-[#B09860] disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
  >
    {isProcessing ? (
      <>
        <Loader className="w-5 h-5 animate-spin" />
        Processing...
      </>
    ) : (
      <>
        <CreditCard className="w-5 h-5" />
        Complete Purchase
      </>
    )}
  </button>
  
  {/* Validation warnings */}
  {!canCompletePurchase && (
    <div className="mt-3 text-sm text-red-600 space-y-1">
      {!selectedStoreId && <p>• Select a store</p>}
      {cartItems.length === 0 && <p>• Add items to cart</p>}
      {!validationResult?.valid && <p>• Validate member ID</p>}
      {!paymentMethod && <p>• Select payment method</p>}
    </div>
  )}
</div>
```

**Calculation Logic:**

```javascript
// Calculate totals
const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
const discountAmount = validationResult?.valid 
  ? (cartTotal * validationResult.discount_percentage / 100) 
  : 0;
const taxAmount = (cartTotal - discountAmount) * 0.15; // 15% tax
const finalAmount = cartTotal - discountAmount + taxAmount;

// Can complete purchase?
const canCompletePurchase = 
  selectedStoreId &&
  cartItems.length > 0 &&
  validationResult?.valid &&
  paymentMethod &&
  !isProcessing;
```

**Requirements:**
- Sticky positioning (stays visible when scrolling)
- All amounts formatted with commas (Rs. 2,500)
- Discount shows percentage in green if valid
- Total is large and prominent
- Payment method is required
- Button disabled until all conditions met
- Shows validation warnings when disabled

---

### 4.7 Transaction History (Bottom of Right Panel)

```javascript
<div className="mt-6 bg-gray-50 rounded-xl p-6">
  <h4 className="font-semibold mb-4 flex items-center gap-2">
    <Clock className="w-5 h-5 text-gray-600" />
    Recent Transactions
  </h4>
  
  {transactionHistory.length === 0 ? (
    <p className="text-sm text-gray-500 text-center py-6">
      No transactions yet
    </p>
  ) : (
    <div className="space-y-3">
      {transactionHistory.slice(0, 5).map(txn => (
        <div
          key={txn.transaction_id}
          className="p-3 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex justify-between items-start mb-1">
            <p className="font-medium text-sm">{txn.member_name}</p>
            <p className="text-sm font-semibold text-[#C8A96E]">
              Rs. {formatNumber(txn.final_amount)}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {formatTime(txn.timestamp)} • {txn.store_name}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Saved Rs. {formatNumber(txn.discount_amount)}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
```

**Requirements:**
- Shows last 5 transactions only
- Most recent at top
- Displays: member name, final amount, timestamp, store, discount saved
- Adds new transaction to top when completed
- Slide-in animation for new transactions

---

## 5. COMPLETE WORKFLOW LOGIC

### Workflow Step-by-Step

```javascript
// State Management
const [stores, setStores] = useState([]);
const [selectedStoreId, setSelectedStoreId] = useState('');
const [memberId, setMemberId] = useState('');
const [validationResult, setValidationResult] = useState(null);
const [cartItems, setCartItems] = useState([]);
const [paymentMethod, setPaymentMethod] = useState('cash');
const [transactionHistory, setTransactionHistory] = useState([]);
const [isValidating, setIsValidating] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);

// 1. Load stores on mount
useEffect(() => {
  fetchStores();
}, []);

const fetchStores = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores`, {
      headers: {
        'Authorization': `Bearer ${CBS_API_KEY}`
      }
    });
    const data = await response.json();
    setStores(data.stores);
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    toast.error('Failed to load stores');
  }
};

// 2. Validate member
const handleValidateMember = async () => {
  if (!selectedStoreId) {
    toast.error('Please select a store first');
    return;
  }
  
  if (!memberId) {
    toast.error('Please enter a member ID');
    return;
  }
  
  // Validate format
  const memberIdRegex = /^MUM-\d{5}$/;
  if (!memberIdRegex.test(memberId)) {
    toast.error('Invalid member ID format. Use: MUM-XXXXX');
    return;
  }
  
  setIsValidating(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/pos/validate-membership`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CBS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        member_id: memberId,
        store_id: selectedStoreId,
        cart_total: cartTotal,
        timestamp: new Date().toISOString()
      })
    });
    
    const data = await response.json();
    setValidationResult(data);
    
    if (data.valid) {
      toast.success(`Membership validated for ${data.member_name}`);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Validation failed:', error);
    toast.error('Validation failed. Please try again.');
  } finally {
    setIsValidating(false);
  }
};

// 3. Add item to cart
const handleAddItem = () => {
  if (!newItem.name || newItem.quantity < 1 || newItem.unit_price <= 0) {
    toast.error('Please fill all fields correctly');
    return;
  }
  
  const item = {
    sku: `SKU-${String(cartItems.length + 1).padStart(3, '0')}`,
    name: newItem.name,
    quantity: newItem.quantity,
    unit_price: newItem.unit_price,
    subtotal: newItem.quantity * newItem.unit_price
  };
  
  setCartItems([...cartItems, item]);
  setNewItem({ name: '', quantity: 1, unit_price: 0 });
  setShowAddItem(false);
  toast.success('Item added to cart');
};

// 4. Complete purchase
const handleCompletePurchase = async () => {
  if (!canCompletePurchase) {
    return;
  }
  
  setIsProcessing(true);
  
  // Generate transaction ID
  const timestamp = new Date();
  const transactionId = `TXN-${format(timestamp, 'yyyyMMdd')}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
  
  const transactionData = {
    transaction_id: transactionId,
    member_id: memberId,
    store_id: selectedStoreId,
    store_name: stores.find(s => s.store_id === selectedStoreId)?.name,
    timestamp: timestamp.toISOString(),
    original_amount: cartTotal,
    discount_amount: discountAmount,
    final_amount: finalAmount,
    tax_amount: taxAmount,
    payment_method: paymentMethod,
    items: cartItems,
    cashier_id: 'DEMO-CASHIER',
    pos_terminal_id: 'DEMO-TERMINAL-001'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/pos/record-transaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CBS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Add to transaction history
      setTransactionHistory([
        {
          transaction_id: transactionId,
          member_name: validationResult.member_name,
          store_name: transactionData.store_name,
          final_amount: finalAmount,
          discount_amount: discountAmount,
          timestamp: timestamp.toISOString()
        },
        ...transactionHistory
      ]);
      
      // Show success
      toast.success('Transaction completed successfully!');
      
      // Reset state
      setTimeout(() => {
        handleReset();
      }, 2000);
    } else {
      toast.error('Transaction failed. Please try again.');
    }
  } catch (error) {
    console.error('Transaction failed:', error);
    toast.error('Transaction failed. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

// 5. Reset for new transaction
const handleReset = () => {
  setMemberId('');
  setValidationResult(null);
  setCartItems([]);
  setPaymentMethod('cash');
  // Keep selectedStoreId and transactionHistory
};
```

---

## 6. SUCCESS MODAL (After Transaction)

```javascript
{showSuccessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
      {/* Success Animation */}
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Transaction Successful!</h2>
      <p className="text-gray-600 mb-6">The purchase has been recorded.</p>
      
      <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
        <div className="flex justify-between mb-3">
          <span className="text-gray-600">Transaction ID</span>
          <span className="font-mono font-semibold">{lastTransactionId}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-gray-600">Member</span>
          <span className="font-semibold">{validationResult?.member_name}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-gray-600">Total Paid</span>
          <span className="font-semibold">Rs. {formatNumber(finalAmount)}</span>
        </div>
        <div className="flex justify-between border-t pt-3 mt-3">
          <span className="text-green-600 font-medium">Customer Saved</span>
          <span className="font-semibold text-green-600">Rs. {formatNumber(discountAmount)}</span>
        </div>
      </div>
      
      <button
        onClick={() => {
          setShowSuccessModal(false);
          handleReset();
        }}
        className="w-full px-6 py-3 bg-[#C8A96E] text-white rounded-xl font-semibold hover:bg-[#B09860]"
      >
        Start New Transaction
      </button>
    </div>
  </div>
)}
```

**Requirements:**
- Shows immediately after successful transaction
- Bounce animation on checkmark
- Displays transaction summary
- Customer saved amount in green (highlight the benefit)
- Auto-resets form after closing

---

## 7. DEMO-SPECIFIC FEATURES

### Auto-Fill Test Data Button (for demos)

```javascript
// Top-right corner, small button
<button
  onClick={handleAutoFill}
  className="fixed top-4 right-4 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs rounded-lg border border-yellow-300"
>
  🎯 Auto-Fill Test Data
</button>

const handleAutoFill = () => {
  // Auto-select first store
  setSelectedStoreId(stores[0]?.store_id);
  
  // Fill in a test member ID
  setMemberId('MUM-12345');
  
  // Add sample items
  setCartItems([
    {
      sku: 'SKU-001',
      name: 'Water Bottle',
      quantity: 2,
      unit_price: 300,
      subtotal: 600
    },
    {
      sku: 'SKU-002',
      name: 'Notebook Set',
      quantity: 1,
      unit_price: 1900,
      subtotal: 1900
    }
  ]);
  
  // Set payment method
  setPaymentMethod('cash');
  
  toast.success('Test data filled! Click "Validate" to continue.');
};
```

**Requirements:**
- Small, unobtrusive button
- One-click fills all fields with realistic test data
- Makes demos faster and smoother
- Can be hidden in production

---

## 8. TOAST NOTIFICATIONS

Use `react-hot-toast` or `sonner` for notifications:

```javascript
import toast, { Toaster } from 'react-hot-toast';

// In main component
<Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: '#fff',
      color: '#1C1C1E',
      border: '1px solid #E0E0E0',
      padding: '12px 16px',
      borderRadius: '12px',
    },
    success: {
      iconTheme: {
        primary: '#4A9B7F',
        secondary: '#fff',
      },
    },
    error: {
      iconTheme: {
        primary: '#C0544A',
        secondary: '#fff',
      },
    },
  }}
/>

// Usage
toast.success('Member validated successfully');
toast.error('Invalid member ID');
toast.loading('Processing transaction...');
```

---

## 9. RESPONSIVE DESIGN

### Desktop (1920×1080)
- Two-column layout (60/40 split)
- All features visible

### Laptop (1366×768)
- Two-column layout (55/45 split)
- Slightly smaller padding

### Tablet (1024×768 minimum)
- Single column (vertical stack)
- Left panel on top, right panel below
- Sticky summary panel

**DO NOT** support mobile (this is a POS terminal, desktop-only).

---

## 10. DEPLOYMENT CHECKLIST

### Before Demo:

```
□ Environment variables set correctly
□ API endpoints tested and working
□ CBS_API_KEY is valid
□ Test member IDs exist in database (MUM-12345, MUM-00001, etc.)
□ Stores loaded from API successfully
□ Auto-fill test data button works
□ All validation states tested (valid, expired, suspended, not found)
□ Transaction recording works
□ Admin dashboard updates in real-time when transaction completes
□ Toast notifications appear correctly
□ Success modal displays after transaction
□ Transaction history updates
□ All calculations are correct (discount, tax, total)
□ UI is polished and professional
□ No console errors
□ Deployed to accessible URL (e.g., Vercel)
□ URL shared with demo team
```

---

## 11. DEMO SCRIPT FOR THIS TOOL

### What to Say During Demo:

**Step 1: Show the Interface**

> "This is our POS terminal interface. It's what the CBS system will integrate with. For this demo, we've built a web version to show you exactly how it works."

**Step 2: Select Store**

> "First, the cashier selects their store location. This tells the system which store is processing the transaction."

[Select "Dolmen Mall Clifton"]

**Step 3: Enter Member ID**

> "When a customer shows their QR code, the cashier scans it. The scanner reads the member ID - in this case, MUM-12345."

[Type or auto-fill: MUM-12345]

**Step 4: Validate**

> "The cashier clicks Validate - or in a real setup, this happens automatically when the QR is scanned."

[Click Validate button]

**Wait 1-2 seconds for API response**

> "Within half a second, the system confirms: This is Ahmed Khan, active member, entitled to 10% discount, expires in March 2027."

**Step 5: Add Items**

> "The cashier scans products normally. Let's add a water bottle and a notebook."

[Click Add Item, fill in details, repeat]

**Step 6: Show Calculations**

> "Watch the order summary on the right. Subtotal is Rs. 2,500. Member discount: Rs. 250. Tax: Rs. 337.50. Final total: Rs. 2,587.50."

**Step 7: Complete Purchase**

> "Cashier selects payment method and clicks Complete Purchase."

[Select Cash, click button]

**Wait for success modal**

**Step 8: Show Admin Dashboard**

> "Now, switch to the admin dashboard..."

[Switch screens]

> "Look - the transaction just appeared in the Live feed! No delay. Instant synchronization."

**Point to:**
- New row in Recent Transactions table
- Total Revenue increased
- Member Savings increased

> "This is the power of real-time integration. Management sees every purchase as it happens."

---

## 12. TESTING SCENARIOS

### Test Case 1: Valid Member

```
Member ID: MUM-12345
Expected: Green validation, 10% discount applied
```

### Test Case 2: Expired Member

```
Member ID: MUM-99999 (set expiry_date in past)
Expected: Red validation, "Membership expired" message
```

### Test Case 3: Suspended Member

```
Member ID: MUM-88888 (set status = 'suspended')
Expected: Red validation, "Membership suspended" message
```

### Test Case 4: Invalid Member

```
Member ID: MUM-00000 (doesn't exist in DB)
Expected: Red validation, "Member not found" message
```

### Test Case 5: No Store Selected

```
Try to validate without selecting store
Expected: Error toast "Please select a store first"
```

### Test Case 6: Empty Cart

```
Try to complete purchase with empty cart
Expected: Button disabled, warning "Add items to cart"
```

---

## 13. FINAL DELIVERABLES

When you complete this, provide:

1. ✅ **Deployed URL** (e.g., https://mumuso-pos-demo.vercel.app)
2. ✅ **Source code** (GitHub repo or ZIP)
3. ✅ **Environment variables** needed (.env.example)
4. ✅ **Quick start guide** (README.md)
5. ✅ **Test credentials** (test member IDs, store IDs)

---

## README.md Template

```markdown
# Mumuso POS Terminal - Demo Interface

Mock POS interface for demonstrating membership validation and transaction recording.

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Update environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.mumuso.com
   NEXT_PUBLIC_CBS_API_KEY=your_api_key_here
   ```
5. Run: `npm run dev`
6. Open: http://localhost:3000

## Features

- Store selection
- Member ID validation (via QR scan simulation)
- Shopping cart management
- Order summary with discount calculation
- Transaction recording
- Real-time sync with admin dashboard
- Transaction history

## Test Data

**Valid Member IDs:**
- MUM-12345 (Active, expires 2027)
- MUM-00001 (Active, expires 2026)

**Invalid Member IDs:**
- MUM-99999 (Expired)
- MUM-88888 (Suspended)
- MUM-00000 (Not found)

## Demo Quick-Fill

Click the "🎯 Auto-Fill Test Data" button in top-right to instantly populate:
- Store: Dolmen Mall Clifton
- Member ID: MUM-12345
- Cart: 2 items (Water Bottle, Notebook)
- Payment: Cash

Then just click "Validate" → "Complete Purchase" to run the full flow.

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```

## Support

For issues, contact: [your email]
```

---

## IMPORTANT REMINDERS FOR AI

1. **This is a DEMO tool** - prioritize clarity and visual appeal over complex features
2. **Must sync with admin dashboard** - use actual backend APIs, not mock data
3. **Auto-fill button is critical** - makes demos smooth and fast
4. **Success feedback is important** - toast notifications, success modal, visual confirmations
5. **Error handling matters** - show clear, helpful error messages
6. **UI must be polished** - this represents the entire system to the client
7. **Keep it simple** - resist the urge to add features beyond the spec

---

**Build this exactly as specified. This is the client's first impression of the POS integration. Make it flawless. Good luck! 🚀**
