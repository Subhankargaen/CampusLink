import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Video, Calendar, Clock, User, ExternalLink, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      try {
        const res = await apiClient.get('/interviews/my-interviews').catch(() => ({ data: [] }));
        setInterviews(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInterviews();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Interview Management & Virtual Rooms</h2>
          <p style={{ margin: 0 }}>Review upcoming rounds, video meeting links, and candidate evaluation feedback.</p>
        </div>
        <Link to="/recruiter/candidates" className="btn btn-primary">
          <PlusCircle size={16} /> Schedule Candidate
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading interview schedule...</div>
      ) : interviews.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Video size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Scheduled Rounds Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto', color: 'var(--text-secondary)' }}>
            Jump into your Ranked Applicants pool to shortlist candidates and schedule smart conflict-free interview rounds.
          </p>
          <Link to="/recruiter/candidates" className="btn btn-outline">
            Browse Applicants
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {interviews.map((iv) => (
            <div key={iv.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{iv.round_name || 'Technical Round'}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Round #{iv.round_number || 1}</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', fontWeight: 600 }}>
                  {iv.status?.toUpperCase() || 'SCHEDULED'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={15} color="var(--primary)" />
                  <span>Candidate: <strong>{iv.student_name || 'Campus Candidate'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} color="var(--text-secondary)" />
                  <span>{new Date(iv.scheduled_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} color="var(--text-secondary)" />
                  <span>Duration: {iv.duration_minutes || 45} mins</span>
                </div>
              </div>

              {iv.location_or_link && (
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
                  <a 
                    href={iv.location_or_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                  >
                    <Video size={14} /> Join Virtual Room <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
