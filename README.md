# Ahwaaz - Global South Asian Creative Community

Ahwaaz is a platform connecting South Asian creatives from around the world. Discover artists, showcase your work, and build meaningful connections within our global creative community.

## Features

- **Interactive Map**: Explore artists by location on an interactive world map
- **Artist Profiles**: Create detailed profiles showcasing your creative work
- **Discovery Tools**: Filter and search artists by practice, location, and more
- **Community Features**: Like profiles, report inappropriate content, and connect
- **Admin Portal**: Comprehensive moderation and management tools
- **Dark/Light Mode**: Beautiful themes for any preference
- **PWA Support**: Install as an app on mobile and desktop

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Maps**: React Leaflet with OpenStreetMap
- **UI Components**: Radix UI primitives
- **Deployment**: Netlify (frontend), Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ahwaaz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/` in order
   - Enable Google OAuth in Supabase Auth settings

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The app uses the following main tables:

- **profiles**: User profiles and authentication data
- **artists**: Artist profile information and portfolio data
- **reports**: User reports for content moderation
- **feedback**: User feedback and feature requests

All tables use Row Level Security (RLS) for data protection.

## Key Features

### Artist Profiles
- Rich profile creation with image upload
- Portfolio links and custom links
- Bio and creative practice information
- Location-based discovery

### Discovery System
- Interactive map view with artist markers
- Grid view with grouping options (city, country, practice)
- Advanced filtering and search
- Favorites system

### Admin Features
- Report management system
- Feedback tracking
- User moderation tools
- Analytics dashboard

### Security
- Row Level Security on all tables
- OAuth authentication via Google
- File upload restrictions
- Content reporting system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Deployment

### Frontend (Netlify)
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Backend (Supabase)
1. Create a Supabase project
2. Run database migrations
3. Configure authentication providers
4. Set up storage buckets

## License

This project is licensed under the MIT License.

## Support

For support, email support@ahwaaz.com or join our community Discord.