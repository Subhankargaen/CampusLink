import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Building, PlusCircle, Calendar, Briefcase, ArrowRight } from 'lucide-react';

export default function TPODrives() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '2025-2026',
    description: '',
    status: 'active',
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDrives = async () => {
    try {
      const res = await apiClient.get('/drives');
      setDrives(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setCreating(true);
    try {
      await apiClient.post('/drives', formData);
      setShowCreateModal(false);
      setFormData({ name: '', academic_year: '2025-2026', description: '', status: 'active' });
      setMessage('New placement drive orchestrated successfully!');
      fetchDrives();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to create drive');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Placement Drive Orchestrator</h2>
          <p style={{ margin: 0 }}>End-to-end recruitment drive lifecycle manager (Company invitations, slots, and schedules).</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <PlusCircle size={16} /> Orchestrate New Drive
        </button>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading placement drive timeline...</div>
      ) : drives.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Building size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Placement Drives Configured Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto', color: 'var(--text-secondary)' }}>
            Start the season by orchestrating an official campus placement drive.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            Create First Drive
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {drives.map((d) => (
            <div key={d.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: d.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{d.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Academic Year: {d.academic_year}</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: d.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)', color: d.status === 'active' ? 'var(--secondary)' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {d.status}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {d.description || 'Full campus drive open to registered final-year engineering students across core departments.'}
              </p>

              <div style={{ display: 'flex', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Briefcase size={15} color="var(--primary)" />
                  <span>{d.job_count || 3} Roles</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="var(--text-secondary)" />
                  <span>{d.start_date || 'In Progress'}</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
                <button 
                  onClick={() => alert(`Opening Drive: ${d.name}`)}
                  className="btn btn-outline" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                >
                  Manage Drive Pipeline <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orchestrate Drive Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Orchestrate Campus Placement Drive</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Create an institutional container to group company job requisitions and interviews.
            </p>

            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Drive Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 2026 Batch Engineering Phase 1 Drive"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Academic Batch Year</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Drive Overview / Special Instructions</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Details for students regarding dress code, eligibility, and reporting..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Orchestrating...' : 'Launch Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
