import { useState } from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';

export default function RecruiterDocuments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents] = useState([
    {
      id: '1',
      student_name: 'Aarav Sharma',
      branch: 'CSE',
      doc_type: 'AI Parsed Resume (PDF)',
      verified_by_tpo: true,
      file_size: '1.2 MB',
      updated_at: 'Yesterday',
    },
    {
      id: '2',
      student_name: 'Priya Patel',
      branch: 'IT',
      doc_type: 'Engineering Marksheet & CGPA Transcripts',
      verified_by_tpo: true,
      file_size: '2.8 MB',
      updated_at: 'Sept 20, 2026',
    },
    {
      id: '3',
      student_name: 'Rohan Verma',
      branch: 'ECE',
      doc_type: 'AWS Certified Solutions Architect Certificate',
      verified_by_tpo: true,
      file_size: '850 KB',
      updated_at: 'Sept 18, 2026',
    },
    {
      id: '4',
      student_name: 'Sneha Gupta',
      branch: 'CSE',
      doc_type: 'Full Stack Capstone Project Architecture Spec',
      verified_by_tpo: false,
      file_size: '4.1 MB',
      updated_at: 'Sept 22, 2026',
    },
  ]);

  const filtered = documents.filter(d => 
    d.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.doc_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Applicant Document Vault & Credentials</h2>
          <p style={{ margin: 0 }}>Review verified student resumes, official academic transcripts, and technical certifications.</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search candidate or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Document Name</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>TPO Verification</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>File Size</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Uploaded</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{doc.student_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Branch: {doc.branch}</div>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    <span>{doc.doc_type}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  {doc.verified_by_tpo ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', fontWeight: 600 }}>
                      <ShieldCheck size={13} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      Student Uploaded
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                  {doc.file_size}
                </td>
                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                  {doc.updated_at}
                </td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => alert(`Downloading verified document for ${doc.student_name}...`)}
                    className="btn btn-outline" 
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    <Download size={13} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
