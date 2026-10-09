import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Briefcase, Building, MapPin, CheckCircle } from 'lucide-react';

export default function StudentJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadJobs() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          apiClient.get('/jobs'),
          apiClient.get('/applications/my-applications').catch(() => ({ data: [] }))
        ]);
        setJobs(jobsRes.data || []);
        const appliedSet = new Set<string>((appsRes.data || []).map((app: any) => app.job_id));
        setAppliedJobs(appliedSet);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    setMessage('');
    try {
      await apiClient.post('/applications', { job_id: jobId });
      setAppliedJobs(new Set([...appliedJobs, jobId]));
      setMessage('Application submitted successfully! AI matching score calculated.');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading placement drives...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="text-gradient">Available Placement Drives & Opportunities</h2>
        <p>Explore open drives with real-time AI eligibility and match ratings.</p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Briefcase size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <p>No active placement drives right now. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job) => {
            const isApplied = appliedJobs.has(job.id);
            return (
              <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', fontWeight: 600 }}>
                      {job.job_type || 'Full Time'}
                    </span>
                    {job.ctc_lpa && (
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
                        ₹{job.ctc_lpa} LPA
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{job.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <Building size={14} /> {job.company?.name || 'Partner Company'}
                    {job.location && <> • <MapPin size={14} /> {job.location}</>}
                  </div>

                  <p style={{ fontSize: '0.875rem', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                </div>

                <div className="mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                  <button
                    className={`btn ${isApplied ? 'btn-outline' : 'btn-primary'}`}
                    style={{ width: '100%' }}
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied || applyingId === job.id}
                  >
                    {isApplied ? (
                      <><CheckCircle size={16} /> Applied</>
                    ) : applyingId === job.id ? (
                      'Submitting...'
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
