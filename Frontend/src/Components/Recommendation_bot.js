import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bot, ChevronDown, ChevronUp, Loader, RefreshCw, AlertTriangle } from 'lucide-react';

const AISupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8002/api/llm/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch recommendations`);
      }

      const data = await response.json();
      
      const cleanedRecs = (data.recommendations || [])
        .map((rec) => rec?.trim())
        .filter((rec) => {
            return (
            rec &&
            rec.length > 2 &&
            !/^[\W_]+$/.test(rec) // skip lines like "*", "**", "----"
            );
        })
        .map((rec) =>
            rec
            .replace(/^(\d+[\.\)]|\*|-|•)\s*/, "") // strip "1. ", "* ", etc.
            .replace(/\*+$/, "") // strip trailing "*" or "**"
            .trim()
        );

      setRecommendations(cleanedRecs);
      setExplanation(data.explanation || '');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(error.message);
      setRecommendations([]);
      setExplanation('');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations when bot opens
  useEffect(() => {
    if (isOpen && recommendations.length === 0 && !error) {
      fetchRecommendations();
    }
  }, [isOpen]);

  const formatRecommendation = (rec) => {
    // Remove numbering and bullet points for cleaner display
    return rec.replace(/^[0-9]+\.\s*|^[-*]\s*/, '').trim();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Recommendations Panel */}
      {isOpen && (
        <div className="mb-4 w-[700px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-blue-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Recommendations</h3>
                  <p className="text-xs text-blue-100">Epidemic Load Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchRecommendations}
                  disabled={isLoading}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors disabled:opacity-50"
                  title="Refresh recommendations"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Generating recommendations...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
                <p className="text-red-600 text-sm mb-3">Failed to load recommendations</p>
                <p className="text-xs text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchRecommendations}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : recommendations.length > 0 ? (
              <div>
                {/* Recommendations List */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Bot size={16} className="text-blue-600 mr-2" />
                    Current Recommendations
                  </h4>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {formatRecommendation(rec)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation Section */}
                {explanation && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-800 text-sm">
                        Detailed Explanation
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Last updated: {lastUpdated.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-3">No recommendations available</p>
                <button
                  onClick={fetchRecommendations}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Get Recommendations
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 pb-3 px-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                AI-powered insights for dengue outbreak
              </div>
              <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105 group"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageCircle size={24} />
            {!isOpen && recommendations.length === 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default AISupportBot;