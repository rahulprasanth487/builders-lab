import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
};

export default function ServicesTimeline() {
  const [activeService, setActiveService] = useState(0);
  const canvasRef = useRef(null);
  const groupsRef = useRef([]);

  const servicesData = [
    { title: 'Discovery & Design', desc: 'We map out your vision with high-fidelity wireframes and stunning UI/UX concepts.', icon: '🎨', color: '#FFD700' },
    { title: 'Technical Build', desc: 'Our engineers transform designs into high-performance, scalable codebases.', icon: '⚡', color: '#00A3FF' },
    { title: 'E-Commerce Launch', desc: 'We deploy secure shopping experiences with conversion-optimized checkouts.', icon: '🛒', color: '#00FF88' },
    { title: 'SEO & Visibility', desc: 'Strategy-led optimization to ensure your brand dominates search rankings.', icon: '📈', color: '#FF6B9D' },
    { title: 'Scaling & Support', desc: 'Continuous performance monitoring and updates to keep you ahead of the curve.', icon: '🔧', color: '#00DDDD' }
  ];

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const pLight = new THREE.PointLight(0xffffff, 1.2);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);

    // Create unique groups for each timeline step
    const groups = servicesData.map(() => new THREE.Group());
    groupsRef.current = groups;

    // 0. Torus Knot
    groups[0].add(new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 100, 16), new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.7 })));
    // 1. Double Box
    groups[1].add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x00A3FF, wireframe: true })));
    groups[1].add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x00A3FF })));
    // 2. Diamond
    groups[2].add(new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshStandardMaterial({ color: 0x00FF88, metalness: 0.8 })));
    // 3. Rings
    for(let i=1; i<=3; i++) groups[3].add(new THREE.Mesh(new THREE.TorusGeometry(i*0.5, 0.05, 16, 100), new THREE.MeshStandardMaterial({ color: 0xFF6B9D })));
    // 4. Gears
    const gear = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0x00DDDD }));
    groups[4].add(gear);

    groups.forEach(g => { g.scale.set(0, 0, 0); scene.add(g); });

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      groups.forEach((g, i) => {
        const targetScale = i === activeService ? 1 : 0;
        g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        g.rotation.y += 0.01;
        g.rotation.x += 0.005;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activeService]);

  return (
    <section id="services">
      <div className="section-inner">
        {/* heading - features */}
        <div className="section-header">
          <h2>Our Services</h2>
          <p>From concept to launch, we deliver end-to-end solutions that drive results.</p>
        </div>

        <div className="timeline-wrapper">
          {/* Left Side: The Timeline Map */}
          <div className="timeline-nav">
            <div className="timeline-progress-line">
              <div 
                className="timeline-progress-fill" 
                style={{ height: `${(activeService / (servicesData.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {servicesData.map((s, i) => (
              <div 
                key={i} 
                className={`timeline-node ${activeService === i ? 'active' : ''} ${i < activeService ? 'completed' : ''}`}
                onClick={() => setActiveService(i)}
              >
                <div className="node-circle">
                  <span className="node-icon">{s.icon}</span>
                </div>
                <div className="node-label">
                  <h4>{s.title}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: The Content Display */}
          <div className="timeline-content-card">
            <div className="timeline-visual">
              <canvas ref={canvasRef} className="timeline-canvas" />
            </div>
            <div className="timeline-text">
              <h3 style={{ color: servicesData[activeService].color }}>
                {servicesData[activeService].title}
              </h3>
              <p>{servicesData[activeService].desc}</p>
              <ul className="service-checklist">
                <li>✦ Premium Quality Assurance</li>
                <li>✦ Strategic Execution</li>
                <li>✦ Real-time Analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}