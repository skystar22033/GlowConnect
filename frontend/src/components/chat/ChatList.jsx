import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Search } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

export default function ChatList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.data?.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter(c =>
    c.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-20">
      <h1 className="text-2xl font-bold font-display mb-4">Messages</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No conversations yet</p>
          <Link to="/search" className="btn-primary mt-3 inline-block text-sm">
            Find People
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link
              key={conv.user._id}
              to={`/chat/${conv.user._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition-all duration-300"
            >
              <div className="post-avatar">
                {conv.user.profileImage ? (
                  <img src={conv.user.profileImage} alt={conv.user.username} />
                ) : (
                  conv.user.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{conv.user.fullName || conv.user.username}</p>
                <p className="text-sm text-text-muted truncate">
                  @{conv.user.username}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-bloom text-white text-xs font-bold px-2 py-1 rounded-full">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}