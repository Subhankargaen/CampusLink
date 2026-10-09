import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { 
  Sparkles, AlertTriangle, CheckCircle2, ArrowRight, 
  Target, Layers, RefreshCw 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentReadiness() {
  const [readinessData, setReadinessData] = useState<any>(null);
  const [skillGapsData, setSkillGapsData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const fetchData = async () => {
    try {
      const [readinessRes, gapsRes, roadmapRes] = await Promise.all([
        apiClient.get('/students/me/readiness'),
        apiClient.get('/students/me/skill-gaps'),
        apiClient.get('/students/me/career-roadmap'),
      ]);
      setReadinessData(readinessRes.data);
      setSkillGapsData(gapsRes.data);
      setRoadmapData(roadmapRes.data);
    } catch (err) {
      console.error('Error fetching readiness data:', err);
    } finally {
      setLoading(false);
      setRecomputing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRecomputing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin text-gradient" size={36} />
          <p className="mt-4">Computing AI Placement Readiness & Market Skill Gaps...</p>
        </div>
      </div>
    );
  }

  const score = Math.round(readinessData?.readiness_score || 0);
  const factors = readinessData?.factors || {};

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(16, 185, 129, 0.15))' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            AI Diagnostics & Skill Benchmark
          </span>
          <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0.5rem 0' }} className="text-gradient">
            Placement Readiness & Skill Gap Analysis
          </h2>
          <p style={{ margin: 0, maxWidth: '600px' }}>
            Multi-signal evaluation benchmarked against real-time campus recruitment requirements, active job listings, and hiring criteria.
          </p>
        </div>

        <button 
          onClick={handleRefresh} 
          className="btn btn-outline" 
          disabled={recomputing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={recomputing ? 'animate-spin' : ''} />
          {recomputing ? 'Recomputing...' : 'Re-calculate Index'}
        </button>
      </div>

      {/* Main Readiness Gauge + 5 Multi-Factor Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Readiness Circular/Gauge Card */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: `6px solid ${score >= 70 ? 'var(--secondary)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 25px ${score >= 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`,
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1 }}>{score}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Index</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            {score >= 70 ? 'Tier-1 Ready' : score >= 40 ? 'Moderate Readiness' : 'Urgent Optimization Needed'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: 0 }}>
            {score >= 70 
              ? 'High chance of clearing technical screening rounds and shortlist filters.'
              : 'Add more verified project tech-stacks and certifications to surpass the 70% benchmark.'}
          </p>
        </div>

        {/* 5 Weighted Factor Bars */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary)" /> 5-Signal Factor Decomposition
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Academic & Profile Record (20%)', score: factors.profile_completeness?.score || 0 },
              { label: `Verified Skills Index (25%) - ${factors.skills?.count || 0} skills`, score: factors.skills?.score || 0 },
              { label: `Technical Projects (25%) - ${factors.projects?.count || 0} projects`, score: factors.projects?.score || 0 },
              { label: `Internships & Experience (20%) - ${factors.experience?.count || 0} items`, score: factors.experience?.score || 0 },
              { label: `Certifications (10%) - ${factors.certifications?.count || 0} items`, score: factors.certifications?.score || 0 },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{f.label}</span>
                  <span style={{ fontWeight: 600 }}>{f.score}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${f.score}%`, 
                    height: '100%', 
                    background: f.score >= 70 ? 'var(--secondary)' : f.score >= 40 ? 'var(--warning)' : 'var(--primary)',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Gaps vs Market Demand Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Acquired Skills */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <CheckCircle2 size={18} color="var(--secondary)" /> Market-Aligned Skills Owned
            </h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)' }}>
              {skillGapsData?.owned_skills?.length || 0} Skills
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skillGapsData?.owned_skills && skillGapsData.owned_skills.length > 0 ? (
              skillGapsData.owned_skills.map((s: any, idx: number) => (
                <div key={idx} style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span>{s.skill}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({s.demand_count} jobs)</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No active skills identified matching campus recruiter requirements.
              </p>
            )}
          </div>
        </div>

        {/* High Priority Skill Gaps */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#fde047' }}>
              <AlertTriangle size={18} /> High-Demand Skill Gaps
            </h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fde047' }}>
              Priority Learn
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {skillGapsData?.skill_gaps && skillGapsData.skill_gaps.length > 0 ? (
              skillGapsData.skill_gaps.slice(0, 6).map((g: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fef08a' }}>{g.skill}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>• In {g.demand_count} open postings</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: g.priority === 'high' ? 'var(--danger)' : 'var(--warning)', textTransform: 'uppercase' }}>
                    {g.priority}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Zero skill gaps! You match all current drive criteria.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Strategic Roadmap */}
      {roadmapData && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Target size={20} color="var(--primary)" /> 3-Step Action Plan to Reach 85%+ Placement Readiness
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {roadmapData.immediate_actions?.map((action: string, i: number) => (
              <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)', display: 'flex', gap: '0.75rem' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {i + 1}
                </span>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{action}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Completed updating your skills or experience?
            </span>
            <Link to="/student/profile" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Update Profile Records <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
