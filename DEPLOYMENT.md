# 🚀 Deployment Guide - Bunkered Golf Platform

This guide covers all deployment options for the Bunkered golf analytics platform, from local development to production environments with mobile-first considerations.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Mobile Optimization](#mobile-optimization)
- [Security Configuration](#security-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- **Docker**: 20.10+ with Docker Compose
- **Git**: For cloning the repository
- **Domain**: For production deployment (optional for local)

### 5-Minute Local Setup

```bash
# Clone repository
git clone https://github.com/your-username/bunkered.git
cd bunkered

# Quick start with default configuration
docker-compose up -d

# Access application
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
```

## ⚙️ Environment Configuration

### Environment Variables

Create environment files for each service:

#### Frontend Environment (`.env.frontend`)

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Bunkered
VITE_APP_VERSION=1.0.0

# Mobile PWA Configuration
VITE_PWA_NAME="Bunkered Golf"
VITE_PWA_SHORT_NAME="Bunkered"
VITE_PWA_DESCRIPTION="Professional Golf Analytics & Betting Platform"
VITE_PWA_THEME_COLOR="#2e7d32"
VITE_PWA_BACKGROUND_COLOR="#ffffff"

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn
```

#### Backend Environment (`.env.backend`)

```bash
# Database Configuration
DATABASE_URL=postgresql://bunkered_user:secure_password@db:5432/bunkered_db
POSTGRES_USER=bunkered_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=bunkered_db

# Security
SECRET_KEY=your-super-secure-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# External APIs
DATAGOLF_API_KEY=your-datagolf-api-key
DATAGOLF_BASE_URL=https://feeds.datagolf.com

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis (for caching)
REDIS_URL=redis://redis:6379/0

# Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# CORS
CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]
```

#### Database Environment (`.env.db`)

```bash
POSTGRES_USER=bunkered_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=bunkered_db
POSTGRES_INITDB_ARGS=--encoding=UTF-8
```

### Production Environment Setup

```bash
# Generate secure keys
openssl rand -hex 32  # For SECRET_KEY
openssl rand -hex 32  # For JWT_SECRET_KEY

# Update production URLs
VITE_API_URL=https://api.yourdomain.com
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

## 🐳 Docker Deployment

### Development Deployment

```bash
# Start all services with hot reload
docker-compose up -d

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart frontend

# Rebuild after code changes
docker-compose build
docker-compose up -d
```

### Production Deployment

#### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    env_file:
      - .env.backend.prod
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    env_file:
      - .env.db.prod
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data_prod:/data
    restart: unless-stopped

volumes:
  postgres_data_prod:
  redis_data_prod:
```

#### Production Deployment Commands

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl -f http://localhost:8000/health
```

### Multi-Stage Dockerfile Optimization

#### Frontend Production Dockerfile

```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Mobile optimization: Enable gzip compression
RUN echo 'gzip on; gzip_types text/css application/json application/javascript text/xml application/xml text/plain;' > /etc/nginx/conf.d/gzip.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Production Dockerfile

```dockerfile
# backend/Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## ☁️ Cloud Deployment

### AWS Deployment

#### ECS Fargate Deployment

```bash
# Install AWS CLI and ECS CLI
aws configure
ecs-cli configure --cluster bunkered-cluster --region us-west-2

# Create ECS cluster
ecs-cli up --capability-iam --size 2 --instance-type t3.medium

# Deploy services
ecs-cli compose --file docker-compose.aws.yml service up
```

#### AWS Docker Compose Configuration

```yaml
# docker-compose.aws.yml
version: "3"
services:
  frontend:
    image: your-account.dkr.ecr.us-west-2.amazonaws.com/bunkered-frontend:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/bunkered-frontend
        awslogs-region: us-west-2
        awslogs-stream-prefix: ecs

  backend:
    image: your-account.dkr.ecr.us-west-2.amazonaws.com/bunkered-backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${RDS_DATABASE_URL}
      - REDIS_URL=${ELASTICACHE_REDIS_URL}
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/bunkered-backend
        awslogs-region: us-west-2
        awslogs-stream-prefix: ecs
```

### Google Cloud Platform

#### Cloud Run Deployment

```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/bunkered-frontend frontend/
gcloud builds submit --tag gcr.io/PROJECT_ID/bunkered-backend backend/

# Deploy to Cloud Run
gcloud run deploy bunkered-frontend \
  --image gcr.io/PROJECT_ID/bunkered-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy bunkered-backend \
  --image gcr.io/PROJECT_ID/bunkered-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL
```

### Digital Ocean App Platform

```yaml
# .do/app.yaml
name: bunkered
services:
  - name: frontend
    source_dir: frontend
    build_command: npm run build
    run_command: nginx -g 'daemon off;'
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: VITE_API_URL
        value: ${backend.PUBLIC_URL}

  - name: backend
    source_dir: backend
    build_command: pip install -r requirements.txt
    run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
    environment_slug: python
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /api
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}

databases:
  - name: db
    engine: PG
    size: basic-xs
```

## 📱 Mobile Optimization

### Nginx Configuration for Mobile

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    # Mobile-specific optimizations
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css application/json application/javascript text/xml application/xml text/plain application/font-woff application/font-woff2;

    # Enable HTTP/2 for better mobile performance
    listen 443 ssl http2;

    # Serve static files with long cache headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }

    # Service Worker cache control
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # PWA manifest
    location /manifest.json {
        add_header Content-Type application/manifest+json;
        expires 1d;
    }

    # API proxy with mobile timeout considerations
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 30s;  # Shorter timeout for mobile
    }

    # Fallback for React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Progressive Web App Configuration

```json
// frontend/public/manifest.json
{
  "name": "Bunkered Golf Analytics",
  "short_name": "Bunkered",
  "description": "Professional Golf Analytics & Betting Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2e7d32",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot-desktop.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

## 🔒 Security Configuration

### SSL/TLS Setup

```bash
# Generate SSL certificates with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers

```nginx
# nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://feeds.datagolf.com;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Database Security

```bash
# Secure PostgreSQL configuration
echo "ssl = on" >> /etc/postgresql/15/main/postgresql.conf
echo "ssl_cert_file = '/etc/ssl/certs/server.crt'" >> /etc/postgresql/15/main/postgresql.conf
echo "ssl_key_file = '/etc/ssl/private/server.key'" >> /etc/postgresql/15/main/postgresql.conf

# Restrict connections
echo "host all all 10.0.0.0/8 md5" >> /etc/postgresql/15/main/pg_hba.conf
```

## 📊 Monitoring & Maintenance

### Health Checks

```python
# backend/app/api/v1/endpoints/health.py
@router.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    try:
        # Database connectivity check
        db_status = await check_database_connection()

        # External API status
        api_status = await check_external_apis()

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": db_status,
                "external_apis": api_status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail="Service unavailable")
```

### Logging Configuration

```yaml
# docker-compose.prod.yml logging
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
        labels: "service=backend"

  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
        labels: "service=frontend"
```

### Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker-compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Redis backup
docker-compose exec -T redis redis-cli --rdb - | gzip > $BACKUP_DIR/redis_backup_$DATE.rdb.gz

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Monitoring Setup

```yaml
# docker-compose.monitoring.yml
version: "3.8"
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 🔧 Troubleshooting

### Common Issues

#### Mobile Performance Issues

```bash
# Check bundle size
npm run build
npm run analyze

# Optimize images
docker run --rm -v $(pwd):/app node:18 npx imagemin-cli images/* --out-dir=optimized/
```

#### Database Connection Issues

```bash
# Check database connectivity
docker-compose exec backend python -c "
from app.database.database import engine
try:
    engine.connect()
    print('Database connected successfully')
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run
```

### Performance Tuning

#### Database Optimization

```sql
-- Add database indexes for mobile performance
CREATE INDEX CONCURRENTLY idx_players_ranking ON players(dg_ranking) WHERE dg_ranking IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_tournaments_date ON tournaments(start_date DESC);
CREATE INDEX CONCURRENTLY idx_bets_user_date ON bets(user_id, placed_at DESC);
```

#### Backend Optimization

```python
# app/core/config.py
class Settings(BaseSettings):
    # Mobile-optimized settings
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30
    CACHE_TIMEOUT: int = 300  # 5 minutes for mobile
    API_RATE_LIMIT: str = "100/minute"
```

### Rollback Procedures

```bash
# Rollback deployment
docker-compose -f docker-compose.prod.yml down
git checkout previous-stable-tag
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Database rollback
pg_restore -U $POSTGRES_USER -d $POSTGRES_DB backup_file.sql
```

## 📞 Support

For deployment issues:

1. **Check logs**: `docker-compose logs -f [service_name]`
2. **Health status**: `curl -f http://localhost:8000/health`
3. **GitHub Issues**: Report deployment-specific issues
4. **Documentation**: Review `.ai-context.md` for AI assistance

---

**Deployment completed successfully!** 🎉

Your Bunkered golf analytics platform is now live and optimized for mobile users worldwide.
