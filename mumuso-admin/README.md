# Mumuso Admin Dashboard

A modern, responsive admin dashboard for the Mumuso Loyalty App built with Next.js 14, TypeScript, and TailwindCSS.

## Features

- **Authentication**: Secure login with JWT tokens and automatic token refresh
- **Dashboard**: Real-time metrics, charts, and analytics
- **Member Management**: View, search, filter, and manage loyalty program members
- **Transaction Tracking**: Monitor all member transactions with detailed filtering
- **Store Management**: Manage store locations and view performance metrics
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Quiet Luxury UI**: Premium design following Mumuso brand guidelines

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom Mumuso theme
- **State Management**: Zustand (auth), React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm or yarn
- Running Mumuso backend API

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
mumuso-admin/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── members/        # Member management
│   │   │   ├── transactions/   # Transaction history
│   │   │   └── stores/         # Store management
│   │   ├── login/              # Login page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home redirect
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utilities and configurations
│   │   ├── api/                # API client and endpoints
│   │   └── utils.ts            # Helper functions
│   └── store/                  # Zustand stores
│       └── authStore.ts        # Authentication state
├── public/                     # Static assets
└── package.json
```

## API Integration

The dashboard integrates with the following backend endpoints:

- `POST /api/v1/auth/login` - Admin authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/admin/dashboard` - Dashboard metrics
- `GET /api/v1/admin/members` - List members
- `GET /api/v1/admin/members/:id` - Member details
- `PUT /api/v1/admin/members/:id/status` - Update member status
- `GET /api/v1/admin/transactions` - List transactions
- `GET /api/v1/admin/stores` - List stores
- `POST /api/v1/admin/stores` - Create store
- `PUT /api/v1/admin/stores/:id` - Update store

## Design System

### Colors
- Canvas: `#F5F3F0` - Warm off-white background
- Surface: `#FFFFFF` - Card backgrounds
- Accent Gold: `#C8A96E` - Primary accent
- Success: `#4A9B7F` - Active states
- Error: `#C0544A` - Errors and alerts
- Warning: `#C08040` - Warnings

### Typography
- Display: Cormorant Garamond (large numbers, headings)
- UI: DM Sans (interface text)
- Data: JetBrains Mono (IDs, codes)

## Security

- JWT-based authentication with automatic token refresh
- Secure token storage using Zustand persist
- Axios interceptors for automatic auth header injection
- Protected routes with authentication checks
- HTTPS recommended for production

## Performance

- React Query for efficient data caching and refetching
- Automatic background refetching for real-time updates
- Optimistic UI updates for better UX
- Code splitting with Next.js App Router
- Image optimization with Next.js Image component

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Mumuso Pakistan

## Support

For issues or questions, contact the development team.
