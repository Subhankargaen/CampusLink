import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Compass } from 'lucide-react';

export default function StudentCareerTwin() {
  const [twinData, setTwinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTwin() {
      try {
        const res = await apiClient.get('/students/me/career-twin');
        setTwinData(res.data);
      } catch (err) {
        console.error('Failed to load career twin:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTwin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Compass className="animate-spin text-gradient" size={40} />
          <p className="mt-4">Simulating AI Career Twin & Archetype Directions...</p>
        </div>
      </div>
    );
  }

  const profiles = twinData?.career_twin_profiles || [];
  const top = twinData?.primary_recommendation;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(192, 132, 252, 0.15))' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          AI Persona & Trajectory Modeling
        </span>
        <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0.5rem 0' }} className="text-gradient">
          AI Career Twin Direction Engine
        </h2>
        <p style={{ margin: 0, maxWidth: '640px' }}>
          By synthesizing your verified academic records, detected resume skills, and project portfolios, Career Twin models four distinct industry archetypes with transparent explainability.
        </p>
      </div>

      {/* Top Match Spotlight */}
      {top && (
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(79, 70, 229, 0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'rgba(79, 70, 229, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600 }}>
            ★ Primary Match Target
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', margin: 0 }}>{top.target_role}</h3>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>
              {top.match_confidence}% Match
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{top.description}</p>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginBottom: '0.25rem' }}>
              Why this Career Direction? (AI Explainability)
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{top.why_this_role}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Matched Skills:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {top.matched_skills.map((s: string, idx: number) => (
                  <span key={idx} style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', fontSize: '0.8rem' }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Recommended Gap Skills:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {top.recommended_skills_to_acquire.map((s: string, idx: number) => (
                  <span key={idx} style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde047', fontSize: '0.8rem' }}>
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Archetypes */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Explore Alternative Career Trajectories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {profiles.slice(1).map((p: any, idx: number) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{p.target_role}</h4>
                  <span style={{ fontWeight: 700, color: p.match_confidence >= 70 ? 'var(--secondary)' : 'var(--warning)' }}>
                    {p.match_confidence}%
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.75rem' }}>{p.demand_level}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{p.description}</p>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Top Additions Needed:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {p.recommended_skills_to_acquire.map((s: string, i: number) => (
                    <span key={i} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
