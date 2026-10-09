import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, Briefcase, Building2, Mail, Lock, 
  Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Check
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [role, setRole] = useState<'student' | 'recruiter' | 'tpo'>('student');
  const [email, setEmail] = useState('student@campuslink.com');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const handleRoleSelect = (selectedRole: 'student' | 'recruiter' | 'tpo') => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'student') {
      setEmail('student@campuslink.com');
      setPassword('student123');
    } else if (selectedRole === 'recruiter') {
      setEmail('recruiter@techcorp.com');
      setPassword('recruiter123');
    } else if (selectedRole === 'tpo') {
      setEmail('admin@campuslink.com');
      setPassword('admin123');
    }
  };

  const getRoleSubtitle = () => {
    if (role === 'student') return 'Sign in to continue to your student dashboard.';
    if (role === 'recruiter') return 'Sign in to continue to your recruiter workspace.';
    return 'Sign in to continue to your placement command center.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await apiClient.post('/auth/login', { email: cleanEmail, password });
      const { access_token, refresh_token, role: userRole } = res.data;
      
      setTokens(access_token, refresh_token);
      
      const userRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser({
        id: userRes.data.id,
        email: userRes.data.email,
        role: userRes.data.role,
        name: res.data.name || userRes.data.email
      });
      
      if (userRole === 'student') navigate('/student', { replace: true });
      else if (userRole === 'recruiter') navigate('/recruiter', { replace: true });
      else if (userRole === 'tpo') navigate('/tpo', { replace: true });
      
    } catch (err: any) {
      if (!err.response) {
        setError("Unable to reach CampusLink server. Please check your network.");
      } else {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
        } else {
          setError('Invalid email or password');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-final-page">
      {/* LEFT SECTION (58-62%): Campus Architecture with subtle dark overlay */}
      <section className="cl-left-panel">
        <div className="cl-left-overlay" />
        
        {/* Top Brand Bar with Next-Gen Tag */}
        <header className="cl-left-header">
          <div className="cl-brand-pill">
            <div className="cl-logo-box">C</div>
            <span className="cl-logo-text">Campus<span className="cl-accent-text">Link</span></span>
          </div>

          <div className="cl-ecosystem-tag">
            <Sparkles size={13} className="cl-sparkle-icon" />
            <span>Next-Gen Placement Platform</span>
          </div>
        </header>

        {/* Hero Story Content */}
        <div className="cl-left-content">
          <div className="cl-headline-group">
            <h1 className="cl-hero-h1">
              <span className="cl-h1-white">From Campus</span>
              <span className="cl-h1-gradient cl-animated-gradient">To Career.</span>
            </h1>
            <p className="cl-hero-desc">
              An intelligent ecosystem empowering students, recruiters, and institutions to accelerate placement excellence.
            </p>
          </div>

          {/* 3 Premium Glass Feature Cards */}
          <div className="cl-cards-row">
            <div className="cl-value-card">
              <div className="cl-card-icon-wrap purple">
                <GraduationCap size={16} />
              </div>
              <div className="cl-card-info">
                <strong>Students</strong>
                <span>Career readiness</span>
              </div>
            </div>

            <div className="cl-value-card">
              <div className="cl-card-icon-wrap blue">
                <Briefcase size={16} />
              </div>
              <div className="cl-card-info">
                <strong>Recruiters</strong>
                <span>Direct verified talent</span>
              </div>
            </div>

            <div className="cl-value-card">
              <div className="cl-card-icon-wrap amber">
                <Building2 size={16} />
              </div>
              <div className="cl-card-info">
                <strong>Institutions</strong>
                <span>Real-time intelligence</span>
              </div>
            </div>
          </div>

          {/* 3 Value Statements with Crisp Glass Badges */}
          <div className="cl-values-row">
            <div className="cl-val-item">
              <div className="cl-val-dot purple" />
              <span className="cl-val-text">Better Opportunities</span>
            </div>
            <div className="cl-val-item">
              <div className="cl-val-dot blue" />
              <span className="cl-val-text">Smarter Placements</span>
            </div>
            <div className="cl-val-item">
              <div className="cl-val-dot green" />
              <span className="cl-val-text">Stronger Outcomes</span>
            </div>
          </div>
        </div>

        {/* Bottom Left Footer with Quote */}
        <div className="cl-left-footer">
          <div className="cl-quote-card">
            <div className="cl-quote-bar" />
            <p className="cl-quote-text">
              “A connected campus today, a stronger career tomorrow.”
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT SECTION: Dynamic Aurora Glass Dome with Floating 3D Widgets & Form */}
      <section className="cl-right-panel">
        {/* Animated Aurora Ambient Glows */}
        <div className="cl-aurora-glow glow-1" />
        <div className="cl-aurora-glow glow-2" />
        <div className="cl-aurora-grid-pattern" />

        {/* Mesmerizing Ambient Glowing Rings & Fluid Light Waves */}
        <div className="cl-ambient-ring ring-1" />
        <div className="cl-ambient-ring ring-2" />
        <div className="cl-ambient-ring ring-3" />
        <div className="cl-light-beam beam-1" />
        <div className="cl-light-beam beam-2" />

        {/* Floating Geometric Prisms */}
        <div className="cl-geometric-prism prism-1" />
        <div className="cl-geometric-prism prism-2" />
        <div className="cl-geometric-prism prism-3" />

        {/* Centered White Authentication Card */}
        <div className="cl-login-card-wrap">
          <div className="cl-white-card">
            {/* Modern Header with Dynamic Role Indicator */}
            <div className="cl-card-header">
              <div className="cl-card-badge-row">
                <span className="cl-portal-pill">
                  <span className="cl-portal-dot" />
                  AUTHENTICATION PORTAL
                </span>
              </div>
              <h2 className="cl-card-title">
                Campus<span className="cl-accent-text">Link</span>
              </h2>
              <p className="cl-card-subtitle">{getRoleSubtitle()}</p>
            </div>

            {/* 3D Holographic Role Selection Cards */}
            <div className="cl-role-cards-grid">
              <div 
                className={`cl-role-card ${role === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="cl-role-card-glow" />
                <div className="cl-role-card-icon student">
                  <GraduationCap size={18} />
                </div>
                <div className="cl-role-card-text">
                  <span className="cl-role-tag">ROLE 01</span>
                  <strong>Student</strong>
                </div>
                {role === 'student' && <div className="cl-role-check"><Check size={10} /></div>}
              </div>

              <div 
                className={`cl-role-card ${role === 'recruiter' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('recruiter')}
              >
                <div className="cl-role-card-glow" />
                <div className="cl-role-card-icon recruiter">
                  <Briefcase size={18} />
                </div>
                <div className="cl-role-card-text">
                  <span className="cl-role-tag">ROLE 02</span>
                  <strong>Recruiter</strong>
                </div>
                {role === 'recruiter' && <div className="cl-role-check"><Check size={10} /></div>}
              </div>

              <div 
                className={`cl-role-card ${role === 'tpo' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('tpo')}
              >
                <div className="cl-role-card-glow" />
                <div className="cl-role-card-icon tpo">
                  <Building2 size={18} />
                </div>
                <div className="cl-role-card-text">
                  <span className="cl-role-tag">ROLE 03</span>
                  <strong>TPO / Admin</strong>
                </div>
                {role === 'tpo' && <div className="cl-role-check"><Check size={10} /></div>}
              </div>
            </div>

            {error && (
              <div className="cl-error-box">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="cl-auth-form">
              {/* Email Field */}
              <div className="cl-form-field">
                <label className="cl-label" htmlFor="cl-email">Email Address</label>
                <div className="cl-input-wrap">
                  <Mail className="cl-field-icon" size={17} />
                  <input
                    id="cl-email"
                    type="email"
                    className="cl-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="cl-form-field">
                <label className="cl-label" htmlFor="cl-password">Password</label>
                <div className="cl-input-wrap">
                  <Lock className="cl-field-icon" size={17} />
                  <input
                    id="cl-password"
                    type={showPassword ? 'text' : 'password'}
                    className="cl-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="cl-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="cl-options-row">
                <label className="cl-check-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="cl-check-box" />
                  <span className="cl-check-text">Remember me</span>
                </label>

                <a href="#forgot" className="cl-forgot-link">
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button 
                type="submit" 
                className="cl-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="cl-btn-loading">
                    <span className="cl-spinner" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Create Account Link */}
            <div className="cl-signup-footer">
              <span>Don't have an account? </span>
              <Link to="/register" className="cl-signup-cta">Create Account</Link>
            </div>

            {/* Security Note */}
            <div className="cl-security-note">
              <ShieldCheck size={14} className="cl-shield-icon" />
              <span>Your account information is securely protected.</span>
            </div>
          </div>
        </div>

        {/* Minimal Copyright at Bottom Right Corner */}
        <div className="cl-right-copyright">
          © 2026 CampusLink
        </div>
      </section>
    </div>
  );
}
