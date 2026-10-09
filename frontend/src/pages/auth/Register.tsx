import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, Briefcase, Mail, Lock, User, 
  Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Check, 
  Building, Award, Globe, Zap, CheckCircle2, ChevronRight,
  Cpu
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function Register() {
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const handleRoleSelect = (selectedRole: 'student' | 'recruiter') => {
    setRole(selectedRole);
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to terms and privacy policy to continue.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const payload: any = { role, name: cleanName, email: cleanEmail, password };
      if (role === 'recruiter') {
        payload.company_name = companyName.trim();
        payload.company_industry = companyIndustry.trim();
      }

      const res = await apiClient.post('/auth/register', payload);
      const { access_token, refresh_token } = res.data;
      
      setTokens(access_token, refresh_token);
      
      const userRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser({
        id: userRes.data.id,
        email: userRes.data.email,
        role: userRes.data.role,
        name: res.data.name || name
      });
      
      if (role === 'student') navigate('/student', { replace: true });
      else if (role === 'recruiter') navigate('/recruiter', { replace: true });
      
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
      } else {
        setError('Registration failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-reg-page">
      {/* Dynamic Cosmic Ambient Particle Grid & Radial Nebulas */}
      <div className="cr-cosmic-bg">
        <div className="cr-nebula-cyan" />
        <div className="cr-nebula-purple" />
        <div className="cr-nebula-emerald" />
        <div className="cr-matrix-grid" />
        <div className="cr-ambient-circle c-1" />
        <div className="cr-ambient-circle c-2" />
      </div>

      {/* Floating Modern Brand Header */}
      <header className="cr-top-nav">
        <div className="cr-brand-badge">
          <div className="cr-brand-logo">C</div>
          <span className="cr-brand-name">Campus<span className="cr-cyan-accent">Link</span></span>
          <span className="cr-version-chip">REGISTRATION NODE v2.6</span>
        </div>

        <div className="cr-nav-actions">
          <span className="cr-system-status">
            <span className="cr-status-pulse" />
            <span>Campus Network Online</span>
          </span>
          <Link to="/login" className="cr-signin-nav-btn">
            <span>Already registered? Sign In</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Holographic Terminal Deck */}
      <main className="cr-terminal-deck">
        <div className="cr-holo-frame">
          {/* Holographic Glowing Perimeter Beam */}
          <div className="cr-holo-border-beam" />
          
          <div className="cr-terminal-grid">
            {/* LEFT SECTION: Interactive Dynamic Holographic Identity Pass */}
            <section className="cr-preview-deck">
              <div className="cr-deck-badge">
                <Sparkles size={13} className="cr-deck-sparkle" />
                <span>REAL-TIME IDENTITY PASS GENERATOR</span>
              </div>

              {/* Dynamic Interactive Holographic ID Card */}
              <div className={`cr-id-card ${role}`}>
                <div className="cr-id-hologram-shimmer" />
                <div className="cr-id-header">
                  <div className="cr-id-chip">
                    <Cpu size={14} />
                    <span>NFC SECURE</span>
                  </div>
                  <div className="cr-id-serial">
                    CL-{role === 'student' ? 'STU' : 'REC'}-89024
                  </div>
                </div>

                <div className="cr-id-body">
                  <div className="cr-id-avatar-slot">
                    {role === 'student' ? (
                      <GraduationCap size={28} className="cr-avatar-icon" />
                    ) : (
                      <Building size={28} className="cr-avatar-icon" />
                    )}
                    <span className="cr-id-active-dot" />
                  </div>

                  <div className="cr-id-info">
                    <span className="cr-id-role-label">
                      {role === 'student' ? 'OFFICIAL CANDIDATE' : 'ENTERPRISE PARTNER'}
                    </span>
                    <h3 className="cr-id-name">
                      {name.trim() ? name : (role === 'student' ? 'Alex Rivera' : 'Sarah Jenkins')}
                    </h3>
                    <p className="cr-id-sub">
                      {role === 'student' 
                        ? (email.trim() ? email : 'student.portal@campus.edu')
                        : (companyName.trim() ? `${companyName} • ${companyIndustry || 'Enterprise'}` : 'TechCorp Global • Enterprise')
                      }
                    </p>
                  </div>
                </div>

                <div className="cr-id-footer">
                  <div className="cr-id-metric">
                    <span className="cr-id-m-label">STATUS</span>
                    <span className="cr-id-m-val verified">
                      <CheckCircle2 size={11} /> PRE-VERIFIED
                    </span>
                  </div>
                  <div className="cr-id-metric">
                    <span className="cr-id-m-label">TIER</span>
                    <span className="cr-id-m-val">TIER 1 ACCESS</span>
                  </div>
                  <div className="cr-id-metric">
                    <span className="cr-id-m-label">NETWORK</span>
                    <span className="cr-id-m-val">99.8% RELIABLE</span>
                  </div>
                </div>
              </div>

              {/* Live Perks Pill Highlights */}
              <div className="cr-perks-list">
                <div className="cr-perk-item">
                  <div className="cr-perk-icon cyan">
                    <Zap size={14} />
                  </div>
                  <div className="cr-perk-text">
                    <strong>Instant Profile Clearance</strong>
                    <span>Direct integration with 150+ university placement cells</span>
                  </div>
                </div>

                <div className="cr-perk-item">
                  <div className="cr-perk-icon violet">
                    <Award size={14} />
                  </div>
                  <div className="cr-perk-text">
                    <strong>AI Skills Benchmark</strong>
                    <span>Automated skill gap score & real-time corporate matches</span>
                  </div>
                </div>

                <div className="cr-perk-item">
                  <div className="cr-perk-icon emerald">
                    <Globe size={14} />
                  </div>
                  <div className="cr-perk-text">
                    <strong>Zero Intermediary Fees</strong>
                    <span>100% direct recruiter messaging & scheduled interviews</span>
                  </div>
                </div>
              </div>

              {/* Bottom Encrypted Badge */}
              <div className="cr-encrypted-pill">
                <ShieldCheck size={14} className="cr-enc-icon" />
                <span>SHA-256 Encrypted Profile Node • ISO 27001 Certified</span>
              </div>
            </section>

            {/* RIGHT SECTION: Multi-Tab Terminal Registration Cockpit */}
            <section className="cr-form-deck">
              {/* Cockpit Top Bar with Cyber Segmented Switcher */}
              <div className="cr-form-header">
                <div className="cr-portal-lead">
                  <span className="cr-step-indicator">STEP 01 OF 01</span>
                  <h2 className="cr-terminal-title">Initialize Your Account</h2>
                  <p className="cr-terminal-sub">
                    Select your access protocol to provision verified credentials.
                  </p>
                </div>

                {/* Futuristic Dual Pill Switcher */}
                <div className="cr-cyber-switcher">
                  <button
                    type="button"
                    className={`cr-switch-tab ${role === 'student' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('student')}
                  >
                    <GraduationCap size={16} />
                    <span>Candidate Student</span>
                    {role === 'student' && <div className="cr-tab-pip" />}
                  </button>

                  <button
                    type="button"
                    className={`cr-switch-tab ${role === 'recruiter' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('recruiter')}
                  >
                    <Briefcase size={16} />
                    <span>Corporate Recruiter</span>
                    {role === 'recruiter' && <div className="cr-tab-pip" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="cr-error-banner">
                  <div className="cr-err-dot" />
                  <span>{error}</span>
                </div>
              )}

              {/* Registration Form Controls */}
              <form onSubmit={handleRegister} className="cr-terminal-form">
                <div className="cr-form-row">
                  {/* Name Input */}
                  <div className="cr-input-group">
                    <label className="cr-label" htmlFor="cr-name">
                      Full Legal Name
                    </label>
                    <div className="cr-input-box">
                      <User size={15} className="cr-input-icon" />
                      <input
                        id="cr-name"
                        type="text"
                        className="cr-field"
                        placeholder={role === 'student' ? 'e.g. Alex Rivera' : 'e.g. Sarah Jenkins'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="cr-input-group">
                    <label className="cr-label" htmlFor="cr-email">
                      {role === 'student' ? 'College / University Email' : 'Work Email Address'}
                    </label>
                    <div className="cr-input-box">
                      <Mail size={15} className="cr-input-icon" />
                      <input
                        id="cr-email"
                        type="email"
                        className="cr-field"
                        placeholder={role === 'student' ? 'student@university.edu' : 'sarah@company.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Recruiter Conditional Row */}
                {role === 'recruiter' && (
                  <div className="cr-form-row cr-animate-slide">
                    <div className="cr-input-group">
                      <label className="cr-label" htmlFor="cr-company">
                        Organization / Company
                      </label>
                      <div className="cr-input-box">
                        <Building size={15} className="cr-input-icon" />
                        <input
                          id="cr-company"
                          type="text"
                          className="cr-field"
                          placeholder="e.g. Microsoft India"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="cr-input-group">
                      <label className="cr-label" htmlFor="cr-industry">
                        Industry Domain
                      </label>
                      <div className="cr-input-box">
                        <Briefcase size={15} className="cr-input-icon" />
                        <input
                          id="cr-industry"
                          type="text"
                          className="cr-field"
                          placeholder="e.g. Software & Cloud"
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div className="cr-input-group">
                  <div className="cr-label-row">
                    <label className="cr-label" htmlFor="cr-password">
                      Create Master Security Key
                    </label>
                    <span className="cr-hint-tag">Min. 6 alphanumeric chars</span>
                  </div>
                  <div className="cr-input-box">
                    <Lock size={15} className="cr-input-icon" />
                    <input
                      id="cr-password"
                      type={showPassword ? 'text' : 'password'}
                      className="cr-field"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="cr-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password view"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Consent & Policy Agreement */}
                <div className="cr-agreement-row">
                  <label className="cr-custom-check">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span className="cr-check-visual">
                      <Check size={10} className="cr-check-svg" />
                    </span>
                    <span className="cr-check-caption">
                      I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Placement Code</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Directive</a>.
                    </span>
                  </label>
                </div>

                {/* Action Trigger Button */}
                <div className="cr-action-cluster">
                  <button
                    type="submit"
                    className="cr-launch-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="cr-btn-spinner-wrap">
                        <span className="cr-btn-spinner" />
                        <span>Provisioning Account Node...</span>
                      </span>
                    ) : (
                      <>
                        <span>Provision {role === 'student' ? 'Student Candidate' : 'Corporate Recruiter'} Node</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="cr-terminal-footer">
                    <span>Already equipped with an account?</span>
                    <Link to="/login" className="cr-signin-link">
                      Sign In Now
                    </Link>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>

      {/* Cyber Grid Footer */}
      <footer className="cr-bottom-bar">
        <div className="cr-bot-left">
          <span>CampusLink Next-Gen Distributed Career Infrastructure</span>
        </div>
        <div className="cr-bot-right">
          <span>© 2026 CampusLink Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
