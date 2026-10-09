import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { BookOpen, CheckCircle, Clock, ExternalLink } from 'lucide-react';

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await apiClient.get('/students/me/assessments');
        setAssessments(res.data || []);
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading scheduled assessments...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Online Technical & Aptitude Assessments</h2>
        <p>Take scheduled drive screening tests, review test deadlines, and track your evaluation scores.</p>
      </div>

      {assessments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Assessments Assigned</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Once a recruiter shortlists your application for an online test or coding assessment, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assessments.map((test) => (
            <div key={test.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', fontWeight: 600 }}>
                    {test.company_name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {test.duration_minutes} Mins • {test.total_questions} Questions
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.35rem 0' }}>{test.assessment_name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Target Role: <strong style={{ color: 'var(--text-primary)' }}>{test.job_title}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {test.status === 'Completed' ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle size={16} /> Completed
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score: {test.score}/100</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--warning)', fontSize: '0.8rem' }}>
                      <Clock size={14} /> Deadline: Oct 15, 2026
                    </div>
                    <a 
                      href={test.test_link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                    >
                      Launch Test <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
