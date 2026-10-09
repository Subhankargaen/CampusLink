import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Award, User, MapPin, Calendar, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await apiClient.get('/offers/my-offers').catch(() => ({ data: [] }));
        setOffers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-gradient">Issued Placement Offers</h2>
          <p style={{ margin: 0 }}>Track released compensation packages, candidate acceptance, and joining status.</p>
        </div>
        <Link to="/recruiter/candidates" className="btn btn-primary">
          <PlusCircle size={16} /> Issue New Offer
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading issued offers...</div>
      ) : offers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Award size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3>No Offers Released Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto', color: 'var(--text-secondary)' }}>
            After evaluating candidates in the Ranked Applicants pool, you can issue formal offer letters directly with CTC LPA.
          </p>
          <Link to="/recruiter/candidates" className="btn btn-outline">
            View Candidate Pool
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {offers.map((offer) => (
            <div key={offer.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{offer.role}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Job: {offer.job_title || 'Software Role'}</div>
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.55rem', 
                  borderRadius: '12px', 
                  background: offer.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : offer.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                  color: offer.status === 'accepted' ? 'var(--secondary)' : offer.status === 'rejected' ? 'var(--danger)' : '#fde047',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {offer.status || 'PENDING'}
                </span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Package Offered</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {offer.ctc_lpa} LPA
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={15} color="var(--primary)" />
                  <span>Candidate: <strong>{offer.student_name || 'Candidate'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={15} color="var(--text-secondary)" />
                  <span>Location: {offer.location || 'Bangalore'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} color="var(--text-secondary)" />
                  <span>Released: {new Date(offer.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
