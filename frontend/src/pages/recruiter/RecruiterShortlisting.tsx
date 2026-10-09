import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { CheckSquare, CheckCircle2, XCircle, Users, ArrowRight } from 'lucide-react';

export default function RecruiterShortlisting() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentJobId, setCurrentJobId] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiClient.get('/jobs');
        setJobs(res.data || []);
        if (res.data.length > 0) {
          setCurrentJobId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const loadCandidates = async (jobId: string) => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/jobs/${jobId}/matches`);
      setCandidates(res.data?.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentJobId) {
      loadCandidates(currentJobId);
    }
  }, [currentJobId]);

  const handleUpdateStatus = async (appId: string, status: string, name: string) => {
    try {
      await apiClient.patch(`/applications/${appId}/status`, { status });
      setMessage(`Updated ${name} to status: ${status.toUpperCase()}`);
      loadCandidates(currentJobId);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleBulkShortlistTop = async (count: number) => {
    const topCandidates = candidates.slice(0, count);
    for (const c of topCandidates) {
      if (c.application_id) {
        await apiClient.patch(`/applications/${c.application_id}/status`, { status: 'shortlisted' }).catch(() => {});
      }
    }
    setMessage(`Bulk shortlisted top ${topCandidates.length} AI ranked candidates!`);
    loadCandidates(currentJobId);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Candidate Shortlisting & Pipeline Stage</h2>
          <p style={{ margin: 0 }}>Review applicants, apply cutoff criteria, and transition students to technical assessments.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select 
            className="input-field" 
            style={{ width: 'auto', minWidth: '220px' }}
            value={currentJobId}
            onChange={(e) => setCurrentJobId(e.target.value)}
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} ({j.ctc_lpa} LPA)</option>
            ))}
          </select>

          <button 
            onClick={() => handleBulkShortlistTop(5)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
            disabled={candidates.length === 0}
          >
            <CheckSquare size={16} /> Shortlist Top 5
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading candidate pipeline...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Applicants to Shortlist</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Applications for this opening will appear here for 1-click shortlisting and rejection decisions.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Rank & Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Branch</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>CGPA</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>AI Match Score</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Current Stage</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Shortlist Decision</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, idx) => (
                <tr key={c.student_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>#{idx + 1} {c.student_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {c.student_id?.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {c.branch}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                    {c.cgpa}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '10px', background: c.overall_score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)', color: c.overall_score >= 80 ? 'var(--secondary)' : '#a5b4fc', fontWeight: 700 }}>
                      {Math.round(c.overall_score)}%
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '10px', 
                      background: c.application_status === 'shortlisted' ? 'rgba(16, 185, 129, 0.2)' : c.application_status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: c.application_status === 'shortlisted' ? 'var(--secondary)' : c.application_status === 'rejected' ? 'var(--danger)' : 'var(--text-secondary)',
                      textTransform: 'uppercase'
                    }}>
                      {c.application_status || 'APPLIED'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(c.application_id, 'shortlisted', c.student_name)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                      >
                        <CheckCircle2 size={13} /> Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.application_id, 'interview', c.student_name)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      >
                        Advance <ArrowRight size={13} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.application_id, 'rejected', c.student_name)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
