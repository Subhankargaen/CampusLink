import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { User } from 'lucide-react';

export default function TPOApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await apiClient.get('/applications');
        setApplications(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const filtered = applications.filter(a => {
    const matchSearch = 
      (a.student_name && a.student_name.toLowerCase().includes(search.toLowerCase())) ||
      (a.job_title && a.job_title.toLowerCase().includes(search.toLowerCase())) ||
      (a.company_name && a.company_name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">All Student Applications Tracker</h2>
          <p style={{ margin: 0 }}>Institutional monitoring of all job applications across placement drive stages.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search candidate / role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading application lifecycle records...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No applications found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Student Candidate</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Position / Role</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Company</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Applied Date</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} color="var(--primary)" />
                      <span>{a.student_name || 'Campus Student'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    {a.job_title || 'Software Trainee'}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: '#a5b4fc', fontWeight: 500 }}>
                    {a.company_name || 'Enterprise'}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(a.applied_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '12px', 
                      background: a.status === 'accepted' || a.status === 'offered' ? 'rgba(16, 185, 129, 0.2)' : a.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                      color: a.status === 'accepted' || a.status === 'offered' ? 'var(--secondary)' : a.status === 'rejected' ? 'var(--danger)' : '#a5b4fc',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
