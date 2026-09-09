"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The cinema backroom behind the Contact page.
 *
 * WHY THE CAMERA NEVER MOVES. The projected content is DOM, not WebGL, laid over the screen's
 * projected rectangle. Real links, real routing, real focus order, and type that stays crisp at any
 * size, none of which a canvas texture gives you. That only holds while the screen projects to an
 * actual rectangle, so the camera sits on the screen's axis and stays there.
 *
 * THE FRAMING IS SOLVED, NOT EYEBALLED. The camera distance is derived from how much of the frame
 * the screen should fill (SCREEN_FILL), and every prop is then placed either side of the screen's
 * horizontal extent so nothing ever covers the projected content. That is why the projector sits
 * off-axis at the right and the table sits low at the left: dead centre would put the projector's
 * body on top of the thing it is projecting.
 *
 * THE BEAM is an open cone with additive blending, not a light. A real spotlight needs shadow maps
 * and a volumetric pass to show its shaft at all; the cone IS the visible shaft. Its apex is at the
 * lens and its base at the screen, and vertex colours fade it along its length so it is hottest
 * where it leaves the glass. A SpotLight at the same point does the actual illuminating and casts
 * the real shadows.
 */

/* ---- the screen, and the framing solved from it ---- */
const SCREEN_W = 7.4;
const SCREEN_H = 4.2;
const SCREEN_Z = -6;
const SCREEN_Y = 2.4;
const SCREEN_FILL = 0.48; // fraction of the frame's height the screen occupies
/* The frustum is shifted right by this fraction of the width, which slides the whole scene left and
   frees the right third of the frame for the projector. Shifting the FRUSTUM rather than moving the
   camera sideways is the point: the screen stays parallel to the image plane, so it still projects
   to a true rectangle and the DOM overlay still lands on it exactly. Both the fill and the shift,
   and the prop positions below, were solved against the overlay's content box rather than eyeballed. */
const VIEW_SHIFT = 0.156;
const FOV = 52;

/* Palette: the site's own. */
const C_DARK = 0x0d0812;
const C_WALL = 0x1c1219;
const C_PURPLE = 0x6b3fa0;
const C_GOLD = 0xd8ad5c;
const C_BURGUNDY = 0x5e1f2b;
const C_BRONZE = 0x9a6636;

/* Where the props go. Solved against the screen's horizontal extent so none of them overlap it. */
const PROJ = { x: 3.5, z: -1.7 };
const TABLE = { x: -3.9, z: -3.9 };

export type ScreenRect = { x: number; y: number; w: number; h: number };
export type Pick = "projector" | "cds";

type Props = {
  on: boolean;
  onScreenRect: (r: ScreenRect | null) => void;
  onPick: (what: Pick) => void;
};

export default function ContactRoom({ on, onScreenRect, onPick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef(onScreenRect);
  const pickRef = useRef(onPick);
  const onRef = useRef(on);
  rectRef.current = onScreenRect;
  pickRef.current = onPick;
  onRef.current = on;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      rectRef.current(null); // no WebGL: the page falls back to a plain centred layout
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(C_DARK, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x160e1a, 0.038);

    /* Camera distance from the fill fraction: visible height at distance d is 2*d*tan(fov/2), and
       we want SCREEN_H to be SCREEN_FILL of it. */
    const camDist = SCREEN_H / SCREEN_FILL / (2 * Math.tan((FOV * Math.PI) / 360));
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
    camera.position.set(0, SCREEN_Y, SCREEN_Z + camDist);
    camera.lookAt(0, SCREEN_Y, SCREEN_Z);

    const kept: { dispose(): void }[] = [];
    const keep = <T extends { dispose(): void }>(x: T) => {
      kept.push(x);
      return x;
    };

    const box = (w: number, h: number, d: number, color: number, rough = 0.85, metal = 0) =>
      new THREE.Mesh(
        keep(new THREE.BoxGeometry(w, h, d)),
        keep(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }))
      );

    /* Deterministic pseudo-random, so the room and its textures are the same every load and are
       something you can actually tune rather than reroll. */
    let seed = 20260825;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const mkTex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void, rx = 1, ry = 1) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      paint(c.getContext("2d")!);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      return keep(t);
    };

    /* ---- wooden floor: planks, grain, end joints, walked-on wear ---- */
    const floorTex = mkTex(
      512,
      512,
      (g) => {
        g.fillStyle = "#4a3320";
        g.fillRect(0, 0, 512, 512);
        const PLANK = 64;
        for (let row = 0; row < 8; row++) {
          const s = 34 + rnd() * 30;
          g.fillStyle = `rgb(${s + 44}, ${s + 22}, ${s})`;
          g.fillRect(0, row * PLANK, 512, PLANK - 2);
          for (let i = 0; i < 34; i++) {
            g.strokeStyle = `rgba(28,16,6,${0.05 + rnd() * 0.09})`;
            g.lineWidth = 0.6 + rnd() * 1.3;
            g.beginPath();
            const y = row * PLANK + rnd() * PLANK;
            g.moveTo(0, y);
            g.bezierCurveTo(170, y + (rnd() - 0.5) * 6, 340, y + (rnd() - 0.5) * 6, 512, y);
            g.stroke();
          }
          // knots: a couple of tight ellipse clusters per plank sell it as timber
          if (rnd() < 0.7) {
            const kx = rnd() * 512;
            const ky = row * PLANK + PLANK / 2;
            for (let r = 3; r < 16; r += 2.4) {
              g.strokeStyle = `rgba(30,17,7,${0.3 - r * 0.014})`;
              g.lineWidth = 1.1;
              g.beginPath();
              g.ellipse(kx, ky, r, r * 0.55, 0.4, 0, Math.PI * 2);
              g.stroke();
            }
          }
          g.fillStyle = "rgba(0,0,0,0.6)";
          g.fillRect(0, row * PLANK + PLANK - 2, 512, 2);
          g.fillRect(rnd() * 512, row * PLANK, 2, PLANK);
        }
        for (let i = 0; i < 46; i++) {
          const x = rnd() * 512;
          const y = rnd() * 512;
          const r = 20 + rnd() * 70;
          const rg = g.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, `rgba(176,138,94,${0.06 + rnd() * 0.12})`);
          rg.addColorStop(1, "rgba(176,138,94,0)");
          g.fillStyle = rg;
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
      },
      8,
      8
    );

    const floor = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(48, 48)),
      keep(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.78, metalness: 0.05 }))
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ---- walls and ceiling ---- */
    const backWall = box(38, 15, 0.4, C_WALL);
    backWall.position.set(0, 7.5, SCREEN_Z - 0.6);
    backWall.receiveShadow = true;
    scene.add(backWall);
    for (const side of [-1, 1]) {
      const w = box(0.4, 15, 34, C_WALL);
      w.position.set(side * 10.5, 7.5, -4);
      scene.add(w);
    }
    const ceil = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(38, 38)),
      keep(new THREE.MeshStandardMaterial({ color: 0x140d19, roughness: 0.95 }))
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 6.4;
    scene.add(ceil);
    for (let i = 0; i < 7; i++) {
      const bar = box(24, 0.26, 0.34, 0x281d31, 0.8, 0.3);
      bar.position.set(0, 6.2, -8 + i * 2.4);
      scene.add(bar);
    }

    /* ---- background shelving: uprights, shelves, bolts, boxed stock ---- */
    const rackMat = keep(new THREE.MeshStandardMaterial({ color: 0x342839, roughness: 0.45, metalness: 0.72 }));
    const boltMat = keep(new THREE.MeshStandardMaterial({ color: 0x8f8598, roughness: 0.3, metalness: 0.9 }));
    const uprightGeo = keep(new THREE.BoxGeometry(0.12, 4.2, 0.12));
    const shelfGeo = keep(new THREE.BoxGeometry(3.9, 0.08, 1.0));
    const boltGeo = keep(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8));
    const stockGeo = keep(new THREE.BoxGeometry(0.56, 0.4, 0.72));
    const stockMats = [
      keep(new THREE.MeshStandardMaterial({ color: 0x4a3527, roughness: 0.9 })),
      keep(new THREE.MeshStandardMaterial({ color: C_BURGUNDY, roughness: 0.85 })),
      keep(new THREE.MeshStandardMaterial({ color: 0x372b42, roughness: 0.85 })),
    ];
    for (const [rx, rz] of [
      [-7.8, -6.1],
      [7.8, -6.1],
    ] as [number, number][]) {
      const rack = new THREE.Group();
      rack.position.set(rx, 0, rz);
      rack.rotation.y = rx < 0 ? 0.2 : -0.2;
      for (const ux of [-1.9, 1.9])
        for (const uz of [-0.45, 0.45]) {
          const u = new THREE.Mesh(uprightGeo, rackMat);
          u.position.set(ux, 2.1, uz);
          rack.add(u);
        }
      for (let s = 0; s < 4; s++) {
        const y = 0.42 + s * 1.1;
        const sh = new THREE.Mesh(shelfGeo, rackMat);
        sh.position.y = y;
        rack.add(sh);
        // bolts where each shelf meets each upright: the detail that reads as industrial
        for (const bx of [-1.9, 1.9])
          for (const bz of [-0.45, 0.45]) {
            const b = new THREE.Mesh(boltGeo, boltMat);
            b.rotation.z = Math.PI / 2;
            b.position.set(bx, y, bz);
            rack.add(b);
          }
        for (let k = 0; k < 5; k++) {
          if (rnd() < 0.34) continue; // gaps, or it reads as a solid wall of crates
          const st = new THREE.Mesh(stockGeo, stockMats[Math.floor(rnd() * stockMats.length)]);
          st.position.set(-1.5 + k * 0.78, y + 0.24, (rnd() - 0.5) * 0.24);
          st.rotation.y = (rnd() - 0.5) * 0.22;
          rack.add(st);
        }
      }
      scene.add(rack);
    }

    /* ---- the projection surface ------------------------------------------------------------
       Off-white with a woven canvas texture, not flat pure white: a real screen has a visible
       weave and picks up the grade of whatever is thrown at it. */
    const weaveTex = mkTex(
      256,
      256,
      (g) => {
        g.fillStyle = "#e6dcc9";
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 256; i += 3) {
          g.fillStyle = "rgba(120,106,86,0.10)";
          g.fillRect(i, 0, 1.4, 256); // warp
          g.fillRect(0, i, 256, 1.4); // weft
        }
        // faint mottling, so the weave is not a perfectly even screen door
        for (let i = 0; i < 90; i++) {
          const x = rnd() * 256;
          const y = rnd() * 256;
          const r = 8 + rnd() * 26;
          const rg = g.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, `rgba(150,136,112,${0.03 + rnd() * 0.05})`);
          rg.addColorStop(1, "rgba(150,136,112,0)");
          g.fillStyle = rg;
          g.fillRect(x - r, y - r, r * 2, r * 2);
        }
      },
      10,
      6
    );

    const screenMat = keep(
      new THREE.MeshStandardMaterial({
        map: weaveTex,
        color: 0xdcd2bf, // off-white; pure white blows out the moment the beam lands
        roughness: 0.96,
        metalness: 0,
        emissive: new THREE.Color(0xbfae94),
        emissiveIntensity: 0.05,
      })
    );
    const screen = new THREE.Mesh(keep(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat);
    screen.position.set(0, SCREEN_Y, SCREEN_Z);
    screen.receiveShadow = true;
    scene.add(screen);

    // a dark surround and a hanging bar, so the lit rectangle has a defined edge and a reason to be there
    const surround = box(SCREEN_W + 0.4, SCREEN_H + 0.4, 0.1, 0x0b0710, 0.95);
    surround.position.set(0, SCREEN_Y, SCREEN_Z - 0.11);
    scene.add(surround);
    const railBar = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(0.08, 0.08, SCREEN_W + 0.9, 14)),
      rackMat
    );
    railBar.rotation.z = Math.PI / 2;
    railBar.position.set(0, SCREEN_Y + SCREEN_H / 2 + 0.34, SCREEN_Z - 0.05);
    scene.add(railBar);

    /* A halo behind the screen: an oversized additive plane, only visible with the projector on.
       Bloom would mean a whole post-processing chain for one soft edge; this is the same look for
       one draw call. */
    const haloTex = mkTex(256, 256, (g) => {
      const rg = g.createRadialGradient(128, 128, 18, 128, 128, 128);
      rg.addColorStop(0, "rgba(255,226,178,0.9)");
      rg.addColorStop(0.45, "rgba(255,205,140,0.3)");
      rg.addColorStop(1, "rgba(255,190,120,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, 256, 256);
    });
    haloTex.wrapS = haloTex.wrapT = THREE.ClampToEdgeWrapping;
    const haloMat = keep(
      new THREE.MeshBasicMaterial({
        map: haloTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const halo = new THREE.Mesh(keep(new THREE.PlaneGeometry(SCREEN_W * 1.9, SCREEN_H * 2.1)), haloMat);
    halo.position.set(0, SCREEN_Y, SCREEN_Z + 0.06);
    scene.add(halo);

    /* ---- the table and the film cases on it --------------------------------------------------
       This whole group is one pick target. Clicking any case, or the table under them, opens the
       carousel: hitting a single 5cm case exactly is not a fair thing to ask of a pointer. */
    const cdPick = new THREE.Group();
    cdPick.position.set(TABLE.x, 0, TABLE.z);
    cdPick.rotation.y = 0.42;
    scene.add(cdPick);

    // the table reuses the floor's plank texture at a different repeat: same timber, different cut
    const tableMap = floorTex.clone();
    tableMap.repeat.set(2, 1.1);
    tableMap.needsUpdate = true;
    keep(tableMap);
    const woodMat = keep(new THREE.MeshStandardMaterial({ map: tableMap, roughness: 0.66, metalness: 0.05 }));

    const tableTop = new THREE.Mesh(keep(new THREE.BoxGeometry(3.0, 0.13, 1.7)), woodMat);
    tableTop.position.y = 0.86;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    cdPick.add(tableTop);
    // a chamfered lip under the top, which is what stops it reading as a floating slab
    const lip = box(3.06, 0.06, 1.76, 0x33220f, 0.8);
    lip.position.y = 0.78;
    cdPick.add(lip);
    for (const lx of [-1.3, 1.3])
      for (const lz of [-0.66, 0.66]) {
        const leg = box(0.16, 0.8, 0.16, 0x3a2614, 0.82);
        leg.position.set(lx, 0.4, lz);
        leg.castShadow = true;
        cdPick.add(leg);
      }
    const stretcher = box(2.6, 0.09, 0.09, 0x3a2614, 0.82);
    stretcher.position.set(0, 0.26, 0);
    cdPick.add(stretcher);

    /* The cases live in their own group so the bob and the hover glow apply to them alone. Bobbing
       the whole pick group would float the table off the floor. */
    const cdStack = new THREE.Group();
    cdPick.add(cdStack);

    /* Cases, with a thin disc edge peeking out of every few: that gold/iridescent sliver is what
       makes a pile of boxes read as a pile of discs. */
    const caseGeo = keep(new THREE.BoxGeometry(0.78, 0.075, 0.7));
    /* Lighter than the room around them, with a gold emissive held at zero until hover. Dark cases
       on a dark table read as one lump however well lit they are; the value step is what separates
       each case edge. */
    const mkCase = (color: number, rough: number, metal: number) =>
      keep(
        new THREE.MeshStandardMaterial({
          color,
          roughness: rough,
          metalness: metal,
          emissive: new THREE.Color(C_GOLD),
          emissiveIntensity: 0,
        })
      );
    const caseMats = [
      mkCase(0x4a3663, 0.42, 0.15),
      mkCase(0x352548, 0.48, 0.12),
      mkCase(0x7d2c3c, 0.44, 0.15),
      mkCase(0x574073, 0.44, 0.15),
    ];
    const discGeo = keep(new THREE.CylinderGeometry(0.34, 0.34, 0.006, 32));
    const discMats = [
      keep(new THREE.MeshStandardMaterial({ color: 0xe6c079, roughness: 0.08, metalness: 1 })),
      keep(new THREE.MeshStandardMaterial({ color: 0xa9d8e8, roughness: 0.06, metalness: 1 })),
      keep(new THREE.MeshStandardMaterial({ color: 0xd7a7e0, roughness: 0.07, metalness: 1 })),
    ];
    /* Titled spines. One texture holds all four titles stacked, and each spine samples its own row
       through repeat/offset, so four readable labels cost one 256x256 upload instead of four. */
    const FILM_TITLES = ["LA LA LAND", "ARRIVAL", "ROCKSTAR", "REQUIEM"];
    const spineTex = mkTex(512, 256, (g) => {
      g.fillStyle = "#1a1220";
      g.fillRect(0, 0, 512, 256);
      FILM_TITLES.forEach((t, i) => {
        const y = i * 64;
        g.fillStyle = i % 2 ? "#241831" : "#1d1426";
        g.fillRect(0, y, 512, 62);
        g.fillStyle = "#e8c98a";
        g.font = '600 30px "JetBrains Mono", ui-monospace, monospace';
        g.textBaseline = "middle";
        g.fillText(t, 18, y + 32);
        g.fillStyle = "rgba(216,173,92,0.5)";
        g.fillRect(0, y + 60, 512, 2);
      });
    });
    spineTex.wrapS = spineTex.wrapT = THREE.ClampToEdgeWrapping;
    const spineGeo = keep(new THREE.BoxGeometry(0.78, 0.05, 0.03));
    const spineMats = FILM_TITLES.map((_, i) => {
      const m = spineTex.clone();
      m.repeat.set(1, 0.25);
      m.offset.set(0, 1 - 0.25 * (i + 1));
      m.needsUpdate = true;
      keep(m);
      return keep(
        new THREE.MeshStandardMaterial({
          map: m,
          roughness: 0.35,
          emissive: new THREE.Color(C_GOLD),
          emissiveIntensity: 0.3,
        })
      );
    });

    for (const [sx, sz, n] of [
      [-0.62, 0.06, 10],
      [0.66, -0.18, 7],
    ] as [number, number, number][]) {
      for (let i = 0; i < n; i++) {
        const y = 0.94 + i * 0.082;
        const c = new THREE.Mesh(caseGeo, caseMats[i % caseMats.length]);
        c.position.set(sx + (rnd() - 0.5) * 0.07, y, sz + (rnd() - 0.5) * 0.07);
        c.rotation.y = (rnd() - 0.5) * 0.26;
        c.castShadow = true;
        cdStack.add(c);
        if (i % 2 === 0) {
          // a disc slid part way out, showing its edge
          const d = new THREE.Mesh(discGeo, discMats[i % discMats.length]);
          d.position.set(c.position.x + 0.2, y + 0.005, c.position.z + 0.16);
          d.rotation.y = c.rotation.y;
          cdStack.add(d);
        }
        if (i % 2 === 1) {
          const sp = new THREE.Mesh(spineGeo, spineMats[(i >> 1) % spineMats.length]);
          sp.position.set(c.position.x, y, c.position.z + 0.35);
          sp.rotation.y = c.rotation.y;
          cdStack.add(sp);
        }
      }
    }
    // one case fanned off the pile, so it reads as handled rather than stocked
    const loose = new THREE.Mesh(caseGeo, caseMats[2]);
    loose.position.set(0.12, 0.935, 0.62);
    loose.rotation.set(0, 0.95, 0.03);
    loose.castShadow = true;
    cdStack.add(loose);

    /* A small warm practical directly over the table. Without it the cases sit in the room's
       shadow side and read as one dark lump; this is what separates their edges. */
    const cdLight = new THREE.PointLight(0xffd9a0, 26, 5.5, 2);
    cdLight.position.set(TABLE.x + 0.1, 2.5, TABLE.z + 0.6);
    scene.add(cdLight);

    /* The label. Elegant rather than loud: it is the only thing telling you the stack is a control,
       so it says so quietly and brightens with the stack on hover. */
    const cdLabelTex = mkTex(512, 128, (g) => {
      g.clearRect(0, 0, 512, 128);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowColor = "rgba(255,214,140,0.9)";
      g.shadowBlur = 18;
      g.fillStyle = "#f0d49a";
      g.font = '500 40px "Bodoni Moda", Didot, serif';
      g.fillText("My Films", 256, 40);
      g.shadowBlur = 0;
      g.fillStyle = "rgba(240,212,154,0.7)";
      g.font = '400 21px "JetBrains Mono", ui-monospace, monospace';
      g.fillText("CLICK TO EXPLORE", 256, 88);
    });
    cdLabelTex.wrapS = cdLabelTex.wrapT = THREE.ClampToEdgeWrapping;
    const cdLabelMat = keep(
      new THREE.SpriteMaterial({ map: cdLabelTex, transparent: true, depthWrite: false, opacity: 0.7 })
    );
    const cdLabel = new THREE.Sprite(cdLabelMat);
    cdLabel.scale.set(1.9, 0.48, 1);
    cdLabel.position.set(TABLE.x + 0.1, 2.05, TABLE.z + 0.5);
    scene.add(cdLabel);

    /* ---- film reels with spilling tape -------------------------------------------------------
       The tape is a TubeGeometry swept along a CatmullRom curve that leaves the reel, loops, and
       settles on the floor. The spooling illusion is a scrolling stripe texture on that tube, not
       moving geometry: rebuilding a tube every frame would regenerate a few thousand vertices sixty
       times a second to say something a texture offset says for free. */
    const tapeTex = mkTex(
      128,
      32,
      (g) => {
        g.fillStyle = "#cfa76a";
        g.fillRect(0, 0, 128, 32);
        // sprocket perforations down both edges: what makes it read as film and not ribbon
        g.fillStyle = "rgba(34,20,10,0.78)";
        for (let i = 0; i < 8; i++) {
          g.fillRect(i * 16 + 5, 2, 7, 5);
          g.fillRect(i * 16 + 5, 25, 7, 5);
        }
        g.fillStyle = "rgba(70,44,22,0.55)";
        for (let i = 0; i < 8; i++) g.fillRect(i * 16, 9, 2, 14);
        // faint frame imagery, so the middle band is not blank
        for (let i = 0; i < 8; i++) {
          g.fillStyle = `rgba(${90 + rnd() * 70},${60 + rnd() * 50},${30 + rnd() * 40},0.3)`;
          g.fillRect(i * 16 + 4, 12, 9, 8);
        }
      },
      14,
      1
    );

    // brushed bronze with patina: a lengthwise brush streak plus green-grey bloom in the crevices
    const bronzeTex = mkTex(256, 256, (g) => {
      g.fillStyle = "#9a6636";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) {
        g.strokeStyle = `rgba(${rnd() < 0.5 ? "255,214,160" : "70,42,20"},${0.03 + rnd() * 0.07})`;
        g.lineWidth = 0.5 + rnd();
        const y = rnd() * 256;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(256, y + (rnd() - 0.5) * 3);
        g.stroke();
      }
      for (let i = 0; i < 40; i++) {
        const x = rnd() * 256;
        const y = rnd() * 256;
        const r = 6 + rnd() * 26;
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, `rgba(96,124,102,${0.08 + rnd() * 0.16})`); // verdigris
        rg.addColorStop(1, "rgba(96,124,102,0)");
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });

    const reelBodyMat = keep(
      new THREE.MeshStandardMaterial({ map: bronzeTex, color: 0xffffff, roughness: 0.29, metalness: 0.92 })
    );

    type Reel = { group: THREE.Group; hub: THREE.Group; tape: THREE.Mesh; phase: number; spin: number };
    const reels: Reel[] = [];

    const makeReel = (x: number, z: number, scale: number, rotY: number, spin: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotY;
      group.scale.setScalar(scale);

      // the spinning part is a child, so the group can sway without fighting the spin
      const hub = new THREE.Group();
      hub.rotation.z = Math.PI / 2; // stand the disc on its edge
      hub.position.y = 0.66;
      group.add(hub);

      for (const dy of [-0.06, 0.06]) {
        const flange = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.64, 0.64, 0.018, 44)), reelBodyMat);
        flange.position.y = dy;
        flange.castShadow = true;
        hub.add(flange);
        // a raised rim around each flange
        const rim = new THREE.Mesh(keep(new THREE.TorusGeometry(0.63, 0.022, 8, 44)), reelBodyMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = dy;
        hub.add(rim);
      }
      const core = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 26)), reelBodyMat);
      hub.add(core);
      const wound = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.52, 0.52, 0.11, 44, 1, true)),
        keep(new THREE.MeshStandardMaterial({ color: 0x5a3f24, roughness: 0.82, side: THREE.DoubleSide }))
      );
      hub.add(wound);
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(keep(new THREE.BoxGeometry(0.08, 0.14, 0.48)), reelBodyMat);
        spoke.rotation.y = (s / 5) * Math.PI * 2;
        hub.add(spoke);
      }

      /* The spilled tape. Control points fall away from the reel and pool on the floor; the curve is
         closed back toward the reel so the ribbon has no cut end hanging in mid air. */
      const curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0.0, 0.66, 0.64),
          new THREE.Vector3(0.6, 0.54, 1.02),
          new THREE.Vector3(1.25, 0.17, 0.76),
          new THREE.Vector3(1.46, 0.05, -0.06),
          new THREE.Vector3(0.92, 0.06, -0.66),
          new THREE.Vector3(0.11, 0.11, -0.76),
          new THREE.Vector3(-0.38, 0.36, -0.33),
          new THREE.Vector3(-0.22, 0.62, 0.27),
        ],
        true,
        "catmullrom",
        0.4
      );
      const tapeMap = tapeTex.clone();
      tapeMap.needsUpdate = true;
      keep(tapeMap);
      const tape = new THREE.Mesh(
        keep(new THREE.TubeGeometry(curve, 140, 0.065, 3, true)),
        keep(
          new THREE.MeshStandardMaterial({
            map: tapeMap,
            color: 0xe8cfa0,
            roughness: 0.55,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          })
        )
      );
      tape.castShadow = true;
      group.add(tape);

      scene.add(group);
      const r: Reel = { group, hub, tape, phase: rnd() * Math.PI * 2, spin };
      reels.push(r);
      return r;
    };

    makeReel(5.2, -5.8, 1.6, -0.9, 0.5);
    makeReel(4.2, -4.4, 1.2, 2.1, -0.55);
    makeReel(-5.0, -5.8, 1.4, 0.55, 0.62);

    /* ---- vintage equipment silhouettes: shapes in the dark, no detail ---- */
    for (const [sx, sz, sh] of [
      [-6.6, -6.1, 2.1],
      [6.9, -6.1, 1.8],
    ] as [number, number, number][]) {
      const sil = box(1.2, sh, 0.9, 0x1a1220, 0.95);
      sil.position.set(sx, sh / 2, sz);
      sil.rotation.y = rnd();
      scene.add(sil);
      const cap = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.34, 0.4, 0.4, 16)), reelBodyMat);
      cap.position.set(sx, sh + 0.2, sz);
      scene.add(cap);
    }

    /* ---- the projector -----------------------------------------------------------------------
       Off-axis at the right, not dead centre. Dead centre would put its body between the camera and
       the middle of the projection surface, i.e. on top of the content it exists to project. */
    const projPick = new THREE.Group();
    projPick.position.set(PROJ.x, 0, PROJ.z);
    // aim the group's local +X at the screen centre
    projPick.rotation.y = Math.atan2(-(SCREEN_Z - PROJ.z), 0 - PROJ.x);
    scene.add(projPick);

    const steelMat = keep(new THREE.MeshStandardMaterial({ color: 0x2a2231, roughness: 0.34, metalness: 0.82 }));

    /* Tripod: thick splayed legs with visible joints, knurled adjustment knobs, and a spreader. */
    const LEG_LEN = 1.45;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const dirX = Math.cos(a);
      const dirZ = Math.sin(a);

      const upper = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.075, 0.062, LEG_LEN, 14)), steelMat);
      upper.position.set(dirX * 0.3, LEG_LEN / 2 + 0.05, dirZ * 0.3);
      upper.rotation.z = -dirX * 0.38;
      upper.rotation.x = dirZ * 0.38;
      upper.castShadow = true;
      projPick.add(upper);

      // the lower extension, visibly a separate slimmer tube, with a clamp collar at the overlap
      const lower = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12)), steelMat);
      lower.position.set(dirX * 0.52, 0.22, dirZ * 0.52);
      lower.rotation.copy(upper.rotation);
      projPick.add(lower);

      const collar = new THREE.Mesh(keep(new THREE.TorusGeometry(0.085, 0.03, 8, 18)), boltMat);
      collar.position.set(dirX * 0.44, 0.46, dirZ * 0.44);
      collar.rotation.x = Math.PI / 2;
      projPick.add(collar);

      // knurled adjustment knob at the top joint
      const knob = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12)), boltMat);
      knob.position.set(dirX * 0.2, LEG_LEN * 0.94, dirZ * 0.2);
      knob.rotation.z = Math.PI / 2;
      projPick.add(knob);

      // rubber foot
      const foot = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 12)), keep(
        new THREE.MeshStandardMaterial({ color: 0x0f0b13, roughness: 0.95 })
      ));
      foot.position.set(dirX * 0.62, 0.04, dirZ * 0.62);
      projPick.add(foot);

      // spreader arm to the centre column
      const spread = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.028, 0.028, 0.56, 8)), steelMat);
      spread.position.set(dirX * 0.31, 0.42, dirZ * 0.31);
      spread.rotation.z = Math.PI / 2 - dirX * 0.2;
      spread.rotation.y = -a;
      projPick.add(spread);
    }

    const column = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.09, 0.09, 0.62, 16)), steelMat);
    column.position.y = 1.35;
    projPick.add(column);
    const head = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.2, 0.16, 0.12, 16)), steelMat);
    head.position.y = 1.7;
    projPick.add(head);
    // pan handle, angled back: the giveaway that this is a real mount
    const handle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.032, 0.026, 0.8, 10)), steelMat);
    handle.position.set(-0.34, 1.5, 0.18);
    handle.rotation.z = 0.75;
    projPick.add(handle);

    const projector = new THREE.Group();
    projector.position.y = 2.19; // solved so the spools top out at y=3.10, the framed height
    projPick.add(projector);

    /* Brushed black metal, weathered: a lengthwise brush grain, dust settled on the upper faces,
       and a few scuffs. A pure matte colour reads as plastic at this size. */
    const bodyTex = mkTex(512, 256, (g) => {
      g.fillStyle = "#1b1e22";
      g.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 1400; i++) {
        g.strokeStyle = `rgba(${rnd() < 0.5 ? "190,196,206" : "8,9,11"},${0.02 + rnd() * 0.06})`;
        g.lineWidth = 0.5 + rnd() * 0.9;
        const y = rnd() * 256;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(512, y + (rnd() - 0.5) * 2.5);
        g.stroke();
      }
      // dust and grime pooling
      for (let i = 0; i < 60; i++) {
        const x = rnd() * 512;
        const y = rnd() * 256;
        const r = 10 + rnd() * 46;
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, `rgba(142,130,110,${0.03 + rnd() * 0.07})`);
        rg.addColorStop(1, "rgba(142,130,110,0)");
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // scuffs down to bare metal at the edges
      for (let i = 0; i < 26; i++) {
        g.strokeStyle = `rgba(168,172,180,${0.06 + rnd() * 0.13})`;
        g.lineWidth = 0.7 + rnd() * 1.4;
        const x = rnd() * 512;
        const y = rnd() * 256;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + (rnd() - 0.5) * 40, y + (rnd() - 0.5) * 14);
        g.stroke();
      }
    });

    const bodyMat = keep(
      new THREE.MeshStandardMaterial({ map: bodyTex, color: 0xffffff, roughness: 0.38, metalness: 0.72 })
    );
    const body = new THREE.Mesh(keep(new THREE.BoxGeometry(1.75, 0.92, 1.1)), bodyMat);
    body.castShadow = true;
    projector.add(body);

    // bronze trim band and vent louvres
    const trim = new THREE.Mesh(keep(new THREE.BoxGeometry(1.79, 0.09, 1.14)), reelBodyMat);
    trim.position.y = 0.26;
    projector.add(trim);
    for (let i = 0; i < 6; i++) {
      const louvre = box(0.05, 0.44, 1.06, 0x0d0f12, 0.9);
      louvre.position.set(-0.72 + i * 0.09, -0.06, 0);
      projector.add(louvre);
    }

    /* Lens assembly: housing, threaded focus grooves, glass. */
    const lensHousing = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.3, 0.34, 0.52, 28)), steelMat);
    lensHousing.rotation.z = Math.PI / 2;
    lensHousing.position.set(1.05, 0.02, 0);
    lensHousing.castShadow = true;
    projector.add(lensHousing);
    // focus threads: a stack of thin rings, which is exactly what a focus barrel looks like
    for (let i = 0; i < 7; i++) {
      const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(0.305, 0.019, 6, 26)), steelMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(0.86 + i * 0.055, 0.02, 0);
      projector.add(ring);
    }
    const hood = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.34, 0.3, 0.1, 28)), reelBodyMat);
    hood.rotation.z = Math.PI / 2;
    hood.position.set(1.32, 0.02, 0);
    projector.add(hood);

    // glass-like: near-zero roughness and a dark tint, so it catches highlights and reads as glass
    const lensMat = keep(
      new THREE.MeshStandardMaterial({
        color: 0x1d1c27,
        roughness: 0.04,
        metalness: 0.4,
        emissive: new THREE.Color(0xffe6b8),
        emissiveIntensity: 0,
      })
    );
    const lens = new THREE.Mesh(keep(new THREE.CircleGeometry(0.27, 32)), lensMat);
    lens.rotation.y = Math.PI / 2;
    lens.position.set(1.37, 0.02, 0);
    projector.add(lens);

    /* The bulb, sitting behind the glass. The lens itself is dark and reflective, so without a hot
       source inside it the projector reads as switched off even with the beam running. */
    const bulbMat = keep(
      new THREE.MeshBasicMaterial({ color: 0xffcf7a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const bulb = new THREE.Mesh(keep(new THREE.SphereGeometry(0.19, 20, 14)), bulbMat);
    bulb.position.set(1.16, 0.02, 0);
    projector.add(bulb);

    // feed and take-up spools on top
    for (const dz of [-0.34, 0.34]) {
      const spool = new THREE.Mesh(keep(new THREE.TorusGeometry(0.4, 0.07, 10, 34)), reelBodyMat);
      spool.position.set(-0.2, 0.84, dz);
      spool.castShadow = true;
      projector.add(spool);
      const spindle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12)), steelMat);
      spindle.rotation.x = Math.PI / 2;
      spindle.position.set(-0.2, 0.84, dz);
      projector.add(spindle);
    }
    // knobs on the operator side
    for (const [kx, ky] of [
      [-0.6, 0.1],
      [-0.6, -0.16],
    ] as [number, number][]) {
      const knob = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 14)), boltMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(kx, ky, 0.57);
      projector.add(knob);
    }

    /* Power cord: a tube down a slack curve to the floor. A projector with no cable is a prop. */
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 2.2, 0.2),
      new THREE.Vector3(-1.3, 1.5, 0.5),
      new THREE.Vector3(-1.15, 0.75, 0.9),
      new THREE.Vector3(-1.45, 0.2, 1.35),
      new THREE.Vector3(-2.2, 0.06, 1.7),
      new THREE.Vector3(-3.4, 0.06, 1.4),
    ]);
    const cord = new THREE.Mesh(
      keep(new THREE.TubeGeometry(cordCurve, 60, 0.035, 8, false)),
      keep(new THREE.MeshStandardMaterial({ color: 0x0c0910, roughness: 0.85 }))
    );
    cord.castShadow = true;
    projPick.add(cord);

    // the slack coiled at the foot of the stand, where a real cable always ends up
    for (let i = 0; i < 4; i++) {
      const coil = new THREE.Mesh(
        keep(new THREE.TorusGeometry(0.3 + i * 0.055, 0.035, 8, 30)),
        keep(new THREE.MeshStandardMaterial({ color: 0x0c0910, roughness: 0.85 }))
      );
      coil.rotation.x = Math.PI / 2;
      coil.position.set(-3.4 + i * 0.04, 0.045 + i * 0.012, 1.4);
      projPick.add(coil);
    }

    const lampGlow = new THREE.PointLight(0xffcf8a, 0, 8, 2);
    lampGlow.position.set(1.6, 0.02, 0);
    projector.add(lampGlow);

    /* ---- the CLICK ME label -------------------------------------------------------------------
       A Sprite, so it faces the camera without any per-frame billboarding and reads at the same
       size from anywhere. Only visible while the projector is off. */
    const labelTex = mkTex(512, 176, (g) => {
      g.clearRect(0, 0, 512, 176);
      g.font = '600 70px "JetBrains Mono", ui-monospace, monospace';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowColor = "rgba(255, 214, 140, 0.95)";
      g.shadowBlur = 30;
      g.fillStyle = "#ffe6b0";
      g.fillText("CLICK ME", 256, 66);
      g.fillText("CLICK ME", 256, 66); // twice: one pass of shadow is too weak to read as a glow
      g.shadowBlur = 0;
      g.font = '400 30px "JetBrains Mono", ui-monospace, monospace';
      g.fillStyle = "rgba(255,225,175,0.75)";
      g.fillText("▼", 256, 134);
    });
    labelTex.wrapS = labelTex.wrapT = THREE.ClampToEdgeWrapping;
    const labelMat = keep(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false }));
    const label = new THREE.Sprite(labelMat);
    label.scale.set(2.1, 0.72, 1);
    label.position.set(PROJ.x, 3.62, PROJ.z);
    scene.add(label);

    /* ---- the beam ------------------------------------------------------------------------------
       Apex at the lens, base at the screen. Vertex colours fade it along its length so it is hottest
       where it leaves the glass and thinnest where it lands, which is the whole difference between
       a beam and a translucent wedge. */
    const lensWorld = new THREE.Vector3(1.37, 0.02, 0);
    projector.localToWorld(lensWorld);
    const screenCentre = new THREE.Vector3(0, SCREEN_Y, SCREEN_Z);
    const throwLen = lensWorld.distanceTo(screenCentre);
    const farRadius = Math.hypot(SCREEN_W, SCREEN_H) / 2;

    // a cone's apex is at local +Y, so +Y must point back at the LENS, not at the screen
    const beamQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      lensWorld.clone().sub(screenCentre).normalize()
    );
    const beamMid = lensWorld.clone().lerp(screenCentre, 0.5);

    const mkCone = (radius: number, color: THREE.Color, seg: number) => {
      const geo = keep(new THREE.ConeGeometry(radius, throwLen, seg, 24, true));
      // brightness from position along the cone: 1 at the apex (the lens), ~0.15 at the base
      const pos = geo.getAttribute("position");
      const col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const t = (pos.getY(i) + throwLen / 2) / throwLen; // 0 at base, 1 at apex
        const k = 0.15 + 0.85 * t * t;
        col[i * 3] = color.r * k;
        col[i * 3 + 1] = color.g * k;
        col[i * 3 + 2] = color.b * k;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = keep(
        new THREE.MeshBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(beamMid);
      m.quaternion.copy(beamQuat);
      scene.add(m);
      return mat;
    };
    // wide and faint over narrow and hot: that is what gives the shaft falloff across its width too
    const beamOuter = mkCone(farRadius, new THREE.Color(0xffb347), 44);
    const beamCore = mkCone(farRadius * 0.5, new THREE.Color(0xfff2d4), 34);

    /* Dust inside the beam. Without it the cone reads as a flat translucent triangle. Positions are
       generated INSIDE the cone: pick a distance along the throw first, then a radius scaled to the
       cone's width at that distance, so none of them float outside the shaft. */
    const DUST = 420;
    const dustPos = new Float32Array(DUST * 3);
    const dustSeed = new Float32Array(DUST);
    const along = new THREE.Vector3().subVectors(screenCentre, lensWorld).normalize();
    const sideA = new THREE.Vector3(0, 1, 0).cross(along).normalize();
    const sideB = new THREE.Vector3().crossVectors(along, sideA).normalize();
    for (let i = 0; i < DUST; i++) {
      const t = rnd();
      const r = Math.sqrt(rnd()) * farRadius * t;
      const a = rnd() * Math.PI * 2;
      const p = lensWorld
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
        size: 0.04,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    scene.add(new THREE.Points(dustGeo, dustMat));

    /* ---- lighting ---- */
    const ambient = new THREE.AmbientLight(0x3f2e4a, 1.0);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(C_PURPLE, 0x150d19, 0.55);
    scene.add(hemi);

    const keyGold = new THREE.PointLight(C_GOLD, 70, 26, 2);
    keyGold.position.set(-5.6, 5.0, -1.2);
    scene.add(keyGold);

    const keyBurgundy = new THREE.PointLight(0xb0455c, 52, 24, 2);
    keyBurgundy.position.set(6.0, 4.4, -2.6);
    scene.add(keyBurgundy);

    const fill = new THREE.PointLight(0xffd9a8, 26, 16, 2);
    fill.position.set(0, 3.6, 1.2);
    scene.add(fill);

    // theatrical spotlights: warm pools against the back wall
    const spotA = new THREE.SpotLight(0xffc98a, 40, 20, 0.55, 0.85, 2);
    spotA.position.set(-5.0, 6.1, -3.4);
    spotA.target.position.set(-5.8, 0, -5.4);
    scene.add(spotA, spotA.target);
    const spotB = new THREE.SpotLight(0xc78ad8, 34, 20, 0.5, 0.85, 2);
    spotB.position.set(5.2, 6.1, -3.6);
    spotB.target.position.set(6.0, 0, -5.4);
    scene.add(spotB, spotB.target);

    /* The projector's own light. This is the one that casts shadows: everything between the lens and
       the screen throws a real silhouette onto the surface, which is what makes the beam read as
       light rather than as geometry. */
    const projSpot = new THREE.SpotLight(
      0xffd9a0,
      0,
      throwLen * 1.6,
      Math.atan(farRadius / throwLen) * 1.05,
      0.5,
      1.4
    );
    projSpot.position.copy(lensWorld);
    projSpot.target.position.copy(screenCentre);
    projSpot.castShadow = true;
    projSpot.shadow.mapSize.set(1024, 1024);
    projSpot.shadow.bias = -0.0012;
    projSpot.shadow.camera.near = 0.5;
    projSpot.shadow.camera.far = throwLen * 1.6;
    scene.add(projSpot, projSpot.target);

    const screenBounce = new THREE.PointLight(0xffe9c8, 0, 12, 2);
    screenBounce.position.set(0, SCREEN_Y, SCREEN_Z + 1.4);
    scene.add(screenBounce);

    const BASE = {
      ambient: ambient.intensity,
      hemi: hemi.intensity,
      keyGold: keyGold.intensity,
      keyBurgundy: keyBurgundy.intensity,
      fill: fill.intensity,
      spotA: spotA.intensity,
      spotB: spotB.intensity,
    };

    /* ---- picking ------------------------------------------------------------------------------
       Pointer down/up rather than click, and only counted when the pointer barely moved between the
       two: on a touch screen a scroll gesture ends in a click on whatever it started over, which
       would open the carousel every time someone swiped past the table. */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const hitAt = (cx: number, cy: number): Pick | null => {
      ndc.x = (cx / window.innerWidth) * 2 - 1;
      ndc.y = -(cy / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects([projPick, cdPick, label], true);
      if (!hits.length) return null;
      let o: THREE.Object3D | null = hits[0].object;
      while (o) {
        if (o === projPick || o === label) return "projector";
        if (o === cdPick) return "cds";
        o = o.parent;
      }
      return null;
    };

    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return; // that was a drag
      const hit = hitAt(e.clientX, e.clientY);
      if (hit) pickRef.current(hit);
    };
    let hover: Pick | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hover = hitAt(e.clientX, e.clientY);
      canvas.style.cursor = hover ? "pointer" : "";
    };
    const onLeave = () => {
      hover = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    /* ---- sizing + reporting the screen's rect to the DOM overlay ---- */
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
      /* Portrait has to widen or the screen runs off the sides. Solved rather than guessed: find the
         fov whose visible WIDTH at the same distance still contains the screen with a margin. */
      const portrait = w / h < SCREEN_W / SCREEN_H;
      camera.fov = portrait
        ? Math.min(85, (2 * Math.atan((SCREEN_W * 1.12) / 2 / (camDist * (w / h))) * 180) / Math.PI)
        : FOV;
      // no room to give away in portrait: the screen already fills the width, so it stays centred
      if (portrait) camera.clearViewOffset();
      else camera.setViewOffset(w, h, w * VIEW_SHIFT, 0, w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      reportRect(w, h);
    };
    applySize();
    window.addEventListener("resize", applySize);

    /* ---- loop ---- */
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    let lit = 0; // eased toward `on`
    let cdHot = 0; // eased toward 1 while the pointer is over the film cases

    const tick = () => {
      raf = requestAnimationFrame(tick);
      // delta first: getElapsedTime() calls getDelta() internally and would zero it out
      const delta = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      // one eased scalar drives every state-dependent value, so they cannot disagree mid-fade
      const target = onRef.current ? 1 : 0;
      lit += (target - lit) * Math.min(1, delta * 6.5); // ~0.5s to settle

      // a real bulb is never perfectly steady, and a static beam looks like a decal
      const flick = 1 + Math.sin(t * 7.3) * 0.035 + Math.sin(t * 2.1) * 0.05;

      // the room drops to ~45% with the projector on, per the two lighting states
      const room = 1 - 0.55 * lit;
      ambient.intensity = BASE.ambient * room;
      hemi.intensity = BASE.hemi * room;
      keyGold.intensity = BASE.keyGold * room;
      keyBurgundy.intensity = BASE.keyBurgundy * room;
      fill.intensity = BASE.fill * room;
      spotA.intensity = BASE.spotA * room;
      spotB.intensity = BASE.spotB * room;

      beamOuter.opacity = 0.24 * lit * flick;
      beamCore.opacity = 0.16 * lit * flick;
      dustMat.opacity = 0.55 * lit * flick;
      haloMat.opacity = 0.3 * lit * flick;
      lampGlow.intensity = 14 * lit * flick;
      projSpot.intensity = 62 * lit * flick;
      screenBounce.intensity = 9 * lit * flick;
      lensMat.emissiveIntensity = 2.6 * lit * flick;
      screenMat.emissiveIntensity = (0.05 + 0.2 * lit) * flick; // receives the beam, barely emits
      // shadow work is pointless while the only light casting them is off
      projSpot.castShadow = lit > 0.05;

      /* The CD stack. It bobs slowly on its own and brightens when the pointer is over it: enough
         to read as interactive without competing with the projection for attention. `cdHot` is
         eased rather than set, so the brighten has a rise and a fall instead of snapping. */
      cdHot += ((hover === "cds" ? 1 : 0) - cdHot) * Math.min(1, delta * 7);
      cdStack.position.y = Math.sin(t * 2.2) * 0.018;          // ~2.9s cycle
      cdLight.intensity = 26 * (1 + cdHot * 0.85) * (1 - 0.3 * lit);
      cdLabelMat.opacity = 0.55 + cdHot * 0.42 + Math.sin(t * 1.7) * 0.06;
      cdLabel.position.y = 2.05 + Math.sin(t * 2.2) * 0.02;
      for (const m of spineMats) m.emissiveIntensity = 0.3 + cdHot * 0.7;
      // the cases themselves pick up a faint gold only while hovered, so the rest sits calm
      for (const m of caseMats) m.emissiveIntensity = cdHot * 0.28;

      // the label pulses gently while it is the only thing asking to be clicked
      labelMat.opacity = (1 - lit) * (0.72 + Math.sin(t * 2.2) * 0.22);
      label.visible = labelMat.opacity > 0.01;

      // reels: continuous spool plus a slow 2-3 degree sway
      for (const r of reels) {
        r.hub.rotation.y += r.spin * delta;
        r.group.rotation.y += Math.sin(t * 0.62 + r.phase) * delta * 0.045;
        const tm = r.tape.material as THREE.MeshStandardMaterial;
        if (tm.map) tm.map.offset.x -= r.spin * delta * 0.34; // the tape appears to spool out
      }

      // dust drifts up through the shaft and wraps, so it never runs out
      if (lit > 0.01) {
        const pos = dustGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < DUST; i++) {
          const y = pos.getY(i) + delta * (0.05 + (dustSeed[i] % 1) * 0.055);
          pos.setY(i, y > SCREEN_Y + SCREEN_H / 2 ? 0.4 : y);
          pos.setX(i, pos.getX(i) + Math.sin(t * 0.5 + dustSeed[i]) * delta * 0.022);
        }
        pos.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    if (reduce) {
      lit = on ? 1 : 0;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onVis = () => {
      if (reduce) return;
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        running = true;
        clock.getDelta(); // drop the accumulated hidden time, or everything jumps on resume
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", applySize);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      for (const k of kept) k.dispose();
      renderer.dispose();
    };
    // `on` is read through a ref inside the loop; rebuilding the whole room to flip a light would be
    // absurd, so it is deliberately not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="contact-room-canvas" />;
}
