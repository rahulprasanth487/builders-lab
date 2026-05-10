import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch(e) { return false; }
}

function createRenderer(canvas, alpha=true) {
  const r = new THREE.WebGLRenderer({
    canvas, alpha, antialias:!isMobile,
    powerPreference:'high-performance'
  });
  r.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  return r;
}

export default function Hero() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 30);
    const renderer = createRenderer(canvas);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const COUNT = isMobile ? 15 : 25;
    const cubes = [];
    const targetPositions = [];
    const scatterPositions = [];
    let scrollY = 0;

const edgeMat = new THREE.LineBasicMaterial({
  color:0xFFD700, transparent:true, opacity:0.8
});

    for (let i = 0; i < COUNT; i++) {
      const size = 0.4 + Math.random() * 1.2;
      const geo = new THREE.BoxGeometry(size, size, size);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, edgeMat.clone());

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 12;
      const tx = r * Math.sin(phi) * Math.cos(theta);
      const ty = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      const tz = r * Math.cos(phi) * 0.5;

      line.position.set(tx, ty, tz);
      line.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

      targetPositions.push({ x:tx, y:ty, z:tz });
      scatterPositions.push({
        x:(Math.random()-0.5)*80,
        y:(Math.random()-0.5)*50 - 30,
        z:(Math.random()-0.5)*60
      });

      const speed = 0.003 + Math.random()*0.008;
      cubes.push({ mesh:line, rotSpeed:{x:speed, y:speed*1.3, z:speed*0.7}, phase:Math.random()*Math.PI*2 });
      scene.add(line);
    }

    const glowGeo = new THREE.SphereGeometry(3, 16, 16);
const glowMat = new THREE.MeshBasicMaterial({
  color:0xFFD700, transparent:true, opacity:0.06, wireframe:true
});
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    const starGeo = new THREE.BufferGeometry();
    const starCount = isMobile ? 300 : 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random()-0.5)*200;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color:0xFFD700, size:0.15, transparent:true, opacity:0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.01;

      const scrollFrac = Math.min(scrollY / (window.innerHeight * 0.8), 1);

      cubes.forEach((c, i) => {
        const target = scrollFrac > 0.1 ? scatterPositions[i] : targetPositions[i];
        c.mesh.position.x += (target.x - c.mesh.position.x) * 0.04;
        c.mesh.position.y += (target.y - c.mesh.position.y) * 0.04;
        c.mesh.position.z += (target.z - c.mesh.position.z) * 0.04;
        c.mesh.rotation.x += c.rotSpeed.x;
        c.mesh.rotation.y += c.rotSpeed.y;
        c.mesh.material.opacity = 0.5 + 0.4 * Math.sin(t + c.phase);
      });

      scene.rotation.y = t * 0.1;
      glowSphere.rotation.y = -t * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const handleScroll = () => { 
  scrollY = window.scrollY; 
  
  // Parallax effect for the canvas
  if (canvasRef.current && containerRef.current) {
    const parallaxIntensity = 0.5;
    const scrollPosition = window.scrollY * parallaxIntensity;
    canvasRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`;
  }
};
    const handleResize = () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hero" ref={containerRef}>
      <canvas ref={canvasRef} id="hero-canvas"></canvas>
      <div className="webgl-fallback"></div>
      <div className="hero-content">
        <div className="hero-badge">CODE · CREATE · CONNECT</div>
        <h1 className="hero-headline">
          Your Vision.
          <span className="line2">Our Code.</span>
        </h1>
        <p className="hero-slogan">WE BUILD WEBSITES THAT <strong>BUILD BUSINESSES</strong></p>
        <div className="hero-buttons">
          <a href="#services" className="btn-primary">EXPLORE SERVICES</a>
          <a href="#contact" className="btn-outline">START A PROJECT</a>
        </div>
      </div>
      <div className="scroll-hint">
        <span>SCROLL</span>
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
}
