import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Video, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Building } from 'lucide-react';

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      try {
        const res = await apiClient.get('/interviews/my-interviews');
        setInterviews(res.data || []);
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInterviews();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading scheduled interview rounds...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Scheduled Interviews & Slot Acceptance</h2>
        <p>Review round timings, join virtual interview links, and track post-round recruiter feedback.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Video size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Interview Calls</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Once a hiring company shortlists you from the assessment stage and schedules an interview slot, meeting links will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {interviews.map((iv) => (
            <div key={iv.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', fontWeight: 600 }}>
                    Round {iv.round_number}: {iv.round_name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building size={12} /> {iv.company_name}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{iv.job_title || 'Software Engineering Role'}</h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--primary)" /> {new Date(iv.scheduled_at).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="var(--primary)" /> {new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({iv.duration_minutes} mins)
                  </span>
                  {iv.location_or_link && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="var(--secondary)" /> {iv.location_or_link.startsWith('http') ? 'Virtual Meeting' : iv.location_or_link}
                    </span>
                  )}
                </div>

                {iv.feedback && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--surface-border)', fontSize: '0.85rem' }}>
                    <strong>Interviewer Feedback:</strong> {iv.feedback}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                <span style={{ 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  background: iv.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                  color: iv.status === 'completed' ? 'var(--secondary)' : '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  {iv.status === 'completed' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {iv.status ? iv.status.toUpperCase() : 'SCHEDULED'}
                </span>

                {iv.location_or_link && iv.location_or_link.startsWith('http') && iv.status !== 'completed' && (
                  <a 
                    href={iv.location_or_link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                  >
                    <Video size={16} /> Join Video Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
