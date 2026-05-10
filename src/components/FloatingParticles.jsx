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

export default function FloatingParticles({ height = 300, colorScheme = 'yellow-blue' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const w = canvas.offsetWidth || 500;
    const h = height;
    const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 100);
    camera.position.set(0, 0, 8);
    const renderer = createRenderer(canvas);
    renderer.setSize(w, h);

    const COUNT = isMobile ? 400 : 800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT*3);
    const basePositions = new Float32Array(COUNT*3);
    const velocities = new Float32Array(COUNT*3);
    const colors = new Float32Array(COUNT*3);

    // Color schemes
    const schemes = {
      'yellow-blue': { color1: [1, 0.85, 0], color2: [0, 0.2, 0.4] },
      'yellow-black': { color1: [1, 0.85, 0], color2: [0.1, 0.1, 0.1] },
      'cyan-blue': { color1: [0, 1, 1], color2: [0, 0.1, 0.5] },
      'multi': { color1: [1, 0.85, 0], color2: [0, 0.4, 1], color3: [1, 0.2, 0.4] }
    };

    const scheme = schemes[colorScheme] || schemes['yellow-blue'];

    for (let i=0;i<COUNT;i++) {
      const x=(Math.random()-0.5)*10; 
      const y=(Math.random()-0.5)*8; 
      const z=(Math.random()-0.5)*6;
      positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
      basePositions[i*3]=x; basePositions[i*3+1]=y; basePositions[i*3+2]=z;
      velocities[i*3]=0; velocities[i*3+1]=0; velocities[i*3+2]=0;
      const t=Math.random();
      const c1 = scheme.color1;
      const c2 = scheme.color2;
      colors[i*3]=t<0.5?c1[0]:c2[0]; 
      colors[i*3+1]=t<0.5?c1[1]:c2[1]; 
      colors[i*3+2]=t<0.5?c1[2]:c2[2];
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors,3));

    const mat = new THREE.PointsMaterial({
      size: isMobile?0.08:0.06, 
      vertexColors:true,
      transparent:true, 
      opacity:0.7, 
      blending:THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mouse = {x:0, y:0};

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      mouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 8;
    };
    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 10;
      mouse.y = -((e.touches[0].clientY - rect.top) / rect.height - 0.5) * 8;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, {passive:true});

    let t=0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.005;

      const pos = geo.attributes.position.array;

      for (let i=0;i<COUNT;i++) {
        const dx=mouse.x-pos[i*3]; 
        const dy=mouse.y-pos[i*3+1];
        const dist=Math.sqrt(dx*dx+dy*dy)+0.01;
        const force = Math.max(0, 1-dist/5)*0.004;
        velocities[i*3]+=dx/dist*force;
        velocities[i*3+1]+=dy/dist*force;
        velocities[i*3]+=(basePositions[i*3]-pos[i*3])*0.002;
        velocities[i*3+1]+=(basePositions[i*3+1]-pos[i*3+1])*0.002;
        velocities[i*3]*=0.95; 
        velocities[i*3+1]*=0.95;
        pos[i*3]+=velocities[i*3]; 
        pos[i*3+1]+=velocities[i*3+1];
        pos[i*3+2]=basePositions[i*3+2]+Math.sin(t+i*0.005)*1.5;
      }

      geo.attributes.position.needsUpdate = true;
      points.rotation.z = t*0.005;
      points.rotation.y = t*0.003;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw=canvas.offsetWidth;
      camera.aspect=nw/h; 
      camera.updateProjectionMatrix();
      renderer.setSize(nw,h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [height, colorScheme]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '12px',
        display: 'block'
      }}
    ></canvas>
  );
}
