// src/components/Video2Promo/TranscriptDisplay.jsx - UPDATED

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DebugPanel } from './DebugPanel';

export const TranscriptDisplay = ({ 
  transcript, 
  benefits, 
  onExtractBenefits, 
  loading, 
  error,
  debug 
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  // Process transcript for display
  const getTranscriptText = () => {
    if (!transcript) return '';
    
    if (Array.isArray(transcript)) {
      return transcript
        .map(segment => {
          if (typeof segment === 'object' && segment.text) {
            return segment.text;
          }
          return typeof segment === 'string' ? segment : '';
        })
        .filter(text => text.trim())
        .join(' ');
    }
    
    return typeof transcript === 'string' ? transcript : '';
  };

  const transcriptText = getTranscriptText();
  const displayText = showFullTranscript 
    ? transcriptText 
    : transcriptText.substring(0, 500) + (transcriptText.length > 500 ? '...' : '');

  // Check if benefits are real or template/error
  const hasRealBenefits = benefits && benefits.length > 0 && 
    !benefits.some(b => b.category === 'error' || b.source === 'fallback');

  return (
    <div className="space-y-6">
      {/* Transcript Section */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📝 Video Transcript
            </h3>
            <div className="text-sm text-gray-500">
              {transcriptText.split(' ').length} words
            </div>
          </div>
          
          {transcriptText ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displayText}
                </p>
                
                {transcriptText.length > 500 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullTranscript(!showFullTranscript)}
                    className="mt-2"
                  >
                    {showFullTranscript ? 'Show Less' : 'Show Full Transcript'}
                  </Button>
                )}
              </div>
              
              <Button
                onClick={() => onExtractBenefits()}
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Analyzing Content...' : '🔍 Extract Benefits & Selling Points'}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transcript available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Benefits Section */}
      {(benefits && benefits.length > 0) && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                💎 Extracted Benefits & Selling Points
              </h3>
              <div className="flex items-center gap-2">
                {hasRealBenefits ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    ✅ {benefits.length} Benefits Found
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    ⚠️ Extraction Failed
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <p className="text-red-800 font-medium">Analysis Error</p>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExtractBenefits()}
                  className="mt-2"
                >
                  🔄 Retry Analysis
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.id || index}
                  className={`p-4 rounded-lg border ${
                    benefit.category === 'error' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {benefit.title}
                    </h4>
                    <div className="flex gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        benefit.category === 'error' ? 'bg-red-100 text-red-800' :
                        benefit.category === 'proof' ? 'bg-blue-100 text-blue-800' :
                        benefit.category === 'emotional' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {benefit.category}
                      </span>
                      {benefit.strength && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          benefit.strength === 'high' ? 'bg-green-100 text-green-800' :
                          benefit.strength === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {benefit.strength}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    {benefit.description}
                  </p>
                  
                  {benefit.timestamp && (
                    <p className="text-xs text-gray-500 mt-2">
                      📍 ~{benefit.timestamp}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {hasRealBenefits && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">💡</span>
                  <p className="font-medium text-blue-900">Ready for Content Generation</p>
                </div>
                <p className="text-blue-800 text-sm">
                  Great! We've successfully extracted {benefits.length} selling points from your video. 
                  You can now proceed to generate marketing content using these benefits.
                </p>
              </div>
            )}

            {!hasRealBenefits && benefits.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <p className="font-medium text-yellow-900">Analysis Issues</p>
                </div>
                <p className="text-yellow-800 text-sm mb-3">
                  We had trouble extracting specific benefits from this video. This could be because:
                </p>
                <ul className="text-yellow-800 text-sm space-y-1 ml-4">
                  <li>• The video doesn't clearly discuss specific benefits or features</li>
                  <li>• The transcript quality is poor or incomplete</li>
                  <li>• The content is more informational than promotional</li>
                  <li>• There was an AI processing error</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExtractBenefits()}
                  >
                    🔄 Try Again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://www.youtube.com/results?search_query=product+review+benefits', '_blank')}
                  >
                    📝 Tips for Better Videos
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Debug Panel - Only in development */}
      <DebugPanel 
        transcript={transcript}
        benefits={benefits}
        debug={debug}
        error={error}
      />
    </div>
  );
};
