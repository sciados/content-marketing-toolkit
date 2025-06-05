// src/pages/ContentLibrary.jsx - UPDATED to use Campaign Manager
import React from 'react';
import CampaignContentLibrary from '../components/ContentLibrary/CampaignContentLibrary';

/**
 * Content Library page that now uses the new Campaign-based organization
 * instead of the old flat content library system
 */
const ContentLibrary = () => {
  return <CampaignContentLibrary />;
};

export default ContentLibrary;