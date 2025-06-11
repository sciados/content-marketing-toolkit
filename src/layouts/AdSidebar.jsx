// src/components/Layout/AdSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/hooks/useAuth';

const AdSidebar = () => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await useAuth
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'right')
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('slot_number', { ascending: true });

      if (error) throw error;
      
      setAds(data || []);
      
      // Track impressions
      if (data && data.length > 0) {
        const adIds = data.map(ad => ad.id);
        await useAuth.rpc('increment_ad_impressions', { ad_ids: adIds });
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdClick = async (ad) => {
    try {
      // Track the click
      await useAuth.rpc('increment_ad_clicks', { ad_id: ad.id });
      
      // Open the link
      if (ad.link_url) {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const renderAd = (ad) => {
    const backgroundStyle = ad.is_gradient
      ? { background: `linear-gradient(to br, ${ad.gradient_from}, ${ad.gradient_to})` }
      : { backgroundColor: ad.background_color || '#ffffff' };

    const textStyle = { color: ad.text_color || '#000000' };

    switch (ad.ad_type) {
      case 'featured':
        return (
          <div
            key={ad.id}
            className="rounded-lg p-4 text-white relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
            style={backgroundStyle}
            onClick={() => handleAdClick(ad)}
          >
            <div className="relative z-10" style={textStyle}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">Featured</p>
              <h4 className="text-lg font-bold mb-2">{ad.title}</h4>
              {ad.description && (
                <p className="text-sm mb-3 opacity-90">{ad.description}</p>
              )}
              {ad.cta_text && (
                <button className="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
                  {ad.cta_text}
                </button>
              )}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          </div>
        );

      case 'banner':
        return (
          <div
            key={ad.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleAdClick(ad)}
          >
            {ad.image_url ? (
              <img 
                src={ad.image_url} 
                alt={ad.title}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '250px' }}
              />
            ) : (
              <div 
                className="p-4 flex items-center justify-center"
                style={{ 
                  minHeight: ad.size === '160x600' ? '600px' : 
                            ad.size === '300x600' ? '600px' : 
                            ad.size === '336x280' ? '280px' : '250px',
                  ...backgroundStyle 
                }}
              >
                <div className="text-center" style={textStyle}>
                  <h4 className="font-semibold mb-2">{ad.title}</h4>
                  {ad.description && (
                    <p className="text-sm mb-3">{ad.description}</p>
                  )}
                  {ad.cta_text && (
                    <button className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors">
                      {ad.cta_text}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div
            key={ad.id}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={backgroundStyle}
            onClick={() => handleAdClick(ad)}
          >
            <h4 className="font-semibold mb-2" style={textStyle}>{ad.title}</h4>
            {ad.description && (
              <p className="text-sm" style={textStyle}>{ad.description}</p>
            )}
            {ad.cta_text && (
              <a className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">
                {ad.cta_text} →
              </a>
            )}
          </div>
        );

      case 'sponsored':
        return (
          <div key={ad.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sponsored</h4>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleAdClick(ad);
              }}
              className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{ad.title}</p>
              {ad.description && (
                <p className="text-xs text-gray-500 mt-1">{ad.description}</p>
              )}
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <aside className="hidden xl:block w-64 bg-gray-50 border-l border-gray-200">
        <div className="p-4 space-y-4">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden xl:block w-64 bg-gray-50 border-l border-gray-200">
      <div className="p-4 space-y-4">
        {ads.length > 0 ? (
          ads.map(ad => renderAd(ad))
        ) : (
          // Fallback placeholder when no ads
          <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[250px] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <p className="text-sm">Advertisement Space</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdSidebar;
