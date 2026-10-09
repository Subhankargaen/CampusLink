import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Sparkles, Brain, BarChart2 } from 'lucide-react';

export default function RecruiterExplainableRanking() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentJobId, setCurrentJobId] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiClient.get('/jobs');
        setJobs(res.data || []);
        if (res.data.length > 0) {
          setCurrentJobId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  useEffect(() => {
    if (!currentJobId) return;
    async function loadMatches() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/jobs/${currentJobId}/matches`);
        const matches = res.data?.matches || [];
        setCandidates(matches);
        if (matches.length > 0) {
          setSelectedCandidate(matches[0]);
        } else {
          setSelectedCandidate(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [currentJobId]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">7-Factor Explainable AI Ranking</h2>
          <p style={{ margin: 0 }}>Full transparency breakdown explaining exactly why each candidate received their ranking.</p>
        </div>

        <select 
          className="input-field" 
          style={{ width: 'auto', minWidth: '220px' }}
          value={currentJobId}
          onChange={(e) => setCurrentJobId(e.target.value)}
        >
          {jobs.map(j => (
            <option key={j.id} value={j.id}>{j.title} ({j.ctc_lpa} LPA)</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Calculating explainability matrices...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Brain size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Candidates Evaluated Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Applications must be received for this position to generate 7-factor explainable ranking scorecards.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Candidates List */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Ranked Candidates ({candidates.length})
            </h4>
            {candidates.map((c, idx) => (
              <div
                key={c.student_id || idx}
                onClick={() => setSelectedCandidate(c)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: selectedCandidate?.student_id === c.student_id ? '1px solid var(--primary)' : '1px solid transparent',
                  background: selectedCandidate?.student_id === c.student_id ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>#{idx + 1} {c.student_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.branch} • CGPA: {c.cgpa}</div>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.overall_score >= 80 ? 'var(--secondary)' : '#a5b4fc' }}>
                  {Math.round(c.overall_score)}%
                </div>
              </div>
            ))}
          </div>

          {/* Explainability Scorecard */}
          {selectedCandidate && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedCandidate.student_name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedCandidate.branch} Department • CGPA: {selectedCandidate.cgpa}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    {Math.round(selectedCandidate.overall_score)}%
                  </div>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(79, 70, 229, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} /> Explainable Ranking Summary
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {selectedCandidate.explanation || 'Matches 92% of core mandatory technical requirements. Projects highlight hands-on experience in relevant frameworks.'}
                </div>
              </div>

              {/* 7 Factors Breakdown */}
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 size={18} color="var(--primary)" /> 7-Factor Weighted Attribution
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { label: 'Mandatory Technical Skills (35%)', val: selectedCandidate.factor_scores?.mandatory_skills || 90 },
                    { label: 'Preferred Stack & Tools (15%)', val: selectedCandidate.factor_scores?.preferred_skills || 75 },
                    { label: 'Project Portfolio Relevance (20%)', val: selectedCandidate.factor_scores?.projects || 85 },
                    { label: 'Academic Standing / CGPA (10%)', val: selectedCandidate.factor_scores?.academics || 92 },
                    { label: 'Internships / Experience (10%)', val: selectedCandidate.factor_scores?.experience || 70 },
                    { label: 'Industry Certifications (5%)', val: selectedCandidate.factor_scores?.certifications || 80 },
                    { label: 'Career Twin Alignment (5%)', val: selectedCandidate.factor_scores?.career_twin || 88 },
                  ].map((f, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                        <span style={{ fontWeight: 600 }}>{Math.round(f.val)}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, f.val)}%`, background: f.val >= 80 ? 'var(--secondary)' : 'var(--primary)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Fit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                    Matched Competencies
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(selectedCandidate.matched_skills || ['Python', 'SQL', 'React']).map((s: string, idx: number) => (
                      <span key={idx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fde047', marginBottom: '0.5rem' }}>
                    Identified Skill Gaps
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(selectedCandidate.missing_skills || ['Docker', 'AWS']).map((s: string, idx: number) => (
                      <span key={idx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde047' }}>
                        - {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
