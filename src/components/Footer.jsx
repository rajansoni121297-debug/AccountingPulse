export default function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: 'var(--accent)', borderRadius: 5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 4 }}>
            <div style={{ borderRadius: 1, background: '#0F0A05' }} />
            <div style={{ borderRadius: 1, background: '#0F0A05', opacity: 0.5 }} />
            <div style={{ borderRadius: 1, background: '#0F0A05', opacity: 0.5 }} />
            <div style={{ borderRadius: 1, background: '#0F0A05' }} />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 700, color: '#F5F2EC' }}>AccountingPulse</span>
        </div>
        <span style={{ fontSize: 11, color: '#5A5450' }}>© {new Date().getFullYear()} AccountingPulse · All articles belong to their respective publishers</span>
      </div>
    </footer>
  );
}
