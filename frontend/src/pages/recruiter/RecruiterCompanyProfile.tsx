import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { ShieldCheck, Save } from 'lucide-react';

export default function RecruiterCompanyProfile() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await apiClient.get('/companies/my-company');
        setCompany(res.data);
        setFormData({
          name: res.data.name || '',
          industry: res.data.industry || '',
          website: res.data.website || '',
          contact_email: res.data.contact_email || '',
          contact_phone: res.data.contact_phone || '',
          location: res.data.location || '',
          description: res.data.description || '',
        });
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await apiClient.put(`/companies/${company.id}`, formData);
      setCompany(res.data);
      setMessage('Company profile updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading corporate profile...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Company & Corporate Profile</h2>
          <p style={{ margin: 0 }}>Manage official corporate identity, campus branding, and recruitment contact points.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: company?.is_approved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: company?.is_approved ? '1px solid var(--secondary)' : '1px solid #f59e0b' }}>
          {company?.is_approved ? (
            <>
              <ShieldCheck size={16} color="var(--secondary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>TPO Verified Employer</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>Pending TPO Approval</span>
            </>
          )}
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Company Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Industry Domain</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Cloud Computing / FinTech"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Corporate Website</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://company.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Primary HQ / Campus Location</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Bangalore, India"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Campus HR Contact Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Campus HR Contact Phone</label>
            <input
              type="tel"
              className="input-field"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">About the Company / Culture Overview</label>
          <textarea
            rows={4}
            className="input-field"
            placeholder="Introduce your engineering ethos, technologies used, and work culture to campus candidates..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
