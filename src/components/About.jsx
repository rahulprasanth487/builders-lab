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

export default function About() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const statsRef = useRef([]);

  useEffect(() => {
    if (!hasWebGL() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const w = canvas.offsetWidth || 400;
    const h = 400;
    const camera = new THREE.PerspectiveCamera(55, w/h, 0.1, 100);
    camera.position.set(0, 1, 9);
    camera.lookAt(0,0,0);
    const renderer = createRenderer(canvas);
    renderer.setSize(w, h);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const cyanLight = new THREE.PointLight(0x00F0FF, 3, 20);
    cyanLight.position.set(4,4,4); scene.add(cyanLight);
    const pinkLight = new THREE.PointLight(0xFF5E7E, 2, 20);
    pinkLight.position.set(-4,-2,-4); scene.add(pinkLight);

    const group = new THREE.Group();
    scene.add(group);

    const flaskColors = [
      {body:0x00F0FF, liquid:0x00AACC, emit:0x00F0FF},
      {body:0xFF5E7E, liquid:0xCC2244, emit:0xFF5E7E},
      {body:0xAAFFDD, liquid:0x00BB88, emit:0x00FFAA}
    ];
    const flasks = [];

    flaskColors.forEach((c, i) => {
      const flask = new THREE.Group();
      const x = (i-1)*2.5;

      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.8, 16);
      const bodyMat = new THREE.MeshStandardMaterial({
        color:c.body, transparent:true, opacity:0.25,
        metalness:0.1, roughness:0, side:THREE.DoubleSide
      });
      flask.add(new THREE.Mesh(bodyGeo, bodyMat));

      const neckGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.7, 12);
      const neckMat = new THREE.MeshStandardMaterial({
        color:c.body, transparent:true, opacity:0.2,
        metalness:0.1, roughness:0, side:THREE.DoubleSide
      });
      const neck = new THREE.Mesh(neckGeo, neckMat);
      neck.position.y = 1.25;
      flask.add(neck);

      const liqGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.9, 16, 8);
      const liqMat = new THREE.MeshStandardMaterial({
        color:c.liquid, emissive:c.emit, emissiveIntensity:0.5,
        transparent:true, opacity:0.8, metalness:0.2, roughness:0.3
      });
      const liquid = new THREE.Mesh(liqGeo, liqMat);
      liquid.position.y = -0.45;
      flask.add(liquid);
      const origPos = liqGeo.attributes.position.array.slice();
      liquid.userData = {origPos, time:i*1.5};

      const outlineGeo = new THREE.CylinderGeometry(0.52, 0.62, 1.82, 16);
      const outlineMat = new THREE.MeshBasicMaterial({
        color:c.body, transparent:true, opacity:0.1, side:THREE.BackSide
      });
      flask.add(new THREE.Mesh(outlineGeo, outlineMat));

      for (let b = 0; b < 5; b++) {
        const bubble = new THREE.Mesh(
          new THREE.SphereGeometry(0.04+Math.random()*0.06,8,8),
          new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5})
        );
        bubble.position.set(
          (Math.random()-0.5)*0.7,
          -0.9 + Math.random()*1.4,
          (Math.random()-0.5)*0.7
        );
        bubble.userData.riseSpeed = 0.005+Math.random()*0.01;
        bubble.userData.startY = bubble.position.y;
        flask.add(bubble);
      }

      flask.position.x = x;
      flask.position.y = 0;
      group.add(flask);
      flasks.push({flask, liquid, liqGeo, i});
    });

    let t = 0;
    const secObs = new IntersectionObserver(entries => {
      if (sectionRef.current) {
        sectionRef.current.dataset.visible = entries[0].isIntersecting?'1':'0';
      }
    }, {threshold:0.1});
    if (sectionRef.current) secObs.observe(sectionRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      if (sectionRef.current?.dataset.visible === '0') return;
      t += 0.016;

      group.rotation.y = Math.sin(t*0.3)*0.4;

      flasks.forEach(({flask, liquid, liqGeo, i}) => {
        flask.position.y = Math.sin(t*0.8 + i*2)*0.12;
        flask.rotation.z = Math.sin(t*0.5 + i)*0.05;

        liquid.userData.time += 0.05;
        const pos = liqGeo.attributes.position.array;
        const orig = liquid.userData.origPos;
        for (let v = 0; v < pos.length/3; v++) {
          const ox = orig[v*3], oy = orig[v*3+1], oz = orig[v*3+2];
          if (oy > -0.1) {
            pos[v*3+1] = oy + Math.sin(ox*3 + liquid.userData.time)*0.06 + Math.cos(oz*3 + liquid.userData.time*0.7)*0.04;
          }
        }
        liqGeo.attributes.position.needsUpdate = true;

        flask.children.forEach(ch => {
          if (ch.userData.riseSpeed) {
            ch.position.y += ch.userData.riseSpeed;
            ch.material.opacity = 0.3 + Math.random()*0.2;
            if (ch.position.y > 0.6) ch.position.y = ch.userData.startY;
          }
        });
      });

      cyanLight.intensity = 2.5 + 1.5*Math.sin(t*1.5);
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
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && e.target.classList.contains('stat-num')) {
          const target = +e.target.dataset.count;
          let curr = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            curr = Math.min(curr + step, target);
            const suffix = e.target.dataset.count === '98' ? '%' : '+';
            e.target.textContent = Math.round(curr) + suffix;
            if (curr >= target) {
              clearInterval(interval);
              observer.unobserve(e.target);
            }
          }, 16);
        }
      });
    }, { threshold: 0.5 });

    statsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });

    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    if (sectionRef.current) {
      const reveals = sectionRef.current.querySelectorAll('.reveal-up');
      reveals.forEach(el => revealObs.observe(el));
    }

    return () => {
      observer.disconnect();
      revealObs.disconnect();
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} data-visible="0">
      <div className="section-inner">
        <div className="about-layout">
          <div className="about-text">
            <span className="section-tag reveal-up">OUR LAB</span>
            <h2 className="section-title reveal-up">Where Ideas <span>Brew</span></h2>
            <p className="reveal-up">Builders Lab is a passionate team of developers, designers, and digital strategists based in India. We blend technology with creativity to craft digital experiences that matter.</p>
            <p className="reveal-up">We don't just write code — we architect futures. From startups to established enterprises, we bring the same dedication, craftsmanship, and innovation to every project.</p>
            {/* <div className="stats-grid">
              <div className="stat-box reveal-up">
                <span
                  ref={el => statsRef.current[0] = el}
                  className="stat-num"
                  data-count="150"
                >0</span>
                <span className="stat-label">Projects Delivered</span>
              </div>
              <div className="stat-box reveal-up reveal-delay-1">
                <span
                  ref={el => statsRef.current[1] = el}
                  className="stat-num"
                  data-count="98"
                >0</span>
                <span className="stat-label">Client Satisfaction %</span>
              </div>
              <div className="stat-box reveal-up reveal-delay-2">
                <span
                  ref={el => statsRef.current[2] = el}
                  className="stat-num"
                  data-count="5"
                >0</span>
                <span className="stat-label">Years of Excellence</span>
              </div>
              <div className="stat-box reveal-up reveal-delay-3">
                <span
                  ref={el => statsRef.current[3] = el}
                  className="stat-num"
                  data-count="24"
                >0</span>
                <span className="stat-label">Hr Support</span>
              </div>
            </div> */}
          </div>
          <canvas ref={canvasRef} id="flask-canvas"></canvas>
        </div>
      </div>
    </section>
  );
}
