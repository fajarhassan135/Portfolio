"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Props = {
  onEnter: () => void;
  onReady?: () => void;
};

export default function ExteriorScene({ onEnter, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a14, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    // thinned right down: the establishing shot sits ~60 units back, and at the old 0.011 density
    // everything past the near band was ~87% fogged out, so the skyline read as empty haze
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.0032);

    // orbit rig, same pattern as the interior Scene — camera sits at a local offset from a pivot
    // group, so drag/scroll can freely rotate + zoom instead of being locked to a fixed framing
    // far plane pushed out for the wide establishing shot — the camera pulls back to ~60 and the
    // furthest city band plus the sky dome sit well beyond the old 150
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);
    const rig = new THREE.Group();
    rig.position.set(0, 2, 6); // pivot near street level, a bit down the road from the entrance
    scene.add(rig);
    rig.add(camera);

    const cRoad = 0x18151d;
    const cSidewalk = 0x312b38;
    const cCurb = 0x4a4450;
    const cAmber = 0xe0aa70;
    const cGreen = 0x3fe07a;
    const cCurtain = 0x4d1420;

    function addSolid(geo: THREE.BufferGeometry, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number; map?: THREE.Texture }) {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color,
          map: opts?.map,
          roughness: opts?.roughness ?? 0.75,
          metalness: opts?.metalness ?? 0.05,
          emissive: opts?.emissive ?? 0x000000,
          emissiveIntensity: opts?.emissive ? opts?.emissiveIntensity ?? 0.6 : 0,
        })
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return group;
    }
    function addBlock(w: number, h: number, d: number, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number; map?: THREE.Texture }) {
      return addSolid(new THREE.BoxGeometry(w, h, d), color, opts);
    }
    function addRoundedBlock(w: number, h: number, d: number, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number }, radius = 0.035) {
      return addSolid(new RoundedBoxGeometry(w, h, d, 2, radius), color, opts);
    }
    // capsule's straight length is (len - 2*r); pass the desired total tip-to-tip length
    function addCapsule(radius: number, length: number, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number }) {
      return addSolid(new THREE.CapsuleGeometry(radius, Math.max(0.001, length - radius * 2), 6, 12), color, opts);
    }
    function addSphere(radius: number, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number }) {
      return addSolid(new THREE.SphereGeometry(radius, 16, 12), color, opts);
    }

    // ================= PROCEDURAL TEXTURES — replaces the old flat-banded-box "brick" =================
    function makeBrickTexture() {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#3a1c17";
      ctx.fillRect(0, 0, c.width, c.height);
      const brickW = 64,
        brickH = 28,
        gap = 6;
      let row = 0;
      for (let y = 0; y < c.height; y += brickH + gap) {
        const offset = row % 2 === 0 ? 0 : brickW / 2;
        for (let x = -brickW; x < c.width + brickW; x += brickW + gap) {
          const shade = 0.85 + Math.random() * 0.3;
          const r = Math.min(255, 90 * shade + 20);
          const g = Math.min(255, 46 * shade + 10);
          const b = Math.min(255, 38 * shade + 8);
          ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
          ctx.fillRect(x + offset, y, brickW, brickH);
        }
        row++;
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 2);
      return tex;
    }
    function makeAsphaltTexture() {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#17141c";
      ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < 3600; i++) {
        const v = 20 + Math.random() * 30;
        ctx.fillStyle = `rgba(${v},${v},${v + 4},${0.15 + Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 3, 3);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 20);
      return tex;
    }
    const brickTexture = makeBrickTexture();
    const asphaltTexture = makeAsphaltTexture();

    function makeTextPlane(lines: string[], color: string, w: number, h: number, glow: number, font = "bold 44px Arial, sans-serif", bg?: string) {
      // 2x canvas resolution so text stays crisp when the camera zooms in close (interactive camera now allows that)
      const RES = 2;
      const canvasEl = document.createElement("canvas");
      // canvas aspect follows the plane's aspect. It used to be a fixed 2:1 regardless, so a wide
      // sign (the ENTER box is 7.4:1) stretched that texture across the plane and the glyphs came
      // out visibly wide and soft. Matching the aspect keeps letterforms true.
      canvasEl.width = 512 * RES;
      canvasEl.height = Math.max(96, Math.round(512 * RES * (h / w)));
      const ctx = canvasEl.getContext("2d")!;
      if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      }
      ctx.fillStyle = color;
      const basePx = parseInt(font.match(/(\d+)px/)?.[1] ?? "44", 10) * RES;
      // auto-fit: shrink until the widest line clears a safe margin. "FAJAR HASSAN" at the requested
      // 76px (=152px at RES 2) overran the 1024px canvas and rendered as "AJAR HASSA" — the first and
      // last glyphs were clipped by the canvas edge, not occluded by other geometry.
      const SAFE = canvasEl.width * 0.9;
      const SAFE_H = (canvasEl.height * 0.82) / lines.length; // also cap by height now that it varies
      let px = Math.min(basePx, Math.floor(SAFE_H));
      const widest = () => {
        ctx.font = font.replace(/(\d+)px/, `${px}px`);
        return Math.max(...lines.map((l) => ctx.measureText(l).width));
      };
      while (px > 8 && widest() > SAFE) px -= 2;
      ctx.font = font.replace(/(\d+)px/, `${px}px`);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lineHeight = canvasEl.height / (lines.length + 1);
      lines.forEach((line, i) => {
        ctx.fillText(line, canvasEl.width / 2, lineHeight * (i + 1));
      });
      const texture = new THREE.CanvasTexture(canvasEl);
      texture.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: !bg,
        emissive: new THREE.Color(bg ?? color),
        emissiveMap: texture,
        emissiveIntensity: glow,
        roughness: 0.5,
        depthWrite: false,
      });
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    }

    // ================= SKY =================
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 8;
    skyCanvas.height = 256;
    const skyCtx = skyCanvas.getContext("2d")!;
    const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#0a0a1c");
    grad.addColorStop(0.55, "#161226");
    grad.addColorStop(1, "#2a1c26");
    skyCtx.fillStyle = grad;
    skyCtx.fillRect(0, 0, 8, 256);
    // SKY DOME (was a flat plane) — a plane always has edges, and at yaw/pitch extremes the camera
    // could see past them, producing the "sky breaking" seam. An enclosing inverted sphere has no
    // edge to reach at any rotation, so the seam is unreachable by construction rather than by clamp.
    // Radius 120 keeps it inside the camera's 150 far-plane; fog is off so it never washes out.
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(120, 32, 20),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    sky.position.set(0, 0, 0);
    scene.add(sky);

    // distant ground — the sidewalk plane only spans z -1…8 and the road z 7…19, but the city bands
    // sit at z -9…-34, so the buildings had no ground beneath them and the sky showed through under
    // their bases, reading as a floating gap. This fills everything behind the sidewalk.
    const backLot = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 140),
      new THREE.MeshStandardMaterial({ color: 0x17151f, roughness: 0.95 })
    );
    backLot.rotation.x = -Math.PI / 2;
    backLot.position.set(0, -0.04, -69);
    backLot.receiveShadow = true;
    scene.add(backLot);

    // Stars are now scattered over the sky DOME rather than inside a small slab (the old field was a
    // 110-wide patch at z -40…-55, which only covered a narrow wedge straight ahead and left the rest
    // of the horizon bare). Spherical placement across the upper hemisphere puts them everywhere the
    // camera can look, right down to the horizon line, with a cosine bias so they thicken near the
    // horizon the way a real sky does.
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPos = new Float32Array(starCount * 3);
    const starSize = new Float32Array(starCount);
    const STAR_R = 105;
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      // bias toward the horizon: sqrt pushes samples down out of the zenith
      const phi = Math.acos(1 - Math.sqrt(Math.random()) * 0.97);
      const y = Math.cos(phi) * STAR_R;
      const rXZ = Math.sin(phi) * STAR_R;
      starPos[i * 3] = Math.cos(theta) * rXZ;
      starPos[i * 3 + 1] = Math.max(3, y);
      starPos[i * 3 + 2] = Math.sin(theta) * rXZ;
      starSize[i] = 0.5 + Math.random() * 1.6; // varied magnitudes so the field is not uniform
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSize, 1));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.85, sizeAttenuation: true, transparent: true, opacity: 0.95,
      fog: false, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ================= GROUND — much larger, curb-delineated, textured, no visible edge =================
    const GROUND_SPAN = 200;
    const sidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SPAN, 9),
      new THREE.MeshStandardMaterial({ color: cSidewalk, roughness: 0.88 })
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(0, 0, 3.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    const curb = addBlock(GROUND_SPAN, 0.18, 0.35, cCurb, { roughness: 0.6 });
    curb.position.set(0, 0.09, 7.6);
    scene.add(curb);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SPAN, 12),
      new THREE.MeshStandardMaterial({ color: cRoad, map: asphaltTexture, roughness: 0.75 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.01, 13);
    road.receiveShadow = true;
    scene.add(road);

    // NEAR SIDE OF THE STREET. The road only ran to z=19 while the establishing camera sits at z~64,
    // so everything in the lower half of frame was bare sky dome showing under the horizon — the flat
    // purple band. This carries the street all the way past the camera: far kerb, opposite pavement,
    // then a deep asphalt apron that runs well behind the viewer.
    const farCurb = addBlock(GROUND_SPAN, 0.18, 0.35, cCurb, { roughness: 0.6 });
    farCurb.position.set(0, 0.09, 19.2);
    scene.add(farCurb);
    const farWalk = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SPAN, 9),
      new THREE.MeshStandardMaterial({ color: cSidewalk, roughness: 0.88 })
    );
    farWalk.rotation.x = -Math.PI / 2;
    farWalk.position.set(0, 0, 23.8);
    farWalk.receiveShadow = true;
    scene.add(farWalk);
    const foreApron = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 140),
      new THREE.MeshStandardMaterial({ color: 0x0d0c11, map: asphaltTexture, roughness: 0.9 })
    );
    foreApron.rotation.x = -Math.PI / 2;
    foreApron.position.set(0, -0.02, 98);
    foreApron.receiveShadow = true;
    scene.add(foreApron);

    for (let x = -GROUND_SPAN / 2; x <= GROUND_SPAN / 2; x += 2.2) {
      const dash = addBlock(1.1, 0.02, 0.18, 0xcac2b0, { roughness: 0.6 });
      dash.position.set(x, 0.01, 13);
      scene.add(dash);
    }
    // crosswalk stripes near the entrance
    for (let x = -3.5; x <= 3.5; x += 0.9) {
      const stripe = addBlock(0.5, 0.02, 2.2, 0xb8b0a0, { roughness: 0.7 });
      stripe.position.set(x, 0.011, 8.5);
      scene.add(stripe);
    }

    // ================= DISTANT CITY — several depth bands, reads as a full skyline =================
    const cityBuildingConfigs: { x: number; z: number; w: number; h: number }[] = [];
    function addCityBand(zBase: number, xStart: number, xEnd: number, count: number, hMin: number, hMax: number) {
      for (let i = 0; i < count; i++) {
        const x = xStart + (i + Math.random() * 0.6) * ((xEnd - xStart) / count);
        cityBuildingConfigs.push({
          x,
          z: zBase - Math.random() * 3,
          w: 2.5 + Math.random() * 2.5,
          h: hMin + Math.random() * (hMax - hMin),
        });
      }
    }
    // Spread and count both raised substantially. At the establishing framing the visible half-width
    // is roughly 45-50 units at the cinema's depth and wider still further back, so the old ±75
    // spread left bare gaps at the edges of frame. These now run past the frame edge at every band,
    // and the counts are dense enough that the skyline reads continuous rather than as separate towers.
    // near band flanks the cinema building (kept clear of the entrance, x in roughly [-8.5,8.5])
    addCityBand(-9, -110, -8.5, 30, 5, 12);
    addCityBand(-9, 8.5, 110, 30, 5, 12);
    // mid band, taller, a bit further back
    addCityBand(-16, -120, -9, 26, 6, 16);
    addCityBand(-16, 9, 120, 26, 6, 16);
    // far band, taller still
    addCityBand(-24, -130, -10, 22, 8, 19);
    addCityBand(-24, 10, 130, 22, 8, 19);
    // farthest band, tallest — widest horizon spread, fills the gaps between the nearer towers
    addCityBand(-34, -140, -12, 20, 10, 24);
    addCityBand(-34, 12, 140, 20, 10, 24);
    // extra back band purely to close any remaining sky gaps between silhouettes
    addCityBand(-44, -150, -14, 18, 12, 28);
    addCityBand(-44, 14, 150, 18, 12, 28);

    // lit windows are instanced — hundreds of them across the whole skyline in a single draw call.
    // (instanced meshes can't vary emissive per-instance without custom shaders, so flicker windows
    // below are separate, individually-lit meshes layered on top of unlit wall cells instead.)
    const cityWindowGeo = new THREE.PlaneGeometry(0.35, 0.45);
    const cityWindowMat = new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.2, fog: false });
    const cityWindowMatrices: THREE.Matrix4[] = [];
    const cBuildingFarPalette = [0x181622, 0x1c1a2a, 0x141220, 0x201c2c, 0x191725];
    const flickerWindows: { mat: THREE.MeshStandardMaterial; phase: number }[] = [];
    cityBuildingConfigs.forEach(({ x, z, w, h }) => {
      const tint = cBuildingFarPalette[Math.floor(Math.random() * cBuildingFarPalette.length)];
      const b = addBlock(w, h, 4, tint, { roughness: 0.9 });
      b.position.set(x, h / 2, z);
      scene.add(b);
      // rooftop clutter on some buildings — breaks up the flat skyline silhouette
      if (Math.random() < 0.3) {
        const clutterH = 0.3 + Math.random() * 0.45;
        const clutter = addBlock(0.35 + Math.random() * 0.3, clutterH, 0.35 + Math.random() * 0.3, 0x100e18, { roughness: 0.9 });
        clutter.position.set(x + (Math.random() - 0.5) * w * 0.4, h + clutterH / 2, z);
        scene.add(clutter);
      }
      const cols = Math.max(1, Math.floor(w / 0.7));
      const rows = Math.max(1, Math.floor(h / 0.9));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const wx = x - w / 2 + 0.5 + c * 0.7;
          const wy = 0.6 + r * 0.9;
          if (Math.random() <= 0.38) {
            cityWindowMatrices.push(new THREE.Matrix4().makeTranslation(wx, wy, z + 2.01));
            continue;
          }
          // a few of the otherwise-dark cells get their own mesh so they can flicker independently
          if (Math.random() < 0.06) {
            const mat = new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 0, fog: false });
            const win = new THREE.Mesh(cityWindowGeo, mat);
            win.position.set(wx, wy, z + 2.02);
            scene.add(win);
            flickerWindows.push({ mat, phase: Math.random() * 100 });
          }
        }
      }
    });
    const cityWindows = new THREE.InstancedMesh(cityWindowGeo, cityWindowMat, cityWindowMatrices.length);
    cityWindowMatrices.forEach((m, i) => cityWindows.setMatrixAt(i, m));
    cityWindows.instanceMatrix.needsUpdate = true;
    scene.add(cityWindows);

    // ================= MAIN CINEMA BUILDING — matches the reference's composition =================
    const facadeW = 15;
    const facade = addBlock(facadeW, 7, 3.5, 0x3a1c17, { roughness: 0.9, map: brickTexture });
    facade.position.set(0, 3.5, -4.8);
    scene.add(facade);
    const parapet = addBlock(facadeW + 0.4, 0.35, 3.9, 0x241612, { roughness: 0.8 });
    parapet.position.set(0, 7.15, -4.8);
    scene.add(parapet);

    // cornice molding — thin protruding trim line breaking up the flat brick expanse
    const cornice = addBlock(facadeW + 0.3, 0.14, 3.7, 0x2a1710, { roughness: 0.75 });
    cornice.position.set(0, 6.78, -4.8);
    scene.add(cornice);

    // pilasters — vertical stone-toned strips flanking the facade, plus small capitals near the top
    [-6.85, 6.85].forEach((x) => {
      const pilaster = addBlock(0.42, 6.6, 3.65, 0x2c1712, { roughness: 0.8 });
      pilaster.position.set(x, 3.3, -4.78);
      scene.add(pilaster);
      const capital = addRoundedBlock(0.55, 0.22, 3.7, 0x3a231a, { roughness: 0.7 }, 0.03);
      capital.position.set(x, 6.55, -4.78);
      scene.add(capital);
    });

    // upper-facade round accent windows — small warm-lit portholes between the parapet and the marquee.
    // the inner pair (x=±1.4) was removed: it sat inside the brand sign's bounding box and slightly
    // in front of it in z, so the glow discs rendered on top of the "FAJAR HASSAN" letters. The outer
    // pair (x=±4.2) is clear of the sign's width and stays.
    [-4.2, 4.2].forEach((x) => {
      // light stone surround (was flat dark 0x1a0f0a) — stone-toned trim accent against the brick base
      const porthole = addSolid(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 16), 0xc9bfa8, { roughness: 0.45 });
      porthole.rotation.x = Math.PI / 2;
      porthole.position.set(x, 5.9, -3.03);
      scene.add(porthole);
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(0.24, 16),
        new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.1 })
      );
      glow.position.set(x, 5.9, -2.97);
      scene.add(glow);
    });

    // rooftop silhouette — utility unit + antenna, breaks up the flat roofline against the sky
    const roofUnit = addBlock(1.6, 0.6, 1.1, 0x161018, { roughness: 0.85 });
    roofUnit.position.set(-3.5, 7.62, -4.6);
    scene.add(roofUnit);
    const roofVent = addSolid(new THREE.CylinderGeometry(0.22, 0.26, 0.35, 10), 0x161018, { roughness: 0.85 });
    roofVent.position.set(2.6, 7.5, -4.9);
    scene.add(roofVent);
    // steam puffs — a handful of soft planes that rise and fade on a loop, restarted from the vent
    const steamPuffs: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; startY: number; offset: number }[] = [];
    const steamMap = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,0.5)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: steamMap, transparent: true, opacity: 0, depthWrite: false, fog: false });
      const puff = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat);
      puff.position.set(2.6, 7.7, -4.9);
      scene.add(puff);
      steamPuffs.push({ mesh: puff, mat, startY: 7.7, offset: i * 1.3 });
    }
    const antenna = addSolid(new THREE.CylinderGeometry(0.02, 0.03, 1.6, 6), 0x0a0a0a, { roughness: 0.6, metalness: 0.4 });
    antenna.position.set(4.8, 8.1, -5.0);
    scene.add(antenna);

    // brand sign above the marquee — mirrors the reference's theater-name plaque.
    // popped forward onto its own dark lightbox backing (z=-2.64/-2.71), now clearly in front of the
    // portholes (z=-2.97/-3.03) that previously rendered over the letters, and sized/lit up to read as
    // the most prominent element on the facade — this is the site owner's name.
    // near-black backing so the letters sit on maximum contrast rather than on lit brick
    const brandBacking = addBlock(10.2, 2.1, 0.12, 0x05040a, { roughness: 0.85 });
    brandBacking.position.set(0, 6.15, -2.71);
    scene.add(brandBacking);
    // brighter, larger, near-white-gold letters — highest-contrast element on the facade by design
    const brandSign = makeTextPlane(["FAJAR HASSAN"], "#fff0c8", 9.8, 1.95, 4.2, "bold italic 76px Georgia, serif");
    brandSign.position.set(0, 6.15, -2.64);
    scene.add(brandSign);
    // deliberately tight + modest: a wide/strong flood here lifted the surrounding brick to the same
    // luminance as the letters (measured 132 vs 140) and destroyed the local contrast that makes the
    // name read. Contrast comes from the dark backing behind the letters, not from flooding the wall.
    // A single close PointLight put a hard circular hot-spot on the brick behind the name. Two weak
    // lights spread wide apart, further off the wall, wash the sign evenly with no visible disc.
    [-2.1, 2.1].forEach((x) => {
      const bl = new THREE.PointLight(0xffe6b0, 3.2, 6.5);
      bl.position.set(x, 6.1, -1.85);
      scene.add(bl);
    });

    // ================= MARQUEE — one large backlit white lightbox panel (was 3 separate cream
    // panels on a dark backing) in an ornate dark green/bronze frame with dentil molding and small
    // warm downlights along the underside; CINEMA + tagline content unchanged, just re-hosted =================
    const canopy = addBlock(11, 0.55, 2.6, 0x1a1014, { roughness: 0.55, metalness: 0.15 });
    canopy.position.set(0, 4.5, -2.9);
    scene.add(canopy);
    // backlit, but deliberately dimmer than the name above it — at 0.9 this panel measured brighter
    // (avg 200) than the brand sign (140) and stole the focal point from the owner's name
    const canopyFace = addBlock(11.05, 1.5, 0.12, 0xf4efe4, {
      roughness: 0.35,
      metalness: 0.05,
      emissive: 0xfff6e8,
      emissiveIntensity: 0.42,
    });
    canopyFace.position.set(0, 4.2, -1.65);
    scene.add(canopyFace);

    // ornate frame — dark green/bronze surround around the lightbox
    const cFrameGreen = 0x2c4536;
    const cFrameBronze = 0x8a6a3a;
    const frameW = 11.3,
      frameH = 1.7;
    const frameTop = addBlock(frameW, 0.14, 0.16, cFrameGreen, { roughness: 0.5, metalness: 0.3 });
    frameTop.position.set(0, 4.2 + frameH / 2, -1.6);
    scene.add(frameTop);
    const frameBottom = addBlock(frameW, 0.14, 0.16, cFrameGreen, { roughness: 0.5, metalness: 0.3 });
    frameBottom.position.set(0, 4.2 - frameH / 2, -1.6);
    scene.add(frameBottom);
    [-1, 1].forEach((mirror) => {
      const frameSide = addBlock(0.14, frameH, 0.16, cFrameGreen, { roughness: 0.5, metalness: 0.3 });
      frameSide.position.set(mirror * (frameW / 2), 4.2, -1.6);
      scene.add(frameSide);
    });
    // dentil molding — repeated small bronze blocks along the frame's top edge, classic cornice trim
    const dentilCount = 22;
    for (let i = 0; i < dentilCount; i++) {
      const dx = -frameW / 2 + 0.25 + i * ((frameW - 0.5) / (dentilCount - 1));
      const dentil = addBlock(0.12, 0.1, 0.1, cFrameBronze, { roughness: 0.4, metalness: 0.5 });
      dentil.position.set(dx, 4.2 + frameH / 2 - 0.03, -1.52);
      scene.add(dentil);
    }
    // small round downlights along the frame's underside — warm white, distinct from the amber bulb
    // chase string below (that one stays as-is, this coexists with it)
    const downlightColor = 0xfff2dc;
    for (let i = 0; i < 14; i++) {
      const dx = -frameW / 2 + 0.4 + i * ((frameW - 0.8) / 13);
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.045, 10),
        new THREE.MeshStandardMaterial({ color: downlightColor, emissive: downlightColor, emissiveIntensity: 1.6 })
      );
      disc.rotation.x = Math.PI / 2;
      disc.position.set(dx, 4.2 - frameH / 2 - 0.02, -1.55);
      scene.add(disc);
    }
    [-4, 0, 4].forEach((dx) => {
      const downlightGlow = new THREE.PointLight(downlightColor, 4, 2.5);
      downlightGlow.position.set(dx, 4.2 - frameH / 2 - 0.05, -1.4);
      scene.add(downlightGlow);
    });

    function makeMarqueePanel(lines: string[], w: number, h: number, font: string) {
      // no opaque bg now — reads directly on the backlit white lightbox behind it as one continuous panel
      const panel = makeTextPlane(lines, "#1a1015", w, h, 0.7, font);
      // thin grid overlay, echoing the reference's letterboard grid
      const group = new THREE.Group();
      group.add(panel);
      // horizontal rows, not vertical columns — a letterboard is a stack of slotted rows that the
      // letter tiles slide into, so the rules run across the panel
      const rowGap = 0.26;
      const rows = Math.max(1, Math.round(h / rowGap));
      for (let i = 1; i < rows; i++) {
        const line = addBlock(w, 0.012, 0.005, 0x3a3530, { roughness: 0.7 });
        line.position.set(0, h / 2 - i * (h / rows), 0.01);
        group.add(line);
      }
      return group;
    }
    const tagLeft = makeMarqueePanel(["SHIPPED IN 4K"], 3.1, 1.15, "900 40px Arial Black, Arial, sans-serif");
    tagLeft.position.set(-3.85, 4.2, -1.58);
    scene.add(tagLeft);
    const cinemaPanel = makeMarqueePanel(["CINEMA"], 4.1, 1.3, "bold 64px Arial, sans-serif");
    cinemaPanel.position.set(0, 4.2, -1.58);
    scene.add(cinemaPanel);
    const tagRight = makeMarqueePanel(["BUILT WITH REACT", "& POPCORN"], 3.1, 1.15, "900 32px Arial Black, Arial, sans-serif");
    tagRight.position.set(3.85, 4.2, -1.58);
    scene.add(tagRight);

    // continuous glow rail beneath the bulb row — reads as one solid lit strip instead of sparse dots,
    // with the individual bulbs riding on top for the chase sparkle
    // BULB PLACEMENT — the strip previously sat at y=4.16 / z=-1.05: the same height as the text
    // panels (y=4.2) but in front of them, so the bulbs ran straight through the lettering. The whole
    // run now sits on the frame's bottom edge at y=3.35, which is 0.2 below the panel's lower bound
    // (3.55) and 0.13 above the ENTER sign — clear separation in Y, and no longer floating in front.
    const BULB_Y = 3.42;
    const bulbStripMat = new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.0 });
    const bulbFrontStrip = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 10.4, 4, 8), bulbStripMat);
    bulbFrontStrip.rotation.z = Math.PI / 2;
    bulbFrontStrip.position.set(0, BULB_Y, -1.55);
    scene.add(bulbFrontStrip);
    [-5.65, 5.65].forEach((x) => {
      const sideStrip = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 1.0, 4, 8), bulbStripMat);
      sideStrip.rotation.x = Math.PI / 2;
      sideStrip.position.set(x, BULB_Y, -2.15);
      scene.add(sideStrip);
    });

    // marquee bulb strip — tracked so the animate loop can run a classic chase pattern along it.
    // spacing tightened (was 0.4/0.35) so the row itself reads denser, on top of the strip above.
    const marqueeBulbs: THREE.MeshStandardMaterial[] = [];
    function addMarqueeBulb(x: number, z: number) {
      const bulbMat = new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.8 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), bulbMat);
      bulb.position.set(x, BULB_Y, z);
      scene.add(bulb);
      marqueeBulbs.push(bulbMat);
    }
    // front edge, then both side "returns" so the chase wraps the whole canopy like a real marquee border
    for (let x = -5.6; x <= 5.6; x += 0.3) addMarqueeBulb(x, -1.55);
    for (let z = -1.75; z >= -2.75; z -= 0.27) {
      addMarqueeBulb(-5.65, z);
      addMarqueeBulb(5.65, z);
    }
    // pulled back from 50/13: at that strength these three floods were the dominant light on the
    // whole facade, lifting the brick around the brand sign to the sign's own luminance. Tighter
    // range keeps the glow on the marquee where it belongs.
    [-3.5, 0, 3.5].forEach((x) => {
      const canopyGlow = new THREE.PointLight(cAmber, 20, 6.5);
      canopyGlow.position.set(x, 4.2, -1.6);
      scene.add(canopyGlow);
    });

    // ================= TICKET BOOTH (left, matching reference) =================
    const kiosk = addBlock(1.5, 1.7, 1.0, 0x2e3a4a, { roughness: 0.5 });
    kiosk.position.set(-4.6, 0.85, -1.9);
    scene.add(kiosk);
    // painted trim strip along the base — two-tone body per the reference (blue-grey upper, warm red base)
    const kioskTrim = addBlock(1.52, 0.3, 1.02, cCurtain, { roughness: 0.55 });
    kioskTrim.position.set(-4.6, 0.15, -1.9);
    scene.add(kioskTrim);
    // BOOTH DETAIL. The window used to be a single flat emissive panel at intensity 1.1 with a
    // 22-strength lamp on it, which blew out to a featureless white rectangle. It is now built like
    // an actual kiosk: a recessed dark interior, a warm glow deep inside it, a brass frame, a
    // counter ledge and a mullion. The interior light is what you see, not the panel itself.
    const kioskRecess = addBlock(0.86, 0.62, 0.12, 0x100d12, { roughness: 0.8 });
    kioskRecess.position.set(-4.6, 1.05, -1.46);
    scene.add(kioskRecess);
    // warm interior, deliberately dim — it reads as a lit room behind glass, not a lamp
    const kioskInterior = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.56),
      new THREE.MeshStandardMaterial({ color: 0xc98f4e, emissive: 0xc98f4e, emissiveIntensity: 0.34 })
    );
    kioskInterior.position.set(-4.6, 1.05, -1.43);
    scene.add(kioskInterior);
    // glass over the opening, dark and slightly reflective
    const kioskGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.84, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x16202a, roughness: 0.12, metalness: 0.5, transparent: true, opacity: 0.45,
      })
    );
    kioskGlass.position.set(-4.6, 1.05, -1.39);
    scene.add(kioskGlass);
    // brass frame around the opening + a central mullion
    const cBrass = 0x9a7a48;
    [[0, 0.33, 0.9, 0.05], [0, -0.33, 0.9, 0.05], [-0.44, 0, 0.05, 0.66], [0.44, 0, 0.05, 0.66]].forEach(
      ([dx, dy, w, h]) => {
        const bar = addBlock(w, h, 0.05, cBrass, { roughness: 0.35, metalness: 0.6 });
        bar.position.set(-4.6 + dx, 1.05 + dy, -1.385);
        scene.add(bar);
      }
    );
    const mullion = addBlock(0.035, 0.6, 0.04, cBrass, { roughness: 0.35, metalness: 0.6 });
    mullion.position.set(-4.6, 1.05, -1.383);
    scene.add(mullion);
    // counter ledge under the window — the giveaway that this is a serving hatch
    const kioskLedge = addBlock(1.0, 0.06, 0.22, 0x3a4757, { roughness: 0.5 });
    kioskLedge.position.set(-4.6, 0.71, -1.34);
    scene.add(kioskLedge);
    // fascia sign, unlit board with modest glow rather than a bright panel
    const ticketsBoard = addBlock(1.35, 0.4, 0.06, 0x14100f, { roughness: 0.6 });
    ticketsBoard.position.set(-4.6, 1.62, -1.4);
    scene.add(ticketsBoard);
    const ticketsSign = makeTextPlane(["TICKETS"], "#f0dfae", 1.2, 0.3, 0.7, "bold 40px Arial, sans-serif");
    ticketsSign.position.set(-4.6, 1.62, -1.36);
    scene.add(ticketsSign);
    const kioskLight = new THREE.PointLight(cAmber, 5, 2.6);
    kioskLight.position.set(-4.6, 1.5, -1.05);
    scene.add(kioskLight);

    // ================= POSTER CASE (right) — 2x2 grid, matching reference =================
    const POSTER_X = 5.3;
    const POSTER_Y = 2.0;
    const posterCase = addBlock(2.7, 3.3, 0.16, 0x2e3a4a, { roughness: 0.5 });
    posterCase.position.set(POSTER_X, POSTER_Y, -1.9);
    scene.add(posterCase);
    // matching painted base trim, same treatment as the ticket kiosk
    const posterCaseTrim = addBlock(2.72, 0.5, 0.18, cCurtain, { roughness: 0.55 });
    posterCaseTrim.position.set(POSTER_X, POSTER_Y - 1.4, -1.9);
    scene.add(posterCaseTrim);

    // one-sheet artwork drawn procedurally: a tonal ground in each film's palette, a soft key-light
    // wash, then the title set the way that film sets it. Not the real key art (see note to author),
    // but it reads as four distinct, specific posters rather than four colour swatches.
    function makePosterArt(opts: {
      top: string; bottom: string; glow: string; glowX: number; glowY: number;
      title: string[]; titleColor: string; font: string; titleY: number; letterSpacing?: number;
    }) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 768;
      const ctx = c.getContext("2d")!;
      const g = ctx.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0, opts.top);
      g.addColorStop(1, opts.bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
      // key light blooming from one side, which is what gives each of these posters its shape
      const rg = ctx.createRadialGradient(
        c.width * opts.glowX, c.height * opts.glowY, 10,
        c.width * opts.glowX, c.height * opts.glowY, c.width * 0.85
      );
      rg.addColorStop(0, opts.glow);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = opts.titleColor;
      let px = parseInt(opts.font.match(/(\d+)px/)?.[1] ?? "60", 10);
      const fit = () => {
        ctx.font = opts.font.replace(/(\d+)px/, `${px}px`);
        return Math.max(...opts.title.map((t) => ctx.measureText(t).width));
      };
      while (px > 10 && fit() > c.width * 0.86) px -= 2;
      ctx.font = opts.font.replace(/(\d+)px/, `${px}px`);
      opts.title.forEach((t, i) => {
        ctx.fillText(t, c.width / 2, c.height * opts.titleY + i * px * 1.12);
      });
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }
    const posterArt = [
      // Hamnet — deep forest greens, cream serif
      makePosterArt({ top: "#1d2a1c", bottom: "#0d1410", glow: "rgba(122,142,96,0.5)", glowX: 0.5, glowY: 0.38,
        title: ["HAMNET"], titleColor: "#f2ead6", font: "400 62px Georgia, serif", titleY: 0.52 }),
      // Her — warm blush field, soft white type
      makePosterArt({ top: "#d96b5a", bottom: "#8f3a33", glow: "rgba(255,190,150,0.45)", glowX: 0.5, glowY: 0.35,
        title: ["her"], titleColor: "#fdf3ec", font: "300 92px Georgia, serif", titleY: 0.5 }),
      // The Wolf of Wall Street — black and gold, stacked caps
      makePosterArt({ top: "#141210", bottom: "#0a0908", glow: "rgba(200,160,70,0.4)", glowX: 0.5, glowY: 0.66,
        title: ["THE WOLF", "OF WALL ST"], titleColor: "#e8c86a", font: "800 54px Arial Black, Arial, sans-serif", titleY: 0.24 }),
      // La La Land — the red/teal split, thin deco caps
      makePosterArt({ top: "#0f5f57", bottom: "#8f2a1c", glow: "rgba(60,200,180,0.45)", glowX: 0.62, glowY: 0.45,
        title: ["LA LA LAND"], titleColor: "#ffffff", font: "300 58px Futura, Century Gothic, sans-serif", titleY: 0.3 }),
    ];
    // Real one-sheets are used when present. Drop files at these paths and they replace the
    // procedural art above automatically on next load; if a file is missing the loader errors
    // quietly and the generated poster stays, so the case is never empty.
    const posterFiles = [
      "/posters/hamnet.jpg",
      "/posters/her.jpg",
      "/posters/wolfofwallstreet.jpg",
      "/posters/lalaland.jpg",
    ];
    const posterLoader = new THREE.TextureLoader();
    // LAYOUT / DEPTH: 0.84 x 1.26 is 2:3, matching the supplied one-sheets (735x1103 etc) so nothing
    // is stretched. The grid is centred at y=2.25 rather than on the case centre, because the red base
    // trim occupies y 0.35–0.85 — the previous grid reached down to 0.57 and collided with it. At
    // y=2.25 the posters span 0.95–3.55, inside the case (0.35–3.65) with the trim fully clear below.
    // z=-1.76 puts them 0.06 proud of the case face (-1.82) and the trim face (-1.81); at the old
    // -1.81 they were coplanar with the trim, which is what caused the flickering show-through.
    const POSTER_GRID_Y = 2.25;
    posterArt.forEach((fallbackTex, i) => {
      const px = i % 2 === 0 ? -0.47 : 0.47;
      const py = i < 2 ? 0.67 : -0.67;
      const mat = new THREE.MeshStandardMaterial({
        map: fallbackTex, emissive: 0xffffff, emissiveMap: fallbackTex,
        emissiveIntensity: 0.35, roughness: 0.6,
      });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.26), mat);
      p.position.set(POSTER_X + px, POSTER_GRID_Y + py, -1.76);
      scene.add(p);
      posterLoader.load(
        posterFiles[i],
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          mat.map = tex;
          mat.emissiveMap = tex;
          mat.needsUpdate = true;
        },
        undefined,
        () => {
          /* no file supplied yet — keep the generated artwork */
        }
      );
    });
    // split into two soft lights above and below rather than one bright disc in the middle of the case
    [POSTER_Y + 1.0, POSTER_Y - 1.0].forEach((y) => {
      const pl = new THREE.PointLight(0xfff2dc, 4.5, 3.6);
      pl.position.set(POSTER_X, y, -1.35);
      scene.add(pl);
    });

    // ================= ENTRANCE — row of 4 individual dark-wood-and-glass doors (was a single
    // curtained doorway), a light-stone surround, shallow steps, and a red carpet runner =================
    const doorGroup = new THREE.Group();
    // NOTE ON DEPTH: the facade block's front face is z = -3.05 (centre -4.8, depth 3.5). The whole
    // entrance previously sat at z -3.6…-3.9, i.e. *inside* that solid block, so the doors were
    // completely hidden and the entrance read as a plain dark gap. Everything here is now placed in
    // front of -3.05.
    const doorFrame = addBlock(4.4, 3.2, 0.35, 0x0a0608, { roughness: 0.7 });
    doorFrame.position.set(0, 1.6, -3.2);
    doorGroup.add(doorFrame);
    const doorway = addBlock(4.0, 2.8, 0.15, 0x08050a, { roughness: 0.85 });
    doorway.position.set(0, 1.5, -3.1); // must stay behind the door leaves (front face -2.94)
    doorGroup.add(doorway);
    // light-stone surround framing the widened opening — the stone-toned trim accent (matches the
    // porthole rings above), kept at the same recessed depth as the door frame itself
    const stoneSurroundColor = 0xc9bfa8;
    const stoneSurroundTop = addBlock(4.7, 0.22, 0.4, stoneSurroundColor, { roughness: 0.45 });
    stoneSurroundTop.position.set(0, 3.31, -2.92);
    doorGroup.add(stoneSurroundTop);
    [-1, 1].forEach((mirror) => {
      const stoneSurroundSide = addBlock(0.22, 3.2, 0.4, stoneSurroundColor, { roughness: 0.45 });
      stoneSurroundSide.position.set(mirror * 2.24, 1.6, -2.92);
      doorGroup.add(stoneSurroundSide);
    });

    // 4 individual dark-wood-framed glass doors with a horizontal brass handle bar each, no curtains
    const doorCount = 4;
    const doorW = 0.86;
    const doorGap = 0.06;
    const rowWidth = doorCount * doorW + (doorCount - 1) * doorGap;
    for (let i = 0; i < doorCount; i++) {
      const dx = -rowWidth / 2 + doorW / 2 + i * (doorW + doorGap);
      // lightened from 0x241812, which measured avg luminance 27 (near-black) even under direct
      // light — the door row read as one dark gap. This tone keeps the "dark wood" reading but
      // actually resolves as individual doors from the default framing.
      const doorWood = addBlock(doorW, 2.7, 0.08, 0x5a3f2b, { roughness: 0.55 });
      doorWood.position.set(dx, 1.5, -2.98);
      doorGroup.add(doorWood);
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(doorW - 0.12, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x1b2836, roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.72 })
      );
      glass.position.set(dx, 1.5, -2.93);
      doorGroup.add(glass);
      const handle = addSolid(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 10), 0xe8c98a, { roughness: 0.2, metalness: 0.85 });
      handle.rotation.z = Math.PI / 2;
      handle.position.set(dx, 1.15, -2.86);
      doorGroup.add(handle);
    }
    scene.add(doorGroup);
    // warm wash across the door row — without it the recessed doors read as one dark gap under the
    // canopy and the wood/glass/brass separation is invisible from the default framing
    [-1.35, 0, 1.35].forEach((x) => {
      const doorWash = new THREE.PointLight(0xffd9a0, 16, 3.0);
      // z=-3.35 sits in the clear gap between the back face of the top step (-3.15) and the door
      // faces (-3.63); at -3.15 the light was buried inside the step block and lit nothing
      doorWash.position.set(x, 1.5, -3.35);
      scene.add(doorWash);
    });
    // center of the new door row — the walk-to-door auto-enter check (in the animate loop) uses this
    const DOOR_ROW_CENTER = { x: 0, z: -2.95 };
    // generous invisible click target covering the whole visible door row, its stone surround and the
    // steps. Previously nothing here was clickable at all — handleTap only raycast the ground plane,
    // so the only spot that "worked" was where ground showed through the doorway gap.
    // Deliberately generous: covers the whole entrance bay — doors, stone surround, steps, the ENTER
    // sign above and the marquee underside — so a click anywhere around the entrance registers.
    const doorHitZone = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 5.2, 2.6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    doorHitZone.position.set(0, 2.2, -2.5);
    scene.add(doorHitZone);

    // shallow steps leading up to the doors, very low rise since the walker stays at a fixed ground
    // height (no per-step climb animation in this pass)
    const stepColor = 0xb8ada0;
    const stepRise = 0.04;
    const stepRun = 0.4;
    // i=0 is the top step, nearest the doors; they descend outward toward the sidewalk. Front edge
    // of the top step is z=-2.72, clear of the door faces now at -2.98.
    [0, 1, 2].forEach((i) => {
      const stepW = 4.8 - i * 0.35;
      const h = stepRise * (3 - i);
      const step = addBlock(stepW, h, stepRun, stepColor, { roughness: 0.6 });
      step.position.set(0, h / 2, -2.52 + i * stepRun);
      scene.add(step);
    });

    // red carpet runner — sidewalk/crosswalk to the base of the steps, threading between the kiosk
    // and poster case
    const carpet = addBlock(3.0, 0.02, 9.6, 0xa3182c, { roughness: 0.75 });
    carpet.position.set(0, 0.011, 2.8);
    scene.add(carpet);

    // was y=3.55 — the marquee canopy face (y 3.45–4.95, z=-1.65) sits in front of that and cut off
    // the top of the lettering. Dropped into the clear band between the door tops (y=2.85) and the
    // marquee frame's lower edge (y=3.28), and brought forward onto the new stone lintel.
    // ENTRY WAYFINDING — this is the one control the visitor has to find, so it is deliberately the
    // brightest, highest-contrast thing at street level: a wide neon box on a near-black backing,
    // ringed by a green tube, with its own light. Sits in the band between the door heads (2.85) and
    // the relocated bulb run (3.42), so it reads immediately without colliding with either.
    const ENTER_Y = 3.06;
    const signBacking = addBlock(4.0, 0.58, 0.06, 0x05070a, { roughness: 0.5 });
    signBacking.position.set(0, ENTER_Y, -2.7);
    scene.add(signBacking);
    // neon tube outline around the box — reads as a lit sign rather than painted text
    const neonMat = new THREE.MeshStandardMaterial({ color: cGreen, emissive: cGreen, emissiveIntensity: 2.6 });
    [-1, 1].forEach((m) => {
      const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 3.86, 4, 8), neonMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, ENTER_Y + m * 0.27, -2.66);
      scene.add(bar);
      const post = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.5, 4, 8), neonMat);
      post.position.set(m * 1.95, ENTER_Y, -2.66);
      scene.add(post);
    });
    // The SIGN FACE itself is the light source: a solid green illuminated panel with the lettering
    // knocked out dark, the way a real backlit entrance/exit sign works. Previously the green came
    // from PointLights washing the doorway, which read as a floating green lamp rather than a sign.
    // Emissive is kept deliberately modest. Pushed harder (3.4) the ACES tone curve clipped the
    // panel to near-white — measured only 11% of its pixels still reading as green — so it glowed
    // but stopped looking green at all. This stays saturated while still self-lit.
    const enterSign = makeTextPlane(
      ["ENTER HERE"], "#02120a", 3.7, 0.5, 1.15, "bold 66px Arial Black, Arial, sans-serif", "#17c95e"
    );
    enterSign.position.set(0, ENTER_Y, -2.64);
    scene.add(enterSign);
    const enterMat = enterSign.material as THREE.MeshStandardMaterial;
    // Black base colour so the diffuse map contributes nothing and ONLY the emissive map lights the
    // panel. Left lit, the warm ambient/hemisphere light landed on the green face and desaturated it
    // to a grey-green (measured mean RGB 143,174,124). Self-lit only, it stays properly green.
    enterMat.color.setHex(0x000000);
    // Only a faint spill remains — enough that the sign looks like it is throwing a little light onto
    // the stone around it. The old pair (22 @ range 8 and 14 @ range 5) flooded the whole doorway
    // green, which is what made it read as a green lamp instead of an illuminated sign.
    const enterGlow = new THREE.PointLight(cGreen, 4, 2.4);
    enterGlow.position.set(0, ENTER_Y - 0.05, -2.45);
    scene.add(enterGlow);

    // small brass address plaque beside the entrance — street-level dressing
    // was at z=-3.55 — behind the facade's front face (-3.05), so it was buried in the wall and
    // never visible. Now sits on the stone surround pier beside the door row.
    const addressPlaque = makeTextPlane(["142"], "#c9a35a", 0.4, 0.22, 0.8, "bold 26px Georgia, serif", "#1a1210");
    addressPlaque.position.set(2.24, 1.05, -2.7);
    scene.add(addressPlaque);

    // ================= PROJECTING BLADE SIGN — perpendicular "CINEMA" sign, readable along the street =================
    const bladeMountX = facadeW / 2 + 0.15;
    const bladeBracket = addBlock(0.9, 0.1, 0.1, 0x1a1a1e, { roughness: 0.4, metalness: 0.55 });
    bladeBracket.rotation.y = Math.PI / 2;
    bladeBracket.position.set(bladeMountX + 0.45, 4.6, -3.2);
    scene.add(bladeBracket);
    const bladeSign = makeTextPlane(["C", "I", "N", "E", "M", "A"], "#3fe07a", 0.9, 3.0, 2.4, "bold 58px Arial, sans-serif", "#0a0608");
    bladeSign.rotation.y = Math.PI / 2;
    bladeSign.position.set(bladeMountX + 0.92, 3.6, -3.2);
    scene.add(bladeSign);
    const bladeGlow = new THREE.PointLight(cGreen, 16, 5);
    bladeGlow.position.set(bladeMountX + 0.92, 3.6, -3.2);
    scene.add(bladeGlow);

    // ================= SIDEWALK A-FRAME SIGN — street-level showtimes board near the entrance =================
    function makeSidewalkSign() {
      const group = new THREE.Group();
      [-0.22, 0.22].forEach((tiltX) => {
        const panel = addBlock(0.55, 0.85, 0.04, 0x171018, { roughness: 0.6 });
        panel.position.set(tiltX, 0.425, 0);
        panel.rotation.y = tiltX < 0 ? 0.35 : -0.35;
        group.add(panel);
      });
      const board = makeTextPlane(["NOW SHOWING", "TONIGHT 8PM"], "#f1ead8", 0.5, 0.7, 0.5, "bold 22px Arial, sans-serif", "#171018");
      board.position.set(-0.2, 0.425, 0.03);
      board.rotation.y = 0.35;
      group.add(board);
      return group;
    }
    const sidewalkSign = makeSidewalkSign();
    sidewalkSign.position.set(2.5, 0, -0.6);
    sidewalkSign.rotation.y = 0.4;
    scene.add(sidewalkSign);
    const sidewalkSignLight = new THREE.PointLight(0xfff2dc, 5, 2.5);
    sidewalkSignLight.position.set(2.5, 0.6, -0.4);
    scene.add(sidewalkSignLight);

    // ================= LIGHTING =================
    const ambient = new THREE.AmbientLight(0x33344a, 1.4);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0x33344a, 0x0d0d16, 0.85);
    scene.add(hemi);
    const moonLight = new THREE.DirectionalLight(0x8fa0c0, 0.65);
    moonLight.position.set(-8, 14, 8);
    moonLight.castShadow = true;
    scene.add(moonLight);

    function makeStreetlamp() {
      const group = new THREE.Group();
      const pole = addBlock(0.12, 3.4, 0.12, 0x1a1a1e, { roughness: 0.4, metalness: 0.55 });
      pole.position.y = 1.7;
      group.add(pole);
      const arm = addBlock(0.7, 0.08, 0.08, 0x1a1a1e, { roughness: 0.4, metalness: 0.55 });
      arm.position.set(0.35, 3.35, 0);
      group.add(arm);
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 10),
        new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.6 })
      );
      lamp.position.set(0.68, 3.25, 0);
      group.add(lamp);
      const light = new THREE.PointLight(cAmber, 30, 11);
      light.position.set(0.68, 3.15, 0);
      group.add(light);
      return { group, light, lampMat: lamp.material as THREE.MeshStandardMaterial };
    }
    // moved onto the curb line (z=7.6), spaced well apart from the entrance/camera focus — refs kept
    // so a random lamp can flicker occasionally in the animate loop
    const streetlamps: { light: THREE.PointLight; mat: THREE.MeshStandardMaterial; baseIntensity: number }[] = [];
    [-13, -6.5, 6.5, 13].forEach((x) => {
      const { group, light, lampMat } = makeStreetlamp();
      group.position.set(x, 0, 7.6);
      scene.add(group);
      streetlamps.push({ light, mat: lampMat, baseIntensity: 30 });
    });

    // ================= STREET DRESSING — mostly on the left, to balance the bench+character on the right =================
    function makeTree(trunkH: number) {
      const group = new THREE.Group();
      const trunk = addSolid(new THREE.CylinderGeometry(0.09, 0.13, trunkH, 8), 0x2a1c14, { roughness: 0.85 });
      trunk.position.y = trunkH / 2;
      group.add(trunk);
      const canopyColor = 0x1f3a24;
      const puffs: [number, number, number, number][] = [
        [0, trunkH + 0.35, 0, 0.5],
        [0.25, trunkH + 0.15, 0.15, 0.38],
        [-0.28, trunkH + 0.2, -0.1, 0.4],
        [0.05, trunkH + 0.55, -0.2, 0.36],
      ];
      puffs.forEach(([x, y, z, s]) => {
        const puff = addSphere(s, canopyColor, { roughness: 0.85 });
        puff.position.set(x, y, z);
        group.add(puff);
      });
      return group;
    }
    function makeTrashCan() {
      const group = new THREE.Group();
      const body = addSolid(new THREE.CylinderGeometry(0.16, 0.14, 0.42, 12), 0x2c2f28, { roughness: 0.6, metalness: 0.3 });
      body.position.y = 0.21;
      group.add(body);
      const lid = addSolid(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12), 0x1e211c, { roughness: 0.5, metalness: 0.3 });
      lid.position.y = 0.44;
      group.add(lid);
      return group;
    }
    function makeBench() {
      const group = new THREE.Group();
      const seat = addBlock(1.5, 0.32, 0.55, 0x2a2530, { roughness: 0.7 });
      seat.position.y = 0.16;
      group.add(seat);
      [-0.6, 0.6].forEach((x) => {
        const leg = addBlock(0.1, 0.16, 0.5, 0x1a1620, { roughness: 0.6 });
        leg.position.set(x, 0.08, 0);
        group.add(leg);
      });
      return group;
    }
    function makeNewsstand() {
      const group = new THREE.Group();
      const booth = addRoundedBlock(0.9, 1.0, 0.6, 0x24303a, { roughness: 0.6 }, 0.03);
      booth.position.y = 0.5;
      group.add(booth);
      const roof = addRoundedBlock(1.05, 0.08, 0.75, 0x151d24, { roughness: 0.6 }, 0.02);
      roof.position.y = 1.05;
      group.add(roof);
      const sign = makeTextPlane(["NEWS"], "#151015", 0.55, 0.24, 0.6, "bold 34px Arial, sans-serif", "#f1ead8");
      sign.position.set(0, 1.16, 0.301);
      group.add(sign);
      const paperColor = 0xc9c2ae;
      for (let i = 0; i < 3; i++) {
        const stack = addBlock(0.22, 0.06, 0.16, paperColor, { roughness: 0.9 });
        stack.position.set(-0.25 + i * 0.22, 0.82 + i * 0.01, 0.2);
        stack.rotation.y = (Math.random() - 0.5) * 0.3;
        group.add(stack);
      }
      return group;
    }

    const treeA = makeTree(1.7);
    treeA.position.set(-9.5, 0, 6.3);
    scene.add(treeA);
    const treeB = makeTree(1.4);
    treeB.position.set(-16, 0, 5.8);
    scene.add(treeB);

    const plainBench = makeBench();
    plainBench.position.set(-8.5, 0, 3.4);
    scene.add(plainBench);

    const trashCanLeft = makeTrashCan();
    trashCanLeft.position.set(-6.7, 0, 7.0);
    scene.add(trashCanLeft);
    const trashCanRight = makeTrashCan();
    trashCanRight.position.set(6.3, 0, 7.0);
    scene.add(trashCanRight);

    // ================= BARREL FIRE — trashCanLeft only, reuses the steamPuff rising/fading sprite
    // technique in warm flame tones =================
    const flameMap = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,224,160,0.95)");
      g.addColorStop(0.4, "rgba(255,130,40,0.75)");
      g.addColorStop(1, "rgba(180,30,10,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const firePuffs: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; startY: number; offset: number }[] = [];
    const fireBaseX = -6.7,
      fireBaseZ = 7.0,
      fireBaseY = 0.42; // resting on the trash can's lid
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: flameMap,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending,
      });
      const puff = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), mat);
      puff.position.set(fireBaseX, fireBaseY, fireBaseZ);
      scene.add(puff);
      firePuffs.push({ mesh: puff, mat, startY: fireBaseY, offset: i * 0.32 });
    }
    const fireLight = new THREE.PointLight(0xff7a2a, 15, 4.5);
    fireLight.position.set(fireBaseX, 0.65, fireBaseZ);
    scene.add(fireLight);

    const newsstand = makeNewsstand();
    newsstand.position.set(-13.5, 0, 5.5);
    scene.add(newsstand);

    // ================= SEATED CHARACTER — capsule/rounded rig, drinking an energy drink =================
    const cHair = 0x2b1a12;
    const cSkin = 0xd9a878;
    const cShirt = 0x16161c;
    const cPants = 0x0d0d10;
    const cShoe = 0xc98b4a;

    const benchGroup = new THREE.Group();
    benchGroup.position.set(3.2, 0, 2.2);
    // seat raised to 0.434 (real bench height at this character scale). The shorter legs from the
    // 1:1:1:0.45 proportion rework no longer reach the ground from the old 0.32 seat — measured feet
    // were floating 0.347 above it — so seat height and the character's root below are set together.
    // seat top at 0.52: with the concept-sheet leg lengths the sitting hip lands there when the
    // shoes rest on the ground (thigh drop 0.054 + shin 0.248 + foot 0.222 in world units)
    const bench = addRoundedBlock(1.5, 0.32, 0.55, 0x2a2530, { roughness: 0.7 }, 0.04);
    bench.position.y = 0.36;
    benchGroup.add(bench);
    [-0.6, 0.6].forEach((x) => {
      const leg = addBlock(0.1, 0.36, 0.5, 0x1a1620, { roughness: 0.6 });
      leg.position.set(x, 0.18, 0);
      benchGroup.add(leg);
    });
    scene.add(benchGroup);

    const benchLight = new THREE.PointLight(cAmber, 20, 7);
    benchLight.position.set(3.2, 2.2, 2.2);
    scene.add(benchLight);
    // low warm fill, catches the face/limbs so the character reads as more than a silhouette
    const benchFillLight = new THREE.PointLight(0xfff0d8, 9, 3.5);
    benchFillLight.position.set(3.6, 0.9, 3.0);
    scene.add(benchFillLight);

    // ================= CHARACTER RIG — built to the two approved concept sheets =================
    // Both sheets share one proportion ratio, so both characters come off one rig and only their
    // segment widths, colours and hair/face details differ:
    //   crown->chin 1H, chin->hip 1H, hip->cuff 1H, cuff->ground 0.45H, total 3.45H
    // With local height held at 1.22 (x1.4 scene scale = 1.708 world): H = 1.22 / 3.45 = 0.3536
    //   ground 0 -> cuff 0.1591 -> hip 0.5127 -> chin 0.8663 -> crown 1.2199
    const FIG_H = 0.3536;
    const FIG_HIP_Y = 0.5127;

    type FigureDesign = {
      hair: number; skin: number; top: number; bottom: number;
      shoe: number; shoeBand: number; shoeBandAtTop: boolean;
      longHair: boolean; longSleeve: boolean; legWidth: number;
      brow: number; mouth: number; stubble: number | null;
    };
    const DESIGN_GUY: FigureDesign = {
      hair: 0x2b1a12, skin: 0xd9a878, top: 0x16161c, bottom: 0x0d0d10,
      shoe: 0xc98b4a, shoeBand: 0xf0ece0, shoeBandAtTop: false,
      longHair: false, longSleeve: false, legWidth: 0.145,
      brow: 0x1b1008, mouth: 0x7a3a3a, stubble: 0x6b4436,
    };
    const DESIGN_GIRL: FigureDesign = {
      hair: 0x3a2a1e, skin: 0xe0b48a, top: 0xb85a72, bottom: 0x18151c,
      shoe: 0xc9a875, shoeBand: 0xb85a72, shoeBandAtTop: true,
      longHair: true, longSleeve: true, legWidth: 0.185, // wide-leg, flares past the guy's straight cut
      brow: 0x241a12, mouth: 0x8a4450, stubble: null,
    };

    function makeFigure(d: FigureDesign) {
      const root = new THREE.Group();
      const hip = new THREE.Group();
      hip.position.y = FIG_HIP_Y;
      root.add(hip);

      function makeLeg() {
        const legPivot = new THREE.Group();
        const thigh = addRoundedBlock(d.legWidth, FIG_H / 2, d.legWidth * 1.08, d.bottom, { roughness: 0.65 }, 0.03);
        thigh.position.y = -FIG_H / 4;
        legPivot.add(thigh);
        const kneePivot = new THREE.Group();
        kneePivot.position.y = -FIG_H / 2;
        legPivot.add(kneePivot);
        // the girl's lower leg widens rather than tapers — the wide-leg flare from her sheet
        const shinW = d.legWidth * (d.longSleeve ? 1.06 : 0.95);
        const shin = addRoundedBlock(shinW, FIG_H / 2, shinW * 1.05, d.bottom, { roughness: 0.65 }, 0.03);
        shin.position.y = -FIG_H / 4;
        kneePivot.add(shin);
        // cuff -> ground is 0.45H = 0.1591, split into the shoe body and a contrast band
        const bandH = 0.042;
        const bodyH = 0.1591 - bandH;
        const bodyY = d.shoeBandAtTop ? -FIG_H / 2 - bandH - bodyH / 2 : -FIG_H / 2 - bodyH / 2;
        const bandY = d.shoeBandAtTop ? -FIG_H / 2 - bandH / 2 : -FIG_H / 2 - bodyH - bandH / 2;
        const shoeBody = addRoundedBlock(0.168, bodyH, 0.235, d.shoe, { roughness: 0.55 }, 0.035);
        shoeBody.position.set(0, bodyY, 0.035);
        kneePivot.add(shoeBody);
        const band = addRoundedBlock(0.172, bandH, 0.24, d.shoeBand, { roughness: 0.5 }, 0.016);
        band.position.set(0, bandY, 0.035);
        kneePivot.add(band);
        return { pivot: legPivot, knee: kneePivot };
      }
      const legL = makeLeg();
      legL.pivot.position.x = -0.085;
      hip.add(legL.pivot);
      const legR = makeLeg();
      legR.pivot.position.x = 0.085;
      hip.add(legR.pivot);

      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = FIG_HIP_Y;
      root.add(torsoGroup);
      const torso = addRoundedBlock(0.36, 0.3, 0.22, d.top, { roughness: 0.7 }, 0.05);
      torso.position.y = 0.155;
      torsoGroup.add(torso);
      const neck = addRoundedBlock(0.1, 0.07, 0.1, d.skin, { roughness: 0.6 }, 0.02);
      neck.position.y = 0.325;
      torsoGroup.add(neck);

      function makeArm() {
        const shoulderPivot = new THREE.Group();
        const cap = addRoundedBlock(0.115, 0.13, 0.19, d.top, { roughness: 0.7 }, 0.05);
        cap.position.y = -0.045;
        shoulderPivot.add(cap);
        const sleeve = addRoundedBlock(0.1, 0.12, 0.155, d.top, { roughness: 0.7 }, 0.035);
        sleeve.position.y = -0.135;
        shoulderPivot.add(sleeve);
        const elbowPivot = new THREE.Group();
        elbowPivot.position.y = -0.2;
        shoulderPivot.add(elbowPivot);
        // long sleeve carries the top colour to the wrist; short sleeve shows bare forearm
        const forearm = addRoundedBlock(0.09, 0.165, 0.1, d.longSleeve ? d.top : d.skin, { roughness: 0.6 }, 0.035);
        forearm.position.y = -0.0825;
        elbowPivot.add(forearm);
        const hand = addRoundedBlock(0.088, 0.085, 0.1, d.skin, { roughness: 0.6 }, 0.032);
        hand.position.y = -0.19;
        elbowPivot.add(hand);
        // separated thumb so the hand reads as a hand rather than a blob
        const thumb = addRoundedBlock(0.03, 0.052, 0.038, d.skin, { roughness: 0.6 }, 0.014);
        thumb.position.set(0.052, -0.176, 0.036);
        thumb.rotation.z = 0.42;
        elbowPivot.add(thumb);
        return { pivot: shoulderPivot, elbow: elbowPivot };
      }
      const armL = makeArm();
      armL.pivot.position.set(-0.205, 0.3, 0);
      torsoGroup.add(armL.pivot);
      const armR = makeArm();
      armR.pivot.position.set(0.205, 0.3, 0);
      torsoGroup.add(armR.pivot);

      // ---- head: origin at the chin, so the hair mass spans exactly 0 -> H (crown)
      const headGroup = new THREE.Group();
      headGroup.position.y = FIG_H;
      torsoGroup.add(headGroup);

      // CHIN IS y = 0. The face block's underside sits exactly on the head group's origin and the
      // hair crown tops out at exactly FIG_H, so crown->chin is 1H by construction. Long hair may
      // hang BELOW the chin (the girl's fall reaches her shoulders), which is why the chin must be
      // read off the face block rather than the head group's bounding box.
      const FACE_H = 0.245;
      const face = addRoundedBlock(0.34, FACE_H, 0.41, d.skin, { roughness: 0.65 }, 0.045);
      face.position.set(0, FACE_H / 2, 0.012);
      headGroup.add(face);

      // hair built from overlapping blocks rather than one dome, per both sheets
      const topH = FIG_H * 0.52;
      const hairTop = addRoundedBlock(0.44, topH, 0.4, d.hair, { roughness: 0.8 }, 0.05);
      hairTop.position.y = FIG_H - topH / 2; // crown lands on FIG_H
      headGroup.add(hairTop);
      [-1, 1].forEach((m) => {
        // guy: short sideburn beside the cheek. girl: full fall past the jaw to the shoulder.
        const sTop = FIG_H * 0.82;
        const sBot = d.longHair ? -FIG_H * 0.95 : FIG_H * 0.16;
        const sideH = sTop - sBot;
        const side = addRoundedBlock(0.075, sideH, 0.38, d.hair, { roughness: 0.8 }, 0.035);
        side.position.set(m * 0.19, sBot + sideH / 2, -0.01);
        headGroup.add(side);
      });
      const bTop = FIG_H * 0.95;
      const bBot = d.longHair ? -FIG_H * 1.1 : FIG_H * 0.28;
      const backH = bTop - bBot;
      const back = addRoundedBlock(0.42, backH, 0.14, d.hair, { roughness: 0.8 }, 0.045);
      back.position.set(0, bBot + backH / 2, -0.15);
      headGroup.add(back);
      if (d.longHair) {
        // centre-parted fringe
        [-1, 1].forEach((m) => {
          const fr = addRoundedBlock(0.15, 0.075, 0.09, d.hair, { roughness: 0.8 }, 0.03);
          fr.position.set(m * 0.1, FIG_H * 0.7, 0.185);
          headGroup.add(fr);
        });
      } else {
        // side-swept: main fringe off-centre with a shorter sweep opposite, giving the guy's
        // silhouette its asymmetry
        const fringe = addRoundedBlock(0.3, 0.07, 0.09, d.hair, { roughness: 0.8 }, 0.028);
        fringe.position.set(-0.045, FIG_H * 0.71, 0.185);
        headGroup.add(fringe);
        const sweep = addRoundedBlock(0.11, 0.055, 0.085, d.hair, { roughness: 0.8 }, 0.025);
        sweep.position.set(0.135, FIG_H * 0.76, 0.18);
        headGroup.add(sweep);
      }

      // ---- face details, all placed relative to the chin at y = 0
      const FACE_Z = 0.218;
      const eyeMatF = new THREE.MeshStandardMaterial({ color: 0x1b1218, roughness: 0.35 });
      const pupilMat = new THREE.MeshStandardMaterial({ color: 0xf2ede6, roughness: 0.3 });
      const browMat = new THREE.MeshStandardMaterial({ color: d.brow, roughness: 0.7 });
      [-1, 1].forEach((m) => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.02), eyeMatF);
        eye.position.set(m * 0.079, 0.152, FACE_Z - 0.006);
        headGroup.add(eye);
        const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.012), pupilMat);
        pupil.position.set(m * 0.086, 0.163, FACE_Z + 0.003);
        headGroup.add(pupil);
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.016, 0.018), browMat);
        brow.position.set(m * 0.079, 0.2, FACE_Z - 0.008);
        brow.rotation.z = m * 0.06;
        headGroup.add(brow);
      });
      const nose = addRoundedBlock(0.028, 0.032, 0.03, d.skin, { roughness: 0.6 }, 0.008);
      nose.position.set(0, 0.113, FACE_Z + 0.004);
      headGroup.add(nose);
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.062, 0.017, 0.018),
        new THREE.MeshStandardMaterial({ color: d.mouth, roughness: 0.6 })
      );
      mouth.position.set(0, 0.056, FACE_Z - 0.004);
      headGroup.add(mouth);
      if (d.stubble !== null) {
        const jaw = addRoundedBlock(0.26, 0.045, 0.36, d.stubble, { roughness: 0.9 }, 0.02);
        jaw.position.set(0, 0.026, 0.012);
        headGroup.add(jaw);
      }

      return { root, hip, torsoGroup, headGroup, face, legL, legR, armL, armR };
    }

    // named builders so each character can be placed and reused independently
    const makeGuyCharacter = () => makeFigure(DESIGN_GUY);
    const makeGirlCharacter = () => makeFigure(DESIGN_GIRL);

    // the bench NPC is the guy
    const seated = makeGuyCharacter();
    const character = seated.root;
    character.scale.setScalar(1.4);
    character.position.set(3.2, -0.1935, 2.2); // root set so the shoes land on y=0, hips meet the seat
    character.rotation.y = -0.5;
    scene.add(character);

    // sit pose driven on the shared rig's own joints — thighs forward, shins back down
    const hip = seated.hip;
    const torsoGroup = seated.torsoGroup;
    [seated.legL, seated.legR].forEach((leg) => {
      leg.pivot.rotation.x = -1.35;
      leg.knee.rotation.x = 1.35;
    });

    // left arm rests on the knee; it is also what the greeting wave animates
    const restArm = seated.armL.pivot;
    restArm.rotation.x = -0.9;

    // drinking arm — raises the can to the mouth on a slow repeating cycle
    const drinkShoulder = seated.armR.pivot;
    const drinkElbow = seated.armR.elbow;

    // energy-drink can, held in the drinking hand — the prop itself keeps its real-world size,
    // only its attachment offset moves to match the shorter forearm/hand
    const drinkCan = new THREE.Group();
    const canBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.13, 16),
      new THREE.MeshStandardMaterial({ color: 0x2fd0c8, metalness: 0.6, roughness: 0.3 })
    );
    drinkCan.add(canBody);
    const canRimTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.045, 0.015, 16),
      new THREE.MeshStandardMaterial({ color: 0xc7d6d6, metalness: 0.8, roughness: 0.25 })
    );
    canRimTop.position.y = 0.0725;
    drinkCan.add(canRimTop);
    const canLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.004),
      new THREE.MeshStandardMaterial({ color: 0xe0aa70, emissive: 0xe0aa70, emissiveIntensity: 0.4, roughness: 0.5 })
    );
    canLabel.position.set(0, 0, 0.046);
    drinkCan.add(canLabel);
    drinkCan.rotation.x = Math.PI / 2;
    drinkCan.position.set(0, -0.2, 0.05);
    drinkElbow.add(drinkCan);

    const headGroup = seated.headGroup;

    // ================= WALKING CHARACTER — same jointed rig as the interior Scene's character, ported
    // directly (capsule limbs, rounded torso/head, same palette constants) so it reads as the same person.
    // Starts on the sidewalk, clear of the bench NPC, kiosk, poster case, and the cat/pedestrian lanes.
    // The ONLY way to enter is walking this character up to the door — see the animate loop below. =================
    // proportions match the interior Scene's character (same 1H:1H:1H:0.45H rework) so the two stay
    // visually the same person, just resized
    // built from the same shared rig as the seated NPC, so the two are guaranteed identical
    // the walkable main character is the girl
    const walkerFig = makeGirlCharacter();
    const walker = walkerFig.root;
    const walkerLegL = walkerFig.legL;
    const walkerLegR = walkerFig.legR;
    const walkerArmL = walkerFig.armL;
    const walkerArmR = walkerFig.armR;

    walker.scale.setScalar(1.4); // matches the seated NPC's on-screen size in this scene
    walker.position.set(-2, 0, 5);
    scene.add(walker);

    let charTarget = walker.position.clone();
    let charMoving = false;
    let walkPhase = 0;
    let hasEntered = false;

    // ---- static obstacle bounds for the walker (axis-aligned x/z rects, derived from the same
    // positions/sizes the geometry above is built from). The facade is split into a left and right
    // span so the doorway gap at x ±2.2 stays walkable — otherwise the walker could never reach
    // DOOR_ROW_CENTER and the auto-enter would be unreachable.
    const WALKER_RADIUS = 0.28;
    const obstacles: { x0: number; x1: number; z0: number; z1: number }[] = [
      { x0: -7.5, x1: -2.2, z0: -6.55, z1: -3.05 }, // facade, left of the doorway
      { x0: 2.2, x1: 7.5, z0: -6.55, z1: -3.05 }, // facade, right of the doorway
      { x0: -5.35, x1: -3.85, z0: -2.4, z1: -1.4 }, // ticket kiosk
      { x0: 3.95, x1: 6.65, z0: -2.05, z1: -1.75 }, // poster case (enlarged)
      { x0: 2.45, x1: 3.95, z0: 1.92, z1: 2.48 }, // bench (seated NPC)
      { x0: -9.25, x1: -7.75, z0: 3.12, z1: 3.68 }, // plain bench
      { x0: -6.9, x1: -6.5, z0: 6.8, z1: 7.2 }, // trash can left (barrel fire)
      { x0: 6.1, x1: 6.5, z0: 6.8, z1: 7.2 }, // trash can right
      { x0: -10.0, x1: -9.0, z0: 5.8, z1: 6.8 }, // tree A
      { x0: -16.5, x1: -15.5, z0: 5.3, z1: 6.3 }, // tree B
      { x0: -13.95, x1: -13.05, z0: 5.2, z1: 5.8 }, // newsstand
      { x0: 2.2, x1: 2.8, z0: -0.9, z1: -0.3 }, // sidewalk A-frame sign
      ...[-13, -6.5, 6.5, 13].map((x) => ({ x0: x - 0.16, x1: x + 0.16, z0: 7.44, z1: 7.76 })), // lamp poles
    ];
    function blocked(x: number, z: number) {
      return obstacles.some(
        (o) =>
          x > o.x0 - WALKER_RADIUS && x < o.x1 + WALKER_RADIUS && z > o.z0 - WALKER_RADIUS && z < o.z1 + WALKER_RADIUS
      );
    }

    // invisible ground-raycast plane for click-to-walk — mirrors the interior Scene's groundPlane
    // pattern, kept separate from the visible sidewalk/road/curb meshes so raycasting isn't affected
    // by their slightly different heights
    const walkGroundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SPAN, 14),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    walkGroundPlane.rotation.x = -Math.PI / 2;
    walkGroundPlane.position.set(0, 0.02, 1);
    scene.add(walkGroundPlane);

    // billboarded canvas-text labels — always face the camera, updated in the animate loop
    function makeBillboardLabel(text: string, w: number, h: number, fontPx: number) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = Math.round(512 * (h / w));
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "rgba(5,5,10,0.6)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#e8ddcf";
      ctx.font = `600 ${fontPx}px 'IBM Plex Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text.toUpperCase(), c.width / 2, c.height / 2);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false });
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    }
    // small, unobtrusive instruction label above the walking character's head, always visible
    const walkerLabel = makeBillboardLabel("Click ground to walk here", 2.4, 0.42, 30);
    scene.add(walkerLabel);
    // "Hi!" greeting bubble above the bench NPC's head — hidden until the greeting triggers
    const hiBubble = makeBillboardLabel("Hi!", 0.75, 0.42, 64);
    hiBubble.visible = false;
    scene.add(hiBubble);

    // greeting state — triggers once per approach when the walker nears the bench NPC, resets once
    // the walker moves back out past a slightly larger radius (hysteresis, avoids retrigger flicker)
    let hasGreeted = false;
    let waveActive = false;
    let waveStart = 0;
    let bubbleActive = false;
    let bubbleStart = 0;

    // ================= CONTROLS — drag to orbit, scroll to zoom (same model as the interior scene) =================
    let isDragging = false;
    let lastX = 0,
      lastY = 0;
    let dragDistance = 0;
    let rotX = -0.08,
      rotY = 0;
    // framed tighter on the building by default (was 17); range narrowed from 9–38 so the camera
    // can't pull back far enough to see past the city bands into empty void
    // ---- CAMERA MODEL ----
    // The site opens on a wide establishing shot of the whole street. From there the ONLY thing the
    // visitor can do is zoom in toward the cinema; dragging and walking stay locked until they have
    // zoomed past DRAG_UNLOCK_ZOOM, at which point the camera also begins tracking the character.
    // ZOOM_WIDE is both the default and the outer limit — the view can never pull back further.
    const ZOOM_WIDE = 58;
    const ZOOM_CLOSE = 11; // facade, marquee and doors fill the frame
    const DRAG_UNLOCK_ZOOM = 34; // below this the visitor is "at" the cinema and gains full control
    let zoomTarget = ZOOM_WIDE;
    let zoomCurrent = zoomTarget;
    const ROT_Y_LIMIT = 0.5;
    const ROT_X_MIN = -0.45,
      ROT_X_MAX = 0.06;
    const ZOOM_MIN = ZOOM_CLOSE,
      ZOOM_MAX = ZOOM_WIDE;
    const PIVOT_HOME = new THREE.Vector3(0, 2, 6);
    // true once zoomed in far enough to interact; drag + click-to-walk are gated on this
    let interactive = false;

    function startDrag(x: number, y: number) {
      if (!interactive) return; // wide establishing shot is cinematic — zoom first
      isDragging = true;
      lastX = x;
      lastY = y;
      dragDistance = 0;
    }
    function moveDrag(x: number, y: number) {
      if (!isDragging || !interactive) return;
      const dx = x - lastX,
        dy = y - lastY;
      lastX = x;
      lastY = y;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      rotY -= dx * 0.005;
      rotY = Math.max(-ROT_Y_LIMIT, Math.min(ROT_Y_LIMIT, rotY));
      rotX += dy * 0.004;
      rotX = Math.max(ROT_X_MIN, Math.min(ROT_X_MAX, rotX));
    }
    function endDrag() {
      isDragging = false;
    }

    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTarget += e.deltaY * 0.015;
      zoomTarget = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomTarget));
    };
    let pinchStartDist = 0;
    let pinchStartZoom = zoomTarget;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.sqrt(dx * dx + dy * dy);
        pinchStartZoom = zoomTarget;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        pinchStartDist ||= dist;
        zoomTarget = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom * (pinchStartDist / dist)));
      }
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      endDrag();
      if (e.changedTouches.length === 1 && dragDistance < 8) {
        handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", endDrag);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    // ================= RAYCAST — click ground to walk the character there (same pattern as the
    // interior Scene); entering is no longer a direct click, it's the walker reaching the door =================
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      moveDrag(e.clientX, e.clientY);
    };
    function handleTap(clientX: number, clientY: number) {
      mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      // The entrance takes you straight in, and is live at ANY zoom — this is the primary way into
      // the site, so it is checked before the interactive gate and before the ground.
      if (raycaster.intersectObject(doorHitZone, true).length) {
        if (!hasEntered) {
          hasEntered = true;
          onEnter();
        }
        return;
      }
      if (!interactive) return; // walking is still gated to the zoomed-in view
      const groundHit = raycaster.intersectObject(walkGroundPlane);
      if (groundHit.length) {
        charTarget = groundHit[0].point.clone();
        charMoving = true;
      }
    }
    const onClick = (e: MouseEvent) => {
      if (dragDistance > 6) return;
      handleTap(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);

    // ================= AUDIO — real cricket trill + sparse car pass-by =================
    let audioCtx: AudioContext | null = null;
    let audioStopped = false;
    const cricketTimers: ReturnType<typeof setTimeout>[] = [];
    let carTimer: ReturnType<typeof setTimeout> | null = null;

    function playCricketTrill(baseFreq: number) {
      if (!audioCtx || audioStopped) return;
      const pulseCount = 16 + Math.floor(Math.random() * 10);
      for (let i = 0; i < pulseCount; i++) {
        const t0 = audioCtx.currentTime + i * 0.045;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq + (Math.random() - 0.5) * 120, t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.05, t0 + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.018);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.02);
      }
    }
    function scheduleCricketVoice(baseFreq: number, minGap: number, maxGap: number) {
      const delay = minGap + Math.random() * (maxGap - minGap);
      const timer = setTimeout(() => {
        playCricketTrill(baseFreq);
        scheduleCricketVoice(baseFreq, minGap, maxGap);
      }, delay);
      cricketTimers.push(timer);
    }

    function playCarPassSound(durationMs: number, panFrom: number, panTo: number) {
      if (!audioCtx || audioStopped) return;
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 300;

      const gain = audioCtx.createGain();
      gain.gain.value = 0;

      const panner = audioCtx.createStereoPanner
        ? audioCtx.createStereoPanner()
        : null;

      noise.connect(filter);
      filter.connect(gain);
      if (panner) {
        gain.connect(panner);
        panner.connect(audioCtx.destination);
      } else {
        gain.connect(audioCtx.destination);
      }

      const now = audioCtx.currentTime;
      const dur = durationMs / 1000;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + dur * 0.3);
      gain.gain.linearRampToValueAtTime(0, now + dur);
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.linearRampToValueAtTime(420, now + dur * 0.35);
      filter.frequency.linearRampToValueAtTime(180, now + dur);
      if (panner) {
        panner.pan.setValueAtTime(panFrom, now);
        panner.pan.linearRampToValueAtTime(panTo, now + dur);
      }

      noise.start(now);
      noise.stop(now + dur);
    }

    function startAmbientAudio() {
      if (audioCtx) return;
      try {
        const AudioCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return;
        audioCtx = new AudioCtor();
        scheduleCricketVoice(4300, 1500, 4000);
        scheduleCricketVoice(4850, 2200, 5200);
      } catch {
        // audio unsupported — non-essential, skip silently
      }
    }
    const onFirstGesture = () => {
      if (audioCtx?.state === "suspended") audioCtx.resume();
      if (!audioCtx) startAmbientAudio();
      window.removeEventListener("pointerdown", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture);
    startAmbientAudio();

    // ================= SPARSE TRAFFIC — one car passes every so often, not constant =================
    const carColors = [0x2a3550, 0x5a2530, 0x2f4a3a, 0x6b5a2a, 0x3a3a4a, 0x8a3a2a];
    function makeCar(color: number) {
      const group = new THREE.Group();
      const body = addRoundedBlock(1.5, 0.45, 0.7, color, { roughness: 0.4, metalness: 0.4 }, 0.08);
      body.position.y = 0.32;
      group.add(body);
      const cabin = addRoundedBlock(0.8, 0.35, 0.62, color, { roughness: 0.4, metalness: 0.4 }, 0.07);
      cabin.position.set(-0.1, 0.62, 0);
      group.add(cabin);
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x10141c, roughness: 0.25, metalness: 0.3 });
      [-1, 1].forEach((side) => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.24), windowMat);
        win.position.set(-0.1, 0.63, side * 0.315);
        win.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(win);
      });
      // wheels: cylinder axis rotated to point along Z (car's width) so the tire face reads correctly from the side
      const wheelGroups: THREE.Group[] = [];
      [-0.5, 0.5].forEach((zx) => {
        [-0.36, 0.36].forEach((zz) => {
          const wheelGroup = new THREE.Group();
          const tire = addSolid(new THREE.CylinderGeometry(0.17, 0.17, 0.13, 20), 0x0a0a0a, { roughness: 0.7 });
          tire.rotation.x = Math.PI / 2;
          wheelGroup.add(tire);
          const hub = addSolid(new THREE.CylinderGeometry(0.07, 0.07, 0.145, 12), 0x6a6a72, { roughness: 0.4, metalness: 0.7 });
          hub.rotation.x = Math.PI / 2;
          wheelGroup.add(hub);
          wheelGroup.position.set(zx, 0.17, zz * 0.62);
          group.add(wheelGroup);
          wheelGroups.push(wheelGroup);
        });
      });
      const headlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xfff2cc, emissive: 0xfff2cc, emissiveIntensity: 1.8 })
      );
      headlight.position.set(0.76, 0.3, 0);
      group.add(headlight);
      const taillight = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xc93030, emissive: 0xc93030, emissiveIntensity: 1.4 })
      );
      taillight.position.set(-0.76, 0.3, 0);
      group.add(taillight);
      const beam = new THREE.PointLight(0xfff2cc, 6, 4);
      beam.position.set(0.9, 0.3, 0);
      group.add(beam);
      return { group, wheelGroups };
    }

    // shared eased-motion curve, reused for car passes and the idle-sway crossfade below
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    type ActiveCar = {
      mesh: THREE.Group;
      wheelGroups: THREE.Group[];
      dir: 1 | -1;
      speed: number;
      startX: number;
      endX: number;
      startTime: number;
      durationMs: number;
    };
    const activeCars: ActiveCar[] = [];
    // cars spawn/despawn within this smaller window (not the full 200-unit ground span) so they're
    // actually in view for most of their trip instead of spending most of it off-screen
    const TRAFFIC_HALF_RANGE = 42;
    const WHEEL_RADIUS = 0.17;

    function playHonk() {
      if (!audioCtx || audioStopped) return;
      const t0 = audioCtx.currentTime;
      [520, 660].forEach((freq, i) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.035, t0 + 0.02);
        gain.gain.setValueAtTime(0.035, t0 + 0.18 - i * 0.02);
        gain.gain.linearRampToValueAtTime(0, t0 + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(t0);
        osc.stop(t0 + 0.24);
      });
    }

    function spawnCar() {
      if (activeCars.length >= 6) return; // the establishing shot sees the whole street, so it needs
      // several cars in flight at once or the road reads dead
      const color = carColors[Math.floor(Math.random() * carColors.length)];
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      const laneZ = 11 + Math.random() * 4;
      const speed = 4.5 + Math.random() * 2;
      const { group: mesh, wheelGroups } = makeCar(color);
      mesh.rotation.y = dir === 1 ? 0 : Math.PI;
      const startX = dir === 1 ? -TRAFFIC_HALF_RANGE : TRAFFIC_HALF_RANGE;
      const endX = dir === 1 ? TRAFFIC_HALF_RANGE : -TRAFFIC_HALF_RANGE;
      mesh.position.set(startX, 0, laneZ);
      scene.add(mesh);
      const durationMs = ((TRAFFIC_HALF_RANGE * 2) / speed) * 1000;
      activeCars.push({ mesh, wheelGroups, dir, speed, startX, endX, startTime: performance.now(), durationMs });
      playCarPassSound(durationMs, dir === 1 ? -1 : 1, dir === 1 ? 1 : -1);
      if (Math.random() < 0.15) setTimeout(playHonk, 400 + Math.random() * 800);
    }
    function scheduleNextCar() {
      const delay = 900 + Math.random() * 1600; // steady flow rather than an occasional single car
      carTimer = setTimeout(() => {
        spawnCar();
        scheduleNextCar();
      }, delay);
    }
    // seed a few immediately at random points along the road so the street is already busy on arrival
    // instead of empty for the first several seconds
    for (let i = 0; i < 4; i++) spawnCar();
    activeCars.forEach((c, i) => {
      c.startTime = performance.now() - c.durationMs * (0.12 + i * 0.2);
    });
    scheduleNextCar();

    // ================= STRAY CATS — seldom, wander the sidewalk, meow when they pass =================
    function makeCat(color: number) {
      const group = new THREE.Group();
      const body = addCapsule(0.09, 0.32, color, { roughness: 0.85 });
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.16;
      group.add(body);
      const head = addSphere(0.09, color, { roughness: 0.85 });
      head.position.set(0.17, 0.22, 0);
      group.add(head);
      [-1, 1].forEach((m) => {
        const ear = addSolid(new THREE.ConeGeometry(0.035, 0.06, 4), color, { roughness: 0.85 });
        ear.position.set(0.2, 0.29, m * 0.045);
        ear.rotation.x = m * 0.3;
        group.add(ear);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), new THREE.MeshStandardMaterial({ color: 0x141414 }));
        eye.position.set(0.245, 0.225, m * 0.045);
        group.add(eye);
      });
      const tailPivot = new THREE.Group();
      tailPivot.position.set(-0.16, 0.16, 0);
      group.add(tailPivot);
      const tail = addCapsule(0.024, 0.26, color, { roughness: 0.85 });
      tail.rotation.z = -0.85;
      tail.position.set(-0.03, 0.09, 0);
      tailPivot.add(tail);
      const legPositions: [number, number][] = [
        [-0.1, -0.06],
        [-0.1, 0.06],
        [0.1, -0.06],
        [0.1, 0.06],
      ];
      const legs = legPositions.map(([x, z]) => {
        const leg = addCapsule(0.024, 0.15, color, { roughness: 0.85 });
        leg.position.set(x, 0.075, z);
        group.add(leg);
        return leg;
      });
      return { group, legs, head, tail: tailPivot };
    }
    // meow — two detuned sawtooth voices through a formant-ish bandpass, with an LFO vibrato on the
    // sustain. A single pure sine just reads as a whistle; the beating between the detuned pair plus
    // the wobble is what makes it land as a voice.
    function playMeow() {
      if (!audioCtx || audioStopped) return;
      const ctx = audioCtx;
      const t0 = ctx.currentTime;
      // higher and lighter than before — a small female cat, not a tomcat
      const dur = 0.62 + Math.random() * 0.3;
      const base = 880 + Math.random() * 160;
      const peak = base * (1.3 + Math.random() * 0.12);
      const tail = base * 0.58;

      const out = ctx.createGain();
      // soft swell rather than a click-on: a hard attack is most of what reads as "electronic"
      out.gain.setValueAtTime(0, t0);
      out.gain.linearRampToValueAtTime(0.048, t0 + 0.11);
      out.gain.setValueAtTime(0.044, t0 + dur * 0.55);
      out.gain.linearRampToValueAtTime(0, t0 + dur);

      // bandpass sweep imitates the mouth opening on "me-" then closing on "-ow"
      const formant = ctx.createBiquadFilter();
      formant.type = "bandpass";
      formant.Q.value = 4.5;
      formant.frequency.setValueAtTime(base * 1.6, t0);
      formant.frequency.linearRampToValueAtTime(peak * 2.1, t0 + dur * 0.3);
      formant.frequency.linearRampToValueAtTime(tail * 1.4, t0 + dur);
      formant.connect(out);
      out.connect(ctx.destination);

      // vibrato shared by both voices, only meaningful once the note is sustaining
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(6.5 + Math.random() * 2.5, t0);
      lfoGain.gain.setValueAtTime(0, t0);
      lfoGain.gain.linearRampToValueAtTime(base * 0.055, t0 + dur * 0.4); // deeper warble = more voice-like
      lfoGain.gain.linearRampToValueAtTime(0, t0 + dur);
      lfo.connect(lfoGain);
      lfo.start(t0);
      lfo.stop(t0 + dur);

      [0, 1].forEach((i) => {
        const osc = ctx.createOscillator();
        // triangle + sine: a sawtooth's harsh upper harmonics are what made this read as robotic
        osc.type = i === 0 ? "triangle" : "sine";
        const det = i === 0 ? 1 : 1.007; // slight detune → roughness/beating instead of a pure tone
        osc.frequency.setValueAtTime(base * 0.8 * det, t0);
        osc.frequency.exponentialRampToValueAtTime(peak * det, t0 + dur * 0.18);
        osc.frequency.exponentialRampToValueAtTime(base * det, t0 + dur * 0.5);
        osc.frequency.exponentialRampToValueAtTime(tail * det, t0 + dur);
        lfoGain.connect(osc.frequency);
        const vg = ctx.createGain();
        vg.gain.value = i === 0 ? 0.6 : 0.4;
        osc.connect(vg);
        vg.connect(formant);
        osc.start(t0);
        osc.stop(t0 + dur);
      });
    }
    // two fixed black cats near the entrance — not wandering, each meows on its own 5s interval.
    // Positioned clear of the walking character's spawn (-2,0,5) and the doorway itself.
    const catMeowTimers: ReturnType<typeof setInterval>[] = [];
    // Two cats that wander gently but are hard-bounded to this rect, so they can never stroll out of
    // frame. They pick a nearby target, amble to it, pause, then pick another.
    const CAT_BOUNDS = { x0: -3.0, x1: 3.0, z0: -1.7, z1: 0.9 };
    type WanderCat = {
      group: THREE.Group; legs: THREE.Object3D[]; head: THREE.Object3D; tail: THREE.Object3D;
      target: THREE.Vector2; speed: number; pause: number; phase: number;
      idle: "sit" | "lick" | "look"; idleTime: number;
    };
    const wanderCats: WanderCat[] = [];
    function pickCatTarget(from: THREE.Vector2) {
      // short hops near the current spot rather than dashes across the whole rect
      const nx = THREE.MathUtils.clamp(from.x + (Math.random() - 0.5) * 2.0, CAT_BOUNDS.x0, CAT_BOUNDS.x1);
      const nz = THREE.MathUtils.clamp(from.y + (Math.random() - 0.5) * 1.2, CAT_BOUNDS.z0, CAT_BOUNDS.z1);
      return new THREE.Vector2(nx, nz);
    }
    ([
      [-1.5, -1.15],
      [1.5, -1.15],
    ] as [number, number][]).forEach(([x, z], i) => {
      const { group, legs, head, tail } = makeCat(0x2b2320);
      group.rotation.y = i === 0 ? 0.5 : -0.5;
      group.position.set(x, 0, z);
      scene.add(group);
      wanderCats.push({
        group, legs, head, tail, target: pickCatTarget(new THREE.Vector2(x, z)),
        speed: 0.32 + Math.random() * 0.14, pause: 2 + Math.random() * 3, phase: Math.random() * 10,
        idle: "sit", idleTime: 0,
      });
    });
    // ONE voice for the pair — previously each cat ran its own 5s interval, so they overlapped and
    // doubled up. A single timer means a single meow at a time.
    catMeowTimers.push(setInterval(playMeow, 7000));
    setTimeout(playMeow, 1200);

    // NOTE: the ambient "pedestrian" silhouette that used to live here has been removed. It was a
    // third humanoid rig, entirely separate from the seated NPC and the walker, built from its own
    // thin capsules (~7.8 heads tall) and so it never received the 1:1:1:0.45 proportion rework.
    // Combined with the clock-delta bug it froze in place after spawning, reading as an unexplained
    // standing figure with the wrong proportions. Only the seated NPC and the walker remain.

    // Guarded sizing. If the scene mounts while the window reports zero size — a background tab, or
    // a layout race on a slow load — the canvas was sized 0x0 and camera.aspect became NaN, and it
    // never recovered because no resize event ever fired. This clamps to a sane minimum, falls back
    // to the canvas's own client box, and is re-checked each frame so it self-heals.
    let lastW = -1,
      lastH = -1;
    const applySize = () => {
      const w = Math.max(1, window.innerWidth || canvas.clientWidth || 1);
      const h = Math.max(1, window.innerHeight || canvas.clientHeight || 1);
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    applySize();
    const onResize = applySize;
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let rafId: number;
    let readyFired = false;
    function animate() {
      rafId = requestAnimationFrame(animate);
      // getElapsedTime() internally calls getDelta(), so calling both (in that order) left `delta`
      // at ~0 every frame — pedestrians never travelled, never hit their despawn bounds, and since
      // the spawner caps at one active pedestrian none ever spawned again. Take the delta first,
      // then read the already-updated accumulator.
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      // direct, unswayed rig rotation — steady/predictable to navigate, matching the interior Scene's approach
      zoomCurrent = THREE.MathUtils.lerp(zoomCurrent, zoomTarget, 0.08);
      interactive = zoomCurrent < DRAG_UNLOCK_ZOOM;

      // 0 at the establishing shot, 1 fully zoomed in — drives both the rotation blend-in and how
      // strongly the pivot tracks the character
      const closeT = THREE.MathUtils.clamp(
        (DRAG_UNLOCK_ZOOM - zoomCurrent) / (DRAG_UNLOCK_ZOOM - ZOOM_CLOSE), 0, 1
      );
      // while wide, force the framing back to dead-centre so the establishing shot is always the
      // same composition no matter where the camera was left
      rig.rotation.y = rotY * closeT;
      rig.rotation.x = THREE.MathUtils.lerp(-0.02, rotX, closeT);
      if (!interactive) {
        rotY = THREE.MathUtils.lerp(rotY, 0, 0.06);
        rotX = THREE.MathUtils.lerp(rotX, -0.08, 0.06);
      }

      // pivot follows the character once zoomed in, easing back to the home pivot when pulling out
      const pivotTargetX = THREE.MathUtils.lerp(PIVOT_HOME.x, walker.position.x, closeT);
      const pivotTargetZ = THREE.MathUtils.lerp(PIVOT_HOME.z, walker.position.z + 3.2, closeT * 0.75);
      rig.position.x = THREE.MathUtils.lerp(rig.position.x, pivotTargetX, 0.05);
      rig.position.z = THREE.MathUtils.lerp(rig.position.z, pivotTargetZ, 0.05);
      camera.position.set(0, 2.6, zoomCurrent);

      for (let i = activeCars.length - 1; i >= 0; i--) {
        const car = activeCars[i];
        const t = Math.min((performance.now() - car.startTime) / car.durationMs, 1);
        const prevX = car.mesh.position.x;
        car.mesh.position.x = THREE.MathUtils.lerp(car.startX, car.endX, easeInOutCubic(t));
        // wheels roll about their axle (local Z) proportional to actual distance covered this frame —
        // always the same sign since a car's local "forward" is consistent regardless of world direction
        const rollDelta = Math.abs(car.mesh.position.x - prevX) / WHEEL_RADIUS;
        car.wheelGroups.forEach((w) => (w.rotation.z -= rollDelta));
        if (t >= 1) {
          scene.remove(car.mesh);
          activeCars.splice(i, 1);
        }
      }

      // cats amble toward their target, pause, then choose another — always inside CAT_BOUNDS
      wanderCats.forEach((c) => {
        const pos = new THREE.Vector2(c.group.position.x, c.group.position.z);
        const toTarget = c.target.clone().sub(pos);
        const dist = toTarget.length();
        if (dist < 0.06) {
          // ---- idle: sit, groom a paw, or glance around, then choose somewhere new
          c.pause -= delta;
          c.idleTime += delta;
          if (c.idle === "lick") {
            // front-left paw lifts to the muzzle and the head dips to meet it, with small
            // side-to-side licks — the head/paw meeting is what sells it as grooming
            const t = Math.min(c.idleTime / 0.45, 1);
            c.legs[2].position.y = 0.075 + t * 0.085;
            c.legs[2].position.x = 0.1 + t * 0.03;
            c.head.rotation.z = -t * 0.55;
            c.head.rotation.y = Math.sin(elapsed * 9) * 0.12 * t;
            c.tail.rotation.y = Math.sin(elapsed * 1.1 + c.phase) * 0.12;
          } else if (c.idle === "look") {
            c.head.rotation.y = Math.sin(elapsed * 0.9 + c.phase) * 0.55;
            c.head.rotation.z = 0;
            c.tail.rotation.y = Math.sin(elapsed * 1.6 + c.phase) * 0.35;
          } else {
            c.head.rotation.y = Math.sin(elapsed * 0.5 + c.phase) * 0.15;
            c.head.rotation.z = 0;
            c.tail.rotation.y = Math.sin(elapsed * 1.3 + c.phase) * 0.28; // resting tail flick
          }
          if (c.pause <= 0) {
            // reset anything the idle pose moved before walking off
            c.legs[2].position.y = 0.075;
            c.legs[2].position.x = 0.1;
            c.head.rotation.set(0, 0, 0);
            c.target = pickCatTarget(pos);
            c.pause = 2.5 + Math.random() * 4;
            c.idle = (["sit", "lick", "look", "lick"] as const)[Math.floor(Math.random() * 4)];
            c.idleTime = 0;
          }
        } else {
          // ---- walking: diagonal gait. Cats move front-left with back-right, so the two
          // diagonal pairs run in antiphase; body bobs at twice the stride rate.
          const step = Math.min(c.speed * delta, dist);
          toTarget.normalize().multiplyScalar(step);
          c.group.position.x = THREE.MathUtils.clamp(c.group.position.x + toTarget.x, CAT_BOUNDS.x0, CAT_BOUNDS.x1);
          c.group.position.z = THREE.MathUtils.clamp(c.group.position.z + toTarget.y, CAT_BOUNDS.z0, CAT_BOUNDS.z1);
          // makeCat builds the body facing +x, so heading is a quarter turn off atan2
          const heading = Math.atan2(toTarget.x, toTarget.y) - Math.PI / 2;
          let d = heading - c.group.rotation.y;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2; // shortest-arc turn, no spinning the long way
          c.group.rotation.y += d * Math.min(1, delta * 4);
          const gait = elapsed * 8 + c.phase;
          // legPositions order: [back-L, back-R, front-L, front-R]
          const diag = [0, 1, 1, 0];
          c.legs.forEach((leg, li) => {
            const s = Math.sin(gait + diag[li] * Math.PI);
            leg.position.y = 0.075 + Math.max(0, s) * 0.032; // lift on the swing, plant on the stance
            leg.position.z = (li % 2 === 0 ? -0.06 : 0.06) + s * 0.035;
          });
          c.group.position.y = Math.abs(Math.sin(gait)) * 0.014;
          c.head.rotation.set(0, Math.sin(gait * 0.5) * 0.06, 0);
          c.tail.rotation.y = Math.sin(gait * 0.5 + c.phase) * 0.4; // tail counter-swings to the gait
          c.tail.rotation.x = Math.sin(gait * 0.25) * 0.12;
        }
      });

      // trees sway gently, streetlamps get a rare quick flicker, steam puffs rise and fade off the roof vent
      treeA.rotation.z = Math.sin(elapsed * 0.6) * 0.025;
      treeB.rotation.z = Math.sin(elapsed * 0.5 + 1.4) * 0.02;
      streetlamps.forEach((lamp, i) => {
        const dip = Math.sin(elapsed * 1.7 + i * 12.3) > 0.965 ? 0.35 : 1;
        lamp.light.intensity = lamp.baseIntensity * dip;
        lamp.mat.emissiveIntensity = 1.6 * dip;
      });
      steamPuffs.forEach((p) => {
        const cycle = ((elapsed + p.offset) % 4) / 4;
        p.mesh.position.y = p.startY + cycle * 1.4;
        p.mesh.position.x = 2.6 + Math.sin(elapsed * 0.8 + p.offset) * 0.15;
        p.mat.opacity = Math.sin(cycle * Math.PI) * 0.35;
        const scale = 1 + cycle * 1.8;
        p.mesh.scale.set(scale, scale, 1);
      });
      firePuffs.forEach((p) => {
        const cycle = ((elapsed * 1.7 + p.offset) % 1.3) / 1.3;
        p.mesh.position.y = p.startY + cycle * 0.6;
        p.mesh.position.x = fireBaseX + Math.sin(elapsed * 6 + p.offset * 8) * 0.05;
        p.mesh.quaternion.copy(camera.quaternion); // billboard — flames stay readable from any orbit angle
        p.mat.opacity = Math.sin(cycle * Math.PI) * 0.6;
        const scale = 0.55 + cycle * 1.0;
        p.mesh.scale.set(scale, scale, 1);
      });
      fireLight.intensity = 15 + Math.sin(elapsed * 14) * 3 + Math.sin(elapsed * 29) * 2.5;

      // walker movement — same target-seek + limb-swing pattern as the interior Scene's character
      if (charMoving) {
        const dir = new THREE.Vector3().subVectors(charTarget, walker.position);
        dir.y = 0;
        const dist = dir.length();
        if (dist < 0.05) {
          charMoving = false;
        } else {
          const angle = Math.atan2(dir.x, dir.z);
          walker.rotation.y = THREE.MathUtils.lerp(walker.rotation.y, angle, 0.2);
          dir.normalize().multiplyScalar(Math.min(0.05, dist));
          // resolve each axis independently so a blocked direction slides along the obstacle edge
          // instead of stopping dead against it
          const nx = walker.position.x + dir.x;
          const nz = walker.position.z + dir.z;
          const canX = !blocked(nx, walker.position.z);
          const canZ = !blocked(walker.position.x, nz);
          if (canX) walker.position.x = nx;
          if (canZ) walker.position.z = nz;
          if (!canX && !canZ) charMoving = false;
          walkPhase += 0.18;
        }
      }
      const walkSwing = charMoving ? Math.sign(Math.sin(walkPhase * 4)) * 0.55 : 0;
      const walkLerpSpeed = 0.35;
      walkerLegL.pivot.rotation.x = THREE.MathUtils.lerp(walkerLegL.pivot.rotation.x, walkSwing, walkLerpSpeed);
      walkerLegR.pivot.rotation.x = THREE.MathUtils.lerp(walkerLegR.pivot.rotation.x, -walkSwing, walkLerpSpeed);
      walkerArmL.pivot.rotation.x = THREE.MathUtils.lerp(walkerArmL.pivot.rotation.x, -walkSwing, walkLerpSpeed);
      walkerArmR.pivot.rotation.x = THREE.MathUtils.lerp(walkerArmR.pivot.rotation.x, walkSwing, walkLerpSpeed);
      walkerLegL.knee.rotation.x = THREE.MathUtils.lerp(walkerLegL.knee.rotation.x, charMoving ? Math.max(0, walkSwing) * 0.6 : 0, walkLerpSpeed);
      walkerLegR.knee.rotation.x = THREE.MathUtils.lerp(walkerLegR.knee.rotation.x, charMoving ? Math.max(0, -walkSwing) * 0.6 : 0, walkLerpSpeed);

      // the prompt only makes sense once clicking actually does something
      walkerLabel.visible = interactive;
      walkerLabel.position.set(walker.position.x, walker.position.y + 1.9, walker.position.z);
      walkerLabel.quaternion.copy(camera.quaternion);

      // door proximity — replaces the old mouse-hover glow/buzz; entering is now driven by the
      // walker's distance to the doorway instead of a direct click on a hit zone
      const doorDist = Math.hypot(walker.position.x - DOOR_ROW_CENTER.x, walker.position.z - DOOR_ROW_CENTER.z);
      const nearDoor = doorDist < 2.5;
      if (!hasEntered && doorDist < 1.2) {
        hasEntered = true;
        onEnter();
      }
      enterGlow.intensity = THREE.MathUtils.lerp(enterGlow.intensity, nearDoor ? 7 : 4, 0.15);
      const signScale = nearDoor ? 1.06 : 1;
      enterSign.scale.lerp(new THREE.Vector3(signScale, signScale, 1), 0.15);
      // proximity now brightens the SIGN FACE rather than a floodlight, and the buzz is a shallow
      // dip rather than a hard blink — a lit sign box hums, it doesn't strobe
      const buzz = Math.sin(elapsed * 46) > 0.94 ? 0.82 : 1;
      enterMat.emissiveIntensity = (nearDoor ? 2.0 : 1.55) * buzz;
      neonMat.emissiveIntensity = (nearDoor ? 2.2 : 1.7) * buzz;

      // greeting — triggers once per approach when the walker nears the bench NPC
      const distToBench = walker.position.distanceTo(benchGroup.position);
      if (distToBench < 2.2 && !hasGreeted) {
        hasGreeted = true;
        waveActive = true;
        waveStart = elapsed;
        bubbleActive = true;
        bubbleStart = elapsed;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Hi!"));
          } catch {
            // speech synthesis unsupported/blocked — non-essential, skip silently
          }
        }
      }
      if (distToBench > 3.0) hasGreeted = false; // clear once they walk away, so it can retrigger later

      if (waveActive) {
        const wt = elapsed - waveStart;
        if (wt > 1.1) {
          waveActive = false;
          restArm.rotation.x = -0.9;
          restArm.rotation.z = 0;
        } else {
          const raise = Math.sin(Math.min(wt / 0.25, 1) * Math.PI * 0.5);
          restArm.rotation.x = THREE.MathUtils.lerp(-0.9, -2.4, raise);
          restArm.rotation.z = Math.sin(wt * 10) * 0.35 * raise;
        }
      }
      hiBubble.position.set(benchGroup.position.x, 2.55, benchGroup.position.z);
      hiBubble.quaternion.copy(camera.quaternion);
      if (bubbleActive) {
        const bt = elapsed - bubbleStart;
        hiBubble.visible = bt < 2.0;
        if (bt >= 2.0) bubbleActive = false;
      }

      // classic theater marquee chase — two overlapping pulses traveling opposite ways down the bulb strip
      marqueeBulbs.forEach((mat, i) => {
        const wave1 = Math.sin(elapsed * 4 - i * 0.9);
        const wave2 = Math.sin(elapsed * -2.3 - i * 1.6) * 0.4;
        mat.emissiveIntensity = 1.3 + (wave1 + wave2) * 0.9;
      });
      starMat.opacity = 0.88 + Math.sin(elapsed * 1.3) * 0.07 + Math.sin(elapsed * 2.7) * 0.05;

      // scattered dark city windows flicker to life on their own slow, staggered cycles
      flickerWindows.forEach(({ mat, phase }) => {
        const cycle = Math.sin(elapsed * 0.35 + phase);
        mat.emissiveIntensity = cycle > 0.5 ? 1.1 : 0;
      });

      // slower cadence than the old eating cycle — a sip every few seconds, not continuous
      const drinkCycle = Math.max(0, Math.sin(elapsed * 0.45));
      drinkShoulder.rotation.x = -0.3 - drinkCycle * 1.7;
      drinkElbow.rotation.x = drinkCycle * 1.3;
      headGroup.rotation.x = -drinkCycle * 0.22;

      applySize(); // cheap early-out; recovers if the canvas was created at zero size
      renderer.render(scene, camera);

      if (!readyFired) {
        readyFired = true;
        onReady?.();
      }
    }
    animate();


    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", endDrag);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onFirstGesture);
      audioStopped = true;
      cricketTimers.forEach(clearTimeout);
      if (carTimer) clearTimeout(carTimer);
      catMeowTimers.forEach(clearInterval);
      if (audioCtx) audioCtx.close();
      renderer.dispose();
    };
  }, [onEnter, onReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        cursor: "pointer",
      }}
    />
  );
}