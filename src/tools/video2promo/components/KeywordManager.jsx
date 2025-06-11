// src/components/Video2Promo/KeywordManager.jsx
import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const KeywordManager = ({ keywords = [], onChange, disabled = false }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updated = [...keywords, newKeyword.trim()];
      onChange(updated);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index) => {
    const updated = keywords.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleBulkAdd = (text) => {
    // Split by comma, semicolon, or newline and clean up
    const newKeywords = text
      .split(/[,;\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 0 && !keywords.includes(k));
    
    if (newKeywords.length > 0) {
      onChange([...keywords, ...newKeywords]);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(',') || pastedText.includes(';') || pastedText.includes('\n')) {
      e.preventDefault();
      handleBulkAdd(pastedText);
      setNewKeyword('');
    }
  };

  return (
    <div className="space-y-3">
      <label className="form-label">
        Marketing Keywords
        <span className="text-sm text-neutral-500 ml-2">(Optional)</span>
      </label>
      
      <div className="flex gap-2">
        <Input
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder="Add keyword or paste multiple..."
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddKeyword}
          disabled={disabled || !newKeyword.trim()}
          variant="outline"
          size="sm"
        >
          Add
        </Button>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(index)}
                disabled={disabled}
                className="ml-1 text-primary-600 hover:text-primary-800 disabled:opacity-50 focus:outline-none"
                aria-label={`Remove ${keyword}`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="text-sm text-neutral-500">
        <p>Keywords help focus the AI on your target market and improve content relevance.</p>
        <p className="text-xs mt-1">
          💡 Tip: You can paste multiple keywords separated by commas, semicolons, or line breaks
        </p>
      </div>

      {/* Suggested keywords based on common marketing terms */}
      {keywords.length === 0 && (
        <div className="mt-3">
          <p className="text-xs text-neutral-600 mb-2">Suggested keywords:</p>
          <div className="flex flex-wrap gap-1">
            {['marketing', 'sales', 'conversion', 'leads', 'growth', 'revenue', 'customers', 'business'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange([...keywords, suggestion])}
                disabled={disabled}
                className="px-2 py-1 text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors disabled:opacity-50"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
