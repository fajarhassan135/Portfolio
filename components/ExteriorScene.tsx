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
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.011);

    // orbit rig, same pattern as the interior Scene — camera sits at a local offset from a pivot
    // group, so drag/scroll can freely rotate + zoom instead of being locked to a fixed framing
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 150);
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
      canvasEl.width = 512 * RES;
      canvasEl.height = 256 * RES;
      const ctx = canvasEl.getContext("2d")!;
      if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      }
      ctx.fillStyle = color;
      ctx.font = font.replace(/(\d+)px/, (_m, px) => `${parseInt(px, 10) * RES}px`);
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
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 55),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skyCanvas), fog: false, depthWrite: false })
    );
    sky.position.set(0, 16, -50);
    scene.add(sky);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 120;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 110;
      starPos[i * 3 + 1] = 12 + Math.random() * 18;
      starPos[i * 3 + 2] = -40 - Math.random() * 15;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.5, fog: false });
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
    // near band flanks the cinema building (kept clear of the entrance, x in roughly [-8.5,8.5])
    addCityBand(-9, -60, -8.5, 16, 5, 12);
    addCityBand(-9, 8.5, 60, 16, 5, 12);
    // mid band, taller, a bit further back
    addCityBand(-16, -65, -9, 12, 6, 16);
    addCityBand(-16, 9, 65, 12, 6, 16);
    // far band, taller still
    addCityBand(-24, -70, -10, 10, 8, 19);
    addCityBand(-24, 10, 70, 10, 8, 19);
    // farthest band, tallest — fades into the fog for depth, widest horizon spread
    addCityBand(-34, -75, -12, 8, 10, 24);
    addCityBand(-34, 12, 75, 8, 10, 24);

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

    // upper-facade round accent windows — small warm-lit portholes between the parapet and the marquee
    [-4.2, -1.4, 1.4, 4.2].forEach((x) => {
      const porthole = addSolid(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 16), 0x1a0f0a, { roughness: 0.6 });
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

    // brand sign above the marquee — mirrors the reference's theater-name plaque
    const brandSign = makeTextPlane(["FAJAR HASSAN"], "#c9a35a", 8, 1.4, 1.3, "bold italic 60px Georgia, serif");
    brandSign.position.set(0, 6.1, -3.05);
    scene.add(brandSign);
    const brandLight = new THREE.PointLight(0xc9a35a, 10, 6);
    brandLight.position.set(0, 6.1, -2.2);
    scene.add(brandLight);

    // ================= MARQUEE — 3 lightbox panels: tagline / CINEMA / tagline =================
    const canopy = addBlock(11, 0.55, 2.6, 0x1a1014, { roughness: 0.55, metalness: 0.15 });
    canopy.position.set(0, 4.5, -2.9);
    scene.add(canopy);
    const canopyFace = addBlock(11.05, 1.5, 0.12, 0x120d10, { roughness: 0.4, metalness: 0.3 });
    canopyFace.position.set(0, 4.2, -1.65);
    scene.add(canopyFace);

    function makeMarqueePanel(lines: string[], w: number, h: number, font: string) {
      const panel = makeTextPlane(lines, "#151015", w, h, 0.55, font, "#f1ead8");
      // thin grid overlay, echoing the reference's letterboard grid
      const group = new THREE.Group();
      group.add(panel);
      const cols = Math.floor(w / 0.55);
      for (let i = 1; i < cols; i++) {
        const line = addBlock(0.012, h, 0.005, 0x3a3530, { roughness: 0.7 });
        line.position.set(-w / 2 + i * 0.55, 0, 0.01);
        group.add(line);
      }
      return group;
    }
    const tagLeft = makeMarqueePanel(["GOOD FILMS MAKE", "YOUR LIFE BETTER"], 3.1, 1.15, "bold 30px Arial, sans-serif");
    tagLeft.position.set(-3.85, 4.2, -1.58);
    scene.add(tagLeft);
    const cinemaPanel = makeMarqueePanel(["CINEMA"], 4.1, 1.3, "bold 64px Arial, sans-serif");
    cinemaPanel.position.set(0, 4.2, -1.58);
    scene.add(cinemaPanel);
    const tagRight = makeMarqueePanel(["SEE YOU AT", "THE MOVIES"], 3.1, 1.15, "bold 30px Arial, sans-serif");
    tagRight.position.set(3.85, 4.2, -1.58);
    scene.add(tagRight);

    // marquee bulb strip — tracked so the animate loop can run a classic chase pattern along it
    const marqueeBulbs: THREE.MeshStandardMaterial[] = [];
    function addMarqueeBulb(x: number, z: number) {
      const bulbMat = new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.8 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), bulbMat);
      bulb.position.set(x, 4.18, z);
      scene.add(bulb);
      marqueeBulbs.push(bulbMat);
    }
    // front edge, then both side "returns" so the chase wraps the whole canopy like a real marquee border
    for (let x = -5.2; x <= 5.2; x += 0.4) addMarqueeBulb(x, -1.05);
    for (let z = -1.4; z >= -2.75; z -= 0.35) {
      addMarqueeBulb(-5.2, z);
      addMarqueeBulb(5.2, z);
    }
    [-3.5, 0, 3.5].forEach((x) => {
      const canopyGlow = new THREE.PointLight(cAmber, 50, 13);
      canopyGlow.position.set(x, 4.2, -1.6);
      scene.add(canopyGlow);
    });

    // ================= TICKET BOOTH (left, matching reference) =================
    const kiosk = addBlock(1.5, 1.7, 1.0, 0x2e3a4a, { roughness: 0.5 });
    kiosk.position.set(-4.6, 0.85, -1.9);
    scene.add(kiosk);
    const kioskWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.3, metalness: 0.2 })
    );
    kioskWindow.position.set(-4.6, 1.05, -1.39);
    scene.add(kioskWindow);
    const ticketsSign = makeTextPlane(["TICKETS"], "#151015", 0.75, 0.3, 0.6, "bold 26px Arial, sans-serif", "#f1ead8");
    ticketsSign.position.set(-4.6, 1.55, -1.38);
    scene.add(ticketsSign);
    const kioskLight = new THREE.PointLight(cAmber, 7, 4);
    kioskLight.position.set(-4.6, 1.05, -1.0);
    scene.add(kioskLight);

    // ================= POSTER CASE (right) — 2x2 grid, matching reference =================
    const posterCase = addBlock(1.6, 2.0, 0.15, 0x2e3a4a, { roughness: 0.5 });
    posterCase.position.set(4.6, 1.8, -1.9);
    scene.add(posterCase);
    const posterColors = [0x6b2430, 0x4a3560, 0x35406b, 0xd9a765];
    const posterTitles = ["MIDNIGHT REEL", "NEON DRIFTER", "LAST SCREENING", "STARLIGHT NOIR"];
    posterColors.forEach((c, i) => {
      const px = i % 2 === 0 ? -0.36 : 0.36;
      const py = i < 2 ? 0.42 : -0.42;
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(0.65, 0.75),
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3, roughness: 0.6 })
      );
      p.position.set(4.6 + px, 1.8 + py, -1.82);
      scene.add(p);
      // title strip along the bottom of each poster so the case reads as real listings, not swatches
      const titleStrip = makeTextPlane([posterTitles[i]], "#f1ead8", 0.62, 0.14, 0.5, "bold 20px Arial, sans-serif", "#0a0608");
      titleStrip.position.set(4.6 + px, 1.8 + py - 0.305, -1.81);
      scene.add(titleStrip);
    });
    const posterLight = new THREE.PointLight(0xfff2dc, 7, 3.5);
    posterLight.position.set(4.6, 1.8, -1.2);
    scene.add(posterLight);

    // ================= ENTRANCE — curtain doorway, sign clear of all geometry =================
    const doorGroup = new THREE.Group();
    const doorFrame = addBlock(2.6, 3.2, 0.35, 0x0a0608, { roughness: 0.7 });
    doorFrame.position.set(0, 1.6, -3.9);
    doorGroup.add(doorFrame);
    const doorway = addBlock(2.1, 2.8, 0.15, 0x08050a, { roughness: 0.85 });
    doorway.position.set(0, 1.5, -3.7);
    doorGroup.add(doorway);
    // door leaves — gives the opening an actual door reading instead of a plain dark gap behind the curtains
    [-1, 1].forEach((mirror) => {
      const leaf = addBlock(0.92, 2.6, 0.06, 0x1c1418, { roughness: 0.5, metalness: 0.25 });
      leaf.position.set(mirror * 0.47, 1.5, -3.68);
      doorGroup.add(leaf);
      const handle = addSolid(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), 0xc9a35a, { roughness: 0.3, metalness: 0.7 });
      handle.rotation.z = Math.PI / 2;
      handle.position.set(mirror * 0.15, 1.4, -3.6);
      doorGroup.add(handle);
    });
    [-1.1, 1.1].forEach((mirror) => {
      const drape = addBlock(0.55, 2.6, 0.22, cCurtain, { roughness: 0.85 });
      drape.position.set(mirror * 1.15, 1.5, -3.65);
      doorGroup.add(drape);
    });
    doorGroup.userData = { clickable: "enter" };
    scene.add(doorGroup);

    const enterSign = makeTextPlane(["ENTER HERE"], "#3fe07a", 3.0, 0.6, 2.6, "bold 64px Arial, sans-serif");
    enterSign.position.set(0, 3.55, -2.5);
    scene.add(enterSign);
    const enterMat = enterSign.material as THREE.MeshStandardMaterial;
    const signBacking = addBlock(3.2, 0.75, 0.05, 0x0a0608, { roughness: 0.6 });
    signBacking.position.set(0, 3.55, -2.56);
    scene.add(signBacking);
    const enterGlow = new THREE.PointLight(cGreen, 22, 8);
    enterGlow.position.set(0, 2.4, -2.6);
    scene.add(enterGlow);
    const enterGlowLow = new THREE.PointLight(cGreen, 14, 5);
    enterGlowLow.position.set(0, 1.0, -3.0);
    scene.add(enterGlowLow);

    const doorHitZone = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.2, 2), new THREE.MeshBasicMaterial({ visible: false }));
    doorHitZone.position.set(0, 2.4, -3.0);
    scene.add(doorHitZone);

    // small brass address plaque beside the entrance — street-level dressing
    const addressPlaque = makeTextPlane(["142"], "#c9a35a", 0.4, 0.22, 0.8, "bold 26px Georgia, serif", "#1a1210");
    addressPlaque.position.set(1.6, 1.05, -3.55);
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
    const bench = addRoundedBlock(1.5, 0.32, 0.55, 0x2a2530, { roughness: 0.7 }, 0.04);
    bench.position.y = 0.16;
    benchGroup.add(bench);
    [-0.6, 0.6].forEach((x) => {
      const leg = addBlock(0.1, 0.16, 0.5, 0x1a1620, { roughness: 0.6 });
      leg.position.set(x, 0.08, 0);
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

    const character = new THREE.Group();
    character.scale.setScalar(1.4);
    character.position.set(3.2, 0.32, 2.2);
    character.rotation.y = -0.5;
    scene.add(character);

    const hip = new THREE.Group();
    hip.position.y = 0.4;
    character.add(hip);
    [-0.09, 0.09].forEach((x) => {
      const thighPivot = new THREE.Group();
      thighPivot.position.x = x;
      thighPivot.rotation.x = -1.35;
      const thigh = addCapsule(0.065, 0.28, cPants);
      thigh.position.y = -0.14;
      thighPivot.add(thigh);
      const kneePivot = new THREE.Group();
      kneePivot.position.y = -0.28;
      kneePivot.rotation.x = 1.35;
      thighPivot.add(kneePivot);
      const shin = addCapsule(0.058, 0.26, cPants);
      shin.position.y = -0.13;
      kneePivot.add(shin);
      const shoe = addRoundedBlock(0.14, 0.08, 0.2, cShoe, { roughness: 0.5 }, 0.025);
      shoe.position.set(0, -0.28, 0.05);
      kneePivot.add(shoe);
      hip.add(thighPivot);
    });

    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.4;
    character.add(torsoGroup);
    const torso = addRoundedBlock(0.32, 0.34, 0.2, cShirt, undefined, 0.06);
    torso.position.y = 0.17;
    torsoGroup.add(torso);
    const neck = addSolid(new THREE.CylinderGeometry(0.045, 0.055, 0.09, 10), cSkin, { roughness: 0.6 });
    neck.position.y = 0.375;
    torsoGroup.add(neck);

    const restArm = new THREE.Group();
    restArm.position.set(-0.21, 0.34, 0);
    restArm.rotation.x = -0.9;
    const restShoulderCap = addSphere(0.058, cShirt);
    restArm.add(restShoulderCap);
    const restUpper = addCapsule(0.055, 0.26, cShirt);
    restUpper.position.y = -0.13;
    restArm.add(restUpper);
    const restHand = addSphere(0.052, cSkin, { roughness: 0.6 });
    restHand.position.y = -0.26;
    restArm.add(restHand);
    torsoGroup.add(restArm);

    // drinking arm — raises the can to the mouth on a slow repeating cycle
    const drinkShoulder = new THREE.Group();
    drinkShoulder.position.set(0.21, 0.34, 0);
    torsoGroup.add(drinkShoulder);
    const drinkShoulderCap = addSphere(0.058, cShirt);
    drinkShoulder.add(drinkShoulderCap);
    const drinkUpper = addCapsule(0.055, 0.26, cShirt);
    drinkUpper.position.y = -0.13;
    drinkShoulder.add(drinkUpper);
    const drinkElbow = new THREE.Group();
    drinkElbow.position.y = -0.26;
    drinkShoulder.add(drinkElbow);
    const drinkLower = addCapsule(0.048, 0.22, cSkin);
    drinkLower.position.y = -0.11;
    drinkElbow.add(drinkLower);
    const drinkHand = addSphere(0.052, cSkin, { roughness: 0.6 });
    drinkHand.position.y = -0.23;
    drinkElbow.add(drinkHand);

    // energy-drink can, held in the drinking hand
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
    drinkCan.position.set(0, -0.24, 0.05);
    drinkElbow.add(drinkCan);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.44, 0);
    torsoGroup.add(headGroup);
    const face = addSphere(0.105, cSkin);
    face.position.y = 0.09;
    headGroup.add(face);
    const ear = (mirror: 1 | -1) => {
      const e = addSphere(0.022, cSkin);
      e.position.set(mirror * 0.1, 0.08, 0);
      headGroup.add(e);
    };
    ear(1);
    ear(-1);
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.118, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
      new THREE.MeshStandardMaterial({ color: cHair, roughness: 0.75 })
    );
    hair.position.y = 0.1;
    hair.castShadow = true;
    headGroup.add(hair);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x18100e, roughness: 0.4 });
    [-1, 1].forEach((m) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 8), eyeMat);
      eye.position.set(m * 0.042, 0.11, 0.098);
      headGroup.add(eye);
    });
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.012, 0.01),
      new THREE.MeshStandardMaterial({ color: 0x7a4a42, roughness: 0.6 })
    );
    mouth.position.set(0, 0.02, 0.103);
    headGroup.add(mouth);

    // ================= CONTROLS — drag to orbit, scroll to zoom (same model as the interior scene) =================
    let isDragging = false;
    let lastX = 0,
      lastY = 0;
    let dragDistance = 0;
    let rotX = -0.08,
      rotY = 0;
    let zoomTarget = 17;
    let zoomCurrent = zoomTarget;
    let swayAmount = 1; // eases toward 0 while dragging, 1 while idle — no hard on/off toggle

    function startDrag(x: number, y: number) {
      isDragging = true;
      lastX = x;
      lastY = y;
      dragDistance = 0;
    }
    function moveDrag(x: number, y: number) {
      if (!isDragging) return;
      const dx = x - lastX,
        dy = y - lastY;
      lastX = x;
      lastY = y;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      rotY -= dx * 0.005;
      rotX += dy * 0.004;
      rotX = Math.max(-0.55, Math.min(0.25, rotX));
    }
    function endDrag() {
      isDragging = false;
    }

    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTarget += e.deltaY * 0.015;
      zoomTarget = Math.max(9, Math.min(38, zoomTarget));
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
        zoomTarget = Math.max(9, Math.min(38, pinchStartZoom * (pinchStartDist / dist)));
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

    // ================= RAYCAST =================
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    let lastPointerX = -1000;
    let lastPointerY = -1000;
    let hoveringDoor = false;

    const onMouseMove = (e: MouseEvent) => {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      moveDrag(e.clientX, e.clientY);
    };
    function handleTap(clientX: number, clientY: number) {
      mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      if (raycaster.intersectObject(doorHitZone, true).length) onEnter();
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
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      if (activeCars.length >= 2) return; // up to 2 at once — a live street, not a jam
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
      const delay = 3500 + Math.random() * 4500; // frequent enough to feel like a living street
      carTimer = setTimeout(() => {
        spawnCar();
        scheduleNextCar();
      }, delay);
    }
    carTimer = setTimeout(spawnCar, 800); // first car arrives quickly instead of after a long wait
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
      const tail = addCapsule(0.024, 0.26, color, { roughness: 0.85 });
      tail.rotation.z = -0.85;
      tail.position.set(-0.19, 0.25, 0);
      group.add(tail);
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
      return { group, legs };
    }
    function playMeow() {
      if (!audioCtx || audioStopped) return;
      const t0 = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(720, t0);
      osc.frequency.exponentialRampToValueAtTime(980, t0 + 0.08);
      osc.frequency.exponentialRampToValueAtTime(410, t0 + 0.4);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.055, t0 + 0.05);
      gain.gain.linearRampToValueAtTime(0.03, t0 + 0.25);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.5);
    }
    const catColors = [0x2b2320, 0xe4d9c0, 0xc98b4a];
    type ActiveCat = { group: THREE.Group; legs: THREE.Object3D[]; dir: 1 | -1; speed: number; meowed: boolean; startX: number };
    const activeCats: ActiveCat[] = [];
    const CAT_HALF_RANGE = 9;
    let catTimer: ReturnType<typeof setTimeout> | null = null;
    function spawnCat() {
      if (activeCats.length >= 2) return; // "two cats" — rare enough that both showing at once is a treat
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      const speed = 1.1 + Math.random() * 0.5;
      const { group, legs } = makeCat(catColors[Math.floor(Math.random() * catColors.length)]);
      group.rotation.y = dir === 1 ? -Math.PI / 2 : Math.PI / 2;
      const startX = dir === 1 ? -CAT_HALF_RANGE : CAT_HALF_RANGE;
      group.position.set(startX, 0, 3.9); // along the sidewalk, in front of the building
      scene.add(group);
      activeCats.push({ group, legs, dir, speed, meowed: false, startX });
    }
    function scheduleNextCat() {
      const delay = 20000 + Math.random() * 25000; // seldom — a rare passerby, not a fixture
      catTimer = setTimeout(() => {
        spawnCat();
        scheduleNextCat();
      }, delay);
    }
    catTimer = setTimeout(spawnCat, 6000);
    scheduleNextCat();

    // ================= PEDESTRIAN — occasional walking silhouette on the sidewalk =================
    const cPedestrianColors = [0x232028, 0x2c2632, 0x1e2430, 0x2a2020];
    function makePedestrian() {
      const group = new THREE.Group();
      const color = cPedestrianColors[Math.floor(Math.random() * cPedestrianColors.length)];
      const torso = addCapsule(0.09, 0.45, color, { roughness: 0.85 });
      torso.position.y = 0.95;
      group.add(torso);
      const head = addSphere(0.09, cSkin, { roughness: 0.7 });
      head.position.y = 1.32;
      group.add(head);
      const legs: THREE.Object3D[] = [];
      [-1, 1].forEach((m) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(m * 0.06, 0.72, 0);
        const leg = addCapsule(0.05, 0.62, 0x151318, { roughness: 0.8 });
        leg.position.y = -0.31;
        legPivot.add(leg);
        group.add(legPivot);
        legs.push(legPivot);
      });
      return { group, legs };
    }
    type ActivePedestrian = { group: THREE.Group; legs: THREE.Object3D[]; dir: 1 | -1; speed: number; startX: number };
    const activePedestrians: ActivePedestrian[] = [];
    const PEDESTRIAN_HALF_RANGE = 10;
    let pedestrianTimer: ReturnType<typeof setTimeout> | null = null;
    function spawnPedestrian() {
      if (activePedestrians.length >= 1) return; // one at a time — a rare passerby, not a crowd
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      const speed = 1.2 + Math.random() * 0.4;
      const { group, legs } = makePedestrian();
      group.rotation.y = dir === 1 ? -Math.PI / 2 : Math.PI / 2;
      const startX = dir === 1 ? -PEDESTRIAN_HALF_RANGE : PEDESTRIAN_HALF_RANGE;
      group.position.set(startX, 0, 4.4); // sidewalk, slightly further back than the cat lane
      scene.add(group);
      activePedestrians.push({ group, legs, dir, speed, startX });
    }
    function scheduleNextPedestrian() {
      const delay = 22000 + Math.random() * 28000; // seldom, like the cats
      pedestrianTimer = setTimeout(() => {
        spawnPedestrian();
        scheduleNextPedestrian();
      }, delay);
    }
    pedestrianTimer = setTimeout(spawnPedestrian, 10000);
    scheduleNextPedestrian();

    const clock = new THREE.Clock();
    let rafId: number;
    let readyFired = false;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // idle sway layered on top of the user's drag position, small enough to feel alive without fighting input
      swayAmount = THREE.MathUtils.lerp(swayAmount, isDragging ? 0 : 1, 0.06);
      rig.rotation.y = rotY + Math.sin(elapsed * 0.15) * 0.02 * swayAmount;
      rig.rotation.x = rotX + Math.sin(elapsed * 0.1) * 0.01 * swayAmount;
      zoomCurrent = THREE.MathUtils.lerp(zoomCurrent, zoomTarget, 0.08);
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

      for (let i = activeCats.length - 1; i >= 0; i--) {
        const cat = activeCats[i];
        cat.group.position.x += cat.dir * cat.speed * delta;
        cat.legs.forEach((leg, li) => {
          leg.position.y = 0.075 + Math.abs(Math.sin(elapsed * 9 + li * Math.PI)) * 0.02;
        });
        cat.group.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.015;
        if (!cat.meowed && Math.abs(cat.group.position.x - cat.startX) > CAT_HALF_RANGE * 0.6) {
          cat.meowed = true;
          playMeow();
        }
        if (cat.group.position.x > CAT_HALF_RANGE + 2 || cat.group.position.x < -CAT_HALF_RANGE - 2) {
          scene.remove(cat.group);
          activeCats.splice(i, 1);
        }
      }

      for (let i = activePedestrians.length - 1; i >= 0; i--) {
        const ped = activePedestrians[i];
        ped.group.position.x += ped.dir * ped.speed * delta;
        const stride = Math.sin(elapsed * 6);
        ped.legs[0].rotation.x = stride * 0.5;
        ped.legs[1].rotation.x = -stride * 0.5;
        if (ped.group.position.x > PEDESTRIAN_HALF_RANGE + 2 || ped.group.position.x < -PEDESTRIAN_HALF_RANGE - 2) {
          scene.remove(ped.group);
          activePedestrians.splice(i, 1);
        }
      }

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

      mouseVec.x = (lastPointerX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(lastPointerY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      hoveringDoor = raycaster.intersectObject(doorHitZone, true).length > 0;
      enterGlow.intensity = THREE.MathUtils.lerp(enterGlow.intensity, hoveringDoor ? 34 : 22, 0.15);
      const signScale = hoveringDoor ? 1.1 : 1;
      enterSign.scale.lerp(new THREE.Vector3(signScale, signScale, 1), 0.15);
      // neon buzz — a quick brightness dip on the ENTER sign, like a flickering tube
      const buzz = Math.sin(elapsed * 46) > 0.92 ? 0.45 : 1;
      enterMat.emissiveIntensity = 2.6 * buzz;

      // classic theater marquee chase — two overlapping pulses traveling opposite ways down the bulb strip
      marqueeBulbs.forEach((mat, i) => {
        const wave1 = Math.sin(elapsed * 4 - i * 0.9);
        const wave2 = Math.sin(elapsed * -2.3 - i * 1.6) * 0.4;
        mat.emissiveIntensity = 1.3 + (wave1 + wave2) * 0.9;
      });
      starMat.opacity = 0.4 + Math.sin(elapsed * 1.3) * 0.1 + Math.sin(elapsed * 2.7) * 0.06;

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

      renderer.render(scene, camera);

      if (!readyFired) {
        readyFired = true;
        onReady?.();
      }
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

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
      if (catTimer) clearTimeout(catTimer);
      if (pedestrianTimer) clearTimeout(pedestrianTimer);
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