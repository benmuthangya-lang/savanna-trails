import { BrandMark } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <a className="brand footer-brand" href="#top" aria-label="Savanna Trails home">
            <BrandMark />
            <span><strong>Savanna</strong> Trails</span>
          </a>
          <p>Fictional Kenyan tours & travel concept.<br />Built as a portfolio demonstration.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#top">Home</a>
          <a href="#tours">Sample tours</a>
          <a href="#enquiry">Enquiry</a>
          <a href="#about">About</a>
        </nav>
        <div className="footer-note">
          <p>No bookings are accepted.</p>
          <span>All prices shown are illustrative samples in KES.</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Savanna Trails concept</span>
        <span>Designed for demonstration only</span>
      </div>
    </footer>
  )
}
