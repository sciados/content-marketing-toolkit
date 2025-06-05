import React from 'react';
import { Play, Target, CheckCircle, Sparkles, Zap, Link } from 'lucide-react';

const ImprovedProgress = ({ currentStep, total = 7 }) => {
  const steps = [
    { id: 'input', name: 'Input', icon: Play },
    { id: 'transcript', name: 'Extract', icon: Target },
    { id: 'benefits', name: 'Benefits', icon: CheckCircle },
    { id: 'asset_generation', name: 'Generate', icon: Sparkles },
    { id: 'assets_complete', name: 'Assets', icon: Zap },
    { id: 'email_generation', name: 'Emails', icon: Link },
    { id: 'complete', name: 'Complete', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
        <span className="text-sm text-gray-500">
          Step {currentIndex + 1} of {total}
        </span>
      </div>
      
      <div className="relative">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${isActive
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`
                      mt-2 text-xs font-medium transition-colors
                      ${isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.name}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2 transition-colors duration-300
                      ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImprovedProgress;