# Constellate

An AI-augmented journaling app for focused journaling sessions and mindful reflection. Build a mind you trust, one entry at a time.

## ✨ Features

- **Distraction-Free Writing**: Zen typing mode with a UI that fades away as you write, enabling uninterrupted stream-of-consciousness journaling
- **AI-Powered Insights**: Automatic generation of titles, summaries, and highlights with thoughtful annotations for each entry
- **Evolving User Profile**: Dynamic personal profile that grows with each entry, including:
  - Living Essay: Your evolving personal narrative
  - Pillars: Core values and motivations
  - Strengths & Shadows: Self-awareness insights
  - Forecast: Forward-looking reflections
- **Analytics Dashboard**: Track your journaling journey with:
  - Streak tracking
  - Word count analytics
  - Time-based insights and patterns
  - Visual charts and statistics
- **Stream-of-Consciousness Writing**: Designed with _The Artist's Way_ in mind for unfiltered emotional expression

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **AI**: [Google Gemini](https://ai.google.dev/) (Gemini 2.5 Flash)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Deployment**: Optimized for Vercel

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database
- Clerk account (for authentication)
- Google AI API key (for Gemini)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fred
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/constellate?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
fred/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── journal/       # Journal entry CRUD operations
│   │   ├── profile/       # User profile management
│   │   └── webhooks/      # Clerk webhooks
│   ├── journal/           # Journal entries list page
│   ├── new-entry/         # New entry creation page
│   ├── insights/          # AI insights dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── JournalEditor.tsx
│   ├── JournalDashboard.tsx
│   ├── LivingEssay.tsx
│   ├── Pillars.tsx
│   └── ...
├── lib/                   # Utility libraries
│   ├── ai/               # AI integration (Gemini)
│   ├── prisma.ts         # Prisma client setup
│   └── utils.ts
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
└── contexts/             # React contexts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes Prisma generation and migrations)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply new migrations (development)
- `npx prisma generate` - Generate Prisma Client

## 🔐 Environment Variables

| Variable                            | Description                          | Required |
| ----------------------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`                      | PostgreSQL connection string         | Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                | Yes      |
| `CLERK_SECRET_KEY`                  | Clerk secret key                     | Yes      |
| `CLERK_WEBHOOK_SIGNING_SECRET`      | Clerk webhook signing secret         | Yes      |
| `GEMINI_API_KEY`                    | Google Gemini API key                | Yes      |
| `NODE_ENV`                          | Environment (development/production) | Auto     |

## 🗄️ Database Schema

The application uses three main models:

- **User**: Authentication and user data (synced with Clerk)
- **JournalEntry**: Journal entries with AI-generated insights
- **UserProfile**: Evolving AI-generated user profile with versioning

See `prisma/schema.prisma` for the complete schema definition.

## 🤖 AI Features

The app uses Google Gemini 2.5 Flash to generate:

1. **Entry Insights** (per entry):

   - Personalized title (first-person mantra)
   - Summary with key takeaways
   - Highlighted quotes with annotations

2. **User Profile** (evolving):
   - Living Essay
   - Core Pillars
   - Strengths & Shadows
   - Forecast

Insights are generated asynchronously in the background to avoid blocking the user experience.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The build script automatically runs Prisma migrations, so your database will be updated on each deployment.

### Other Platforms

Ensure your deployment platform:

- Runs `npm run build` (which includes Prisma setup)
- Sets all required environment variables
- Has access to your PostgreSQL database

## 📝 Development Notes

- **User Sync**: The app uses Clerk webhooks to sync users with the database. Make sure your webhook endpoint is configured in the Clerk dashboard.
- **Rate Limiting**: The AI integration includes exponential backoff to handle rate limits gracefully.
- **Background Processing**: AI insights are generated asynchronously to keep the UI responsive.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for mindful reflection and self-discovery.
