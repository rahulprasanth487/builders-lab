import { useState, useEffect } from 'react';


export default function Footer() {

  // Inside your Footer component:
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-cta">
          <h2>LET'S BUILD SOMETHING <span>AMAZING</span> TOGETHER!</h2>
          <p>Your vision deserves world-class execution. Let's make it happen.</p>
          {/* <a href="mailto:admin.builderslab@gmail.com" className="btn-primary" style={ }>admin.builderslab@gmail.com</a> */}
          <a
            href="mailto:admin.builderslab@gmail.com"
            className="btn-primary"
            style={{
              fontSize: isMobile ? '0.7rem' : '1rem',
              padding: isMobile ? '0.5rem 1rem' : '1rem 2.5rem',
              wordBreak: 'break-all', // Prevents long email from breaking the layout
              display: 'inline-block'
            }}
          >
            admin.builderslab@gmail.com
          </a>
        </div>
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-tagline">CODE · CREATE · CONNECT</span>
            <a href="#hero" className="nav-logo">Builders<span>Lab</span></a>
            <p>We build websites that build businesses. Based in India, serving clients worldwide with passion, precision and purpose.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="#services">Website Design</a></li>
              <li><a href="#services">Website Development</a></li>
              <li><a href="#services">E-Commerce Solutions</a></li>
              <li><a href="#services">SEO Optimization</a></li>
              <li><a href="#services">Maintenance & Support</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="https://bl-builders-lab.vercel.app/" target="_blank" rel="noopener noreferrer">bl-builders-lab.vercel.app</a></li>
              <li><a href="mailto:admin.builderslab@gmail.com">admin.builderslab@gmail.com</a></li>
              <li><a href="tel:+911234567890">📞 +91 12345 67890</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Builders Lab. All rights reserved.</p>
          <p>Made with <span className="made-with">♥</span> in India</p>
        </div>
      </div>
    </footer>
  );
}
