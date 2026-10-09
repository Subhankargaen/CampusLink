import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Award, CheckCircle2, XCircle, MapPin, Calendar, FileText } from 'lucide-react';

export default function StudentOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadOffers = async () => {
    try {
      const res = await apiClient.get('/offers/my-offers');
      setOffers(res.data || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleDecision = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiClient.patch(`/offers/${offerId}`, { status });
      setActionMsg(`Offer has been marked as ${status.toUpperCase()}!`);
      loadOffers();
    } catch (err: any) {
      setActionMsg(err.response?.data?.detail || 'Failed to update offer status.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your placement offers...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="text-gradient">Campus Placement Offers & Acceptance</h2>
        <p>Review official compensation packages (CTC), work locations, joining dates, and formal acceptance actions.</p>
      </div>

      {actionMsg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: '#6ee7b7', fontSize: '0.9rem' }}>
          {actionMsg}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Award size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Placement Offers Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Keep participating in placement drives and clearing interview rounds. Official selection letters and CTC breakups will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {offers.map((offer) => (
            <div key={offer.id} className="glass-panel" style={{ padding: '2rem', border: offer.status === 'accepted' ? '1px solid var(--secondary)' : '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {offer.company_name}
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: offer.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : offer.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: offer.status === 'accepted' ? 'var(--secondary)' : offer.status === 'rejected' ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                      {offer.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{offer.role || offer.job_title}</h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Package (CTC)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    ₹{offer.ctc_lpa} LPA
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.5)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" /> Location: {offer.location || 'Pan India / Hybrid'}
                </div>
                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary)" /> Expected Joining: {offer.joining_date || 'July 2026'}
                </div>
                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--secondary)" /> Acceptance Deadline: {offer.deadline || '7 Days from Issue'}
                </div>
              </div>

              {offer.status === 'offered' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button 
                    onClick={() => handleDecision(offer.id, 'rejected')} 
                    className="btn btn-outline" 
                    style={{ borderColor: 'var(--danger)', color: '#fca5a5' }}
                  >
                    <XCircle size={16} /> Decline Offer
                  </button>
                  <button 
                    onClick={() => handleDecision(offer.id, 'accepted')} 
                    className="btn btn-primary"
                  >
                    <CheckCircle2 size={16} /> Accept Placement Offer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
