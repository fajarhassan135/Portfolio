"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type StationData = {
  name: string;
  eyebrow: string;
  title: string;
  body: string;
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
    camera.position.set(0, 4, window.innerWidth < 640 ? 17 : 13);
    rig.add(camera);

    // --- palette (cinema) ---
    const cCarpet = 0x241016;
    const cWall = 0x1d1119;
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
      new THREE.MeshStandardMaterial({ color: 0x180a0e, roughness: 0.88 })
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
      new THREE.MeshStandardMaterial({ color: 0x0f0a10, roughness: 0.9, side: THREE.DoubleSide })
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
      group.add(off);

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
      const light = new THREE.PointLight(cAmber, 9, 9);
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
      const light = new THREE.PointLight(cAmber, 12, 10);
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
    const ambient = new THREE.AmbientLight(0x4a352c, 1.4);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x4a352c, 0x100a0c, 0.9);
    scene.add(hemi);

    const warmLight = new THREE.PointLight(cAmber, 45, 30);
    warmLight.position.set(0, 5, -5);
    warmLight.castShadow = true;
    warmLight.shadow.mapSize.set(1024, 1024);
    scene.add(warmLight);

    const fillLight = new THREE.PointLight(cAmber, 30, 24);
    fillLight.position.set(0, 5, 5.5);
    scene.add(fillLight);

    const keyLight = new THREE.DirectionalLight(0xfff2dc, 1.0);
    keyLight.position.set(4, 8, 2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // ================= CINEMA SEATS — widened, more columns each side =================
    function makeCinemaSeat(color: number) {
      const group = new THREE.Group();
      const opts = { roughness: 0.55 };
      const seat = addRoundedBlock(0.48, 0.32, 0.5, color, opts, 0.035);
      seat.position.y = 0.18;
      group.add(seat);
      const back = addRoundedBlock(0.48, 0.6, 0.12, color, opts, 0.035);
      back.position.set(0, 0.55, 0.19);
      group.add(back);
      const armL = addBlock(0.08, 0.22, 0.42, cSeatDark, opts);
      armL.position.set(-0.25, 0.32, 0);
      group.add(armL);
      const armR = addBlock(0.08, 0.22, 0.42, cSeatDark, opts);
      armR.position.set(0.25, 0.32, 0);
      group.add(armR);
      const leg = addBlock(0.4, 0.08, 0.44, cSeatDark, { roughness: 0.4, metalness: 0.3 });
      leg.position.y = 0.02;
      group.add(leg);
      return group;
    }
    // 10 rows deep now (was 5) — fills the room out toward the front wall/entrance,
    // still clear of the ticket booth/popcorn stand (x=±6.5) and the character's aisle spawn (x=0)
    const rowZs = [-5.5, -4.0, -2.5, -1.0, 0.5, 2.0, 3.5, 5.0, 6.5, 8.0];
    // was [-2.55,-1.7,-0.85, 0.85,1.7,2.55] (6/row) — now 10/row, aisle still open at center
    const rowXOffsets = [-4.25, -3.4, -2.55, -1.7, -0.85, 0.85, 1.7, 2.55, 3.4, 4.25];
    rowZs.forEach((z) => {
      rowXOffsets.forEach((x) => {
        const seat = makeCinemaSeat(cSeat);
        seat.position.set(x, 0, z);
        scene.add(seat);
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
    ticketBooth.position.set(-6.5, 0, 0); // was (-ROOM_HALF+1.5, 0, 6.5) — far corner, easy to miss
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
        body: "Placeholder — bio copy renders here once content is locked.",
      };
      return group;
    }
    const popcornStand = makePopcornStand();
    popcornStand.rotation.y = -Math.PI / 2; // faces -x, toward the aisle/center
    popcornStand.position.set(6.5, 0, 0); // was (ROOM_HALF-1.5, 0, 6.5)
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
    // entrance — front wall, off-center so it doesn't block the aisle sightline to the screen
    const entranceDoor = makeDoor("ENTRANCE", "#3fe07a");
    entranceDoor.rotation.y = Math.PI;
    entranceDoor.position.set(-7.5, 0, ROOM_HALF - 0.1);
    scene.add(entranceDoor);
    // exit — right-hand wall, clear of the sconces
    const exitDoor = makeDoor("EXIT", "#e0453f");
    exitDoor.rotation.y = -Math.PI / 2;
    exitDoor.position.set(ROOM_HALF - 0.1, 0, 5.2);
    scene.add(exitDoor);

    stations.forEach((s) => stationBaseScale.set(s, 1));

    // ================= JOINTED CHARACTER — capsule limbs, rounded torso/head =================
    const cHair = 0x2b1a12;
    const cSkin = 0xd9a878;
    const cShirt = 0x16161c;
    const cPants = 0x0d0d10;
    const cShoe = 0xc98b4a;

    const character = new THREE.Group();
    const hip = new THREE.Group();
    hip.position.y = 0.56;
    character.add(hip);

    function makeLeg() {
      const legPivot = new THREE.Group();
      const upper = addCapsule(0.065, 0.28, cPants);
      upper.position.y = -0.14;
      legPivot.add(upper);
      const kneePivot = new THREE.Group();
      kneePivot.position.y = -0.28;
      legPivot.add(kneePivot);
      const lower = addCapsule(0.058, 0.26, cPants);
      lower.position.y = -0.13;
      kneePivot.add(lower);
      const shoe = addRoundedBlock(0.14, 0.08, 0.2, cShoe, { roughness: 0.5 }, 0.025);
      shoe.position.set(0, -0.3, 0.04);
      kneePivot.add(shoe);
      return { pivot: legPivot, knee: kneePivot };
    }
    const legL = makeLeg();
    legL.pivot.position.x = -0.09;
    hip.add(legL.pivot);
    const legR = makeLeg();
    legR.pivot.position.x = 0.09;
    hip.add(legR.pivot);

    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.56;
    character.add(torsoGroup);
    const torso = addRoundedBlock(0.32, 0.34, 0.2, cShirt, undefined, 0.06);
    torso.position.y = 0.17;
    torsoGroup.add(torso);
    const neck = addSolid(new THREE.CylinderGeometry(0.045, 0.055, 0.09, 10), cSkin, { roughness: 0.6 });
    neck.position.y = 0.375;
    torsoGroup.add(neck);

    function makeArm() {
      const shoulderPivot = new THREE.Group();
      const shoulderCap = addSphere(0.058, cShirt);
      shoulderPivot.add(shoulderCap);
      const upper = addCapsule(0.055, 0.26, cShirt);
      upper.position.y = -0.13;
      shoulderPivot.add(upper);
      const elbowPivot = new THREE.Group();
      elbowPivot.position.y = -0.26;
      shoulderPivot.add(elbowPivot);
      const lower = addCapsule(0.048, 0.22, cSkin);
      lower.position.y = -0.11;
      elbowPivot.add(lower);
      const hand = addSphere(0.052, cSkin, { roughness: 0.6 });
      hand.position.y = -0.23;
      elbowPivot.add(hand);
      return { pivot: shoulderPivot, elbow: elbowPivot };
    }
    const armL = makeArm();
    armL.pivot.position.set(-0.21, 0.34, 0);
    torsoGroup.add(armL.pivot);
    const armR = makeArm();
    armR.pivot.position.set(0.21, 0.34, 0);
    torsoGroup.add(armR.pivot);

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

    character.position.set(0, 0, 1.5);
    scene.add(character);

    let charTarget = character.position.clone();
    let charMoving = false;
    let walkPhase = 0;

    // ================= CONTROLS — fixed pivot orbit =================
    let isDragging = false;
    let lastX = 0,
      lastY = 0;
    let dragDistance = 0;
    let rotX = -0.25,
      rotY = 0.4;
    let zoomTarget = window.innerWidth < 640 ? 17 : 13;
    let zoomCurrent = zoomTarget;
    const defaultZoom = zoomTarget;
    const focusZoom = 6.5;
    let preFocusZoom = defaultZoom;

    // ---- camera presets + station focus (nav-triggered eased transitions, separate from free drag) ----
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    type CameraPose = { rotY: number; rotX: number; zoom: number };
    const cameraPresets: Record<PresetName, CameraPose> = {
      wide: { rotY: 0.4, rotX: -0.25, zoom: defaultZoom },
      screen: { rotY: 0.05, rotX: -0.12, zoom: 8 },
      seats: { rotY: 0.65, rotX: -0.55, zoom: 10.5 },
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

    // zoom-only focus — eases in closer along whatever angle the camera is already viewing from
    function focusStation() {
      preFocusZoom = zoomTarget;
      presetTransition = {
        from: currentPose(),
        to: { rotY, rotX, zoom: focusZoom },
        start: performance.now(),
      };
    }
    function unfocusStation() {
      presetTransition = {
        from: currentPose(),
        to: { rotY, rotX, zoom: preFocusZoom },
        start: performance.now(),
      };
    }
    unfocusTriggerRef.current = unfocusStation;

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
      rotY -= dx * 0.005;
      rotX += dy * 0.004;
      rotX = Math.max(-0.9, Math.min(0.2, rotX));
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
      zoomTarget -= e.deltaY * 0.01;
      zoomTarget = Math.max(5, Math.min(15, zoomTarget));
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
        zoomTarget = Math.max(5, Math.min(15, pinchStartZoom * scale));
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
          focusStation();
          onOpenPanel(obj.userData as StationData);
        }
        return;
      }
      const exitHits = raycaster.intersectObject(exitDoor, true);
      if (exitHits.length) {
        onExit?.();
        return;
      }
      const groundHit = raycaster.intersectObject(groundPlane);
      if (groundHit.length) {
        charTarget = groundHit[0].point.clone();
        charMoving = true;
      }
    }

    const onClick = (e: MouseEvent) => {
      if (dragDistance > 6) return;
      handleTap(e.clientX, e.clientY);
    };
    canvas.addEventListener("click", onClick);

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

      rig.rotation.y = rotY;
      rig.rotation.x = rotX;

      zoomCurrent = THREE.MathUtils.lerp(zoomCurrent, zoomTarget, 0.08);
      camera.position.z = zoomCurrent;

      camera.updateMatrixWorld();
      const camWorldPos = new THREE.Vector3();
      camera.getWorldPosition(camWorldPos);
      const pad = 0.6;
      camWorldPos.x = THREE.MathUtils.clamp(camWorldPos.x, -ROOM_HALF + pad, ROOM_HALF - pad);
      camWorldPos.z = THREE.MathUtils.clamp(camWorldPos.z, -ROOM_HALF + pad, ROOM_HALF - pad);
      camWorldPos.y = THREE.MathUtils.clamp(camWorldPos.y, pad, ROOM_HEIGHT - pad);
      rig.worldToLocal(camWorldPos);
      camera.position.copy(camWorldPos);

      // subtle warm flicker — small enough to read as "alive lighting", not distracting
      sconceLights.forEach(({ light, baseIntensity, phase }) => {
        light.intensity = baseIntensity + Math.sin(elapsed * 2.2 + phase) * baseIntensity * 0.07;
      });
      ceilingLights.forEach(({ light, baseIntensity, phase }) => {
        light.intensity = baseIntensity + Math.sin(elapsed * 1.7 + phase) * baseIntensity * 0.06;
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
        hoveringExit = raycaster.intersectObject(exitDoor, true).length > 0;
      }
      stations.forEach((s) => {
        const base = stationBaseScale.get(s) ?? 1;
        const target = s === hoveredStation ? base * 1.15 : base;
        s.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
      });
      const exitScale = hoveringExit ? 1.08 : 1;
      exitDoor.scale.lerp(new THREE.Vector3(exitScale, exitScale, exitScale), 0.15);

      if (charMoving) {
        const dir = new THREE.Vector3().subVectors(charTarget, character.position);
        dir.y = 0;
        const dist = dir.length();
        if (dist < 0.05) {
          charMoving = false;
        } else {
          const angle = Math.atan2(dir.x, dir.z);
          character.rotation.y = THREE.MathUtils.lerp(character.rotation.y, angle, 0.2);
          dir.normalize().multiplyScalar(Math.min(0.05, dist));
          character.position.add(dir);
          walkPhase += 0.18;
        }
      }

      const swing = charMoving ? Math.sign(Math.sin(walkPhase * 4)) * 0.55 : 0;
      const lerpSpeed = 0.35;
      legL.pivot.rotation.x = THREE.MathUtils.lerp(legL.pivot.rotation.x, swing, lerpSpeed);
      legR.pivot.rotation.x = THREE.MathUtils.lerp(legR.pivot.rotation.x, -swing, lerpSpeed);
      armL.pivot.rotation.x = THREE.MathUtils.lerp(armL.pivot.rotation.x, -swing, lerpSpeed);
      armR.pivot.rotation.x = THREE.MathUtils.lerp(armR.pivot.rotation.x, swing, lerpSpeed);
      legL.knee.rotation.x = THREE.MathUtils.lerp(legL.knee.rotation.x, charMoving ? Math.max(0, swing) * 0.6 : 0, lerpSpeed);
      legR.knee.rotation.x = THREE.MathUtils.lerp(legR.knee.rotation.x, charMoving ? Math.max(0, -swing) * 0.6 : 0, lerpSpeed);

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
      <div
        style={{
          position: "fixed",
          left: "5vw",
          bottom: "4vh",
          zIndex: 10,
          display: "flex",
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