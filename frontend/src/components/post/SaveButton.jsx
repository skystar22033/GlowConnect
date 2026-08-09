import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5001/api';

export default function SaveButton({ postId, initialSaved = false }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('glowconnect_token');
      await axios.post(`${API_URL}/posts/${postId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(!saved);
      toast.success(saved ? 'Post unsaved' : 'Post saved');
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="flex items-center gap-1 text-text-muted hover:text-primary transition"
    >
      {saved ? (
        <BookmarkCheck className="w-5 h-5 text-primary fill-current" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
    </button>
  );
}