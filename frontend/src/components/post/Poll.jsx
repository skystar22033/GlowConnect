import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5001/api';

export default function Poll({ pollId, question, options, totalVotes }) {
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState(options);
  const [loading, setLoading] = useState(false);

  const handleVote = async (index) => {
    if (voted || loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('glowconnect_token');
      await axios.post(`${API_URL}/polls/${pollId}/vote`, { optionIndex: index }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVoted(true);
      fetchResults();
      toast.success('Vote recorded!');
    } catch (error) {
      toast.error('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_URL}/polls/${pollId}/results`);
      setResults(res.data.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  useEffect(() => {
    if (voted) fetchResults();
  }, [voted]);

  return (
    <div className="mt-3 p-4 bg-surface-raised rounded-xl border border-border">
      <p className="font-semibold text-sm mb-3">{question}</p>
      <div className="space-y-2">
        {results.map((option, index) => (
          <button
            key={index}
            onClick={() => handleVote(index)}
            disabled={voted || loading}
            className="w-full relative overflow-hidden bg-surface rounded-lg p-2 text-left text-sm hover:bg-primary/5 transition"
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-500"
              style={{ width: `${voted ? option.percentage : 0}%` }}
            />
            <div className="relative flex justify-between">
              <span>{option.text}</span>
              {voted && (
                <span className="text-text-muted">{option.votes} votes ({option.percentage}%)</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-2">{totalVotes} total votes</p>
    </div>
  );
}