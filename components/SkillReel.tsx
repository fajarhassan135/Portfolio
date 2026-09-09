"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Three film frames on a shallow concave arc, cycling through the skill list.
 *
 * Deliberately much smaller than the versions before it. There is no strip, no coil, no travelling
 * frames and no scroll coupling: three fixed slots, each independently swapping its contents on its
 * own timer. What moves is the CONTENT, not the geometry.
 *
 * WHY THE FRAMES ARE STILL FLAT QUADS. Text mapped onto a curved swept surface shears wherever the
 * surface bends, which is what garbled every label in the ribbon versions. A flat quad cannot shear
 * its texture, so each label stays pixel-exact. That technique is unchanged here.
 *
 * WHY THE ARC STILL EXISTS with a front-on camera. Points sit on a circle whose centre is on the
 * viewer's side, so the outer two frames toe in slightly toward the middle. Straight on that reads
 * as a shallow curved screen with a little depth, rather than three flat cards in a row, while
 * every frame still faces the camera almost exactly and stays completely readable.
 *
 * THE STRIP IS CONTINUOUS. Frames sit one CHORD apart, so their edges touch, and the perforated
 * margins are painted into each cell texture rather than modelled as per-frame notch meshes. Notch
 * meshes could never carry across a join, because each frame's notches ended at its own boundary;
 * baked margins line up with the neighbouring cell's and the sprocket run is unbroken.
 *
 * Nothing fades or scales per frame, for the same reason: a frame that shrinks stops meeting its
 * neighbours. The strip simply runs off both ends and a CSS mask on the canvas dissolves it there. */

/* ---------------------------------------------------------------------------------------------
   Content, cycled in this order and looped
   ------------------------------------------------------------------------------------------- */

const SKILLS = [
  "FULL STACK\nDEVELOPMENT",
  "LLM\nINTEGRATION",
  "AI\nCHATBOTS",
  "C++ AND DSA",
  "DESKTOP APPS",
  "VERCEL",
  "NETLIFY",
  "NEXT.JS",
  "TYPESCRIPT",
  "REACT",
  "THREE.JS",
  "GSAP",
  "PYTHON",
  "SUPABASE",
  "POSTGRESQL",
  "MYSQL",
  "NODE.JS",
  "EXPRESS",
  "LANGCHAIN",
  "GROQ AND QWEN3",
];

const SLOTS = 3; // the three positions a frame is READ at; the pool that passes through is larger

/* ---- motion -----------------------------------------------------------------------------------
   Frames travel along a continuous coordinate `p`, measured in slot widths:

       p = 0        left end, off the masked edge
       p = 1, 2, 3  the three readable positions
       p = 4        right end, off the masked edge

   Each frame slides from 4 down to 0, then wraps back to 4 and collects the next skill. Four frames
   spaced one slot apart cover p = 0..4 with no hole, so the strip is unbroken across the whole
   visible area, and the wrap happens outside the mask where it cannot be seen.

   There is deliberately NO per-frame fade or shrink. That was what broke the strip at its right
   edge: a frame at reduced opacity and scale no longer meets its neighbours, so the sprocket run
   stopped exactly where it was supposed to continue. Every frame is full size and fully opaque for
   its entire traversal; the ends of the strip are dissolved once, over the whole canvas, by the
   mask on .reel-canvas.
   ---------------------------------------------------------------------------------------------- */
const POOL = 4; // four frames cover p = 0..4 with no hole
const SPAN = 4; // p runs 0..SPAN
const SLOT_MS = 4200; // time to travel one slot width; a frame crosses the strip in ~17s

/* ---- dimensions ---- */
const FRAME_W = 2.6;
const FRAME_H = 1.95;
const FRAME_D = 0.09;
const ARC_R = 9; // large radius: the toe-in is slight
/* Chord spacing, not arc spacing, and with NO gap term.
   Consecutive frames sit one chord apart on the circle: 2R*sin(STEP/2) = FRAME_W. That is what puts
   their edges in contact instead of leaving dark background between them, so the three read as one
   piece of film rather than three picture frames near each other. */
const ARC_STEP = 2 * Math.asin(FRAME_W / (2 * ARC_R));

const REFLECT_GAP = 0.42;
const REFLECT_OPACITY = 0.22;

/* ---- palette: unchanged ---- */
const RIBBON_DARK = 0x150c18;
const RIBBON_EDGE = 0x2b1a30; // the hairline seam drawn at each cell boundary
const GOLD = 0xd8ad5c;

/** three.js colours are numbers; the 2D canvas wants CSS. One place to convert. */
const HEX = (n: number) => `#${n.toString(16).padStart(6, "0")}`;

/**
 * One skill's window: a light panel with the name in dark bold type.
 *
 * Includes the shrink-to-fit loop from makeTextPlane in ExteriorScene.tsx, because a long label at
 * a fixed size overran the canvas there and clipped its outer glyphs.
 */
function makeWindowTexture(label: string, aniso: number) {
  const W = 768;
  const H = Math.round(W * (FRAME_H / FRAME_W)); // the texture now covers the WHOLE frame face
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  /* The perforated margins are drawn INTO the cell rather than modelled as separate notch meshes.
     With the frames edge to edge, each cell's margins line up with its neighbours' and the sprocket
     band runs unbroken across all three: one strip of film with three windows in it. Notch meshes
     could never do that, because each frame's notches ended at its own boundary. */
  const margin = Math.round(H * 0.17);

  ctx.fillStyle = HEX(RIBBON_DARK); // the film base
  ctx.fillRect(0, 0, W, H);

  // sprocket holes: warm gold, evenly pitched so they continue across the joins between frames
  const holeW = Math.round(W * 0.055);
  const holeH = Math.round(margin * 0.46);
  const pitch = Math.round(W / 6); // 6 per frame, so the run stays regular frame to frame
  ctx.fillStyle = HEX(GOLD);
  for (let x = Math.round(pitch / 2); x < W; x += pitch) {
    ctx.fillRect(x - holeW / 2, (margin - holeH) / 2, holeW, holeH);
    ctx.fillRect(x - holeW / 2, H - margin + (margin - holeH) / 2, holeW, holeH);
  }

  // The window the label sits in. Deep plum rather than cream: a light panel read as a paper label
  // stuck on the film, where a dark one reads as an exposed frame, and it sits with the rest of the
  // page instead of punching a bright hole in it.
  const inset = Math.round(W * 0.022);
  const wx = inset;
  const wy = margin + inset;
  const ww = W - inset * 2;
  const wh = H - (margin + inset) * 2;

  const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, "#3a2440");
  g.addColorStop(0.55, "#2a1830");
  g.addColorStop(1, "#1d1024");
  ctx.fillStyle = g;
  ctx.fillRect(wx, wy, ww, wh);

  // a faint warm vignette from the top, so the cell has some light in it rather than reading flat
  const vg = ctx.createRadialGradient(wx + ww / 2, wy + wh * 0.25, 0, wx + ww / 2, wy + wh * 0.3, ww * 0.7);
  vg.addColorStop(0, "rgba(216, 173, 92, 0.14)");
  vg.addColorStop(1, "rgba(216, 173, 92, 0)");
  ctx.fillStyle = vg;
  ctx.fillRect(wx, wy, ww, wh);

  /* Film grain. Drawn as sparse single pixels rather than a noise image: at this texture size a
     couple of thousand specks is cheap, it is baked once per label, and it stops the flat fill
     reading as plastic. */
  const GRAIN = Math.round((ww * wh) / 620);
  for (let i = 0; i < GRAIN; i++) {
    const gx = wx + Math.random() * ww;
    const gy = wy + Math.random() * wh;
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? "rgba(255, 240, 214, 0.05)" : "rgba(0, 0, 0, 0.07)";
    ctx.fillRect(gx, gy, 1.4, 1.4);
  }

  // a hairline gold edge, so the window reads as inset into the film rather than painted on
  ctx.strokeStyle = "rgba(216, 173, 92, 0.3)";
  ctx.lineWidth = Math.max(1.5, W * 0.0035);
  ctx.strokeRect(wx + 1, wy + 1, ww - 2, wh - 2);

  const lines = label.split("\n");
  let px = Math.floor(wh * (lines.length > 1 ? 0.3 : 0.4));
  /* Outfit, not JetBrains Mono. Monospace read as a terminal dump; Outfit is a rounded geometric
     sans that stays technical without being cold, and it is already loaded for the page body so it
     costs nothing extra. The stack falls back to the system UI sans rather than to a serif. */
  const font = (size: number) =>
    `700 ${size}px "Outfit", ui-sans-serif, system-ui, -apple-system, sans-serif`;
  const SAFE = ww * 0.84;
  const widest = () => {
    ctx.font = font(px);
    return Math.max(...lines.map((l) => ctx.measureText(l).width));
  };
  // shrink-to-fit, as in makeTextPlane: a long label at a fixed size overran the canvas there
  while (px > 10 && widest() > SAFE) px -= 2;

  ctx.font = font(px);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineH = px * 1.24;
  const cy = wy + wh / 2 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => {
    const tx = wx + ww / 2;
    const ty = cy + i * lineH;
    // a soft dark bed under the type, so it holds against the grain at any size
    ctx.fillStyle = "rgba(10, 5, 12, 0.55)";
    ctx.fillText(l, tx, ty + Math.max(1, px * 0.035));
    ctx.fillStyle = "#f6e4b8"; // warm cream-gold, matching the sprockets
    ctx.fillText(l, tx, ty);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  return tex;
}

export default function SkillReel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // no WebGL: the section simply has no reel rather than a broken one
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 90);
    const aniso = renderer.capabilities.getMaxAnisotropy();

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(x: T) => {
      disposables.push(x);
      return x;
    };

    /* ---- every label rasterised once, up front ---- */
    const textures = SKILLS.map((s) => track(makeWindowTexture(s, aniso)));

    /* ---- the soft bloom behind each window ---- */
    const glowTex = track(
      (() => {
        const N = 128;
        const c = document.createElement("canvas");
        c.width = N;
        c.height = N;
        const g2 = c.getContext("2d")!;
        const g = g2.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
        g.addColorStop(0.0, "rgba(255, 226, 170, 0.6)");
        g.addColorStop(0.35, "rgba(206, 150, 96, 0.28)");
        g.addColorStop(0.7, "rgba(126, 74, 150, 0.11)");
        g.addColorStop(1.0, "rgba(108, 60, 140, 0)");
        g2.fillStyle = g;
        g2.fillRect(0, 0, N, N);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })()
    );

    const bodyGeo = track(new THREE.BoxGeometry(FRAME_W, FRAME_H, FRAME_D));
    const winGeo = track(new THREE.PlaneGeometry(FRAME_W, FRAME_H)); // the full cell, margins included

    type Slot = {
      group: THREE.Group;
      win: THREE.MeshBasicMaterial;
      glow: THREE.MeshBasicMaterial;
      /* every material on the frame, so the whole object fades as one. Previously only the window
         faded and the frame body stayed solid, which would leave a dark slab sliding off the edge */
      mats: THREE.MeshBasicMaterial[];
      base: number; // this copy's resting opacity: 1 for the strip, REFLECT_OPACITY for the mirror
    };

    const strip = new THREE.Group();
    const reflection = new THREE.Group();
    reflection.scale.y = -1;
    /* Offset by a full frame height plus the gap, not just the gap.
       With scale.y = -1 a local y maps to world (P - y), so the mirror spans [P - H/2, P + H/2].
       At P = -REFLECT_GAP that range overlapped the real frames almost entirely, and because the
       reflection is added second it painted OVER them: the visible labels came out upside down.
       Putting the mirror's top edge at the strip's bottom edge needs P = -(H + gap). */
    reflection.position.y = -(FRAME_H + REFLECT_GAP);
    scene.add(strip, reflection);

    /** Build one frame: dark slab, rim, sprocket notches, and two stacked window layers. */
    const buildSlot = (baseOpacity: number): Slot => {
      const g = new THREE.Group();

      const bodyMat = track(
        new THREE.MeshBasicMaterial({ color: RIBBON_DARK, transparent: true, opacity: baseOpacity })
      );

      g.add(new THREE.Mesh(bodyGeo, bodyMat));

      /* The rim slab and the sprocket notch meshes used to live here. Both are gone: with the
         frames edge to edge a rim scaled past the frame's own width would overlap its neighbour and
         draw a seam exactly where the strip is supposed to be continuous, and the notches ended at
         each frame's boundary so the perforation run broke at every join. Both are painted into the
         cell texture now, which is what lets them carry across the joins unbroken. */

      /* One window layer now, not two. The pair existed to cross-fade a texture swap in a static
         mesh; a frame now carries a single skill for its entire traversal and only picks up a new
         one at the wrap point, off screen at zero opacity, so there is nothing to cross-fade. */
      const glowMat = track(
        new THREE.MeshBasicMaterial({
          map: glowTex,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const glow = new THREE.Mesh(winGeo, glowMat);
      glow.scale.set(1.05, 0.72, 1); // over the window area only, not the perforated margins
      glow.position.z = FRAME_D / 2 + 0.006;
      g.add(glow);

      const winMat = track(
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.z = FRAME_D / 2 + 0.01;
      g.add(win);

      return {
        group: g,
        win: winMat,
        glow: glowMat,
        mats: [bodyMat, winMat, glowMat],
        base: baseOpacity,
      };
    };

    const slots: Slot[] = [];
    const mirrors: Slot[] = [];
    for (let i = 0; i < POOL; i++) {
      const main = buildSlot(1);
      const mir = buildSlot(REFLECT_OPACITY);
      slots.push(main);
      mirrors.push(mir);
      strip.add(main.group);
      reflection.add(mir.group);
    }

    /* -----------------------------------------------------------------------------------------
       Where a frame sits, and how visible it is, for a given position along the arc.
       --------------------------------------------------------------------------------------- */

    /** p (0..SPAN) to the arc angle. p = 1, 2, 3 land exactly on the three readable positions. */
    const angleAt = (p: number) => (p - SPAN / 2) * ARC_STEP;

    /* Skill assignment: each pool member holds one skill for a whole traversal and takes the next
       off the list when it wraps. `feed` only counts up, so the list cycles endlessly and there is
       no reset step to be seen. */
    const skillOf = new Array<number>(POOL);
    let feed = 0;

    // start the pool spread one slot apart, so the arc is populated from the first frame
    const posOf = new Array<number>(POOL);
    for (let i = 0; i < POOL; i++) posOf[i] = SPAN - i;

    const setSkill = (i: number, idx: number) => {
      skillOf[i] = idx;
      for (const set of [slots[i], mirrors[i]]) {
        set.win.map = textures[idx];
        set.win.needsUpdate = true;
      }
    };
    for (let i = 0; i < POOL; i++) setSkill(i, feed++ % SKILLS.length);

    /** Advance every frame by `dtMs`, then write its transform. */
    const advance = (dtMs: number) => {
      const step = dtMs / SLOT_MS;

      for (let i = 0; i < POOL; i++) {
        posOf[i] -= step;

        // Wrapped past the left end: send it back to the right and give it the next skill. The wrap
        // point is a full frame outside the masked area, so neither the jump nor the texture swap
        // is ever on screen.
        if (posOf[i] <= 0) {
          posOf[i] += SPAN;
          setSkill(i, feed++ % SKILLS.length);
        }

        const th = angleAt(posOf[i]);
        const x = Math.sin(th) * ARC_R;
        const z = ARC_R * (1 - Math.cos(th)); // ends swing toward the viewer

        for (const set of [slots[i], mirrors[i]]) {
          set.group.position.set(x, 0, z);
          set.group.rotation.y = -th; // still faces the arc's centre, so it faces the camera
          // Scale and opacity are CONSTANT. Anything that varies per frame pulls its edges away
          // from its neighbours and breaks the strip; the container edges are faded by a CSS mask
          // over the whole canvas instead.
          for (const m of set.mats) m.opacity = set.base;
          set.glow.opacity = set.base * 0.5;
        }
      }
    };

    /* -----------------------------------------------------------------------------------------
       Camera: straight on. Distance solved by projecting the real frame corners, so the three fill
       the container edge to edge at any aspect rather than being hand-placed.
       --------------------------------------------------------------------------------------- */
    const CAM_DIR = new THREE.Vector3(0, 0, 1); // dead front: no elevation, no side offset
    const FIT_MARGIN = 1.04;

    /* What has to be inside the frame.
       The frames themselves, plus the top slice of the reflection so a little of it is actually on
       screen. Fitting the WHOLE reflection would halve the frames; fitting none of it, which is what
       this did before, pushed the reflection entirely out of view. */
    const REFLECT_SHOW = 0.3; // fraction of the reflection's height kept in frame
    const reflectTop = -(FRAME_H + REFLECT_GAP) + FRAME_H / 2; // its top edge, in world Y
    const fitPoints: THREE.Vector3[] = [];
    // Deliberately the three READABLE positions only (p = 1, 2, 3), not the full travel span.
    // Fitting the entry and exit points too would shrink the readable frames to make room for two
    // that are fading out anyway; framing the three keeps them filling the width, and arriving
    // frames slide in from just outside the edge, which is what the motion wants.
    for (let i = 1; i <= SLOTS; i++) {
      const th = (i - SPAN / 2) * ARC_STEP;
      const cx = Math.sin(th) * ARC_R;
      const cz = ARC_R * (1 - Math.cos(th));
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1])
          fitPoints.push(new THREE.Vector3(cx + (sx * FRAME_W) / 2, (sy * FRAME_H) / 2, cz));
        fitPoints.push(new THREE.Vector3(cx + (sx * FRAME_W) / 2, reflectTop - FRAME_H * REFLECT_SHOW, cz));
      }
    }
    const fitCentre = new THREE.Box3().setFromPoints(fitPoints).getCenter(new THREE.Vector3());

    const _v = new THREE.Vector3();
    const frame = () => {
      let dist = 12;
      for (let iter = 0; iter < 8; iter++) {
        camera.position.copy(CAM_DIR).multiplyScalar(dist).add(fitCentre);
        camera.lookAt(fitCentre);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);
        let extent = 0;
        for (const p of fitPoints) {
          _v.copy(p).project(camera);
          if (!Number.isFinite(_v.x) || !Number.isFinite(_v.y)) continue;
          /* Both axes weighted equally. At 0.72 the vertical term was allowed to reach 1/0.72 =
             1.39 in NDC, i.e. 39% outside the viewport, and in the real container (980x268, aspect
             3.66) that is exactly what happened: the frames were cropped top and bottom and their
             sprocket edges were cut off. */
          extent = Math.max(extent, Math.abs(_v.x), Math.abs(_v.y));
        }
        if (extent <= 0) break;
        const scale = extent * FIT_MARGIN;
        dist *= scale;
        if (Math.abs(scale - 1) < 0.01) break;
      }
      camera.position.copy(CAM_DIR).multiplyScalar(dist).add(fitCentre);
      camera.lookAt(fitCentre);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
    };

    let lastW = -1;
    let lastH = -1;
    const applySize = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      // never cache a zero: doing so once left the drawing buffer stuck at 1x200 for the page's life
      if (w < 2 || h < 2) return;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      camera.aspect = w / h;
      camera.fov = w / h < 2.2 ? 48 : 40;
      frame();
      renderer.setSize(w, h, false);
    };
    camera.aspect = Math.max(0.2, (root.clientWidth || 960) / (root.clientHeight || 300));
    frame();
    applySize();
    const ro = new ResizeObserver(applySize);
    ro.observe(root);

    advance(0);

    if (reduce) {
      renderer.render(scene, camera);
    }

    const clock = new THREE.Clock();
    let raf = 0;
    let running = !reduce;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      applySize(); // cheap and guarded; covers a container with no layout at mount
      // delta first: getElapsedTime() calls getDelta() internally and would zero it out
      // delta drives distance travelled, so the speed is wall-clock and not frame-rate dependent
      advance(Math.min(0.05, clock.getDelta()) * 1000);
      renderer.render(scene, camera);
    };
    if (!reduce) raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      ([e]) => {
        if (reduce) return;
        if (e.isIntersecting && !running) {
          running = true;
          clock.getDelta();
          raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      for (const d of disposables) d.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={rootRef} className="reel-stage" aria-label="Skills">
      <canvas ref={canvasRef} className="reel-canvas" />
      {/* only three are ever on screen, so the full list has to exist in the DOM for assistive tech */}
      <ul className="sr-only">
        {SKILLS.map((s) => (
          <li key={s}>{s.replace("\n", " ")}</li>
        ))}
      </ul>
    </div>
  );
}
