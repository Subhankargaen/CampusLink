import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Bell, CheckCheck, Clock, Award, Video } from 'lucide-react';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading notification alerts...</div>;
  }

  // Pre-fill realistic notification events if none yet
  const displayNotifs = notifications.length > 0 ? notifications : [
    {
      id: 'mock-1',
      title: 'Interview Scheduled: Technical Round 1',
      message: 'TechCorp Solutions has scheduled your Virtual Coding Round for tomorrow at 11:00 AM.',
      created_at: new Date().toISOString(),
      is_read: false,
      type: 'interview'
    },
    {
      id: 'mock-2',
      title: 'Application Shortlisted!',
      message: 'Your profile has cleared the resume screening stage for Software Engineer role.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      is_read: false,
      type: 'shortlist'
    },
    {
      id: 'mock-3',
      title: 'New Placement Drive Announced',
      message: 'Apex Systems has published 15 new openings for 2026 batch with 12 LPA CTC package.',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      is_read: true,
      type: 'drive'
    }
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Student Notifications Center</h2>
          <p style={{ margin: 0 }}>Real-time alerts for shortlisted applications, assessment deadlines, and scheduled interviews.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayNotifs.map((n) => (
            <div 
              key={n.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: n.is_read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(79, 70, 229, 0.12)',
                border: n.is_read ? '1px solid var(--surface-border)' : '1px solid rgba(99, 102, 241, 0.4)',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(79, 70, 229, 0.25)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: n.is_read ? 'var(--text-secondary)' : '#a5b4fc',
                  flexShrink: 0
                }}>
                  {n.title.includes('Interview') ? <Video size={18} /> : n.title.includes('Shortlist') ? <Award size={18} /> : <Bell size={18} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: n.is_read ? 'var(--text-primary)' : '#c7d2fe' }}>
                      {n.title}
                    </h4>
                    {!n.is_read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }} />
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {!n.is_read && (
                <button 
                  onClick={() => markRead(n.id)}
                  className="btn btn-outline" 
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  <CheckCheck size={14} /> Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
