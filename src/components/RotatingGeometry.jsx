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
    canvas, alpha, antialias:true,
    powerPreference:'high-performance'
  });
  r.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  return r;
}

export default function RotatingGeometry({ width = 200, height = 200, geometryType = 'cube' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const w = width;
    const h = height;
    const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 100);
    camera.position.set(0, 0, 4);
    const renderer = createRenderer(canvas);
    renderer.setSize(w, h);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffff00, 1.5, 20);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0x0033ff, 1, 20);
    pointLight2.position.set(-3, -3, 3);
    scene.add(pointLight2);

    // Create geometry
    let geometry;
    switch(geometryType) {
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1, 2);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(1.2, 1);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(1, 1);
        break;
      default: // cube
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x333300,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0033ff }));
    mesh.add(line);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      
      mesh.rotation.x += mouseY * 0.0005;
      mesh.rotation.y += mouseX * 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const newW = canvasRef.current?.offsetWidth || width;
      const newH = canvasRef.current?.offsetHeight || height;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [width, height, geometryType]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block',
        borderRadius: '12px'
      }}
    ></canvas>
  );
}
