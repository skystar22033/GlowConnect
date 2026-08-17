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
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, skipping notifications');
        return;
      }

      const res = await axios.get('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ FIX: Check if data is an array
      const data = res.data?.data;
      const notificationsArray = Array.isArray(data) ? data : [];
      
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // ✅ Don't break the app if notifications fail
      setNotifications([]);
      setUnreadCount(0);
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
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      if (!token) return;

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
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      if (!token) return;

      await axios.put('http://localhost:5001/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Toggle sound
  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
    return newState;
  };

  // Test sound
  const testSound = (type = 'notification') => {
    playNotificationSound(type);
  };

  // Socket.io for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
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
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('🔗 Connected to notification socket');
        setIsConnected(true);
      });

      socket.on('new-notification', (data) => {
        console.log('🔔 New notification:', data);
        
        // ✅ Fix: Ensure data is an object
        if (data && typeof data === 'object') {
          setNotifications(prev => {
            const newNotifications = [data, ...prev];
            return newNotifications;
          });
          setUnreadCount(prev => prev + 1);
          playNotificationSound(data.type || 'notification');
          
          toast.info(data.message || 'New notification', {
            position: 'top-right',
            autoClose: 5000,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from notification socket');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.log('⚠️ Socket connection error:', error.message);
        setIsConnected(false);
      });

      setSocket(socket);
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
      isConnected,
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