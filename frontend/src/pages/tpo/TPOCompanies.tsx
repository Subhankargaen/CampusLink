import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Building, ShieldCheck, CheckCircle2, Globe, Mail } from 'lucide-react';

export default function TPOCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const res = await apiClient.get('/companies');
      setCompanies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setApprovingId(id);
    try {
      await apiClient.patch(`/companies/${id}/approve`);
      setMessage(`Corporate partner ${name} approved for campus drives!`);
      fetchCompanies();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Approval failed');
      setApprovingId(null);
    }
  };

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Corporate Partners & Company Directory</h2>
          <p style={{ margin: 0 }}>Review visiting corporate recruiters, company profiles, and grant official drive approvals.</p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search company or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading registered corporate employers...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Building size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Registered Employers Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Corporate partners will appear here once recruiters register.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((c) => (
            <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{c.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.industry || 'Technology Solutions'}</div>
                </div>
                {c.is_approved ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', fontWeight: 600 }}>
                    <ShieldCheck size={13} /> Approved
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#fde047', fontWeight: 600 }}>
                    Pending Review
                  </span>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, minHeight: '38px' }}>
                {c.description || 'Global technology enterprise collaborating with campus placement cell for graduate engineering hiring.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {c.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={14} color="var(--primary)" />
                    <a href={c.website} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', textDecoration: 'none' }}>{c.website}</a>
                  </div>
                )}
                {c.contact_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} />
                    <span>{c.contact_email}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
                {!c.is_approved ? (
                  <button 
                    onClick={() => handleApprove(c.id, c.name)}
                    className="btn btn-primary" 
                    style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
                    disabled={approvingId === c.id}
                  >
                    <CheckCircle2 size={14} /> {approvingId === c.id ? 'Approving...' : 'Approve for Campus Drives'}
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
                    ✓ Active Drive Partner
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
