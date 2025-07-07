# Promo Code Distribution App

A Next.js application for distributing promo codes to users with unique links. Each visitor gets one code automatically tracked by device/IP fingerprinting.

## Features

- **Code Input**: Users can input promo codes via text box (comma, space, or newline separated)
- **Link Generation**: Generates public claim links and private management links
- **Visitor Tracking**: Each visitor gets one code based on IP + User-Agent fingerprinting
- **Management Dashboard**: View statistics, track usage, and export data
- **Advertisement Space**: Dedicated space for ads on the promo code viewing page

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth (optional)

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project
2. Run the SQL commands in `supabase-schema.sql` to create the required tables
3. Copy your Supabase URL and keys

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Deploy to Vercel

```bash
npm run build
```

Then deploy to Vercel and set your environment variables.

## Usage

1. **Create Campaign**: Enter promo codes on the homepage
2. **Share Link**: Use the generated public claim link
3. **Manage Campaign**: Use the private management link to view stats
4. **Track Usage**: Monitor which codes are claimed and by whom

## API Endpoints

- `POST /api/campaigns` - Create new campaign
- `POST /api/claim/[id]` - Claim a promo code
- `GET /api/manage/[slug]` - Get campaign management data

## Database Schema

### campaigns
- `id` - Campaign identifier
- `admin_key` - Private key for management access
- `created_by` - User ID (optional)
- `created_at` - Creation timestamp
- `expires_at` - Expiration timestamp (optional)

### promo_codes
- `id` - Unique code identifier
- `campaign_id` - Associated campaign
- `value` - The actual promo code
- `claimed_by` - Hashed visitor identifier
- `claimed_at` - Claim timestamp

## Security Features

- Row Level Security (RLS) policies
- Hashed visitor identities
- Unguessable campaign IDs and admin keys
- Rate limiting ready (implement as needed)

## Advertisement Integration

The claim page includes a dedicated advertisement space that can be customized for:
- Promoting complementary products
- Sponsored content
- Partner offers
- Premium placement opportunities

## License

MIT
