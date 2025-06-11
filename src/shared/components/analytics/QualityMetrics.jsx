import React from 'react';
import { 
  BarChart3, 
  Volume2, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Languages,
  Star
} from 'lucide-react';

export const QualityMetrics = ({ 
  metrics = {}, 
  showDetailed = true,
  showRecommendations = true 
}) => {
  // Default metrics structure
  const qualityData = {
    confidence: metrics.confidence || 0,
    audioQuality: metrics.audioQuality || 'unknown',
    wordCount: metrics.wordCount || 0,
    duration: metrics.duration || 0,
    language: metrics.language || 'auto-detected',
    processingTime: metrics.processingTime || 0,
    accuracyScore: metrics.accuracyScore || 0,
    speakerCount: metrics.speakerCount || 1,
    ...metrics
  };

  // Calculate overall quality score
  const calculateOverallScore = () => {
    const factors = [
      qualityData.confidence,
      qualityData.accuracyScore,
      qualityData.audioQuality === 'excellent' ? 1 : 
      qualityData.audioQuality === 'good' ? 0.8 : 
      qualityData.audioQuality === 'fair' ? 0.6 : 0.4
    ].filter(score => score > 0);
    
    return factors.length > 0 ? factors.reduce((a, b) => a + b, 0) / factors.length : 0;
  };

  const overallScore = calculateOverallScore();

  // Quality recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (qualityData.confidence < 0.7) {
      recommendations.push({
        type: 'warning',
        message: 'Lower confidence detected - consider using higher quality audio',
        icon: AlertTriangle
      });
    }
    
    if (qualityData.audioQuality === 'poor') {
      recommendations.push({
        type: 'warning',
        message: 'Audio quality could be improved for better transcription accuracy',
        icon: Volume2
      });
    }
    
    if (qualityData.wordCount < 50) {
      recommendations.push({
        type: 'info',
        message: 'Short content detected - results should be highly accurate',
        icon: MessageSquare
      });
    }
    
    if (qualityData.confidence > 0.9) {
      recommendations.push({
        type: 'success',
        message: 'Excellent confidence score - high accuracy expected',
        icon: CheckCircle
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Quality score color and label
  const getQualityDisplay = (score) => {
    if (score >= 0.9) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Excellent', icon: '🌟' };
    if (score >= 0.8) return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Very Good', icon: '⭐' };
    if (score >= 0.7) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Good', icon: '👍' };
    if (score >= 0.6) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Fair', icon: '⚠️' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Needs Review', icon: '🔍' };
  };

  const qualityDisplay = getQualityDisplay(overallScore);

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      {/* Overall Quality Score */}
      <div className="text-center">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${qualityDisplay.bg}`}>
          <span className="text-lg">{qualityDisplay.icon}</span>
          <span className={`font-semibold ${qualityDisplay.color}`}>
            {qualityDisplay.label} Quality
          </span>
          <span className={`text-sm ${qualityDisplay.color}`}>
            ({Math.round(overallScore * 100)}%)
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Confidence Score */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Confidence</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {Math.round(qualityData.confidence * 100)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${qualityData.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Audio Quality */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Volume2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700">Audio</span>
          </div>
          <div className="text-sm font-bold text-gray-900 capitalize">
            {qualityData.audioQuality}
          </div>
          <div className={`text-xs mt-1 ${
            qualityData.audioQuality === 'excellent' ? 'text-green-600' :
            qualityData.audioQuality === 'good' ? 'text-blue-600' :
            qualityData.audioQuality === 'fair' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {qualityData.audioQuality === 'excellent' ? '🎯 Perfect' :
             qualityData.audioQuality === 'good' ? '✅ Clear' :
             qualityData.audioQuality === 'fair' ? '⚠️ Moderate' : '🔍 Review'}
          </div>
        </div>

        {/* Word Count */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-700">Words</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {qualityData.wordCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {Math.round(qualityData.wordCount / Math.max(qualityData.duration / 60, 1))} WPM
          </div>
        </div>

        {/* Processing Time */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-gray-700">Time</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {qualityData.processingTime}s
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {qualityData.duration > 0 ? 
              `${(qualityData.processingTime / qualityData.duration).toFixed(1)}x speed` : 
              'Processing'
            }
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetailed && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t">
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-xs font-medium text-gray-700">Language</div>
              <div className="text-sm text-gray-900 capitalize">{qualityData.language}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-xs font-medium text-gray-700">Accuracy</div>
              <div className="text-sm text-gray-900">
                {qualityData.accuracyScore ? `${Math.round(qualityData.accuracyScore * 100)}%` : 'Calculating...'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-xs font-medium text-gray-700">Speakers</div>
              <div className="text-sm text-gray-900">{qualityData.speakerCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="pt-3 border-t">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Quality Insights</h5>
          <div className="space-y-2">
            {recommendations.map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <div key={index} className={`flex items-start space-x-2 p-2 rounded-lg ${
                  rec.type === 'success' ? 'bg-green-50 text-green-800' :
                  rec.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityMetrics;