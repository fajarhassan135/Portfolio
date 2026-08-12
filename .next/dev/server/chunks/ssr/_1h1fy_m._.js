module.exports = [
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Scene$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Scene.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExteriorScene$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExteriorScene.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SidePanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SidePanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoadingScreen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LoadingScreen.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MusicToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MusicToggle.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function Home() {
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("ext-loading");
    const [extReady, setExtReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [intReady, setIntReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [panel, setPanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (stage === "ext-loading" && extReady) {
            const t = setTimeout(()=>setStage("exterior"), 950);
            return ()=>clearTimeout(t);
        }
    }, [
        stage,
        extReady
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (stage === "int-loading" && intReady) {
            const t = setTimeout(()=>setStage("interior"), 950);
            return ()=>clearTimeout(t);
        }
    }, [
        stage,
        intReady
    ]);
    // stable references — Scene/ExteriorScene key these into their setup effect's deps array,
    // so an inline arrow here would tear down and rebuild the whole 3D scene on every re-render
    // (e.g. every station click, since that flows through setPanel and re-renders this component)
    const handleEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setIntReady(false);
        setStage("int-loading");
    }, []);
    // mirrors handleEnter — same two-stage dance in reverse. Reusing "ext-loading" is safe: since
    // ExteriorScene is unmounted while showExterior is false, this is a genuine fresh mount, and
    // LoadingScreen (keyed off loadingPhase) remounts fresh too since it was unrendered in between.
    const handleExit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setExtReady(false);
        setStage("ext-loading");
    }, []);
    const handleExtReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setExtReady(true), []);
    const handleIntReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setIntReady(true), []);
    const showExterior = stage === "ext-loading" || stage === "exterior";
    const showInterior = stage === "int-loading" || stage === "interior";
    const loadingPhase = stage === "ext-loading" ? "ext" : stage === "int-loading" ? "int" : null;
    const loadingReady = loadingPhase === "ext" ? extReady : loadingPhase === "int" ? intReady : false;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            loadingPhase && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoadingScreen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                ready: loadingReady
            }, loadingPhase, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 57,
                columnNumber: 24
            }, this),
            showExterior && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExteriorScene$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                onEnter: handleEnter,
                onReady: handleExtReady
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 59,
                columnNumber: 24
            }, this),
            showInterior && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Scene$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                onOpenPanel: setPanel,
                onReady: handleIntReady,
                panelOpen: !!panel,
                onExit: handleExit
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this),
            stage === "interior" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "fixed",
                            left: "5vw",
                            top: "12vh",
                            zIndex: 10,
                            maxWidth: 440,
                            pointerEvents: "none",
                            background: "rgba(5,5,10,0.55)",
                            backdropFilter: "blur(6px)",
                            padding: "18px 22px",
                            borderRadius: 6,
                            borderLeft: "2px solid var(--burgundy)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "eyebrow",
                                style: {
                                    marginBottom: 12
                                },
                                children: "Portfolio — 2026"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: "clamp(22px, 3.2vw, 36px)",
                                    textShadow: "0 2px 12px rgba(0,0,0,0.8)"
                                },
                                children: "Walk up to the desk."
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mono desktop-only",
                        style: {
                            position: "fixed",
                            bottom: "4vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--purple-line)",
                            opacity: 0.7,
                            zIndex: 10,
                            background: "rgba(5,5,10,0.5)",
                            padding: "8px 16px",
                            borderRadius: 20
                        },
                        children: "drag to rotate · scroll to zoom · click ground to walk · hover + click an item to open it"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mono mobile-only",
                        style: {
                            position: "fixed",
                            bottom: "4vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 10,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--purple-line)",
                            opacity: 0.7,
                            zIndex: 10,
                            textAlign: "center",
                            background: "rgba(5,5,10,0.5)",
                            padding: "8px 16px",
                            borderRadius: 20
                        },
                        children: "drag to rotate · pinch to zoom · tap to walk or open an item"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SidePanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        data: panel,
                        onClose: ()=>setPanel(null)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MusicToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/ExteriorScene.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExteriorScene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$geometries$2f$RoundedBoxGeometry$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ExteriorScene({ onEnter, onReady }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
            canvas,
            antialias: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0a0a14, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PCFSoftShadowMap"];
        renderer.toneMapping = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACESFilmicToneMapping"];
        renderer.toneMappingExposure = 1.2;
        const scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        scene.fog = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FogExp2"](0x0a0a14, 0.011);
        // orbit rig, same pattern as the interior Scene — camera sits at a local offset from a pivot
        // group, so drag/scroll can freely rotate + zoom instead of being locked to a fixed framing
        const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PerspectiveCamera"](42, window.innerWidth / window.innerHeight, 0.1, 150);
        const rig = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        rig.position.set(0, 2, 6); // pivot near street level, a bit down the road from the entrance
        scene.add(rig);
        rig.add(camera);
        const cRoad = 0x18151d;
        const cSidewalk = 0x312b38;
        const cCurb = 0x4a4450;
        const cAmber = 0xe0aa70;
        const cGreen = 0x3fe07a;
        const cCurtain = 0x4d1420;
        function addSolid(geo, color, opts) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](geo, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color,
                map: opts?.map,
                roughness: opts?.roughness ?? 0.75,
                metalness: opts?.metalness ?? 0.05,
                emissive: opts?.emissive ?? 0x000000,
                emissiveIntensity: opts?.emissive ? opts?.emissiveIntensity ?? 0.6 : 0
            }));
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            return group;
        }
        function addBlock(w, h, d, color, opts) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](w, h, d), color, opts);
        }
        function addRoundedBlock(w, h, d, color, opts, radius = 0.035) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$geometries$2f$RoundedBoxGeometry$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundedBoxGeometry"](w, h, d, 2, radius), color, opts);
        }
        // capsule's straight length is (len - 2*r); pass the desired total tip-to-tip length
        function addCapsule(radius, length, color, opts) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CapsuleGeometry"](radius, Math.max(0.001, length - radius * 2), 6, 12), color, opts);
        }
        function addSphere(radius, color, opts) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](radius, 16, 12), color, opts);
        }
        // ================= PROCEDURAL TEXTURES — replaces the old flat-banded-box "brick" =================
        function makeBrickTexture() {
            const c = document.createElement("canvas");
            c.width = 512;
            c.height = 256;
            const ctx = c.getContext("2d");
            ctx.fillStyle = "#3a1c17";
            ctx.fillRect(0, 0, c.width, c.height);
            const brickW = 64, brickH = 28, gap = 6;
            let row = 0;
            for(let y = 0; y < c.height; y += brickH + gap){
                const offset = row % 2 === 0 ? 0 : brickW / 2;
                for(let x = -brickW; x < c.width + brickW; x += brickW + gap){
                    const shade = 0.85 + Math.random() * 0.3;
                    const r = Math.min(255, 90 * shade + 20);
                    const g = Math.min(255, 46 * shade + 10);
                    const b = Math.min(255, 38 * shade + 8);
                    ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
                    ctx.fillRect(x + offset, y, brickW, brickH);
                }
                row++;
            }
            const tex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](c);
            tex.wrapS = tex.wrapT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RepeatWrapping"];
            tex.repeat.set(4, 2);
            return tex;
        }
        function makeAsphaltTexture() {
            const c = document.createElement("canvas");
            c.width = 256;
            c.height = 256;
            const ctx = c.getContext("2d");
            ctx.fillStyle = "#17141c";
            ctx.fillRect(0, 0, c.width, c.height);
            for(let i = 0; i < 3600; i++){
                const v = 20 + Math.random() * 30;
                ctx.fillStyle = `rgba(${v},${v},${v + 4},${0.15 + Math.random() * 0.2})`;
                ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 3, 3);
            }
            const tex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](c);
            tex.wrapS = tex.wrapT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RepeatWrapping"];
            tex.repeat.set(10, 20);
            return tex;
        }
        const brickTexture = makeBrickTexture();
        const asphaltTexture = makeAsphaltTexture();
        function makeTextPlane(lines, color, w, h, glow, font = "bold 44px Arial, sans-serif", bg) {
            // 2x canvas resolution so text stays crisp when the camera zooms in close (interactive camera now allows that)
            const RES = 2;
            const canvasEl = document.createElement("canvas");
            canvasEl.width = 512 * RES;
            canvasEl.height = 256 * RES;
            const ctx = canvasEl.getContext("2d");
            if (bg) {
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
            }
            ctx.fillStyle = color;
            ctx.font = font.replace(/(\d+)px/, (_m, px)=>`${parseInt(px, 10) * RES}px`);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const lineHeight = canvasEl.height / (lines.length + 1);
            lines.forEach((line, i)=>{
                ctx.fillText(line, canvasEl.width / 2, lineHeight * (i + 1));
            });
            const texture = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](canvasEl);
            texture.colorSpace = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SRGBColorSpace"];
            const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                map: texture,
                transparent: !bg,
                emissive: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](bg ?? color),
                emissiveMap: texture,
                emissiveIntensity: glow,
                roughness: 0.5,
                depthWrite: false
            });
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](w, h), mat);
        }
        // ================= SKY =================
        const skyCanvas = document.createElement("canvas");
        skyCanvas.width = 8;
        skyCanvas.height = 256;
        const skyCtx = skyCanvas.getContext("2d");
        const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, "#0a0a1c");
        grad.addColorStop(0.55, "#161226");
        grad.addColorStop(1, "#2a1c26");
        skyCtx.fillStyle = grad;
        skyCtx.fillRect(0, 0, 8, 256);
        const sky = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](160, 55), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
            map: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](skyCanvas),
            fog: false,
            depthWrite: false
        }));
        sky.position.set(0, 16, -50);
        scene.add(sky);
        const starGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
        const starCount = 120;
        const starPos = new Float32Array(starCount * 3);
        for(let i = 0; i < starCount; i++){
            starPos[i * 3] = (Math.random() - 0.5) * 110;
            starPos[i * 3 + 1] = 12 + Math.random() * 18;
            starPos[i * 3 + 2] = -40 - Math.random() * 15;
        }
        starGeo.setAttribute("position", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](starPos, 3));
        const starMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointsMaterial"]({
            color: 0xffffff,
            size: 0.12,
            transparent: true,
            opacity: 0.5,
            fog: false
        });
        scene.add(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Points"](starGeo, starMat));
        // ================= GROUND — much larger, curb-delineated, textured, no visible edge =================
        const GROUND_SPAN = 200;
        const sidewalk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](GROUND_SPAN, 9), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: cSidewalk,
            roughness: 0.88
        }));
        sidewalk.rotation.x = -Math.PI / 2;
        sidewalk.position.set(0, 0, 3.5);
        sidewalk.receiveShadow = true;
        scene.add(sidewalk);
        const curb = addBlock(GROUND_SPAN, 0.18, 0.35, cCurb, {
            roughness: 0.6
        });
        curb.position.set(0, 0.09, 7.6);
        scene.add(curb);
        const road = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](GROUND_SPAN, 12), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: cRoad,
            map: asphaltTexture,
            roughness: 0.75
        }));
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, -0.01, 13);
        road.receiveShadow = true;
        scene.add(road);
        for(let x = -GROUND_SPAN / 2; x <= GROUND_SPAN / 2; x += 2.2){
            const dash = addBlock(1.1, 0.02, 0.18, 0xcac2b0, {
                roughness: 0.6
            });
            dash.position.set(x, 0.01, 13);
            scene.add(dash);
        }
        // crosswalk stripes near the entrance
        for(let x = -3.5; x <= 3.5; x += 0.9){
            const stripe = addBlock(0.5, 0.02, 2.2, 0xb8b0a0, {
                roughness: 0.7
            });
            stripe.position.set(x, 0.011, 8.5);
            scene.add(stripe);
        }
        // ================= DISTANT CITY — several depth bands, reads as a full skyline =================
        const cityBuildingConfigs = [];
        function addCityBand(zBase, xStart, xEnd, count, hMin, hMax) {
            for(let i = 0; i < count; i++){
                const x = xStart + (i + Math.random() * 0.6) * ((xEnd - xStart) / count);
                cityBuildingConfigs.push({
                    x,
                    z: zBase - Math.random() * 3,
                    w: 2.5 + Math.random() * 2.5,
                    h: hMin + Math.random() * (hMax - hMin)
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
        const cityWindowGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.35, 0.45);
        const cityWindowMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: cAmber,
            emissive: cAmber,
            emissiveIntensity: 1.2,
            fog: false
        });
        const cityWindowMatrices = [];
        const cBuildingFarPalette = [
            0x181622,
            0x1c1a2a,
            0x141220,
            0x201c2c,
            0x191725
        ];
        const flickerWindows = [];
        cityBuildingConfigs.forEach(({ x, z, w, h })=>{
            const tint = cBuildingFarPalette[Math.floor(Math.random() * cBuildingFarPalette.length)];
            const b = addBlock(w, h, 4, tint, {
                roughness: 0.9
            });
            b.position.set(x, h / 2, z);
            scene.add(b);
            // rooftop clutter on some buildings — breaks up the flat skyline silhouette
            if (Math.random() < 0.3) {
                const clutterH = 0.3 + Math.random() * 0.45;
                const clutter = addBlock(0.35 + Math.random() * 0.3, clutterH, 0.35 + Math.random() * 0.3, 0x100e18, {
                    roughness: 0.9
                });
                clutter.position.set(x + (Math.random() - 0.5) * w * 0.4, h + clutterH / 2, z);
                scene.add(clutter);
            }
            const cols = Math.max(1, Math.floor(w / 0.7));
            const rows = Math.max(1, Math.floor(h / 0.9));
            for(let c = 0; c < cols; c++){
                for(let r = 0; r < rows; r++){
                    const wx = x - w / 2 + 0.5 + c * 0.7;
                    const wy = 0.6 + r * 0.9;
                    if (Math.random() <= 0.38) {
                        cityWindowMatrices.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Matrix4"]().makeTranslation(wx, wy, z + 2.01));
                        continue;
                    }
                    // a few of the otherwise-dark cells get their own mesh so they can flicker independently
                    if (Math.random() < 0.06) {
                        const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                            color: cAmber,
                            emissive: cAmber,
                            emissiveIntensity: 0,
                            fog: false
                        });
                        const win = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](cityWindowGeo, mat);
                        win.position.set(wx, wy, z + 2.02);
                        scene.add(win);
                        flickerWindows.push({
                            mat,
                            phase: Math.random() * 100
                        });
                    }
                }
            }
        });
        const cityWindows = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InstancedMesh"](cityWindowGeo, cityWindowMat, cityWindowMatrices.length);
        cityWindowMatrices.forEach((m, i)=>cityWindows.setMatrixAt(i, m));
        cityWindows.instanceMatrix.needsUpdate = true;
        scene.add(cityWindows);
        // ================= MAIN CINEMA BUILDING — matches the reference's composition =================
        const facadeW = 15;
        const facade = addBlock(facadeW, 7, 3.5, 0x3a1c17, {
            roughness: 0.9,
            map: brickTexture
        });
        facade.position.set(0, 3.5, -4.8);
        scene.add(facade);
        const parapet = addBlock(facadeW + 0.4, 0.35, 3.9, 0x241612, {
            roughness: 0.8
        });
        parapet.position.set(0, 7.15, -4.8);
        scene.add(parapet);
        // cornice molding — thin protruding trim line breaking up the flat brick expanse
        const cornice = addBlock(facadeW + 0.3, 0.14, 3.7, 0x2a1710, {
            roughness: 0.75
        });
        cornice.position.set(0, 6.78, -4.8);
        scene.add(cornice);
        // pilasters — vertical stone-toned strips flanking the facade, plus small capitals near the top
        [
            -6.85,
            6.85
        ].forEach((x)=>{
            const pilaster = addBlock(0.42, 6.6, 3.65, 0x2c1712, {
                roughness: 0.8
            });
            pilaster.position.set(x, 3.3, -4.78);
            scene.add(pilaster);
            const capital = addRoundedBlock(0.55, 0.22, 3.7, 0x3a231a, {
                roughness: 0.7
            }, 0.03);
            capital.position.set(x, 6.55, -4.78);
            scene.add(capital);
        });
        // upper-facade round accent windows — small warm-lit portholes between the parapet and the marquee
        [
            -4.2,
            -1.4,
            1.4,
            4.2
        ].forEach((x)=>{
            const porthole = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.32, 0.32, 0.1, 16), 0x1a0f0a, {
                roughness: 0.6
            });
            porthole.rotation.x = Math.PI / 2;
            porthole.position.set(x, 5.9, -3.03);
            scene.add(porthole);
            const glow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CircleGeometry"](0.24, 16), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 1.1
            }));
            glow.position.set(x, 5.9, -2.97);
            scene.add(glow);
        });
        // rooftop silhouette — utility unit + antenna, breaks up the flat roofline against the sky
        const roofUnit = addBlock(1.6, 0.6, 1.1, 0x161018, {
            roughness: 0.85
        });
        roofUnit.position.set(-3.5, 7.62, -4.6);
        scene.add(roofUnit);
        const roofVent = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.22, 0.26, 0.35, 10), 0x161018, {
            roughness: 0.85
        });
        roofVent.position.set(2.6, 7.5, -4.9);
        scene.add(roofVent);
        // steam puffs — a handful of soft planes that rise and fade on a loop, restarted from the vent
        const steamPuffs = [];
        const steamMap = (()=>{
            const c = document.createElement("canvas");
            c.width = c.height = 64;
            const ctx = c.getContext("2d");
            const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            g.addColorStop(0, "rgba(255,255,255,0.5)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](c);
        })();
        for(let i = 0; i < 3; i++){
            const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
                map: steamMap,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                fog: false
            });
            const puff = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.5, 0.5), mat);
            puff.position.set(2.6, 7.7, -4.9);
            scene.add(puff);
            steamPuffs.push({
                mesh: puff,
                mat,
                startY: 7.7,
                offset: i * 1.3
            });
        }
        const antenna = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.02, 0.03, 1.6, 6), 0x0a0a0a, {
            roughness: 0.6,
            metalness: 0.4
        });
        antenna.position.set(4.8, 8.1, -5.0);
        scene.add(antenna);
        // brand sign above the marquee — mirrors the reference's theater-name plaque
        const brandSign = makeTextPlane([
            "FAJAR HASSAN"
        ], "#c9a35a", 8, 1.4, 1.3, "bold italic 60px Georgia, serif");
        brandSign.position.set(0, 6.1, -3.05);
        scene.add(brandSign);
        const brandLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](0xc9a35a, 10, 6);
        brandLight.position.set(0, 6.1, -2.2);
        scene.add(brandLight);
        // ================= MARQUEE — 3 lightbox panels: tagline / CINEMA / tagline =================
        const canopy = addBlock(11, 0.55, 2.6, 0x1a1014, {
            roughness: 0.55,
            metalness: 0.15
        });
        canopy.position.set(0, 4.5, -2.9);
        scene.add(canopy);
        const canopyFace = addBlock(11.05, 1.5, 0.12, 0x120d10, {
            roughness: 0.4,
            metalness: 0.3
        });
        canopyFace.position.set(0, 4.2, -1.65);
        scene.add(canopyFace);
        function makeMarqueePanel(lines, w, h, font) {
            const panel = makeTextPlane(lines, "#151015", w, h, 0.55, font, "#f1ead8");
            // thin grid overlay, echoing the reference's letterboard grid
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            group.add(panel);
            const cols = Math.floor(w / 0.55);
            for(let i = 1; i < cols; i++){
                const line = addBlock(0.012, h, 0.005, 0x3a3530, {
                    roughness: 0.7
                });
                line.position.set(-w / 2 + i * 0.55, 0, 0.01);
                group.add(line);
            }
            return group;
        }
        const tagLeft = makeMarqueePanel([
            "GOOD FILMS MAKE",
            "YOUR LIFE BETTER"
        ], 3.1, 1.15, "bold 30px Arial, sans-serif");
        tagLeft.position.set(-3.85, 4.2, -1.58);
        scene.add(tagLeft);
        const cinemaPanel = makeMarqueePanel([
            "CINEMA"
        ], 4.1, 1.3, "bold 64px Arial, sans-serif");
        cinemaPanel.position.set(0, 4.2, -1.58);
        scene.add(cinemaPanel);
        const tagRight = makeMarqueePanel([
            "SEE YOU AT",
            "THE MOVIES"
        ], 3.1, 1.15, "bold 30px Arial, sans-serif");
        tagRight.position.set(3.85, 4.2, -1.58);
        scene.add(tagRight);
        // marquee bulb strip — tracked so the animate loop can run a classic chase pattern along it
        const marqueeBulbs = [];
        function addMarqueeBulb(x, z) {
            const bulbMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 1.8
            });
            const bulb = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.055, 10, 8), bulbMat);
            bulb.position.set(x, 4.18, z);
            scene.add(bulb);
            marqueeBulbs.push(bulbMat);
        }
        // front edge, then both side "returns" so the chase wraps the whole canopy like a real marquee border
        for(let x = -5.2; x <= 5.2; x += 0.4)addMarqueeBulb(x, -1.05);
        for(let z = -1.4; z >= -2.75; z -= 0.35){
            addMarqueeBulb(-5.2, z);
            addMarqueeBulb(5.2, z);
        }
        [
            -3.5,
            0,
            3.5
        ].forEach((x)=>{
            const canopyGlow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 50, 13);
            canopyGlow.position.set(x, 4.2, -1.6);
            scene.add(canopyGlow);
        });
        // ================= TICKET BOOTH (left, matching reference) =================
        const kiosk = addBlock(1.5, 1.7, 1.0, 0x2e3a4a, {
            roughness: 0.5
        });
        kiosk.position.set(-4.6, 0.85, -1.9);
        scene.add(kiosk);
        const kioskWindow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.85, 0.6), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x0c0c10,
            roughness: 0.3,
            metalness: 0.2
        }));
        kioskWindow.position.set(-4.6, 1.05, -1.39);
        scene.add(kioskWindow);
        const ticketsSign = makeTextPlane([
            "TICKETS"
        ], "#151015", 0.75, 0.3, 0.6, "bold 26px Arial, sans-serif", "#f1ead8");
        ticketsSign.position.set(-4.6, 1.55, -1.38);
        scene.add(ticketsSign);
        const kioskLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 7, 4);
        kioskLight.position.set(-4.6, 1.05, -1.0);
        scene.add(kioskLight);
        // ================= POSTER CASE (right) — 2x2 grid, matching reference =================
        const posterCase = addBlock(1.6, 2.0, 0.15, 0x2e3a4a, {
            roughness: 0.5
        });
        posterCase.position.set(4.6, 1.8, -1.9);
        scene.add(posterCase);
        const posterColors = [
            0x6b2430,
            0x4a3560,
            0x35406b,
            0xd9a765
        ];
        const posterTitles = [
            "MIDNIGHT REEL",
            "NEON DRIFTER",
            "LAST SCREENING",
            "STARLIGHT NOIR"
        ];
        posterColors.forEach((c, i)=>{
            const px = i % 2 === 0 ? -0.36 : 0.36;
            const py = i < 2 ? 0.42 : -0.42;
            const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.65, 0.75), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: c,
                emissive: c,
                emissiveIntensity: 0.3,
                roughness: 0.6
            }));
            p.position.set(4.6 + px, 1.8 + py, -1.82);
            scene.add(p);
            // title strip along the bottom of each poster so the case reads as real listings, not swatches
            const titleStrip = makeTextPlane([
                posterTitles[i]
            ], "#f1ead8", 0.62, 0.14, 0.5, "bold 20px Arial, sans-serif", "#0a0608");
            titleStrip.position.set(4.6 + px, 1.8 + py - 0.305, -1.81);
            scene.add(titleStrip);
        });
        const posterLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](0xfff2dc, 7, 3.5);
        posterLight.position.set(4.6, 1.8, -1.2);
        scene.add(posterLight);
        // ================= ENTRANCE — curtain doorway, sign clear of all geometry =================
        const doorGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        const doorFrame = addBlock(2.6, 3.2, 0.35, 0x0a0608, {
            roughness: 0.7
        });
        doorFrame.position.set(0, 1.6, -3.9);
        doorGroup.add(doorFrame);
        const doorway = addBlock(2.1, 2.8, 0.15, 0x08050a, {
            roughness: 0.85
        });
        doorway.position.set(0, 1.5, -3.7);
        doorGroup.add(doorway);
        // door leaves — gives the opening an actual door reading instead of a plain dark gap behind the curtains
        [
            -1,
            1
        ].forEach((mirror)=>{
            const leaf = addBlock(0.92, 2.6, 0.06, 0x1c1418, {
                roughness: 0.5,
                metalness: 0.25
            });
            leaf.position.set(mirror * 0.47, 1.5, -3.68);
            doorGroup.add(leaf);
            const handle = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.02, 0.02, 0.4, 8), 0xc9a35a, {
                roughness: 0.3,
                metalness: 0.7
            });
            handle.rotation.z = Math.PI / 2;
            handle.position.set(mirror * 0.15, 1.4, -3.6);
            doorGroup.add(handle);
        });
        [
            -1.1,
            1.1
        ].forEach((mirror)=>{
            const drape = addBlock(0.55, 2.6, 0.22, cCurtain, {
                roughness: 0.85
            });
            drape.position.set(mirror * 1.15, 1.5, -3.65);
            doorGroup.add(drape);
        });
        doorGroup.userData = {
            clickable: "enter"
        };
        scene.add(doorGroup);
        const enterSign = makeTextPlane([
            "ENTER HERE"
        ], "#3fe07a", 3.0, 0.6, 2.6, "bold 64px Arial, sans-serif");
        enterSign.position.set(0, 3.55, -2.5);
        scene.add(enterSign);
        const enterMat = enterSign.material;
        const signBacking = addBlock(3.2, 0.75, 0.05, 0x0a0608, {
            roughness: 0.6
        });
        signBacking.position.set(0, 3.55, -2.56);
        scene.add(signBacking);
        const enterGlow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cGreen, 22, 8);
        enterGlow.position.set(0, 2.4, -2.6);
        scene.add(enterGlow);
        const enterGlowLow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cGreen, 14, 5);
        enterGlowLow.position.set(0, 1.0, -3.0);
        scene.add(enterGlowLow);
        const doorHitZone = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](3.4, 5.2, 2), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
            visible: false
        }));
        doorHitZone.position.set(0, 2.4, -3.0);
        scene.add(doorHitZone);
        // small brass address plaque beside the entrance — street-level dressing
        const addressPlaque = makeTextPlane([
            "142"
        ], "#c9a35a", 0.4, 0.22, 0.8, "bold 26px Georgia, serif", "#1a1210");
        addressPlaque.position.set(1.6, 1.05, -3.55);
        scene.add(addressPlaque);
        // ================= PROJECTING BLADE SIGN — perpendicular "CINEMA" sign, readable along the street =================
        const bladeMountX = facadeW / 2 + 0.15;
        const bladeBracket = addBlock(0.9, 0.1, 0.1, 0x1a1a1e, {
            roughness: 0.4,
            metalness: 0.55
        });
        bladeBracket.rotation.y = Math.PI / 2;
        bladeBracket.position.set(bladeMountX + 0.45, 4.6, -3.2);
        scene.add(bladeBracket);
        const bladeSign = makeTextPlane([
            "C",
            "I",
            "N",
            "E",
            "M",
            "A"
        ], "#3fe07a", 0.9, 3.0, 2.4, "bold 58px Arial, sans-serif", "#0a0608");
        bladeSign.rotation.y = Math.PI / 2;
        bladeSign.position.set(bladeMountX + 0.92, 3.6, -3.2);
        scene.add(bladeSign);
        const bladeGlow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cGreen, 16, 5);
        bladeGlow.position.set(bladeMountX + 0.92, 3.6, -3.2);
        scene.add(bladeGlow);
        // ================= SIDEWALK A-FRAME SIGN — street-level showtimes board near the entrance =================
        function makeSidewalkSign() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            [
                -0.22,
                0.22
            ].forEach((tiltX)=>{
                const panel = addBlock(0.55, 0.85, 0.04, 0x171018, {
                    roughness: 0.6
                });
                panel.position.set(tiltX, 0.425, 0);
                panel.rotation.y = tiltX < 0 ? 0.35 : -0.35;
                group.add(panel);
            });
            const board = makeTextPlane([
                "NOW SHOWING",
                "TONIGHT 8PM"
            ], "#f1ead8", 0.5, 0.7, 0.5, "bold 22px Arial, sans-serif", "#171018");
            board.position.set(-0.2, 0.425, 0.03);
            board.rotation.y = 0.35;
            group.add(board);
            return group;
        }
        const sidewalkSign = makeSidewalkSign();
        sidewalkSign.position.set(2.5, 0, -0.6);
        sidewalkSign.rotation.y = 0.4;
        scene.add(sidewalkSign);
        const sidewalkSignLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](0xfff2dc, 5, 2.5);
        sidewalkSignLight.position.set(2.5, 0.6, -0.4);
        scene.add(sidewalkSignLight);
        // ================= LIGHTING =================
        const ambient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AmbientLight"](0x33344a, 1.4);
        scene.add(ambient);
        const hemi = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HemisphereLight"](0x33344a, 0x0d0d16, 0.85);
        scene.add(hemi);
        const moonLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DirectionalLight"](0x8fa0c0, 0.65);
        moonLight.position.set(-8, 14, 8);
        moonLight.castShadow = true;
        scene.add(moonLight);
        function makeStreetlamp() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const pole = addBlock(0.12, 3.4, 0.12, 0x1a1a1e, {
                roughness: 0.4,
                metalness: 0.55
            });
            pole.position.y = 1.7;
            group.add(pole);
            const arm = addBlock(0.7, 0.08, 0.08, 0x1a1a1e, {
                roughness: 0.4,
                metalness: 0.55
            });
            arm.position.set(0.35, 3.35, 0);
            group.add(arm);
            const lamp = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.2, 10, 10), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 1.6
            }));
            lamp.position.set(0.68, 3.25, 0);
            group.add(lamp);
            const light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 30, 11);
            light.position.set(0.68, 3.15, 0);
            group.add(light);
            return {
                group,
                light,
                lampMat: lamp.material
            };
        }
        // moved onto the curb line (z=7.6), spaced well apart from the entrance/camera focus — refs kept
        // so a random lamp can flicker occasionally in the animate loop
        const streetlamps = [];
        [
            -13,
            -6.5,
            6.5,
            13
        ].forEach((x)=>{
            const { group, light, lampMat } = makeStreetlamp();
            group.position.set(x, 0, 7.6);
            scene.add(group);
            streetlamps.push({
                light,
                mat: lampMat,
                baseIntensity: 30
            });
        });
        // ================= STREET DRESSING — mostly on the left, to balance the bench+character on the right =================
        function makeTree(trunkH) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const trunk = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.09, 0.13, trunkH, 8), 0x2a1c14, {
                roughness: 0.85
            });
            trunk.position.y = trunkH / 2;
            group.add(trunk);
            const canopyColor = 0x1f3a24;
            const puffs = [
                [
                    0,
                    trunkH + 0.35,
                    0,
                    0.5
                ],
                [
                    0.25,
                    trunkH + 0.15,
                    0.15,
                    0.38
                ],
                [
                    -0.28,
                    trunkH + 0.2,
                    -0.1,
                    0.4
                ],
                [
                    0.05,
                    trunkH + 0.55,
                    -0.2,
                    0.36
                ]
            ];
            puffs.forEach(([x, y, z, s])=>{
                const puff = addSphere(s, canopyColor, {
                    roughness: 0.85
                });
                puff.position.set(x, y, z);
                group.add(puff);
            });
            return group;
        }
        function makeTrashCan() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const body = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.16, 0.14, 0.42, 12), 0x2c2f28, {
                roughness: 0.6,
                metalness: 0.3
            });
            body.position.y = 0.21;
            group.add(body);
            const lid = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.18, 0.18, 0.04, 12), 0x1e211c, {
                roughness: 0.5,
                metalness: 0.3
            });
            lid.position.y = 0.44;
            group.add(lid);
            return group;
        }
        function makeBench() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const seat = addBlock(1.5, 0.32, 0.55, 0x2a2530, {
                roughness: 0.7
            });
            seat.position.y = 0.16;
            group.add(seat);
            [
                -0.6,
                0.6
            ].forEach((x)=>{
                const leg = addBlock(0.1, 0.16, 0.5, 0x1a1620, {
                    roughness: 0.6
                });
                leg.position.set(x, 0.08, 0);
                group.add(leg);
            });
            return group;
        }
        function makeNewsstand() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const booth = addRoundedBlock(0.9, 1.0, 0.6, 0x24303a, {
                roughness: 0.6
            }, 0.03);
            booth.position.y = 0.5;
            group.add(booth);
            const roof = addRoundedBlock(1.05, 0.08, 0.75, 0x151d24, {
                roughness: 0.6
            }, 0.02);
            roof.position.y = 1.05;
            group.add(roof);
            const sign = makeTextPlane([
                "NEWS"
            ], "#151015", 0.55, 0.24, 0.6, "bold 34px Arial, sans-serif", "#f1ead8");
            sign.position.set(0, 1.16, 0.301);
            group.add(sign);
            const paperColor = 0xc9c2ae;
            for(let i = 0; i < 3; i++){
                const stack = addBlock(0.22, 0.06, 0.16, paperColor, {
                    roughness: 0.9
                });
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
        const benchGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        benchGroup.position.set(3.2, 0, 2.2);
        const bench = addRoundedBlock(1.5, 0.32, 0.55, 0x2a2530, {
            roughness: 0.7
        }, 0.04);
        bench.position.y = 0.16;
        benchGroup.add(bench);
        [
            -0.6,
            0.6
        ].forEach((x)=>{
            const leg = addBlock(0.1, 0.16, 0.5, 0x1a1620, {
                roughness: 0.6
            });
            leg.position.set(x, 0.08, 0);
            benchGroup.add(leg);
        });
        scene.add(benchGroup);
        const benchLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 20, 7);
        benchLight.position.set(3.2, 2.2, 2.2);
        scene.add(benchLight);
        // low warm fill, catches the face/limbs so the character reads as more than a silhouette
        const benchFillLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](0xfff0d8, 9, 3.5);
        benchFillLight.position.set(3.6, 0.9, 3.0);
        scene.add(benchFillLight);
        const character = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        character.scale.setScalar(1.4);
        character.position.set(3.2, 0.32, 2.2);
        character.rotation.y = -0.5;
        scene.add(character);
        const hip = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        hip.position.y = 0.4;
        character.add(hip);
        [
            -0.09,
            0.09
        ].forEach((x)=>{
            const thighPivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            thighPivot.position.x = x;
            thighPivot.rotation.x = -1.35;
            const thigh = addCapsule(0.065, 0.28, cPants);
            thigh.position.y = -0.14;
            thighPivot.add(thigh);
            const kneePivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            kneePivot.position.y = -0.28;
            kneePivot.rotation.x = 1.35;
            thighPivot.add(kneePivot);
            const shin = addCapsule(0.058, 0.26, cPants);
            shin.position.y = -0.13;
            kneePivot.add(shin);
            const shoe = addRoundedBlock(0.14, 0.08, 0.2, cShoe, {
                roughness: 0.5
            }, 0.025);
            shoe.position.set(0, -0.28, 0.05);
            kneePivot.add(shoe);
            hip.add(thighPivot);
        });
        const torsoGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        torsoGroup.position.y = 0.4;
        character.add(torsoGroup);
        const torso = addRoundedBlock(0.32, 0.34, 0.2, cShirt, undefined, 0.06);
        torso.position.y = 0.17;
        torsoGroup.add(torso);
        const neck = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.045, 0.055, 0.09, 10), cSkin, {
            roughness: 0.6
        });
        neck.position.y = 0.375;
        torsoGroup.add(neck);
        const restArm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        restArm.position.set(-0.21, 0.34, 0);
        restArm.rotation.x = -0.9;
        const restShoulderCap = addSphere(0.058, cShirt);
        restArm.add(restShoulderCap);
        const restUpper = addCapsule(0.055, 0.26, cShirt);
        restUpper.position.y = -0.13;
        restArm.add(restUpper);
        const restHand = addSphere(0.052, cSkin, {
            roughness: 0.6
        });
        restHand.position.y = -0.26;
        restArm.add(restHand);
        torsoGroup.add(restArm);
        // drinking arm — raises the can to the mouth on a slow repeating cycle
        const drinkShoulder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        drinkShoulder.position.set(0.21, 0.34, 0);
        torsoGroup.add(drinkShoulder);
        const drinkShoulderCap = addSphere(0.058, cShirt);
        drinkShoulder.add(drinkShoulderCap);
        const drinkUpper = addCapsule(0.055, 0.26, cShirt);
        drinkUpper.position.y = -0.13;
        drinkShoulder.add(drinkUpper);
        const drinkElbow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        drinkElbow.position.y = -0.26;
        drinkShoulder.add(drinkElbow);
        const drinkLower = addCapsule(0.048, 0.22, cSkin);
        drinkLower.position.y = -0.11;
        drinkElbow.add(drinkLower);
        const drinkHand = addSphere(0.052, cSkin, {
            roughness: 0.6
        });
        drinkHand.position.y = -0.23;
        drinkElbow.add(drinkHand);
        // energy-drink can, held in the drinking hand
        const drinkCan = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        const canBody = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.045, 0.045, 0.13, 16), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x2fd0c8,
            metalness: 0.6,
            roughness: 0.3
        }));
        drinkCan.add(canBody);
        const canRimTop = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.038, 0.045, 0.015, 16), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0xc7d6d6,
            metalness: 0.8,
            roughness: 0.25
        }));
        canRimTop.position.y = 0.0725;
        drinkCan.add(canRimTop);
        const canLabel = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](0.05, 0.05, 0.004), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0xe0aa70,
            emissive: 0xe0aa70,
            emissiveIntensity: 0.4,
            roughness: 0.5
        }));
        canLabel.position.set(0, 0, 0.046);
        drinkCan.add(canLabel);
        drinkCan.rotation.x = Math.PI / 2;
        drinkCan.position.set(0, -0.24, 0.05);
        drinkElbow.add(drinkCan);
        const headGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        headGroup.position.set(0, 0.44, 0);
        torsoGroup.add(headGroup);
        const face = addSphere(0.105, cSkin);
        face.position.y = 0.09;
        headGroup.add(face);
        const ear = (mirror)=>{
            const e = addSphere(0.022, cSkin);
            e.position.set(mirror * 0.1, 0.08, 0);
            headGroup.add(e);
        };
        ear(1);
        ear(-1);
        const hair = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.118, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: cHair,
            roughness: 0.75
        }));
        hair.position.y = 0.1;
        hair.castShadow = true;
        headGroup.add(hair);
        const eyeMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x18100e,
            roughness: 0.4
        });
        [
            -1,
            1
        ].forEach((m)=>{
            const eye = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.017, 8, 8), eyeMat);
            eye.position.set(m * 0.042, 0.11, 0.098);
            headGroup.add(eye);
        });
        const mouth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](0.05, 0.012, 0.01), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x7a4a42,
            roughness: 0.6
        }));
        mouth.position.set(0, 0.02, 0.103);
        headGroup.add(mouth);
        // ================= CONTROLS — drag to orbit, scroll to zoom (same model as the interior scene) =================
        let isDragging = false;
        let lastX = 0, lastY = 0;
        let dragDistance = 0;
        let rotX = -0.08, rotY = 0;
        let zoomTarget = 17;
        let zoomCurrent = zoomTarget;
        let swayAmount = 1; // eases toward 0 while dragging, 1 while idle — no hard on/off toggle
        function startDrag(x, y) {
            isDragging = true;
            lastX = x;
            lastY = y;
            dragDistance = 0;
        }
        function moveDrag(x, y) {
            if (!isDragging) return;
            const dx = x - lastX, dy = y - lastY;
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
        const onMouseDown = (e)=>startDrag(e.clientX, e.clientY);
        const onWheel = (e)=>{
            e.preventDefault();
            zoomTarget += e.deltaY * 0.015;
            zoomTarget = Math.max(9, Math.min(38, zoomTarget));
        };
        let pinchStartDist = 0;
        let pinchStartZoom = zoomTarget;
        const onTouchStart = (e)=>{
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
        const onTouchMove = (e)=>{
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
        const onTouchEnd = (e)=>{
            endDrag();
            if (e.changedTouches.length === 1 && dragDistance < 8) {
                handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        };
        canvas.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", endDrag);
        canvas.addEventListener("wheel", onWheel, {
            passive: false
        });
        canvas.addEventListener("touchstart", onTouchStart, {
            passive: true
        });
        canvas.addEventListener("touchmove", onTouchMove, {
            passive: false
        });
        canvas.addEventListener("touchend", onTouchEnd);
        // ================= RAYCAST =================
        const raycaster = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Raycaster"]();
        const mouseVec = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]();
        let lastPointerX = -1000;
        let lastPointerY = -1000;
        let hoveringDoor = false;
        const onMouseMove = (e)=>{
            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
            moveDrag(e.clientX, e.clientY);
        };
        function handleTap(clientX, clientY) {
            mouseVec.x = clientX / window.innerWidth * 2 - 1;
            mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVec, camera);
            if (raycaster.intersectObject(doorHitZone, true).length) onEnter();
        }
        const onClick = (e)=>{
            if (dragDistance > 6) return;
            handleTap(e.clientX, e.clientY);
        };
        window.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("click", onClick);
        // ================= AUDIO — real cricket trill + sparse car pass-by =================
        let audioCtx = null;
        let audioStopped = false;
        const cricketTimers = [];
        let carTimer = null;
        function playCricketTrill(baseFreq) {
            if (!audioCtx || audioStopped) return;
            const pulseCount = 16 + Math.floor(Math.random() * 10);
            for(let i = 0; i < pulseCount; i++){
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
        function scheduleCricketVoice(baseFreq, minGap, maxGap) {
            const delay = minGap + Math.random() * (maxGap - minGap);
            const timer = setTimeout(()=>{
                playCricketTrill(baseFreq);
                scheduleCricketVoice(baseFreq, minGap, maxGap);
            }, delay);
            cricketTimers.push(timer);
        }
        function playCarPassSound(durationMs, panFrom, panTo) {
            if (!audioCtx || audioStopped) return;
            const bufferSize = audioCtx.sampleRate * 2;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for(let i = 0; i < bufferSize; i++)data[i] = Math.random() * 2 - 1;
            const noise = audioCtx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;
            const filter = audioCtx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 300;
            const gain = audioCtx.createGain();
            gain.gain.value = 0;
            const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
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
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                scheduleCricketVoice(4300, 1500, 4000);
                scheduleCricketVoice(4850, 2200, 5200);
            } catch  {
            // audio unsupported — non-essential, skip silently
            }
        }
        const onFirstGesture = ()=>{
            if (audioCtx?.state === "suspended") audioCtx.resume();
            if (!audioCtx) startAmbientAudio();
            window.removeEventListener("pointerdown", onFirstGesture);
        };
        window.addEventListener("pointerdown", onFirstGesture);
        startAmbientAudio();
        // ================= SPARSE TRAFFIC — one car passes every so often, not constant =================
        const carColors = [
            0x2a3550,
            0x5a2530,
            0x2f4a3a,
            0x6b5a2a,
            0x3a3a4a,
            0x8a3a2a
        ];
        function makeCar(color) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const body = addRoundedBlock(1.5, 0.45, 0.7, color, {
                roughness: 0.4,
                metalness: 0.4
            }, 0.08);
            body.position.y = 0.32;
            group.add(body);
            const cabin = addRoundedBlock(0.8, 0.35, 0.62, color, {
                roughness: 0.4,
                metalness: 0.4
            }, 0.07);
            cabin.position.set(-0.1, 0.62, 0);
            group.add(cabin);
            const windowMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: 0x10141c,
                roughness: 0.25,
                metalness: 0.3
            });
            [
                -1,
                1
            ].forEach((side)=>{
                const win = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.62, 0.24), windowMat);
                win.position.set(-0.1, 0.63, side * 0.315);
                win.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
                group.add(win);
            });
            // wheels: cylinder axis rotated to point along Z (car's width) so the tire face reads correctly from the side
            const wheelGroups = [];
            [
                -0.5,
                0.5
            ].forEach((zx)=>{
                [
                    -0.36,
                    0.36
                ].forEach((zz)=>{
                    const wheelGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
                    const tire = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.17, 0.17, 0.13, 20), 0x0a0a0a, {
                        roughness: 0.7
                    });
                    tire.rotation.x = Math.PI / 2;
                    wheelGroup.add(tire);
                    const hub = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.07, 0.07, 0.145, 12), 0x6a6a72, {
                        roughness: 0.4,
                        metalness: 0.7
                    });
                    hub.rotation.x = Math.PI / 2;
                    wheelGroup.add(hub);
                    wheelGroup.position.set(zx, 0.17, zz * 0.62);
                    group.add(wheelGroup);
                    wheelGroups.push(wheelGroup);
                });
            });
            const headlight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.06, 10, 8), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: 0xfff2cc,
                emissive: 0xfff2cc,
                emissiveIntensity: 1.8
            }));
            headlight.position.set(0.76, 0.3, 0);
            group.add(headlight);
            const taillight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.05, 10, 8), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: 0xc93030,
                emissive: 0xc93030,
                emissiveIntensity: 1.4
            }));
            taillight.position.set(-0.76, 0.3, 0);
            group.add(taillight);
            const beam = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](0xfff2cc, 6, 4);
            beam.position.set(0.9, 0.3, 0);
            group.add(beam);
            return {
                group,
                wheelGroups
            };
        }
        // shared eased-motion curve, reused for car passes and the idle-sway crossfade below
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        const activeCars = [];
        // cars spawn/despawn within this smaller window (not the full 200-unit ground span) so they're
        // actually in view for most of their trip instead of spending most of it off-screen
        const TRAFFIC_HALF_RANGE = 42;
        const WHEEL_RADIUS = 0.17;
        function playHonk() {
            if (!audioCtx || audioStopped) return;
            const t0 = audioCtx.currentTime;
            [
                520,
                660
            ].forEach((freq, i)=>{
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "square";
                osc.frequency.setValueAtTime(freq, t0);
                gain.gain.setValueAtTime(0, t0);
                gain.gain.linearRampToValueAtTime(0.035, t0 + 0.02);
                gain.gain.setValueAtTime(0.035, t0 + 0.18 - i * 0.02);
                gain.gain.linearRampToValueAtTime(0, t0 + 0.22);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(t0);
                osc.stop(t0 + 0.24);
            });
        }
        function spawnCar() {
            if (activeCars.length >= 2) return; // up to 2 at once — a live street, not a jam
            const color = carColors[Math.floor(Math.random() * carColors.length)];
            const dir = Math.random() > 0.5 ? 1 : -1;
            const laneZ = 11 + Math.random() * 4;
            const speed = 4.5 + Math.random() * 2;
            const { group: mesh, wheelGroups } = makeCar(color);
            mesh.rotation.y = dir === 1 ? 0 : Math.PI;
            const startX = dir === 1 ? -TRAFFIC_HALF_RANGE : TRAFFIC_HALF_RANGE;
            const endX = dir === 1 ? TRAFFIC_HALF_RANGE : -TRAFFIC_HALF_RANGE;
            mesh.position.set(startX, 0, laneZ);
            scene.add(mesh);
            const durationMs = TRAFFIC_HALF_RANGE * 2 / speed * 1000;
            activeCars.push({
                mesh,
                wheelGroups,
                dir,
                speed,
                startX,
                endX,
                startTime: performance.now(),
                durationMs
            });
            playCarPassSound(durationMs, dir === 1 ? -1 : 1, dir === 1 ? 1 : -1);
            if (Math.random() < 0.15) setTimeout(playHonk, 400 + Math.random() * 800);
        }
        function scheduleNextCar() {
            const delay = 3500 + Math.random() * 4500; // frequent enough to feel like a living street
            carTimer = setTimeout(()=>{
                spawnCar();
                scheduleNextCar();
            }, delay);
        }
        carTimer = setTimeout(spawnCar, 800); // first car arrives quickly instead of after a long wait
        scheduleNextCar();
        // ================= STRAY CATS — seldom, wander the sidewalk, meow when they pass =================
        function makeCat(color) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const body = addCapsule(0.09, 0.32, color, {
                roughness: 0.85
            });
            body.rotation.z = Math.PI / 2;
            body.position.y = 0.16;
            group.add(body);
            const head = addSphere(0.09, color, {
                roughness: 0.85
            });
            head.position.set(0.17, 0.22, 0);
            group.add(head);
            [
                -1,
                1
            ].forEach((m)=>{
                const ear = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConeGeometry"](0.035, 0.06, 4), color, {
                    roughness: 0.85
                });
                ear.position.set(0.2, 0.29, m * 0.045);
                ear.rotation.x = m * 0.3;
                group.add(ear);
                const eye = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.014, 6, 6), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: 0x141414
                }));
                eye.position.set(0.245, 0.225, m * 0.045);
                group.add(eye);
            });
            const tail = addCapsule(0.024, 0.26, color, {
                roughness: 0.85
            });
            tail.rotation.z = -0.85;
            tail.position.set(-0.19, 0.25, 0);
            group.add(tail);
            const legPositions = [
                [
                    -0.1,
                    -0.06
                ],
                [
                    -0.1,
                    0.06
                ],
                [
                    0.1,
                    -0.06
                ],
                [
                    0.1,
                    0.06
                ]
            ];
            const legs = legPositions.map(([x, z])=>{
                const leg = addCapsule(0.024, 0.15, color, {
                    roughness: 0.85
                });
                leg.position.set(x, 0.075, z);
                group.add(leg);
                return leg;
            });
            return {
                group,
                legs
            };
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
        const catColors = [
            0x2b2320,
            0xe4d9c0,
            0xc98b4a
        ];
        const activeCats = [];
        const CAT_HALF_RANGE = 9;
        let catTimer = null;
        function spawnCat() {
            if (activeCats.length >= 2) return; // "two cats" — rare enough that both showing at once is a treat
            const dir = Math.random() > 0.5 ? 1 : -1;
            const speed = 1.1 + Math.random() * 0.5;
            const { group, legs } = makeCat(catColors[Math.floor(Math.random() * catColors.length)]);
            group.rotation.y = dir === 1 ? -Math.PI / 2 : Math.PI / 2;
            const startX = dir === 1 ? -CAT_HALF_RANGE : CAT_HALF_RANGE;
            group.position.set(startX, 0, 3.9); // along the sidewalk, in front of the building
            scene.add(group);
            activeCats.push({
                group,
                legs,
                dir,
                speed,
                meowed: false,
                startX
            });
        }
        function scheduleNextCat() {
            const delay = 20000 + Math.random() * 25000; // seldom — a rare passerby, not a fixture
            catTimer = setTimeout(()=>{
                spawnCat();
                scheduleNextCat();
            }, delay);
        }
        catTimer = setTimeout(spawnCat, 6000);
        scheduleNextCat();
        // ================= PEDESTRIAN — occasional walking silhouette on the sidewalk =================
        const cPedestrianColors = [
            0x232028,
            0x2c2632,
            0x1e2430,
            0x2a2020
        ];
        function makePedestrian() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const color = cPedestrianColors[Math.floor(Math.random() * cPedestrianColors.length)];
            const torso = addCapsule(0.09, 0.45, color, {
                roughness: 0.85
            });
            torso.position.y = 0.95;
            group.add(torso);
            const head = addSphere(0.09, cSkin, {
                roughness: 0.7
            });
            head.position.y = 1.32;
            group.add(head);
            const legs = [];
            [
                -1,
                1
            ].forEach((m)=>{
                const legPivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
                legPivot.position.set(m * 0.06, 0.72, 0);
                const leg = addCapsule(0.05, 0.62, 0x151318, {
                    roughness: 0.8
                });
                leg.position.y = -0.31;
                legPivot.add(leg);
                group.add(legPivot);
                legs.push(legPivot);
            });
            return {
                group,
                legs
            };
        }
        const activePedestrians = [];
        const PEDESTRIAN_HALF_RANGE = 10;
        let pedestrianTimer = null;
        function spawnPedestrian() {
            if (activePedestrians.length >= 1) return; // one at a time — a rare passerby, not a crowd
            const dir = Math.random() > 0.5 ? 1 : -1;
            const speed = 1.2 + Math.random() * 0.4;
            const { group, legs } = makePedestrian();
            group.rotation.y = dir === 1 ? -Math.PI / 2 : Math.PI / 2;
            const startX = dir === 1 ? -PEDESTRIAN_HALF_RANGE : PEDESTRIAN_HALF_RANGE;
            group.position.set(startX, 0, 4.4); // sidewalk, slightly further back than the cat lane
            scene.add(group);
            activePedestrians.push({
                group,
                legs,
                dir,
                speed,
                startX
            });
        }
        function scheduleNextPedestrian() {
            const delay = 22000 + Math.random() * 28000; // seldom, like the cats
            pedestrianTimer = setTimeout(()=>{
                spawnPedestrian();
                scheduleNextPedestrian();
            }, delay);
        }
        pedestrianTimer = setTimeout(spawnPedestrian, 10000);
        scheduleNextPedestrian();
        const clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Clock"]();
        let rafId;
        let readyFired = false;
        function animate() {
            rafId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            const delta = clock.getDelta();
            // idle sway layered on top of the user's drag position, small enough to feel alive without fighting input
            swayAmount = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(swayAmount, isDragging ? 0 : 1, 0.06);
            rig.rotation.y = rotY + Math.sin(elapsed * 0.15) * 0.02 * swayAmount;
            rig.rotation.x = rotX + Math.sin(elapsed * 0.1) * 0.01 * swayAmount;
            zoomCurrent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(zoomCurrent, zoomTarget, 0.08);
            camera.position.set(0, 2.6, zoomCurrent);
            for(let i = activeCars.length - 1; i >= 0; i--){
                const car = activeCars[i];
                const t = Math.min((performance.now() - car.startTime) / car.durationMs, 1);
                const prevX = car.mesh.position.x;
                car.mesh.position.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(car.startX, car.endX, easeInOutCubic(t));
                // wheels roll about their axle (local Z) proportional to actual distance covered this frame —
                // always the same sign since a car's local "forward" is consistent regardless of world direction
                const rollDelta = Math.abs(car.mesh.position.x - prevX) / WHEEL_RADIUS;
                car.wheelGroups.forEach((w)=>w.rotation.z -= rollDelta);
                if (t >= 1) {
                    scene.remove(car.mesh);
                    activeCars.splice(i, 1);
                }
            }
            for(let i = activeCats.length - 1; i >= 0; i--){
                const cat = activeCats[i];
                cat.group.position.x += cat.dir * cat.speed * delta;
                cat.legs.forEach((leg, li)=>{
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
            for(let i = activePedestrians.length - 1; i >= 0; i--){
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
            streetlamps.forEach((lamp, i)=>{
                const dip = Math.sin(elapsed * 1.7 + i * 12.3) > 0.965 ? 0.35 : 1;
                lamp.light.intensity = lamp.baseIntensity * dip;
                lamp.mat.emissiveIntensity = 1.6 * dip;
            });
            steamPuffs.forEach((p)=>{
                const cycle = (elapsed + p.offset) % 4 / 4;
                p.mesh.position.y = p.startY + cycle * 1.4;
                p.mesh.position.x = 2.6 + Math.sin(elapsed * 0.8 + p.offset) * 0.15;
                p.mat.opacity = Math.sin(cycle * Math.PI) * 0.35;
                const scale = 1 + cycle * 1.8;
                p.mesh.scale.set(scale, scale, 1);
            });
            mouseVec.x = lastPointerX / window.innerWidth * 2 - 1;
            mouseVec.y = -(lastPointerY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVec, camera);
            hoveringDoor = raycaster.intersectObject(doorHitZone, true).length > 0;
            enterGlow.intensity = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(enterGlow.intensity, hoveringDoor ? 34 : 22, 0.15);
            const signScale = hoveringDoor ? 1.1 : 1;
            enterSign.scale.lerp(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](signScale, signScale, 1), 0.15);
            // neon buzz — a quick brightness dip on the ENTER sign, like a flickering tube
            const buzz = Math.sin(elapsed * 46) > 0.92 ? 0.45 : 1;
            enterMat.emissiveIntensity = 2.6 * buzz;
            // classic theater marquee chase — two overlapping pulses traveling opposite ways down the bulb strip
            marqueeBulbs.forEach((mat, i)=>{
                const wave1 = Math.sin(elapsed * 4 - i * 0.9);
                const wave2 = Math.sin(elapsed * -2.3 - i * 1.6) * 0.4;
                mat.emissiveIntensity = 1.3 + (wave1 + wave2) * 0.9;
            });
            starMat.opacity = 0.4 + Math.sin(elapsed * 1.3) * 0.1 + Math.sin(elapsed * 2.7) * 0.06;
            // scattered dark city windows flicker to life on their own slow, staggered cycles
            flickerWindows.forEach(({ mat, phase })=>{
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
        const onResize = ()=>{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);
        return ()=>{
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
    }, [
        onEnter,
        onReady
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        style: {
            position: "fixed",
            inset: 0,
            cursor: "pointer"
        }
    }, void 0, false, {
        fileName: "[project]/components/ExteriorScene.tsx",
        lineNumber: 1421,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/LoadingScreen.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoadingScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const SEGMENTS = 22;
// hand-set checkpoints, uneven gaps on purpose — mimics real chunky loading
// rather than a perfectly smooth count, and the gaps widen near the end so
// the last few numbers land slower, building anticipation
const STEPS = [
    1,
    3,
    5,
    8,
    10,
    14,
    18,
    23,
    29,
    35,
    41,
    47,
    53,
    59,
    65,
    70,
    75,
    79,
    83,
    86,
    88,
    90,
    92
];
const STEP_DELAY_MS = 260; // base gap between jumps
const STEP_DELAY_GROWTH = 1.05; // each jump waits slightly longer than the last
function LoadingScreen({ ready }) {
    const [stepIndex, setStepIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    // advance one checkpoint at a time, each wait slightly longer than the last
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (ready) return;
        if (stepIndex >= STEPS.length - 1) return;
        const delay = STEP_DELAY_MS * Math.pow(STEP_DELAY_GROWTH, stepIndex);
        timerRef.current = setTimeout(()=>setStepIndex((i)=>i + 1), delay);
        return ()=>clearTimeout(timerRef.current);
    }, [
        stepIndex,
        ready
    ]);
    // once ready, snap to 100 then fade out
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!ready) return;
        const fadeTimer = setTimeout(()=>setVisible(false), 420);
        const unmountTimer = setTimeout(()=>setMounted(false), 950);
        return ()=>{
            clearTimeout(fadeTimer);
            clearTimeout(unmountTimer);
        };
    }, [
        ready
    ]);
    if (!mounted) return null;
    const pct = ready ? 100 : STEPS[stepIndex];
    const litSegments = Math.round(pct / 100 * SEGMENTS);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#05050a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: visible ? 1 : 0,
            transition: "opacity 500ms ease",
            pointerEvents: visible ? "auto" : "none"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mono",
                style: {
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "var(--purple-line)",
                    opacity: 0.85,
                    marginBottom: 14
                },
                children: "Loading Scene"
            }, void 0, false, {
                fileName: "[project]/components/LoadingScreen.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mono",
                style: {
                    fontSize: "clamp(18px, 2.2vw, 24px)",
                    color: "#ece7d8",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    marginBottom: 16
                },
                children: [
                    pct,
                    "%"
                ]
            }, void 0, true, {
                fileName: "[project]/components/LoadingScreen.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 2,
                    width: "min(170px, 44vw)",
                    height: 10
                },
                children: Array.from({
                    length: SEGMENTS
                }).map((_, i)=>{
                    const lit = i < litSegments;
                    const t = i / (SEGMENTS - 1);
                    const litColor = `color-mix(in srgb, var(--burgundy) ${(1 - t) * 100}%, var(--purple-line) ${t * 100}%)`;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            height: "100%",
                            background: lit ? litColor : "rgba(255,255,255,0.08)",
                            transition: "background 90ms steps(1)"
                        }
                    }, i, false, {
                        fileName: "[project]/components/LoadingScreen.tsx",
                        lineNumber: 106,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/LoadingScreen.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LoadingScreen.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/MusicToggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MusicToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function MusicToggle() {
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errored, setErrored] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggle = ()=>{
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(()=>setPlaying(true)).catch(()=>setErrored(true));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                ref: audioRef,
                src: "/audio/theme.mp3",
                loop: true,
                preload: "none"
            }, void 0, false, {
                fileName: "[project]/components/MusicToggle.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: toggle,
                className: "mono",
                style: {
                    position: "fixed",
                    bottom: "4vh",
                    right: "5vw",
                    zIndex: 30,
                    background: "rgba(5,5,10,0.6)",
                    border: "1px solid var(--purple-line)",
                    color: errored ? "var(--burgundy)" : "var(--vellum)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "10px 16px",
                    borderRadius: 20,
                    cursor: "pointer"
                },
                children: errored ? "No track loaded" : playing ? "♪ Music on" : "Put on music"
            }, void 0, false, {
                fileName: "[project]/components/MusicToggle.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MusicToggle.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/Scene.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Scene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$geometries$2f$RoundedBoxGeometry$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const PRESET_BUTTONS = [
    {
        id: "wide",
        label: "Wide"
    },
    {
        id: "screen",
        label: "Screen"
    },
    {
        id: "seats",
        label: "Seats"
    }
];
function Scene({ onOpenPanel, onReady, panelOpen = false, dense = false, onExit }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const presetTriggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(()=>{});
    const unfocusTriggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(()=>{});
    const wasPanelOpenRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(panelOpen);
    // station panel closing (not opening — the click handler drives the focus-in transition itself)
    // eases the camera back out of its pan+zoom focus on the clicked station
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (wasPanelOpenRef.current && !panelOpen) {
            unfocusTriggerRef.current();
        }
        wasPanelOpenRef.current = panelOpen;
    }, [
        panelOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
            canvas,
            antialias: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x05050a, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PCFSoftShadowMap"];
        renderer.toneMapping = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ACESFilmicToneMapping"];
        renderer.toneMappingExposure = 1.3;
        const scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        scene.background = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0x05050a);
        scene.fog = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FogExp2"](0x05050a, 0.025);
        const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PerspectiveCamera"](45, window.innerWidth / window.innerHeight, 0.1, 100);
        const rig = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
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
        function addSolid(geo, color, opts) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](geo, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color,
                roughness: opts?.roughness ?? 0.7,
                metalness: opts?.metalness ?? 0.1,
                emissive: opts?.emissive ?? 0x000000,
                emissiveIntensity: opts?.emissive ? opts?.emissiveIntensity ?? 0.6 : 0
            }));
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const edges = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineSegments"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EdgesGeometry"](geo), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineBasicMaterial"]({
                color: 0x000000,
                transparent: true,
                opacity: 0.35
            }));
            group.add(mesh);
            group.add(edges);
            return group;
        }
        function addBlock(w, h, d, color, opts) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](w, h, d), color, opts);
        }
        function addRoundedBlock(w, h, d, color, opts, radius = 0.035) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$geometries$2f$RoundedBoxGeometry$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundedBoxGeometry"](w, h, d, 2, radius), color, opts);
        }
        // capsule's straight length is (len - 2*r); pass the desired total tip-to-tip length
        function addCapsule(radius, length, color, opts) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CapsuleGeometry"](radius, Math.max(0.001, length - radius * 2), 6, 12), color, opts);
        }
        function addSphere(radius, color, opts) {
            return addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](radius, 16, 12), color, opts);
        }
        // ================= ROOM =================
        const ROOM_HALF = 11;
        const ROOM_HEIGHT = 10;
        const floor = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](ROOM_HALF * 2, ROOM_HALF * 2), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: cCarpet,
            roughness: 0.88
        }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        const aisle = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](1.1, ROOM_HALF * 2 - 1), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x180a0e,
            roughness: 0.88
        }));
        aisle.rotation.x = -Math.PI / 2;
        aisle.position.set(0, 0.005, 0);
        aisle.receiveShadow = true;
        scene.add(aisle);
        const groundPlane = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](ROOM_HALF * 2, ROOM_HALF * 2), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
            visible: false
        }));
        groundPlane.rotation.x = -Math.PI / 2;
        scene.add(groundPlane);
        const ceiling = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](ROOM_HALF * 2, ROOM_HALF * 2), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x0f0a10,
            roughness: 0.9,
            side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
        }));
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = ROOM_HEIGHT;
        ceiling.receiveShadow = true;
        scene.add(ceiling);
        function makeWall() {
            const wall = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](ROOM_HALF * 2, ROOM_HEIGHT), cWall, {
                roughness: 0.85
            });
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
        const stations = [];
        const stationBaseScale = new Map();
        function makeScreenWall() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const screenW = 8.6, screenH = 4.3;
            const frame = addRoundedBlock(screenW + 0.5, screenH + 0.5, 0.15, 0x0a0608, {
                roughness: 0.85
            }, 0.05);
            frame.position.set(0, screenH / 2 + 0.4, 0.05);
            group.add(frame);
            const off = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](screenW, screenH), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cScreenOff,
                roughness: 0.55,
                metalness: 0.1,
                emissive: cScreenOff,
                emissiveIntensity: 0.15
            }));
            off.position.set(0, screenH / 2 + 0.4, 0.13);
            group.add(off);
            const rimLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 3, 6);
            rimLight.position.set(0, screenH / 2 + 0.4, 1.2);
            group.add(rimLight);
            function makeCurtain(mirror) {
                const cGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
                const body = addBlock(1.3, ROOM_HEIGHT - 1.4, 0.35, cCurtain, {
                    roughness: 0.85
                });
                body.position.set(mirror * (screenW / 2 + 1.0), (ROOM_HEIGHT - 1.4) / 2, 0.1);
                cGroup.add(body);
                for(let i = 0; i < 5; i++){
                    const fold = addBlock(0.14, ROOM_HEIGHT - 1.6, 0.06, cCurtainFold, {
                        roughness: 0.9
                    });
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
                body: "Placeholder — featured case studies (including company work) render here."
            };
            return group;
        }
        const screenWall = makeScreenWall();
        screenWall.position.set(0, 0, -ROOM_HALF + 0.15);
        scene.add(screenWall);
        stations.push(screenWall);
        // ================= WALL SCONCES (tracked for flicker) =================
        const sconceLights = [];
        function makeSconce() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const backing = addBlock(0.18, 0.32, 0.1, cGold, {
                roughness: 0.35,
                metalness: 0.6
            });
            group.add(backing);
            const bulb = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.07, 14, 12), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 1.4
            }));
            bulb.position.set(0, 0, 0.09);
            group.add(bulb);
            const light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 9, 9);
            light.position.set(0, 0, 0.2);
            group.add(light);
            sconceLights.push({
                light,
                baseIntensity: 9,
                phase: Math.random() * Math.PI * 2
            });
            return group;
        }
        [
            -7,
            -2,
            3,
            7.5
        ].forEach((z)=>{
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
        const ceilingLights = [];
        function makeCeilingLight() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const disc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.16, 0.16, 0.04, 16), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 1.3
            }));
            group.add(disc);
            const light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 12, 10);
            light.position.set(0, -0.3, 0);
            group.add(light);
            ceilingLights.push({
                light,
                baseIntensity: 12,
                phase: Math.random() * Math.PI * 2
            });
            return group;
        }
        [
            -5,
            -1.5,
            2,
            5.5
        ].forEach((z)=>{
            [
                -4,
                0,
                4
            ].forEach((x)=>{
                const dl = makeCeilingLight();
                dl.position.set(x, ROOM_HEIGHT - 0.1, z);
                scene.add(dl);
            });
        });
        // ================= LIGHTING =================
        const ambient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AmbientLight"](0x4a352c, 1.4);
        scene.add(ambient);
        const hemi = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HemisphereLight"](0x4a352c, 0x100a0c, 0.9);
        scene.add(hemi);
        const warmLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 45, 30);
        warmLight.position.set(0, 5, -5);
        warmLight.castShadow = true;
        warmLight.shadow.mapSize.set(1024, 1024);
        scene.add(warmLight);
        const fillLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 30, 24);
        fillLight.position.set(0, 5, 5.5);
        scene.add(fillLight);
        const keyLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DirectionalLight"](0xfff2dc, 1.0);
        keyLight.position.set(4, 8, 2);
        keyLight.castShadow = true;
        scene.add(keyLight);
        // ================= CINEMA SEATS — widened, more columns each side =================
        function makeCinemaSeat(color) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const opts = {
                roughness: 0.55
            };
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
            const leg = addBlock(0.4, 0.08, 0.44, cSeatDark, {
                roughness: 0.4,
                metalness: 0.3
            });
            leg.position.y = 0.02;
            group.add(leg);
            return group;
        }
        // 10 rows deep now (was 5) — fills the room out toward the front wall/entrance,
        // still clear of the ticket booth/popcorn stand (x=±6.5) and the character's aisle spawn (x=0)
        const rowZs = [
            -5.5,
            -4.0,
            -2.5,
            -1.0,
            0.5,
            2.0,
            3.5,
            5.0,
            6.5,
            8.0
        ];
        // was [-2.55,-1.7,-0.85, 0.85,1.7,2.55] (6/row) — now 10/row, aisle still open at center
        const rowXOffsets = [
            -4.25,
            -3.4,
            -2.55,
            -1.7,
            -0.85,
            0.85,
            1.7,
            2.55,
            3.4,
            4.25
        ];
        rowZs.forEach((z)=>{
            rowXOffsets.forEach((x)=>{
                const seat = makeCinemaSeat(cSeat);
                seat.position.set(x, 0, z);
                scene.add(seat);
            });
        });
        // ================= TICKET BOOTH — moved off the far wall, into the main sightline =================
        function makeTicketBooth() {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const opts = {
                roughness: 0.5
            };
            const body = addRoundedBlock(1.3, 1.6, 0.9, cBoothWood, opts, 0.05);
            body.position.y = 0.8;
            group.add(body);
            const roof = addRoundedBlock(1.5, 0.1, 1.1, cBoothWoodDark, opts, 0.025);
            roof.position.y = 1.65;
            group.add(roof);
            const window_ = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.55, 0.5), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 0.9
            }));
            window_.position.set(0, 0.95, 0.46);
            group.add(window_);
            const windowLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](cAmber, 5, 5);
            windowLight.position.set(0, 0.95, 0.7);
            group.add(windowLight);
            group.userData = {
                name: "contact",
                eyebrow: "TICKET BOOTH",
                title: "Contact",
                body: "Placeholder — email, LinkedIn, GitHub links render here."
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
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const cart = addRoundedBlock(0.9, 0.7, 0.6, cBoothWood, {
                roughness: 0.5
            }, 0.04);
            cart.position.y = 0.35;
            group.add(cart);
            // striped bucket — base red cylinder + alternating white vertical stripes
            const bucket = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.22, 0.16, 0.4, 24), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: 0xc23a2e,
                roughness: 0.55
            }));
            bucket.position.set(0, 0.9, 0);
            group.add(bucket);
            const stripeCount = 8;
            for(let i = 0; i < stripeCount; i += 2){
                const angle = i / stripeCount * Math.PI * 2;
                const stripe = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](0.09, 0.4, 0.02), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: 0xf1ead8,
                    roughness: 0.7
                }));
                const r = 0.19;
                stripe.position.set(Math.cos(angle) * r, 0.9, Math.sin(angle) * r);
                stripe.rotation.y = -angle;
                group.add(stripe);
            }
            // individual popcorn kernels piled in a mound, instead of one plain sphere
            const kernelMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: 0xf3ecd9,
                roughness: 0.95
            });
            const kernelMatShade = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: 0xe4d9b8,
                roughness: 0.95
            });
            const kernelPositions = [
                [
                    0,
                    1.14,
                    0,
                    0.09
                ],
                [
                    0.09,
                    1.11,
                    0.05,
                    0.075
                ],
                [
                    -0.08,
                    1.12,
                    -0.04,
                    0.075
                ],
                [
                    0.03,
                    1.18,
                    -0.08,
                    0.07
                ],
                [
                    -0.1,
                    1.09,
                    0.08,
                    0.065
                ],
                [
                    0.1,
                    1.17,
                    -0.02,
                    0.065
                ],
                [
                    -0.03,
                    1.2,
                    0.09,
                    0.07
                ],
                [
                    0.06,
                    1.08,
                    -0.11,
                    0.06
                ],
                [
                    -0.11,
                    1.15,
                    0.02,
                    0.06
                ],
                [
                    0.0,
                    1.22,
                    -0.01,
                    0.065
                ]
            ];
            kernelPositions.forEach(([x, y, z, s], i)=>{
                const kernel = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IcosahedronGeometry"](s, 0), i % 3 === 0 ? kernelMatShade : kernelMat);
                kernel.position.set(x, y, z);
                kernel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                kernel.castShadow = true;
                group.add(kernel);
            });
            const awning = addBlock(1.1, 0.06, 0.7, cCurtain, {
                roughness: 0.7
            });
            awning.position.y = 1.5;
            group.add(awning);
            group.userData = {
                name: "about",
                eyebrow: "CONCESSION STAND",
                title: "About",
                body: "Placeholder — bio copy renders here once content is locked."
            };
            return group;
        }
        const popcornStand = makePopcornStand();
        popcornStand.rotation.y = -Math.PI / 2; // faces -x, toward the aisle/center
        popcornStand.position.set(6.5, 0, 0); // was (ROOM_HALF-1.5, 0, 6.5)
        scene.add(popcornStand);
        stations.push(popcornStand);
        if (dense) {
            const projGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const boothFace = addBlock(1.2, 0.9, 0.15, cBoothWoodDark, {
                roughness: 0.6
            });
            projGroup.add(boothFace);
            const projWindow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](0.7, 0.4), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                color: cAmber,
                emissive: cAmber,
                emissiveIntensity: 1.0
            }));
            projWindow.position.z = 0.08;
            projGroup.add(projWindow);
            projGroup.position.set(0, 5.6, ROOM_HALF - 0.4);
            projGroup.rotation.y = Math.PI;
            projGroup.userData = {
                name: "extra",
                eyebrow: "PROJECTION BOOTH",
                title: "???",
                body: "Placeholder — hidden extra / easter egg content."
            };
            scene.add(projGroup);
            stations.push(projGroup);
        }
        // ================= ENTRANCE / EXIT DOORS — decorative, mounted on the room walls =================
        function makeSignPlane(text, color, w, h, glow) {
            const c = document.createElement("canvas");
            c.width = 512;
            c.height = 256;
            const ctx = c.getContext("2d");
            ctx.fillStyle = color;
            ctx.font = "bold 84px Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, c.width / 2, c.height / 2);
            const tex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](c);
            tex.colorSpace = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SRGBColorSpace"];
            const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                map: tex,
                transparent: true,
                emissive: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](color),
                emissiveMap: tex,
                emissiveIntensity: glow,
                roughness: 0.5,
                depthWrite: false
            });
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](w, h), mat);
        }
        function makeDoor(label, signColor) {
            const group = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const frame = addRoundedBlock(2.2, 3.0, 0.15, 0x1a0f10, {
                roughness: 0.7
            }, 0.04);
            frame.position.y = 1.5;
            group.add(frame);
            [
                -0.5,
                0.5
            ].forEach((mirror)=>{
                const panel = addRoundedBlock(0.95, 2.6, 0.08, 0x241318, {
                    roughness: 0.6,
                    metalness: 0.15
                }, 0.03);
                panel.position.set(mirror * 0.52, 1.5, 0.05);
                group.add(panel);
                const handle = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.02, 0.02, 0.35, 8), cGoldDoor, {
                    roughness: 0.3,
                    metalness: 0.7
                });
                handle.rotation.z = Math.PI / 2;
                handle.position.set(mirror * 0.15, 1.5, 0.11);
                group.add(handle);
            });
            const sign = makeSignPlane(label, signColor, 1.5, 0.42, 1.8);
            sign.position.set(0, 3.25, 0.09);
            group.add(sign);
            const signLight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PointLight"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](signColor).getHex(), 7, 4.5);
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
        stations.forEach((s)=>stationBaseScale.set(s, 1));
        // ================= JOINTED CHARACTER — capsule limbs, rounded torso/head =================
        const cHair = 0x2b1a12;
        const cSkin = 0xd9a878;
        const cShirt = 0x16161c;
        const cPants = 0x0d0d10;
        const cShoe = 0xc98b4a;
        const character = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        const hip = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        hip.position.y = 0.56;
        character.add(hip);
        function makeLeg() {
            const legPivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const upper = addCapsule(0.065, 0.28, cPants);
            upper.position.y = -0.14;
            legPivot.add(upper);
            const kneePivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            kneePivot.position.y = -0.28;
            legPivot.add(kneePivot);
            const lower = addCapsule(0.058, 0.26, cPants);
            lower.position.y = -0.13;
            kneePivot.add(lower);
            const shoe = addRoundedBlock(0.14, 0.08, 0.2, cShoe, {
                roughness: 0.5
            }, 0.025);
            shoe.position.set(0, -0.3, 0.04);
            kneePivot.add(shoe);
            return {
                pivot: legPivot,
                knee: kneePivot
            };
        }
        const legL = makeLeg();
        legL.pivot.position.x = -0.09;
        hip.add(legL.pivot);
        const legR = makeLeg();
        legR.pivot.position.x = 0.09;
        hip.add(legR.pivot);
        const torsoGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        torsoGroup.position.y = 0.56;
        character.add(torsoGroup);
        const torso = addRoundedBlock(0.32, 0.34, 0.2, cShirt, undefined, 0.06);
        torso.position.y = 0.17;
        torsoGroup.add(torso);
        const neck = addSolid(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CylinderGeometry"](0.045, 0.055, 0.09, 10), cSkin, {
            roughness: 0.6
        });
        neck.position.y = 0.375;
        torsoGroup.add(neck);
        function makeArm() {
            const shoulderPivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            const shoulderCap = addSphere(0.058, cShirt);
            shoulderPivot.add(shoulderCap);
            const upper = addCapsule(0.055, 0.26, cShirt);
            upper.position.y = -0.13;
            shoulderPivot.add(upper);
            const elbowPivot = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
            elbowPivot.position.y = -0.26;
            shoulderPivot.add(elbowPivot);
            const lower = addCapsule(0.048, 0.22, cSkin);
            lower.position.y = -0.11;
            elbowPivot.add(lower);
            const hand = addSphere(0.052, cSkin, {
                roughness: 0.6
            });
            hand.position.y = -0.23;
            elbowPivot.add(hand);
            return {
                pivot: shoulderPivot,
                elbow: elbowPivot
            };
        }
        const armL = makeArm();
        armL.pivot.position.set(-0.21, 0.34, 0);
        torsoGroup.add(armL.pivot);
        const armR = makeArm();
        armR.pivot.position.set(0.21, 0.34, 0);
        torsoGroup.add(armR.pivot);
        const headGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"]();
        headGroup.position.set(0, 0.44, 0);
        torsoGroup.add(headGroup);
        const face = addSphere(0.105, cSkin);
        face.position.y = 0.09;
        headGroup.add(face);
        const ear = (mirror)=>{
            const e = addSphere(0.022, cSkin);
            e.position.set(mirror * 0.1, 0.08, 0);
            headGroup.add(e);
        };
        ear(1);
        ear(-1);
        const hair = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.118, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: cHair,
            roughness: 0.75
        }));
        hair.position.y = 0.1;
        hair.castShadow = true;
        headGroup.add(hair);
        const eyeMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x18100e,
            roughness: 0.4
        });
        [
            -1,
            1
        ].forEach((m)=>{
            const eye = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SphereGeometry"](0.017, 8, 8), eyeMat);
            eye.position.set(m * 0.042, 0.11, 0.098);
            headGroup.add(eye);
        });
        const mouth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](0.05, 0.012, 0.01), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
            color: 0x7a4a42,
            roughness: 0.6
        }));
        mouth.position.set(0, 0.02, 0.103);
        headGroup.add(mouth);
        character.position.set(0, 0, 1.5);
        scene.add(character);
        let charTarget = character.position.clone();
        let charMoving = false;
        let walkPhase = 0;
        // ================= CONTROLS — fixed pivot orbit =================
        let isDragging = false;
        let lastX = 0, lastY = 0;
        let dragDistance = 0;
        let rotX = -0.25, rotY = 0.4;
        let zoomTarget = window.innerWidth < 640 ? 17 : 13;
        let zoomCurrent = zoomTarget;
        const defaultZoom = zoomTarget;
        const focusZoom = 6.5;
        let preFocusZoom = defaultZoom;
        // ---- camera presets + station focus (nav-triggered eased transitions, separate from free drag) ----
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        const cameraPresets = {
            wide: {
                rotY: 0.4,
                rotX: -0.25,
                zoom: defaultZoom
            },
            screen: {
                rotY: 0.05,
                rotX: -0.12,
                zoom: 8
            },
            seats: {
                rotY: 0.65,
                rotX: -0.55,
                zoom: 10.5
            }
        };
        const PRESET_TRANSITION_MS = 1200;
        let presetTransition = null;
        function currentPose() {
            return {
                rotY,
                rotX,
                zoom: zoomTarget
            };
        }
        function goToPreset(name) {
            presetTransition = {
                from: currentPose(),
                to: cameraPresets[name],
                start: performance.now()
            };
        }
        presetTriggerRef.current = goToPreset;
        // zoom-only focus — eases in closer along whatever angle the camera is already viewing from
        function focusStation() {
            preFocusZoom = zoomTarget;
            presetTransition = {
                from: currentPose(),
                to: {
                    rotY,
                    rotX,
                    zoom: focusZoom
                },
                start: performance.now()
            };
        }
        function unfocusStation() {
            presetTransition = {
                from: currentPose(),
                to: {
                    rotY,
                    rotX,
                    zoom: preFocusZoom
                },
                start: performance.now()
            };
        }
        unfocusTriggerRef.current = unfocusStation;
        function startDrag(x, y) {
            presetTransition = null; // drag interrupts/cancels any playing preset/focus transition
            isDragging = true;
            lastX = x;
            lastY = y;
            dragDistance = 0;
        }
        function moveDrag(x, y) {
            if (!isDragging) return;
            const dx = x - lastX, dy = y - lastY;
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
        const onMouseDown = (e)=>startDrag(e.clientX, e.clientY);
        const onMouseMove = (e)=>{
            moveDrag(e.clientX, e.clientY);
            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
        };
        const onMouseUp = ()=>endDrag();
        const onWheel = (e)=>{
            e.preventDefault();
            presetTransition = null; // manual zoom interrupts/cancels any playing preset transition
            zoomTarget -= e.deltaY * 0.01;
            zoomTarget = Math.max(5, Math.min(15, zoomTarget));
        };
        let pinchStartDist = 0;
        let pinchStartZoom = zoomTarget;
        const onTouchStart = (e)=>{
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
        const onTouchMove = (e)=>{
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
        const onTouchEnd = (e)=>{
            endDrag();
            if (e.changedTouches.length === 1 && dragDistance < 8) {
                handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        };
        canvas.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("wheel", onWheel, {
            passive: false
        });
        canvas.addEventListener("touchstart", onTouchStart, {
            passive: true
        });
        canvas.addEventListener("touchmove", onTouchMove, {
            passive: false
        });
        canvas.addEventListener("touchend", onTouchEnd);
        const raycaster = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Raycaster"]();
        const mouseVec = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"]();
        let lastPointerX = -1000;
        let lastPointerY = -1000;
        let hoveredStation = null;
        let hoveringExit = false;
        function handleTap(clientX, clientY) {
            mouseVec.x = clientX / window.innerWidth * 2 - 1;
            mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVec, camera);
            const stationHits = raycaster.intersectObjects(stations, true);
            if (stationHits.length) {
                let obj = stationHits[0].object;
                while(obj && !obj.userData.name)obj = obj.parent;
                if (obj) {
                    focusStation();
                    onOpenPanel(obj.userData);
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
        const onClick = (e)=>{
            if (dragDistance > 6) return;
            handleTap(e.clientX, e.clientY);
        };
        canvas.addEventListener("click", onClick);
        const clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Clock"]();
        let rafId;
        let readyFired = false;
        function animate() {
            rafId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            if (presetTransition) {
                const t = Math.min((performance.now() - presetTransition.start) / PRESET_TRANSITION_MS, 1);
                const eased = easeInOutCubic(t);
                rotY = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(presetTransition.from.rotY, presetTransition.to.rotY, eased);
                rotX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(presetTransition.from.rotX, presetTransition.to.rotX, eased);
                zoomTarget = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(presetTransition.from.zoom, presetTransition.to.zoom, eased);
                if (t >= 1) presetTransition = null;
            }
            rig.rotation.y = rotY;
            rig.rotation.x = rotX;
            zoomCurrent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(zoomCurrent, zoomTarget, 0.08);
            camera.position.z = zoomCurrent;
            camera.updateMatrixWorld();
            const camWorldPos = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
            camera.getWorldPosition(camWorldPos);
            const pad = 0.6;
            camWorldPos.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(camWorldPos.x, -ROOM_HALF + pad, ROOM_HALF - pad);
            camWorldPos.z = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(camWorldPos.z, -ROOM_HALF + pad, ROOM_HALF - pad);
            camWorldPos.y = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(camWorldPos.y, pad, ROOM_HEIGHT - pad);
            rig.worldToLocal(camWorldPos);
            camera.position.copy(camWorldPos);
            // subtle warm flicker — small enough to read as "alive lighting", not distracting
            sconceLights.forEach(({ light, baseIntensity, phase })=>{
                light.intensity = baseIntensity + Math.sin(elapsed * 2.2 + phase) * baseIntensity * 0.07;
            });
            ceilingLights.forEach(({ light, baseIntensity, phase })=>{
                light.intensity = baseIntensity + Math.sin(elapsed * 1.7 + phase) * baseIntensity * 0.06;
            });
            if (!isDragging) {
                mouseVec.x = lastPointerX / window.innerWidth * 2 - 1;
                mouseVec.y = -(lastPointerY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouseVec, camera);
                const hits = raycaster.intersectObjects(stations, true);
                let hitObj = null;
                if (hits.length) {
                    hitObj = hits[0].object;
                    while(hitObj && !hitObj.userData.name)hitObj = hitObj.parent;
                }
                hoveredStation = hitObj;
                hoveringExit = raycaster.intersectObject(exitDoor, true).length > 0;
            }
            stations.forEach((s)=>{
                const base = stationBaseScale.get(s) ?? 1;
                const target = s === hoveredStation ? base * 1.15 : base;
                s.scale.lerp(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](target, target, target), 0.15);
            });
            const exitScale = hoveringExit ? 1.08 : 1;
            exitDoor.scale.lerp(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](exitScale, exitScale, exitScale), 0.15);
            if (charMoving) {
                const dir = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]().subVectors(charTarget, character.position);
                dir.y = 0;
                const dist = dir.length();
                if (dist < 0.05) {
                    charMoving = false;
                } else {
                    const angle = Math.atan2(dir.x, dir.z);
                    character.rotation.y = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(character.rotation.y, angle, 0.2);
                    dir.normalize().multiplyScalar(Math.min(0.05, dist));
                    character.position.add(dir);
                    walkPhase += 0.18;
                }
            }
            const swing = charMoving ? Math.sign(Math.sin(walkPhase * 4)) * 0.55 : 0;
            const lerpSpeed = 0.35;
            legL.pivot.rotation.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(legL.pivot.rotation.x, swing, lerpSpeed);
            legR.pivot.rotation.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(legR.pivot.rotation.x, -swing, lerpSpeed);
            armL.pivot.rotation.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(armL.pivot.rotation.x, -swing, lerpSpeed);
            armR.pivot.rotation.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(armR.pivot.rotation.x, swing, lerpSpeed);
            legL.knee.rotation.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(legL.knee.rotation.x, charMoving ? Math.max(0, swing) * 0.6 : 0, lerpSpeed);
            legR.knee.rotation.x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(legR.knee.rotation.x, charMoving ? Math.max(0, -swing) * 0.6 : 0, lerpSpeed);
            renderer.render(scene, camera);
            if (!readyFired) {
                readyFired = true;
                onReady?.();
            }
        }
        animate();
        const onResize = ()=>{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);
        return ()=>{
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
    }, [
        dense,
        onOpenPanel,
        onReady,
        onExit
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                style: {
                    position: "fixed",
                    inset: 0,
                    touchAction: "none",
                    cursor: "crosshair"
                }
            }, void 0, false, {
                fileName: "[project]/components/Scene.tsx",
                lineNumber: 925,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    left: "5vw",
                    bottom: "4vh",
                    zIndex: 10,
                    display: "flex",
                    gap: 8
                },
                children: PRESET_BUTTONS.map(({ id, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "mono preset-btn",
                        onClick: ()=>presetTriggerRef.current(id),
                        children: label
                    }, id, false, {
                        fileName: "[project]/components/Scene.tsx",
                        lineNumber: 945,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/Scene.tsx",
                lineNumber: 934,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Scene.tsx",
        lineNumber: 924,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/SidePanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SidePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function SidePanel({ data, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            top: 0,
            right: 0,
            height: "100%",
            width: "min(420px, 92vw)",
            background: "var(--graphite)",
            borderLeft: "1px solid rgba(74,95,217,0.3)",
            transform: data ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.5s cubic-bezier(.22,.9,.32,1)",
            zIndex: 60,
            padding: "12vh 32px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClose,
                className: "mono",
                style: {
                    position: "absolute",
                    top: 24,
                    right: 24,
                    background: "none",
                    border: "none",
                    color: "var(--vellum)",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    opacity: 0.6
                },
                children: "✕ CLOSE"
            }, void 0, false, {
                fileName: "[project]/components/SidePanel.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        style: {
                            marginBottom: 14
                        },
                        children: data.eyebrow
                    }, void 0, false, {
                        fileName: "[project]/components/SidePanel.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            fontSize: 28,
                            marginBottom: 16
                        },
                        children: data.title
                    }, void 0, false, {
                        fileName: "[project]/components/SidePanel.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 14,
                            lineHeight: 1.75,
                            opacity: 0.8
                        },
                        children: data.body
                    }, void 0, false, {
                        fileName: "[project]/components/SidePanel.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SidePanel.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SidePanel.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_1h1fy_m._.js.map