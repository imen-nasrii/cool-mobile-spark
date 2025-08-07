import { Check } from "lucide-react";

interface StepsIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const StepsIndicator = ({ currentStep, totalSteps, stepTitles }: StepsIndicatorProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex items-center flex-col">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                      ? 'bg-red-500 text-white scale-110' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? <Check size={16} /> : stepNumber}
                </div>
                
                {/* Step Title */}
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                    `}
                  >
                    {stepTitles[index] || `Étape ${stepNumber}`}
                  </p>
                </div>
              </div>
              
              {/* Connection Line */}
              {stepNumber < totalSteps && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};