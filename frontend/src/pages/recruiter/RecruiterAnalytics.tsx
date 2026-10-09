import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { BarChart3, Users, Briefcase, Award, TrendingUp } from 'lucide-react';

export default function RecruiterAnalytics() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get('/jobs');
        setJobs(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const totalDrives = jobs.length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Recruitment Funnel & Hiring Analytics</h2>
        <p style={{ margin: 0 }}>Inspect campus drive performance, applicant conversion rates, and time-to-hire metrics.</p>
      </div>

      {/* Top Level Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Positions</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalDrives || 4}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Applied Candidates</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>24</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde047' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shortlist Conversion</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>62.5%</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Offers Released</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>8</div>
          </div>
        </div>
      </div>

      {/* Recruitment Funnel Visualizer */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="var(--primary)" /> Campus Hiring Pipeline Funnel
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Stage 1: Profile Scanned & Eligible Pool</span>
              <span style={{ fontWeight: 600 }}>100% (45 Candidates)</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #4f46e5, #6366f1)', borderRadius: '6px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Stage 2: AI Matched & Applied</span>
              <span style={{ fontWeight: 600 }}>53.3% (24 Candidates)</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '53.3%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '6px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Stage 3: Technical Shortlist & Assessments</span>
              <span style={{ fontWeight: 600 }}>33.3% (15 Candidates)</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '33.3%', background: 'linear-gradient(90deg, #818cf8, #a5b4fc)', borderRadius: '6px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Stage 4: Virtual Interview Rounds</span>
              <span style={{ fontWeight: 600 }}>24.4% (11 Candidates)</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '24.4%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '6px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Stage 5: Final Placement Offers Released</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>17.7% (8 Offers)</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '17.7%', background: 'var(--secondary)', borderRadius: '6px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
