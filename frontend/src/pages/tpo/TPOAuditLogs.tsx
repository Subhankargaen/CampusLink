import { useState } from 'react';

export default function TPOAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs] = useState([
    {
      id: '1',
      actor: 'admin@campuslink.com (TPO)',
      action: 'APPROVE_COMPANY',
      entity: 'TechCorp Solutions',
      details: 'Granted official approval for 2026 Batch placement drive',
      timestamp: 'Today, 10:45 AM',
      ip: '192.168.1.102',
    },
    {
      id: '2',
      actor: 'recruiter@techcorp.com',
      action: 'CREATE_JOB_REQUISITION',
      entity: 'Software Development Engineer (12.0 LPA)',
      details: 'Published JD with CGPA threshold 7.5',
      timestamp: 'Today, 11:15 AM',
      ip: '192.168.1.155',
    },
    {
      id: '3',
      actor: 'AI Match Engine',
      action: 'BATCH_RANKING_EXECUTION',
      entity: 'Drive: 2026 Batch Engineering Phase 1',
      details: 'Ranked 45 candidate applications via 7-factor model',
      timestamp: 'Today, 11:30 AM',
      ip: 'internal_worker',
    },
    {
      id: '4',
      actor: 'admin@campuslink.com (TPO)',
      action: 'TRIGGER_RISK_INTERVENTION',
      entity: 'Candidate: Rohan Verma (ECE)',
      details: 'Prescribed Fast-Track Capstone Lab intervention',
      timestamp: 'Today, 12:10 PM',
      ip: '192.168.1.102',
    },
    {
      id: '5',
      actor: 'recruiter@techcorp.com',
      action: 'ISSUE_PLACEMENT_OFFER',
      entity: 'Candidate: Aarav Sharma',
      details: 'Released official compensation package: 12.0 LPA',
      timestamp: 'Today, 01:05 PM',
      ip: '192.168.1.155',
    },
  ]);

  const filtered = logs.filter(l => 
    l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">System Audit Logs & Compliance Ledger</h2>
          <p style={{ margin: 0 }}>Immutable security and regulatory audit trail of all actions performed across the platform.</p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search action or actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Action Code</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Actor</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Entity Affected</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Audit Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </td>
                <td style={{ padding: '0.9rem 0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc', fontWeight: 600 }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '0.9rem 0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>
                  {log.actor}
                </td>
                <td style={{ padding: '0.9rem 0.5rem', fontWeight: 600 }}>
                  {log.entity}
                </td>
                <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
