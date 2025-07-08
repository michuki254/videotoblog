'use client';

import { useState } from 'react';
import { PromptService } from '../services/promptService';

interface WritingStyleSelectorProps {
  value: string;
  onChange: (style: string) => void;
  className?: string;
}

export default function WritingStyleSelector({ 
  value, 
  onChange, 
  className = "" 
}: WritingStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const writingStyles = PromptService.getAvailableWritingStyles();
  
  const selectedStyle = writingStyles.find(style => style.value === value);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Writing Style
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {selectedStyle?.label || 'Select Style'}
              </div>
              {selectedStyle?.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {selectedStyle.description}
                </div>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
            {writingStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => {
                  onChange(style.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                  value === style.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <div className="font-medium">{style.label}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {style.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 