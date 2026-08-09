import { useState } from 'react';
import { Share2, Link, Twitter, Facebook, Send } from 'lucide-react';

export default function ShareButton({ postId, content }) {
  const [showOptions, setShowOptions] = useState(false);

  const postUrl = `${window.location.origin}/posts/${postId}`;

  const shareOptions = [
    { icon: Link, label: 'Copy Link', action: () => {
      navigator.clipboard.writeText(postUrl);
      toast.success('Link copied!');
    }},
    { icon: Twitter, label: 'Twitter', action: () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}&url=${encodeURIComponent(postUrl)}`);
    }},
    { icon: Facebook, label: 'Facebook', action: () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`);
    }},
    { icon: Send, label: 'WhatsApp', action: () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(content + ' ' + postUrl)}`);
    }},
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-1 text-text-muted hover:text-primary transition"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {showOptions && (
        <div className="absolute bottom-full mb-2 bg-surface rounded-xl shadow-lg border border-border p-2 min-w-[180px]">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => { option.action(); setShowOptions(false); }}
              className="flex items-center gap-2 w-full p-2 hover:bg-surface-raised rounded-lg transition"
            >
              <option.icon className="w-4 h-4" />
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}