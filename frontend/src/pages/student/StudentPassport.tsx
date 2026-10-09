import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Award, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function StudentPassport() {
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPassport() {
      try {
        const res = await apiClient.get('/students/me/passport');
        setPassport(res.data);
      } catch (err) {
        console.error('Failed to load passport:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Generating Placement Passport...</div>;
  }

  const readiness = Math.round(passport?.readiness_score || 0);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(16, 185, 129, 0.15))', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Award size={24} color="var(--secondary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--secondary)' }}>
                Official CampusLink Placement Passport
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{passport?.student?.name}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Branch: <strong>{passport?.student?.branch || 'Not Set'}</strong> • Batch: <strong>{passport?.student?.graduation_year || '2026'}</strong> • CGPA: <strong>{passport?.student?.cgpa || 'N/A'}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Readiness Score</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: readiness >= 70 ? 'var(--secondary)' : readiness >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
              {readiness}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 500 }}>
              {readiness >= 70 ? 'High Placement Probability' : 'Needs Optimization'}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Triple Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Profile Completeness</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
            {passport?.profile_completeness || 0}%
          </div>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>Verified academic & project markers</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Skill Coverage Rate</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
            {Math.round(passport?.skill_coverage_rate || 0)}%
          </div>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>Benchmark against industry requisites</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drives Applied</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
            {passport?.application_count || 0}
          </div>
          <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>{passport?.interview_count || 0} interview invites scheduled</p>
        </div>
      </div>

      {/* Skills & Gaps Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Verified Skills */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={18} color="var(--secondary)" /> Verified Technical Competencies
          </h3>
          {passport?.skills && passport.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {passport.skills.map((s: any, idx: number) => (
                <span key={idx} style={{ padding: '0.35rem 0.75rem', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe', fontSize: '0.85rem', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem' }}>No skills verified yet. Upload your resume or add skills in Profile.</p>
          )}
        </div>

        {/* AI Skill Gaps */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fde047' }}>
            <AlertTriangle size={18} /> High-Impact Skill Gaps (To Learn)
          </h3>
          {passport?.skill_gaps && passport.skill_gaps.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {passport.skill_gaps.map((gap: string, idx: number) => (
                <span key={idx} style={{ padding: '0.35rem 0.75rem', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde047', fontSize: '0.85rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  + {gap}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Excellent! You have solid baseline coverage.</p>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {passport?.career_recommendations && passport.career_recommendations.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="var(--primary)" /> AI Strategic Roadmap & Recommendations
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {passport.career_recommendations.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
