# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for the Mumuso Loyalty App.

---

## Features Implemented

The admin dashboard provides complete management capabilities:

### ✅ Dashboard Analytics (GET /api/v1/admin/dashboard)
- **Overview Statistics**: Total members, active/expired/suspended counts
- **Transaction Metrics**: Total and period-specific transaction counts
- **Revenue Analytics**: Total savings, period revenue, growth rates
- **Store Performance**: Active store count
- **Recent Activity**: Last 10 transactions
- **Top Stores**: Top 5 performing stores by transaction count
- **Membership Trends**: 12-month membership growth chart

**Query Parameters:**
- `period`: `today` | `week` | `month` | `year` | `all` (default: `month`)

---

### ✅ Member Management (GET /api/v1/admin/members)
- **List All Members**: Paginated list with comprehensive details
- **Advanced Filtering**: By status, search by name/email/member_id
- **Sorting**: By created_at, expiry_date, total_saved, name
- **Statistics**: Transaction count and total savings per member

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: `active` | `expired` | `suspended` | `all`
- `search`: Search term for name, email, or member_id
- `sort_by`: `created_at` | `expiry_date` | `total_saved` | `name`
- `sort_order`: `asc` | `desc` (default: `desc`)

---

### ✅ Member Details (GET /api/v1/admin/members/:id)
- **Complete Profile**: User info, membership status, plan details
- **Transaction History**: Last 50 transactions
- **Payment History**: All payments made
- **Device Information**: Registered devices
- **Statistics**: Total transactions, savings, favorite store

---

### ✅ Update Member Status (PUT /api/v1/admin/members/:id/status)
- **Suspend/Activate**: Change member status
- **Audit Trail**: All status changes logged

**Request Body:**
```json
{
  "status": "active" | "suspended",
  "reason": "Optional reason for status change"
}
```

---

### ✅ Transaction Management (GET /api/v1/admin/transactions)
- **Advanced Filtering**: By store, member, date range, amount range
- **Discount Type Filter**: Full or partial discounts
- **Summary Statistics**: Total transactions, discounts, revenue
- **Pagination**: Efficient handling of large datasets

**Query Parameters:**
- `page`, `limit`: Pagination
- `store_id`: Filter by store
- `member_id`: Filter by member
- `from_date`, `to_date`: Date range (ISO format)
- `discount_type`: `full` | `partial` | `all`
- `min_amount`, `max_amount`: Amount range
- `sort_by`: `created_at` | `discount_amount` | `final_amount`
- `sort_order`: `asc` | `desc`

---

### ✅ Store Management

#### List Stores (GET /api/v1/admin/stores)
- **All Stores**: Complete list with transaction statistics
- **Performance Metrics**: Transaction count and total discounts given

#### Create Store (POST /api/v1/admin/stores)
**Request Body:**
```json
{
  "name": "Mumuso Karachi DHA",
  "address": "Plot 123, DHA Phase 5",
  "city": "Karachi",
  "country": "Pakistan",
  "phone": "+923001234567",
  "latitude": 24.8607,
  "longitude": 67.0011,
  "discount_pct": 15,
  "operating_hours": {
    "monday": { "open": "10:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "10:00", "close": "22:00", "closed": false }
  },
  "is_active": true
}
```

#### Update Store (PUT /api/v1/admin/stores/:id)
- **Partial Updates**: Update any store field
- **Audit Logging**: All changes tracked

---

### ✅ Export Reports (GET /api/v1/admin/reports/export)
- **Multiple Report Types**: Members, transactions, revenue, stores
- **Format Options**: CSV or JSON
- **Date Filtering**: Custom date ranges
- **Downloadable**: Proper headers for file download

**Query Parameters:**
- `report_type`: `members` | `transactions` | `revenue` | `stores`
- `format`: `csv` | `json` (default: `csv`)
- `from_date`, `to_date`: Optional date range
- `store_id`: Optional store filter

---

## Setup Instructions

### Step 1: Create Admin User

Run the admin user creation script:

```bash
# Using default credentials
npx ts-node scripts/create-admin.ts

# Or with custom credentials
ADMIN_EMAIL=admin@mumuso.com ADMIN_PASSWORD=SecurePass123 ADMIN_NAME="John Doe" npx ts-node scripts/create-admin.ts
```

**Default Credentials:**
- Email: `admin@mumuso.com`
- Password: `Admin@123456`

⚠️ **IMPORTANT**: Change the password after first login!

---

### Step 2: Login to Get JWT Token

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@mumuso.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "full_name": "Mumuso Admin",
      "email": "admin@mumuso.com",
      "role": "admin"
    }
  }
}
```

---

### Step 3: Access Admin Endpoints

Use the `access_token` in the Authorization header:

```bash
GET /api/v1/admin/dashboard?period=month
Authorization: Bearer <access_token>
```

---

## Security Features

### ✅ Role-Based Access Control
- All admin endpoints require `admin` role
- JWT authentication enforced
- Unauthorized access returns 403 Forbidden

### ✅ Audit Logging
- All admin actions logged to audit_logs table
- Tracks: actor, action, target, old/new values, timestamp
- Actions logged:
  - `STORE_CREATED`
  - `STORE_UPDATED`
  - `MEMBERSHIP_STATUS_CHANGED`

### ✅ Input Validation
- Zod schema validation on all endpoints
- Type-safe request/response handling
- SQL injection protection via Prisma

### ✅ Rate Limiting
- Default: 100 requests per minute per user
- Prevents abuse and DoS attacks

---

## API Examples

### Get Dashboard Stats

```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard?period=month" \
  -H "Authorization: Bearer <token>"
```

### List Members with Filters

```bash
curl -X GET "http://localhost:3000/api/v1/admin/members?status=active&page=1&limit=20&sort_by=total_saved&sort_order=desc" \
  -H "Authorization: Bearer <token>"
```

### Search Members

```bash
curl -X GET "http://localhost:3000/api/v1/admin/members?search=john" \
  -H "Authorization: Bearer <token>"
```

### Get Member Details

```bash
curl -X GET "http://localhost:3000/api/v1/admin/members/<member-uuid>" \
  -H "Authorization: Bearer <token>"
```

### Suspend Member

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/members/<member-uuid>/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended",
    "reason": "Fraudulent activity detected"
  }'
```

### List Transactions with Filters

```bash
curl -X GET "http://localhost:3000/api/v1/admin/transactions?from_date=2026-01-01&to_date=2026-03-31&store_id=<store-uuid>" \
  -H "Authorization: Bearer <token>"
```

### Create Store

```bash
curl -X POST "http://localhost:3000/api/v1/admin/stores" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumuso Lahore Gulberg",
    "address": "Main Boulevard, Gulberg III",
    "city": "Lahore",
    "discount_pct": 15,
    "is_active": true
  }'
```

### Update Store

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/stores/<store-uuid>" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_pct": 20,
    "is_active": true
  }'
```

### Export Members Report (CSV)

```bash
curl -X GET "http://localhost:3000/api/v1/admin/reports/export?report_type=members&format=csv" \
  -H "Authorization: Bearer <token>" \
  --output members_report.csv
```

### Export Transactions Report (JSON)

```bash
curl -X GET "http://localhost:3000/api/v1/admin/reports/export?report_type=transactions&format=json&from_date=2026-01-01&to_date=2026-03-31" \
  -H "Authorization: Bearer <token>" \
  --output transactions_report.json
```

---

## Database Schema

The admin module uses existing tables:
- `users` - Admin user accounts (role = 'admin')
- `memberships` - Member data
- `transactions` - Transaction records
- `stores` - Store information
- `payments` - Payment history
- `audit_logs` - Audit trail
- `device_tokens` - User devices

No new tables required!

---

## Performance Considerations

### ✅ Optimizations Implemented

1. **Parallel Queries**: Dashboard uses `Promise.all()` for concurrent queries
2. **Pagination**: All list endpoints support pagination
3. **Indexed Queries**: Leverages Prisma's optimized queries
4. **Decimal.js**: Monetary calculations use high-precision decimals
5. **Selective Fields**: Only fetches required fields from database
6. **Aggregations**: Uses Prisma `groupBy` for efficient statistics

### 📊 Expected Performance

- Dashboard stats: ~200-500ms (depends on data volume)
- List members: ~100-200ms (paginated)
- Member details: ~150-300ms (includes related data)
- Transactions list: ~100-200ms (paginated)
- Export reports: ~500ms-2s (depends on data volume)

---

## Troubleshooting

### Issue: "Unauthorized" or 403 Forbidden

**Solution**: Ensure you're using an admin account
```bash
# Check user role in login response
{
  "user": {
    "role": "admin"  // Must be "admin"
  }
}
```

### Issue: "Admin user already exists"

**Solution**: The admin user is already created. Use existing credentials or update the role:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@mumuso.com';
```

### Issue: TypeScript errors

**Solution**: The dependencies exist in the project. Run:
```bash
npm install
```

---

## Next Steps

1. ✅ Create admin user using the script
2. ✅ Login and get JWT token
3. ✅ Test dashboard endpoint
4. ✅ Explore member management
5. ✅ Test store CRUD operations
6. ✅ Export reports

---

## Support

For issues or questions:
- Check the audit logs for admin actions
- Review the API_AUDIT_REPORT.md for endpoint details
- Ensure proper JWT token is being used
- Verify admin role in database

---

**Last Updated**: March 5, 2026  
**Version**: 1.0.0  
**Status**: ✅ Fully Implemented
