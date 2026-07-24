'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';

// Full-viewport WebGL background: a rotating wireframe "core" with orbiting
// nodes, rendered through a CRT-style post-process shader (barrel distortion,
// scanlines, chromatic aberration, vignette). Call `trigger()` via ref to
// fire a glitch burst (e.g. on section change).

export type RetroCRTSceneHandle = {
  trigger: () => void;
};

export const RetroCRTScene = forwardRef<RetroCRTSceneHandle>(function RetroCRTScene(_props, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef(0);

  useImperativeHandle(ref, () => ({
    trigger: () => {
      glitchRef.current = 1;
    },
  }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    // --- Scene / camera / renderer -----------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.06);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // --- Retro floor grid ----------------------------------------------
    const grid = new THREE.GridHelper(24, 24, 0x00ff66, 0x003311);
    grid.position.y = -1.2;
    scene.add(grid);

    // --- Central wireframe "core" --------------------------------------
    const coreGeo = new THREE.IcosahedronGeometry(1.1, 1);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreLineMat = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 });
    const coreLines = new THREE.LineSegments(coreEdges, coreLineMat);
    scene.add(coreLines);

    const glowGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x003322,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // --- Orbiting nodes ---------------------------------------------
    const nodeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x33ffaa, wireframe: true });
    const nodes: THREE.Mesh[] = [];
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
      const m = new THREE.Mesh(nodeGeo, nodeMat);
      m.userData.angle = (i / nodeCount) * Math.PI * 2;
      m.userData.radius = 2.4;
      m.userData.speed = 0.15 + Math.random() * 0.1;
      m.userData.yOff = Math.random() * Math.PI * 2;
      scene.add(m);
      nodes.push(m);
    }

    // --- Render target + CRT post-process pass --------------------------
    const rt = new THREE.WebGLRenderTarget(width, height, { format: THREE.RGBAFormat });
    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: rt.texture },
        uTime: { value: 0 },
        uGlitch: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uGlitch;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(41.7, 289.1))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;

          // barrel distortion (CRT curvature)
          vec2 centered = uv * 2.0 - 1.0;
          float r2 = dot(centered, centered);
          centered *= 1.0 + 0.06 * r2;
          uv = centered * 0.5 + 0.5;

          // glitch: horizontal block displacement
          float blockY = floor(uv.y * 40.0);
          float glitchShift = 0.0;
          if (uGlitch > 0.01) {
            float n = hash(vec2(blockY, floor(uTime * 14.0)));
            if (n > 0.72) {
              glitchShift = (n - 0.85) * 0.6 * uGlitch;
            }
          }
          uv.x += glitchShift;

          // chromatic aberration, stronger during glitch
          float aberration = 0.0025 + uGlitch * 0.012;
          float r = texture2D(tDiffuse, uv + vec2(aberration, 0.0)).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - vec2(aberration, 0.0)).b;
          vec3 color = vec3(r, g, b);

          // scanlines
          float scan = sin(uv.y * uResolution.y) * 0.04;
          color -= scan;

          // rolling flicker
          float flicker = 0.97 + 0.03 * sin(uTime * 18.0);
          color *= flicker;

          // vignette
          float vig = smoothstep(1.0, 0.25, length(centered));
          color *= vig;

          // static noise burst during glitch
          float noise = hash(uv * uResolution.xy + uTime);
          color += (noise - 0.5) * 0.5 * uGlitch;

          // phosphor green tint
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          vec3 phosphor = vec3(0.15, 1.0, 0.55);
          color = mix(color, lum * phosphor, 0.15);

          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            color = vec3(0.0);
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const postPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
    postScene.add(postPlane);

    // --- Animation loop --------------------------------------------------
    const clock = new THREE.Clock();
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x = Math.sin(t * 0.15) * 6;
      camera.position.z = Math.cos(t * 0.15) * 6;
      camera.position.y = 1.4 + Math.sin(t * 0.3) * 0.2;
      camera.lookAt(0, 0, 0);

      coreLines.rotation.y += 0.003;
      coreLines.rotation.x += 0.001;
      glowMesh.rotation.copy(coreLines.rotation);

      nodes.forEach((n) => {
        const a = n.userData.angle + t * n.userData.speed;
        n.position.set(
          Math.cos(a) * n.userData.radius,
          Math.sin(t + n.userData.yOff) * 0.4,
          Math.sin(a) * n.userData.radius
        );
        n.rotation.x += 0.01;
        n.rotation.y += 0.015;
      });

      // ease glitch intensity back to 0
      glitchRef.current += (0 - glitchRef.current) * 0.06;

      postMaterial.uniforms.uTime.value = t;
      postMaterial.uniforms.uGlitch.value = glitchRef.current;

      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    }
    animate();

    // --- Resize handling ---------------------------------------------
    function handleResize() {
      if (!mount) return;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      rt.setSize(width, height);
      postMaterial.uniforms.uResolution.value.set(width, height);
    }
    window.addEventListener('resize', handleResize);

    // --- Cleanup -------------------------------------------------------
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      rt.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      coreGeo.dispose();
      coreEdges.dispose();
      coreLineMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      postPlane.geometry.dispose();
      postMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none" />;
});
