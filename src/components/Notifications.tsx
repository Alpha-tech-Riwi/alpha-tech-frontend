import { useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '../lib/api';
import { Bell, Battery } from 'lucide-react';

export default function Notifications() {
  console.log('Notifications component rendering...');

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getMyNotifications().then(res => res.data),
    refetchInterval: 30000
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsAPI.getUnreadCount().then(res => res.data),
    refetchInterval: 30000
  });

  console.log('Notifications data:', notifications);
  console.log('Unread count:', unreadCount);
  console.log('Error:', error);

  if (isLoading) return <div>Cargando notificaciones...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Bell size={20} />
          <h3>Notificaciones</h3>
          {unreadCount?.count > 0 && (
            <span className="notification-badge">{unreadCount.count}</span>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications?.length > 0 ? (
          notifications.map((notification: any) => (
            <div key={notification.id} className="notification-item border-l-yellow-500 bg-yellow-50">
              <div className="notification-icon">
                <Battery size={20} />
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="notification-meta">
                  <span className="pet-name">{notification.petName}</span>
                  <span className="priority">{notification.priority}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <p>No hay notificaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}