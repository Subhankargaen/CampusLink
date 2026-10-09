import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Sparkles, Upload } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiClient.get('/students/me');
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await apiClient.put('/students/me', {
        name: profile.name,
        phone: profile.phone,
        branch: profile.branch,
        cgpa: profile.cgpa ? parseFloat(profile.cgpa) : null,
        graduation_year: profile.graduation_year ? parseInt(profile.graduation_year) : null,
        career_goal: profile.career_goal,
        active_backlogs: parseInt(profile.active_backlogs || 0),
      });
      setProfile(res.data);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploadingResume(true);
    setMessage('');
    try {
      const res = await apiClient.post('/students/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      setMessage('Resume uploaded & analyzed successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 className="text-gradient">Student Profile & Academic Record</h2>
        <p>Keep your academic records updated so recruiters and TPO can match you to relevant drives.</p>

        {message && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid var(--primary)', color: '#a5b4fc', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 9876543210"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Branch / Department</label>
              <input
                type="text"
                className="input-field"
                placeholder="Computer Science, ECE, IT..."
                value={profile.branch || ''}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="input-field"
                placeholder="8.5"
                value={profile.cgpa ?? ''}
                onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Graduation Year</label>
              <input
                type="number"
                className="input-field"
                placeholder="2026"
                value={profile.graduation_year ?? ''}
                onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Active Backlogs</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={profile.active_backlogs ?? 0}
                onChange={(e) => setProfile({ ...profile, active_backlogs: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group mt-4">
            <label className="input-label">Career Goal / Target Role</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Full Stack Developer, Data Scientist, Cloud Engineer"
              value={profile.career_goal || ''}
              onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Resume Upload Box */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} color="var(--primary)" /> AI Resume Parser & Upload
        </h3>
        <p style={{ fontSize: '0.9rem' }}>
          Upload your latest resume (PDF/DOCX). Our AI Parser automatically extracts your skills, projects, and calculates placement readiness.
        </p>

        <div style={{ border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', marginTop: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
          <Upload size={32} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Select your resume file to parse</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supported formats: .pdf, .docx, .txt (Max 5MB)</p>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            style={{ marginTop: '1rem' }}
            disabled={uploadingResume}
          />
          {uploadingResume && <p className="mt-2" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Parsing resume with AI...</p>}
        </div>
      </div>
    </div>
  );
}
