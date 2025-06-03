# Complete API Endpoints Catalog - Content Marketing Toolkit

## 🏥 HEALTH & SYSTEM ENDPOINTS
**Blueprint**: `health_bp` **Status**: ✅ IMPLEMENTED

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/` | Main health check with comprehensive system status | ❌ No |
| `GET` | `/cache/stats` | Get cache statistics and performance metrics | ❌ No |
| `GET` | `/system/status` | Detailed system status for monitoring | ❌ No |

**Example Response**:
```json
{
  "message": "Content Marketing Toolkit API - Webshare Rotating v4.0",
  "version": "4.0.1",
  "services": { "supabase": true, "claude": true },
  "cache_status": { "total_cached_videos": 150 }
}
```

---

## 🎥 VIDEO PROCESSING ENDPOINTS
**Blueprint**: `video_bp` **Status**: ✅ IMPLEMENTED  
**Prefix**: `/api/video2promo`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/extract-transcript` | Extract YouTube video transcript with Webshare rotating proxies | ✅ Required |
| `POST` | `/analyze-benefits` | Analyze transcript for benefits, features, and insights | ✅ Required |
| `POST` | `/generate-assets` | Generate promotional assets from video transcript | ✅ Required |

**Key Features**:
- Webshare rotating residential proxy integration
- Auto-save to Content Library
- Cache management (30-day retention)
- Usage tracking
- Multiple asset types: social posts, email subjects, blog outlines, ad copy

**Example Request**:
```json
{
  "videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "forceRefresh": false,
  "autoSave": true
}
```

---

## 📧 EMAIL GENERATION ENDPOINTS
**Blueprint**: `email_bp` **Status**: 🔄 MISSING  
**Prefix**: `/api/email-generator`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/scan-page` | Scan and analyze sales page for benefits/features | ✅ Required |
| `POST` | `/generate` | Generate email series from benefits and page data | ✅ Required |

**Planned Features**:
- Web page content extraction
- AI-powered benefit/feature analysis
- Multi-email series generation
- Auto-save to Content Library
- Customizable tone and industry settings

**Example Request Structure**:
```json
{
  "url": "https://example.com/sales-page",
  "keywords": ["efficiency", "automation"],
  "industry": "technology",
  "autoSave": true
}
```

---

## 📊 USAGE TRACKING ENDPOINTS
**Blueprint**: `usage_bp` **Status**: 🔄 MISSING  
**Prefix**: `/api/usage`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/limits` | Get user's usage limits and current consumption | ✅ Required |
| `POST` | `/track` | Track token usage for a specific feature | ✅ Required |
| `GET` | `/history` | Get usage history with filtering options | ✅ Required |

**Planned Features**:
- Monthly/daily token limits (100k/5k default)
- Video processing limits (50/day default)
- Usage analytics and reporting
- Rate limiting enforcement

**Example Response Structure**:
```json
{
  "limits": { "monthly_tokens": 100000, "daily_tokens": 5000 },
  "current_usage": { "monthly_tokens_used": 25000 },
  "remaining": { "monthly_tokens": 75000 }
}
```

---

## 📚 CONTENT LIBRARY ENDPOINTS
**Blueprint**: `content_library_bp` **Status**: 🔄 MISSING  
**Prefix**: `/api/content-library`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/items` | List user's content library items with pagination/filtering | ✅ Required |
| `POST` | `/items` | Create new content library item | ✅ Required |
| `GET` | `/item/{id}` | Get specific content library item | ✅ Required |
| `PUT` | `/item/{id}` | Update content library item | ✅ Required |
| `DELETE` | `/item/{id}` | Delete content library item | ✅ Required |
| `POST` | `/item/{id}/favorite` | Toggle favorite status of item | ✅ Required |
| `POST` | `/item/{id}/use` | Increment usage count for item | ✅ Required |
| `GET` | `/stats` | Get user's content library statistics | ✅ Required |
| `GET` | `/search` | Search content library items | ✅ Required |
| `GET` | `/types` | Get available content types for user | ✅ Required |

**Planned Features**:
- Cross-tool content reuse
- Favorites and usage tracking
- Full-text search capabilities
- Content type categorization
- Auto-save integration from all tools

**Content Types Supported**:
- `video_transcript` - Extracted video transcripts
- `scanned_page` - Analyzed web pages
- `generated_asset` - AI-generated content
- `email_series` - Email campaigns
- `social_posts` - Social media content
- `user_content` - Manually created content

---

## 🔒 AUTHENTICATION PATTERN
**All protected endpoints require**:
```
Authorization: Bearer {jwt_token}
```

**Mock Authentication** (when Supabase unavailable):
- Uses test user: `test-user-123`
- Allows development without database

---

## 📋 REQUEST/RESPONSE PATTERNS

### **Standard Success Response**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* endpoint-specific data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Standard Error Response**:
```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error description",
  "field": "fieldName", // for validation errors
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Validation Error Response**:
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Field validation error",
  "field": "videoUrl",
  "details": { "videoUrl": "Must be a valid YouTube URL" }
}
```

---

## 🌐 CORS CONFIGURATION
**Allowed Origins**:
- `https://content-marketing-toolkit-8w8d.vercel.app` (Production)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev)

**Allowed Headers**:
- `Content-Type`
- `Authorization` ✅ **FIXED** (was previously stripped)
- `Accept`
- `Origin`
- `X-Requested-With`

**Allowed Methods**:
- `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## 📈 ENDPOINT METRICS & LIMITS

### **Rate Limits** (Planned):
- **API Calls**: 1000/hour per user
- **Video Processing**: 50/day per user
- **Token Usage**: 5000/day, 100k/month per user

### **Response Times** (Target):
- **Health checks**: < 100ms
- **Cached transcript**: < 500ms
- **Fresh extraction**: 10-30 seconds
- **AI generation**: 2-10 seconds

### **Cache Performance**:
- **Hit Rate**: 85%+ target
- **Retention**: 30 days
- **Storage**: ~10k videos max

---

## 🚀 DEPLOYMENT ENDPOINTS

### **Production URL**:
```
https://your-api-domain.com/api/
```

### **Development URL**:
```
http://localhost:5000/api/
```

---

## 📊 ENDPOINT SUMMARY

| Category | Endpoints | Status | Priority |
|----------|-----------|--------|----------|
| **Health & System** | 3 | ✅ Complete | ✅ |
| **Video Processing** | 3 | ✅ Complete | ✅ |
| **Email Generation** | 2 | 🔄 Missing | 🔥 High |
| **Usage Tracking** | 3 | 🔄 Missing | 🔥 High |
| **Content Library** | 10 | 🔄 Missing | 🔥 High |
| **TOTAL** | **21** | **6/21 Complete** | **15 Missing** |

### **Implementation Priority**:
1. 🔥 **Email Generation** - Core business feature
2. 🔥 **Content Library** - Cross-tool integration
3. 🔥 **Usage Tracking** - Business metrics & limits

### **Frontend Compatibility**:
✅ **No frontend changes needed** - All existing API contracts preserved