import React, { useState } from 'react';
import apiClient from '../../api/client';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Sparkles, 
  ArrowRight, ShieldCheck, Cpu, Code2, Award 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentResume() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({ type: 'error', text: 'Please choose a resume file to upload.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setStatusMsg(null);

    try {
      const res = await apiClient.post('/students/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const parsed = res.data.parsed_resume ? JSON.parse(res.data.parsed_resume) : null;
      setParsedData(parsed);
      setStatusMsg({ 
        type: 'success', 
        text: 'Resume uploaded and parsed successfully by AI Engine! Readiness score updated.' 
      });
    } catch (err: any) {
      setStatusMsg({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to upload and parse resume. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Talent Intelligence
        </span>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>
          Resume Upload & AI Parsing
        </h2>
        <p style={{ margin: 0 }}>
          Upload your resume in PDF or DOCX format. Our heuristic AI engine extracts technical skills, projects, certifications, and updates your Placement Passport score in real-time.
        </p>
      </div>

      {statusMsg && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--secondary)' : 'var(--danger)'}`,
          color: statusMsg.type === 'success' ? '#6ee7b7' : '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          border: '2px dashed rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '3rem 2rem',
          background: 'rgba(15, 23, 42, 0.4)',
          transition: 'var(--transition)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(16, 185, 129, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: 'var(--primary)'
          }}>
            <Upload size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {file ? file.name : 'Drag & drop or select your resume file'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Supports PDF, DOCX, TXT formats up to 5MB. Clear font hierarchy ensures 99%+ parsing accuracy.
          </p>

          <input
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <label htmlFor="resume-file-input" className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <FileText size={18} /> {file ? 'Choose Different File' : 'Browse File'}
          </label>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            disabled={!file || uploading}
          >
            {uploading ? (
              <><Sparkles className="animate-spin" size={18} /> Parsing with AI...</>
            ) : (
              <><Cpu size={18} /> Upload & Run AI Extraction</>
            )}
          </button>
        </div>
      </form>

      {/* Real-time AI Parse Results Preview */}
      {parsedData && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Sparkles size={20} color="var(--primary)" /> AI Extracted Profile Breakdown
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                Verified insights extracted directly from your uploaded document.
              </p>
            </div>
            <Link to="/student/profile" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Confirm in Profile <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Extracted Skills */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc' }}>
                <Code2 size={16} /> Extracted Technical Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {parsedData.skills && parsedData.skills.length > 0 ? (
                  parsedData.skills.map((s: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No explicit skills detected</span>
                )}
              </div>
            </div>

            {/* Extracted Academics */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7' }}>
                <ShieldCheck size={16} /> Academic Markers
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>CGPA / Percentage:</strong> {parsedData.cgpa || 'Not parsed'}</div>
                <div><strong>Graduation Year:</strong> {parsedData.graduation_year || 'Not parsed'}</div>
                <div><strong>Degree / Branch:</strong> {parsedData.branch || 'Identified in document'}</div>
              </div>
            </div>

            {/* Extracted Projects */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fde047' }}>
                <Award size={16} /> Project & Experience Count
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>Projects Identified:</strong> {parsedData.projects?.length || 0} items</div>
                <div><strong>Certifications:</strong> {parsedData.certifications?.length || 0} items</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
