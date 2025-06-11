import React, { useState } from 'react';
import { VideoUrlInput } from './VideoUrlInput';
import { VideoPreview } from './VideoPreview';
import { TranscriptDisplay } from './TranscriptDisplay';
import { VideoAnalytics } from './VideoAnalytics';
import { VideoExport } from './VideoExport';
import { FormWizard } from '../../../shared/components/forms/FormWizard';
import { ProcessingDashboard } from '../../../shared/components/processing/ProcessingDashboard';
import { useVideoProcessing } from '../shared/hooks/useVideoProcessing';

export const Video2PromoWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [videoData, setVideoData] = useState({
    url: '',
    platformInfo: null,
    options: {},
    transcript: null,
    analytics: null
  });

  const {
    isProcessing,
    processVideo,
    error,
    progress,
    result
  } = useVideoProcessing();

  const wizardSteps = [
    {
      id: 'input',
      title: 'Video Input',
      description: 'Enter your video URL and configure options',
      component: (
        <VideoUrlInput
          value={videoData.url}
          onChange={(url, platformInfo) => {
            setVideoData(prev => ({ ...prev, url, platformInfo }));
          }}
          onOptionsChange={(options) => {
            setVideoData(prev => ({ ...prev, options }));
          }}
        />
      ),
      isValid: videoData.url && videoData.platformInfo?.validation?.isValid
    },
    {
      id: 'preview',
      title: 'Video Preview',
      description: 'Review video information and processing options',
      component: (
        <VideoPreview
          url={videoData.url}
          platformInfo={videoData.platformInfo}
          options={videoData.options}
          onEdit={() => setCurrentStep(0)}
        />
      ),
      isValid: true
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Extracting and transcribing video content',
      component: (
        <ProcessingDashboard
          videoUrl={videoData.url}
          platformInfo={videoData.platformInfo}
          options={videoData.options}
          isProcessing={isProcessing}
          progress={progress}
          error={error}
          onComplete={(transcript, analytics) => {
            setVideoData(prev => ({ 
              ...prev, 
              transcript, 
              analytics 
            }));
            setCurrentStep(3);
          }}
        />
      ),
      isValid: !isProcessing && !error
    },
    {
      id: 'results',
      title: 'Results',
      description: 'View transcript and analytics',
      component: (
        <div className="space-y-6">
          <TranscriptDisplay
            transcript={videoData.transcript}
            metadata={videoData.analytics}
            url={videoData.url}
          />
          <VideoAnalytics
            analytics={videoData.analytics}
            platformInfo={videoData.platformInfo}
          />
        </div>
      ),
      isValid: !!videoData.transcript
    },
    {
      id: 'export',
      title: 'Export',
      description: 'Export and share your content',
      component: (
        <VideoExport
          transcript={videoData.transcript}
          analytics={videoData.analytics}
          videoData={videoData}
        />
      ),
      isValid: true
    }
  ];

  const handleStepChange = async (stepIndex) => {
    // If moving to processing step, start processing
    if (stepIndex === 2 && !isProcessing && !videoData.transcript) {
      try {
        await processVideo({
          url: videoData.url,
          options: videoData.options,
          platformInfo: videoData.platformInfo
        });
      } catch (err) {
        console.error('Processing failed:', err);
      }
    }
    setCurrentStep(stepIndex);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setVideoData({
      url: '',
      platformInfo: null,
      options: {},
      transcript: null,
      analytics: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V2P</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video2Promo</h1>
              <p className="text-gray-600">Transform videos into marketing content</p>
            </div>
          </div>
          
          {videoData.transcript && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Start New Video
              </button>
              <div className="text-sm text-gray-600">
                Processing complete • {videoData.transcript?.split(' ').length || 0} words extracted
              </div>
            </div>
          )}
        </div>

        {/* Wizard Component */}
        <FormWizard
          steps={wizardSteps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          allowSkipSteps={false}
          showProgress={true}
          showStepNumbers={true}
        />
      </div>
    </div>
  );
};

export default Video2PromoWizard;