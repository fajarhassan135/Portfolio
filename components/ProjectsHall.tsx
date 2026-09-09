"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The auditorium you watch the projects from: seated in the stalls, looking up at the screen.
 *
 * WHY THE CAMERA NEVER PITCHES. Each project is DOM laid over the screen's projected rectangle, the
 * same technique the Contact backroom uses, because real links, real focus order and type that stays
 * crisp are all things a CanvasTexture cannot give you. That only holds while the screen projects to
 * a true rectangle, which means the camera must stay perpendicular to it. Tilting the camera up to
 * look at a high screen would shear it into a trapezoid and the overlay would no longer fit.
 *
 * SO THE LOOKING UP IS DONE WITH THE FRUSTUM. The camera sits at seated eye height and points dead
 * level; `setViewOffset` then slides the frustum so the screen lands high in frame and the seat backs
 * fill the bottom. You get the feeling of looking up at a cinema screen with none of the shear.
 *
 * THE BEAM comes from behind and above the viewer, which is where a projection booth actually is. It
 * is an open cone with additive blending rather than a light: a real spotlight would need a
 * volumetric pass to show its shaft at all, and the cone IS the shaft.
 */

const SCREEN_W = 12;
const SCREEN_H = 6.75; // 16:9, the shape a modern hall actually is
const SCREEN_Z = -16;
const SCREEN_Y = 4.9;
const EYE_Y = 1.55; // seated eye height
const FOV = 42;

/** How much of the frame's height the screen fills, and where its centre sits vertically. */
const FILL = 0.6;
const TARGET_CY = 0.4;

const C_VOID = 0x08060e;
const C_WALL = 0x1a1119;
const C_SEAT = 0x4a1a26;
const C_GOLD = 0xd8ad5c;
const C_CURTAIN = 0x4d1420;

export type ScreenRect = { x: number; y: number; w: number; h: number };

export default function ProjectsHall({ onScreenRect }: { onScreenRect: (r: ScreenRect | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef(onScreenRect);
  rectRef.current = onScreenRect;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      rectRef.current(null); // no WebGL: the page falls back to a plain readable layout
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(C_VOID, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0912, 0.026);

    /* FIT BY DISTANCE, NEVER BY ANGLE. The height distance comes from the fill fraction: visible
       height at d is 2*d*tan(fov/2). A narrow window then needs the screen to fit by width too, and
       the obvious fix, widening the fov, is the wrong one: it holds the camera still and opens the
       lens, which drags the ceiling, both side walls and the whole beam into shot and the frame
       stops reading as a cinema. Stepping back instead keeps the fov, and therefore keeps exactly
       the same amount of room in view at every viewport. */
    const distForHeight = SCREEN_H / FILL / (2 * Math.tan((FOV * Math.PI) / 360));
    const WIDTH_MARGIN = 1.1;
    const distForWidth = (aspect: number) =>
      (SCREEN_W * WIDTH_MARGIN) / (2 * Math.tan((FOV * Math.PI) / 360) * aspect);

    let camDist = distForHeight;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    camera.position.set(0, EYE_Y, SCREEN_Z + camDist);
    camera.lookAt(0, EYE_Y, SCREEN_Z); // dead level, so the screen stays a rectangle

    const kept: { dispose(): void }[] = [];
    const keep = <T extends { dispose(): void }>(x: T) => {
      kept.push(x);
      return x;
    };
    const box = (w: number, h: number, d: number, color: number, rough = 0.9, metal = 0) =>
      new THREE.Mesh(
        keep(new THREE.BoxGeometry(w, h, d)),
        keep(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }))
      );

    let seed = 20260909;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const mkTex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      paint(c.getContext("2d")!);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return keep(t);
    };

    /* ---- the hall ---- */
    const floor = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(60, 70)),
      keep(new THREE.MeshStandardMaterial({ color: 0x1a0f14, roughness: 0.95 }))
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.6;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(60, 70)),
      keep(new THREE.MeshStandardMaterial({ color: 0x110b14, roughness: 0.98 }))
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 11;
    scene.add(ceiling);

    const backWall = box(46, 22, 0.6, C_WALL);
    backWall.position.set(0, 8, SCREEN_Z - 1.2);
    scene.add(backWall);
    for (const side of [-1, 1]) {
      const w = box(0.6, 22, 60, C_WALL);
      w.position.set(side * 13.5, 8, -6);
      scene.add(w);
    }

    /* ---- the screen ---------------------------------------------------------------------------
       Off-white with a woven texture, and only faintly emissive. It is a surface the beam lands on,
       not a light source; a screen that emits its own light reads as a television. */
    const weave = mkTex(256, 256, (g) => {
      g.fillStyle = "#e3d9c6";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 256; i += 3) {
        g.fillStyle = "rgba(112,98,80,0.09)";
        g.fillRect(i, 0, 1.4, 256);
        g.fillRect(0, i, 256, 1.4);
      }
    });
    weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
    weave.repeat.set(12, 7);

    const screenMat = keep(
      new THREE.MeshStandardMaterial({
        map: weave,
        color: 0xd9cfba,
        roughness: 0.96,
        emissive: new THREE.Color(0xbfae94),
        emissiveIntensity: 0.34,
      })
    );
    const screen = new THREE.Mesh(keep(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat);
    screen.position.set(0, SCREEN_Y, SCREEN_Z);
    scene.add(screen);

    // masking border, the way a real screen is edged, plus a proscenium behind it
    const BORDER = 0.16;
    for (const [w, h, dx, dy] of [
      [SCREEN_W + BORDER * 2, BORDER, 0, SCREEN_H / 2 + BORDER / 2],
      [SCREEN_W + BORDER * 2, BORDER, 0, -SCREEN_H / 2 - BORDER / 2],
      [BORDER, SCREEN_H, -SCREEN_W / 2 - BORDER / 2, 0],
      [BORDER, SCREEN_H, SCREEN_W / 2 + BORDER / 2, 0],
    ] as [number, number, number, number][]) {
      const bar = box(w, h, 0.1, 0x060409, 0.96);
      bar.position.set(dx, SCREEN_Y + dy, SCREEN_Z + 0.06);
      scene.add(bar);
    }

    /* Curtains flanking the screen, folded. Boxes rather than cloth simulation: at this distance the
       silhouette and the vertical rhythm of the folds are the whole read. */
    for (const mirror of [-1, 1]) {
      const body = box(2.4, 13, 0.5, C_CURTAIN, 0.95);
      body.position.set(mirror * (SCREEN_W / 2 + 1.7), 5.5, SCREEN_Z + 0.35);
      scene.add(body);
      for (let i = 0; i < 7; i++) {
        const fold = box(0.22, 13, 0.14, 0x350c16, 0.98);
        fold.position.set(mirror * (SCREEN_W / 2 + 0.75 + i * 0.4), 5.5, SCREEN_Z + 0.62);
        scene.add(fold);
      }
    }

    /* ---- the stalls ---------------------------------------------------------------------------
       Rows of seat backs between the viewer and the screen, raked so the far rows sit lower in the
       frame. They are near-black on purpose: this is the foreground of a shot, so it reads as
       silhouette rather than as furniture, and nothing competes with the screen. */
    const seatMat = keep(new THREE.MeshStandardMaterial({ color: C_SEAT, roughness: 0.92 }));
    const seatBackGeo = keep(new THREE.BoxGeometry(1.15, 1.05, 0.32));
    const seatTopGeo = keep(new THREE.CylinderGeometry(0.16, 0.16, 1.15, 10));
    const armGeo = keep(new THREE.BoxGeometry(0.16, 0.5, 0.8));

    /* The rake was solved, not guessed. The first pass put the front row at z -1.6, barely three
       units from the camera and below eye line, which threw it thousands of pixels below the frame:
       rows 0 to 2 were not on screen at all and 3 and 4 showed a 45px sliver. These values put all
       five rows in shot at every viewport, stacked just under the screen and never reaching into the
       overlay's content area. */
    const ROWS = 5;
    for (let r = 0; r < ROWS; r++) {
      const z = -4.2 - r * 2.2;
      const y = 0.05 - r * 0.26; // the stalls floor slopes down toward the screen
      const seatsInRow = 13;
      for (let i = 0; i < seatsInRow; i++) {
        const x = (i - (seatsInRow - 1) / 2) * 1.45 + (rnd() - 0.5) * 0.05;
        const back = new THREE.Mesh(seatBackGeo, seatMat);
        back.position.set(x, y + 0.9, z);
        scene.add(back);
        const top = new THREE.Mesh(seatTopGeo, seatMat);
        top.rotation.z = Math.PI / 2;
        top.position.set(x, y + 1.45, z);
        scene.add(top);
        if (i % 1 === 0) {
          const arm = new THREE.Mesh(armGeo, seatMat);
          arm.position.set(x + 0.72, y + 0.75, z + 0.18);
          scene.add(arm);
        }
      }
    }

    /* ---- the beam, from the booth behind and above ---- */
    const lens = new THREE.Vector3(0, 8.6, SCREEN_Z + camDist + 3.2);
    const target = new THREE.Vector3(0, SCREEN_Y, SCREEN_Z);
    const throwLen = lens.distanceTo(target);
    const farR = Math.hypot(SCREEN_W, SCREEN_H) / 2;

    /* The shaft is TRUNCATED, not a full cone, and this matters. A projector sits behind the
       audience, so a cone with its apex at the lens has the camera standing inside it: the far wall
       then fills the frame as a huge triangular wash and the dust nearest the lens renders as big
       white squares scattered over everything. Starting the shaft in front of the camera fixes both,
       and it is also what you actually see in a cinema, which is a beam passing overhead. */
    const T0 = 0.35; // where along the throw the visible shaft begins
    const beamStart = lens.clone().lerp(target, T0);
    const visLen = beamStart.distanceTo(target);
    // radiusTop is the screen end, radiusBottom the near end; a cone's radius grows linearly
    const beamGeo = keep(new THREE.CylinderGeometry(farR * T0, farR, visLen, 44, 20, true));
    {
      // vertex colours fade the shaft along its length, hottest where it leaves the lens
      const pos = beamGeo.getAttribute("position");
      const col = new Float32Array(pos.count * 3);
      const c = new THREE.Color(0xffc98a);
      for (let i = 0; i < pos.count; i++) {
        const t = (pos.getY(i) + visLen / 2) / visLen; // 1 at the near end, nearest the lens
        const k = 0.1 + 0.9 * t * t;
        col[i * 3] = c.r * k;
        col[i * 3 + 1] = c.g * k;
        col[i * 3 + 2] = c.b * k;
      }
      beamGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    }
    const beamMat = keep(
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const beam = new THREE.Mesh(beamGeo, beamMat);
    // local +Y is the narrow end, so it points back toward the lens
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lens.clone().sub(target).normalize());
    beam.position.copy(beamStart).lerp(target, 0.5);
    scene.add(beam);

    /* Dust in the shaft, generated inside the cone: pick a distance along the throw first, then a
       radius scaled to the cone's width there, so nothing floats outside the beam. */
    const DUST = 420;
    const dustPos = new Float32Array(DUST * 3);
    const dustSeed = new Float32Array(DUST);
    const along = new THREE.Vector3().subVectors(target, lens).normalize();
    const sideA = new THREE.Vector3(0, 1, 0).cross(along).normalize();
    const sideB = new THREE.Vector3().crossVectors(along, sideA).normalize();
    for (let i = 0; i < DUST; i++) {
      const t = T0 + rnd() * (1 - T0); // never behind or beside the camera
      const r = Math.sqrt(rnd()) * farR * t;
      const a = rnd() * Math.PI * 2;
      const p = lens
        .clone()
        .addScaledVector(along, t * throwLen)
        .addScaledVector(sideA, Math.cos(a) * r)
        .addScaledVector(sideB, Math.sin(a) * r);
      dustPos.set([p.x, p.y, p.z], i * 3);
      dustSeed[i] = rnd() * Math.PI * 2;
    }
    const dustGeo = keep(new THREE.BufferGeometry());
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = keep(
      new THREE.PointsMaterial({
        color: 0xffe6bb,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    scene.add(new THREE.Points(dustGeo, dustMat));

    /* ---- lighting: dim house, the screen doing most of the work ---- */
    scene.add(new THREE.AmbientLight(0x2c2038, 0.85));
    scene.add(new THREE.HemisphereLight(0x6b3fa0, 0x0a0710, 0.4));

    const spill = new THREE.PointLight(0xffe3bb, 90, 34, 2);
    spill.position.set(0, SCREEN_Y, SCREEN_Z + 3.4); // the screen washing back over the stalls
    scene.add(spill);

    const sconces: THREE.PointLight[] = [];
    for (const side of [-1, 1])
      for (const z of [-4, -10]) {
        const l = new THREE.PointLight(C_GOLD, 26, 13, 2);
        l.position.set(side * 12.4, 4.6, z);
        scene.add(l);
        sconces.push(l);
        const shade = box(0.3, 0.9, 0.5, 0x2a1f16, 0.9);
        shade.position.set(side * 13.0, 4.6, z);
        scene.add(shade);
      }

    /* ---- sizing, the frustum shift, and reporting the screen's rect ---- */
    const corners = [
      new THREE.Vector3(-SCREEN_W / 2, SCREEN_Y - SCREEN_H / 2, SCREEN_Z),
      new THREE.Vector3(SCREEN_W / 2, SCREEN_Y - SCREEN_H / 2, SCREEN_Z),
      new THREE.Vector3(-SCREEN_W / 2, SCREEN_Y + SCREEN_H / 2, SCREEN_Z),
      new THREE.Vector3(SCREEN_W / 2, SCREEN_Y + SCREEN_H / 2, SCREEN_Z),
    ];
    const _v = new THREE.Vector3();
    const reportRect = (w: number, h: number) => {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const c of corners) {
        _v.copy(c).project(camera);
        const sx = ((_v.x + 1) / 2) * w;
        const sy = ((1 - _v.y) / 2) * h;
        minX = Math.min(minX, sx);
        maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy);
        maxY = Math.max(maxY, sy);
      }
      rectRef.current({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
    };

    let lastW = -1;
    let lastH = -1;
    const applySize = () => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      if (w < 2 || h < 2) return; // never cache a zero: the buffer would stay stuck at it
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      camera.aspect = w / h;
      camera.fov = FOV; // fixed, always

      // step back far enough that the screen fits both ways, and no further
      camDist = Math.max(distForHeight, distForWidth(w / h));
      camera.position.set(0, EYE_Y, SCREEN_Z + camDist);
      camera.updateProjectionMatrix();

      /* Where the screen's centre would land with no offset, then shift the frustum so it lands at
         TARGET_CY instead. A positive y offset moves the image up, so the sign is currentFrac minus
         target. This is the whole "looking up at the screen" effect, done without pitching. */
      const visH = 2 * camDist * Math.tan((FOV * Math.PI) / 360);
      const currentFrac = 0.5 - (SCREEN_Y - EYE_Y) / visH;
      camera.setViewOffset(w, h, 0, (currentFrac - TARGET_CY) * h, w, h);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true); // the camera moved, so reportRect must project from the new one

      renderer.setSize(w, h, false);
      reportRect(w, h);
    };
    applySize();
    window.addEventListener("resize", applySize);

    /* ---- loop ---- */
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      // delta first: getElapsedTime() calls getDelta() internally and would zero it out
      const delta = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      // a projector lamp is never perfectly steady, and a static beam looks like a decal
      const flick = 1 + Math.sin(t * 6.7) * 0.03 + Math.sin(t * 2.3) * 0.045;
      beamMat.opacity = 0.13 * flick;
      dustMat.opacity = 0.4 * flick;
      spill.intensity = 90 * flick;
      screenMat.emissiveIntensity = 0.34 * flick;
      for (let i = 0; i < sconces.length; i++) {
        sconces[i].intensity = 26 * (1 + Math.sin(t * 1.7 + i * 1.9) * 0.09);
      }

      // dust drifts up the shaft and wraps, so it never runs out
      const pos = dustGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < DUST; i++) {
        const y = pos.getY(i) + delta * (0.05 + (dustSeed[i] % 1) * 0.06);
        pos.setY(i, y > SCREEN_Y + SCREEN_H / 2 ? 0.4 : y);
        pos.setX(i, pos.getX(i) + Math.sin(t * 0.45 + dustSeed[i]) * delta * 0.03);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    };

    if (reduce) renderer.render(scene, camera);
    else raf = requestAnimationFrame(tick);

    const onVis = () => {
      if (reduce) return;
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        running = true;
        clock.getDelta(); // drop the hidden time, or everything jumps on resume
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", applySize);
      document.removeEventListener("visibilitychange", onVis);
      for (const k of kept) k.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hall-canvas" />;
}
