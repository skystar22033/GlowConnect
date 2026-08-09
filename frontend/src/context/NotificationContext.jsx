import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import soundManager from '../utils/soundManager';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => { 
    try {
      const token = localStorage.getItem('glowconnect_token');
      
      if (!token) return;

      const res = await axios.get('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Play sound based on notification type
  const playNotificationSound = (type) => {
    if (!soundEnabled) return;

    switch (type) {
      case 'like':
        soundManager.play('like');
        break;
      case 'comment':
        soundManager.play('comment');
        break;
      case 'follow':
        soundManager.play('follow');
        break;
      case 'message':
        soundManager.play('message');
        break;
      default:
        soundManager.play('notification');
        break;
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('glowconnect_token');
      await axios.put(`http://localhost:5001/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('glowconnect_token');
      await axios.put('http://localhost:5001/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Toggle sound on/off
  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
    return newState;
  };

  // Test sound - click to test
  const testSound = (type = 'notification') => {
    playNotificationSound(type);
  };

  // Socket.io for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('glowconnect_token');
    if (!token) {
      console.log('⚠️ No token found, skipping socket connection');
      return;
    }

    // Preload sounds
    soundManager.preload();

    // Import socket.io-client
    import('socket.io-client').then((io) => {
      const socket = io.default('http://localhost:5001', {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('🔗 Connected to notification socket');
      });

      socket.on('new-notification', (data) => {
        console.log('🔔 New notification:', data);
        
        // Add to notifications list
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // ✅ Play the sound based on type
        playNotificationSound(data.type);
        
        // Show toast notification
        toast.info(data.message, {
          position: 'top-right',
          autoClose: 5000,
        });
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from notification socket');
      });

      setSocket(socket);

      // Fetch initial notifications
      fetchNotifications();

      return () => {
        socket.disconnect();
      };
    });

  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      playNotificationSound,
      toggleSound,
      soundEnabled,
      testSound,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};