import { useState } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';

const EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍', '👏', '💯', '🤩', '😍'];
const API_URL = 'http://localhost:5001/api';

export default function ReactionPicker({ postId, onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const handleReaction = async (emoji) => {
    try {
      const token = localStorage.getItem('glowconnect_token');
      await axios.post(`${API_URL}/reactions/${postId}/reaction`, { emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEmoji(emoji);
      onReact();
      setShowPicker(false);
    } catch (error) {
      console.error('Error reacting:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
        className="flex items-center gap-1 text-text-muted hover:text-bloom transition"
      >
        {selectedEmoji ? (
          <span className="text-xl">{selectedEmoji}</span>
        ) : (
          <Heart className="w-5 h-5" />
        )}
      </button>

      {showPicker && (
        <div
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          className="absolute bottom-full mb-2 bg-surface rounded-xl shadow-lg border border-border p-2 flex gap-1"
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}