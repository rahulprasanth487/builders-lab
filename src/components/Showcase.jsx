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

export default function Showcase() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const w = canvas.offsetWidth || 500;
    const h = 450;
    const camera = new THREE.PerspectiveCamera(55, w/h, 0.1, 100);
    camera.position.set(0, 2, 8);
    const renderer = createRenderer(canvas);
    renderer.setSize(w, h);

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const cyan = new THREE.PointLight(0x00F0FF, 3, 30);
    cyan.position.set(5,5,5); scene.add(cyan);
    const pink = new THREE.PointLight(0xFF5E7E, 2, 30);
    pink.position.set(-5,3,-3); scene.add(pink);

    const device = new THREE.Group();

    const platGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 6);
    const platMat = new THREE.MeshStandardMaterial({
      color:0x111122, metalness:1, roughness:0.2,
      emissive:0x001122, emissiveIntensity:0.5
    });
    device.add(new THREE.Mesh(platGeo, platMat));

    const edgePlatGeo = new THREE.EdgesGeometry(platGeo);
    const edgePlatLine = new THREE.LineSegments(edgePlatGeo,
      new THREE.LineBasicMaterial({color:0x00F0FF, transparent:true, opacity:0.8}));
    device.add(edgePlatLine);

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.6, 2.5, 8),
      new THREE.MeshStandardMaterial({color:0x223344, metalness:0.9, roughness:0.1, emissive:0x001133})
    );
    tower.position.y = 1.35;
    device.add(tower);

    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.6),
      new THREE.MeshStandardMaterial({
        color:0x00F0FF, metalness:0.9, roughness:0,
        emissive:0x00F0FF, emissiveIntensity:0.6, transparent:true, opacity:0.9
      })
    );
    crystal.position.y = 2.85;
    device.add(crystal);

    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(1.5 + i*0.4, 0.04, 8, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: i===1 ? 0xFF5E7E : 0x00F0FF,
        emissive: i===1 ? 0xFF5E7E : 0x00F0FF,
        emissiveIntensity:0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI/2 + (i*0.3);
      ring.rotation.z = i * 0.5;
      ring.userData.rotSpeed = (i+1)*0.008 * (i%2===0?1:-1);
      ring.userData.axis = i%2===0?'y':'x';
      ring.position.y = 1.5;
      device.add(ring);
    }

    for (let i = 0; i < 5; i++) {
      const a = (i/5)*Math.PI*2;
      const sat = new THREE.Mesh(
        new THREE.BoxGeometry(0.25,0.25,0.25),
        new THREE.MeshStandardMaterial({color:0xFF5E7E,emissive:0xFF5E7E,emissiveIntensity:0.5})
      );
      sat.position.set(Math.cos(a)*3.2, 1.5, Math.sin(a)*3.2);
      sat.userData = {orbit: a, speed: 0.008+i*0.002, radius:3.2};
      device.add(sat);
    }

    scene.add(device);

    const wireGeo = new THREE.SphereGeometry(4.5, 20, 20);
    const wireMat = new THREE.MeshBasicMaterial({
      color:0x00F0FF, wireframe:true, transparent:true, opacity:0.06
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    wireSphere.position.y = 1;
    scene.add(wireSphere);

    const grid = new THREE.GridHelper(12, 12, 0x00F0FF, 0x111133);
    grid.material.transparent = true; grid.material.opacity = 0.15;
    grid.position.y = -0.15;
    scene.add(grid);

    let isDown=false, prevX=0, prevY=0, targetRotY=0, targetRotX=0, currentRotY=0, currentRotX=0;
    let autoRotate = true;
    canvas.addEventListener('mousedown', e => { isDown=true; prevX=e.clientX; prevY=e.clientY; autoRotate=false; });
    canvas.addEventListener('touchstart', e => { isDown=true; prevX=e.touches[0].clientX; prevY=e.touches[0].clientY; autoRotate=false; });
    window.addEventListener('mouseup', ()=>isDown=false);
    window.addEventListener('touchend', ()=>isDown=false);
    canvas.addEventListener('mousemove', e => {
      if (!isDown) return;
      targetRotY += (e.clientX-prevX)*0.005;
      targetRotX += (e.clientY-prevY)*0.005;
      targetRotX = Math.max(-0.8, Math.min(0.8, targetRotX));
      prevX=e.clientX; prevY=e.clientY;
    });
    canvas.addEventListener('touchmove', e => {
      if (!isDown) return;
      targetRotY += (e.touches[0].clientX-prevX)*0.005;
      prevX=e.touches[0].clientX;
    });
    let zoom = 8;
    canvas.addEventListener('wheel', e => {
      zoom = Math.max(4, Math.min(14, zoom + e.deltaY*0.01));
    }, {passive:true});

    let t = 0;
    const sectionObs = new IntersectionObserver(entries => {
      sectionRef.current.dataset.visible = entries[0].isIntersecting ? '1' : '0';
    }, {threshold:0.1});
    if (sectionRef.current) sectionObs.observe(sectionRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      if (sectionRef.current?.dataset.visible === '0') return;
      t += 0.01;

      if (autoRotate) targetRotY += 0.005;
      currentRotY += (targetRotY - currentRotY) * 0.06;
      currentRotX += (targetRotX - currentRotX) * 0.06;

      device.rotation.y = currentRotY;
      device.rotation.x = currentRotX;

      device.children.forEach(ch => {
        if (ch.userData.orbit !== undefined) {
          ch.userData.orbit += ch.userData.speed;
          ch.position.set(
            Math.cos(ch.userData.orbit)*ch.userData.radius,
            1.5,
            Math.sin(ch.userData.orbit)*ch.userData.radius
          );
          ch.rotation.y += 0.05;
        }
        if (ch.userData.rotSpeed) {
          ch.rotation[ch.userData.axis] += ch.userData.rotSpeed;
        }
      });

      const scale = 1 + 0.08 * Math.sin(t*2);
      crystal.scale.set(scale,scale,scale);
      crystal.material.emissiveIntensity = 0.5 + 0.3*Math.sin(t*2);

      wireSphere.material.opacity = 0.04 + 0.04*Math.sin(t*0.5);
      wireSphere.rotation.y = t*0.03;
      wireSphere.rotation.x = t*0.02;

      cyan.intensity = 2.5 + 1.5*Math.sin(t);

      camera.position.set(0, 2, zoom);
      camera.lookAt(0, 1, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw = canvas.offsetWidth;
      camera.aspect = nw/h; camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', () => {});
      canvas.removeEventListener('touchstart', () => {});
      canvas.removeEventListener('mousemove', () => {});
      canvas.removeEventListener('touchmove', () => {});
      canvas.removeEventListener('wheel', () => {});
      renderer.dispose();
    };
  }, []);

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

  return (
    <section id="showcase" ref={sectionRef} data-visible="0">
      <div className="section-inner">
        <div className="showcase-layout">
          <canvas ref={canvasRef} id="showcase-canvas"></canvas>
          <div className="showcase-info">
            <span className="section-tag reveal-up">INTERACTIVE 3D</span>
            <h2 className="section-title reveal-up">Tech Lab <span>Showcase</span></h2>
            <div className="orbit-hint reveal-up">🖱️ Drag to orbit · Scroll to zoom</div>
            <p className="reveal-up">We marry cutting-edge technology with elegant design. Our digital lab is where your ideas become extraordinary realities — tested, refined, and launched to scale.</p>
            <p className="reveal-up">Every project is a precision build: performance-tuned, security-hardened, and conversion-optimized from the ground up.</p>
            <a href="#contact" className="btn-primary reveal-up">BUILD WITH US</a>
          </div>
        </div>
      </div>
    </section>
  );
}
