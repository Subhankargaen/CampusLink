import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Home, User, Briefcase, FileText, Upload, Award, 
  LogOut, PlusCircle, Users, BarChart3, ShieldAlert, Sparkles, Building,
  BookOpen, Video, Compass, FolderCheck, Bell, CheckSquare, Brain, Settings, History
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'recruiter' | 'tpo';
}

export default function Sidebar({ role }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">C</div>
        <div>
          <div style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '1.1rem' }} className="text-gradient">
            CAMPUSLINK
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {role === 'student' ? 'Student Portal' : role === 'recruiter' ? 'Recruiter Hub' : 'TPO Admin Center'}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {role === 'student' && (
          <>
            <div className="nav-section-title">Main</div>
            <NavLink to="/student" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home size={18} /> Dashboard
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <User size={18} /> Placement Profile
            </NavLink>
            <NavLink to="/student/resume" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Upload size={18} /> AI Resume Upload
            </NavLink>

            <div className="nav-section-title">Opportunities</div>
            <NavLink to="/student/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} /> Placement Drives
            </NavLink>
            <NavLink to="/student/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> My Applications
            </NavLink>
            <NavLink to="/student/assessments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={18} /> Assessments
            </NavLink>
            <NavLink to="/student/interviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Video size={18} /> Interviews
            </NavLink>
            <NavLink to="/student/offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={18} /> Placement Offers
            </NavLink>

            <div className="nav-section-title">Intelligence & Vault</div>
            <NavLink to="/student/passport" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={18} /> Placement Passport
            </NavLink>
            <NavLink to="/student/career-twin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Compass size={18} /> AI Career Twin
            </NavLink>
            <NavLink to="/student/readiness" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Sparkles size={18} /> Readiness & Skill Gaps
            </NavLink>
            <NavLink to="/student/documents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FolderCheck size={18} /> Documents Vault
            </NavLink>
            <NavLink to="/student/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Bell size={18} /> Notifications
            </NavLink>
          </>
        )}

        {role === 'recruiter' && (
          <>
            <div className="nav-section-title">Hiring Management</div>
            <NavLink to="/recruiter" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home size={18} /> Dashboard
            </NavLink>
            <NavLink to="/recruiter/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Building size={18} /> Company Profile
            </NavLink>
            <NavLink to="/recruiter/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} /> My Job Openings
            </NavLink>
            <NavLink to="/recruiter/post-job" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} /> Post New Job & JD Parser
            </NavLink>

            <div className="nav-section-title">Candidate Pipeline</div>
            <NavLink to="/recruiter/candidates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Candidate Pool
            </NavLink>
            <NavLink to="/recruiter/explainable-ranking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Brain size={18} /> Explainable Ranking
            </NavLink>
            <NavLink to="/recruiter/shortlisting" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CheckSquare size={18} /> Shortlisting
            </NavLink>
            <NavLink to="/recruiter/assessments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={18} /> Assessments
            </NavLink>
            <NavLink to="/recruiter/interviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Video size={18} /> Interview Management
            </NavLink>
            <NavLink to="/recruiter/offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={18} /> Offers Released
            </NavLink>
            <NavLink to="/recruiter/documents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FolderCheck size={18} /> Documents Vault
            </NavLink>
            <NavLink to="/recruiter/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Bell size={18} /> Notifications
            </NavLink>
            <NavLink to="/recruiter/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} /> Hiring Analytics
            </NavLink>
          </>
        )}

        {role === 'tpo' && (
          <>
            <div className="nav-section-title">Institutional Overview</div>
            <NavLink to="/tpo" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} /> Command Center
            </NavLink>
            <NavLink to="/tpo/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Students
            </NavLink>
            <NavLink to="/tpo/companies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Building size={18} /> Companies & Recruiters
            </NavLink>
            <NavLink to="/tpo/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} /> Jobs & Requisitions
            </NavLink>
            <NavLink to="/tpo/drives" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Building size={18} /> Placement Drives
            </NavLink>

            <div className="nav-section-title">Pipeline Tracking</div>
            <NavLink to="/tpo/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> Applications
            </NavLink>
            <NavLink to="/tpo/interviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Video size={18} /> Interviews
            </NavLink>
            <NavLink to="/tpo/offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={18} /> Placement Offers
            </NavLink>

            <div className="nav-section-title">Placement Intelligence</div>
            <NavLink to="/tpo/risk-monitor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={18} /> At-Risk Students
            </NavLink>
            <NavLink to="/tpo/skills" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Sparkles size={18} /> Skill Intelligence
            </NavLink>
            <NavLink to="/tpo/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} /> Reports & Analytics
            </NavLink>

            <div className="nav-section-title">Governance & System</div>
            <NavLink to="/tpo/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={18} /> Placement Settings
            </NavLink>
            <NavLink to="/tpo/audit-logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <History size={18} /> Audit Logs
            </NavLink>
          </>
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <Sparkles size={16} color="var(--primary)" />
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
