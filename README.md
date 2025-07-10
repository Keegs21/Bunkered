# 🏌️‍♂️ Bunkered - Professional Golf Analytics & Betting Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)](https://mui.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Mobile First](https://img.shields.io/badge/Mobile-First-brightgreen?style=flat)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

> **A comprehensive, mobile-first platform for professional golf statistics, betting tracking, fantasy leagues, and tournament analysis with enterprise-grade performance and consumer-friendly design.**

## 📋 Table of Contents

- [Overview](#overview)
- [✨ Features](#-features)
- [📱 Mobile-First Design](#-mobile-first-design)
- [🚀 Quick Start](#-quick-start)
- [🏗 Architecture](#-architecture)
- [🛠 Development](#-development)
- [📊 API Integration](#-api-integration)
- [🎨 UI/UX Guidelines](#-uiux-guidelines)
- [🚀 Deployment](#-deployment)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

**Bunkered** is a modern, full-stack web application designed for golf enthusiasts who demand professional-grade analytics with mobile-first accessibility. Built with enterprise architecture principles and consumer-friendly interfaces.

### 🎯 **Core Objectives**

- 📊 **Professional Analytics**: DataGolf-powered statistics and predictions
- 💰 **Smart Betting**: Comprehensive tracking and ROI analysis
- 🏆 **Fantasy Gaming**: Real-time scoring and league management
- 📱 **Mobile Excellence**: Responsive design with touch-first interactions
- 🔒 **Enterprise Security**: JWT authentication and secure data handling

### 🛠 **Technology Stack**

| Layer                | Technology              | Purpose                                |
| -------------------- | ----------------------- | -------------------------------------- |
| **Frontend**         | React 18 + TypeScript   | Type-safe UI development               |
| **UI Framework**     | Material-UI v5          | Professional component library         |
| **Build Tool**       | Vite                    | Fast development and production builds |
| **Backend**          | FastAPI + Python 3.9+   | High-performance API development       |
| **Database**         | PostgreSQL + SQLAlchemy | Robust data persistence                |
| **Authentication**   | JWT + bcrypt            | Secure user management                 |
| **External APIs**    | DataGolf API            | Professional golf statistics           |
| **Containerization** | Docker + Docker Compose | Consistent deployment environments     |

## ✨ Features

### 📊 **Professional Analytics**

#### **Player Research**

- **Real-time Rankings**: Live DataGolf and OWGR rankings with automatic updates
- **Skill Analysis**: Comprehensive strokes-gained statistics across all game aspects
- **Performance Prediction**: Pre-tournament modeling and course-specific analytics
- **Historical Trends**: Multi-season performance tracking and pattern analysis

#### **Tournament Intelligence**

- **Live Results**: Real-time leaderboards and scoring updates
- **Course Analytics**: Detailed course history and statistical breakdowns
- **Weather Integration**: Condition-based performance adjustments
- **Field Analysis**: Comprehensive tournament field strength evaluation

### 💰 **Advanced Betting Management**

#### **Bet Tracking & Analysis**

- **Multi-format Support**: Outright wins, top finishes, head-to-head matchups
- **ROI Analytics**: Detailed profit/loss analysis with trend visualization
- **Bankroll Management**: Smart staking recommendations and risk assessment
- **Strategy Optimization**: Performance analysis by bet type and tournament

#### **Market Intelligence**

- **Odds Tracking**: Historical line movement and value identification
- **Value Detection**: Algorithm-driven betting opportunity alerts
- **Performance Metrics**: Win rate, yield, and return analytics
- **Risk Management**: Automated alerts for exposure and variance

### 🏆 **Fantasy League Platform**

#### **League Management**

- **Custom Scoring**: Flexible point systems and tournament selection
- **Real-time Updates**: Live scoring with automatic leaderboard updates
- **Prize Structure**: Automated payout calculations and distribution
- **Social Features**: League chat, comments, and competitive elements

#### **Team Building**

- **Draft System**: Snake draft with real-time player selection
- **Salary Cap**: Budget-based team construction with market pricing
- **Lineup Optimization**: AI-powered recommendations and projections
- **Transfer Market**: Mid-season player trading and waiver wire

### 📱 **Mobile-First Experience**

#### **Responsive Design Excellence**

- **Touch-Optimized**: Minimum 44px/48px touch targets for iOS/Android
- **Adaptive Layouts**: Content that flows naturally across all screen sizes
- **Performance First**: <3s load times with progressive enhancement
- **Offline Capability**: Core functionality available without internet

#### **Mobile-Specific Features**

- **Swipe Navigation**: Intuitive gesture-based interface interactions
- **Card-Based Tables**: Intelligent mobile alternatives to complex data tables
- **Contextual Actions**: Quick access to frequently used features
- **Progressive Web App**: Installable experience with native-like performance

## 📱 Mobile-First Design

### 🎨 **Design Philosophy**

**Bunkered** follows a strict **mobile-first approach**, ensuring optimal performance across all devices while maintaining desktop feature parity.

#### **Responsive Breakpoints**

```typescript
const breakpoints = {
  xs: 0, // 🤳 Small mobile (320px-599px)
  sm: 600, // 📱 Large mobile (600px-899px)
  md: 900, // 📱 Small tablet (900px-1199px)
  lg: 1200, // 💻 Desktop (1200px-1535px)
  xl: 1536, // 🖥️ Large desktop (1536px+)
};
```

#### **Touch-First Interface Standards**

- **iOS Standards**: 44px minimum touch targets
- **Android Standards**: 48px minimum touch targets
- **Gesture Support**: Swipe, pinch, and tap optimizations
- **Accessibility**: WCAG 2.1 AA compliance throughout

### 🎯 **Mobile Component Optimizations**

#### **SortableTable → Intelligent Mobile Cards**

- **Desktop**: Traditional sortable table with pagination
- **Mobile**: Card-based layout with expandable details
- **Features**: Priority-based column visibility, touch-friendly interactions

```typescript
const mobileColumns: Column[] = [
  {
    id: "player_name",
    label: "Player",
    mobilePriority: 1, // Always visible
    mobileFormat: (value) => <Typography variant="h6">{value}</Typography>,
  },
  {
    id: "rank",
    label: "Ranking",
    mobilePriority: 2, // Visible on larger mobile
  },
  {
    id: "details",
    label: "Statistics",
    mobileHidden: true, // Hidden, shown in expandable section
  },
];
```

#### **Navigation → Adaptive Mobile Drawer**

- **Desktop**: Horizontal navigation with dropdowns
- **Mobile**: Slide-out drawer with hierarchical menu structure
- **Performance**: Virtualized scrolling for large menu sets

#### **Forms → Mobile-Optimized Inputs**

- **iOS Safari**: 16px font size prevents zoom
- **Touch Targets**: 52px minimum input height
- **Validation**: Real-time feedback with mobile-friendly messaging

## 🚀 Quick Start

### 🐳 Docker Setup (Recommended)

The fastest way to get Bunkered running locally:

```bash
# Clone the repository
git clone https://github.com/your-username/bunkered.git
cd bunkered

# Start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

**Access Points:**

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8000
- 📚 **API Documentation**: http://localhost:8000/docs
- 🗄️ **Database**: localhost:5432

### 💻 Local Development Setup

#### **Prerequisites**

- **Node.js**: 18+ with npm
- **Python**: 3.9+ with pip
- **PostgreSQL**: 13+ (or use Docker for database only)

#### **Frontend Development**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### **Backend Development**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python migrate_db.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### **Environment Configuration**

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Bunkered
```

**Backend (.env)**

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/bunkered
SECRET_KEY=your-secret-key-here
DATAGOLF_API_KEY=your-datagolf-api-key
```

## 🏗 Architecture

### 🎯 **Frontend Architecture**

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (SortableTable, forms)
│   │   └── layout/          # Layout components (Navbar, Footer)
│   ├── pages/               # Route-based page components
│   ├── hooks/               # Custom React hooks for data fetching
│   ├── contexts/            # React Context providers (Auth, Theme)
│   ├── theme/               # Material-UI theme with mobile optimizations
│   └── main.tsx            # Application entry point with routing
├── public/                  # Static assets and PWA manifests
├── package.json            # Dependencies and scripts
└── vite.config.ts          # Vite configuration with optimizations
```

### ⚙️ **Backend Architecture**

```
backend/
├── app/
│   ├── api/v1/             # Versioned API endpoints
│   │   └── endpoints/      # Individual endpoint implementations
│   ├── core/               # Core application configuration
│   ├── database/           # SQLAlchemy models and database setup
│   ├── schemas/            # Pydantic models for request/response validation
│   └── services/           # Business logic and external API integrations
├── migrations/             # Database migration scripts
├── requirements.txt        # Python dependencies
└── Dockerfile             # Container configuration
```

### 🗄 **Database Schema**

#### **Core Tables**

- **users**: Authentication and profile management
- **tournaments**: Golf tournament data and schedules
- **players**: Professional golfer profiles and statistics
- **bets**: User betting records with comprehensive analytics
- **fantasy_leagues**: League configuration and management
- **fantasy_teams**: User team composition and scoring
- **news**: Article storage with categorization

#### **Integration Tables**

- **player_rankings**: Historical ranking data from DataGolf
- **tournament_results**: Detailed scoring and performance data
- **betting_analytics**: Calculated metrics and performance indicators

## 🛠 Development

### 📝 **Code Standards & Best Practices**

#### **TypeScript Configuration**

- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Simplified imports with @ aliases
- **ESLint Integration**: Consistent code formatting and error detection

#### **Component Development Guidelines**

```typescript
// ✅ Good: Mobile-responsive component with proper typing
interface PlayerCardProps {
  player: Player;
  onSelect: (player: Player) => void;
  compact?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onSelect,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Card
      onClick={() => onSelect(player)}
      sx={{
        cursor: "pointer",
        borderRadius: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 3 },
        "&:hover": {
          boxShadow: isMobile ? 2 : 4,
        },
      }}
    >
      {/* Component content */}
    </Card>
  );
};
```

#### **Mobile-First Styling Patterns**

```typescript
// ✅ Mobile-first responsive styling
const responsiveStyles = {
  // Base styles for mobile (xs: 0px+)
  fontSize: "0.875rem",
  padding: 2,

  // Tablet adjustments (sm: 600px+)
  [theme.breakpoints.up("sm")]: {
    fontSize: "1rem",
    padding: 3,
  },

  // Desktop enhancements (md: 900px+)
  [theme.breakpoints.up("md")]: {
    fontSize: "1.125rem",
    padding: 4,
  },
};
```

### 🧪 **Testing Strategy**

#### **Frontend Testing**

```bash
# Unit tests with Vitest
npm run test

# Component testing with React Testing Library
npm run test:components

# E2E testing with Playwright
npm run test:e2e

# Coverage reporting
npm run test:coverage
```

#### **Backend Testing**

```bash
# Unit tests with pytest
pytest tests/

# Integration tests
pytest tests/integration/

# API endpoint testing
pytest tests/api/

# Coverage reporting
pytest --cov=app tests/
```

### 🔧 **Performance Optimization**

#### **Frontend Optimizations**

- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker for static assets

#### **Backend Optimizations**

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Layer**: Redis integration for frequent queries
- **API Rate Limiting**: Request throttling and abuse prevention

## 📊 API Integration

### 🏌️ **DataGolf API Integration**

Bunkered integrates with the DataGolf API for professional golf statistics:

#### **Available Endpoints**

- **Player Rankings**: `/api/v1/players/rankings`
- **Skill Ratings**: `/api/v1/players/skill-ratings`
- **Tournament Schedule**: `/api/v1/tournaments/schedule`
- **Live Results**: `/api/v1/tournaments/results`
- **Course Information**: `/api/v1/courses/details`

#### **Data Refresh Strategy**

- **Real-time**: Tournament results during active events
- **Hourly**: Player rankings and skill ratings
- **Daily**: Tournament schedules and course information
- **Weekly**: Historical data and season statistics

### 🔌 **Internal API Structure**

#### **Authentication Endpoints**

```
POST /api/v1/auth/login         # User authentication
POST /api/v1/auth/register      # User registration
POST /api/v1/auth/refresh       # Token refresh
DELETE /api/v1/auth/logout      # User logout
```

#### **Betting Management**

```
GET    /api/v1/bets/            # List user bets
POST   /api/v1/bets/            # Create new bet
PUT    /api/v1/bets/{id}        # Update bet
DELETE /api/v1/bets/{id}        # Delete bet
GET    /api/v1/bets/analytics   # Betting analytics
```

#### **Fantasy League Management**

```
GET    /api/v1/fantasy/leagues  # List leagues
POST   /api/v1/fantasy/leagues  # Create league
GET    /api/v1/fantasy/teams    # User teams
POST   /api/v1/fantasy/teams    # Create team
```

## 🎨 UI/UX Guidelines

### 🎯 **Design System**

#### **Color Palette**

```typescript
const palette = {
  primary: {
    main: "#2e7d32", // Golf green
    light: "#60ad5e",
    dark: "#005005",
  },
  secondary: {
    main: "#1565c0", // Sky blue
    light: "#5e92f3",
    dark: "#003c8f",
  },
  success: {
    main: "#388e3c", // Success green
  },
  warning: {
    main: "#f57c00", // Warning orange
  },
  error: {
    main: "#d32f2f", // Error red
  },
};
```

#### **Typography Scale**

```typescript
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.2 },
  h2: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: "1rem", lineHeight: 1.5 },
  body2: { fontSize: "0.875rem", lineHeight: 1.5 },
  caption: { fontSize: "0.75rem", lineHeight: 1.4 },
};
```

### 📏 **Spacing System**

```typescript
const spacing = {
  xs: 4, // 4px
  sm: 8, // 8px
  md: 16, // 16px
  lg: 24, // 24px
  xl: 32, // 32px
  xxl: 48, // 48px
};
```

### 🖱️ **Interaction Guidelines**

#### **Touch Targets**

- **Minimum Size**: 44px × 44px (iOS), 48px × 48px (Android)
- **Optimal Size**: 52px × 52px for primary actions
- **Spacing**: 8px minimum between adjacent targets

#### **Animation Standards**

- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: `cubic-bezier(0.25, 0.8, 0.25, 1)` for smooth motion
- **Reduced Motion**: Respect user's motion preferences

## 🚀 Deployment

### 🐳 **Docker Production Deployment**

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with environment variables
docker-compose -f docker-compose.prod.yml up -d

# Health check
docker-compose -f docker-compose.prod.yml ps
```

### ☁️ **Cloud Deployment Options**

#### **AWS Deployment**

- **ECS Fargate**: Serverless container deployment
- **RDS PostgreSQL**: Managed database with automated backups
- **CloudFront**: Global CDN for frontend assets
- **Route 53**: DNS management and health checks

#### **Google Cloud Platform**

- **Cloud Run**: Serverless container platform
- **Cloud SQL**: Managed PostgreSQL with high availability
- **Cloud CDN**: Global content delivery
- **Cloud DNS**: Reliable DNS hosting

#### **Azure Deployment**

- **Container Instances**: Serverless container deployment
- **Azure Database**: Managed PostgreSQL service
- **Azure CDN**: Global content acceleration
- **Azure DNS**: DNS zone hosting

### 🔒 **Security Considerations**

#### **Authentication & Authorization**

- **JWT Tokens**: Secure stateless authentication
- **Refresh Tokens**: Long-term session management
- **Role-Based Access**: Granular permission system
- **Password Security**: bcrypt hashing with salt

#### **Data Protection**

- **HTTPS Enforcement**: TLS 1.3 for all communications
- **Input Validation**: Comprehensive request sanitization
- **SQL Injection Prevention**: Parameterized queries only
- **CORS Configuration**: Restricted cross-origin access

## 📖 Documentation

### 📚 **Available Documentation**

#### **Development Documentation**

- **`.ai-context.md`**: AI assistant development context
- **`CONTRIBUTING.md`**: Contribution guidelines and standards
- **`API.md`**: Comprehensive API documentation
- **`DEPLOYMENT.md`**: Production deployment guide

#### **API Documentation**

- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **OpenAPI Spec**: http://localhost:8000/openapi.json
- **Redoc Interface**: http://localhost:8000/redoc

### 🤖 **AI Development Context**

This project includes comprehensive AI context files to assist with development:

- **Architecture Overview**: Complete system design and patterns
- **Component Guidelines**: Mobile-first development standards
- **API Integration**: External service integration patterns
- **Testing Strategy**: Comprehensive testing approaches
- **Deployment Procedures**: Production deployment guidelines

## 🤝 Contributing

### 📋 **Contribution Guidelines**

#### **Getting Started**

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

#### **Code Standards**

- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: Minimum 80% code coverage for new features
- **Mobile-First**: All new components must be mobile-responsive
- **Documentation**: Update relevant documentation for changes

#### **Pull Request Process**

1. **Update** documentation for any API changes
2. **Add** tests for new functionality
3. **Ensure** all tests pass and meet coverage requirements
4. **Request** review from maintainers

### 🐛 **Issue Reporting**

#### **Bug Reports**

- **Use** the bug report template
- **Include** browser/device information for frontend issues
- **Provide** steps to reproduce the issue
- **Add** screenshots for UI-related problems

#### **Feature Requests**

- **Use** the feature request template
- **Explain** the use case and business value
- **Consider** mobile impact and responsive design
- **Provide** mockups or wireframes if applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **DataGolf**: Professional golf statistics and analytics
- **Material-UI**: React component library and design system
- **FastAPI**: Modern, fast web framework for building APIs
- **Golf Community**: Inspiration and feature requirements

---

<div align="center">

**Built with ❤️ for the golf community**

[🌐 Live Demo](https://bunkered.app) • [📖 Documentation](https://docs.bunkered.app) • [🐛 Report Bug](https://github.com/your-username/bunkered/issues) • [✨ Request Feature](https://github.com/your-username/bunkered/issues)

</div>
