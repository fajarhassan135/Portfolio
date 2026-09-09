"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import StationPanel, { type StationKey } from "./StationPanel";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type StationData = {
  name: string;
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
};

type PresetName = "wide" | "screen" | "seats";

const PRESET_BUTTONS: { id: PresetName; label: string }[] = [
  { id: "wide", label: "Wide" },
  { id: "screen", label: "Screen" },
  { id: "seats", label: "Seats" },
];

type Props = {
  onOpenPanel: (data: StationData) => void;
  onReady?: () => void;
  panelOpen?: boolean;
  dense?: boolean; // "play" mode gets a few extra stations
  onExit?: () => void;
};

export default function Scene({ onOpenPanel, onReady, panelOpen = false, dense = false, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presetTriggerRef = useRef<(preset: PresetName) => void>(() => {});
  const unfocusTriggerRef = useRef<() => void>(() => {});
  const wasPanelOpenRef = useRef(panelOpen);

  /* Which station the camera is focused on, mirrored into React so the close button can render.
     The 3D side owns the truth and pushes it out through onFocusRef; React never drives the camera,
     it only reflects it and can ask it to exit. Going the other way, with React state driving the
     scene, would mean a re-render on every focus change for a canvas that re-renders itself. */
  const [focused, setFocused] = useState<StationData | null>(null);
  const onFocusRef = useRef<(d: StationData | null) => void>(() => {});
  const exitFocusRef = useRef<() => void>(() => {});
  onFocusRef.current = setFocused;

  // Escape leaves focus, the same key that closes the nav drawer. A view you can only exit by
  // hitting one small button is a trap for anyone not using a mouse.
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFocusRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  // station panel closing (not opening — the click handler drives the focus-in transition itself)
  // eases the camera back out of its pan+zoom focus on the clicked station
  useEffect(() => {
    if (wasPanelOpenRef.current && !panelOpen) {
      unfocusTriggerRef.current();
    }
    wasPanelOpenRef.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x05050a, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    const rig = new THREE.Group();
    scene.add(rig);
    camera.position.set(0, 0, window.innerWidth < 640 ? 16 : 12.5);
    rig.add(camera);

    // --- palette (cinema) ---
    // Albedo lift for the warm-lit auditorium. The old values reflected roughly 10% of the light
    // that hit them (walls rgb 29,17,25 / carpet 40,16,22), so the room swallowed its own lighting
    // and 93% of the frame measured below luminance 20. Same plum-and-red identity, just able to
    // actually return light.
    // Brown room, maroon carpet. The walls were plum (0x35212e) which read cold; a warm brown
    // is what actually makes an auditorium feel cozy, and it lets the maroon carpet and red seats
    // sit against it instead of competing.
    const cCarpet = 0x5e1f2b;
    const cWall = 0x3a2a1e;
    const cSeat = 0x74283a;
    const cSeatDark = 0x321319;
    const cScreenOff = 0x0c0c10;
    const cCurtain = 0x4d1420;
    const cCurtainFold = 0x350c16;
    const cBoothWood = 0x453023;
    const cBoothWoodDark = 0x271a12;
    const cAmber = 0xe0aa70;
    const cGold = 0x9a7a48;

    function addSolid(geo: THREE.BufferGeometry, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number }) {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color,
          roughness: opts?.roughness ?? 0.7,
          metalness: opts?.metalness ?? 0.1,
          emissive: opts?.emissive ?? 0x000000,
          emissiveIntensity: opts?.emissive ? opts?.emissiveIntensity ?? 0.6 : 0,
        })
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
      );
      group.add(mesh);
      group.add(edges);
      return group;
    }
    function addBlock(w: number, h: number, d: number, color: number, opts?: { roughness?: number; metalness?: number; emissive?: number; emissiveIntensity?: number }) {
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

    // ================= ROOM =================
    const ROOM_HALF = 11;
    const ROOM_HEIGHT = 10;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_HALF * 2, ROOM_HALF * 2),
      new THREE.MeshStandardMaterial({ color: cCarpet, roughness: 0.88 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const aisle = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, ROOM_HALF * 2 - 1),
      new THREE.MeshStandardMaterial({ color: 0x431622, roughness: 0.88 })
    );
    aisle.rotation.x = -Math.PI / 2;
    aisle.position.set(0, 0.005, 0);
    aisle.receiveShadow = true;
    scene.add(aisle);

    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_HALF * 2, ROOM_HALF * 2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    scene.add(groundPlane);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_HALF * 2, ROOM_HALF * 2),
      new THREE.MeshStandardMaterial({ color: 0x241a13, roughness: 0.9, side: THREE.DoubleSide })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ROOM_HEIGHT;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    function makeWall() {
      const wall = addSolid(new THREE.PlaneGeometry(ROOM_HALF * 2, ROOM_HEIGHT), cWall, { roughness: 0.85 });
      return wall;
    }
    const wallY = ROOM_HEIGHT / 2;
    const backWall = makeWall();
    backWall.position.set(0, wallY, -ROOM_HALF);
    scene.add(backWall);
    const frontWall = makeWall();
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, wallY, ROOM_HALF);
    scene.add(frontWall);
    const leftWall = makeWall();
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-ROOM_HALF, wallY, 0);
    scene.add(leftWall);
    const rightWall = makeWall();
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(ROOM_HALF, wallY, 0);
    scene.add(rightWall);

    // ================= SCREEN WALL =================
    const stations: THREE.Object3D[] = [];
    const stationBaseScale = new Map<THREE.Object3D, number>();

    function makeScreenWall() {
      const group = new THREE.Group();
      const screenW = 8.6,
        screenH = 4.3;
      const frame = addRoundedBlock(screenW + 0.5, screenH + 0.5, 0.15, 0x0a0608, { roughness: 0.85 }, 0.05);
      frame.position.set(0, screenH / 2 + 0.4, 0.05);
      group.add(frame);

      const off = new THREE.Mesh(
        new THREE.PlaneGeometry(screenW, screenH),
        new THREE.MeshStandardMaterial({
          color: cScreenOff,
          roughness: 0.55,
          metalness: 0.1,
          emissive: cScreenOff,
          emissiveIntensity: 0.15,
        })
      );
      off.position.set(0, screenH / 2 + 0.4, 0.13);
      off.name = "screenSurface"; // the glow pass drives this one specifically
      group.add(off);

      /* A thin black masking border around the picture, the way a real cinema screen is edged.
         The wall behind is nearly the same value as the screen when it is off, so without this the
         picture area has no defined edge and the whole wall reads as one flat panel. Four thin bars
         rather than a larger backing plate: a plate would sit behind the screen and never be seen,
         where bars overlap its edge and actually draw the frame. */
      const BORDER = 0.11;
      const borderMat = new THREE.MeshStandardMaterial({ color: 0x050305, roughness: 0.95 });
      const edges: [number, number, number, number][] = [
        [screenW + BORDER * 2, BORDER, 0, screenH / 2 + BORDER / 2], // top
        [screenW + BORDER * 2, BORDER, 0, -screenH / 2 - BORDER / 2], // bottom
        [BORDER, screenH, -screenW / 2 - BORDER / 2, 0], // left
        [BORDER, screenH, screenW / 2 + BORDER / 2, 0], // right
      ];
      for (const [w, h, dx, dy] of edges) {
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(w, h), borderMat);
        bar.position.set(dx, screenH / 2 + 0.4 + dy, 0.14); // just proud of the screen surface
        group.add(bar);
      }

      const rimLight = new THREE.PointLight(cAmber, 3, 6);
      rimLight.position.set(0, screenH / 2 + 0.4, 1.2);
      group.add(rimLight);

      function makeCurtain(mirror: 1 | -1) {
        const cGroup = new THREE.Group();
        const body = addBlock(1.3, ROOM_HEIGHT - 1.4, 0.35, cCurtain, { roughness: 0.85 });
        body.position.set(mirror * (screenW / 2 + 1.0), (ROOM_HEIGHT - 1.4) / 2, 0.1);
        cGroup.add(body);
        for (let i = 0; i < 5; i++) {
          const fold = addBlock(0.14, ROOM_HEIGHT - 1.6, 0.06, cCurtainFold, { roughness: 0.9 });
          fold.position.set(mirror * (screenW / 2 + 0.55 + i * 0.28), (ROOM_HEIGHT - 1.6) / 2, 0.3);
          cGroup.add(fold);
        }
        return cGroup;
      }
      group.add(makeCurtain(1));
      group.add(makeCurtain(-1));

      group.userData = {
        name: "projects",
        eyebrow: "NOW SHOWING",
        title: "Projects",
        body: "Placeholder — featured case studies (including company work) render here.",
      };
      return group;
    }
    const screenWall = makeScreenWall();
    screenWall.position.set(0, 0, -ROOM_HALF + 0.15);
    scene.add(screenWall);
    stations.push(screenWall);

    /* ================= FRAMED ARTWORK (back wall, decorative) =================
       Hung on the back wall beside the screen. Purely set dressing: it is never pushed to
       `stations`, so the click-to-focus raycast cannot pick it, and it gets no light of its own.
       The sconces and the room ambient light it like every other surface, which is the point.

       Hung centred on the wall OPPOSITE the screen, the one the seats have their backs to. The only
       other thing on that wall is the projection booth (1.2 wide at x 0, y 5.15-6.05), which is what
       caps the height: the frame is sized so its top clears the booth by 0.13m and it still keeps
       0.68m off the floor, rather than being pushed off-centre to dodge it.

       NOTE ON THE DEFAULT CAMERA. It starts at z = 12.5, which is outside the room: the front wall's
       plane faces into the room and its back face is culled, which is how you can see in at all. So
       this artwork faces away from the opening view and comes into shot as you orbit round, which is
       what the wall opposite the screen means geometrically. */
    function makeWallArt() {
      const group = new THREE.Group();
      const W = 2.7;
      const H = W * 1.395; // matches the source photograph's 736x1027, so nothing is stretched
      const MOULD = 0.28;

      /* The moulding is a two-step profile, not one flat bar: an outer rail standing proud over an
         inner bead set back. A frame reads as ornate because of its depth, and the step between the
         two rails is what actually catches the sconce light. */
      const rail = (w: number, h: number, d: number, x: number, y: number, z: number) => {
        const bar = addRoundedBlock(
          w,
          h,
          d,
          cGold,
          { roughness: 0.3, metalness: 0.85, emissive: cGold, emissiveIntensity: 0.12 },
          0.02
        );
        bar.position.set(x, y, z);
        group.add(bar);
      };
      const ow = W + MOULD * 2;
      const oh = H + MOULD * 2;
      rail(ow, MOULD, 0.16, 0, H / 2 + MOULD / 2, 0.08);
      rail(ow, MOULD, 0.16, 0, -H / 2 - MOULD / 2, 0.08);
      rail(MOULD, oh, 0.16, -W / 2 - MOULD / 2, 0, 0.08);
      rail(MOULD, oh, 0.16, W / 2 + MOULD / 2, 0, 0.08);

      const BEAD = 0.07;
      rail(W + BEAD * 2, BEAD, 0.09, 0, H / 2 + BEAD / 2, 0.04);
      rail(W + BEAD * 2, BEAD, 0.09, 0, -H / 2 - BEAD / 2, 0.04);
      rail(BEAD, H, 0.09, -W / 2 - BEAD / 2, 0, 0.04);
      rail(BEAD, H, 0.09, W / 2 + BEAD / 2, 0, 0.04);

      // art-deco corner blocks, the one flourish the profile gets
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          const block = addRoundedBlock(
            MOULD * 1.4,
            MOULD * 1.4,
            0.18,
            cGold,
            { roughness: 0.28, metalness: 0.88, emissive: cGold, emissiveIntensity: 0.12 },
            0.02
          );
          block.position.set(sx * (W / 2 + MOULD / 2), sy * (H / 2 + MOULD / 2), 0.09);
          block.rotation.z = Math.PI / 4;
          group.add(block);
        }

      // the mat: a dark card between the moulding and the print
      const mat = new THREE.Mesh(
        new THREE.PlaneGeometry(W + 0.04, H + 0.04),
        new THREE.MeshStandardMaterial({ color: 0x120c10, roughness: 0.9 })
      );
      mat.position.z = 0.02;
      group.add(mat);

      /* The print. Loaded from disk; until the file exists a drawn stand-in takes its place rather
         than a black rectangle, and names the path it is waiting for. */
      const c = document.createElement("canvas");
      c.width = 360;
      c.height = 504;
      const g = c.getContext("2d")!;
      const bg = g.createLinearGradient(0, 0, 0, 504);
      bg.addColorStop(0, "#2b2b2b");
      bg.addColorStop(0.55, "#111111");
      bg.addColorStop(1, "#050505");
      g.fillStyle = bg;
      g.fillRect(0, 0, 360, 504);
      g.textAlign = "center";
      g.fillStyle = "#f2f2f2";
      g.font = '600 30px "Outfit", ui-sans-serif, sans-serif';
      g.fillText("ABSOLUTE", 180, 330);
      g.font = '700 62px "Outfit", ui-sans-serif, sans-serif';
      g.fillText("CINEMA", 180, 392);
      g.font = '400 13px "JetBrains Mono", ui-monospace, monospace';
      g.fillStyle = "rgba(240,240,240,0.4)";
      g.fillText("public/art/absolute-cinema.png", 180, 452);
      const stand = new THREE.CanvasTexture(c);
      stand.colorSpace = THREE.SRGBColorSpace;

      /* WHY THIS IS PART EMISSIVE. The wall opposite the screen is the darkest surface in the room,
         and a plain lit material there renders as a black rectangle: the frame appears empty even
         though the texture is bound. Feeding the same texture in as an emissiveMap makes the print
         carry its own luminance, like a backlit display print, so it reads at any room brightness.
         It still takes `map` and so still responds to the sconces; and because it emits rather than
         casting, no new light is added to the room, which keeps this decorative and spotlight-free. */
      const printMat = new THREE.MeshStandardMaterial({
        map: stand,
        emissive: 0xffffff,
        emissiveMap: stand,
        emissiveIntensity: 0.62,
        roughness: 0.6,
        metalness: 0.05,
      });
      const print = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, H - 0.06), printMat);
      print.position.z = 0.03;
      group.add(print);

      new THREE.TextureLoader().load("/art/absolute-cinema.png", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        printMat.map = tex;
        printMat.emissiveMap = tex; // both, or the stand-in keeps glowing through the photograph
        printMat.needsUpdate = true;
      });

      return group;
    }
    const wallArt = makeWallArt();
    wallArt.position.set(0, 2.85, ROOM_HALF - 0.12);
    wallArt.rotation.y = Math.PI; // face into the room, like the wall it hangs on
    scene.add(wallArt);

    // ================= WALL SCONCES (tracked for flicker) =================
    const sconceLights: { light: THREE.PointLight; baseIntensity: number; phase: number }[] = [];
    function makeSconce() {
      const group = new THREE.Group();
      const backing = addBlock(0.18, 0.32, 0.1, cGold, { roughness: 0.35, metalness: 0.6 });
      group.add(backing);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 14, 12),
        new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.4 })
      );
      bulb.position.set(0, 0, 0.09);
      group.add(bulb);
      const light = new THREE.PointLight(cAmber, 32, 12);
      light.position.set(0, 0, 0.2);
      group.add(light);
      sconceLights.push({ light, baseIntensity: 9, phase: Math.random() * Math.PI * 2 });
      return group;
    }
    [-7, -2, 3, 7.5].forEach((z) => {
      const left = makeSconce();
      left.rotation.y = Math.PI / 2;
      left.position.set(-ROOM_HALF + 0.12, 3.4, z);
      scene.add(left);
      const right = makeSconce();
      right.rotation.y = -Math.PI / 2;
      right.position.set(ROOM_HALF - 0.12, 3.4, z);
      scene.add(right);
    });

    // ================= CEILING DOWNLIGHTS (tracked for flicker) =================
    const ceilingLights: { light: THREE.PointLight; baseIntensity: number; phase: number }[] = [];
    function makeCeilingLight() {
      const group = new THREE.Group();
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.3 })
      );
      group.add(disc);
      const light = new THREE.PointLight(cAmber, 34, 13);
      light.position.set(0, -0.3, 0);
      group.add(light);
      ceilingLights.push({ light, baseIntensity: 12, phase: Math.random() * Math.PI * 2 });
      return group;
    }
    [-5, -1.5, 2, 5.5].forEach((z) => {
      [-4, 0, 4].forEach((x) => {
        const dl = makeCeilingLight();
        dl.position.set(x, ROOM_HEIGHT - 0.1, z);
        scene.add(dl);
      });
    });

    // ================= LIGHTING =================
    const ambient = new THREE.AmbientLight(0x5a4034, 1.45);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x5a4034, 0x1e1218, 0.8);
    scene.add(hemi);

    const warmLight = new THREE.PointLight(cAmber, 66, 26);
    warmLight.position.set(0, 5, -5);
    warmLight.castShadow = true;
    warmLight.shadow.mapSize.set(1024, 1024);
    scene.add(warmLight);

    const fillLight = new THREE.PointLight(cAmber, 40, 22);
    fillLight.position.set(0, 5, 5.5);
    scene.add(fillLight);

    const keyLight = new THREE.DirectionalLight(0xfff2dc, 0.4);
    keyLight.position.set(4, 8, 2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // ================= CINEMA SEATS — widened, more columns each side =================
    function makeCinemaSeat(color: number) {
      const group = new THREE.Group();
      const opts = { roughness: 0.55 };
      // pan top sits at 0.47: a 1.708-tall figure needs that to get its feet on the floor
      // (shin 0.248 + shoe 0.223 = 0.47 from knee down). At the old 0.34 anyone sitting here had
      // their feet through the carpet.
      const seat = addRoundedBlock(0.48, 0.32, 0.5, color, opts, 0.035);
      seat.position.y = 0.31;
      group.add(seat);
      const back = addRoundedBlock(0.48, 0.6, 0.12, color, opts, 0.035);
      back.position.set(0, 0.68, 0.19);
      group.add(back);
      const armL = addBlock(0.08, 0.22, 0.42, cSeatDark, opts);
      armL.position.set(-0.25, 0.45, 0);
      group.add(armL);
      const armR = addBlock(0.08, 0.22, 0.42, cSeatDark, opts);
      armR.position.set(0.25, 0.45, 0);
      group.add(armR);
      const leg = addBlock(0.4, 0.3, 0.44, cSeatDark, { roughness: 0.4, metalness: 0.3 });
      leg.position.y = 0.15;
      group.add(leg);
      return group;
    }
    // COMPOSITION: the room now reads in three depth bands instead of one wall of seats —
    //   far   z -8..-2   the screen and the seating that faces it
    //   mid   z  2..7    an open plaza where the stations live and the character walks
    //   near  z  9..11   behind the visitor, kept clear
    // Previously 10 rows ran z -5.5..8.0, filling the entire floor: from the camera at z=13 the
    // whole foreground was seat backs, and both stations sat buried at the same depth as the rows.
    const rowZs = [-9.6, -8.4, -7.2, -6.0, -4.8, -3.6, -2.4, -1.2];
    // was [-2.55,-1.7,-0.85, 0.85,1.7,2.55] (6/row) — now 10/row, aisle still open at center
    const rowXOffsets = [-5.1, -4.25, -3.4, -2.55, -1.7, -0.85, 0.85, 1.7, 2.55, 3.4, 4.25, 5.1];
    const seatSpots: { x: number; z: number }[] = [];
    rowZs.forEach((z) => {
      rowXOffsets.forEach((x) => {
        // the outer columns stop short of the front rows so they do not sit inside the
        // ticket booth / popcorn stand, which occupy x +/-4.6..6.6 at z -2.2..-0.2
        if (Math.abs(x) > 5 && z > -3.0) return;
        const seat = makeCinemaSeat(cSeat);
        seat.position.set(x, 0, z);
        scene.add(seat);
        seatSpots.push({ x, z });
      });
    });

    // ================= TICKET BOOTH — moved off the far wall, into the main sightline =================
    function makeTicketBooth() {
      const group = new THREE.Group();
      const opts = { roughness: 0.5 };
      const body = addRoundedBlock(1.3, 1.6, 0.9, cBoothWood, opts, 0.05);
      body.position.y = 0.8;
      group.add(body);
      const roof = addRoundedBlock(1.5, 0.1, 1.1, cBoothWoodDark, opts, 0.025);
      roof.position.y = 1.65;
      group.add(roof);
      const window_ = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.5),
        new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 0.9 })
      );
      window_.position.set(0, 0.95, 0.46);
      group.add(window_);
      const windowLight = new THREE.PointLight(cAmber, 5, 5);
      windowLight.position.set(0, 0.95, 0.7);
      group.add(windowLight);
      group.userData = {
        name: "contact",
        eyebrow: "TICKET BOOTH",
        title: "Contact",
        body: "Placeholder — email, LinkedIn, GitHub links render here.",
      };
      return group;
    }
    const ticketBooth = makeTicketBooth();
    ticketBooth.rotation.y = Math.PI / 2; // faces +x, toward the aisle/center
    ticketBooth.position.set(-5.6, 0, -1.2); // side aisle, ahead of the last seat row and inside frame
    // Each station gets its own bright pool. In a deliberately dim room the interactive objects
    // have to out-expose everything around them or nobody finds them.
    const boothSpot = new THREE.PointLight(0xffcf8a, 46, 7.5);
    boothSpot.position.set(-5.6, 3.1, -0.4);
    scene.add(boothSpot);
    ticketBooth.rotation.y = 0.42; // angled toward the centre aisle so its lit window faces the visitor
    scene.add(ticketBooth);
    stations.push(ticketBooth);

    // ================= POPCORN STAND — moved into view + actual visible kernels =================
    function makePopcornStand() {
      const group = new THREE.Group();
      const cart = addRoundedBlock(0.9, 0.7, 0.6, cBoothWood, { roughness: 0.5 }, 0.04);
      cart.position.y = 0.35;
      group.add(cart);

      // striped bucket — base red cylinder + alternating white vertical stripes
      const bucket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.16, 0.4, 24),
        new THREE.MeshStandardMaterial({ color: 0xc23a2e, roughness: 0.55 })
      );
      bucket.position.set(0, 0.9, 0);
      group.add(bucket);
      const stripeCount = 8;
      for (let i = 0; i < stripeCount; i += 2) {
        const angle = (i / stripeCount) * Math.PI * 2;
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.4, 0.02),
          new THREE.MeshStandardMaterial({ color: 0xf1ead8, roughness: 0.7 })
        );
        const r = 0.19;
        stripe.position.set(Math.cos(angle) * r, 0.9, Math.sin(angle) * r);
        stripe.rotation.y = -angle;
        group.add(stripe);
      }

      // individual popcorn kernels piled in a mound, instead of one plain sphere
      const kernelMat = new THREE.MeshStandardMaterial({ color: 0xf3ecd9, roughness: 0.95 });
      const kernelMatShade = new THREE.MeshStandardMaterial({ color: 0xe4d9b8, roughness: 0.95 });
      const kernelPositions: [number, number, number, number][] = [
        [0, 1.14, 0, 0.09],
        [0.09, 1.11, 0.05, 0.075],
        [-0.08, 1.12, -0.04, 0.075],
        [0.03, 1.18, -0.08, 0.07],
        [-0.1, 1.09, 0.08, 0.065],
        [0.1, 1.17, -0.02, 0.065],
        [-0.03, 1.2, 0.09, 0.07],
        [0.06, 1.08, -0.11, 0.06],
        [-0.11, 1.15, 0.02, 0.06],
        [0.0, 1.22, -0.01, 0.065],
      ];
      kernelPositions.forEach(([x, y, z, s], i) => {
        const kernel = new THREE.Mesh(
          new THREE.IcosahedronGeometry(s, 0), // low-poly irregular lump reads as a popcorn puff, not a sphere
          i % 3 === 0 ? kernelMatShade : kernelMat
        );
        kernel.position.set(x, y, z);
        kernel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        kernel.castShadow = true;
        group.add(kernel);
      });

      const awning = addBlock(1.1, 0.06, 0.7, cCurtain, { roughness: 0.7 });
      awning.position.y = 1.5;
      group.add(awning);
      group.userData = {
        name: "about",
        eyebrow: "CONCESSION STAND",
        title: "About",
        // deliberately a teaser — the depth lives on /about so the room stays quick
        body: "A cinema built out of code. The short version lives here; the full reel is on the About page.",
        href: "/about",
        hrefLabel: "Read the full story",
      };
      return group;
    }
    const popcornStand = makePopcornStand();
    popcornStand.rotation.y = -Math.PI / 2; // faces -x, toward the aisle/center
    popcornStand.position.set(5.6, 0, -1.2); // mirrors the ticket booth across the aisle
    const popcornSpot = new THREE.PointLight(0xffcf8a, 46, 7.5);
    popcornSpot.position.set(5.6, 3.1, -0.4);
    scene.add(popcornSpot);
    popcornStand.rotation.y = -0.42;
    scene.add(popcornStand);
    stations.push(popcornStand);

    if (dense) {
      const projGroup = new THREE.Group();
      const boothFace = addBlock(1.2, 0.9, 0.15, cBoothWoodDark, { roughness: 0.6 });
      projGroup.add(boothFace);
      const projWindow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.4),
        new THREE.MeshStandardMaterial({ color: cAmber, emissive: cAmber, emissiveIntensity: 1.0 })
      );
      projWindow.position.z = 0.08;
      projGroup.add(projWindow);
      projGroup.position.set(0, 5.6, ROOM_HALF - 0.4);
      projGroup.rotation.y = Math.PI;
      projGroup.userData = {
        name: "extra",
        eyebrow: "PROJECTION BOOTH",
        title: "???",
        body: "Placeholder — hidden extra / easter egg content.",
      };
      scene.add(projGroup);
      stations.push(projGroup);
    }

    // ================= ENTRANCE / EXIT DOORS — decorative, mounted on the room walls =================
    function makeSignPlane(text: string, color: string, w: number, h: number, glow: number) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = color;
      ctx.font = "bold 84px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, c.width / 2, c.height / 2);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        emissive: new THREE.Color(color),
        emissiveMap: tex,
        emissiveIntensity: glow,
        roughness: 0.5,
        depthWrite: false,
      });
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    }
    function makeDoor(label: string, signColor: string) {
      const group = new THREE.Group();
      const frame = addRoundedBlock(2.2, 3.0, 0.15, 0x1a0f10, { roughness: 0.7 }, 0.04);
      frame.position.y = 1.5;
      group.add(frame);
      [-0.5, 0.5].forEach((mirror) => {
        const panel = addRoundedBlock(0.95, 2.6, 0.08, 0x241318, { roughness: 0.6, metalness: 0.15 }, 0.03);
        panel.position.set(mirror * 0.52, 1.5, 0.05);
        group.add(panel);
        const handle = addSolid(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), cGoldDoor, { roughness: 0.3, metalness: 0.7 });
        handle.rotation.z = Math.PI / 2;
        handle.position.set(mirror * 0.15, 1.5, 0.11);
        group.add(handle);
      });
      const sign = makeSignPlane(label, signColor, 1.5, 0.42, 1.8);
      sign.position.set(0, 3.25, 0.09);
      group.add(sign);
      const signLight = new THREE.PointLight(new THREE.Color(signColor).getHex(), 7, 4.5);
      signLight.position.set(0, 3.25, 0.35);
      group.add(signLight);
      return group;
    }
    const cGoldDoor = 0x9a7a48;
    // No ENTRANCE door in here — you have already come in, so it was decorative only, and its green
    // sign was the brightest thing on that wall for no reason. Only the working EXIT remains.
    const exitDoor = makeDoor("EXIT", "#e0453f");
    exitDoor.rotation.y = -Math.PI / 2;
    exitDoor.position.set(ROOM_HALF - 0.1, 0, 5.2);
    scene.add(exitDoor);

    // AFFORDANCE. The exit is now the only way back to the street, so it cannot be something a
    // visitor has to find by clicking around. Three things point at it: a second EXIT sign angled
    // into the room (the door's own sign faces along the wall and is easy to miss), a chevron that
    // bobs toward the door, and a slow pulse on the sign light in the animate loop below.
    const exitCue = new THREE.Group();
    exitCue.position.set(ROOM_HALF - 1.35, 0, 5.2);
    scene.add(exitCue);

    const exitCueSign = makeSignPlane("EXIT →", "#e0453f", 1.25, 0.34, 2.2);
    exitCueSign.position.set(0, 2.62, 0);
    exitCueSign.rotation.y = -Math.PI / 2.6; // angled off the wall so it reads from the room
    exitCue.add(exitCueSign);

    // chevron pointing at the door
    const exitArrow = new THREE.Group();
    [-1, 1].forEach((m) => {
      const bar = addRoundedBlock(0.34, 0.055, 0.055, 0xe0453f, {
        roughness: 0.4,
        emissive: 0xe0453f,
        emissiveIntensity: 1.4,
      }, 0.02);
      bar.position.set(0.1, m * 0.11, 0);
      bar.rotation.z = m * -0.62;
      exitArrow.add(bar);
    });
    exitArrow.position.set(0, 2.1, 0);
    exitArrow.rotation.y = -Math.PI / 2;
    exitCue.add(exitArrow);

    const exitCueLight = new THREE.PointLight(0xe0453f, 5, 3.4);
    exitCueLight.position.set(0, 2.4, 0);
    exitCue.add(exitCueLight);

    stations.forEach((s) => stationBaseScale.set(s, 1));

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

    // the interior room's click-to-move character is the girl (same rig as the exterior walker);
    // makeGuyCharacter() is available here too for any interior NPC
    const player = makeGirlCharacter();
    const character = player.root;
    const hip = player.hip;
    const torsoGroup = player.torsoGroup;
    const headGroup = player.headGroup;
    const legL = player.legL;
    const legR = player.legR;
    const armL = player.armL;
    const armR = player.armR;
    character.scale.setScalar(1.4);

    // ---- little golden lamps. Small warm practicals scattered low around the room: the pools of
    // light between the darkness are what give a cinema its cozy feel, far more than overall level.
    const cLampGold = 0xffc46b;
    function makeLampPost(h: number) {
      const g = new THREE.Group();
      const post = addBlock(0.07, h, 0.07, 0x2a1d14, { roughness: 0.5, metalness: 0.3 });
      post.position.y = h / 2;
      g.add(post);
      const shade = addRoundedBlock(0.26, 0.2, 0.26, 0x6b4a24, { roughness: 0.6 }, 0.05);
      shade.position.y = h + 0.08;
      g.add(shade);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 8),
        new THREE.MeshStandardMaterial({ color: cLampGold, emissive: cLampGold, emissiveIntensity: 1.7 })
      );
      bulb.position.y = h - 0.02;
      g.add(bulb);
      const l = new THREE.PointLight(cLampGold, 17, 6.5);
      l.position.y = h - 0.02;
      g.add(l);
      return g;
    }
    // aisle-edge lamps down both sides, plus a pair further back by the screen
    ([[-6.6, 2.0, 1.15], [6.6, 2.0, 1.15], [-6.6, -5.0, 1.15], [6.6, -5.0, 1.15],
      [-8.4, -9.0, 0.95], [8.4, -9.0, 0.95]] as [number, number, number][])
      .forEach(([x, z, h]) => {
        const lamp = makeLampPost(h);
        lamp.position.set(x, 0, z);
        scene.add(lamp);
      });

    // ---- a second character, already seated in one of the chairs, watching the screen.
    // Uses the guy design; the girl is the player.
    const SEAT_PAN_Y = 0.47;
    const seatedGuy = makeGuyCharacter();
    const seatedGuyRoot = seatedGuy.root;
    seatedGuyRoot.scale.setScalar(1.4);
    [seatedGuy.legL, seatedGuy.legR].forEach((leg) => {
      leg.pivot.rotation.x = -1.42; // thighs forward along the seat pan
      leg.knee.rotation.x = 1.42; // shins back down to the floor
    });
    seatedGuy.armL.pivot.rotation.x = -0.35; // forearms resting on the armrests
    seatedGuy.armR.pivot.rotation.x = -0.35;
    const OCCUPIED_SEAT = { x: -1.7, z: -4.8 };
    seatedGuyRoot.rotation.y = Math.PI; // turn him to face the screen, like the seat he is in
    // root offset so the hips meet the pan; fine-tuned against the measured rig
    // measured: at pan-0.718 his shoes sat 0.038 below the carpet, so the root is lifted to match
    seatedGuyRoot.position.set(OCCUPIED_SEAT.x, SEAT_PAN_Y - 0.68, OCCUPIED_SEAT.z + 0.02);
    scene.add(seatedGuyRoot);

    /* He is a station too: the Featured Client. Registered AFTER the blanket
       `stations.forEach(s => stationBaseScale.set(s, 1))` further up, so his base scale has to be
       recorded explicitly — he is built at 1.4 and the hover-scale lerp would otherwise pull him
       down to 1 the moment the pointer first crossed him. */
    seatedGuyRoot.userData = {
      name: "client",
      eyebrow: "ROW C, SEAT 4",
      title: "Featured Client",
      body: "Placeholder — the client work you want featured goes here.",
    };
    stations.push(seatedGuyRoot);
    stationBaseScale.set(seatedGuyRoot, 1.4);

    character.position.set(0, 0, -0.6); // centre aisle, both stations a short walk to either side
    // A dim room is the point, but the character still has to read. Rather than lift the whole
    // auditorium, a small warm practical travels with her — the pool moves, the room stays moody.
    const charLight = new THREE.PointLight(0xffd9a8, 14, 5.5);
    charLight.position.set(0, 1.9, 0);
    scene.add(charLight);
    scene.add(character);

    let charTarget = character.position.clone();
    // ---- COLLISION. Axis-aligned x/z rectangles for everything solid in the room. Movement is
    // resolved per axis so a blocked direction slides along the obstacle edge rather than stopping
    // dead — that is what makes her walk *around* a seat row instead of into it.
    const CHAR_RADIUS = 0.3;
    const CHAR_SPEED = 0.095; // per frame; was 0.05, which read as a dawdle
    const obstacles: { x0: number; x1: number; z0: number; z1: number }[] = [
      // every seat, from the same positions the rows were built from
      ...seatSpots.map((sp) => ({ x0: sp.x - 0.29, x1: sp.x + 0.29, z0: sp.z - 0.3, z1: sp.z + 0.3 })),
      { x0: -6.6, x1: -4.6, z0: -2.2, z1: -0.2 }, // ticket booth
      { x0: 4.6, x1: 6.6, z0: -2.2, z1: -0.2 }, // popcorn stand
      { x0: -1.9, x1: -1.5, z0: -5.0, z1: -4.6 }, // the seated NPC
      { x0: -11, x1: 11, z0: -11.4, z1: -10.2 }, // screen wall
      { x0: 10.2, x1: 11.4, z0: 4.2, z1: 6.2 }, // exit door alcove
      // lamp posts
      ...([[-6.6, 2.0], [6.6, 2.0], [-6.6, -5.0], [6.6, -5.0], [-8.4, -9.0], [8.4, -9.0]] as [number, number][])
        .map(([x, z]) => ({ x0: x - 0.2, x1: x + 0.2, z0: z - 0.2, z1: z + 0.2 })),
    ];
    const ROOM_LIMIT = ROOM_HALF - 0.6;
    function blocked(x: number, z: number) {
      if (Math.abs(x) > ROOM_LIMIT || Math.abs(z) > ROOM_LIMIT) return true; // keep her inside the walls
      return obstacles.some(
        (o) =>
          x > o.x0 - CHAR_RADIUS && x < o.x1 + CHAR_RADIUS && z > o.z0 - CHAR_RADIUS && z < o.z1 + CHAR_RADIUS
      );
    }

    // ---- NAVIGATION. Sliding along an obstacle edge is not navigation: faced with a seat block
    // between her and the target she would scrape along it and stall. This builds a walkable grid
    // over the room once, then runs A* per click, so she routes around whatever is in the way and
    // still arrives. Paths are then string-pulled so she walks clean diagonals rather than stair-steps.
    const NAV_CELL = 0.3;
    const NAV_N = Math.ceil((ROOM_HALF * 2) / NAV_CELL);
    const navOpen = new Uint8Array(NAV_N * NAV_N);
    const cellX = (i: number) => -ROOM_HALF + (i + 0.5) * NAV_CELL;
    const cellZ = (j: number) => -ROOM_HALF + (j + 0.5) * NAV_CELL;
    for (let i = 0; i < NAV_N; i++) {
      for (let j = 0; j < NAV_N; j++) {
        navOpen[j * NAV_N + i] = blocked(cellX(i), cellZ(j)) ? 0 : 1;
      }
    }
    const toI = (x: number) => Math.min(NAV_N - 1, Math.max(0, Math.floor((x + ROOM_HALF) / NAV_CELL)));
    const isOpen = (i: number, j: number) =>
      i >= 0 && j >= 0 && i < NAV_N && j < NAV_N && navOpen[j * NAV_N + i] === 1;

    // if a click lands inside an obstacle, walk to the closest open cell instead of refusing
    function nearestOpen(i: number, j: number) {
      if (isOpen(i, j)) return { i, j };
      for (let r = 1; r < 24; r++) {
        for (let di = -r; di <= r; di++) {
          for (let dj = -r; dj <= r; dj++) {
            if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
            if (isOpen(i + di, j + dj)) return { i: i + di, j: j + dj };
          }
        }
      }
      return null;
    }

    // straight-line test used to shorten the path
    function lineClear(ax: number, az: number, bx: number, bz: number) {
      const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / (NAV_CELL * 0.5));
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        if (blocked(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
      }
      return true;
    }

    function findPath(sx: number, sz: number, tx: number, tz: number): THREE.Vector3[] {
      const start = nearestOpen(toI(sx), toI(sz));
      const goal = nearestOpen(toI(tx), toI(tz));
      if (!start || !goal) return [];
      const startIdx = start.j * NAV_N + start.i;
      const goalIdx = goal.j * NAV_N + goal.i;
      if (startIdx === goalIdx) return [new THREE.Vector3(tx, 0, tz)];

      const gScore = new Float32Array(NAV_N * NAV_N).fill(Infinity);
      const cameFrom = new Int32Array(NAV_N * NAV_N).fill(-1);
      const visited = new Uint8Array(NAV_N * NAV_N);
      gScore[startIdx] = 0;
      // small binary heap keyed on f
      const heap: { idx: number; f: number }[] = [{ idx: startIdx, f: 0 }];
      const push = (idx: number, f: number) => {
        heap.push({ idx, f });
        let c = heap.length - 1;
        while (c > 0) {
          const par = (c - 1) >> 1;
          if (heap[par].f <= heap[c].f) break;
          [heap[par], heap[c]] = [heap[c], heap[par]];
          c = par;
        }
      };
      const pop = () => {
        const top = heap[0];
        const last = heap.pop()!;
        if (heap.length) {
          heap[0] = last;
          let c = 0;
          for (;;) {
            const l = c * 2 + 1, r = l + 1;
            let m = c;
            if (l < heap.length && heap[l].f < heap[m].f) m = l;
            if (r < heap.length && heap[r].f < heap[m].f) m = r;
            if (m === c) break;
            [heap[m], heap[c]] = [heap[c], heap[m]];
            c = m;
          }
        }
        return top;
      };
      const h = (i: number, j: number) => Math.hypot(i - goal.i, j - goal.j);

      let found = false;
      while (heap.length) {
        const cur = pop();
        if (visited[cur.idx]) continue;
        visited[cur.idx] = 1;
        if (cur.idx === goalIdx) { found = true; break; }
        const ci = cur.idx % NAV_N, cj = (cur.idx / NAV_N) | 0;
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (!di && !dj) continue;
            const ni = ci + di, nj = cj + dj;
            if (!isOpen(ni, nj)) continue;
            // no cutting diagonally through a corner gap
            if (di && dj && (!isOpen(ci + di, cj) || !isOpen(ci, cj + dj))) continue;
            const nIdx = nj * NAV_N + ni;
            if (visited[nIdx]) continue;
            const step = di && dj ? 1.41421 : 1;
            const g = gScore[cur.idx] + step;
            if (g < gScore[nIdx]) {
              gScore[nIdx] = g;
              cameFrom[nIdx] = cur.idx;
              push(nIdx, g + h(ni, nj));
            }
          }
        }
      }
      if (!found) return [];

      const cells: number[] = [];
      for (let at = goalIdx; at !== -1; at = cameFrom[at]) cells.push(at);
      cells.reverse();
      const pts = cells.map((idx) => new THREE.Vector3(cellX(idx % NAV_N), 0, cellZ((idx / NAV_N) | 0)));
      // aim at the true click point if it is reachable from the last cell
      const last = pts[pts.length - 1];
      if (lineClear(last.x, last.z, tx, tz)) pts.push(new THREE.Vector3(tx, 0, tz));

      // string-pull: drop any waypoint we can see past
      const out: THREE.Vector3[] = [];
      // anchor on the start CELL, not the raw position: if she is ever nudged inside an obstacle,
      // anchoring on the raw point would validate sight-lines from inside geometry and let the
      // smoothed path cut straight through it
      let anchorX = cellX(start.i), anchorZ = cellZ(start.j);
      for (let k = 0; k < pts.length; k++) {
        const nxt = pts[k + 1];
        if (nxt && lineClear(anchorX, anchorZ, nxt.x, nxt.z)) continue;
        out.push(pts[k]);
        anchorX = pts[k].x;
        anchorZ = pts[k].z;
      }
      return out;
    }

    let charPath: THREE.Vector3[] = [];
    let charMoving = false;
    let walkPhase = 0;

    // ================= CONTROLS — fixed pivot orbit =================
    let isDragging = false;
    let lastX = 0,
      lastY = 0;
    let dragDistance = 0;
    // ORBIT, DAMPED. Full 360 around the room with free zoom and adjustable angle — but the drag
    // itself is what has to feel controlled. Three things were making it feel like flying:
    //   1. sensitivity was ~2x too high, so small mouse moves threw the view across the room
    //   2. rotX ran to -0.9rad (-51deg), craning the camera overhead looking straight down
    //   3. rotation was applied raw each frame, so the view stopped dead instead of settling
    // Now: halved sensitivity, a shallow pitch band, and the applied angle eases toward the target
    // so a flick glides to rest rather than snapping.
    const ORBIT_PIVOT_Y = 1.55; // orbit around eye level, not the floor
    const DRAG_SENS_X = 0.0026; // was 0.005
    const DRAG_SENS_Y = 0.0019; // was 0.004
    const ROT_X_MIN = -0.42, // ~ -24deg: enough to look down over the seats
      ROT_X_MAX = 0.07; //  ~  +4deg: just above level, never underneath
    const ORBIT_EASE = 0.12; // how quickly the view settles onto the target angle
    const ZOOM_MIN = 5.5,
      ZOOM_MAX = 18;
    let rotX = -0.2,
      rotY = 0.4;
    let rotXCur = rotX,
      rotYCur = rotY;
    let zoomTarget = window.innerWidth < 640 ? 16 : 12.5;
    let zoomCurrent = zoomTarget;
    const defaultZoom = zoomTarget;

    // ---- camera presets + station focus (nav-triggered eased transitions, separate from free drag) ----
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    type CameraPose = { rotY: number; rotX: number; zoom: number };
    const cameraPresets: Record<PresetName, CameraPose> = {
      wide: { rotY: 0.4, rotX: -0.2, zoom: defaultZoom },
      screen: { rotY: 0.04, rotX: -0.1, zoom: 8.5 },
      seats: { rotY: 0.95, rotX: -0.34, zoom: 11 },
    };
    const PRESET_TRANSITION_MS = 1200;
    let presetTransition: { from: CameraPose; to: CameraPose; start: number } | null = null;

    function currentPose(): CameraPose {
      return { rotY, rotX, zoom: zoomTarget };
    }
    function goToPreset(name: PresetName) {
      presetTransition = { from: currentPose(), to: cameraPresets[name], start: performance.now() };
    }
    presetTriggerRef.current = goToPreset;

    /* focusStation/unfocusStation lived here: a zoom to a fixed 6.5 along whatever angle the camera
       happened to be at. They could not centre anything, because the orbit pivot stayed at the room
       centre, and they used one distance for objects ranging from a seated figure to the whole
       screen wall. enterFocus/exitFocus below replace both. */

    /* ================= CLICK TO FOCUS =================
       Clicking a station eases the camera onto it until it fills the frame, dims the rest of the
       room, and shows a close button. Clicking that eases everything back.

       THE PIVOT HAS TO MOVE. The orbit rig sat at the room's centre, so zooming in only ever moved
       the camera toward the middle of the room; an object off to the side stayed off to the side
       and got closer, never centred. Focusing now slides the pivot onto the object itself, which is
       what actually puts it in the middle of the viewport, and any residual orbit angle then turns
       around the object rather than around the room.

       THE DISTANCE IS SOLVED, NOT GUESSED. Each station is measured with a Box3 and framed by its
       bounding sphere: dist = r / sin(fov/2). The four stations are wildly different sizes, from a
       seated figure to the whole screen wall, so one hand-picked zoom number could not frame them
       all. */
    const focusPivot = new THREE.Vector3(0, ORBIT_PIVOT_Y, 0);
    const focusPivotCur = focusPivot.clone();
    let focusedStation: THREE.Object3D | null = null;
    let dim = 0; // 0 = full room, 1 = everything but the focused object pushed back
    let dimTarget = 0;

    const _box = new THREE.Box3();
    const _sph = new THREE.Sphere();

    /** Which side each station is viewed from. Chosen so the camera sees its face, not its back. */
    const VIEW_DIR: Record<string, THREE.Vector3> = {
      about: new THREE.Vector3(-1, 0.16, 0.42).normalize(), // popcorn stand faces the aisle
      contact: new THREE.Vector3(1, 0.16, 0.42).normalize(), // ticket booth mirrors it
      projects: new THREE.Vector3(0, 0.1, 1).normalize(), // screen wall faces the room
      /* Above and off to one side, not level with him.
         He faces the screen, so a level view from the front puts the camera down among the seat
         rows with the seat back directly in front of him between it and his face: the frame came
         back almost entirely black. Looking down over the rows clears the obstruction. */
      client: new THREE.Vector3(-0.38, 0.62, -0.69).normalize(),
      extra: new THREE.Vector3(0, -0.1, -1).normalize(),
    };

    /* How tightly each station is framed, as a multiplier on the solved fit distance.
       One global number cannot serve all four: the screen wall's bounding sphere takes in the whole
       wall and its curtains, so framing that sphere left the screen itself small and far away. */
    const FIT_SCALE: Record<string, number> = {
      projects: 0.52, // much closer: fill the frame with the screen, not the wall around it
      about: 0.88,
      contact: 0.95,
      client: 0.9,
      extra: 1,
    };

    /* Stations that must be viewed dead head-on, with no tilt and no yaw off their own front face.
       Derived from the object's actual world orientation rather than a hand-written vector, because
       the popcorn stand is rotated twice during setup and the final angle is not obvious from the
       source; reading its forward axis at runtime cannot drift out of step with it. */
    const HEAD_ON = new Set(["about"]);
    const _q = new THREE.Quaternion();
    const _fwd = new THREE.Vector3();

    function poseFor(obj: THREE.Object3D): CameraPose & { pivot: THREE.Vector3 } {
      _box.setFromObject(obj);
      _box.getBoundingSphere(_sph);
      const key = obj.userData.name as string;
      let dir: THREE.Vector3;
      if (HEAD_ON.has(key)) {
        // the object's own +Z, flattened: perpendicular to its face, and perfectly level
        obj.getWorldQuaternion(_q);
        _fwd.set(0, 0, 1).applyQuaternion(_q);
        _fwd.y = 0;
        dir = _fwd.lengthSq() > 1e-6 ? _fwd.normalize().clone() : new THREE.Vector3(0, 0, 1);
      } else {
        dir = VIEW_DIR[key] ?? new THREE.Vector3(0, 0.1, 1).normalize();
      }

      // frame the bounding sphere, then a little margin so it fills the view without touching edges
      const vFov = (camera.fov * Math.PI) / 180;
      const fit = _sph.radius / Math.sin(vFov / 2);
      // a wide viewport is limited by height, a narrow one by width; take whichever needs more room
      const aspect = Math.max(0.3, camera.aspect);
      /* 1.55, not 1.18: the panel takes roughly half the viewport, so the object has to be framed
         inside the remaining half or it runs under the text. */
      const dist = Math.max(2.0, fit * 1.55 * (FIT_SCALE[key] ?? 1) * (aspect < 1 ? 1 / aspect : 1));

      return {
        pivot: _sph.center.clone(),
        rotY: Math.atan2(dir.x, dir.z),
        rotX: Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)) * -1,
        zoom: dist,
      };
    }

    function enterFocus(obj: THREE.Object3D) {
      const pose = poseFor(obj);
      focusedStation = obj;
      focusPivot.copy(pose.pivot);
      dimTarget = 1;
      onFocusRef.current(obj.userData as StationData);
      presetTransition = {
        from: currentPose(),
        to: { rotY: pose.rotY, rotX: pose.rotX, zoom: pose.zoom },
        start: performance.now(),
      };
    }

    function exitFocus() {
      if (!focusedStation) return;
      focusedStation = null;
      focusPivot.set(0, ORBIT_PIVOT_Y, 0);
      dimTarget = 0;
      onFocusRef.current(null);
      presetTransition = {
        from: currentPose(),
        to: cameraPresets.wide,
        start: performance.now(),
      };
    }
    exitFocusRef.current = exitFocus;
    unfocusTriggerRef.current = exitFocus;

    /* ---- what dims ----
       Two separate things have to fall back, because they are lit differently:
         - LIGHTS, which is most of the room
         - EMISSIVE MATERIALS, which are lit by nothing and would otherwise stay at full brightness
           while everything around them dropped. The screen and the sign faces are all emissive.
       The focused station's own materials are exempted so it stays exactly as it was. */
    const allLights: { light: THREE.Light; base: number }[] = [];
    const emissives: { mat: THREE.MeshStandardMaterial; base: number; owner: THREE.Object3D | null }[] = [];

    scene.traverse((o) => {
      const asLight = o as THREE.Light;
      if (asLight.isLight) allLights.push({ light: asLight, base: asLight.intensity });
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const sm = m as THREE.MeshStandardMaterial;
        if (sm && sm.emissiveIntensity > 0) {
          // which station, if any, this material belongs to
          let owner: THREE.Object3D | null = o;
          while (owner && !owner.userData?.name) owner = owner.parent;
          emissives.push({ mat: sm, base: sm.emissiveIntensity, owner });
        }
      }
    });

    /* Every station's own materials, with their resting emissive recorded.
       The dim pass only ever LOWERED emissive; making a station look powered on needs the opposite,
       and most of these materials sit at emissive black with intensity 0, so raising the intensity
       alone would do nothing. The colour has to be driven too, and both have to be restorable. */
    type GlowRec = {
      mat: THREE.MeshStandardMaterial;
      color: THREE.Color; // resting emissive
      intensity: number; // resting emissive intensity
      base: THREE.Color; // resting diffuse colour
      isScreen: boolean; // the screen's picture area, which lights up on its own
    };
    const stationGlow = new Map<THREE.Object3D, GlowRec[]>();
    for (const st of stations) {
      const list: GlowRec[] = [];
      st.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          const sm = m as THREE.MeshStandardMaterial;
          if (!sm || !sm.emissive) continue;
          list.push({
            mat: sm,
            color: sm.emissive.clone(),
            intensity: sm.emissiveIntensity,
            base: sm.color.clone(),
            isScreen: o.name === "screenSurface",
          });
        }
      });
      stationGlow.set(st, list);
    }
    const GLOW_WARM = new THREE.Color(0xffc27a); // amber, the same family as the room's practicals
    const SCREEN_ON = new THREE.Color(0xfff0d2); // the picture area runs brighter and cooler
    const PALE = new THREE.Color(0xd8ccbb); // the washed-out cream the unfocused stations fall to
    const _glowMix = new THREE.Color();

    /* A practical that travels to whatever is focused. Without it, dimming the room would dim the
       focused object too: it is lit by the same room lights as everything else. */
    const focusLight = new THREE.PointLight(0xffe0b0, 0, 9, 2);
    scene.add(focusLight);

    function startDrag(x: number, y: number) {
      presetTransition = null; // drag interrupts/cancels any playing preset/focus transition
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
      rotY -= dx * DRAG_SENS_X; // yaw stays free, so the full 360 of the room is reachable
      rotX += dy * DRAG_SENS_Y;
      rotX = Math.max(ROT_X_MIN, Math.min(ROT_X_MAX, rotX));
    }
    function endDrag() {
      isDragging = false;
    }

    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => {
      moveDrag(e.clientX, e.clientY);
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };
    const onMouseUp = () => endDrag();
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      presetTransition = null; // manual zoom interrupts/cancels any playing preset transition
      zoomTarget -= e.deltaY * 0.006; // was 0.01 — a single notch used to lurch
      zoomTarget = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomTarget));
    };

    let pinchStartDist = 0;
    let pinchStartZoom = zoomTarget;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        presetTransition = null;
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
        const scale = pinchStartDist / dist;
        zoomTarget = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom * scale));
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
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    let lastPointerX = -1000;
    let lastPointerY = -1000;
    let hoveredStation: THREE.Object3D | null = null;
    let hoveringExit = false;

    function handleTap(clientX: number, clientY: number) {
      mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);

      const stationHits = raycaster.intersectObjects(stations, true);
      if (stationHits.length) {
        let obj: THREE.Object3D | null = stationHits[0].object;
        while (obj && !obj.userData.name) obj = obj.parent;
        if (obj) {
          // clicking a focused station again does nothing; clicking a different one moves to it
          if (obj !== focusedStation) enterFocus(obj);
        }
        return;
      }
      const exitHits = [
        ...raycaster.intersectObject(exitDoor, true),
        ...raycaster.intersectObject(exitCue, true),
      ];
      if (exitHits.length) {
        onExit?.();
        return;
      }
      // while focused the floor is not a walk target: the character is not the subject
      const groundHit = focusedStation ? [] : raycaster.intersectObject(groundPlane);
      if (groundHit.length) {
        const pt = groundHit[0].point;
        charPath = findPath(character.position.x, character.position.z, pt.x, pt.z);
        if (charPath.length) {
          charTarget = charPath[0].clone();
          charMoving = true;
        }
      }
    }

    const onClick = (e: MouseEvent) => {
      if (dragDistance > 6) return;
      handleTap(e.clientX, e.clientY);
    };
    canvas.addEventListener("click", onClick);

    // see ExteriorScene: guards against a 0x0 canvas / NaN aspect when mounted at zero size, and
    // self-heals since it is re-checked every frame
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
      const elapsed = clock.getElapsedTime();

      if (presetTransition) {
        const t = Math.min((performance.now() - presetTransition.start) / PRESET_TRANSITION_MS, 1);
        const eased = easeInOutCubic(t);
        rotY = THREE.MathUtils.lerp(presetTransition.from.rotY, presetTransition.to.rotY, eased);
        rotX = THREE.MathUtils.lerp(presetTransition.from.rotX, presetTransition.to.rotX, eased);
        zoomTarget = THREE.MathUtils.lerp(presetTransition.from.zoom, presetTransition.to.zoom, eased);
        if (t >= 1) presetTransition = null;
      }

      // the applied angle chases the target instead of being set raw, so a flick glides to rest
      rotXCur = THREE.MathUtils.lerp(rotXCur, rotX, ORBIT_EASE);
      rotYCur = THREE.MathUtils.lerp(rotYCur, rotY, ORBIT_EASE);
      // the pivot eases too, so focusing slides the orbit centre onto the object rather than
      // cutting to it; same easing rate as the angle so the whole move reads as one gesture
      focusPivotCur.lerp(focusPivot, ORBIT_EASE);
      rig.position.copy(focusPivotCur);
      rig.rotation.y = rotYCur;
      rig.rotation.x = rotXCur;

      zoomCurrent = THREE.MathUtils.lerp(zoomCurrent, zoomTarget, 0.09);
      camera.position.set(0, 0, zoomCurrent);

      /* Shift the FRUSTUM, not the camera, so the focused object sits clear of the content panel.
         setViewOffset renders a window onto a larger virtual screen: pushing that window right
         moves the whole scene left, which parks the object in the free half of the viewport. Panning
         the camera instead would swing it off its own pivot and re-frame the object at an angle.
         The shift eases with `dim`, so it arrives with the zoom rather than snapping at the start. */
      const vw = renderer.domElement.clientWidth || window.innerWidth;
      const vh = renderer.domElement.clientHeight || window.innerHeight;
      const wide = vw / Math.max(1, vh) > 1.05;
      const shiftX = wide ? vw * 0.19 * dim : 0;
      const shiftY = wide ? 0 : -vh * 0.16 * dim; // narrow screens stack: object up, panel below
      if (dim > 0.001) {
        camera.setViewOffset(vw, vh, shiftX, shiftY, vw, vh);
      } else if (camera.view?.enabled) {
        camera.clearViewOffset();
      }

      // keep the orbit from pushing the camera through a wall or the ceiling
      camera.updateMatrixWorld();
      const camWorldPos = new THREE.Vector3();
      camera.getWorldPosition(camWorldPos);
      const pad = 0.7;
      camWorldPos.x = THREE.MathUtils.clamp(camWorldPos.x, -ROOM_HALF + pad, ROOM_HALF - pad);
      camWorldPos.z = THREE.MathUtils.clamp(camWorldPos.z, -ROOM_HALF + pad, ROOM_HALF - pad);
      camWorldPos.y = THREE.MathUtils.clamp(camWorldPos.y, 0.9, ROOM_HEIGHT - pad);
      rig.worldToLocal(camWorldPos);
      camera.position.copy(camWorldPos);

      /* ---- focus dimming ----
         Eased rather than switched, so the room falls away at the same rate the camera moves in. */
      dim = THREE.MathUtils.lerp(dim, dimTarget, 0.07);
      if (dim > 0.001) {
        const k = 1 - dim * 0.78; // the room keeps ~22% of its light: dimmed, never black
        for (const { light, base } of allLights) {
          if (light === focusLight) continue;
          light.intensity = base * k;
        }
        for (const e of emissives) {
          // the focused station's own emissive is handled by the glow pass below, not dimmed here
          if (e.owner === focusedStation) continue;
          e.mat.emissiveIntensity = e.base * (1 - dim * 0.82);
        }

        /* Two opposite treatments, driven off the same `dim`.
           The focused station powers on; every OTHER station washes out toward a pale cream so it
           recedes without disappearing. Desaturating is what separates them: dimming alone made the
           whole room darker together, and the focused object never actually stood out from it. */
        for (const [st, list] of stationGlow) {
          const focusedHere = st === focusedStation;
          /* If the focused station HAS a picture area, only that lights up and the rest of it stays
             at rest. Otherwise the screen wall's curtains picked up the same warm lift as the
             screen and bleached to pale tan, which both lost their colour and undercut the point:
             the screen is supposed to be the only thing emitting. Stations with no screen — the
             stand, the desk, the figure — glow as a whole, because there is nothing else to be. */
          const screenOnly = focusedHere && list.some((g) => g.isScreen);
          for (const g of list) {
            if (screenOnly && !g.isScreen) {
              g.mat.color.copy(g.base);
              g.mat.emissive.copy(g.color);
              g.mat.emissiveIntensity = g.intensity;
              continue;
            }
            if (!focusedHere) {
              // wash the colour out, but never all the way: they stay legible in the background
              g.mat.color.copy(g.base).lerp(PALE, dim * 0.72);
              g.mat.emissive.copy(g.color);
              g.mat.emissiveIntensity = g.intensity * (1 - dim * 0.82);
              continue;
            }

            g.mat.color.copy(g.base);
            if (g.isScreen) {
              // the picture area itself: this is the thing that reads as powered on
              g.mat.emissive.copy(g.color).lerp(SCREEN_ON, dim);
              g.mat.emissiveIntensity = g.intensity + dim * 1.15;
            } else {
              /* Boost by the HEADROOM a material has left, not by a flat amount, so surfaces that
                 already sit near full emissive do not push past white and come back as featureless
                 slabs. Dark ones, which is most of a popcorn stand, get the full lift. */
              const headroom = Math.max(0, 1 - Math.min(1, g.intensity));
              _glowMix.copy(g.color).lerp(GLOW_WARM, dim * (0.35 + 0.65 * headroom));
              g.mat.emissive.copy(_glowMix);
              g.mat.emissiveIntensity = g.intensity + dim * 0.5 * headroom;
            }
          }
        }
      } else if (focusLight.intensity !== 0) {
        // settle everything back exactly, so repeated focus cycles cannot drift
        for (const { light, base } of allLights) if (light !== focusLight) light.intensity = base;
        for (const e of emissives) e.mat.emissiveIntensity = e.base;
        for (const list of stationGlow.values())
          for (const g of list) {
            g.mat.color.copy(g.base); // undo the desaturation as well as the glow
            g.mat.emissive.copy(g.color);
            g.mat.emissiveIntensity = g.intensity;
          }
        focusLight.intensity = 0;
      }

      // subtle warm flicker — small enough to read as "alive lighting", not distracting
      // NOTE the dimK factor: these two run after the dim pass and would otherwise reset their own
      // lights to full brightness every frame, leaving the sconces and ceiling lamps undimmed.
      const dimK = 1 - dim * 0.78;
      sconceLights.forEach(({ light, baseIntensity, phase }) => {
        light.intensity = (baseIntensity + Math.sin(elapsed * 2.2 + phase) * baseIntensity * 0.07) * dimK;
      });
      ceilingLights.forEach(({ light, baseIntensity, phase }) => {
        light.intensity = (baseIntensity + Math.sin(elapsed * 1.7 + phase) * baseIntensity * 0.06) * dimK;
      });

      if (!isDragging) {
        mouseVec.x = (lastPointerX / window.innerWidth) * 2 - 1;
        mouseVec.y = -(lastPointerY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        const hits = raycaster.intersectObjects(stations, true);
        let hitObj: THREE.Object3D | null = null;
        if (hits.length) {
          hitObj = hits[0].object;
          while (hitObj && !hitObj.userData.name) hitObj = hitObj.parent;
        }
        hoveredStation = hitObj;
        hoveringExit =
          raycaster.intersectObject(exitDoor, true).length > 0 ||
          raycaster.intersectObject(exitCue, true).length > 0;
      }
      stations.forEach((s) => {
        const base = stationBaseScale.get(s) ?? 1;
        const target = s === hoveredStation ? base * 1.15 : base;
        s.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
      });
      const exitScale = hoveringExit ? 1.08 : 1;
      exitDoor.scale.lerp(new THREE.Vector3(exitScale, exitScale, exitScale), 0.15);

      // the cue nudges toward the door and breathes, so it reads as "this way out" at a glance
      const bob = Math.sin(elapsed * 2.1);
      exitArrow.position.x = bob * 0.13;
      exitArrow.children.forEach((c) => {
        const m = (c as THREE.Group).children[0] as THREE.Mesh;
        const mat = m?.material as THREE.MeshStandardMaterial | undefined;
        if (mat) mat.emissiveIntensity = 1.1 + (bob * 0.5 + 0.5) * 0.9;
      });
      exitCueLight.intensity = 4 + (Math.sin(elapsed * 2.1) * 0.5 + 0.5) * 3;
      const cueScale = hoveringExit ? 1.12 : 1;
      exitCue.scale.lerp(new THREE.Vector3(cueScale, cueScale, cueScale), 0.15);

      if (charMoving) {
        const dir = new THREE.Vector3().subVectors(charTarget, character.position);
        dir.y = 0;
        const dist = dir.length();
        if (dist < 0.08) {
          // waypoint reached — advance to the next leg, or finish
          charPath.shift();
          if (charPath.length) {
            charTarget = charPath[0].clone();
          } else {
            charMoving = false;
          }
        } else {
          const angle = Math.atan2(dir.x, dir.z);
          character.rotation.y = THREE.MathUtils.lerp(character.rotation.y, angle, 0.25);
          dir.normalize().multiplyScalar(Math.min(CHAR_SPEED, dist));
          const nx = character.position.x + dir.x;
          const nz = character.position.z + dir.z;
          // the route is already clear, so this is only a guard against clipping a corner
          const canX = !blocked(nx, character.position.z);
          const canZ = !blocked(character.position.x, nz);
          if (canX) character.position.x = nx;
          if (canZ) character.position.z = nz;
          if (!canX && !canZ) {
            charPath.shift(); // nudged into something — skip this leg rather than grinding
            if (charPath.length) charTarget = charPath[0].clone();
            else charMoving = false;
          }
          walkPhase += 0.3;
        }
      }

      // practical rides along with her, so her pool of light moves through the dim room
      charLight.position.set(character.position.x, 1.9, character.position.z);

      const swing = charMoving ? Math.sign(Math.sin(walkPhase * 4)) * 0.55 : 0;
      const lerpSpeed = 0.35;
      legL.pivot.rotation.x = THREE.MathUtils.lerp(legL.pivot.rotation.x, swing, lerpSpeed);
      legR.pivot.rotation.x = THREE.MathUtils.lerp(legR.pivot.rotation.x, -swing, lerpSpeed);
      armL.pivot.rotation.x = THREE.MathUtils.lerp(armL.pivot.rotation.x, -swing, lerpSpeed);
      armR.pivot.rotation.x = THREE.MathUtils.lerp(armR.pivot.rotation.x, swing, lerpSpeed);
      legL.knee.rotation.x = THREE.MathUtils.lerp(legL.knee.rotation.x, charMoving ? Math.max(0, swing) * 0.6 : 0, lerpSpeed);
      legR.knee.rotation.x = THREE.MathUtils.lerp(legR.knee.rotation.x, charMoving ? Math.max(0, -swing) * 0.6 : 0, lerpSpeed);

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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [dense, onOpenPanel, onReady, onExit]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          touchAction: "none",
          cursor: "crosshair",
        }}
      />
      {/* Shown only while the camera is focused on a station. Escape closes it too: a modal-ish
          state that can only be left by finding one small button is a trap on a keyboard. */}
      {focused && (
        <div
          style={{
            position: "fixed",
            // below the nav toggle, which also sits top-right: at 3.5vh the two overlapped
            top: "13vh",
            right: "4vw",
            zIndex: 12,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div
              className="mono"
              style={{
                fontSize: 9,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--burgundy)",
                marginBottom: 4,
              }}
            >
              {focused.eyebrow}
            </div>
            <div style={{ fontFamily: "'Bodoni Moda', serif", fontSize: 20, letterSpacing: "-0.01em" }}>
              {focused.title}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close and return to the full room"
            className="mono scene-close"
            onClick={() => exitFocusRef.current()}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}

      {focused && <StationPanel station={focused.name as StationKey} />}

      <div
        style={{
          position: "fixed",
          left: "5vw",
          bottom: "4vh",
          zIndex: 10,
          // the preset buttons drive the camera somewhere else entirely, so they are out of the way
          // while a station is focused rather than sitting there ready to break the state
          display: focused ? "none" : "flex",
          gap: 8,
        }}
      >
        {PRESET_BUTTONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="mono preset-btn"
            onClick={() => presetTriggerRef.current(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}