from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import base64
import tempfile
import logging
from datetime import datetime
import yt_dlp
from pydub import AudioSegment
import requests
from io import BytesIO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class GoogleSTTService:
    def __init__(self):
        self.client = None
        self.chunk_duration = int(os.getenv('GOOGLE_STT_CHUNK_DURATION', '300'))
        self.max_duration = int(os.getenv('GOOGLE_STT_MAX_DURATION', '3600'))
        self.max_parallel = int(os.getenv('GOOGLE_STT_MAX_PARALLEL', '3'))
        
    def _initialize_client(self):
        """Initialize Google Cloud Speech client with proper credential handling"""
        if self.client is not None:
            return self.client
            
        try:
            # Set up credentials from environment variable
            credentials_json = os.getenv('GOOGLE_CLOUD_CREDENTIALS_JSON')
            if credentials_json:
                # Decode base64 if needed
                try:
                    decoded_creds = base64.b64decode(credentials_json).decode('utf-8')
                    credentials_dict = json.loads(decoded_creds)
                except:
                    # If not base64, try direct JSON
                    credentials_dict = json.loads(credentials_json)
                
                # Write credentials to temporary file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    json.dump(credentials_dict, f)
                    creds_file = f.name
                
                # Set environment variable for Google Auth
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = creds_file
            
            # Import and initialize the client
            from google.cloud import speech
            self.client = speech.SpeechClient()
            logger.info("Google Speech client initialized successfully")
            return self.client
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Speech client: {str(e)}")
            raise
        
    def process_audio_chunks(self, audio_chunks, sample_rate=16000):
        """Process multiple audio chunks with smart batching for longer videos"""
        try:
            client = self._initialize_client()
            
            # Configure recognition
            from google.cloud import speech
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=sample_rate,
                language_code="en-US",
                enable_automatic_punctuation=True,
                enable_word_confidence=True,
                enable_word_time_offsets=True,
                model="latest_long"
            )
            
            # Determine batch size based on total chunks
            total_chunks = len(audio_chunks)
            if total_chunks <= 10:
                batch_size = total_chunks  # Process all at once for short videos
            elif total_chunks <= 30:
                batch_size = 5  # Medium videos: process in batches of 5
            else:
                batch_size = 3  # Long videos: smaller batches to manage memory
            
            logger.info(f"Processing {total_chunks} chunks in batches of {batch_size}")
            
            all_results = []
            total_confidence = 0
            total_word_count = 0
            
            # Process chunks in batches
            for batch_start in range(0, total_chunks, batch_size):
                batch_end = min(batch_start + batch_size, total_chunks)
                batch_chunks = audio_chunks[batch_start:batch_end]
                
                logger.info(f"Processing batch {batch_start//batch_size + 1}/{(total_chunks + batch_size - 1)//batch_size} (chunks {batch_start+1}-{batch_end})")
                
                # Process this batch
                batch_results = []
                batch_confidence = 0
                batch_word_count = 0
                
                for i, chunk_data in enumerate(batch_chunks):
                    chunk_index = batch_start + i + 1
                    logger.info(f"Processing chunk {chunk_index}/{total_chunks}")
                    
                    try:
                        audio = speech.RecognitionAudio(content=chunk_data)
                        
                        # Perform recognition
                        response = client.recognize(config=config, audio=audio)
                        
                        # Process results for this chunk
                        for result in response.results:
                            alternative = result.alternatives[0]
                            batch_results.append({
                                'transcript': alternative.transcript,
                                'confidence': alternative.confidence,
                                'chunk_index': chunk_index
                            })
                            
                            # Calculate word confidence for this chunk
                            for word in alternative.words:
                                batch_confidence += word.confidence
                                batch_word_count += 1
                        
                    except Exception as chunk_error:
                        logger.warning(f"Chunk {chunk_index} failed: {str(chunk_error)}")
                        # Continue with other chunks even if one fails
                        continue
                
                # Add batch results to overall results
                all_results.extend(batch_results)
                total_confidence += batch_confidence
                total_word_count += batch_word_count
                
                # Memory cleanup after each batch
                del batch_chunks
                
                # Log batch completion
                batch_transcript_words = sum(len(r['transcript'].split()) for r in batch_results)
                logger.info(f"Batch completed: {len(batch_results)} segments, {batch_transcript_words} words")
            
            # Calculate overall confidence
            overall_confidence = (total_confidence / total_word_count) if total_word_count > 0 else 0
            
            # Combine all transcripts in order
            all_results.sort(key=lambda x: x.get('chunk_index', 0))
            full_transcript = ' '.join([r['transcript'] for r in all_results])
            
            logger.info(f"Processing complete: {len(all_results)} segments, {total_word_count} words, {overall_confidence:.1%} confidence")
            
            return {
                'transcript': full_transcript.strip(),
                'confidence': overall_confidence,
                'word_count': total_word_count,
                'chunks_processed': len(all_results),
                'total_chunks': total_chunks,
                'batch_size_used': batch_size,
                'results': all_results
            }
            
        except Exception as e:
            logger.error(f"STT processing error: {str(e)}")
            raise

# Initialize STT service (but don't create client yet)
stt_service = GoogleSTTService()

def download_and_process_youtube_audio(url, temp_dir):
    """Download YouTube audio directly using yt-dlp and process it"""
    try:
        # Output path for audio file
        audio_output = os.path.join(temp_dir, 'audio.%(ext)s')
        
        # yt-dlp options for best audio extraction
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
            'outtmpl': audio_output,
            'extractaudio': True,
            'audioformat': 'wav',  # Convert to WAV for guaranteed compatibility
            'audioquality': '0',   # Best quality
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '192',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        logger.info("Downloading and extracting audio using yt-dlp...")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Download and extract info
            info = ydl.extract_info(url, download=True)
            duration = info.get('duration', 0)
            
            # Find the downloaded audio file
            audio_file = None
            for file in os.listdir(temp_dir):
                if file.startswith('audio.') and (file.endswith('.wav') or file.endswith('.m4a') or file.endswith('.webm')):
                    audio_file = os.path.join(temp_dir, file)
                    break
            
            if not audio_file or not os.path.exists(audio_file):
                raise Exception("Audio file not found after download")
            
            logger.info(f"Audio downloaded: {audio_file}")
            return audio_file, duration
        
    except Exception as e:
        logger.error(f"Audio download error: {str(e)}")
        raise

def process_audio_file(audio_file_path):
    """Process downloaded audio file with pure ffmpeg - no pydub loading"""
    try:
        logger.info("Analyzing audio file with ffmpeg...")
        
        # Get audio info using ffprobe (no loading into memory)
        original_duration = get_audio_duration_ffprobe(audio_file_path)
        
        logger.info(f"Audio file duration: {original_duration:.0f} seconds")
        
        # Smart duration handling based on video length
        max_duration_seconds = stt_service.max_duration
        
        # For very long videos, use strategic sampling
        if original_duration > 1800:  # 30 minutes
            logger.info("Very long video detected - using strategic sampling")
            return process_long_audio_with_sampling(audio_file_path, original_duration)
        
        # For moderately long videos, use streaming processing
        elif original_duration > 900:  # 15 minutes
            logger.info("Long video detected - using streaming processing")
            return process_audio_streaming(audio_file_path, min(original_duration, max_duration_seconds))
        
        # For shorter videos, still use streaming to be safe
        else:
            logger.info("Short video - using safe streaming processing")
            return process_audio_streaming(audio_file_path, original_duration)
        
    except Exception as e:
        logger.error(f"Audio processing error: {str(e)}")
        raise

def get_audio_duration_ffprobe(audio_file_path):
    """Get audio duration using ffprobe without loading file into memory"""
    try:
        import subprocess
        import json
        
        cmd = [
            'ffprobe', '-v', 'quiet', '-print_format', 'json', 
            '-show_format', '-show_streams', audio_file_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        probe_data = json.loads(result.stdout)
        
        # Get duration from format or stream
        duration = None
        if 'format' in probe_data and 'duration' in probe_data['format']:
            duration = float(probe_data['format']['duration'])
        elif 'streams' in probe_data and len(probe_data['streams']) > 0:
            if 'duration' in probe_data['streams'][0]:
                duration = float(probe_data['streams'][0]['duration'])
        
        if duration is None:
            raise Exception("Could not determine audio duration")
            
        return duration
        
    except Exception as e:
        logger.error(f"Failed to get audio duration: {str(e)}")
        # Fallback: assume reasonable duration
        return 600  # 10 minutes default

def process_audio_streaming(audio_file_path, max_duration_seconds):
    """Pure ffmpeg streaming processing - never loads full file"""
    try:
        import subprocess
        import io
        
        # Use ffmpeg to stream process the audio
        chunk_duration = 30  # 30 seconds per chunk
        chunks = []
        
        logger.info(f"Processing {max_duration_seconds:.0f}s audio in 30s chunks...")
        
        for start_time in range(0, int(max_duration_seconds), chunk_duration):
            end_time = min(start_time + chunk_duration, max_duration_seconds)
            
            # Extract this chunk using ffmpeg directly
            cmd = [
                'ffmpeg', '-i', audio_file_path,
                '-ss', str(start_time),
                '-t', str(end_time - start_time),
                '-ac', '1',  # mono
                '-ar', '16000',  # 16kHz sample rate
                '-f', 's16le',  # Raw 16-bit PCM (for Google Speech API)
                '-'  # output to stdout
            ]
            
            try:
                logger.info(f"Extracting chunk {len(chunks)+1}: {start_time}s-{end_time}s")
                result = subprocess.run(cmd, capture_output=True, check=True)
                
                if result.stdout and len(result.stdout) > 0:
                    # Raw audio data ready for Google Speech API
                    chunks.append(result.stdout)
                    logger.info(f"Chunk {len(chunks)} extracted: {len(result.stdout)} bytes")
                
            except subprocess.CalledProcessError as e:
                logger.warning(f"Failed to extract chunk {start_time}-{end_time}: {e}")
                continue
        
        logger.info(f"Streaming processing complete: {len(chunks)} chunks extracted")
        return chunks
        
    except Exception as e:
        logger.error(f"Streaming processing error: {str(e)}")
        raise

def process_long_audio_with_sampling(audio_file_path, original_duration):
    """Strategic sampling for videos over 30 minutes - pure ffmpeg"""
    try:
        import subprocess
        
        # Take strategic 10-minute samples
        segments = [
            (0, 600),  # First 10 minutes
            (original_duration/2 - 300, original_duration/2 + 300),  # Middle 10 minutes  
            (original_duration - 600, original_duration)  # Last 10 minutes
        ]
        
        chunks = []
        
        for segment_idx, (segment_start, segment_end) in enumerate(segments):
            # Ensure we don't go beyond file duration
            segment_start = max(0, segment_start)
            segment_end = min(original_duration, segment_end)
            
            logger.info(f"Sampling segment {segment_idx+1}/3: {segment_start/60:.1f}min - {segment_end/60:.1f}min")
            
            # Extract segment in 30-second chunks
            for start_time in range(int(segment_start), int(segment_end), 30):
                end_time = min(start_time + 30, segment_end)
                
                cmd = [
                    'ffmpeg', '-i', audio_file_path,
                    '-ss', str(start_time),
                    '-t', str(end_time - start_time),
                    '-ac', '1',  # mono
                    '-ar', '16000',  # 16kHz sample rate
                    '-f', 's16le',  # Raw 16-bit PCM
                    '-'  # output to stdout
                ]
                
                try:
                    result = subprocess.run(cmd, capture_output=True, check=True)
                    
                    if result.stdout and len(result.stdout) > 0:
                        chunks.append(result.stdout)
                        logger.info(f"Sample chunk {len(chunks)} extracted: {start_time}s-{end_time}s")
                
                except subprocess.CalledProcessError as e:
                    logger.warning(f"Failed to extract chunk {start_time}-{end_time}: {e}")
                    continue
        
        logger.info(f"Strategic sampling complete: {len(chunks)} chunks from {original_duration/60:.1f} minute video")
        return chunks
        
    except Exception as e:
        logger.error(f"Strategic sampling error: {str(e)}")
        raise

@app.route('/health-check', methods=['GET'])
def health_check():
    """Health check endpoint for Railway"""
    return jsonify({
        'status': 'healthy',
        'service': 'youtube-processing',
        'timestamp': str(datetime.now()),
        'version': '2.0.0'
    })

@app.route('/status', methods=['GET'])
def status():
    """Detailed status endpoint"""
    return jsonify({
        'service': 'YouTube Processing Service',
        'status': 'operational',
        'features': {
            'youtube_download': True,
            'audio_processing': True,
            'speech_to_text': True,
            'confidence_scoring': True,
            'format_compatibility': True
        },
        'configuration': {
            'chunk_duration': stt_service.chunk_duration,
            'max_duration': stt_service.max_duration,
            'max_parallel': stt_service.max_parallel
        }
    })

@app.route('/test-imports', methods=['GET'])
def test_imports():
    """Test if all required packages can be imported"""
    import_results = {}
    
    # Test basic imports
    try:
        import yt_dlp
        import_results['yt_dlp'] = f"✅ {yt_dlp.version.__version__}"
    except Exception as e:
        import_results['yt_dlp'] = f"❌ {str(e)}"
    
    try:
        from pydub import AudioSegment
        import_results['pydub'] = "✅ Available"
    except Exception as e:
        import_results['pydub'] = f"❌ {str(e)}"
    
    try:
        from google.cloud import speech
        import_results['google_cloud_speech'] = "✅ Available"
    except Exception as e:
        import_results['google_cloud_speech'] = f"❌ {str(e)}"
    
    # Test ffmpeg availability
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        if result.returncode == 0:
            import_results['ffmpeg'] = "✅ Available"
        else:
            import_results['ffmpeg'] = "❌ Not working"
    except Exception as e:
        import_results['ffmpeg'] = f"❌ {str(e)}"
    
    return jsonify({
        'imports': import_results,
        'all_imports_successful': all('✅' in result for result in import_results.values())
    })

@app.route('/test-credentials', methods=['GET'])
def test_credentials():
    """Test Google Cloud credentials"""
    try:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
        credentials_json = os.getenv('GOOGLE_CLOUD_CREDENTIALS_JSON')
        
        if not project_id:
            return jsonify({
                'credentials': 'missing',
                'error': 'GOOGLE_CLOUD_PROJECT_ID not found'
            }), 400
        
        if not credentials_json:
            return jsonify({
                'credentials': 'missing',
                'error': 'GOOGLE_CLOUD_CREDENTIALS_JSON not found'
            }), 400
        
        # Try to parse the JSON and initialize client
        try:
            # Test credential initialization
            client = stt_service._initialize_client()
            
            return jsonify({
                'credentials': 'valid',
                'client_initialized': True,
                'project_id': project_id,
                'status': 'Google Speech client ready'
            })
        except Exception as e:
            return jsonify({
                'credentials': 'invalid',
                'error': str(e)
            }), 500
        
    except Exception as e:
        return jsonify({
            'credentials': 'error',
            'error': str(e)
        }), 500

@app.route('/process-youtube', methods=['POST'])
def process_youtube():
    """Process YouTube video and return transcript with confidence"""
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        url = data['url']
        logger.info(f"Processing YouTube URL: {url}")
        
        # Validate YouTube URL
        if 'youtube.com' not in url and 'youtu.be' not in url:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Download and process video
        with tempfile.TemporaryDirectory() as temp_dir:
            try:
                # Download audio using yt-dlp with proper format handling
                logger.info("Downloading audio using yt-dlp...")
                audio_file, duration = download_and_process_youtube_audio(url, temp_dir)
                
                # Process the downloaded audio file
                logger.info("Processing downloaded audio file...")
                processed_audio_chunks = process_audio_file(audio_file)
                
                # Perform speech-to-text on chunks
                logger.info("Performing speech-to-text on audio chunks...")
                result = stt_service.process_audio_chunks(processed_audio_chunks)
                
                logger.info(f"Processing complete. Confidence: {result['confidence']:.2%}")
                
                return jsonify({
                    'success': True,
                    'transcript': result['transcript'],
                    'confidence': result['confidence'],
                    'word_count': result['word_count'],
                    'chunks_processed': result['chunks_processed'],
                    'processing_service': 'railway-youtube-v2',
                    'url': url,
                    'duration': duration,
                    'status': 'completed'
                })
                
            except Exception as processing_error:
                logger.error(f"Processing error: {str(processing_error)}")
                return jsonify({
                    'success': False,
                    'error': f"Processing failed: {str(processing_error)}",
                    'processing_service': 'railway-youtube-v2',
                    'url': url
                }), 500
        
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        return jsonify({
            'error': str(e),
            'processing_service': 'railway-youtube-v2'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)