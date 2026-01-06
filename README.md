# 🌱 Community Waste Management System

A modern, full-stack web application for community-driven waste reporting and management, built with Next.js 14, TypeScript, and Supabase.

## 📋 Overview

The Community Waste Management System empowers citizens to report waste hotspots in their community while providing garbage collectors with efficient tools for waste collection and route optimization. The platform features real-time updates, leaderboards, government recognition programs, and interactive mapping.

## ✨ Key Features

### 👥 For Citizens (Normal Users)
- **Multi-Image Waste Reports**: Upload up to 5 photos per report with automatic geolocation
- **Real-Time Status Updates**: Track your reports from submission to resolution
- **Contribution Tracking**: View personal statistics (resolved/open reports)
- **Leaderboard System**: Compete for top contributor rankings with gold/silver/bronze tiers
- **Government Awards Program**: Qualify for prizes and recognition (Platinum: ₹20K, Gold: ₹10K, Silver: ₹5K, Bronze: ₹3K)
- **Filter & Search**: Browse all reports by status (open/resolved/rejected)

### 🚛 For Garbage Collectors
- **Smart Route Navigation**: Interactive Leaflet maps with OpenRouteService integration
- **Distance & ETA Calculations**: Automatic distance and time estimates to each location
- **Nearest First Filter**: Sort reports by proximity for optimal collection routes
- **Image Preview**: View report photos in grid layout
- **One-Click Collection**: Mark reports as collected with automatic status updates
- **Real-Time Sync**: Instant updates when reports are added or resolved

### 👨‍💼 For Administrators
- **Centralized Dashboard**: View and manage all community reports
- **Status Management**: Update report statuses (open/resolved/rejected)
- **User Analytics**: Monitor community engagement and leaderboards
- **Event Management**: Promote government initiatives and recognition programs

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Maps**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Image Handling**: Next.js Image Optimization

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (image uploads)
- **Real-Time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies

### APIs & Services
- **Routing**: OpenRouteService API
- **Geolocation**: Browser Geolocation API
- **Reverse Geocoding**: OpenStreetMap Nominatim

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account
- OpenRouteService API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd community-waste-management
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ORS_KEY=your_openrouteservice_api_key
```

4. **Initialize the database**

Run the SQL script in your Supabase SQL editor:

```bash
# File: scripts/init_database.sql
```

This creates:
- `profiles` table (user metadata)
- `waste_reports` table (report data)
- Row Level Security policies
- Storage buckets for images

5. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
community-waste-management/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── error/
│   ├── collector/          # Garbage collector interface
│   │   ├── page.tsx
│   │   ├── ReportsList.tsx
│   │   └── NavigationView.tsx
│   ├── report/             # New report form
│   ├── reports/            # Main reports page
│   └── types/              # TypeScript types
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── admin-reports-list.tsx
│   ├── report-form.tsx
│   ├── reports-list.tsx
│   └── rank-list.tsx
├── lib/
│   ├── supabase/           # Supabase client configs
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── scripts/
    └── init_database.sql   # Database schema
```

## 🗄️ Database Schema

### `profiles`
- `id` (UUID, Primary Key)
- `email` (TEXT)
- `created_at` (TIMESTAMP)

### `waste_reports`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `description` (TEXT)
- `location` (TEXT)
- `latitude` (NUMERIC)
- `longitude` (NUMERIC)
- `image_url` (TEXT) - Stores JSON array of image URLs
- `status` (TEXT) - 'open' | 'resolved' | 'rejected'
- `created_at` (TIMESTAMP)

## 🔐 Security Features

- **Row Level Security (RLS)**: Enforced on all tables
- **Authentication Required**: All actions require user login
- **Secure Image Storage**: Supabase Storage with access policies
- **Input Validation**: Zod schemas for form validation
- **SQL Injection Protection**: Parameterized queries via Supabase client

## 🎯 User Roles

1. **Normal User**: Report waste, view personal and community reports
2. **Garbage Collector**: Access route navigation, mark reports collected
3. **Admin**: Full access to all reports and management features

User roles are managed via `localStorage` for demo purposes. In production, implement role-based access control in the database.

## 🏆 Awards Program (Events Tab)

**Green Champions Awards 2026** - Government Initiative

- **Platinum Tier** (150+ contributions): ₹20,000 + Trophy + National Recognition
- **Gold Tier** (100-149 contributions): ₹10,000 + Trophy + Regional Recognition
- **Silver Tier** (50-99 contributions): ₹5,000 + Trophy + District Recognition
- **Bronze Tier** (25-49 contributions): ₹3,000 + Trophy + Local Recognition

**Timeline**:
- Jan 1 - Mar 31, 2026: Registration Period
- Apr 1 - Apr 15, 2026: Evaluation
- Apr 22, 2026: Winner Announcement (Earth Day)
- May 5, 2026: Award Ceremony

## 🗺️ Map Features

- **Interactive Navigation**: Leaflet-based maps with route visualization
- **Distance Calculations**: Haversine formula for accurate distances
- **Route Optimization**: OpenRouteService API for driving directions
- **Real-Time Location**: Live user position tracking
- **Polyline Decoding**: Smooth route visualization

## 📸 Image Management

- **Multi-Upload**: Up to 5 images per report
- **Preview Grid**: Thumbnail previews before submission
- **Carousel View**: Navigate through images with arrows and dots
- **JSON Storage**: Array of URLs stored in single database column
- **Supabase Storage**: Secure, scalable image hosting

## 🔄 Real-Time Features

- **Live Updates**: Postgres changes subscription via Supabase
- **Automatic Refresh**: Reports update without page reload
- **Status Sync**: Instant propagation of status changes
- **Leaderboard Updates**: Live contribution tracking

## 🎨 UI/UX Highlights

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Gradient Accents**: Gold/Silver/Bronze tier visualizations
- **Loading States**: Skeleton screens during data fetching
- **Empty States**: Contextual messages when no data available
- **Badge System**: Color-coded status indicators
- **Smooth Transitions**: Animated tab switching and hover effects

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_ORS_KEY` | OpenRouteService API key |

## 🚧 Future Enhancements

- [ ] Push notifications for status updates
- [ ] Offline mode with service workers
- [ ] Bulk collection operations for collectors
- [ ] Analytics dashboard with charts
- [ ] Multi-language support
- [ ] Mobile apps (React Native)
- [ ] Email notifications
- [ ] Advanced filtering (date range, area)
- [ ] Export reports to CSV/PDF

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Supabase**: Backend infrastructure
- **Vercel**: Next.js framework and hosting
- **OpenRouteService**: Routing API
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Beautiful component library
- **Lucide**: Icon set
- **Leaflet**: Interactive mapping library

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for cleaner, greener communities**
