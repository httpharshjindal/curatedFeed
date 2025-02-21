# Curated Feed

## Overview
A modern web application that provides personalized article recommendations based on user interests. The platform aggregates articles from across the web using Serper.dev and Google AI Studio APIs, delivering a curated reading experience tailored to each user's preferences.

## Key Features
- 🔐 Secure authentication with Clerk
- 📱 Responsive design for all devices
- 🔄 Real-time article updates (hourly)
- 💾 Bookmark favorite articles
- 🎯 Personalized content feed
- 🔍 Discovery feed for exploring new topics
- ⚡ High-performance backend with Bun + Hono

## Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Drizzle
- **Scheduling**: Node-cron
- **Language**: TypeScript
- **APIs**: Serper.dev, Google AI Studio

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **Language**: TypeScript
- **State Management**: React Context + React Query

## Architecture
The application follows a modern microservices architecture:
- Frontend deployed on Netlify
- Backend deployed on Render
- Database hosted on Neon.tech
- Automated article fetching using cron jobs
- RESTful API design with proper error handling
- TypeScript for type safety across the stack

## Getting Started

### Prerequisites
- Bun >= 1.0.0
- Node.js >= 18
- Docker (optional)
- PostgreSQL

### Environment Variables for frontend
```env
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```
### Environment Variables for backend
```env
DATABASE_URL
SERPER_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
PORT
```

## Features Breakdown

### User Flow
1. Users browse initial articles on landing page
2. Sign up/Sign in prompted after reaching article limit
3. Select interests during onboarding
4. Access personalized feed based on interests
5. Bookmark favorite articles
6. Update interests anytime

### Feed Types
- **Discover**: Global feed showing latest articles across all categories
- **Interests**: Personalized feed based on user preferences
- **Favorites**: Bookmarked articles

## Deployment
- Frontend: Netlify
- Backend: Render
- Database: Neon.tech


### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/article-curation-app.git
```

2. Install dependencies
```bash
# Backend
cd backend
bun install

# Frontend
cd frontend
npm install
```

3. Start the development servers
```bash
# Backend
bun run dev

# Frontend
npm run dev
```

### Docker Setup
```bash
docker-compose up
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT