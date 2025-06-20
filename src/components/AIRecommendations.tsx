import React, { useState } from 'react';

interface AIRecommendationsProps {
  tableData: any[];
}

export default function AIRecommendations({ tableData }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendation = async () => {
    setLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const res = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableData }),
      });
      const data = await res.json();
      setAiEnabled(data.aiEnabled);
      setRecommendation(data.recommendation);
    } catch (err) {
      setError('Failed to fetch recommendation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
        onClick={handleGetRecommendation}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Get AI Recommendations'}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {aiEnabled === false && recommendation && (
        <div className="bg-yellow-100 text-yellow-900 p-4 rounded mt-4">{recommendation}</div>
      )}
      {aiEnabled && recommendation && (
        <div className="bg-blue-100 text-blue-900 p-4 rounded mt-4 whitespace-pre-line">{recommendation}</div>
      )}
    </div>
  );
} 