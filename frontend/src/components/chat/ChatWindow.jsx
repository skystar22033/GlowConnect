import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5001/api';

export default function ChatWindow() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    const token = localStorage.getItem('token');
    const socket = io('http://localhost:5001', {
      auth: { token }
    });
    setSocket(socket);

    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchRecipient();
  }, [userId]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipient = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipient(res.data.data?.user);
    } catch (error) {
      console.error('Error fetching recipient:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/messages`, {
        recipient: userId,
        content: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit via socket
      if (socket) {
        socket.emit('send-message', {
          recipient: userId,
          content: newMessage.trim()
        });
      }

      setMessages(prev => [...prev, res.data.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-surface">
        <Link to="/messages" className="p-2 hover:bg-surface-raised rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="post-avatar">
          {recipient?.profileImage ? (
            <img src={recipient.profileImage} alt={recipient.username} />
          ) : (
            recipient?.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold">{recipient?.fullName || recipient?.username}</p>
          <p className="text-xs text-text-muted">@{recipient?.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-text-muted py-10">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?._id === user._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    isOwn
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-surface-raised text-text-primary rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-border bg-surface">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 input-field"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}