// src/components/Video2Promo/TranscriptDisplay.jsx
import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Badge } from '../Common/Badge';

export const TranscriptDisplay = ({ 
  project, 
  loading = false,
  onBenefitSelect,
  selectedBenefits = []
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-200 rounded"></div>
            <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
            <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!project?.transcript) {
    return null;
  }

  const truncatedTranscript = project.transcript.length > 500 
    ? project.transcript.substring(0, 500) + '...'
    : project.transcript;

  const toggleBenefitSelection = (index) => {
    if (onBenefitSelect) {
      const isSelected = selectedBenefits.includes(index);
      if (isSelected) {
        onBenefitSelect(selectedBenefits.filter(i => i !== index));
      } else {
        onBenefitSelect([...selectedBenefits, index]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Info */}
      {project.video_title && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Video Information
          </h3>
          <div className="space-y-2">
            <p className="text-gray-700">{project.video_title}</p>
            {project.video_duration && (
              <p className="text-sm text-gray-500">
                Duration: {Math.floor(project.video_duration / 60)}:{(project.video_duration % 60).toString().padStart(2, '0')}
              </p>
            )}
            {project.youtube_url && (
              <div className="flex items-center gap-2">
                <a 
                  href={project.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  View Original Video
                </a>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transcript */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
          <div className="flex items-center gap-2">
            {project.transcript && (
              <Badge variant="secondary" size="sm">
                {project.transcript.split(' ').length} words
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
            >
              {showFullTranscript ? 'Show Less' : 'Show Full'}
            </Button>
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {showFullTranscript ? project.transcript : truncatedTranscript}
          </p>
        </div>
      </Card>

      {/* Extracted Benefits */}
      {project.benefits && project.benefits.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Extracted Benefits
            </h3>
            <Badge variant="success">{project.benefits.length} found</Badge>
          </div>
          
          <div className="space-y-4">
            {project.benefits.map((benefit, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedBenefits.includes(index)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleBenefitSelection(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {benefit.description}
                    </p>
                    {benefit.supporting_text && (
                      <blockquote className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3 mt-2">
                        "{benefit.supporting_text}"
                      </blockquote>
                    )}
                  </div>
                  <div className="flex items-center ml-4">
                    {benefit.confidence && (
                      <Badge 
                        variant={benefit.confidence > 0.7 ? 'success' : 'warning'}
                        size="sm"
                        className="mr-2"
                      >
                        {Math.round(benefit.confidence * 100)}%
                      </Badge>
                    )}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBenefits.includes(index)}
                        onChange={() => toggleBenefitSelection(index)}
                        className="form-checkbox h-4 w-4 text-primary-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {onBenefitSelect && (
            <div className="mt-4 text-sm text-gray-500">
              Select benefits to generate content for. Selected: {selectedBenefits.length}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};