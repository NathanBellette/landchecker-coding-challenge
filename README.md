# Landchecker Coding Challenge

## Tech Stack

### Backend
- **Rails 7.0** - Ruby on Rails API
- **PostgreSQL 15** - Database
- **RSpec** - Testing
- **RuboCop** - Code linting

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Chakra UI v3** - Component library
- **React Query** - Data fetching and caching
- **React Router** - Routing
- **Vite** - Build tool
- **Jest & React Testing Library** - Testing

## Prerequisites

- **Docker** and **Docker Compose**
- OR **Ruby 3.0+**, **Node.js 18+**, and **PostgreSQL 15** (for local development)

## Quick Start with Docker

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=myapp_development
RAILS_MASTER_KEY=replace_with_your_32_char_key
SECRET_KEY_BASE=replace_with_your_32_char_key
```

Generate a 32‑char key:
```bash
cd api
ruby -e "require 'securerandom'; print SecureRandom.hex(16)" > config/master.key
cat config/master.key   # copy this into RAILS_MASTER_KEY and SECRET_KEY_BASE
```

### 2. Start All Services

```bash
docker-compose up
```

This will start:
- **PostgreSQL** database on port `5432`
- **Rails API** on port `3000`
- **React UI** on port `5173`

### 3. Seed the Database

In a new terminal, run:

```bash
docker-compose exec api bundle exec rails db:seed
```

This will create:
- 3 test users
- 50 properties with images
- Watchlist entries
- Property events

### 4. Access the Application

- **UI**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/v1

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd api

# Install dependencies
bundle install

# Setup database
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed

# Start server
bundle exec rails server
```

### Frontend Setup

```bash
cd ui

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Database Seeding

### Seed the Database

```bash
# With Docker
docker-compose exec api bundle exec rails db:seed

# Without Docker
cd api && bundle exec rails db:seed
```

The seed script creates:
- **3 test users** (emails: `bob.smith@example.com`, `jane.citizen@example.com`, `nathan.bellette@example.com`, password: `password123`)
- **50 properties** across Australian cities (Melbourne, Sydney, Brisbane, Perth, Adelaide)
- **Property images** (every second property has images)
- **Watchlist entries** (2-5 properties per user)
- **Property events** (price changes and sales)

### Reset Database

```bash
# With Docker
docker-compose exec api bundle exec rails db:reset

# Without Docker
cd api && bundle exec rails db:reset
```

**Note**: `db:reset` drops, creates, migrates, and seeds the database.

## Running Tests

### Backend Tests (RSpec)

```bash
# With Docker (recommended)
docker-compose exec -e RAILS_ENV=test -e DISABLE_BOOTSNAP=1 api bundle exec rails db:create db:migrate
docker-compose exec -e RAILS_ENV=test -e DISABLE_BOOTSNAP=1 api bundle exec rspec

# Run specific test file
docker-compose exec -e RAILS_ENV=test -e DISABLE_BOOTSNAP=1 api bundle exec rspec spec/requests/api/v1/properties_spec.rb

# Without Docker
cd api && DISABLE_BOOTSNAP=1 RAILS_ENV=test bundle exec rspec
```

### Frontend Tests (Jest)

```bash
# With Docker
docker-compose exec ui npm test

# Run in watch mode
docker-compose exec ui npm run test:watch

# Run with coverage
docker-compose exec ui npm run test:coverage

# Without Docker
cd ui && npm test
```

### Run All Tests

```bash
# Backend
docker-compose exec api bundle exec rspec

# Frontend
docker-compose exec ui npm test
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `DELETE /api/v1/auth/logout` - Logout

### Users
- `POST /api/v1/users` - Create user (signup)

### Properties
- `GET /api/v1/properties` - List properties (with pagination and filters)
- `GET /api/v1/properties/:id` - Get property details
- `GET /api/v1/properties/:id/property_events` - Get property events

### Watchlists
- `GET /api/v1/watchlists` - Get user's watchlist (requires auth)
- `POST /api/v1/watchlists` - Add property to watchlist (requires auth)
- `DELETE /api/v1/watchlists/:id` - Remove from watchlist (requires auth)

## Environment Variables

Create a `.env` file in the root:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=myapp_development
```

## Development Commands

### Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild containers
docker-compose build

# Execute commands in containers
docker-compose exec api [command]
docker-compose exec ui [command]
```

### Rails Commands

```bash
# Run migrations
docker-compose exec api bundle exec rails db:migrate

# Rollback migration
docker-compose exec api bundle exec rails db:rollback

# Open Rails console
docker-compose exec api bundle exec rails console

# Run RuboCop
docker-compose exec api bundle exec rubocop
```

### Frontend Commands

```bash
# Run linter
docker-compose exec ui npm run lint

# Build for production
docker-compose exec ui npm run build
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Reset database
docker-compose exec api bundle exec rails db:reset
```

### API Not Responding

```bash
# Check API logs
docker-compose logs api

# Restart API service
docker-compose restart api

# Check if migrations ran
docker-compose exec api bundle exec rails db:migrate:status
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
docker-compose exec ui rm -rf node_modules
docker-compose exec ui npm install

# Check TypeScript errors
docker-compose exec ui npx tsc --noEmit
```

## Test Users

After seeding, you can log in with:

- **Email**: `bob.smith@example.com` / **Password**: `password123`
- **Email**: `jane.citizen@example.com` / **Password**: `password123`
- **Email**: `nathan.bellette@example.com` / **Password**: `password123`