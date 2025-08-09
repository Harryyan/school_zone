# Environment Configuration Guide

The Auckland School Finder supports three distinct environments: **mock**, **dev**, and **release**. Each environment provides different capabilities and data sources to support various development and deployment scenarios.

## 🌟 Environment Overview

| Environment | Purpose | Data Source | Setup Required |
|------------|---------|-------------|----------------|
| **MOCK** | Quick development & testing | Local mock data | None |
| **DEV** | Local development | Local PostgreSQL + PostGIS | Database setup |
| **RELEASE** | Production deployment | Remote database + APIs | Full infrastructure |

---

## 🚀 Quick Start

### Run in Different Environments

```bash
# Mock environment (no setup required)
npm run dev:mock

# Development environment (requires database)
npm run dev:dev

# Release environment (production testing)
npm run dev:release
```

---

## 📋 Detailed Environment Descriptions

### 🎭 MOCK Environment
**Perfect for rapid development and offline work**

- **Data Source**: Static mock data (15 realistic Auckland schools)
- **Database**: Disabled
- **APIs**: Mock implementations
- **Setup**: None required - works immediately
- **Use Cases**:
  - Quick UI development
  - Demo presentations
  - Offline development
  - Testing without external dependencies

**Features**:
- ✅ School search and filtering
- ✅ Mock geocoding
- ✅ Mock zone checking  
- ✅ Consistent test data
- ✅ Fast startup

### 🚧 DEV Environment
**Full local development with real database**

- **Data Source**: Local PostgreSQL + PostGIS
- **Database**: Required (Docker Compose provided)
- **APIs**: Real database queries + mock external services
- **Setup**: Database initialization required
- **Use Cases**:
  - Full feature development
  - Database schema testing
  - Integration testing
  - Local debugging

**Features**:
- ✅ Real database operations
- ✅ Spatial queries
- ✅ Data import/export
- ✅ Schema migrations
- ✅ Debug logging

### 🚀 RELEASE Environment
**Production-ready deployment**

- **Data Source**: Remote database + external APIs
- **Database**: Production PostgreSQL
- **APIs**: Real geocoding services (LINZ, Google, etc.)
- **Setup**: Full infrastructure required
- **Use Cases**:
  - Production deployment
  - Staging environment
  - Performance testing
  - User acceptance testing

**Features**:
- ✅ Production database
- ✅ Real geocoding APIs
- ✅ Analytics tracking
- ✅ Error monitoring
- ✅ Performance optimization

---

## ⚙️ Environment Configuration

### Environment Variables

Each environment uses different `.env` files:

```bash
.env.mock     # Mock environment settings
.env.dev      # Development environment settings  
.env.release  # Release environment settings
```

### Configuration Files

Environment-specific configurations are stored in:

```
src/config/environments/
├── mock.ts     # Mock environment config
├── dev.ts      # Development environment config
└── release.ts  # Release environment config
```

---

## 🛠 Setup Instructions

### Mock Environment (No Setup)
```bash
npm run dev:mock
```
That's it! The application will run with mock data immediately.

### Development Environment
1. **Start the database**:
   ```bash
   docker-compose up -d
   ```

2. **Initialize the schema**:
   ```bash
   npm run db:push
   ```

3. **Run the application**:
   ```bash
   npm run dev:dev
   ```

4. **Add sample data** (optional):
   ```bash
   docker exec -it schoolzone-postgres-1 psql -U postgres -d schoolzone
   # Run the SQL commands from the README
   ```

### Release Environment
1. **Configure production variables** in `.env.release`:
   ```env
   DATABASE_URL=postgresql://user:pass@prod-host:5432/db
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token
   LINZ_API_KEY=your_linz_key
   ```

2. **Build for production**:
   ```bash
   npm run build:release
   ```

3. **Deploy** using your preferred method.

---

## 🔄 Switching Environments

### Method 1: Using NPM Scripts (Recommended)
```bash
npm run dev:mock     # Switch to mock
npm run dev:dev      # Switch to development  
npm run dev:release  # Switch to release
```

### Method 2: Environment Variable
```bash
APP_ENV=mock npm run dev      # Mock environment
APP_ENV=dev npm run dev       # Dev environment  
APP_ENV=release npm run dev   # Release environment
```

### Method 3: Manual Environment Files
```bash
cp .env.mock .env.local       # Use mock settings
cp .env.dev .env.local        # Use dev settings
cp .env.release .env.local    # Use release settings
```

---

## 🎨 Visual Environment Indicators

Each environment displays a colored banner at the top of the page:

- **🎭 MOCK**: Orange banner - "MOCK MODE • Using mock data"
- **🚧 DEV**: Blue banner - "DEVELOPMENT • Connected to local database"  
- **🚀 RELEASE**: Green banner - "PRODUCTION • Live environment" (hidden by default)

---

## 📊 Environment Features Matrix

| Feature | Mock | Dev | Release |
|---------|------|-----|---------|
| School Search | ✅ Mock | ✅ Database | ✅ Database |
| Address Geocoding | ✅ Mock | ✅ LINZ/Mock | ✅ LINZ/Google |
| Zone Checking | ✅ Mock | ✅ PostGIS | ✅ PostGIS |
| Maps | 🔄 Coming | ✅ Mapbox | ✅ Mapbox |
| Analytics | ❌ Disabled | ❌ Disabled | ✅ Google Analytics |
| Error Monitoring | ❌ Console | ✅ Console | ✅ Sentry |
| Database Required | ❌ No | ✅ Yes | ✅ Yes |
| Internet Required | ❌ No | ✅ Optional | ✅ Yes |

---

## 🔧 Troubleshooting

### Mock Environment Issues
- **Problem**: No issues expected
- **Solution**: Mock environment should always work

### Dev Environment Issues
- **Problem**: Database connection errors
- **Solution**: 
  ```bash
  docker-compose ps  # Check if database is running
  docker-compose up -d  # Start database
  ```

### Release Environment Issues  
- **Problem**: External API failures
- **Solution**: Check API keys and network connectivity

### Service Factory Issues
- **Problem**: Wrong service being used
- **Solution**: Check `APP_ENV` environment variable

---

## 🏗 Building for Different Environments

```bash
# Build for development
npm run build:dev

# Build for production
npm run build:release

# Standard build (uses NODE_ENV)
npm run build
```

---

## 💡 Development Tips

1. **Start with Mock**: Begin development in mock mode for fastest iteration
2. **Test in Dev**: Validate database operations in dev environment  
3. **Verify in Release**: Test production-like scenarios before deployment
4. **Use Environment Banner**: Always check which environment you're running
5. **Clear Service Cache**: Restart application when switching environments

---

## 📝 Environment Variables Reference

### Common Variables
```env
APP_ENV=mock|dev|release        # Explicit environment selection
NODE_ENV=development|production # Node.js environment
NEXT_PUBLIC_APP_URL=...         # Application base URL
```

### Database Variables
```env
DATABASE_URL=...                # PostgreSQL connection string
```

### Service Variables  
```env
GEOCODING_PROVIDER=mock|linz|google
LINZ_API_KEY=...
GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

### Monitoring Variables
```env
ANALYTICS_PROVIDER=none|gtag
MONITORING_PROVIDER=none|console|sentry
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
SENTRY_DSN=...
```

This multi-environment setup provides maximum flexibility for development, testing, and deployment scenarios while maintaining clean separation of concerns.