import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Sidebar from './components/layout/Sidebar';

// Layout Component with Sidebar Shell
const DashboardLayout = () => {
  const { user } = useAuthStore();

  return (
    <div className="app-shell">
      <Sidebar role={user?.role || 'student'} />
      <div className="main-content-wrapper">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome,</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 600 }}>
              {user?.role}
            </span>
          </div>
        </header>
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  
  return <DashboardLayout />;
};

// Auth & Dashboards
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobs from './pages/student/StudentJobs';
import StudentResume from './pages/student/StudentResume';
import StudentApplications from './pages/student/StudentApplications';
import StudentPassport from './pages/student/StudentPassport';
import StudentReadiness from './pages/student/StudentReadiness';
import StudentCareerTwin from './pages/student/StudentCareerTwin';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentInterviews from './pages/student/StudentInterviews';
import StudentOffers from './pages/student/StudentOffers';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentNotifications from './pages/student/StudentNotifications';

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterCompanyProfile from './pages/recruiter/RecruiterCompanyProfile';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterPostJob from './pages/recruiter/RecruiterPostJob';
import RecruiterCandidates from './pages/recruiter/RecruiterCandidates';
import RecruiterExplainableRanking from './pages/recruiter/RecruiterExplainableRanking';
import RecruiterShortlisting from './pages/recruiter/RecruiterShortlisting';
import RecruiterAssessments from './pages/recruiter/RecruiterAssessments';
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews';
import RecruiterOffers from './pages/recruiter/RecruiterOffers';
import RecruiterDocuments from './pages/recruiter/RecruiterDocuments';
import RecruiterNotifications from './pages/recruiter/RecruiterNotifications';
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics';

import TPODashboard from './pages/tpo/TPODashboard';
import TPOStudents from './pages/tpo/TPOStudents';
import TPOCompanies from './pages/tpo/TPOCompanies';
import TPOJobs from './pages/tpo/TPOJobs';
import TPODrives from './pages/tpo/TPODrives';
import TPOApplications from './pages/tpo/TPOApplications';
import TPOInterviews from './pages/tpo/TPOInterviews';
import TPOOffers from './pages/tpo/TPOOffers';
import TPORiskMonitor from './pages/tpo/TPORiskMonitor';
import TPOSkills from './pages/tpo/TPOSkills';
import TPOAnalytics from './pages/tpo/TPOAnalytics';
import TPOSettings from './pages/tpo/TPOSettings';
import TPOAuditLogs from './pages/tpo/TPOAuditLogs';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/resume" element={<StudentResume />} />
          <Route path="/student/jobs" element={<StudentJobs />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/passport" element={<StudentPassport />} />
          <Route path="/student/career-twin" element={<StudentCareerTwin />} />
          <Route path="/student/readiness" element={<StudentReadiness />} />
          <Route path="/student/assessments" element={<StudentAssessments />} />
          <Route path="/student/interviews" element={<StudentInterviews />} />
          <Route path="/student/offers" element={<StudentOffers />} />
          <Route path="/student/documents" element={<StudentDocuments />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
        </Route>
        
        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/recruiter/profile" element={<RecruiterCompanyProfile />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/post-job" element={<RecruiterPostJob />} />
          <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
          <Route path="/recruiter/explainable-ranking" element={<RecruiterExplainableRanking />} />
          <Route path="/recruiter/shortlisting" element={<RecruiterShortlisting />} />
          <Route path="/recruiter/assessments" element={<RecruiterAssessments />} />
          <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
          <Route path="/recruiter/offers" element={<RecruiterOffers />} />
          <Route path="/recruiter/documents" element={<RecruiterDocuments />} />
          <Route path="/recruiter/notifications" element={<RecruiterNotifications />} />
          <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
        </Route>
        
        {/* TPO Routes */}
        <Route element={<ProtectedRoute allowedRoles={['tpo']} />}>
          <Route path="/tpo" element={<TPODashboard />} />
          <Route path="/tpo/students" element={<TPOStudents />} />
          <Route path="/tpo/companies" element={<TPOCompanies />} />
          <Route path="/tpo/jobs" element={<TPOJobs />} />
          <Route path="/tpo/drives" element={<TPODrives />} />
          <Route path="/tpo/applications" element={<TPOApplications />} />
          <Route path="/tpo/interviews" element={<TPOInterviews />} />
          <Route path="/tpo/offers" element={<TPOOffers />} />
          <Route path="/tpo/risk-monitor" element={<TPORiskMonitor />} />
          <Route path="/tpo/skills" element={<TPOSkills />} />
          <Route path="/tpo/analytics" element={<TPOAnalytics />} />
          <Route path="/tpo/settings" element={<TPOSettings />} />
          <Route path="/tpo/audit-logs" element={<TPOAuditLogs />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
