# Mumuso Admin Dashboard - Setup Guide

## Quick Start

Follow these steps to get the admin dashboard running:

### 1. Install Dependencies

```bash
cd mumuso-admin
npm install
```

### 2. Configure Environment

The `.env.local` file is already created with default settings:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**Important**: Make sure the Mumuso backend is running on `http://localhost:3000` before starting the admin dashboard.

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

### 4. Login

Use your admin credentials to log in. The backend must have an admin user created.

If you need to create an admin user, refer to the backend's `ADMIN_SETUP.md` file.

---

## Backend Integration Checklist

Before using the admin dashboard, ensure:

- ✅ Backend is running on `http://localhost:3000`
- ✅ Database is migrated and seeded
- ✅ Admin user is created with proper role
- ✅ CORS is configured to allow `http://localhost:3000` (frontend)
- ✅ All admin endpoints are accessible

---

## Testing the Dashboard

### Test Login
1. Navigate to http://localhost:3000
2. You'll be redirected to `/login`
3. Enter admin credentials
4. You should be redirected to `/dashboard`

### Test Dashboard Features
- **Dashboard**: View metrics, charts, recent transactions
- **Members**: Search, filter, and view member details
- **Transactions**: Browse transaction history
- **Stores**: View and manage store locations

---

## Troubleshooting

### "Cannot connect to backend"
- Verify backend is running: `curl http://localhost:3000/health`
- Check CORS settings in backend
- Verify API_URL in `.env.local`

### "Invalid credentials"
- Ensure admin user exists in database
- Check user role is set to 'admin'
- Verify password is correct

### "Token expired"
- The dashboard automatically refreshes tokens
- If issues persist, clear browser storage and login again

### TypeScript/Lint Errors
All TypeScript and lint errors will resolve after running `npm install`. The errors you see are expected before dependencies are installed.

---

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Update `.env.local` (or use `.env.production`):

```
NEXT_PUBLIC_API_URL=https://api.mumuso.com/api/v1
```

### Deployment Platforms

The dashboard can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (see Dockerfile below)

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t mumuso-admin .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.mumuso.com/api/v1 mumuso-admin
```

---

## Development Tips

### Hot Reload
The development server supports hot reload. Changes to files will automatically refresh the browser.

### API Response Caching
React Query caches API responses for 60 seconds by default. To force refresh, use the browser's dev tools to clear cache.

### Debugging
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for API calls
- React Query DevTools are available in development mode

---

## Security Notes

### Production Checklist
- [ ] Use HTTPS for API URL
- [ ] Enable secure cookies
- [ ] Set proper CORS origins
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting on backend
- [ ] Implement proper session timeout
- [ ] Use strong admin passwords
- [ ] Enable audit logging

### Token Storage
Tokens are stored in localStorage using Zustand persist. For enhanced security in production:
- Consider using httpOnly cookies
- Implement token rotation
- Add device fingerprinting
- Enable 2FA for admin accounts

---

## Support

For issues or questions:
1. Check backend logs
2. Check browser console
3. Verify API endpoints are responding
4. Contact development team

---

## Next Steps

After setup:
1. Customize branding (colors, fonts, logo)
2. Add additional admin features as needed
3. Configure monitoring and analytics
4. Set up automated backups
5. Implement audit logging
6. Add export functionality for reports
