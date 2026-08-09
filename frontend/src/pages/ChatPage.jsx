import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Avatar from '../components/common/Avatar';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5001/api';

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Socket connection
    const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
    if (token) {
      import('socket.io-client').then((io) => {
        const socket = io.default('http://localhost:5001', {
          auth: { token },
          transports: ['websocket'],
        });
        setSocket(socket);

        socket.on('new-message', (data) => {
          setMessages(prev => [...prev, data]);
        });

        return () => socket.disconnect();
      });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMessages();
      fetchRecipient();
    }
  }, [userId]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
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
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipient(res.data.data?.user);
    } catch (error) {
      console.error('Error fetching recipient:', error);
      toast.error('User not found');
      navigate('/messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/messages`, {
        recipient: userId,
        content: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newMsg = res.data.data.message;
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      // Emit via socket
      if (socket) {
        socket.emit('send-message', newMsg);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-text-muted">Loading chat...</div>
      </>
    );
  }

  if (!recipient) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-text-muted">User not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-64px)] flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-surface">
          <Link to="/messages" className="p-2 hover:bg-surface-raised rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Avatar 
            src={recipient.profileImage}
            name={recipient.fullName}
            username={recipient.username}
            avatarPreferences={recipient.avatarPreferences}
            size="lg"
          />
          <div className="flex-1">
            <p className="font-semibold">{recipient.fullName || recipient.username}</p>
            <p className="text-xs text-text-muted">@{recipient.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-text-muted py-10">
              <p className="text-3xl mb-3">👋</p>
              <p>No messages yet</p>
              <p className="text-sm">Say hello to {recipient.fullName || recipient.username}!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
              return (
                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${isOwn ? 'bg-primary text-white rounded-br-none' : 'bg-surface-raised text-text-primary rounded-bl-none'}`}>
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
              disabled={!newMessage.trim() || sending}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
}