// src/components/ContentLibrary/ContentAnalytics.jsx
export const ContentAnalytics = ({ items }) => {
  const videoTranscripts = items.filter(i => i.type === 'video_transcript');
  const scannedPages = items.filter(i => i.type === 'scanned_page');
  
  const totalCostSaved = items.reduce((sum, item) => sum + (item.cost_saved || 0), 0);
  const totalUsages = items.reduce((sum, item) => sum + (item.usage_count || 0), 0);
  const mostUsedItem = items.reduce((max, item) => 
    (item.usage_count || 0) > (max.usage_count || 0) ? item : max, items[0]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-gray-900">{items.length}</div>
        <div className="text-sm text-gray-600">Total Items</div>
        <div className="text-xs text-gray-500 mt-1">
          {videoTranscripts.length} videos • {scannedPages.length} pages
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-green-600">${totalCostSaved.toFixed(2)}</div>
        <div className="text-sm text-gray-600">Cost Saved</div>
        <div className="text-xs text-gray-500 mt-1">From reusing content</div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-indigo-600">{totalUsages}</div>
        <div className="text-sm text-gray-600">Total Reuses</div>
        <div className="text-xs text-gray-500 mt-1">Content generations</div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-900 truncate">
          {mostUsedItem?.title || 'No data'}
        </div>
        <div className="text-sm text-gray-600">Most Used</div>
        <div className="text-xs text-gray-500 mt-1">
          {mostUsedItem?.usage_count || 0} times
        </div>
      </div>
    </div>
  );
};
