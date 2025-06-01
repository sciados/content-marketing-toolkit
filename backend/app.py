# app.py - COMPLETE VERSION with Usage API endpoints and Webshare integration
import os
import json
import re
import requests
import logging
import subprocess
import uuid
import tempfile
from datetime import datetime, timedelta
from functools import wraps
from urllib.parse import urlparse, parse_qs

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import openai
from supabase import create_client, Client
import yt_dlp
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET

# UPDATED: Import the new professional extractor with Webshare
from enhanced_extractor_v3 import extract_youtube_transcript_professional

# Initialize Flask app
app = Flask(__name__)

# Environment configuration
app.config['ENV'] = os.getenv('FLASK_ENV', 'production')
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# Logging setup
logging.basicConfig(
    level=logging.INFO if os.getenv('LOG_LEVEL') == 'info' else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# CORS configuration
allowed_origins = [
    'https://content-marketing-toolkit-8w8d.vercel.app',  # Production frontend
    'http://localhost:5173',  # Local development (Vite default)
    'https://aiworkers.onrender.com'  # Your backend URL (for health checks)
]

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

@app.after_request
def after_request(response):
    """Add CORS headers to all responses"""
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None

# Initialize Supabase client with error handling
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def initialize_supabase():
    """Initialize Supabase client safely"""
    try:
        if not SUPABASE_AVAILABLE:
            logger.info("📦 Supabase package not available - running without database")
            return None
            
        if supabase_url and supabase_key:
            client = create_client(supabase_url, supabase_key)
            logger.info("✅ Supabase client initialized successfully")
            return client
        else:
            logger.warning("⚠️ Supabase credentials not found")
            return None
    except Exception as e:
        logger.error(f"❌ Supabase initialization failed: {str(e)}")
        return None

supabase = initialize_supabase()

# Initialize AI clients
anthropic_client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY')) if os.getenv('ANTHROPIC_API_KEY') else None
openai.api_key = os.getenv('OPENAI_API_KEY')

# Cache configuration
CACHE_DURATION_DAYS = int(os.getenv('CACHE_DURATION_DAYS', '30'))  # Default 30 days
MAX_CACHE_SIZE = int(os.getenv('MAX_CACHE_SIZE', '10000'))  # Max cached videos

def authenticate_user(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Skip authentication if Supabase not available (for testing)
            if not supabase:
                logger.warning("⚠️ Skipping authentication - Supabase not available")
                # Create a mock user for testing
                class MockUser:
                    def __init__(self):
                        self.id = "test-user-123"
                        
                request.user = MockUser()
                return f(*args, **kwargs)
            
            # Normal authentication flow
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No token provided'}), 401

            token = auth_header.split(' ')[1]
            
            response = supabase.auth.get_user(token)
            if response.user:
                request.user = response.user
                return f(*args, **kwargs)
            
            return jsonify({'error': 'Invalid token'}), 401
            
        except Exception as e:
            logger.error(f'Authentication error: {str(e)}')
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated_function

# Usage tracking function - FIXED VERSION
def track_usage(user_id, tokens_used, feature):
    """Track token usage for a user - FIXED VERSION with correct schema"""
    try:
        if supabase and user_id:
            # Create usage data with correct column names
            usage_data = {
                'user_id': str(user_id),
                'tokens_used': int(tokens_used),
                'feature_used': str(feature),
                'date': datetime.utcnow().strftime('%Y-%m-%d'),  # DATE format
                'created_at': datetime.utcnow().isoformat()      # TIMESTAMP format
            }
            
            logger.info(f"📊 Tracking usage: {usage_data}")
            
            # Direct insert to usage_tracking table with correct schema
            result = supabase.from_('usage_tracking').insert(usage_data).execute()
            
            if result.data:
                logger.info(f"✅ Usage tracked successfully: {tokens_used} tokens for {feature}")
                return True
            else:
                logger.warning(f"⚠️ Usage tracking may have failed - no data returned")
                return False
                
    except Exception as e:
        logger.error(f'❌ Usage tracking error: {str(e)}')
        
        # If it's a schema error, log the details for debugging
        if 'PGRST204' in str(e) or 'schema cache' in str(e):
            logger.error(f"💾 Database schema error - usage_tracking table may need updates")
            logger.error(f"Expected columns: user_id, tokens_used, feature_used, date, created_at")
            logger.error(f"Attempted to insert: {usage_data if 'usage_data' in locals() else 'N/A'}")
        
        return False

# 🎯 CACHE MANAGEMENT FUNCTIONS

def extract_video_id(url):
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})',
        r'youtube\.com\/watch\?v=([^&\n?#]+)',
        r'youtu\.be\/([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_cached_transcript(video_id):
    """Check if transcript exists in cache - FIXED"""
    try:
        if not supabase:
            logger.warning("❌ Supabase not available for caching")
            return None
            
        logger.info(f"🔍 Checking cache for video: {video_id}")
        
        # FIXED: Use .execute() instead of .single().execute() to avoid PGRST116 error
        result = supabase.from_('video_transcripts').select('*').eq('video_id', video_id).execute()
        
        # Check if we got any results
        if not result.data or len(result.data) == 0:
            logger.info(f"❌ Cache MISS for {video_id}")
            return None
        
        # Get the first (and should be only) result
        transcript_data = result.data[0]
        
        # Check if expired
        created_at = datetime.fromisoformat(transcript_data['created_at'].replace('Z', '+00:00'))
        expiry_date = created_at + timedelta(days=CACHE_DURATION_DAYS)
        
        if datetime.now(created_at.tzinfo) < expiry_date:
            logger.info(f"✅ Cache HIT for {video_id} - Age: {(datetime.now(created_at.tzinfo) - created_at).days} days")
            
            # Update access count
            try:
                supabase.from_('video_transcripts').update({
                    'last_accessed': datetime.utcnow().isoformat(),
                    'access_count': transcript_data['access_count'] + 1
                }).eq('video_id', video_id).execute()
            except Exception as update_error:
                logger.warning(f"Failed to update access count: {str(update_error)}")
            
            return {
                'transcript': transcript_data['transcript'],
                'method': transcript_data['extraction_method'],
                'duration': transcript_data.get('duration', 0),
                'cached': True,
                'cached_at': transcript_data['created_at'],
                'video_title': transcript_data.get('video_title', ''),
                'word_count': transcript_data.get('word_count', 0),
                'cost_saved': transcript_data.get('extraction_cost', 0.06)
            }
        else:
            logger.info(f"⏰ Cache EXPIRED for {video_id} - Removing old entry")
            supabase.from_('video_transcripts').delete().eq('video_id', video_id).execute()
            return None
        
    except Exception as e:
        logger.error(f"❌ Cache check error for {video_id}: {str(e)}")
        return None

# Modify cache_transcript function to include user_id
def cache_transcript(video_id, transcript_data, user_id=None):
    """Save transcript to cache with user association"""
    try:
        if not supabase:
            return False
            
        cache_data = {
            'video_id': video_id,
            'user_id': user_id,  # New field
            'transcript': transcript_data['transcript'],
            'extraction_method': transcript_data['method'],
            'video_title': transcript_data.get('video_title', ''),
            'duration': transcript_data.get('duration', 0),
            'word_count': len(transcript_data['transcript'].split()),
            'character_count': len(transcript_data['transcript']),
            'extraction_cost': transcript_data.get('cost', 0.06),
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=CACHE_DURATION_DAYS)).isoformat()
        }
        
        result = supabase.from_('video_transcripts').upsert(cache_data).execute()
        return bool(result.data)
        
    except Exception as e:
        logger.error(f"Cache save error: {str(e)}")
        return False

def get_cache_stats():
    """Get cache statistics - FIXED VERSION"""
    try:
        if not supabase:
            logger.warning("❌ Supabase not available for cache stats")
            return None
            
        # Simple query to test cache table access
        result = supabase.from_('video_transcripts').select('video_id', count='exact').execute()
        
        # Get basic stats
        total_cached = result.count if result.count is not None else 0
        
        # Get entries for cost calculation
        if total_cached > 0:
            entries_result = supabase.from_('video_transcripts').select('extraction_cost, access_count').execute()
            entries = entries_result.data or []
            
            total_cost_saved = sum(
                entry.get('extraction_cost', 0.06) * max(0, entry.get('access_count', 1) - 1)
                for entry in entries
            )
            
            avg_duration = 0  # We can calculate this later if needed
        else:
            total_cost_saved = 0.0
            avg_duration = 0
        
        stats = {
            'total_cached_videos': total_cached,
            'total_cost_saved': round(total_cost_saved, 2),
            'average_duration': avg_duration,
            'cache_limit': MAX_CACHE_SIZE,
            'cache_duration_days': CACHE_DURATION_DAYS,
            'status': 'available'
        }
        
        logger.info(f"✅ Cache stats retrieved: {total_cached} videos cached")
        return stats
        
    except Exception as e:
        logger.error(f"❌ Cache stats error: {str(e)}")
        return None

# 🎯 AI RESPONSE FUNCTION

def get_ai_response(prompt, model_preference='claude', max_tokens=1000):
    """Get AI response from available models"""
    try:
        # Try Claude first if available and preferred
        if model_preference == 'claude' and anthropic_client:
            response = anthropic_client.messages.create(
                model=os.getenv('CLAUDE_MODEL', 'claude-3-haiku-20240307'),
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text, 'claude'
        
        # Fallback to OpenAI
        elif openai.api_key:
            response = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[
                    {"role": "system", "content": "You are a professional content marketing specialist."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content, 'openai'
        
        else:
            raise Exception("No AI service available")
            
    except Exception as e:
        logger.error(f'AI response error: {str(e)}')
        raise

# 🎯 ROUTES

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint with cache status"""
    cache_stats = get_cache_stats()
    
    return jsonify({
        'message': 'Content Marketing Toolkit API - Webshare Rotating Residential v4.0!',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '4.0.0',  # Updated for Webshare v4.0
        'environment': os.getenv('FLASK_ENV', 'production'),
        'services': {
            'supabase': supabase is not None,
            'claude': anthropic_client is not None,
            'openai': openai.api_key is not None,
            'webshare_rotating': True
        },
        'cache_status': cache_stats or {'status': 'unavailable'},
        'webshare_extraction': {
            'enabled': True,
            'rotating_residential': True,
            'anti_detection': True,
            'success_rate': '95-100%',
            'cost_per_video': '$0.06',
            'cache_duration_days': CACHE_DURATION_DAYS
        },
        'endpoints': [
            'POST /api/video2promo/extract-transcript',  # 🎯 Webshare extraction v4.0
            'GET /api/cache/stats',  # 🎯 Cache statistics
            'POST /api/cache/clear/{video_id}',  # 🎯 Clear specific cache
            'POST /api/generate-content',
            'POST /api/video2promo/analyze-benefits',
            'POST /api/video2promo/generate-assets',
            'GET /api/usage/limits',      # 🎯 Usage limits and current usage
            'POST /api/usage/track',      # 🎯 Manual usage tracking
            'GET /api/usage/history'      # 🎯 Usage history
        ]
    })

@app.route('/api/video2promo/extract-transcript', methods=['POST'])
@authenticate_user
def extract_transcript():
    """Webshare rotating residential transcript extraction v4.0 with caching"""
    try:
        data = request.get_json()
        video_url = data.get('videoUrl')
        force_refresh = data.get('forceRefresh', False)
        
        if not video_url:
            return jsonify({
                'success': False,
                'error': 'Video URL is required'
            }), 400
        
        # Extract video ID
        video_id = extract_video_id(video_url)
        if not video_id:
            return jsonify({
                'success': False,
                'error': 'Invalid YouTube URL'
            }), 400
        
        logger.info(f"🎯 Webshare rotating extraction v4.0 request: {video_id} (force_refresh: {force_refresh})")
        
        # Check cache first (unless force refresh)
        if not force_refresh:
            cached_result = get_cached_transcript(video_id)
            if cached_result:
                logger.info(f"✅ Returning cached transcript for {video_id}")
                
                # Track cache hit (minimal token usage)
                try:
                    track_usage(request.user.id, 5, 'video_transcript_cached')
                except Exception as track_error:
                    logger.warning(f"Usage tracking failed: {str(track_error)}")
                
                return jsonify({
                    'success': True,
                    'transcript': cached_result['transcript'],
                    'method': f"{cached_result['method']} (cached)",
                    'length': len(cached_result['transcript']),
                    'message': f"✅ Cached transcript retrieved (saved ${cached_result['cost_saved']:.2f})",
                    'videoUrl': video_url,
                    'videoId': video_id,
                    'cached': True,
                    'cachedAt': cached_result['cached_at'],
                    'duration': cached_result['duration'],
                    'wordCount': cached_result['word_count'],
                    'characterCount': len(cached_result['transcript']),
                    'costSaved': cached_result['cost_saved']
                })
        
        # UPDATED: Extract using Webshare rotating residential v4.0
        logger.info(f"🎵 Webshare rotating extraction v4.0 for {video_id}")
        transcript, method = extract_youtube_transcript_professional(video_url)
        
        if transcript:
            # Prepare transcript data for caching
            transcript_data = {
                'transcript': transcript,
                'method': method,
                'video_title': '',  # Could be extracted from video metadata
                'duration': 0,  # Could be extracted from video metadata
                'cost': 0.06  # Standard cost estimate
            }
            
            # Cache the result
            cache_success = cache_transcript(video_id, transcript_data)
            
            # Track usage - Fresh extraction
            try:
                track_usage(request.user.id, len(transcript), 'video_transcript_webshare')
            except Exception as track_error:
                logger.warning(f"Usage tracking failed: {str(track_error)}")
            
            return jsonify({
                'success': True,
                'transcript': transcript,
                'method': method,
                'length': len(transcript),
                'message': f'✅ Webshare rotating v4.0 extraction via {method}',
                'videoUrl': video_url,
                'videoId': video_id,
                'cached': False,
                'extractedAt': datetime.utcnow().isoformat(),
                'wordCount': len(transcript.split()),
                'characterCount': len(transcript),
                'version': '4.0-webshare-rotating',
                'cost': 0.06,
                'cacheSaved': cache_success
            })
        else:
            return jsonify({
                'success': False,
                'error': method or 'Webshare rotating extraction v4.0 failed',
                'suggestion': 'Could not extract transcript. Video may be private, age-restricted, or have no speech content.',
                'videoUrl': video_url,
                'videoId': video_id,
                'version': '4.0-webshare-rotating'
            }), 400
            
    except Exception as e:
        logger.error(f"❌ Webshare extraction v4.0 error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Server error during Webshare transcript extraction',
            'details': str(e) if app.config.get('DEBUG') else None,
            'version': '4.0-webshare-rotating'
        }), 500

@app.route('/api/usage/limits', methods=['GET'])
@authenticate_user
def get_usage_limits():
    """Get user's usage limits and current usage"""
    try:
        user_id = request.user.id
        
        if not supabase:
            # Fallback for when Supabase is not available
            return jsonify({
                'success': True,
                'limits': {
                    'monthly_tokens': 100000,
                    'daily_tokens': 5000,
                    'videos_per_day': 50
                },
                'current_usage': {
                    'monthly_tokens_used': 0,
                    'daily_tokens_used': 0,
                    'videos_today': 0
                },
                'remaining': {
                    'monthly_tokens': 100000,
                    'daily_tokens': 5000,
                    'videos_today': 50
                },
                'message': 'Usage tracking unavailable - Supabase not connected'
            })
        
        # Get user's usage data from Supabase
        try:
            # Get current month usage
            current_month = datetime.utcnow().strftime('%Y-%m')
            monthly_result = supabase.rpc('get_monthly_usage', {
                'target_user_id': user_id,
                'target_month': current_month
            }).execute()
            
            monthly_usage = monthly_result.data[0] if monthly_result.data else {'total_tokens': 0}
            
            # Get current day usage
            current_date = datetime.utcnow().strftime('%Y-%m-%d')
            daily_result = supabase.rpc('get_daily_usage', {
                'target_user_id': user_id,
                'target_date': current_date
            }).execute()
            
            daily_usage = daily_result.data[0] if daily_result.data else {'total_tokens': 0, 'video_count': 0}
            
        except Exception as db_error:
            logger.warning(f"Database usage query failed: {str(db_error)}")
            # Return default values if database query fails
            monthly_usage = {'total_tokens': 0}
            daily_usage = {'total_tokens': 0, 'video_count': 0}
        
        # Define limits (you can make these configurable)
        limits = {
            'monthly_tokens': 100000,  # 100k tokens per month
            'daily_tokens': 5000,      # 5k tokens per day
            'videos_per_day': 50       # 50 videos per day
        }
        
        current_usage = {
            'monthly_tokens_used': monthly_usage.get('total_tokens', 0),
            'daily_tokens_used': daily_usage.get('total_tokens', 0),
            'videos_today': daily_usage.get('video_count', 0)
        }
        
        remaining = {
            'monthly_tokens': max(0, limits['monthly_tokens'] - current_usage['monthly_tokens_used']),
            'daily_tokens': max(0, limits['daily_tokens'] - current_usage['daily_tokens_used']),
            'videos_today': max(0, limits['videos_per_day'] - current_usage['videos_today'])
        }
        
        return jsonify({
            'success': True,
            'limits': limits,
            'current_usage': current_usage,
            'remaining': remaining,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Usage limits error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get usage limits',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

@app.route('/api/usage/track', methods=['POST'])
@authenticate_user
def track_usage_endpoint():
    """Track token usage for a user"""
    try:
        data = request.get_json()
        tokens_used = data.get('tokens_used', 0)
        feature = data.get('feature', 'unknown')
        
        user_id = request.user.id
        
        # Track the usage
        track_usage(user_id, tokens_used, feature)
        
        return jsonify({
            'success': True,
            'message': 'Usage tracked successfully',
            'tokens_used': tokens_used,
            'feature': feature,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f'Usage tracking endpoint error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to track usage',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

@app.route('/api/usage/history', methods=['GET'])
@authenticate_user
def get_usage_history():
    """Get user's usage history"""
    try:
        user_id = request.user.id
        days = request.args.get('days', 30, type=int)
        
        if not supabase:
            return jsonify({
                'success': True,
                'history': [],
                'message': 'Usage history unavailable - Supabase not connected'
            })
        
        # Get usage history from Supabase
        try:
            result = supabase.rpc('get_usage_history', {
                'target_user_id': user_id,
                'days_back': days
            }).execute()
            
            history = result.data if result.data else []
            
        except Exception as db_error:
            logger.warning(f"Usage history query failed: {str(db_error)}")
            history = []
        
        return jsonify({
            'success': True,
            'history': history,
            'days': days,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f'Usage history error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get usage history',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

@app.route('/api/cache/stats', methods=['GET'])
def cache_statistics():
    """Get cache statistics"""
    try:
        cache_stats = get_cache_stats()
        
        if cache_stats:
            return jsonify({
                'success': True,
                'cache_stats': cache_stats,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Cache statistics unavailable',
                'message': 'Supabase connection required for cache stats'
            }), 503
            
    except Exception as e:
        logger.error(f'Cache stats error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to get cache statistics',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

@app.route('/api/cache/clear/<video_id>', methods=['POST'])
@authenticate_user
def clear_cache_entry(video_id):
    """Clear specific cache entry"""
    try:
        if not supabase:
            return jsonify({
                'success': False,
                'error': 'Cache management unavailable',
                'message': 'Supabase connection required'
            }), 503
        
        # Delete the specific cache entry
        result = supabase.from_('video_transcripts').delete().eq('video_id', video_id).execute()
        
        if result.data:
            return jsonify({
                'success': True,
                'message': f'Cache cleared for video: {video_id}',
                'video_id': video_id
            })
        else:
            return jsonify({
                'success': False,
                'error': f'No cache entry found for video: {video_id}',
                'video_id': video_id
            }), 404
            
    except Exception as e:
        logger.error(f'Cache clear error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to clear cache entry',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500


@app.route('/api/video2promo/generate-assets', methods=['POST'])
@authenticate_user
def generate_video_assets():
    """Generate marketing assets from video transcript and benefits"""
    try:
        data = request.get_json()
        transcript = data.get('transcript', '')
        benefits = data.get('benefits', [])
        benefit_indices = data.get('benefitIndices', [])
        asset_types = data.get('assetTypes', ['email_series'])
        generate_variants = data.get('generateVariants', False)
        project_data = data.get('project', {})
        
        if not transcript or not benefits:
            return jsonify({
                'success': False,
                'error': 'Transcript and benefits are required'
            }), 400
        
        # Select benefits based on indices
        selected_benefits = []
        for idx in benefit_indices:
            if 0 <= idx < len(benefits):
                selected_benefits.append(benefits[idx])
        
        if not selected_benefits:
            return jsonify({
                'success': False,
                'error': 'No valid benefits selected'
            }), 400
        
        logger.info(f"🎯 Generating {len(asset_types)} asset types for {len(selected_benefits)} benefits")
        
        generated_assets = []
        total_tokens = 0
        
        # Generate assets for each benefit
        for benefit in selected_benefits:
            for asset_type in asset_types:
                try:
                    # Generate the specific asset type
                    if asset_type == 'email_series':
                        asset = generate_email_series_asset(benefit, transcript, project_data)
                    elif asset_type == 'blog_post':
                        asset = generate_blog_post_asset(benefit, transcript, project_data)
                    elif asset_type == 'newsletter':
                        asset = generate_newsletter_asset(benefit, transcript, project_data)
                    else:
                        logger.warning(f"Unknown asset type: {asset_type}")
                        continue
                    
                    if asset:
                        generated_assets.append(asset)
                        total_tokens += asset.get('tokens_used', 0)
                        
                        # Generate variants if requested
                        if generate_variants:
                            variant = generate_asset_variant(asset, benefit, transcript)
                            if variant:
                                generated_assets.append(variant)
                                total_tokens += variant.get('tokens_used', 0)
                
                except Exception as asset_error:
                    logger.error(f"Asset generation error for {asset_type}: {str(asset_error)}")
                    continue
        
        # Track usage
        try:
            track_usage(request.user.id, total_tokens, 'video2promo_assets')
        except Exception as track_error:
            logger.warning(f"Usage tracking failed: {str(track_error)}")
        
        return jsonify({
            'success': True,
            'assets': generated_assets,
            'total_tokens': total_tokens,
            'assets_generated': len(generated_assets),
            'benefits_processed': len(selected_benefits),
            'message': f'Generated {len(generated_assets)} marketing assets'
        })
        
    except Exception as e:
        logger.error(f"❌ Asset generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Asset generation failed',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

def generate_email_series_asset(benefit, transcript, project_data):
    """Generate email series for a specific benefit"""
    try:
        prompt = f"""Create a 3-email marketing sequence focused on this benefit: "{benefit}"

Video Context: {transcript[:2000]}...

Generate 3 distinct emails:
1. Introduction email - introduce the benefit and create curiosity
2. Educational email - explain how this benefit works
3. Action email - strong call to action to take advantage of this benefit

Make each email:
- 150-250 words
- Engaging subject line
- Clear value proposition
- Specific to the benefit mentioned
- Professional but conversational tone

Format as JSON with emails array containing title, subject, and content for each."""

        content, model = get_ai_response(prompt, max_tokens=1500)
        
        # Try to parse as JSON, fallback to structured text
        try:
            import json as json_module
            parsed_content = json_module.loads(content)
            emails = parsed_content.get('emails', [])
        except:
            # Fallback to structured parsing
            emails = parse_email_series_from_text(content)
        
        return {
            'id': str(uuid.uuid4()),
            'type': 'email_series',
            'benefit': benefit,
            'content': emails,
            'model_used': model,
            'tokens_used': len(content),
            'created_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Email series generation error: {str(e)}")
        return None

def generate_blog_post_asset(benefit, transcript, project_data):
    """Generate blog post for a specific benefit"""
    try:
        prompt = f"""Write a comprehensive blog post about this benefit: "{benefit}"

Video Context: {transcript[:2000]}...

Create a 500-800 word blog post with:
- Compelling headline
- Introduction that hooks the reader
- 3-4 main sections explaining the benefit
- Real-world examples or use cases
- Clear call to action
- SEO-optimized structure

Focus specifically on the benefit: "{benefit}"
Make it informative, engaging, and actionable."""

        content, model = get_ai_response(prompt, max_tokens=2000)
        
        return {
            'id': str(uuid.uuid4()),
            'type': 'blog_post',
            'benefit': benefit,
            'content': {
                'title': extract_title_from_content(content),
                'body': content,
                'word_count': len(content.split()),
                'estimated_read_time': f"{len(content.split()) // 200 + 1} min"
            },
            'model_used': model,
            'tokens_used': len(content),
            'created_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Blog post generation error: {str(e)}")
        return None

def generate_newsletter_asset(benefit, transcript, project_data):
    """Generate newsletter blurb for a specific benefit"""
    try:
        prompt = f"""Create a newsletter section about this benefit: "{benefit}"

Video Context: {transcript[:1500]}...

Write a 150-250 word newsletter blurb that:
- Has an attention-grabbing headline
- Explains the benefit clearly and concisely
- Includes social proof or credibility
- Ends with a compelling call to action
- Fits naturally in a newsletter format

Focus on the specific benefit: "{benefit}"
Make it scannable and engaging for newsletter readers."""

        content, model = get_ai_response(prompt, max_tokens=800)
        
        return {
            'id': str(uuid.uuid4()),
            'type': 'newsletter',
            'benefit': benefit,
            'content': {
                'headline': extract_headline_from_content(content),
                'body': content,
                'word_count': len(content.split())
            },
            'model_used': model,
            'tokens_used': len(content),
            'created_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Newsletter generation error: {str(e)}")
        return None

def generate_asset_variant(original_asset, benefit, transcript):
    """Generate A/B variant of an asset"""
    try:
        asset_type = original_asset['type']
        
        if asset_type == 'email_series':
            prompt = f"""Create an alternative version of this email series focusing on: "{benefit}"

Original approach was more educational. Create a variant that is more:
- Emotional and story-driven
- Uses different angles and examples
- Different tone (if original was professional, make this more casual)
- Same structure but completely different content

Generate 3 emails with the same format but different approach."""
        
        elif asset_type == 'blog_post':
            prompt = f"""Create an alternative blog post about: "{benefit}"

Original was informational. Make this variant:
- More personal and story-driven
- Different structure and flow
- Different examples and use cases
- Alternative angle on the same benefit

500-800 words, completely different approach."""
        
        elif asset_type == 'newsletter':
            prompt = f"""Create an alternative newsletter section about: "{benefit}"

Original was benefit-focused. Make this variant:
- More urgency-driven
- Different headline style
- Alternative positioning
- Different call to action approach

150-250 words, completely different angle."""
        
        content, model = get_ai_response(prompt, max_tokens=1500)
        
        # Create variant asset
        variant = dict(original_asset)  # Copy original structure
        variant['id'] = str(uuid.uuid4())
        variant['variant'] = True
        variant['original_id'] = original_asset['id']
        variant['tokens_used'] = len(content)
        variant['created_at'] = datetime.utcnow().isoformat()
        
        # Update content based on type
        if asset_type == 'email_series':
            try:
                import json as json_module
                parsed_content = json_module.loads(content)
                variant['content'] = parsed_content.get('emails', [])
            except:
                variant['content'] = parse_email_series_from_text(content)
        elif asset_type == 'blog_post':
            variant['content'] = {
                'title': extract_title_from_content(content),
                'body': content,
                'word_count': len(content.split()),
                'estimated_read_time': f"{len(content.split()) // 200 + 1} min"
            }
        elif asset_type == 'newsletter':
            variant['content'] = {
                'headline': extract_headline_from_content(content),
                'body': content,
                'word_count': len(content.split())
            }
        
        return variant
        
    except Exception as e:
        logger.error(f"Variant generation error: {str(e)}")
        return None
def save_scanned_page(user_id, url, benefits, features, website_data, keywords, industry):
    """Save scanned page data for reuse"""
    try:
        if not supabase:
            return None
            
        page_data = {
            'user_id': user_id,
            'url': url,
            'title': website_data.get('title', ''),
            'domain': website_data.get('domain', ''),
            'benefits': benefits,
            'features': features,
            'keywords': keywords.split(',') if isinstance(keywords, str) else keywords,
            'industry': industry,
            'word_count': website_data.get('word_count', 0),
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=90)).isoformat()
        }
        
        result = supabase.from_('scanned_pages').insert(page_data).execute()
        
        if result.data:
            return result.data[0]['id']
        return None
        
    except Exception as e:
        logger.error(f"Scanned page save error: {str(e)}")
        return None

# 🎯 EMAIL GENERATOR ENDPOINTS

@app.route('/api/email-generator/scan-page', methods=['POST'])
@authenticate_user
def scan_sales_page():
    """Scan and analyze a sales page for benefits and features"""
    try:
        data = request.get_json()
        url = data.get('url', '')
        keywords = data.get('keywords', '')
        industry = data.get('industry', 'general')
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL is required'
            }), 400
        
        logger.info(f"🔍 Scanning sales page: {url}")
        
        # Extract page content
        page_content = extract_page_content(url)
        if not page_content:
            return jsonify({
                'success': False,
                'error': 'Could not extract page content'
            }), 400
        
        # Analyze page with AI
        benefits, features = analyze_page_content(page_content, keywords, industry)
        
        # Extract basic website data
        website_data = {
            'url': url,
            'title': extract_page_title(page_content),
            'domain': extract_domain_from_url(url),
            'word_count': len(page_content.split()),
            'analyzed_at': datetime.utcnow().isoformat()
        }
        
        # Track usage
        try:
            track_usage(request.user.id, len(page_content) // 4, 'email_page_scan')
        except Exception as track_error:
            logger.warning(f"Usage tracking failed: {str(track_error)}")
        
        return jsonify({
            'success': True,
            'benefits': benefits,
            'features': features,
            'website_data': website_data,
            'message': f'Found {len(benefits)} benefits and {len(features)} features'
        })
        
    except Exception as e:
        logger.error(f"❌ Page scanning error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Page scanning failed',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

@app.route('/api/email-generator/generate', methods=['POST'])
@authenticate_user
def generate_sales_emails():
    """Generate sales email series from analyzed page data"""
    try:
        data = request.get_json()
        benefits = data.get('benefits', [])
        selected_benefits = data.get('selectedBenefits', [])
        website_data = data.get('websiteData', {})
        tone = data.get('tone', 'persuasive')
        industry = data.get('industry', 'general')
        affiliate_link = data.get('affiliateLink', '')
        
        if not benefits or not selected_benefits:
            return jsonify({
                'success': False,
                'error': 'Benefits and selections are required'
            }), 400
        
        # Filter selected benefits
        filtered_benefits = []
        for i, selected in enumerate(selected_benefits):
            if selected and i < len(benefits):
                filtered_benefits.append(benefits[i])
        
        if not filtered_benefits:
            return jsonify({
                'success': False,
                'error': 'No benefits selected'
            }), 400
        
        logger.info(f"📧 Generating emails for {len(filtered_benefits)} benefits")
        
        generated_emails = []
        total_tokens = 0
        
        # Generate email for each selected benefit
        for benefit in filtered_benefits:
            email = generate_sales_email(benefit, website_data, tone, industry, affiliate_link)
            if email:
                generated_emails.append(email)
                total_tokens += email.get('tokens_used', 0)
        
        # Track usage
        try:
            track_usage(request.user.id, total_tokens, 'email_generation')
        except Exception as track_error:
            logger.warning(f"Usage tracking failed: {str(track_error)}")
        
        return jsonify({
            'success': True,
            'emails': generated_emails,
            'total_tokens': total_tokens,
            'emails_generated': len(generated_emails),
            'message': f'Generated {len(generated_emails)} sales emails'
        })
        
    except Exception as e:
        logger.error(f"❌ Email generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Email generation failed',
            'details': str(e) if app.config.get('DEBUG') else None
        }), 500

# 🎯 HELPER FUNCTIONS

def extract_page_content(url):
    """Extract content from a web page"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text[:10000]  # Limit to first 10k characters
        
    except Exception as e:
        logger.error(f"Page extraction error: {str(e)}")
        return None

def analyze_page_content(content, keywords, industry):
    """Analyze page content to extract benefits and features"""
    try:
        prompt = f"""Analyze this sales page content and extract key benefits and features.

Content: {content[:3000]}...

Keywords to focus on: {keywords}
Industry: {industry}

Extract:
1. 5-8 key BENEFITS (what the customer gets/achieves)
2. 5-8 key FEATURES (what the product/service includes)

Focus on:
- Customer outcomes and results
- Pain points being solved
- Competitive advantages
- Unique value propositions

Return as JSON with 'benefits' and 'features' arrays containing strings."""

        response, model = get_ai_response(prompt, max_tokens=1000)
        
        try:
            import json as json_module
            parsed = json_module.loads(response)
            benefits = parsed.get('benefits', [])
            features = parsed.get('features', [])
        except:
            # Fallback parsing
            benefits = extract_list_from_text(response, 'benefit')
            features = extract_list_from_text(response, 'feature')
        
        return benefits[:8], features[:8]  # Limit to 8 each
        
    except Exception as e:
        logger.error(f"Content analysis error: {str(e)}")
        return [], []

def generate_sales_email(benefit, website_data, tone, industry, affiliate_link):
    """Generate a sales email for a specific benefit"""
    try:
        domain = website_data.get('domain', 'the product')
        title = website_data.get('title', 'this solution')
        
        prompt = f"""Write a compelling sales email focused on this benefit: "{benefit}"

Product/Service: {title}
Website: {domain}
Industry: {industry}
Tone: {tone}
Affiliate Link: {affiliate_link}

Create an email that:
- Has an attention-grabbing subject line
- Opens with a relatable problem/pain point
- Explains how this specific benefit solves the problem
- Includes social proof or credibility
- Has a clear call to action
- Is 200-300 words total
- Matches the {tone} tone

Focus specifically on the benefit: "{benefit}"
Make it compelling and conversion-focused."""

        content, model = get_ai_response(prompt, max_tokens=800)
        
        # Extract subject line and body
        lines = content.split('\n')
        subject_line = extract_subject_line(content)
        body = content
        
        return {
            'id': str(uuid.uuid4()),
            'benefit': benefit,
            'subject': subject_line,
            'content': body,
            'tone': tone,
            'industry': industry,
            'model_used': model,
            'tokens_used': len(content),
            'created_at': datetime.utcnow().isoformat(),
            'affiliate_link': affiliate_link
        }
        
    except Exception as e:
        logger.error(f"Sales email generation error: {str(e)}")
        return None

# 🎯 TEXT PARSING UTILITIES

def parse_email_series_from_text(content):
    """Parse email series from AI-generated text"""
    try:
        emails = []
        current_email = {}
        
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if 'email 1' in line.lower() or 'introduction' in line.lower():
                if current_email:
                    emails.append(current_email)
                current_email = {'title': 'Introduction Email', 'subject': '', 'content': ''}
            elif 'email 2' in line.lower() or 'educational' in line.lower():
                if current_email:
                    emails.append(current_email)
                current_email = {'title': 'Educational Email', 'subject': '', 'content': ''}
            elif 'email 3' in line.lower() or 'action' in line.lower():
                if current_email:
                    emails.append(current_email)
                current_email = {'title': 'Action Email', 'subject': '', 'content': ''}
            elif line.startswith('Subject:'):
                current_email['subject'] = line.replace('Subject:', '').strip()
            elif line and current_email:
                current_email['content'] += line + '\n'
        
        if current_email:
            emails.append(current_email)
        
        return emails if emails else [{'title': 'Email Series', 'subject': 'Your Email Series', 'content': content}]
        
    except Exception as e:
        logger.error(f"Email parsing error: {str(e)}")
        return [{'title': 'Email Series', 'subject': 'Your Email Series', 'content': content}]

def extract_title_from_content(content):
    """Extract title from content"""
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line and len(line) < 100:
            return line
    return "Generated Content"

def extract_headline_from_content(content):
    """Extract headline from newsletter content"""
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line and len(line) < 80:
            return line
    return "Newsletter Update"

def extract_subject_line(content):
    """Extract subject line from email content"""
    lines = content.split('\n')
    for line in lines:
        if 'subject:' in line.lower():
            return line.split(':', 1)[1].strip()
    
    # Fallback: use first line if it's short
    first_line = lines[0].strip() if lines else ''
    if len(first_line) < 80:
        return first_line
    
    return "Important Update"

def extract_page_title(content):
    """Extract page title from content"""
    words = content.split()
    if len(words) > 5:
        return ' '.join(words[:10])
    return "Sales Page"

def extract_domain_from_url(url):
    """Extract domain from URL"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc.replace('www.', '')
    except:
        return url

def extract_list_from_text(text, item_type):
    """Extract list items from text"""
    items = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if (item_type.lower() in line.lower() or 
            line.startswith('-') or 
            line.startswith('•') or 
            line.startswith('*') or
            any(line.startswith(f"{i}.") for i in range(1, 20))):
            
            # Clean up the line
            cleaned = re.sub(r'^[-•*\d.)\s]+', '', line).strip()
            if cleaned and len(cleaned) > 10:
                items.append(cleaned)
    
    return items[:8]  # Limit to 8 items

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal server error: {str(error)}')
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong on our end'
    }), 500

# Startup logging
if __name__ == '__main__':
    logger.info(f"🎯 Starting Content Marketing Toolkit API - Webshare Rotating v4.0")
    logger.info(f"Environment: {os.getenv('FLASK_ENV', 'production')}")
    logger.info(f"Debug mode: {app.config['DEBUG']}")
    logger.info(f"Services: Supabase={supabase is not None}, Claude={anthropic_client is not None}, OpenAI={openai.api_key is not None}")
    logger.info(f"🔄 Webshare Rotating Residential v4.0: Success Rate=95-100%, Anti-Detection=Advanced")
    
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])