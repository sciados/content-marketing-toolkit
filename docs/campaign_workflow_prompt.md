# Campaign-Centric Content Creation Platform - Implementation Prompt

## 🎯 PROJECT OVERVIEW

I need to implement a **campaign-centric workflow** for a Content Marketing Toolkit that transforms how users create and manage multi-media content. This represents a major UX evolution from individual tools to organized campaign management.

## 🔄 USER WORKFLOW VISION

### **Current State (Individual Tools):**
```
Login → Dashboard → Choose Tool → Create Content → Done
```

### **New State (Campaign-Centric):**
```
Login → Dashboard → View Campaigns → Select/Create Campaign → Add Input Data → Generate Multi-Media Content
```

## 📋 DETAILED REQUIREMENTS

### **1. ENHANCED DASHBOARD LAYOUT**

#### **Sidebar Updates:**
```
Top Priority Buttons (prominent styling):
┌─────────────────┐
│  📁 Campaigns   │  ← View all campaigns
├─────────────────┤
│ ➕ New Campaign │  ← Create new campaign
└─────────────────┘

Existing navigation below...
```

#### **Main Dashboard Area:**
- **Header**: "My Campaigns" with campaign count and filters
- **Campaign List**: Accordion-style list showing up to 10 latest campaigns
- **Empty State**: Onboarding for first-time users with "Create Your First Campaign"
- **Search/Filter**: Find campaigns by name, date, or content type

### **2. CAMPAIGN LIST COMPONENT**

#### **Accordion Behavior:**
```javascript
Campaign Item (Collapsed):
┌──────────────────────────────────────────────────┐
│ 📊 Black Friday Email Campaign        Nov 15     │
│ 3 input sources • 12 content pieces generated    │
│                                          [▼]     │
└──────────────────────────────────────────────────┘

Campaign Item (Expanded):
┌──────────────────────────────────────────────────┐
│ 📊 Black Friday Email Campaign        Nov 15     │
│ 3 input sources • 12 content pieces generated    │
│                                          [▲]     │
├──────────────────────────────────────────────────┤
│ Description: Holiday promotion campaign with      │
│ YouTube video insights and competitor analysis    │
│                                                   │
│ Input Sources:                                    │
│ • Video Transcript: "Black Friday Strategy"      │
│ • Scanned Page: competitor-blackfriday-2024.com  │
│ • PDF Upload: Q4-marketing-plan.pdf              │
│                                                   │
│ Generated Content: 5 emails, 4 social posts,     │
│ 2 blog drafts, 1 video script                    │
│                                                   │
│              [Open Campaign]                      │
└──────────────────────────────────────────────────┘
```

### **3. CAMPAIGN DETAIL VIEW**

#### **Two-Section Layout:**

**Section 1: Input Data Management**
```
┌─ ADD INPUT DATA ────────────────────────────────┐
│                                                 │
│ [+ YouTube Video] [+ Scan Webpage] [+ Upload]   │
│                                                 │
│ Current Input Sources:                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🎥 Marketing Strategy Video                 │ │
│ │ Duration: 28:45 • Words: 4,250             │ │ 
│ │ [View] [Edit] [Remove]                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🌐 ConvertKit Sales Page                   │ │
│ │ Benefits: 15 • Features: 8                │ │
│ │ [View] [Edit] [Remove]                     │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Section 2: Content Generation Options**
```
┌─ CREATE CONTENT ───────────────────────────────┐
│                                                │
│ 📝 Written Content:                           │
│ [Email Campaign] [Blog Posts] [Social Posts]   │
│ [Video Scripts] [Articles] [Press Release]     │
│                                                │
│ 🖼️ Visual Content:                            │
│ [Social Graphics] [Blog Headers] [Quote Cards] │
│ [Infographics] [Thumbnails] [Ad Creatives]     │
│                                                │
│ 🎬 Video Content:                             │
│ [Short Videos] [Story Videos] [Video Ads]      │
│ [Animated Graphics] [Presentations]            │
│                                                │
│ Generated Content Library:                     │
│ ┌─────────────────────────────────────────────┐│
│ │ [Content items with preview and actions]   ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## 🛠️ TECHNICAL IMPLEMENTATION REQUIREMENTS

### **1. NEW COMPONENTS TO CREATE**

#### **Dashboard Components:**
```javascript
// src/components/Dashboard/
├── CampaignDashboard.jsx         // Main dashboard with campaign list
├── CampaignList.jsx             // Accordion list of campaigns
├── CampaignItem.jsx             // Individual campaign accordion item
├── CampaignCard.jsx             // Expanded campaign details
├── CreateCampaignButton.jsx     // Prominent "New Campaign" button
└── EmptyState.jsx               // First-time user onboarding
```

#### **Campaign Management:**
```javascript
// src/components/Campaigns/
├── CampaignDetail.jsx           // Main campaign detail view
├── InputDataSection.jsx         // Input data management area
├── ContentGenerationSection.jsx // Content creation options
├── InputSourceCard.jsx          // Individual input source display
├── ContentTypeSelector.jsx      // Content type selection grid
├── GeneratedContentGallery.jsx  // Show created content
└── CampaignSettings.jsx         // Campaign metadata and settings
```

#### **Input Data Management:**
```javascript
// src/components/InputData/
├── AddInputModal.jsx            // Modal to choose input type
├── VideoTranscriptUploader.jsx  // YouTube video extraction
├── WebpageScanner.jsx           // Webpage scanning interface
├── FileUploader.jsx             // PDF/document upload
├── InputSourcePreview.jsx       // Preview input data
└── InputDataEditor.jsx          // Edit extracted data
```

### **2. DATA STRUCTURE**

#### **Campaign Schema:**
```javascript
const Campaign = {
  id: 'uuid',
  name: 'string',
  description: 'string',
  created_at: 'timestamp',
  updated_at: 'timestamp',
  user_id: 'uuid',
  input_sources: [
    {
      id: 'uuid',
      type: 'video_transcript | scanned_page | uploaded_file',
      title: 'string',
      content: 'text',
      metadata: {
        duration?: 'string',
        word_count: 'number',
        url?: 'string',
        file_type?: 'string'
      },
      created_at: 'timestamp'
    }
  ],
  generated_content: [
    {
      id: 'uuid',
      type: 'email | blog_post | social_post | image | video',
      title: 'string',
      content: 'text | url',
      format: 'string', // specific format like 'instagram_post', 'tiktok_video'
      created_at: 'timestamp',
      used_input_sources: ['uuid array']
    }
  ],
  settings: {
    brand_guidelines: 'object',
    default_tone: 'string',
    target_audience: 'string'
  }
}
```

### **3. BACKEND API ENDPOINTS**

```python
# Campaign Management
GET    /api/campaigns                    # List user's campaigns
POST   /api/campaigns                    # Create new campaign
GET    /api/campaigns/{id}               # Get campaign details
PUT    /api/campaigns/{id}               # Update campaign
DELETE /api/campaigns/{id}               # Delete campaign

# Input Data Management
POST   /api/campaigns/{id}/input-sources # Add input source to campaign
GET    /api/campaigns/{id}/input-sources # List campaign input sources
PUT    /api/input-sources/{id}          # Update input source
DELETE /api/input-sources/{id}          # Remove input source

# Content Generation
POST   /api/campaigns/{id}/generate      # Generate content for campaign
GET    /api/campaigns/{id}/content       # List generated content
PUT    /api/generated-content/{id}       # Update generated content
DELETE /api/generated-content/{id}       # Delete generated content

# Analytics
GET    /api/campaigns/{id}/analytics     # Campaign performance stats
```

### **4. HOOKS TO CREATE**

```javascript
// src/hooks/
├── useCampaigns.js              // Campaign CRUD operations
├── useCampaignDetail.js         // Single campaign management
├── useInputSources.js           // Input data management
├── useContentGeneration.js      // Multi-media content creation
├── useCampaignAnalytics.js      // Campaign performance tracking
└── useCampaignSettings.js       // Campaign configuration
```

## 🎨 UX/UI SPECIFICATIONS

### **1. VISUAL HIERARCHY**

#### **Sidebar Priority:**
- **Campaigns/New Campaign**: Primary buttons with distinct styling
- **Existing navigation**: Secondary styling, grouped below
- **Visual separation**: Clear divider between campaign controls and tools

#### **Dashboard Layout:**
- **Campaign list**: Takes 70% of screen width
- **Quick actions sidebar**: 30% with recent activity, tips, usage stats
- **Responsive design**: Stacks vertically on mobile

### **2. INTERACTION PATTERNS**

#### **Campaign Accordion:**
- **Hover state**: Subtle background change and expand preview
- **Click anywhere**: Expands/collapses the campaign
- **Quick actions**: Edit, duplicate, delete buttons on hover
- **Loading states**: Skeleton loading while fetching details

#### **Content Generation:**
- **Visual grid**: Content types shown as cards with icons
- **Progressive disclosure**: Show options based on available input data
- **Generation feedback**: Progress indicators and success states
- **Preview before save**: Allow editing before adding to campaign

### **3. ONBOARDING FLOW**

#### **First-Time User:**
```
1. Welcome message: "Create your first campaign to get started"
2. Sample campaign: Pre-populated example campaign
3. Guided tour: Highlight key features and workflow
4. Quick start: "Add your first input source" tutorial
```

## 🚀 IMPLEMENTATION PRIORITIES

### **Phase 1: Core Campaign Management (Week 1)**
1. **Database schema** and API endpoints for campaigns
2. **CampaignDashboard** component with basic list
3. **Campaign CRUD** operations (create, view, edit, delete)
4. **Navigation updates** with Campaigns and New Campaign buttons

### **Phase 2: Input Data Integration (Week 2)**
1. **Connect existing tools** (YouTube extractor, page scanner) to campaigns
2. **Input source management** interface
3. **File upload** capability for PDFs and documents
4. **Input data preview** and editing

### **Phase 3: Content Generation Hub (Week 2)**
1. **Content type selection** interface
2. **Generation workflows** for different content types
3. **Content preview** and editing capabilities
4. **Save to campaign** functionality

### **Phase 4: Polish & Advanced Features (Week 1)**
1. **Campaign analytics** and performance tracking
2. **Advanced search** and filtering
3. **Campaign templates** and duplication
4. **Team collaboration** features (if applicable)

## 🎯 SUCCESS CRITERIA

### **User Experience Goals:**
- **Workflow clarity**: Users understand the campaign concept within 30 seconds
- **Efficiency gains**: 50% faster content creation through organized workflow
- **Content organization**: Users can find and reuse content 90% faster
- **Feature adoption**: 80% of users create campaigns within first session

### **Technical Goals:**
- **Performance**: Campaign list loads in <500ms
- **Reliability**: 99.9% uptime for campaign operations
- **Scalability**: Support 1000+ campaigns per user
- **Data integrity**: Zero data loss during campaign operations

## 📋 READY-TO-USE PROMPT

Create a comprehensive campaign-centric workflow for a Content Marketing Toolkit with the following requirements:

**CORE WORKFLOW:**
Users login → see campaign dashboard → create/select campaigns → add input data (videos, webpages, files) → generate multi-media content → manage campaign assets

**KEY COMPONENTS NEEDED:**
1. **Enhanced Dashboard** with prominent Campaigns/New Campaign buttons in sidebar
2. **Campaign List** with accordion-style expandable items showing campaign details
3. **Campaign Detail View** with two sections: input data management and content generation options
4. **Input Data Management** supporting YouTube videos, webpage scanning, and file uploads
5. **Content Generation Hub** for creating written, visual, and video content from campaign inputs

**TECHNICAL REQUIREMENTS:**
- Campaign database schema with input_sources and generated_content relationships
- RESTful API endpoints for campaign CRUD operations
- React components with modern, intuitive UI/UX
- Integration with existing YouTube extraction and webpage scanning tools
- Content generation using Claude API for written content, DALL-E for images, Runway ML for videos

**UX PRIORITIES:**
- Intuitive campaign organization and management
- Clear visual hierarchy with campaigns as primary navigation
- Efficient workflow from input data to content generation
- Professional interface suitable for business users
- Mobile-responsive design

**BUSINESS GOALS:**
- Increase user session duration through organized workflows
- Improve content creation efficiency by 50%
- Drive user retention through valuable campaign organization
- Enable scaling to enterprise customers with complex content needs

The system should feel like a professional campaign management platform while maintaining the simplicity and power of the existing content creation tools. Focus on creating a workflow that transforms scattered content creation into organized, efficient campaign management.

---

**Ready to revolutionize content creation workflows with campaign-centric organization!** 🚀