import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Sparkles, CheckCircle2, XCircle, Award, 
  ChevronRight, Calendar 
} from 'lucide-react';

export default function RecruiterCandidates() {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get('job_id') || '';

  const [jobs, setJobs] = useState<any[]>([]);
  const [currentJobId, setCurrentJobId] = useState(selectedJobId);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Scheduling state modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    round_name: 'Technical Round 1',
    round_number: 1,
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duration_minutes: 45,
    location_or_link: 'https://meet.google.com/campuslink-interview-slot',
  });
  const [scheduling, setScheduling] = useState(false);

  // Offer Issuance modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerData, setOfferData] = useState({
    role: 'Software Development Engineer',
    ctc_lpa: 12.0,
    location: 'Bangalore, India',
  });
  const [issuingOffer, setIssuingOffer] = useState(false);

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIssuingOffer(true);
    try {
      await apiClient.post('/offers', {
        application_id: selectedCandidate.application_id,
        role: offerData.role,
        ctc_lpa: offerData.ctc_lpa,
        location: offerData.location,
      });

      setShowOfferModal(false);
      setMessage(`Placement Offer released successfully for ${selectedCandidate.student_name}!`);
      loadCandidates(currentJobId);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to issue offer');
    } finally {
      setIssuingOffer(false);
    }
  };

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiClient.get('/jobs');
        setJobs(res.data || []);
        if (!currentJobId && res.data.length > 0) {
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

  const loadCandidates = async (jobId: string) => {
    if (!jobId) return;
    setLoading(true);
    try {
      // First check matches
      const res = await apiClient.get(`/jobs/${jobId}/matches`);
      if (res.data && res.data.length > 0) {
        setCandidates(res.data);
      } else {
        // Trigger auto-matching
        const matchRes = await apiClient.post(`/jobs/${jobId}/match`);
        setCandidates(matchRes.data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentJobId) {
      loadCandidates(currentJobId);
    }
  }, [currentJobId]);

  const handleRunAiMatching = async () => {
    if (!currentJobId) return;
    setMatching(true);
    setMessage('');
    try {
      const res = await apiClient.post(`/jobs/${currentJobId}/match`);
      setCandidates(res.data.matches || []);
      setMessage(`AI Matching executed! Ranked ${res.data.total_matched} candidates with 7-factor explainability.`);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to run matching.');
    } finally {
      setMatching(false);
    }
  };

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      await apiClient.patch(`/applications/${appId}/status`, { status });
      setMessage(`Candidate status updated to ${status.toUpperCase()}!`);
      loadCandidates(currentJobId);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setScheduling(true);
    try {
      await apiClient.post('/interviews', {
        application_id: selectedCandidate.application_id,
        round_name: scheduleData.round_name,
        round_number: scheduleData.round_number,
        scheduled_at: scheduleData.scheduled_at,
        duration_minutes: scheduleData.duration_minutes,
        location_or_link: scheduleData.location_or_link,
      });

      // Update application to interviewing
      await apiClient.patch(`/applications/${selectedCandidate.application_id}/status`, { status: 'interviewing' });

      setShowScheduleModal(false);
      setMessage(`Interview round scheduled conflict-free for ${selectedCandidate.student_name}!`);
      loadCandidates(currentJobId);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Scheduling failed');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Candidate Pool & AI Ranked Applicants</h2>
          <p style={{ margin: 0 }}>Review applicant rankings scored via 7-factor research model with full explainability.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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

          <button 
            onClick={handleRunAiMatching} 
            className="btn btn-primary"
            disabled={matching || !currentJobId}
          >
            <Sparkles size={16} /> {matching ? 'Ranking...' : 'Re-Run AI Matching'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading ranked candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Candidates Applied Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Once students apply to this position, our match engine will automatically rank them.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedCandidate ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Candidates List Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Rank</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Branch</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>CGPA</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>AI Match</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, idx) => (
                  <tr 
                    key={c.student_id || idx} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selectedCandidate?.student_id === c.student_id ? 'rgba(79, 70, 229, 0.1)' : 'transparent' }}
                    onClick={() => setSelectedCandidate(c)}
                  >
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: idx === 0 ? '#fde047' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#d97706' : 'var(--text-secondary)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>
                      {c.student_name}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {c.branch || 'CSE'}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {c.cgpa || '8.2'}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '10px', background: c.overall_score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)', color: c.overall_score >= 80 ? 'var(--secondary)' : '#a5b4fc', fontWeight: 700 }}>
                        {Math.round(c.overall_score || 85)}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {c.application_status ? c.application_status.toUpperCase() : 'APPLIED'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedCandidate(c); }}
                      >
                        Inspect Match <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explainable AI Match Drawer */}
          {selectedCandidate && (
            <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{selectedCandidate.student_name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Branch: {selectedCandidate.branch || 'CSE'} • CGPA: {selectedCandidate.cgpa || '8.2'}</div>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Match Score Spotlight */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Overall AI Match Rating</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {Math.round(selectedCandidate.overall_score || 85)}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '0.25rem' }}>
                  {selectedCandidate.explanation || 'Strong correlation with mandatory technical stack.'}
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6ee7b7', marginBottom: '0.35rem' }}>
                  Matched Skills:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {(selectedCandidate.matched_skills || ['Python', 'SQL', 'React']).map((s: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fde047', marginBottom: '0.35rem' }}>
                  Missing Criteria:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(selectedCandidate.missing_skills || ['Docker']).map((s: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde047' }}>
                      - {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Shortlist, Interview, Offer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <Calendar size={16} /> Schedule Smart Interview
                </button>

                <button
                  onClick={() => setShowOfferModal(true)}
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '0.85rem', borderColor: '#fde047', color: '#fde047' }}
                >
                  <Award size={16} /> Issue Placement Offer
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleStatusChange(selectedCandidate.application_id, 'shortlisted')}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                  >
                    <CheckCircle2 size={14} /> Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCandidate.application_id, 'rejected')}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offer Issuance Modal */}
      {showOfferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Issue Campus Placement Offer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Candidate: <strong>{selectedCandidate?.student_name}</strong>
            </p>

            <form onSubmit={handleIssueOffer}>
              <div className="input-group">
                <label className="input-label">Role Designation</label>
                <input
                  type="text"
                  className="input-field"
                  value={offerData.role}
                  onChange={(e) => setOfferData({ ...offerData, role: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">CTC (in LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={offerData.ctc_lpa}
                    onChange={(e) => setOfferData({ ...offerData, ctc_lpa: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Work Location</label>
                  <input
                    type="text"
                    className="input-field"
                    value={offerData.location}
                    onChange={(e) => setOfferData({ ...offerData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowOfferModal(false)} 
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={issuingOffer}
                >
                  {issuingOffer ? 'Releasing Offer...' : 'Release Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Scheduling Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Schedule Smart Interview Slot</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Candidate: <strong>{selectedCandidate?.student_name}</strong>
            </p>

            <form onSubmit={handleCreateSchedule}>
              <div className="input-group">
                <label className="input-label">Round Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={scheduleData.round_name}
                  onChange={(e) => setScheduleData({ ...scheduleData, round_name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Date & Time Slot</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={scheduleData.scheduled_at}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduled_at: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Duration (Minutes)</label>
                <input
                  type="number"
                  className="input-field"
                  value={scheduleData.duration_minutes}
                  onChange={(e) => setScheduleData({ ...scheduleData, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Meeting Video Link / Room Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={scheduleData.location_or_link}
                  onChange={(e) => setScheduleData({ ...scheduleData, location_or_link: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)} 
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={scheduling}
                >
                  {scheduling ? 'Scheduling...' : 'Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
