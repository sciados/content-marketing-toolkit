// src/components/Video2Promo/ToneSelector.jsx
import React from 'react';
import { Select } from '../ui/Select';

const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly & Conversational' },
  { value: 'professional', label: 'Professional & Trustworthy' },
  { value: 'urgent', label: 'Urgent & Action-Oriented' },
  { value: 'educational', label: 'Educational & Informative' },
  { value: 'persuasive', label: 'Persuasive & Compelling' }
];

export const ToneSelector = ({ value = 'friendly', onChange, disabled = false }) => {
  return (
    <div>
      <label className="form-label">Content Tone</label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        options={TONE_OPTIONS}
      />
      <p className="mt-1 text-sm text-neutral-500">
        Choose the tone that best fits your audience and campaign goals.
      </p>
    </div>
  );
};
