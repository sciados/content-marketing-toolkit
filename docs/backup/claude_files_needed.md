# Files Claude Needs for Complete Campaign-Centric Implementation

## 📋 **CRITICAL FILES FOR CONTEXT**

### **1. VISION & PLANNING DOCUMENTS**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🔴 CRITICAL | `vision.md` | Multi-Media Creation Engine vision | ✅ Created |
| 🔴 CRITICAL | `final_handover_document.md` | Current system status and Content Library implementation | ✅ Ready |
| 🔴 CRITICAL | `updated_sitemap_v6.md` | Complete system inventory and file locations | ✅ Ready |
| 🔴 CRITICAL | `campaign_workflow_prompt.md` | Campaign-centric workflow requirements | ✅ Created |

### **2. CURRENT SYSTEM ARCHITECTURE**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🟡 HIGH | `src/routes/AppRoutes.jsx` | Current routing structure to understand navigation | ✅ Ready |
| 🟡 HIGH | `src/pages/Dashboard.jsx` | Current dashboard to transform into campaign-centric | ✅ Ready |
| 🟡 HIGH | `src/components/Layout/Sidebar.jsx` | Current sidebar to add Campaigns/New Campaign buttons | ✅ Ready |
| 🟢 MEDIUM | `src/components/Layout/Header.jsx` | Current header for navigation consistency | ✅ Ready |

### **3. EXISTING CONTENT LIBRARY SYSTEM (TO INTEGRATE)**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🟡 HIGH | `src/pages/ContentLibrary.jsx` | Current content library implementation | ✅ Ready |
| 🟡 HIGH | `src/hooks/useContentLibrary.js` | Content management patterns to adapt | ✅ Ready |
| 🟢 MEDIUM | `src/components/ContentLibrary/ContentLibraryCard.jsx` | Card component patterns | ✅ Ready |
| 🟢 MEDIUM | `src/components/ContentLibrary/ContentLibraryGrid.jsx` | Grid layout patterns | ✅ Ready |
| 🟢 MEDIUM | `src/components/ContentLibrary/ContentLibraryFilters.jsx` | Filter patterns for campaigns | ✅ Ready |
| 🟢 MEDIUM | `src/components/ContentLibrary/ContentLibrarySearch.jsx` | Search patterns | ✅ Ready |

### **4. EXISTING TOOL INTEGRATIONS (TO CONNECT TO CAMPAIGNS)**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🟡 HIGH | `src/pages/Video2Promo.jsx` | YouTube extraction tool | ✅ Ready |
| 🟡 HIGH | `src/hooks/useVideo2Promo.js` | Video extraction patterns | ✅ Ready |
| 🟡 HIGH | `src/hooks/useTranscript.js` | Transcript extraction logic | ✅ Ready |
| 🟡 HIGH | `src/pages/SalesPageEmailGenerator.jsx` | Page scanning tool | ✅ Ready |
| 🟡 HIGH | `src/hooks/useEmailGenerator.js` | Email generation patterns | ✅ Ready |

### **5. COMMON COMPONENTS (FOR CONSISTENCY)**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🟡 HIGH | `src/components/Common/Card.jsx` | Card component styling | ✅ Ready |
| 🟡 HIGH | `src/components/Common/Button.jsx` | Button component patterns | ✅ Ready |
| 🟢 MEDIUM | `src/components/Common/Modal.jsx` | Modal patterns for campaign creation | ✅ Ready |
| 🟢 MEDIUM | `src/components/Common/Badge.jsx` | Badge styling for campaign status | ✅ Ready |
| 🟢 MEDIUM | `src/components/Common/Loader.jsx` | Loading states | ✅ Ready |
| 🟢 MEDIUM | `src/components/Common/index.js` | Import patterns | ✅ Ready |

### **6. BACKEND INTEGRATION PATTERNS**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🟢 MEDIUM | `src/hooks/useUsageTracking.js` | API call patterns | ✅ Ready |
| 🟢 MEDIUM | `src/services/supabase/supabaseClient.js` | Database connection patterns | ✅ Ready |
| 🟢 MEDIUM | `src/context/SupabaseProvider.jsx` | Auth context patterns | ✅ Ready |

### **7. STYLING AND CONFIGURATION**
| Priority | File | Purpose | Status |
|----------|------|---------|---------|
| 🟢 LOW | `tailwind.config.js` | Styling configuration | ✅ Ready |
| 🟢 LOW | `package.json` | Dependencies and scripts | ✅ Ready |
| 🟢 LOW | `vite.config.js` | Build configuration | ✅ Ready |

---

## 🎯 **FILES BY IMPLEMENTATION PHASE**

### **Phase 1: Core Campaign Management (Week 1)**

#### **Essential Files (Must Have):**
```
📄 src/routes/AppRoutes.jsx            # Add campaign routes
📄 src/pages/Dashboard.jsx             # Transform to campaign dashboard  
📄 src/components/Layout/Sidebar.jsx   # Add campaign buttons
📄 src/hooks/useContentLibrary.js      # Adapt patterns for campaigns
📄 src/components/Common/Card.jsx      # Campaign card styling
📄 src/components/Common/Button.jsx    # Button component patterns
```

#### **Context Files (Helpful):**
```
📄 final_handover_document.md          # Current system status
📄 updated_sitemap_v6.md              # File structure understanding
📄 campaign_workflow_prompt.md         # Implementation requirements
```

#### **New Components to Create:**
```
📄 src/components/Dashboard/CampaignDashboard.jsx         # Main dashboard
📄 src/components/Dashboard/CampaignList.jsx             # Accordion list
📄 src/components/Dashboard/CampaignItem.jsx             # Individual item
📄 src/components/Dashboard/CampaignCard.jsx             # Expanded details
📄 src/components/Dashboard/CreateCampaignButton.jsx     # New campaign button
📄 src/components/Dashboard/EmptyState.jsx               # First-time onboarding
```

### **Phase 2: Input Data Integration (Week 2)**

#### **Essential Files (Must Have):**
```
📄 src/pages/Video2Promo.jsx           # YouTube extraction integration
📄 src/hooks/useVideo2Promo.js         # Video extraction logic
📄 src/hooks/useTranscript.js          # Transcript processing
📄 src/pages/SalesPageEmailGenerator.jsx # Page scanning integration
📄 src/hooks/useEmailGenerator.js      # Page scanning logic
📄 src/components/Common/Modal.jsx     # Input source modals
```

#### **Context Files (Helpful):**
```
📄 src/services/supabase/supabaseClient.js # Database patterns
📄 src/hooks/useUsageTracking.js       # API call patterns
```

#### **New Components to Create:**
```
📄 src/components/Campaigns/CampaignDetail.jsx           # Main campaign view
📄 src/components/Campaigns/InputDataSection.jsx         # Input management
📄 src/components/Campaigns/InputSourceCard.jsx          # Source display
📄 src/components/InputData/AddInputModal.jsx            # Input type chooser
📄 src/components/InputData/VideoTranscriptUploader.jsx  # Video extraction
📄 src/components/InputData/WebpageScanner.jsx           # Page scanning
📄 src/components/InputData/FileUploader.jsx             # File upload
```

### **Phase 3: Content Generation Hub (Week 2)**

#### **Essential Files (Must Have):**
```
📄 vision.md                           # Multi-media creation vision
📄 src/components/ContentLibrary/ContentLibraryGrid.jsx # Content display
📄 src/components/ContentLibrary/ContentLibraryCard.jsx # Content cards
📄 src/hooks/useContentLibrary.js      # Content management
📄 src/components/Common/Badge.jsx     # Content type badges
```

#### **Context Files (Helpful):**
```
📄 src/hooks/useAssetGeneration.js     # Generation patterns (if exists)
📄 src/components/Video2Promo/AssetGenerator.jsx # Generation UI patterns
```

#### **New Components to Create:**
```
📄 src/components/Campaigns/ContentGenerationSection.jsx # Content creation area
📄 src/components/Campaigns/ContentTypeSelector.jsx      # Type selection grid
📄 src/components/Campaigns/GeneratedContentGallery.jsx  # Content display
📄 src/components/ContentCreation/ContentCreationHub.jsx # Universal interface
📄 src/components/ContentCreation/GenerationInterface.jsx # Generation settings
📄 src/components/ContentCreation/ContentPreview.jsx     # Preview & edit
```

### **Phase 4: Polish & Advanced Features (Week 1)**

#### **Essential Files (Must Have):**
```
📄 src/hooks/useUsageTracking.js       # Analytics patterns
📄 src/components/ContentLibrary/ContentLibraryFilters.jsx # Filter patterns
📄 src/components/ContentLibrary/ContentLibrarySearch.jsx # Search patterns
```

#### **New Components to Create:**
```
📄 src/components/Campaigns/CampaignAnalytics.jsx        # Performance tracking
📄 src/components/Campaigns/CampaignSettings.jsx         # Campaign config
📄 src/components/Dashboard/CampaignTemplates.jsx        # Campaign templates
```

---

## 🚀 **OPTIMAL SHARING STRATEGY**

### **🎯 Option A: Start Small (Recommended)**

#### **Step 1: Essential Context (Share First)**
```
1. 📄 campaign_workflow_prompt.md      # Implementation requirements
2. 📄 vision.md                        # Business vision & technical specs
3. 📄 final_handover_document.md       # Current system status
```

#### **Step 2: Share on Demand**
- Let Claude ask for specific files as needed
- Share files based on Claude's implementation questions
- Provide context as Claude encounters specific integration points

#### **Step 3: Phase-Based Sharing**
- Share Phase 1 files when implementing dashboard
- Share Phase 2 files when implementing input data
- Share Phase 3 files when implementing content generation

### **🔄 Option B: Complete Context**
```
Share all 25+ files at once
↓
Claude has full context but may be overwhelmed
↓ 
Risk of losing focus on campaign implementation
↓
Better for experienced developers who can filter information
```

---

## 📋 **READY-TO-USE CLAUDE SESSION STARTER**

### **Initial Message to Claude:**

```
I need to implement a campaign-centric workflow transformation for my Content Marketing Toolkit. 

VISION: Transform from individual tools to organized campaign management where users:
1. Create campaigns
2. Add input data (YouTube videos, scanned webpages, uploaded files)  
3. Generate multi-media content (written, visual, video) from campaign inputs
4. Manage all content within campaign context

I have 3 critical context files to share first:
1. campaign_workflow_prompt.md - Detailed implementation requirements
2. vision.md - Multi-media creation engine business vision
3. final_handover_document.md - Current system status & what's working

After you review these, I can share specific component files as you need them to understand the existing system structure and implement the campaign workflow.

GOAL: Create a professional campaign management platform that transforms scattered content creation into organized, efficient workflows that drive user retention and business growth.

Ready to start?
```

### **Follow-up Strategy:**
- **When Claude asks about routing**: Share `AppRoutes.jsx` and `Dashboard.jsx`
- **When Claude asks about components**: Share relevant Common component files
- **When Claude asks about Content Library**: Share Content Library component files
- **When Claude asks about tools**: Share Video2Promo and EmailGenerator files
- **When Claude asks about patterns**: Share hook files and API integration examples

---

## 🎯 **SUCCESS CRITERIA FOR IMPLEMENTATION**

### **Phase 1 Complete When:**
- ✅ Dashboard shows campaign list with accordion behavior
- ✅ Sidebar has prominent Campaigns/New Campaign buttons  
- ✅ Users can create, view, edit, and delete campaigns
- ✅ Campaign cards show basic info and expand with details

### **Phase 2 Complete When:**
- ✅ Users can add YouTube videos, scanned pages, and files to campaigns
- ✅ Input sources display with metadata and management options
- ✅ Integration with existing Video2Promo and EmailGenerator tools
- ✅ Input data properly saved and associated with campaigns

### **Phase 3 Complete When:**
- ✅ Content generation hub shows all creation options
- ✅ Users can generate written, visual, and video content from inputs
- ✅ Generated content saves to campaign and displays in gallery
- ✅ Multi-media creation vision fully implemented

### **Phase 4 Complete When:**
- ✅ Campaign analytics show usage and performance metrics
- ✅ Advanced search and filtering work across campaigns
- ✅ Campaign templates and duplication features working
- ✅ Professional, scalable campaign management platform

---

## 📊 **FILE PRIORITY MATRIX**

### **🔴 CRITICAL (Share Immediately)**
Files needed to understand the vision and start implementation:
- `campaign_workflow_prompt.md` - Implementation requirements
- `vision.md` - Business context and technical vision  
- `final_handover_document.md` - Current system status
- `updated_sitemap_v6.md` - Complete system inventory

### **🟡 HIGH (Share When Asked)**
Files needed for core implementation:
- Current system files (Dashboard, Sidebar, AppRoutes)
- Content Library system (for integration patterns)
- Tool integration files (Video2Promo, EmailGenerator)
- Common components (Card, Button, Modal)

### **🟢 MEDIUM (Share As Needed)**
Files for specific features and polish:
- Additional ContentLibrary components
- Backend integration patterns
- Advanced common components

### **🔵 LOW (Reference Only)**
Configuration and setup files:
- Styling configuration
- Build configuration  
- Package dependencies

---

**This file serves as your complete roadmap for sharing files with Claude to implement the campaign-centric transformation efficiently and effectively!** 🚀

---

*Last Updated: May 31, 2025*  
*Version: 1.0*  
*Status: Ready for Implementation*