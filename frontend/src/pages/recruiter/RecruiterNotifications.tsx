import { useState } from 'react';
import { Bell, CheckCircle2, Calendar, Award, Clock } from 'lucide-react';

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Candidate Applied',
      description: 'Aarav Sharma (CGPA 9.2, CSE) applied to "Software Development Engineer". AI Match: 94%.',
      time: '15 minutes ago',
      type: 'application',
      read: false,
    },
    {
      id: '2',
      title: 'Offer Accepted! 🎉',
      description: 'Priya Patel accepted your campus placement offer (12.0 LPA). Onboarding paperwork initiated.',
      time: '2 hours ago',
      type: 'offer',
      read: false,
    },
    {
      id: '3',
      title: 'Interview Slot Confirmed',
      description: 'Rohan Verma confirmed attendance for Technical Round 1 on tomorrow at 3:00 PM.',
      time: '5 hours ago',
      type: 'interview',
      read: true,
    },
    {
      id: '4',
      title: 'Assessment Submissions Ready',
      description: '14 candidates completed the Full Stack Coding Challenge. Scores and logs are now viewable.',
      time: '1 day ago',
      type: 'assessment',
      read: true,
    },
    {
      id: '5',
      title: 'Company Verification Approved',
      description: 'Campus TPO approved your hiring profile for the 2026 Batch Placement Season.',
      time: '2 days ago',
      type: 'tpo',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Recruitment Notifications Center</h2>
          <p style={{ margin: 0 }}>Real-time event feeds for candidate submissions, slot confirmations, and offer acceptances.</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              borderLeft: item.read ? '1px solid var(--surface-border)' : '4px solid var(--primary)',
              background: item.read ? 'rgba(255,255,255,0.02)' : 'rgba(79, 70, 229, 0.08)',
            }}
          >
            <div
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                background: item.type === 'offer' ? 'rgba(16, 185, 129, 0.2)' : item.type === 'interview' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: item.type === 'offer' ? 'var(--secondary)' : item.type === 'interview' ? 'var(--primary)' : '#fde047',
              }}
            >
              {item.type === 'offer' ? <Award size={18} /> : item.type === 'interview' ? <Calendar size={18} /> : item.type === 'assessment' ? <Clock size={18} /> : <Bell size={18} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: item.read ? 500 : 700 }}>
                  {item.title}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
