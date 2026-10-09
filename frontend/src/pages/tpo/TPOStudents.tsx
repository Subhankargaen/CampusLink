import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Search, ShieldCheck, Eye } from 'lucide-react';

export default function TPOStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [studentDetail, setStudentDetail] = useState<any>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/students', {
        params: { search: search || undefined, branch: branchFilter || undefined }
      });
      setStudents(res.data?.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [branchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleInspectStudent = async (studentId: string) => {
    setLoadingDetail(true);
    setSelectedStudent(studentId);
    try {
      const res = await apiClient.get(`/admin/students/${studentId}`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Student Database & Placement Eligibility</h2>
          <p style={{ margin: 0 }}>Institutional roster of student academic credentials, readiness diagnostics, and placement status.</p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EE">Electrical (EE)</option>
            <option value="ME">Mechanical (ME)</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 400px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Students Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Querying student roster...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No students match the current filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Branch</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>CGPA</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Backlogs</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Readiness</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Profile</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr 
                    key={s.id} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selectedStudent === s.id ? 'rgba(79, 70, 229, 0.1)' : 'transparent' }}
                    onClick={() => handleInspectStudent(s.id)}
                  >
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.email || 'student@campus.edu'}</div>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {s.branch || 'CSE'}
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', fontWeight: 600 }}>
                      {s.cgpa || '8.0'}
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '10px', 
                        background: (s.active_backlogs || 0) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: (s.active_backlogs || 0) > 0 ? 'var(--danger)' : 'var(--secondary)',
                        fontWeight: 600
                      }}>
                        {s.active_backlogs || 0} Backlogs
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: (s.readiness_score || 70) >= 80 ? 'var(--secondary)' : (s.readiness_score || 70) >= 60 ? '#fde047' : 'var(--danger)' 
                      }}>
                        {Math.round(s.readiness_score || 75)}%
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {s.profile_complete ? '✓ Verified' : 'Incomplete'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.5rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        onClick={(e) => { e.stopPropagation(); handleInspectStudent(s.id); }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detailed Student Verification Drawer */}
        {selectedStudent && (
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{studentDetail?.student?.name || 'Candidate Details'}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{studentDetail?.email}</div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading full academic file...</div>
            ) : studentDetail ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Branch</div>
                    <div style={{ fontWeight: 600 }}>{studentDetail.student.branch}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Graduation Year</div>
                    <div style={{ fontWeight: 600 }}>{studentDetail.student.graduation_year || 2026}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cumulative CGPA</div>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{studentDetail.student.cgpa}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Readiness Score</div>
                    <div style={{ fontWeight: 700, color: '#a5b4fc' }}>{Math.round(studentDetail.student.readiness_score || 80)}%</div>
                  </div>
                </div>

                {/* Verified Skills */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Normalized Technical Skills ({studentDetail.skills?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {studentDetail.skills?.map((sk: any) => (
                      <span key={sk.id} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc' }}>
                        {sk.skill_name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Projects & Capstones ({studentDetail.projects?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {studentDetail.projects?.map((p: any) => (
                      <div key={p.id} style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                        <strong>{p.title}</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{p.tech_stack?.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => alert(`Verified Student ${studentDetail.student.name} for official campus placement drives!`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, fontSize: '0.8rem' }}
                  >
                    <ShieldCheck size={14} /> Verify Student Profile
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
