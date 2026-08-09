import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/navigation/BottomNav';
import Avatar from '../components/common/Avatar';

const API_URL = 'http://localhost:5001/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
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

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.data?.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const filtered = conversations.filter(c =>
    c.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-text-muted">Loading messages...</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-20">
        <h1 className="text-2xl font-bold font-display mb-4">Messages</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search users or conversations..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-text-muted mb-2">Users</p>
            {searchResults.map((result) => (
              <Link
                key={result._id}
                to={`/chat/${result._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition"
                onClick={() => setSearch('')}
              >
                <Avatar 
                  src={result.profileImage}
                  name={result.fullName}
                  username={result.username}
                  avatarPreferences={result.avatarPreferences}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="font-semibold">{result.fullName || result.username}</p>
                  <p className="text-sm text-text-muted">@{result.username}</p>
                </div>
                <button className="btn-primary text-sm py-1 px-3">
                  Message
                </button>
              </Link>
            ))}
          </div>
        )}

        {/* Conversations */}
        {filtered.length === 0 && searchResults.length === 0 ? (
          <div className="card text-center py-12">
            <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No conversations yet</p>
            <p className="text-sm text-text-muted mt-1">Search for users to start chatting!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((conv) => (
              <Link
                key={conv.user._id}
                to={`/chat/${conv.user._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition"
              >
                <Avatar 
                  src={conv.user.profileImage}
                  name={conv.user.fullName}
                  username={conv.user.username}
                  avatarPreferences={conv.user.avatarPreferences}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="font-semibold">{conv.user.fullName || conv.user.username}</p>
                  <p className="text-sm text-text-muted">@{conv.user.username}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-text-muted truncate">{conv.lastMessage.content}</p>
                  )}
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
      <BottomNav />
    </>
  );
}