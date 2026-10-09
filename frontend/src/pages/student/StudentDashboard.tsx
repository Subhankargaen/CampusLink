import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { 
  FileText, Briefcase, Award, CheckCircle, 
  AlertCircle, ArrowRight, Upload, Sparkles, BookOpen 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentProfile {
  id: string;
  name: string;
  phone: string | null;
  branch: string | null;
  cgpa: number | null;
  graduation_year: number | null;
  active_backlogs: number;
  readiness_score: number;
  profile_complete: boolean;
  resume_path: string | null;
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, appsRes] = await Promise.all([
          apiClient.get('/students/me'),
          apiClient.get('/applications/my-applications').catch(() => ({ data: [] }))
        ]);
        setProfile(profileRes.data);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error('Failed to load student data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin text-gradient" size={36} />
          <p className="mt-4">Loading your Placement Portal...</p>
        </div>
      </div>
    );
  }

  const readiness = Math.round(profile?.readiness_score || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(16, 185, 129, 0.1))' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Student Placement Portal
          </span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Welcome back, <span className="text-gradient">{profile?.name || user?.name}</span> 👋
          </h2>
          <p style={{ margin: 0, maxWidth: '600px' }}>
            {profile?.profile_complete
              ? 'Your profile is ready! Explore matched drives and track your interview rounds.'
              : 'Complete your academic profile and upload your resume to unlock AI job matching.'}
          </p>
        </div>

        <div className="flex gap-4">
          <Link to="/student/profile" className="btn btn-outline">
            <FileText size={18} /> Edit Profile
          </Link>
          <Link to="/student/jobs" className="btn btn-primary">
            <Briefcase size={18} /> Browse Drives <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {/* Readiness Score Card */}
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Placement Readiness</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)' }}>
              <Sparkles size={18} color="var(--primary)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: readiness >= 70 ? 'var(--secondary)' : readiness >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
              {readiness}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Readiness Index</span>
          </div>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ 
              width: `${readiness}%`, 
              height: '100%', 
              background: readiness >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : readiness >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #f43f5e, #fb7185)',
              borderRadius: '999px',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>

        {/* Profile Status Card */}
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Status</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: profile?.profile_complete ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
              {profile?.profile_complete ? <CheckCircle size={18} color="var(--secondary)" /> : <AlertCircle size={18} color="var(--warning)" />}
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {profile?.profile_complete ? (
              <>
                <span className="live-dot" />
                <span style={{ color: '#6ee7b7' }}>Verified Profile</span>
              </>
            ) : (
              <span style={{ color: '#fcd34d' }}>Pending Updates</span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
            Branch: <strong style={{ color: 'var(--text-primary)' }}>{profile?.branch || 'Not Set'}</strong> • CGPA: <strong style={{ color: 'var(--text-primary)' }}>{profile?.cgpa || 'N/A'}</strong>
          </p>
        </div>

        {/* Applications Count Card */}
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Applications</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)' }}>
              <Briefcase size={18} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem', color: '#c7d2fe' }}>
            {applications.length}
          </div>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
            Ongoing drives, shortlists & interview schedules
          </p>
        </div>
      </div>

      {/* Quick Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Resume & Passport Section */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--secondary)" /> Placement Passport
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            Your verified credential passport summarizing parsed skills, projects, and interview eligibility.
          </p>
          <div className="mt-4" style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/student/profile" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <Upload size={16} /> Upload Resume
            </Link>
            <Link to="/student/profile" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
              View Passport
            </Link>
          </div>
        </div>

        {/* Career Advisor Tip */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--primary)" /> AI Career Recommendation
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            {readiness < 50
              ? 'Add your verified skills (Python, SQL, React) and upload a project to boost your score above 70%.'
              : 'Great profile strength! High probability matches detected in upcoming Software Engineering drives.'}
          </p>
          <div className="mt-4">
            <Link to="/student/jobs" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Recommended Jobs <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
