# EmailBlast - Email Marketing Platform

A modern, full-featured email marketing platform built with React, TypeScript, Supabase, and Brevo.

## Features

- 📧 **Campaign Management** - Create, edit, and send email campaigns with a rich text editor
- 👥 **Subscriber Management** - Import and manage subscribers with CSV support
- 📊 **Analytics Dashboard** - Track opens, clicks, and campaign performance
- 🎨 **Email Templates** - Pre-designed templates for quick campaign creation
- 🤖 **AI Content Generation** - AI-powered email content suggestions
- 🔍 **Lead Finder** - Discover and import new leads
- 🔐 **Authentication** - Secure user authentication with Supabase
- 💳 **Subscription Plans** - Stripe/Creem integration for payments
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Mode** - Built-in dark mode support

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Email Service**: Brevo (SendGrid alternative supported)
- **Payments**: Stripe & Creem
- **Editor**: TipTap (rich text editor)
- **Analytics**: Custom tracking with Supabase

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account ([Sign up](https://supabase.com))
- A Brevo account ([Sign up](https://app.brevo.com/account/register))
- A Stripe account (optional, for payments) ([Sign up](https://stripe.com))

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd EmailBlast
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys and configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_BREVO_API_KEY=your-brevo-api-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
VITE_APP_URL=http://localhost:5173
```

### 3. Set Up Supabase

1. Create a new project in [Supabase](https://app.supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Run the database migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Alternatively, you can run the SQL migrations manually in your Supabase SQL editor:
- Navigate to `supabase/migrations/`
- Run each migration file in order

### 4. Configure Brevo

1. Sign up for [Brevo](https://app.brevo.com)
2. Go to Settings > API Keys
3. Create a new API key
4. Add it to your `.env` file as `VITE_BREVO_API_KEY`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
EmailBlast/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── campaign/       # Campaign management
│   │   ├── subscriber/     # Subscriber management
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── ui/             # UI components (shadcn/ui)
│   │   └── ...
│   ├── lib/                # Utility functions
│   │   ├── supabase.ts    # Supabase client
│   │   ├── brevo.ts       # Email service
│   │   ├── api.ts         # API helpers
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── legal/         # Terms, Privacy pages
│   │   └── ...
│   ├── types/              # TypeScript types
│   └── App.tsx            # Main app component
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions
├── public/                 # Static assets
└── ...
```

## Key Features Setup

### Email Campaigns

1. **Create Campaign**: Navigate to Campaigns > New Campaign
2. **Design Email**: Use the rich text editor or AI assistant
3. **Select Subscribers**: Choose a subscriber list
4. **Preview & Test**: Send test emails before launching
5. **Send or Schedule**: Launch immediately or schedule for later

### Subscriber Management

1. **Import CSV**: Upload a CSV file with subscriber data
2. **Manual Entry**: Add subscribers one at a time
3. **Lead Finder**: Use the lead finder tool to discover new contacts
4. **Segmentation**: Organize subscribers with tags and lists

### Analytics

- View campaign performance in real-time
- Track opens, clicks, bounces, and unsubscribes
- Export analytics data for reporting
- Monitor subscriber engagement scores

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_BREVO_API_KEY` | Yes | Brevo API key for email sending |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key |
| `VITE_APP_URL` | Yes | Your app URL for email tracking |
| `VITE_GEMINI_API_KEY` | Optional | Google Gemini for AI features |
| `VITE_FIRECRAWL_API_KEY` | Optional | Firecrawl for lead finding |

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Deploy!

### Other Platforms

EmailBlast is a standard Vite React app and can be deployed to any static hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Cloudflare Pages

## Database Migrations

To create a new migration:

```bash
supabase migration new migration_name
```

To apply migrations:

```bash
supabase db push
```

## Troubleshooting

### Email Sending Issues

- Verify your Brevo API key is correct
- Check your sender email is verified in Brevo
- Ensure subscribers have valid email addresses
- Check Brevo dashboard for any sending limits

### Database Connection Issues

- Verify Supabase URL and key are correct
- Check your Supabase project is active
- Ensure RLS policies are properly configured
- Check browser console for specific errors

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check for TypeScript errors: `npm run build`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For questions or issues:
- Email: support@emailblast.com
- Documentation: [Link to docs]
- GitHub Issues: [Link to issues]

## Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com)
- Email delivery by [Brevo](https://www.brevo.com)
