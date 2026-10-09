import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Briefcase, PlusCircle, Building, MapPin, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const toggleStatus = async (job: any) => {
    setUpdatingId(job.id);
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await apiClient.put(`/jobs/${job.id}`, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading corporate job postings...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Company Job Postings & Drives</h2>
          <p style={{ margin: 0 }}>Review active job roles, inspect eligibility rules, and toggle candidate accepting status.</p>
        </div>
        <Link to="/recruiter/post-job" className="btn btn-primary">
          <PlusCircle size={18} /> Post New Position
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Briefcase size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Job Descriptions Created Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto', color: 'var(--text-secondary)' }}>
            Publish your first drive requirement. You can type requirements manually or use our instant AI JD Parser.
          </p>
          <Link to="/recruiter/post-job" className="btn btn-primary">
            Create Drive Job
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: job.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: job.status === 'active' ? 'var(--secondary)' : 'var(--danger)', fontWeight: 600 }}>
                      {job.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Batch: {job.required_batch || '2026 Batch'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{job.title}</h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Package Offered</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    ₹{job.ctc_lpa} LPA
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building size={14} /> Location: {job.location || 'Hybrid'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Min CGPA: {job.min_cgpa || 'No Bar'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> Max Backlogs: {job.max_backlogs ?? 0}
                </div>
              </div>

              {job.mandatory_skills && job.mandatory_skills.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Mandatory Skills:</span>
                  <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {job.mandatory_skills.map((s: string, idx: number) => (
                      <span key={idx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  onClick={() => toggleStatus(job)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  disabled={updatingId === job.id}
                >
                  {job.status === 'active' ? <><XCircle size={14} /> Pause Applications</> : <><CheckCircle2 size={14} /> Reopen Posting</>}
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/recruiter/candidates?job_id=${job.id}`} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                    View Ranked Applicants
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
