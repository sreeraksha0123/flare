# Flare ✦ Smart Bookmark Manager

> **Organize your digital world with real-time sync across all devices**

Flare is a modern, enterprise-grade bookmark manager that helps you save, organize, and access your favorite links instantly. Built with Next.js and Supabase, it offers real-time synchronization, powerful search capabilities, and a beautiful dark-themed interface.

live link - https://flare-sigma.vercel.app/
demo link - https://www.loom.com/share/9038b6cd753f422b9004bd8dcebe1b0a
## ✨ Features

### Core Functionality
- **🔐 Secure Authentication** - Google Sign-In integration with enterprise-grade security
- **⚡ Real-time Sync** - Changes appear instantly across all your devices
- **📁 Smart Organization** - Automatic categorization by domain
- **🔍 Advanced Search** - Find any bookmark in seconds with powerful filtering
- **📱 Responsive Design** - Perfect experience on desktop, tablet, and mobile

### Productivity Tools
- **🏷️ Auto-categorization** - Bookmarks are automatically grouped by domain
- **📊 Analytics Dashboard** - See your bookmarking activity at a glance
- **🔗 Quick Actions** - Copy URLs, open links, delete with one click
- **🎯 Filter System** - Filter by date, category, and custom search
- **📋 Multiple Views** - Switch between list and grid layouts

### User Experience
- **🌙 Dark Theme** - Easy on the eyes, day or night
- **✨ Smooth Animations** - Delightful micro-interactions using Framer Motion
- **📱 Mobile Optimized** - Fully responsive on all screen sizes
- **⚡ Instant Updates** - Optimistic UI updates for snappy feel

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Infrastructure
- **Authentication**: [Supabase Auth](https://supabase.com/auth) (Google OAuth)
- **Database**: [Supabase PostgreSQL](https://supabase.com/database)
- **Real-time**: [Supabase Realtime](https://supabase.com/realtime)
- **Hosting**: [Vercel](https://vercel.com/)

### Development Tools
- **Language**: JavaScript/React
- **Package Manager**: npm/yarn
- **Version Control**: Git
- **Deployment**: Continuous Deployment via Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sreeraksha0123/flare.git
   cd flare
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run this SQL to create the bookmarks table:
   ```sql
   CREATE TABLE bookmarks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     title TEXT NOT NULL,
     url TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can CRUD their own bookmarks" ON bookmarks
     FOR ALL USING (auth.uid() = user_id);
   ```

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google OAuth API
   - Configure OAuth consent screen
   - Create credentials (OAuth client ID)
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://your-app.vercel.app/auth/callback
     ```

5. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

6. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
flare/
├── app/                    # Next.js app directory
│   ├── auth/               # Authentication routes
│   │   └── callback/       # OAuth callback handler
│   ├── dashboard/          # Main dashboard page
│   ├── layout.js           # Root layout
│   ├── page.js             # Landing page
│   └── globals.css         # Global styles
├── utils/                  # Utility functions
│   └── supabase.js         # Supabase client
├── public/                 # Static assets
├── .env.local              # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── README.md               # Documentation
└── tailwind.config.js      # Tailwind configuration
```

## 🎯 Key Features Deep Dive

### Real-time Synchronization
Flare uses Supabase Realtime to sync bookmarks across all your devices instantly. When you add or delete a bookmark, it appears or disappears on all open tabs immediately.

### Smart Categorization
Bookmarks are automatically categorized based on their domain. This helps you:
- Quickly find related links
- Understand your browsing patterns
- Organize without manual effort

### Advanced Filtering
- **Search**: Find by title or URL
- **Category**: Filter by domain
- **Date**: View bookmarks from today, this week, or this month
- **Sort**: Newest, oldest, or alphabetical

### Optimistic UI Updates
The interface updates immediately when you perform an action, then syncs with the server in the background. This creates a snappy, responsive feel.

## 🚢 Deployment - with Versel- https://flare-sigma.vercel.app/

## 👩‍💻 Author

**Sree Raksha S P**
- GitHub: [@sreeraksha0123](https://github.com/sreeraksha0123)
- LinkedIn: [Sree Raksha S P](https://linkedin.com/in/sreeraksha0123)
- Email: sreeraksha0123@example.com

**Built with ❤️ by Sree Raksha S P**  
*If you find this project useful, please give it a ⭐ on GitHub!*
