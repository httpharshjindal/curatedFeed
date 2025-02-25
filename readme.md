# 📚 Curated Feed


https://github.com/user-attachments/assets/bd7be10c-4a42-450c-bc74-8736acc52966


The Article Curation App is a personalized content discovery platform that delivers curated articles based on user interests. The app provides a seamless reading experience with a thoughtful onboarding flow and intuitive content organization.

## Overview

Curated Feed is a content discovery platform that provides users with personalized article recommendations. The application offers a seamless reading experience with intuitive content organization and smart user onboarding.

### Core Functionality
- Personalized article recommendations
- Interest-based content filtering
- Bookmark system for saving articles
- Real-time content updates
- Responsive design across devices

## Features

### User Experience
- **Landing Page**: Display of 10 featured articles with infinite scroll
- **Authentication**: Clerk-based secure user management
- **Onboarding**: Guided interest selection process

### Content Organization
1. **Discover Tab**
   - Global article feed
   - Cross-category content
   - Regular content updates

2. **Interests Tab**
   - Personalized article feed
   - Interest-based filtering
   - Real-time preference updates

3. **Favorites Section**
   - Bookmarked articles collection
   - Easy access via navigation bar
   - One-click bookmarking system

### Key Features
- Interest management through header button
- Heart-based bookmarking system
- Automatic content refresh
- Mobile-responsive design

## Architecture

### Backend Stack
- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Drizzle
- **Scheduler**: Node-cron
- **Language**: TypeScript

### Frontend Stack
- **Framework**: Next.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Bun >= 1.0.0
- Node.js >= 18
- Docker (optional)
- PostgreSQL

### Environment Setup

#### Frontend Variables
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### Backend Variables
```env
DATABASE_URL=
SERPER_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PORT=
```

## Development

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/curated-feed.git
```

2. Install dependencies
```bash
# Backend setup
cd backend
bun install

# Frontend setup
cd frontend
npm install
```

3. Start development servers
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

## User Flow
1. Browse initial articles
2. Sign up/in after reaching limit
3. Select interests during onboarding
4. Access personalized feed
5. Bookmark favorite articles
6. Manage interests

## Deployment

### Production Endpoints
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: Neon.tech

## Contributing
We welcome contributions! For major changes:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Open an issue for discussion

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
