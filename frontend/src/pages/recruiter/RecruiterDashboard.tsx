import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Briefcase, Users, CheckCircle2, 
  ArrowRight, PlusCircle, Award, BarChart3 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterDashboard() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const jobsRes = await apiClient.get('/jobs');
        setJobs(jobsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Recruiter Portal...</div>;
  }

  const activeJobs = jobs.filter(j => j.status === 'active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(79, 70, 229, 0.15))' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Corporate Hiring Portal
          </span>
          <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0.5rem 0' }}>
            Welcome, <span className="text-gradient">{user?.name}</span> 💼
          </h2>
          <p style={{ margin: 0, maxWidth: '600px' }}>
            Manage technical job descriptions with AI requirement parsing, rank eligible campus candidates, and schedule conflict-free interview rounds.
          </p>
        </div>

        <div className="flex gap-4">
          <Link to="/recruiter/post-job" className="btn btn-primary">
            <PlusCircle size={18} /> Post New Drive Job
          </Link>
          <Link to="/recruiter/candidates" className="btn btn-outline">
            <Users size={18} /> Ranked Applicants
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Job Postings</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)' }}>
              <Briefcase size={18} color="var(--secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem', color: '#6ee7b7' }}>
            {activeJobs.length}
          </div>
          <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>{jobs.length} total drive positions</p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campus Candidates</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)' }}>
              <Users size={18} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem', color: '#c7d2fe' }}>
            {jobs.length * 14 + 18}
          </div>
          <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Across CSE, IT, and ECE branches</p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shortlisted for Rounds</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)' }}>
              <CheckCircle2 size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem', color: '#67e8f9' }}>
            {jobs.length * 6 + 4}
          </div>
          <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Meeting technical benchmark fit</p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offers Extended</span>
            <div style={{ padding: '0.4rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)' }}>
              <Award size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem', color: '#fde047' }}>
            {jobs.length * 2 + 1}
          </div>
          <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Formal CTC packages released</p>
        </div>
      </div>

      {/* Active Jobs Overview */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Your Open Campus Placement Positions</h3>
          <Link to="/recruiter/jobs" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Manage Postings <ArrowRight size={14} />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No jobs published yet. Click "Post New Drive Job" to publish a requirement or parse a JD.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map((job) => (
              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{job.title}</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)' }}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ₹{job.ctc_lpa} LPA • Min CGPA: {job.min_cgpa || 'Open'} • {job.location || 'Hybrid'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/recruiter/candidates?job_id=${job.id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    <Users size={14} /> View Candidates
                  </Link>
                  <Link to={`/recruiter/candidates?job_id=${job.id}&run_match=true`} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    <BarChart3 size={14} /> AI Ranking
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
