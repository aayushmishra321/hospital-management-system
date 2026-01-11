import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Clock, AlertCircle, Info, DollarSign, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import '../styles/notification-override.css';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'appointment' | 'billing' | 'system' | 'reminder' | 'alert' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  metadata?: any;
}

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count on component mount
  useEffect(() => {
    fetchUnreadCount();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't show error toast for empty notifications
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/stats');
      setUnreadCount(response.data.unread || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'billing': return <DollarSign className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    // High contrast colors for better readability
    if (priority === 'urgent') return 'text-red-700 bg-red-100 border border-red-200';
    if (priority === 'high') return 'text-orange-700 bg-orange-100 border border-orange-200';
    
    switch (type) {
      case 'appointment': return 'text-blue-700 bg-blue-100 border border-blue-200';
      case 'billing': return 'text-green-700 bg-green-100 border border-green-200';
      case 'reminder': return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
      case 'alert': return 'text-red-700 bg-red-100 border border-red-200';
      case 'system': return 'text-purple-700 bg-purple-100 border border-purple-200';
      default: return 'text-gray-700 bg-gray-100 border border-gray-200';
    }
  };

  const getIconBackgroundColor = (type: string, priority: string) => {
    if (priority === 'urgent') return '#fecaca';
    if (priority === 'high') return '#fed7aa';
    
    switch (type) {
      case 'appointment': return '#dbeafe';
      case 'billing': return '#dcfce7';
      case 'reminder': return '#fef3c7';
      case 'alert': return '#fecaca';
      case 'system': return '#e9d5ff';
      default: return '#f3f4f6';
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'urgent') return '#b91c1c';
    if (priority === 'high') return '#c2410c';
    
    switch (type) {
      case 'appointment': return '#1d4ed8';
      case 'billing': return '#047857';
      case 'reminder': return '#a16207';
      case 'alert': return '#b91c1c';
      case 'system': return '#7c3aed';
      default: return '#374151';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div 
          className="notification-dropdown-override absolute right-0 top-full mt-2 w-96 rounded-xl shadow-2xl border border-gray-300 z-50 max-h-96 overflow-hidden" 
          style={{ 
            backgroundColor: '#ffffff',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }}
        >
          {/* Header */}
          <div 
            className="notification-header p-4 border-b border-gray-300" 
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex items-center justify-between">
              <h3 
                className="notification-title text-lg font-bold" 
                style={{ color: '#000000' }}
              >
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="notification-button primary text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                    style={{ 
                      color: '#1d4ed8',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md transition-colors"
                  style={{ 
                    color: '#6b7280',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p 
                className="text-sm mt-1 font-medium"
                style={{ color: '#374151' }}
              >
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div 
            className="max-h-80 overflow-y-auto" 
            style={{ backgroundColor: '#ffffff' }}
          >
            {loading ? (
              <div 
                className="p-8 text-center" 
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p 
                  className="mt-2 font-medium"
                  style={{ color: '#000000' }}
                >
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div 
                className="p-8 text-center" 
                style={{ backgroundColor: '#ffffff' }}
              >
                <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: '#9ca3af' }} />
                <p 
                  className="font-medium"
                  style={{ color: '#000000' }}
                >
                  No notifications yet
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: '#6b7280' }}
                >
                  You'll see important updates here
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item p-4 transition-colors ${!notification.isRead ? 'unread' : ''}`}
                    style={{ 
                      backgroundColor: !notification.isRead ? '#f0f9ff' : '#ffffff',
                      borderLeft: !notification.isRead ? '4px solid #3b82f6' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notification.isRead ? '#f0f9ff' : '#ffffff'}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          backgroundColor: getIconBackgroundColor(notification.type, notification.priority),
                          color: getIconColor(notification.type, notification.priority),
                          border: '1px solid #d1d5db'
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 
                              className="notification-title text-sm font-bold"
                              style={{ color: '#000000' }}
                            >
                              {notification.title}
                            </h4>
                            <p 
                              className="notification-message text-sm mt-1 line-clamp-2"
                              style={{ color: '#1f2937' }}
                            >
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span 
                                className="notification-time text-xs font-medium"
                                style={{ color: '#4b5563' }}
                              >
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {notification.priority === 'urgent' && (
                                <span 
                                  className="text-xs px-2 py-1 rounded-full font-bold shadow-sm"
                                  style={{ 
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff'
                                  }}
                                >
                                  Urgent
                                </span>
                              )}
                              {notification.priority === 'high' && (
                                <span 
                                  className="text-xs px-2 py-1 rounded-full font-bold shadow-sm"
                                  style={{ 
                                    backgroundColor: '#ea580c',
                                    color: '#ffffff'
                                  }}
                                >
                                  High
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-1.5 rounded-md transition-colors"
                                style={{ color: '#6b7280' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#2563eb';
                                  e.currentTarget.style.backgroundColor = '#eff6ff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#6b7280';
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1.5 rounded-md transition-colors"
                              style={{ color: '#6b7280' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#6b7280';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div 
              className="p-3 border-t"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb'
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page if you have one
                  // navigate('/notifications');
                }}
                className="w-full text-center text-sm font-semibold py-1 px-2 rounded-md transition-colors"
                style={{ color: '#2563eb' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}