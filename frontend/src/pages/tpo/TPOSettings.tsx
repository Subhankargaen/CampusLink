import { useState } from 'react';
import { ShieldCheck, Save } from 'lucide-react';

export default function TPOSettings() {
  const [minCgpa, setMinCgpa] = useState('6.5');
  const [maxBacklogs, setMaxBacklogs] = useState('1');
  const [autoApprove, setAutoApprove] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Campus Placement Policies & System Rules</h2>
        <p style={{ margin: 0 }}>Configure institutional placement eligibility rules, recruiter approval thresholds, and security parameters.</p>
      </div>

      {saved && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          Placement policy parameters updated and enforced across active drives!
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary)" /> Minimum Institutional Eligibility Guardrails
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Default Minimum CGPA Threshold</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Maximum Allowed Active Backlogs</label>
            <input
              type="number"
              className="input-field"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Recruiter Automation & Onboarding</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <span>Auto-notify TPO Placement cell whenever a tier-1 corporate recruiter registers</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save Policy Rules
          </button>
        </div>
      </form>
    </div>
  );
}
