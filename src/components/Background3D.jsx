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

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(55, w/h, 0.1, 100);
    camera.position.set(0, 0, 12);
    const renderer = createRenderer(canvas);
    renderer.setSize(w, h);

    const COUNT = isMobile ? 800 : 2500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT*3);
    const basePositions = new Float32Array(COUNT*3);
    const velocities = new Float32Array(COUNT*3);
    const colors = new Float32Array(COUNT*3);

    for (let i=0;i<COUNT;i++) {
      const x=(Math.random()-0.5)*w*0.1; 
      const y=(Math.random()-0.5)*h*0.1; 
      const z=(Math.random()-0.5)*15;
      positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
      basePositions[i*3]=x; basePositions[i*3+1]=y; basePositions[i*3+2]=z;
      velocities[i*3]=0; velocities[i*3+1]=0; velocities[i*3+2]=0;
      const t=Math.random();
      colors[i*3]=t<0.5?1:0; colors[i*3+1]=t<0.5?0.85:0; colors[i*3+2]=t<0.5?0:0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors,3));

    const mat = new THREE.PointsMaterial({
      size: isMobile?0.08:0.06, vertexColors:true,
      transparent:true, opacity:0.6, blending:THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mouse = {x:0, y:0};

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX/w-0.5)*w*0.1;
      mouse.y = -(e.clientY/h-0.5)*h*0.1;
    };
    const handleTouchMove = (e) => {
      mouse.x = (e.touches[0].clientX/w-0.5)*w*0.1;
      mouse.y = -(e.touches[0].clientY/h-0.5)*h*0.1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, {passive:true});

    let t=0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.005;

      const pos = geo.attributes.position.array;

      for (let i=0;i<COUNT;i++) {
        const dx=mouse.x-pos[i*3]; 
        const dy=mouse.y-pos[i*3+1];
        const dist=Math.sqrt(dx*dx+dy*dy)+0.01;
        const force = Math.max(0, 1-dist/20)*0.005;
        velocities[i*3]+=dx/dist*force;
        velocities[i*3+1]+=dy/dist*force;
        velocities[i*3]+=(basePositions[i*3]-pos[i*3])*0.002;
        velocities[i*3+1]+=(basePositions[i*3+1]-pos[i*3+1])*0.002;
        velocities[i*3]*=0.94; velocities[i*3+1]*=0.94;
        pos[i*3]+=velocities[i*3]; pos[i*3+1]+=velocities[i*3+1];
        pos[i*3+2]=basePositions[i*3+2]+Math.sin(t+i*0.005)*2;
      }

      geo.attributes.position.needsUpdate = true;
      points.rotation.z = t*0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw=window.innerWidth;
      const nh=window.innerHeight;
      camera.aspect=nw/nh; 
      camera.updateProjectionMatrix();
      renderer.setSize(nw,nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      id="background-3d-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    ></canvas>
  );
}
