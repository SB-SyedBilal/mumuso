# Mumuso Mock POS Terminal

A web-based mock POS terminal interface for client demos. Validates memberships and records transactions in real-time with the Mumuso backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Mumuso backend running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The POS terminal will be available at **http://localhost:3001**

## 🔧 Configuration

Create or edit `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_POS_API_KEY=demo-pos-api-key-12345
```

## 📋 Features

### ✅ Implemented
- Store selection dropdown
- Member ID validation (manual entry)
- Shopping cart with add/remove items
- Real-time discount calculation
- Payment method selection (Cash/Card/Mobile)
- Transaction recording
- Validation status display
- Responsive design

### 🎯 Usage Flow

1. **Select Store** - Choose from dropdown
2. **Add Items** - Click "Add Item" and fill in SKU, name, quantity, price
3. **Enter Member ID** - Type member ID (e.g., MUM-12345)
4. **Validate** - Click "Validate" button
5. **Review Discount** - See discount applied in order summary
6. **Select Payment** - Choose cash/card/mobile
7. **Complete Purchase** - Click "Complete Purchase"

## 🎨 Design

### Colors
- **Dark Background**: `#1C1C1E`
- **Gold Accent**: `#C8A96E`
- **Success Green**: `#34C759`
- **Error Red**: `#FF3B30`

### Layout
- **Left Panel (66%)**: Member validation, cart items, validation status
- **Right Panel (33%)**: Order summary, payment method, complete button

## 🔌 API Endpoints

The POS terminal connects to these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/pos/stores` | GET | List all stores |
| `/api/v1/pos/validate-membership` | POST | Validate member |
| `/api/v1/pos/record-transaction` | POST | Record transaction |

## 🧪 Testing

### Test Member IDs
Use any member ID from your backend database. Example:
- `MUM-12345` - Active member
- `MUM-99999` - Not found (test error case)

### Test Items
```
SKU: SKU-001, Name: Water Bottle, Price: 300
SKU: SKU-002, Name: Notebook Set, Price: 1900
SKU: SKU-003, Name: Pen Pack, Price: 450
```

## 📁 Project Structure

```
mumuso-pos/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main POS interface
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── Header.tsx         # POS header
│   │   ├── MemberValidation.tsx  # Member ID input
│   │   ├── CartItems.tsx      # Shopping cart
│   │   ├── OrderSummary.tsx   # Order totals
│   │   └── ValidationStatus.tsx  # Validation result
│   ├── services/
│   │   └── api.ts             # API client
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.local                 # Environment variables
├── package.json
└── README.md
```

## 🚨 Troubleshooting

### Backend Connection Failed
- Ensure backend is running: `cd mumuso-backend && npm run dev`
- Check API URL in `.env.local`
- Verify API key matches backend configuration

### Member Validation Fails
- Check member ID exists in database
- Verify store is active and has discount configured
- Check backend logs for errors

### Transaction Not Recording
- Ensure membership is validated first
- Check cart has items
- Verify backend webhook processing

## 📚 Documentation

- **Backend API**: See `mumuso-backend/src/modules/pos/`
- **Complete Demo Flow**: See `COMPLETE_DEMO_FLOW.md`
- **POS Specification**: See `Mumuso_Mock_POS_Specification.md`

## 🎬 Demo Script

1. Open POS terminal at http://localhost:3001
2. Select "Dolmen Mall Clifton" store
3. Add 2-3 items to cart
4. Enter member ID: `MUM-12345`
5. Click "Validate" - shows 10% discount
6. Select payment method
7. Click "Complete Purchase"
8. Show success message with savings

## 🔐 Security Notes

- API key is hardcoded for demo purposes
- Not suitable for production use
- Use only in controlled demo environments

## 📞 Support

For issues or questions, check:
- Backend logs: `mumuso-backend/logs/`
- Browser console for frontend errors
- Network tab for API call details

---

**Built with Next.js 14, TypeScript, and TailwindCSS**
