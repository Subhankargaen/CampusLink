import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { FileText, Building, Calendar, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      try {
        const res = await apiClient.get('/applications/my-applications');
        setApplications(res.data || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your applications...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selected':
      case 'offered':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}><CheckCircle2 size={14}/> Offered</span>;
      case 'interviewing':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}><Clock size={14}/> In Interview</span>;
      case 'rejected':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}><XCircle size={14}/> Rejected</span>;
      default:
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}><Clock size={14}/> Under Review</span>;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="text-gradient">My Drive Applications</h2>
        <p>Track real-time progress, interview calls, and offer updates from campus recruiters.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Applications Yet</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            You haven't applied to any placement drives yet. Explore open drives that match your profile.
          </p>
          <Link to="/student/jobs" className="btn btn-primary">
            Explore Placement Drives <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => (
            <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{app.job_title || 'Software Role'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building size={14} /> {app.company_name || 'Hiring Partner'}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                {getStatusBadge(app.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
