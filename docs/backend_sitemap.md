# Content Marketing Toolkit API - Backend Sitemap

## 🏗️ Project Architecture Overview

**Project Type**: Flask REST API  
**Architecture Pattern**: Modular Blueprint-based with Service Layer  
**Version**: 4.0.1  
**Status**: Production Ready ✅

---

## 📁 Directory Structure

```
content-marketing-toolkit-api/
├── 📄 app.py                          # Main Flask application (80 lines)
├── 📄 enhanced_extractor_v3.py        # YouTube transcript extractor
├── 📄 requirements.txt                # Python dependencies
├── 📄 create_structure.bat            # Windows folder creation script
├── 📄 sitemap.md                      # This file
├── 
├── 📁 config/                         # Configuration Management
│   ├── 📄 __init__.py
│   ├── 📄 settings.py                 # Environment & app configuration
│   └── 📄 cors_config.py              # CORS setup with Authorization fix
├── 
├── 📁 database/                       # Database Layer
│   ├── 📄 __init__.py
│   ├── 📄 supabase_client.py          # Supabase initialization
│   └── 📄 models.py                   # Pydantic data models
├── 
├── 📁 services/                       # Business Logic Layer
│   ├── 📄 __init__.py
│   ├── 📄 auth_service.py             # Authentication & user management
│   ├── 📄 ai_service.py               # AI service management (Claude + OpenAI)
│   ├── 📄 cache_service.py            # Video transcript caching
│   ├── 📄 usage_tracking.py           # Usage limits & tracking
│   ├── 📄 content_library.py          # Content library operations
│   └── 📄 page_analyzer.py            # Web page analysis
├── 
├── 📁 routes/                         # API Endpoints Layer
│   ├── 📄 __init__.py
│   ├── 📄 health.py                   # Health checks & system status
│   ├── 📄 video_routes.py             # Video transcript processing
│   ├── 📄 email_routes.py             # Email generation features
│   ├── 📄 usage_routes.py             # Usage tracking endpoints
│   └── 📄 content_library_routes.py   # Content library management
├── 
└── 📁 utils/                          # Utility Functions
    ├── 📄 __init__.py
    ├── 📄 helpers.py                  # General utility functions
    ├── 📄 error_handlers.py           # Centralized error handling
    └── 📄 validators.py               # Input validation functions
```

---

## 🌐 API Endpoints Map

### **Base URL Structure**
- **Production**: `https://your-api-domain.com`
- **Development**: `http://localhost:5000`

### **🏥 Health & System Endpoints**
**Blueprint**: `health_bp`  
**Base Path**: `/`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| `GET` | `/` | Main health check with system status | ❌ | ✅ |
| `GET` | `/cache/stats` | Cache statistics & performance metrics | ❌ | ✅ |
| `GET` | `/system/status` | Detailed system monitoring | ❌ | ✅ |

### **🎥 Video Processing Endpoints**
**Blueprint**: `video_bp`  
**Base Path**: `/api/video2promo`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| `POST` | `/extract-transcript` | Extract YouTube video transcript | ✅ | ✅ |
| `POST` | `/analyze-benefits` | Analyze transcript for benefits & insights | ✅ | ✅ |
| `POST` | `/generate-assets` | Generate promotional assets from transcript | ✅ | ✅ |
| `GET` | `/health` | Video service health check | ❌ | ✅ |

### **📧 Email Generation Endpoints**
**Blueprint**: `email_bp`  
**Base Path**: `/api/email-generator`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| `POST` | `/scan-page` | Scan & analyze sales page for insights | ✅ | ✅ |
| `POST` | `/generate` | Generate email series from benefits/features | ✅ | ✅ |
| `GET` | `/health` | Email service health check | ❌ | ✅ |

### **📊 Usage Tracking Endpoints**
**Blueprint**: `usage_bp`  
**Base Path**: `/api/usage`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| `GET` | `/limits` | Get usage limits & current consumption | ✅ | ✅ |
| `POST` | `/track` | Track token usage for features | ✅ | ✅ |
| `GET` | `/history` | Get usage history with filtering | ✅ | ✅ |
| `GET` | `/health` | Usage service health check | ❌ | ✅ |

### **📚 Content Library Endpoints**
**Blueprint**: `content_library_bp`  
**Base Path**: `/api/content-library`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| `GET` | `/items` | List content items with pagination/filtering | ✅ | ✅ |
| `POST` | `/items` | Create new content library item | ✅ | ✅ |
| `GET` | `/item/{id}` | Get specific content library item | ✅ | ✅ |
| `PUT` | `/item/{id}` | Update content library item | ✅ | ✅ |
| `DELETE` | `/item/{id}` | Delete content library item | ✅ | ✅ |
| `POST` | `/item/{id}/favorite` | Toggle favorite status | ✅ | ✅ |
| `POST` | `/item/{id}/use` | Increment usage count | ✅ | ✅ |
| `GET` | `/stats` | Get user's content library statistics | ✅ | ✅ |
| `GET` | `/search` | Search content library items | ✅ | ✅ |
| `GET` | `/types` | Get available content types | ✅ | ✅ |
| `GET` | `/health` | Content library service health check | ❌ | ✅ |

---

## 🔧 Core Services Map

### **Authentication Service** (`services/auth_service.py`)
- JWT token validation
- User identification
- Mock authentication for development
- `@authenticate_user` decorator

### **AI Service** (`services/ai_service.py`)
- Claude API integration (Anthropic)
- OpenAI API integration
- Content generation management
- Model switching capabilities

### **Cache Service** (`services/cache_service.py`)
- Video transcript caching (30-day retention)
- Performance optimization
- Cache statistics tracking
- Memory management

### **Usage Tracking Service** (`services/usage_tracking.py`)
- Token consumption tracking
- Daily/monthly limits enforcement
- Feature usage analytics
- Rate limiting support

### **Content Library Service** (`services/content_library.py`)
- Cross-tool content management
- Auto-save functionality
- Search & filtering
- Statistics & analytics

### **Page Analyzer Service** (`services/page_analyzer.py`)
- Web page content extraction
- Benefits/features analysis
- Content summarization
- SEO insights

---

## 🗄️ Data Models Map

### **Request Models** (`database/models.py`)
- `VideoRequest` - Video processing parameters
- `PageScanRequest` - Page analysis parameters
- `EmailGenerationRequest` - Email series generation
- `UsageTrackingRequest` - Usage tracking data
- `ContentLibraryItem` - Content library items

### **Response Models** (`database/models.py`)
- `StandardResponse` - Base response format
- `VideoTranscriptResponse` - Video processing results
- `PageScanResponse` - Page analysis results
- `EmailGenerationResponse` - Email series data
- `UsageLimitsResponse` - Usage limits & consumption
- `UsageHistoryResponse` - Usage history data
- `ContentLibraryResponse` - Content library listings
- `ContentLibraryItemResponse` - Individual content items
- `ContentLibraryStatsResponse` - Library statistics

---

## 🔒 Security & Configuration

### **Authentication Pattern**
```http
Authorization: Bearer {jwt_token}
```

### **CORS Configuration** (`config/cors_config.py`)
**Allowed Origins**:
- `https://content-marketing-toolkit-8w8d.vercel.app` (Production)
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (Alternative dev)

**Allowed Headers**:
- `Content-Type`
- `Authorization` ✅ **FIXED**
- `Accept`
- `Origin`
- `X-Requested-With`

### **Environment Variables** (`config/settings.py`)
```bash
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
CLAUDE_MODEL=claude-3-haiku-20240307

# Webshare Proxy (Video Processing)
WEBSHARE_PROXY_USERNAME=your_username
WEBSHARE_PROXY_PASSWORD=your_password
WEBSHARE_PROXY_HOST=p.webshare.io
WEBSHARE_PROXY_PORT=80

# CORS & Security
ALLOWED_ORIGINS=https://content-marketing-toolkit-8w8d.vercel.app,http://localhost:5173

# Usage Limits
MONTHLY_TOKEN_LIMIT=100000
DAILY_TOKEN_LIMIT=5000
DAILY_VIDEO_LIMIT=50
CACHE_DURATION_DAYS=30
```

---

## 🚀 Deployment Map

### **Development Environment**
```bash
# Local development
python app.py
# Runs on: http://localhost:5000
```

### **Production Environment**
```bash
# Production deployment
gunicorn app:app
# Environment variables loaded from hosting platform
```

### **Dependencies** (`requirements.txt`)
- `Flask` - Web framework
- `Flask-CORS` - Cross-origin requests
- `supabase` - Database client
- `anthropic` - Claude AI API
- `openai` - OpenAI API
- `pydantic` - Data validation
- `requests` - HTTP requests
- `python-dotenv` - Environment management

---

## 📊 Performance & Monitoring

### **Health Check Endpoints**
- **Main**: `GET /` - Overall system health
- **Video**: `GET /api/video2promo/health`
- **Email**: `GET /api/email-generator/health`
- **Usage**: `GET /api/usage/health`
- **Content Library**: `GET /api/content-library/health`

### **Metrics Tracked**
- API response times
- Cache hit rates
- Token consumption
- Error rates
- User activity

### **Rate Limits**
- **API Calls**: 1000/hour per user
- **Video Processing**: 50/day per user  
- **Token Usage**: 5000/day, 100k/month per user

---

## 📈 Business Logic Flow

### **Video Processing Flow**
1. `POST /api/video2promo/extract-transcript`
2. → `services/cache_service.py` (check cache)
3. → `enhanced_extractor_v3.py` (extract if needed)
4. → `services/content_library.py` (auto-save)
5. → `services/usage_tracking.py` (track usage)

### **Email Generation Flow**
1. `POST /api/email-generator/scan-page`
2. → `services/page_analyzer.py` (analyze page)
3. → `POST /api/email-generator/generate`
4. → `services/ai_service.py` (generate emails)
5. → `services/content_library.py` (auto-save)
6. → `services/usage_tracking.py` (track usage)

### **Content Library Flow**
1. Auto-save from all tools
2. `GET /api/content-library/items` (list & filter)
3. `GET /api/content-library/search` (full-text search)
4. `POST /api/content-library/item/{id}/use` (track usage)

---

## 🔄 Integration Points

### **Frontend Integration**
- **React App**: `https://content-marketing-toolkit-8w8d.vercel.app`
- **API Contract**: 100% backwards compatible
- **Authentication**: JWT tokens from Supabase
- **Real-time**: WebSocket support ready

### **Database Integration**
- **Supabase**: PostgreSQL with real-time features
- **Tables**: Users, videos, content_library, usage_tracking
- **Relationships**: User-centric data model

### **External APIs**
- **YouTube**: Video transcript extraction
- **Anthropic Claude**: AI content generation
- **OpenAI**: Alternative AI generation
- **Webshare**: Rotating proxy service

---

## 📋 Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Total Endpoints** | 21 | ✅ Complete |
| **Blueprints** | 5 | ✅ Complete |
| **Services** | 6 | ✅ Complete |
| **Models** | 15+ | ✅ Complete |
| **Utilities** | 3 | ✅ Complete |
| **Config Files** | 2 | ✅ Complete |

**Code Quality**:
- ✅ Type hints with Pydantic
- ✅ Comprehensive error handling
- ✅ Logging throughout
- ✅ Input validation
- ✅ Security best practices
- ✅ Performance optimization

**Business Features**:
- ✅ Video transcript extraction
- ✅ Email series generation
- ✅ Page analysis
- ✅ Content library management
- ✅ Usage tracking & limits
- ✅ Auto-save functionality

---

*Last Updated: June 2025*  
*Architecture: Modular Flask with Service Layer Pattern*  
*Status: Production Ready 🚀*