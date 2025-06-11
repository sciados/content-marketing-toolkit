import React from 'react';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';

export const FormWizard = ({
  steps = [],
  currentStep = 0,
  onStepChange,
  allowSkipSteps = false,
  showProgress = true,
  showStepNumbers = true,
  className = ''
}) => {
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStepData?.isValid !== false;
  const canGoPrevious = currentStep > 0;

  const handleNext = () => {
    if (canGoNext && !isLastStep) {
      onStepChange?.(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (allowSkipSteps || stepIndex <= currentStep) {
      onStepChange?.(stepIndex);
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepIndex, status) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (showStepNumbers) {
      return (
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
          status === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {stepIndex + 1}
        </div>
      );
    }
    return (
      <Circle className={`h-5 w-5 ${
        status === 'current' ? 'text-blue-600' : 'text-gray-300'
      }`} />
    );
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Progress Header */}
      {showProgress && (
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = allowSkipSteps || index <= currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Indicator */}
                  <div 
                    className={`flex items-center space-x-3 ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    onClick={() => isClickable && handleStepClick(index)}
                  >
                    {getStepIcon(index, status)}
                    <div className="min-w-0">
                      <div className={`text-sm font-medium ${
                        status === 'current' ? 'text-blue-900' : 
                        status === 'completed' ? 'text-green-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      {step.description && (
                        <div className={`text-xs ${
                          status === 'current' ? 'text-blue-700' : 
                          status === 'completed' ? 'text-green-700' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      index < currentStep ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Step Content */}
      <div className="p-6">
        {currentStepData?.component}
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              canGoPrevious 
                ? 'text-gray-700 hover:bg-gray-100 border border-gray-300' 
                : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            {/* Step Validation Status */}
            {currentStepData?.isValid === false && (
              <div className="text-sm text-red-600">
                Please complete required fields to continue
              </div>
            )}

            {/* Next/Finish Button */}
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                canGoNext
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{isLastStep ? 'Complete' : 'Next'}</span>
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Step Help Text */}
        {currentStepData?.helpText && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">{currentStepData.helpText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormWizard;