import { useEffect, useRef } from 'react';
import FloatingParticles from './FloatingParticles';

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    if (sectionRef.current) {
      const reveals = sectionRef.current.querySelectorAll('.reveal-up');
      reveals.forEach(el => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      num: '01',
      icon: '🎨',
      title: 'MODERN DESIGN',
      desc: 'Clean, creative & user-friendly designs that leave a lasting impression. Every pixel is purposeful, every interaction delightful.'
    },
    {
      num: '02',
      icon: '🔒',
      title: 'SECURE & RELIABLE',
      desc: 'Built with industry best practices to keep your site safe, fast, and always online. Your business never sleeps — neither does our infrastructure.'
    },
    {
      num: '03',
      icon: '📈',
      title: 'RESULT DRIVEN',
      desc: 'Optimized for performance, SEO & conversions from day one. We don\'t just build sites — we build growth engines.'
    }
  ];

  return (
    <section id="features" ref={sectionRef}>
      <div className="section-inner">
        <span className="section-tag reveal-up">WHY BUILDERS LAB</span>
        <h2 className="section-title reveal-up">Built to <span>Perform</span></h2>
        <div className="particles-container reveal-up">
          <FloatingParticles height={250} colorScheme="yellow-blue" />
        </div>
        <div className="features-carousel">
          {features.map((feature, i) => (
            <div key={i} className={`feature-item reveal-up reveal-delay-${i+1}`}>
              <div className="feature-header">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-num">{feature.num}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
