"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type StationData = {
  name: string;
  eyebrow: string;
  title: string;
  body: string;
};

type Props = {
  onOpenPanel: (data: StationData) => void;
  panelOpen?: boolean;
  dense?: boolean; // "play" mode gets a few extra stations
};

export default function Scene({ onOpenPanel, panelOpen = false, dense = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelOpenRef = useRef(panelOpen);
  panelOpenRef.current = panelOpen;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x05050a, 1); // fail-safe solid clear color — no white gaps regardless of page CSS

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.05);

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

    // --- palette ---
    const lineJet = 0x1c1c26;
    const lineBurgundy = 0x8a2f3c;
    const linePurple = 0x6b3fa0;
    const lineBlue = 0x4a5fd9; // rare accent only
    const amberGlow = 0xd9a765; // warm chandelier/window glow, borrowed from the reference room's mood

    function addWire(geo: THREE.BufferGeometry, color: number) {
      return new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
      );
    }
    // solid "toy brick" block used for the jointed character — solid + crisp black edge outline
    function addBlock(w: number, h: number, d: number, color: number) {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05 })
      );
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0x000000 })
      );
      group.add(mesh);
      group.add(edges);
      return group;
    }

    // ================= ROOM =================

    // ground grid
    function makeGrid() {
      const group = new THREE.Group();
      const size = 16,
        divisions = 16;
      const mat = new THREE.LineDashedMaterial({
        color: linePurple,
        dashSize: 0.12,
        gapSize: 0.12,
        transparent: true,
        opacity: 0.3,
      });
      for (let i = 0; i <= divisions; i++) {
        const t = -size / 2 + (size / divisions) * i;
        const g1 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-size / 2, 0, t),
          new THREE.Vector3(size / 2, 0, t),
        ]);
        const g2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(t, 0, -size / 2),
          new THREE.Vector3(t, 0, size / 2),
        ]);
        const l1 = new THREE.Line(g1, mat);
        l1.computeLineDistances();
        group.add(l1);
        const l2 = new THREE.Line(g2, mat);
        l2.computeLineDistances();
        group.add(l2);
      }
      return group;
    }
    scene.add(makeGrid());

    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    scene.add(groundPlane);

    const floorFill = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ color: 0x0f0f1c, transparent: true, opacity: 0.6 })
    );
    floorFill.rotation.x = -Math.PI / 2;
    floorFill.position.y = -0.01;
    scene.add(floorFill);

    // ceiling — closes the room from above, fixes the "white sky" gap
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ color: 0x08080f, side: THREE.DoubleSide })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 8;
    scene.add(ceiling);

    function makeWall(w: number, h: number, color: number) {
      const wireEdges = addWire(new THREE.PlaneGeometry(w, h), color);
      const fillMat = new THREE.MeshBasicMaterial({
        color: 0x0a0a14,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const fill = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fillMat);
      const group = new THREE.Group();
      group.add(fill);
      group.add(wireEdges);
      return group;
    }
    const backWall = makeWall(16, 8, lineBurgundy);
    backWall.position.set(0, 4, -8);
    scene.add(backWall);
    const leftWall = makeWall(16, 8, lineBurgundy);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-8, 4, 0);
    scene.add(leftWall);
    const rightWall = makeWall(16, 8, lineBurgundy);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(8, 4, 0);
    scene.add(rightWall);

    // arched window on the back wall — reference room's arched window, stylized as wireframe outline
    function makeArchedWindow() {
      const shape = new THREE.Shape();
      const w = 1.6,
        hStraight = 1.6,
        r = w / 2;
      shape.moveTo(-w / 2, 0);
      shape.lineTo(-w / 2, hStraight);
      shape.absarc(0, hStraight, r, Math.PI, 0, true);
      shape.lineTo(w / 2, 0);
      shape.lineTo(-w / 2, 0);
      const geo = new THREE.ShapeGeometry(shape);
      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: amberGlow, transparent: true, opacity: 0.9 })
      );
      const glowFill = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: amberGlow, transparent: true, opacity: 0.12 })
      );
      const group = new THREE.Group();
      group.add(glowFill);
      group.add(outline);
      // a couple of mullion bars for detail
      const bar1 = addWire(new THREE.BoxGeometry(0.02, hStraight + r, 0.02), amberGlow);
      bar1.position.set(0, (hStraight + r) / 2, 0.01);
      group.add(bar1);
      const bar2 = addWire(new THREE.BoxGeometry(w, 0.02, 0.02), amberGlow);
      bar2.position.set(0, hStraight * 0.5, 0.01);
      group.add(bar2);
      return group;
    }
    const archedWindow = makeArchedWindow();
    archedWindow.position.set(0, 3, -7.9);
    scene.add(archedWindow);

    // bookshelves on side walls — simplified frame + shelves + sparse books
    function makeBookshelf(color: number) {
      const group = new THREE.Group();
      const frame = addWire(new THREE.BoxGeometry(2.6, 4, 0.35), color);
      group.add(frame);
      [-1.7, -0.85, 0, 0.85, 1.7].forEach((y) => {
        const shelf = addWire(new THREE.BoxGeometry(2.5, 0.02, 0.32), color);
        shelf.position.set(0, y, 0);
        group.add(shelf);
      });
      const bookColors = [lineBurgundy, linePurple, lineJet, amberGlow];
      [-1.28, -0.43, 0.43, 1.28].forEach((y, rowIdx) => {
        for (let i = 0; i < 5; i++) {
          const bw = 0.12 + (i % 3) * 0.03;
          const book = addWire(new THREE.BoxGeometry(bw, 0.5, 0.28), bookColors[(i + rowIdx) % bookColors.length]);
          book.position.set(-1.0 + i * 0.5, y, 0);
          group.add(book);
        }
      });
      return group;
    }
    const shelfLeft = makeBookshelf(lineBurgundy);
    shelfLeft.rotation.y = Math.PI / 2;
    shelfLeft.position.set(-7.7, 2.2, -3);
    scene.add(shelfLeft);
    const shelfRight = makeBookshelf(lineBurgundy);
    shelfRight.rotation.y = -Math.PI / 2;
    shelfRight.position.set(7.7, 2.2, -3);
    scene.add(shelfRight);

    // chandelier — radiating arms with warm glowing tips, hanging above the desk
    function makeChandelier() {
      const group = new THREE.Group();
      const hub = addWire(new THREE.SphereGeometry(0.08, 8, 6), amberGlow);
      group.add(hub);
      const armCount = 6;
      for (let i = 0; i < armCount; i++) {
        const angle = (i / armCount) * Math.PI * 2;
        const arm = addWire(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), amberGlow);
        arm.position.set(Math.cos(angle) * 0.25, -0.2, Math.sin(angle) * 0.25);
        arm.rotation.z = Math.cos(angle) * 0.9;
        arm.rotation.x = Math.sin(angle) * -0.9;
        group.add(arm);
        const flame = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          new THREE.MeshBasicMaterial({ color: amberGlow })
        );
        flame.position.set(Math.cos(angle) * 0.42, -0.42, Math.sin(angle) * 0.42);
        group.add(flame);
        const flameLight = new THREE.PointLight(amberGlow, 0.4, 4);
        flameLight.position.copy(flame.position);
        group.add(flameLight);
      }
      const chain = addWire(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6), amberGlow);
      chain.position.set(0, 0.4, 0);
      group.add(chain);
      return group;
    }
    const chandelier = makeChandelier();
    chandelier.position.set(0, 7.2, -3);
    scene.add(chandelier);

    // ambient + warm fill light
    const ambient = new THREE.AmbientLight(0x2a2035, 0.6);
    scene.add(ambient);
    const warmLight = new THREE.PointLight(amberGlow, 0.6, 20);
    warmLight.position.set(0, 5, -2);
    scene.add(warmLight);

    // decorative leather armchairs in front of the desk (not stations, just atmosphere)
    function makeArmchair(color: number) {
      const group = new THREE.Group();
      const seat = addWire(new THREE.BoxGeometry(0.55, 0.35, 0.55), color);
      seat.position.y = 0.2;
      group.add(seat);
      const back = addWire(new THREE.BoxGeometry(0.55, 0.55, 0.12), color);
      back.position.set(0, 0.55, -0.22);
      group.add(back);
      const armL = addWire(new THREE.BoxGeometry(0.1, 0.3, 0.55), color);
      armL.position.set(-0.28, 0.4, 0);
      group.add(armL);
      const armR = addWire(new THREE.BoxGeometry(0.1, 0.3, 0.55), color);
      armR.position.set(0.28, 0.4, 0);
      group.add(armR);
      return group;
    }
    const chairL = makeArmchair(lineJet);
    chairL.position.set(-1.6, 0, 1.6);
    chairL.rotation.y = 0.4;
    scene.add(chairL);
    const chairR = makeArmchair(lineJet);
    chairR.position.set(1.6, 0, 1.6);
    chairR.rotation.y = -0.4;
    scene.add(chairR);

    // ================= THE ONE BIG DESK, HOLDING ALL STATION OBJECTS =================
    const stations: THREE.Object3D[] = [];
    const stationBaseScale = new Map<THREE.Object3D, number>();

    const deskRoot = new THREE.Group();
    deskRoot.position.set(0, 0, -3);
    scene.add(deskRoot);

    // desk carcass — partners-desk style: slab top + solid paneled front (kick panel) instead of open legs
    const deskTop = addWire(new THREE.BoxGeometry(4.2, 0.08, 1.7), lineJet);
    deskTop.position.set(0, 0.9, 0);
    deskRoot.add(deskTop);
    const deskPanel = addWire(new THREE.BoxGeometry(4.0, 0.85, 1.4), lineJet);
    deskPanel.position.set(0, 0.46, 0);
    deskRoot.add(deskPanel);
    const deskPanelFill = new THREE.Mesh(
      new THREE.BoxGeometry(3.98, 0.83, 1.38),
      new THREE.MeshBasicMaterial({ color: 0x0c0c14, transparent: true, opacity: 0.4 })
    );
    deskPanelFill.position.copy(deskPanel.position);
    deskRoot.add(deskPanelFill);

    // desk chair behind
    const deskChair = makeArmchair(lineBurgundy);
    deskChair.scale.set(1.1, 1.3, 1.1);
    deskChair.position.set(0, 0, -1.3);
    deskRoot.add(deskChair);

    // --- item 1: open journal -> About ---
    const journalGroup = new THREE.Group();
    const pageL = addWire(new THREE.BoxGeometry(0.4, 0.02, 0.55), 0xe9e6f0);
    pageL.rotation.z = 0.06;
    pageL.position.set(-0.21, 0, 0);
    journalGroup.add(pageL);
    const pageR = addWire(new THREE.BoxGeometry(0.4, 0.02, 0.55), 0xe9e6f0);
    pageR.rotation.z = -0.06;
    pageR.position.set(0.21, 0, 0);
    journalGroup.add(pageR);
    [-0.15, 0.05].forEach((z) => {
      const line = addWire(new THREE.BoxGeometry(0.28, 0.005, 0.01), linePurple);
      line.position.set(-0.21, 0.02, z);
      journalGroup.add(line);
    });
    journalGroup.position.set(-1.5, 0.955, 0);
    journalGroup.userData = {
      name: "about",
      eyebrow: "DESK ITEM / JOURNAL",
      title: "About",
      body: "Placeholder — bio copy renders here once content is locked.",
    };
    deskRoot.add(journalGroup);
    stations.push(journalGroup);

    // --- item 2: laptop -> Projects ---
    const laptopGroup = new THREE.Group();
    const laptopBase = addWire(new THREE.BoxGeometry(0.55, 0.03, 0.4), lineBurgundy);
    laptopGroup.add(laptopBase);
    const laptopScreen = addWire(new THREE.BoxGeometry(0.55, 0.38, 0.02), lineBurgundy);
    laptopScreen.position.set(0, 0.19, -0.19);
    laptopScreen.rotation.x = -0.35;
    laptopGroup.add(laptopScreen);
    laptopGroup.position.set(-0.4, 0.955, -0.1);
    laptopGroup.userData = {
      name: "projects",
      eyebrow: "DESK ITEM / LAPTOP",
      title: "Projects",
      body: "Placeholder — project index renders here.",
    };
    deskRoot.add(laptopGroup);
    stations.push(laptopGroup);

    // --- item 3: photo frame -> Contact ---
    const frameGroup = new THREE.Group();
    const framePanel = addWire(new THREE.BoxGeometry(0.32, 0.42, 0.02), lineBlue);
    framePanel.position.set(0, 0.21, 0);
    frameGroup.add(framePanel);
    const frameStand = addWire(new THREE.BoxGeometry(0.02, 0.14, 0.14), lineBlue);
    frameStand.rotation.x = -0.5;
    frameStand.position.set(0, 0.07, 0.07);
    frameGroup.add(frameStand);
    frameGroup.position.set(0.7, 0.955, 0.1);
    frameGroup.userData = {
      name: "contact",
      eyebrow: "DESK ITEM / PHOTO FRAME",
      title: "Contact",
      body: "Placeholder — email, LinkedIn, GitHub links render here.",
    };
    deskRoot.add(frameGroup);
    stations.push(frameGroup);

    if (dense) {
      // --- item 4: locked box -> Extra (play mode only) ---
      const boxGroup = new THREE.Group();
      const boxBody = addWire(new THREE.BoxGeometry(0.4, 0.24, 0.3), linePurple);
      boxGroup.add(boxBody);
      const lock = addWire(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), lineBurgundy);
      lock.rotation.x = Math.PI / 2;
      lock.position.set(0, 0, 0.16);
      boxGroup.add(lock);
      boxGroup.position.set(1.6, 0.97, -0.05);
      boxGroup.userData = {
        name: "extra",
        eyebrow: "DESK ITEM / LOCKED BOX",
        title: "???",
        body: "Placeholder — hidden extra / easter egg content.",
      };
      deskRoot.add(boxGroup);
      stations.push(boxGroup);
    }

    stations.forEach((s) => stationBaseScale.set(s, 1));

    const fillLight = new THREE.PointLight(0xffffff, 0.35);
    fillLight.position.set(5, 6, 5);
    scene.add(fillLight);

    // ================= JOINTED "LEGO-STYLE" CHARACTER =================
    // colors matching the confirmed outfit
    const cHair = 0x2b1a12;
    const cSkin = 0xd9a878;
    const cGlasses = 0x101014;
    const cShirt = 0x16161c;
    const cPants = 0x0d0d10;
    const cShoe = 0xc98b4a;

    const character = new THREE.Group();

    const hip = new THREE.Group();
    hip.position.y = 0.56;
    character.add(hip);

    function makeLeg() {
      const legPivot = new THREE.Group();
      const upper = addBlock(0.13, 0.28, 0.13, cPants);
      upper.position.y = -0.14;
      legPivot.add(upper);
      const kneePivot = new THREE.Group();
      kneePivot.position.y = -0.28;
      legPivot.add(kneePivot);
      const lower = addBlock(0.12, 0.26, 0.12, cPants);
      lower.position.y = -0.13;
      kneePivot.add(lower);
      const shoe = addBlock(0.14, 0.08, 0.2, cShoe);
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
    const torso = addBlock(0.32, 0.34, 0.18, cShirt);
    torso.position.y = 0.17;
    torsoGroup.add(torso);

    function makeArm() {
      const shoulderPivot = new THREE.Group();
      const upper = addBlock(0.11, 0.26, 0.11, cShirt);
      upper.position.y = -0.13;
      shoulderPivot.add(upper);
      const elbowPivot = new THREE.Group();
      elbowPivot.position.y = -0.26;
      shoulderPivot.add(elbowPivot);
      const lower = addBlock(0.1, 0.24, 0.1, cSkin);
      lower.position.y = -0.12;
      elbowPivot.add(lower);
      return { pivot: shoulderPivot, elbow: elbowPivot };
    }
    const armL = makeArm();
    armL.pivot.position.set(-0.21, 0.34, 0);
    torsoGroup.add(armL.pivot);
    const armR = makeArm();
    armR.pivot.position.set(0.21, 0.34, 0);
    torsoGroup.add(armR.pivot);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.42, 0);
    torsoGroup.add(headGroup);
    const face = addBlock(0.2, 0.18, 0.2, cSkin);
    face.position.y = 0.09;
    headGroup.add(face);
    const hair = addBlock(0.22, 0.1, 0.22, cHair);
    hair.position.y = 0.19;
    headGroup.add(hair);
    const glasses = addBlock(0.19, 0.05, 0.03, cGlasses);
    glasses.position.set(0, 0.1, 0.1);
    headGroup.add(glasses);

    character.position.set(0, 0, 1.5);
    scene.add(character);

    let charTarget = character.position.clone();
    let charMoving = false;
    let walkPhase = 0;

    // ================= CONTROLS: drag / pinch / hover / click =================
    let isDragging = false;
    let lastX = 0,
      lastY = 0;
    let dragDistance = 0;
    let rotX = -0.25,
      rotY = 0.4;
    let zoomTarget = window.innerWidth < 640 ? 17 : 13;
    let zoomCurrent = zoomTarget;
    const defaultZoom = zoomTarget;

    // camera dolly toward a clicked station
    let dollyActive = false;
    let dollyPoint = new THREE.Vector3(0, 0, 0);

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
      rotY += dx * 0.005;
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
      dollyActive = false;
      zoomTarget += e.deltaY * 0.01;
      zoomTarget = Math.max(6, Math.min(22, zoomTarget));
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
        dollyActive = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = pinchStartDist / dist;
        zoomTarget = Math.max(6, Math.min(22, pinchStartZoom * scale));
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

    function handleTap(clientX: number, clientY: number) {
      mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);

      const stationHits = raycaster.intersectObjects(stations, true);
      if (stationHits.length) {
        let obj: THREE.Object3D | null = stationHits[0].object;
        while (obj && !obj.userData.name) obj = obj.parent;
        if (obj) {
          onOpenPanel(obj.userData as StationData);
          dollyActive = true;
          obj.getWorldPosition(dollyPoint);
          zoomTarget = 6.5;
        }
        return;
      }
      dollyActive = false;
      zoomTarget = defaultZoom;
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
    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // reset dolly once the panel has been closed
      if (dollyActive && !panelOpenRef.current) {
        dollyActive = false;
        zoomTarget = defaultZoom;
      }

      rig.rotation.y = rotY;
      rig.rotation.x = rotX;
      zoomCurrent = THREE.MathUtils.lerp(zoomCurrent, zoomTarget, 0.08);
      camera.position.z = zoomCurrent;

      const desiredRigPos = dollyActive
        ? dollyPoint.clone().multiplyScalar(0.45)
        : new THREE.Vector3(0, 0, 0);
      rig.position.lerp(desiredRigPos, 0.06);

      // hover detection (only when not dragging, so drag rotation isn't fighting hover)
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
      }
      stations.forEach((s) => {
        const base = stationBaseScale.get(s) ?? 1;
        const target = s === hoveredStation ? base * 1.15 : base;
        s.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
      });

      // character movement + snappy "Lego" limb animation
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

      const swing = charMoving ? Math.sign(Math.sin(walkPhase * 4)) * 0.55 : 0; // snap between two poses, not smooth easing
      const lerpSpeed = 0.35; // fast snap, still avoids a literal instant teleport
      legL.pivot.rotation.x = THREE.MathUtils.lerp(legL.pivot.rotation.x, swing, lerpSpeed);
      legR.pivot.rotation.x = THREE.MathUtils.lerp(legR.pivot.rotation.x, -swing, lerpSpeed);
      armL.pivot.rotation.x = THREE.MathUtils.lerp(armL.pivot.rotation.x, -swing, lerpSpeed);
      armR.pivot.rotation.x = THREE.MathUtils.lerp(armR.pivot.rotation.x, swing, lerpSpeed);
      legL.knee.rotation.x = THREE.MathUtils.lerp(legL.knee.rotation.x, charMoving ? Math.max(0, swing) * 0.6 : 0, lerpSpeed);
      legR.knee.rotation.x = THREE.MathUtils.lerp(legR.knee.rotation.x, charMoving ? Math.max(0, -swing) * 0.6 : 0, lerpSpeed);

      renderer.render(scene, camera);
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
  }, [dense, onOpenPanel]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        touchAction: "none",
        cursor: "crosshair",
      }}
    />
  );
}
