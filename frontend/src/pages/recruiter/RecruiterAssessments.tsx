import { useState } from 'react';
import { BookOpen, PlusCircle, CheckCircle2, Users } from 'lucide-react';

export default function RecruiterAssessments() {
  const [assessments, setAssessments] = useState([
    {
      id: '1',
      title: 'Full Stack Coding & Algorithm Test',
      type: 'Technical Challenge',
      duration_minutes: 60,
      total_candidates: 18,
      completed_count: 14,
      avg_score: 84.5,
      status: 'Active',
      deadline: 'Tomorrow, 11:59 PM',
    },
    {
      id: '2',
      title: 'Python, SQL & Backend Architecture Screening',
      type: 'Domain Screening',
      duration_minutes: 45,
      total_candidates: 12,
      completed_count: 12,
      avg_score: 79.2,
      status: 'Completed',
      deadline: 'Completed',
    },
    {
      id: '3',
      title: 'Cognitive & Quantitative Aptitude Round',
      type: 'Aptitude Test',
      duration_minutes: 30,
      total_candidates: 24,
      completed_count: 22,
      avg_score: 88.0,
      status: 'Active',
      deadline: 'Sept 28, 6:00 PM',
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Coding & System Design');
  const [newDuration, setNewDuration] = useState('60');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    setAssessments([
      {
        id: Date.now().toString(),
        title: newTitle,
        type: newType,
        duration_minutes: parseInt(newDuration),
        total_candidates: 15,
        completed_count: 0,
        avg_score: 0,
        status: 'Active',
        deadline: '3 Days Remaining',
      },
      ...assessments
    ]);

    setShowCreateModal(false);
    setNewTitle('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Technical Assessments & Screening Tests</h2>
          <p style={{ margin: 0 }}>Create technical screening tests, track completion rates, and inspect candidate scores.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <PlusCircle size={16} /> Create Assessment Test
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Tests Created</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{assessments.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Candidates Tested</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>54</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde047' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg. Batch Score</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>83.9%</div>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {assessments.map((a) => (
          <div key={a.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{a.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.type}</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: a.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)', color: a.status === 'Active' ? 'var(--secondary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                {a.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                <span style={{ fontWeight: 600 }}>{a.duration_minutes} minutes</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Submission Rate:</span>
                <span style={{ fontWeight: 600 }}>{a.completed_count} / {a.total_candidates} completed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Batch Average:</span>
                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{a.avg_score}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deadline:</span>
                <span>{a.deadline}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
                Inspect Candidate Scores & Reports
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Create Technical Screening Test</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Assign online coding challenges or multiple-choice assessments to shortlisted candidates.
            </p>

            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Assessment Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. React & Node.js System Architecture Test"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Assessment Category</label>
                <select className="input-field" value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option value="Coding & Algorithm">Coding & Algorithm</option>
                  <option value="Domain Screening">Domain Technical Screening</option>
                  <option value="Cognitive & Aptitude">Cognitive Aptitude</option>
                  <option value="System Architecture">System Architecture</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Test Duration (Minutes)</label>
                <input
                  type="number"
                  className="input-field"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Deploy to Shortlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
