import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Briefcase } from 'lucide-react';

export default function TPOJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiClient.get('/jobs');
        setJobs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const filtered = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    (j.company_name && j.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Institutional Job Postings & Requisitions</h2>
          <p style={{ margin: 0 }}>Review all active campus openings, packages (LPA), CGPA cutoffs, and eligible branches.</p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading campus job postings...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Briefcase size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Job Postings Available</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Corporate recruiters have not published drive positions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((j) => (
            <div key={j.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{j.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{j.company_name || 'Corporate Partner'}</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: j.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)', color: j.status === 'active' ? 'var(--secondary)' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {j.status}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Compensation (CTC)</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {j.ctc_lpa} LPA
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>Min CGPA: <strong>{j.min_cgpa || '7.0'}</strong> • Max Backlogs: <strong>{j.max_backlogs || 0}</strong></div>
                <div>Eligible Branches: <strong>{j.eligible_branches?.join(', ') || 'CSE, IT, ECE'}</strong></div>
                <div>Location: <strong>{j.location || 'Bangalore'}</strong></div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {j.mandatory_skills?.slice(0, 4).map((sk: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.15)', color: '#a5b4fc' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
