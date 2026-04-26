import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 550;
const RADIUS = 13;
const CONNECTION_DIST = 3.8;
const STAR_COUNT = 500;

const DOT_COLOR = 0xd4e8ff;
const LINE_COLOR = 0x5b90c8;
const GLOW_COLOR = 0x93c5fd;

function fibonacciSphere(count, radius) {
  const positions = new Float32Array(count * 3);
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = (2 * Math.PI * i) / golden;
    positions[i * 3] = Math.sin(theta) * Math.cos(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(theta) * radius;
  }
  return positions;
}

function buildConnections(pos, count, threshold) {
  const verts = [];
  const t2 = threshold * threshold;
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < t2) {
        verts.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
        verts.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
      }
    }
  }
  return new Float32Array(verts);
}

// Ease in-out cubic
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const HeroCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {return;}
    const mount = mountRef.current;
    if (!mount) {return;}

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 46;

    // ── Globe group ───────────────────────────────────────────────────────
    const globe = new THREE.Group();
    globe.position.x = width > 768 ? 18 : 0;
    scene.add(globe);

    // Globe particle positions — orig + explode targets
    const globeOrig = fibonacciSphere(PARTICLE_COUNT, RADIUS);
    const globeExplode = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const scale = 5.5 + Math.random() * 7;
      globeExplode[i * 3] = globeOrig[i * 3] * scale;
      globeExplode[i * 3 + 1] = globeOrig[i * 3 + 1] * scale;
      globeExplode[i * 3 + 2] = globeOrig[i * 3 + 2] * scale;
    }
    const globeCurrent = globeOrig.slice();

    // Dots
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(globeCurrent, 3));
    const dotMat = new THREE.PointsMaterial({
      color: DOT_COLOR,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    globe.add(new THREE.Points(dotGeo, dotMat));

    // Dot glow
    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute('position', new THREE.BufferAttribute(globeCurrent.slice(), 3));
    const glowMat = new THREE.PointsMaterial({
      color: GLOW_COLOR,
      size: 2.4,
      transparent: true,
      opacity: 0.07,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    globe.add(new THREE.Points(glowGeo, glowMat));

    // Connection lines
    const lineVerts = buildConnections(globeOrig, PARTICLE_COUNT, CONNECTION_DIST);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineVerts.slice(), 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: LINE_COLOR,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    globe.add(new THREE.LineSegments(lineGeo, lineMat));

    // Corona
    const coronaGeo = new THREE.SphereGeometry(RADIUS + 1.0, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.025,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    globe.add(new THREE.Mesh(coronaGeo, coronaMat));

    // ── Stars — orig + explode targets ────────────────────────────────────
    const starOrig = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      starOrig[i * 3] = (Math.random() - 0.5) * 180;
      starOrig[i * 3 + 1] = (Math.random() - 0.5) * 120;
      starOrig[i * 3 + 2] = (Math.random() - 0.5) * 70 - 10;
    }
    const starExplode = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const scale = 4.5 + Math.random() * 4;
      starExplode[i * 3] = starOrig[i * 3] * scale;
      starExplode[i * 3 + 1] = starOrig[i * 3 + 1] * scale;
      starExplode[i * 3 + 2] = starOrig[i * 3 + 2] * scale;
    }
    const starCurrent = starOrig.slice();

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCurrent, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xd0e8ff,
      size: 0.13,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Scroll progress ───────────────────────────────────────────────────
    let scrollTarget = 0;
    let scrollSmooth = 0;

    const onScroll = () => {
      scrollTarget = Math.min(1, window.scrollY / (mount.clientHeight || window.innerHeight));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Hover expand ──────────────────────────────────────────────────────
    let hoverTarget = 0;
    let hoverSmooth = 0;

    const heroEl = mount.parentElement;
    const onMouseEnter = () => {
      hoverTarget = 0.42;
    };
    const onMouseLeave = () => {
      hoverTarget = 0;
    };
    if (heroEl) {
      heroEl.addEventListener('mouseenter', onMouseEnter);
      heroEl.addEventListener('mouseleave', onMouseLeave);
    }

    // ── Mouse parallax ────────────────────────────────────────────────────
    let targetX = 0;
    let targetY = 0;
    let smoothX = 0;
    let smoothY = 0;
    const onMouseMove = e => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) {return;}
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      globe.position.x = width > 768 ? 18 : 0;
    };
    window.addEventListener('resize', onResize);

    // ── Animate ───────────────────────────────────────────────────────────
    let frameId;
    let autoRotY = 0;
    let autoRotX = 0;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;

      // Smooth scroll + hover lerp — hover caps at 0.42, scroll goes to 1.0
      scrollSmooth += (scrollTarget - scrollSmooth) * 0.06;
      hoverSmooth += (hoverTarget - hoverSmooth) * 0.05;
      const explode = easeInOut(Math.min(1, scrollSmooth + hoverSmooth));

      // ── Globe particles ──────────────────────────────────────────────
      const dotAttr = dotGeo.attributes.position;
      const glowAttr = glowGeo.attributes.position;
      const lineAttr = lineGeo.attributes.position;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = globeOrig[i * 3] + (globeExplode[i * 3] - globeOrig[i * 3]) * explode;
        const y = globeOrig[i * 3 + 1] + (globeExplode[i * 3 + 1] - globeOrig[i * 3 + 1]) * explode;
        const z = globeOrig[i * 3 + 2] + (globeExplode[i * 3 + 2] - globeOrig[i * 3 + 2]) * explode;
        dotAttr.array[i * 3] = x;
        dotAttr.array[i * 3 + 1] = y;
        dotAttr.array[i * 3 + 2] = z;
        glowAttr.array[i * 3] = x;
        glowAttr.array[i * 3 + 1] = y;
        glowAttr.array[i * 3 + 2] = z;
      }
      dotAttr.needsUpdate = true;
      glowAttr.needsUpdate = true;

      // Lines — also move with particles + fade out
      const lineOrigVerts = lineVerts;
      for (let i = 0; i < lineAttr.array.length / 3; i++) {
        // Each line vertex maps back to a globe particle by nearest lookup
        // Simpler: scale the existing line positions by same explode factor
        lineAttr.array[i * 3] = lineOrigVerts[i * 3] + lineOrigVerts[i * 3] * (explode * 7.5);
        lineAttr.array[i * 3 + 1] =
          lineOrigVerts[i * 3 + 1] + lineOrigVerts[i * 3 + 1] * (explode * 7.5);
        lineAttr.array[i * 3 + 2] =
          lineOrigVerts[i * 3 + 2] + lineOrigVerts[i * 3 + 2] * (explode * 7.5);
      }
      lineAttr.needsUpdate = true;
      lineMat.opacity = 0.28 * (1 - explode);

      // ── Stars ─────────────────────────────────────────────────────────
      const starAttr = starGeo.attributes.position;
      for (let i = 0; i < STAR_COUNT; i++) {
        starAttr.array[i * 3] = starOrig[i * 3] + (starExplode[i * 3] - starOrig[i * 3]) * explode;
        starAttr.array[i * 3 + 1] =
          starOrig[i * 3 + 1] + (starExplode[i * 3 + 1] - starOrig[i * 3 + 1]) * explode;
        starAttr.array[i * 3 + 2] =
          starOrig[i * 3 + 2] + (starExplode[i * 3 + 2] - starOrig[i * 3 + 2]) * explode;
      }
      starAttr.needsUpdate = true;
      starMat.opacity = 0.5 * (1 - explode * 0.8);

      // Opacity fade on globe dots
      dotMat.opacity = 0.9 * (1 - explode * 0.7);
      glowMat.opacity = 0.07 * (1 - explode);

      // ── Globe rotation (slows as it explodes) ─────────────────────────
      autoRotY += 0.0022 * (1 - explode * 0.9);
      autoRotX += 0.0004 * (1 - explode * 0.9);

      smoothX += (targetX - smoothX) * 0.04;
      smoothY += (targetY - smoothY) * 0.04;

      globe.rotation.y = autoRotY + smoothX * 0.3;
      globe.rotation.x = autoRotX + smoothY * 0.18;

      const pulse = 1 + Math.sin(time * 0.6) * 0.012 * (1 - explode);
      globe.scale.setScalar(pulse);

      coronaMat.opacity = (0.02 + Math.sin(time * 1.1) * 0.008) * (1 - explode);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (heroEl) {
        heroEl.removeEventListener('mouseenter', onMouseEnter);
        heroEl.removeEventListener('mouseleave', onMouseLeave);
      }
      if (mount.contains(renderer.domElement)) {mount.removeChild(renderer.domElement);}
      renderer.dispose();
      [dotGeo, glowGeo, lineGeo, coronaGeo, starGeo].forEach(g => g.dispose());
      [dotMat, glowMat, lineMat, coronaMat, starMat].forEach(m => m.dispose());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};

export default HeroCanvas;
