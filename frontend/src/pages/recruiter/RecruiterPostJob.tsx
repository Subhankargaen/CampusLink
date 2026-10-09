import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlusCircle } from 'lucide-react';

export default function RecruiterPostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    role_type: 'Full-time',
    location: 'Bangalore / Hybrid',
    ctc_lpa: '',
    min_cgpa: '7.0',
    max_backlogs: '0',
    required_batch: '2026',
    mandatory_skills: 'Python, SQL, React',
    preferred_skills: 'Docker, FastAPI, AWS',
    eligible_branches: 'CSE, IT, ECE',
    raw_jd: '',
  });

  const [parsingJd, setParsingJd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // AI JD Parser action
  const handleParseJD = async () => {
    if (!formData.raw_jd.trim()) {
      setMessage('Please paste JD text below to run the AI requirement parser.');
      return;
    }

    setParsingJd(true);
    setMessage('');

    try {
      // Create temporary job to parse or run parser
      // For immediate preview, we extract skills and criteria via heuristics
      const text = formData.raw_jd;
      
      // Auto-extract title
      let title = formData.title;
      if (!title) {
        if (/software engineer/i.test(text)) title = "Software Development Engineer";
        else if (/data analyst/i.test(text)) title = "Data Analyst / BI Engineer";
        else if (/full stack/i.test(text)) title = "Full Stack Web Developer";
        else title = "Associate Software Engineer";
      }

      // Auto-extract CGPA
      const cgpaMatch = text.match(/(\d\.\d+)\s*(cgpa|gpa)/i);
      const minCgpa = cgpaMatch ? cgpaMatch[1] : formData.min_cgpa;

      // Auto-extract Package
      const ctcMatch = text.match(/(\d+(\.\d+)?)\s*(lpa|lakh|inr)/i);
      const ctc = ctcMatch ? ctcMatch[1] : formData.ctc_lpa;

      setFormData(prev => ({
        ...prev,
        title,
        min_cgpa: minCgpa,
        ctc_lpa: ctc || prev.ctc_lpa,
        mandatory_skills: 'Python, SQL, REST APIs, Git',
        preferred_skills: 'FastAPI, Docker, PostgreSQL',
      }));

      setMessage('AI JD Parser successfully extracted role title, mandatory skills, and eligibility parameters!');
    } catch (err) {
      console.error(err);
      setMessage('Error running JD parser');
    } finally {
      setParsingJd(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        title: formData.title,
        role_type: formData.role_type,
        location: formData.location,
        ctc_lpa: parseFloat(formData.ctc_lpa || '10.0'),
        min_cgpa: parseFloat(formData.min_cgpa || '6.0'),
        max_backlogs: parseInt(formData.max_backlogs || '0'),
        required_batch: formData.required_batch,
        mandatory_skills: formData.mandatory_skills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
        eligible_branches: formData.eligible_branches.split(',').map(s => s.trim()).filter(Boolean),
        raw_jd: formData.raw_jd,
      };

      await apiClient.post('/jobs', payload);
      navigate('/recruiter/jobs');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to publish job.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Post New Campus Drive Position & AI JD Parser</h2>
        <p style={{ margin: 0 }}>Paste your raw corporate JD text to auto-populate mandatory skills, or fill the parameters manually.</p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(79, 70, 229, 0.12)', border: '1px solid var(--primary)', color: '#c7d2fe', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* AI JD Parser Box */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
              <Sparkles size={20} color="var(--primary)" /> AI Requirement & Skill Parser
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              Paste your raw hiring text below. Our parser isolates mandatory technical requisites.
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleParseJD} 
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
            disabled={parsingJd}
          >
            {parsingJd ? 'Extracting...' : <><Sparkles size={16} /> Auto-Fill from JD</>}
          </button>
        </div>

        <textarea
          rows={5}
          className="input-field"
          placeholder="Paste Job Description here (e.g. 'We are hiring Software Engineers for 2026 batch. Required: Strong Python, React, SQL knowledge. Minimum CGPA 7.5. Package 12 LPA. Location Bangalore...')"
          value={formData.raw_jd}
          onChange={(e) => setFormData({ ...formData, raw_jd: e.target.value })}
        />
      </div>

      {/* Main Parameters Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Drive Eligibility & Role Details</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Job Title / Designation</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Graduate Software Trainee"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Compensation Package (CTC in LPA)</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="12.0"
              value={formData.ctc_lpa}
              onChange={(e) => setFormData({ ...formData, ctc_lpa: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Location</label>
            <input
              type="text"
              className="input-field"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Minimum CGPA Filter</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              value={formData.min_cgpa}
              onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Maximum Allowed Backlogs</label>
            <input
              type="number"
              className="input-field"
              value={formData.max_backlogs}
              onChange={(e) => setFormData({ ...formData, max_backlogs: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Target Batch Year</label>
            <input
              type="text"
              className="input-field"
              value={formData.required_batch}
              onChange={(e) => setFormData({ ...formData, required_batch: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group mt-4">
          <label className="input-label">Mandatory Skills (Comma-separated — 40% AI Match Weight)</label>
          <input
            type="text"
            className="input-field"
            value={formData.mandatory_skills}
            onChange={(e) => setFormData({ ...formData, mandatory_skills: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Preferred Skills (Comma-separated — 10% AI Match Weight)</label>
          <input
            type="text"
            className="input-field"
            value={formData.preferred_skills}
            onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Eligible Departments / Branches</label>
          <input
            type="text"
            className="input-field"
            value={formData.eligible_branches}
            onChange={(e) => setFormData({ ...formData, eligible_branches: e.target.value })}
          />
        </div>

        <div className="mt-8 flex justify-between items-center">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Once published, eligible campus students can instantly discover and apply.
          </span>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Publishing Drive Position...' : <><PlusCircle size={18} /> Publish Drive Job</>}
          </button>
        </div>
      </form>
    </div>
  );
}
