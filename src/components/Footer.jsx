export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-box">
              <div className="footer-logo-dot" />
              <div className="footer-logo-dot dim" />
              <div className="footer-logo-dot dim" />
              <div className="footer-logo-dot" />
            </div>
            <span className="footer-brand-name">AccountingPulse</span>
          </div>
          <nav className="footer-nav">
            <span className="footer-link">Topics</span>
            <span className="footer-link">Search</span>
            <span className="footer-link">Privacy</span>
            <span className="footer-link">Terms</span>
            <span className="footer-link">DMCA</span>
          </nav>
          <span className="footer-copyright">
            &copy; {new Date().getFullYear()} AccountingPulse. Content sourced from public feeds. All articles link to their original source.
          </span>
        </div>
        <div className="footer-legal">
          <p className="footer-legal-title">Content Attribution & Legal Notice:</p>
          <p className="footer-legal-text">
            AccountingPulse aggregates headlines and summaries from publicly available RSS feeds and government press releases. All content remains the intellectual property of its respective publishers. We display article titles, brief summaries, source attribution, and direct links to original articles. Articles are archived after 30 days.
          </p>
        </div>
      </div>
    </footer>
  );
}
