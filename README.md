# Auckland School Finder

A comprehensive web application for discovering primary and secondary schools in Auckland, New Zealand. Features advanced search, filtering, interactive maps, and enrolment zone checking.

## Features

- 🔍 **Advanced Search**: Search by school name, address, or suburb with intelligent autocomplete
- 📍 **Interactive Maps**: View schools on an interactive map with zone boundaries
- 🎯 **Smart Filtering**: Filter by school type, year levels, gender, proprietor, and more
- 🏠 **Zone Checking**: Check if an address falls within school enrolment zones
- 📱 **Mobile First**: Responsive design optimized for all devices
- ♿ **Accessible**: WCAG AA compliant with full keyboard navigation
- 🚀 **Fast**: Optimized performance with server-side rendering

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 15 with PostGIS 3.3
- **ORM**: Drizzle ORM
- **Maps**: Mapbox GL JS (planned)
- **Geocoding**: Pluggable geocoding service
- **Infrastructure**: Docker, Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([Download](https://docker.com/get-started))
- **Git** for version control

### Verify Installation

```bash
node --version    # Should be 18.17+
npm --version     # Should be 9.0+
docker --version  # Should be 20.0+
docker-compose --version  # Should be 2.0+
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SchoolZone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The `.env.local` file is already configured with default values:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/schoolzone

# Mapbox Configuration (Optional - for maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Geocoding Service (Optional)
GEOCODING_API_KEY=your_geocoding_api_key
GEOCODING_PROVIDER=mock

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start the Database

```bash
# Start PostgreSQL with PostGIS in the background
docker-compose up -d

# Verify the database is running
docker-compose ps
```

You should see output showing the postgres container is running:
```
NAME                     IMAGE                    STATUS
schoolzone-postgres-1    postgis/postgis:15-3.3   Up
```

### 5. Initialize the Database

```bash
# Generate database schema
npm run db:generate

# Apply schema to database
npm run db:push

# Optional: Open database studio to view tables
npm run db:studio
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## Database Setup

### PostgreSQL with PostGIS

The application uses PostgreSQL with the PostGIS extension for spatial data operations. The Docker Compose configuration automatically sets up:

- PostgreSQL 15
- PostGIS 3.3 extension
- Database: `schoolzone`
- User: `postgres`
- Password: `password`
- Port: `5432`

### Database Schema

The application includes the following main tables:

- **schools**: School information and locations
- **zones**: Enrolment zone boundaries (MultiPolygon geometries)
- **address_cache**: Geocoded address cache for performance

### Database Commands

```bash
# Generate new migration after schema changes
npm run db:generate

# Apply schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Reset database (caution: destroys data)
docker-compose down -v
docker-compose up -d
npm run db:push
```

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── search/        # School search endpoint
│   │   ├── schools/       # School-related endpoints
│   │   ├── zones/         # Zone-related endpoints
│   │   └── geocode/       # Geocoding endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── search/           # Search-related components
│   ├── school/           # School-related components
│   └── map/              # Map components (coming soon)
├── lib/                   # Core business logic
│   ├── db.ts             # Database connection
│   ├── schema.ts         # Database schema
│   └── services/         # Business logic services
│       ├── school.ts     # School service
│       ├── zone.ts       # Zone service
│       └── geocoding.ts  # Geocoding service
├── types/                 # TypeScript type definitions
└── data/                 # Data management utilities
```

### Key Services

- **SchoolService**: School search, filtering, and retrieval
- **ZoneService**: Zone boundary queries and containment checks
- **GeocodingService**: Address geocoding with caching

### Adding Sample Data

To test the application with sample data:

1. **Connect to the database:**
   ```bash
   docker exec -it schoolzone-postgres-1 psql -U postgres -d schoolzone
   ```

2. **Insert sample schools:**
   ```sql
   INSERT INTO schools (
     name, type, gender, proprietor, address, suburb,
     location, year_levels
   ) VALUES
   ('Auckland Grammar School', 'Secondary', 'Boys', 'State', 
    '87 Mountain Road, Epsom, Auckland 1023', 'Epsom',
    ST_SetSRID(ST_MakePoint(174.7762, -36.8735), 4326), 'Y9-13'),
   ('Ponsonby Primary School', 'Primary', 'Co-ed', 'State',
    '54 Curran Street, Ponsonby, Auckland 1011', 'Ponsonby',
    ST_SetSRID(ST_MakePoint(174.7457, -36.8467), 4326), 'Y1-6'),
   ('Epsom Girls Grammar School', 'Secondary', 'Girls', 'State',
    'Silver Road, Epsom, Auckland 1023', 'Epsom',
    ST_SetSRID(ST_MakePoint(174.7800, -36.8794), 4326), 'Y9-13');
   ```

3. **Exit the database:**
   ```sql
   \q
   ```

Now you can test the search functionality with real data!

## API Endpoints

The application provides the following REST API endpoints:

### Search Schools
```http
GET /api/search?q=query&type=Primary&gender=Co-ed&page=1&pageSize=20
```

**Parameters:**
- `q` - Search query (school name, address, suburb)
- `type` - School type filter (Primary, Intermediate, Secondary, Composite)
- `gender` - Gender filter (Co-ed, Boys, Girls)
- `proprietor` - Proprietor filter (State, State-Integrated, Private)
- `boarding` - Boarding availability (true/false)
- `hasZone` - Has enrolment zone (true/false)
- `lat`, `lng`, `radius` - Geographic search
- `bbox` - Bounding box search
- `page`, `pageSize` - Pagination

### Get School Details
```http
GET /api/schools/{id}
```

### Get School Zone
```http
GET /api/schools/{id}/zone
```

### Check Address in Zones
```http
GET /api/zones/contains?lat=-36.8485&lng=174.7633
```

### Geocode Address
```http
GET /api/geocode?query=Queen Street Auckland
```

### Find Nearby Schools
```http
GET /api/schools/nearby?lat=-36.8485&lng=174.7633&radius=5000&limit=5
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | No | - | Mapbox API token for maps |
| `GEOCODING_API_KEY` | No | - | Geocoding service API key |
| `GEOCODING_PROVIDER` | No | `mock` | Geocoding provider (linz/mapbox/google) |

### Mapbox Configuration (Optional)

To enable map functionality:

1. Create a free account at [Mapbox](https://www.mapbox.com/)
2. Get your access token from the dashboard
3. Add it to `.env.local`:
   ```env
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here
   ```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port Conflicts

If port 3000 or 5432 are in use:

```bash
# Change Next.js port
npm run dev -- -p 3001

# Change PostgreSQL port in docker-compose.yml
# Edit the ports section:
ports:
  - "5433:5432"  # External:Internal
```

### Permission Errors

```bash
# Fix Docker permission issues (Linux/macOS)
sudo chown -R $USER:$USER .
```

### Clear Cache and Restart

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Schema Issues

```bash
# Reset database and schema
docker-compose down -v
docker-compose up -d
npm run db:push
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate new migration
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## Production Deployment

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

Ensure these are set in your production environment:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_production_token
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

- 🐛 Issues: Create an issue on GitHub
- 📖 Documentation: Check the README and code comments
- 💡 Feature Requests: Open a GitHub issue with the enhancement label

---

Built with ❤️ for Auckland families seeking quality education options.
