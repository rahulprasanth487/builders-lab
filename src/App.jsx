import { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import Showcase from './components/Showcase';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Background3D from './components/Background3D';
import './App.css';

export default function App() {
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        if (window.scrollY > 50) {
          navbarRef.current.classList.add('scrolled');
        } else {
          navbarRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      <Background3D />
      <Navbar navbarRef={navbarRef} />
      <Hero />
      <Features />
      <Services />
      <Showcase />
      <About />
      {/* <Contact /> */}
      <Footer />
    </div>
  );
}
