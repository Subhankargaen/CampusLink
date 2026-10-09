import { useState } from 'react';
import { FolderCheck, Upload, FileText, CheckCircle2, Clock } from 'lucide-react';

interface VaultDoc {
  id: string;
  category: string;
  filename: string;
  uploadedAt: string;
  status: 'verified' | 'pending' | 'required';
}

export default function StudentDocuments() {
  const [docs, setDocs] = useState<VaultDoc[]>([
    { id: '1', category: '10th Standard Marksheet', filename: 'Class10_Marksheet_Verified.pdf', uploadedAt: '2026-08-10', status: 'verified' },
    { id: '2', category: '12th Standard / Diploma', filename: 'Class12_Certificate.pdf', uploadedAt: '2026-08-10', status: 'verified' },
    { id: '3', category: 'College Identity Proof', filename: 'College_ID_Card.png', uploadedAt: '2026-08-12', status: 'verified' },
    { id: '4', category: 'Latest College Grade Transcript', filename: 'Semester_6_GradeCard.pdf', uploadedAt: '2026-09-01', status: 'verified' },
    { id: '5', category: 'Placement No-Objection Certificate (NOC)', filename: 'TPO_NOC_Signed.pdf', uploadedAt: '2026-09-15', status: 'pending' },
    { id: '6', category: 'Offer Letter Acceptance Acknowledgement', filename: 'Pending Upload', uploadedAt: '-', status: 'required' },
  ]);

  const [message, setMessage] = useState('');

  const handleUploadSimulate = (docId: string) => {
    setDocs(docs.map(d => d.id === docId ? { ...d, filename: 'Uploaded_Document_Latest.pdf', status: 'pending', uploadedAt: new Date().toISOString().split('T')[0] } : d));
    setMessage('Document uploaded successfully to the encrypted TPO verification vault!');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Placement Documents & Verification Vault</h2>
        <p>Maintain verified copies of academic transcripts, government identity proofs, and signed placement agreements.</p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderCheck size={20} color="var(--secondary)" /> Verified Document Repository
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              TPO administrators and verified campus recruiters can inspect these credentials during onboarding.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', fontWeight: 600 }}>
            4 of 6 Verified
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {docs.map((doc) => (
            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{doc.category}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {doc.filename} {doc.uploadedAt !== '-' && `• Uploaded ${doc.uploadedAt}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {doc.status === 'verified' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Verified by TPO
                  </span>
                )}
                {doc.status === 'pending' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Clock size={16} /> Verification Pending
                  </span>
                )}
                {doc.status === 'required' && (
                  <button 
                    onClick={() => handleUploadSimulate(doc.id)} 
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Upload size={14} /> Upload File
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
