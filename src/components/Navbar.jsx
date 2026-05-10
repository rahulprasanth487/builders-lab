import { useState, useEffect } from 'react';

export default function Navbar({ navbarRef }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        ref={navbarRef}
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <a href="#hero" className="nav-logo">
          Builders<span>Lab</span>
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#showcase">Showcase</a></li>
          <li><a href="#about">About</a></li>
        </ul>

        <a href="#contact" className="nav-cta">GET STARTED</a>

        <button
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          className="mobile-close"
          onClick={toggleMobileMenu}
          aria-label="Close mobile menu"
        >
          ✕
        </button>
        <a href="#features" onClick={toggleMobileMenu}>Features</a>
        <a href="#services" onClick={toggleMobileMenu}>Services</a>
        <a href="#showcase" onClick={toggleMobileMenu}>Showcase</a>
        <a href="#about" onClick={toggleMobileMenu}>About</a>
        <a href="#contact" onClick={toggleMobileMenu}>Contact</a>
      </div>
    </>
  );
}
