import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Data defining the unique look for each step
const servicesData = [
  { 
    title: 'Discovery & Design', 
    desc: 'We map out your vision with high-fidelity wireframes and stunning UI/UX concepts tailored for conversion.', 
    color: '#FFD700', 
    type: 'torusKnot' 
  },
  { 
    title: 'Technical Build', 
    desc: 'Our engineers transform designs into high-performance, scalable codebases using the latest frameworks.', 
    color: '#00A3FF', 
    type: 'cube' 
  },
  { 
    title: 'E-Commerce Launch', 
    desc: 'Secure, optimized shopping experiences integrated with seamless payment gateways and inventory.', 
    color: '#00FF88', 
    type: 'diamond' 
  },
  { 
    title: 'SEO & Visibility', 
    desc: 'Strategy-led optimization to ensure your brand dominates search rankings and reaches the right audience.', 
    color: '#FF6B9D', 
    type: 'rings' 
  },
  { 
    title: 'Maintenance', 
    desc: '24/7 performance monitoring and security updates to keep your digital assets running perfectly.', 
    color: '#00DDDD', 
    type: 'gears' 
  }
];

const TimelineItem = ({ data, index }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Light
    const light = new THREE.PointLight(data.color, 2, 50);
    light.position.set(5, 5, 5);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

    // Create unique geometry based on type
    let geometry;
    if (data.type === 'torusKnot') geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    else if (data.type === 'cube') geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    else if (data.type === 'diamond') geometry = new THREE.OctahedronGeometry(1.6, 0);
    else if (data.type === 'rings') geometry = new THREE.TorusGeometry(1.2, 0.1, 16, 100);
    else geometry = new THREE.TorusGeometry(1, 0.3, 16, 8); // Gear-like

    const material = new THREE.MeshStandardMaterial({ 
      color: data.color, 
      metalness: 0.7, 
      roughness: 0.2,
      wireframe: data.type === 'cube' // Style variation
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [data]);

  return (
    <div className={`timeline-row ${index % 2 === 0 ? 'left' : 'right'}`}>
      <div className="timeline-content">
        <div className="content-box">
          <span className="step-num" style={{ color: data.color }}>Step 0{index + 1}</span>
          <h3 style={{ color: data.color }}>{data.title}</h3>
          <p>{data.desc}</p>
        </div>
      </div>

      <div className="timeline-middle">
        <div className="timeline-dot" style={{ borderColor: data.color }}></div>
      </div>

      <div className="timeline-visual">
        <div className="canvas-container" style={{ '--glow-color': data.color }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default function ServicesTimeline() {
  return (
    <section id="services">
      <div className="section-inner">
        <div className="timeline-header">
          <span className="section-tag">ROADMAP</span>
          <h2 className="section-title">Our <span>Timeline</span></h2>
        </div>

        <div className="timeline-map">
          <div className="timeline-vertical-line"></div>
          {servicesData.map((item, i) => (
            <TimelineItem key={i} data={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}