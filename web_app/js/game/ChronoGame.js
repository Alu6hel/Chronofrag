/**
 * Chronofrag Main 3D Game Engine - Overhauled Edition
 * Strict Reference to Tactical Mobile FPS Visuals:
 * - Architectural Courtyard with Cobblestones, Stone Masonry, and Heavy Wooden Fortress Double Doors
 * - Tactical Facility with Polished Hardwood Parquet, Conduit Walls, Vending Machines, and Briefing Boards
 * - 3D First-Person Viewmodels with Realistic Tactical Gloved Combat Hands & Military Grips
 * - Dual Tactical Pistols (Alternating Recoil) & Cosmic Neon AK-Chrono with Holographic Reflex Sight
 * - Architectural Square Minimap with Field-of-View Vision Cone
 * - Chronal Grenade Throws, Crouch & Jump Mobility
 * - Verified Alu Systems Logic Time Dilation & Satirical Dialogue
 */
class ChronoGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.input = new ChronoInput();
        this.audio = window.ChronoAudio;

        // Game State
        this.gameState = 'TITLE_MENU'; // 'TITLE_MENU', 'PLAYING', 'PAUSED'
        this.screenShakeEnabled = true;
        this.crtScanlinesEnabled = true;
        this.currentAct = 1; // 1: Courtyard Stasis, 2: Kinetic Corridor, 3: The Bugged Vault
        this.health = 100;
        this.armor = 100;
        this.kills = 0;
        this.score = 0;
        this.wave = 1;
        this.grenades = 2;

        // Player Movement & Physics
        this.playerVelocity = new THREE.Vector3();
        this.playerYaw = 0;
        this.playerPitch = 0;
        this.isGrounded = true;
        this.cameraHeight = 1.7; // 1.7 standing, 0.95 crouching

        // Game Juice & Combat Feel Engine (Freeze Frame / Hit Stop, Trauma Shake)
        this.hitStopTimer = 0;
        this.cameraTrauma = 0;
        this.shakeOffset = new THREE.Vector3();
        this.shakeRotation = new THREE.Vector3();
        this.levelGeometry = [];

        // Movement Immersion (Speed-synced Head Bob, Strafe Banking, Jump Landing, Weapon Sway)
        this.strideCycle = 0;
        this.bobOffset = new THREE.Vector3();
        this.lastBobSin = 0;
        this.strafeRoll = 0;
        this.landingCompression = 0;
        this.lastGrounded = true;
        this.weaponSway = { x: 0, y: 0 };
        this.targetWeaponSway = { x: 0, y: 0 };

        // Tactical Radar State
        this.radarSweepAngle = 0;

        // Time Dilation & 6-Second Powers State
        this.isTimeFrozen = true;
        this.timeAdvanceTicks = 0;
        this.manualFreezeUnlocked = false;
        this.manualFreezeActive = false;
        this.freezeTimer = 0;
        this.freezeDuration = 6.0;

        // Kinetic Trap & 6-Second Stride State
        this.kineticTrapUnlocked = false;
        this.strideActive = false;
        this.strideTimer = 0;
        this.strideDuration = 6.0;
        this.kineticBlockCooldown = 0;

        // Dialogue & Comms State
        this.inDialogue = false;
        this.dialogueTriggered = false;
        this.commsDismissTimeout = null;

        // Animated Spaceship Gates & Airlocks
        this.gateLeftGroup = null;
        this.gateRightGroup = null;
        this.gateOpenAngle = 0;
        this.gatesOpening = false;
        this.airlockLeftGroup = null;
        this.airlockRightGroup = null;
        this.airlockDoorsOpening = false;
        this.airlockOpenProgress = 0;

        // In-Engine Cinematic Cutscene State
        this.inCutscene = false;
        this.cutsceneTimer = 0;
        this.cutsceneDuration = 8.5;

        // Corridor Movement Puzzle State
        this.laserBarriers = [];
        this.lastKineticAlertTime = 0;

        // Weapons Arsenal
        this.weapons = [
            { name: "DUAL PISTOLS", ammo: 40, maxAmmo: 40, damage: 35, fireRate: 0.16, lastFired: 0, recoilTicks: 5 },
            { name: "NEON AK-CHRONO", ammo: 30, maxAmmo: 30, damage: 45, fireRate: 0.10, lastFired: 0, recoilTicks: 4 },
            { name: "HEAVY CANNON", ammo: 8, maxAmmo: 8, damage: 160, fireRate: 0.42, lastFired: 0, recoilTicks: 9 }
        ];
        this.activePistolHand = 0; // 0: Right, 1: Left for alternating fire

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;

        // World Entities & Visual Polish
        this.monsters = [];
        this.projectiles = [];
        this.particles = [];
        this.spentCasings = [];
        this.pickups = [];
        this.floatingCrystals = [];
        this.decorations = [];
        this.corridorLights = [];
        this.talkingMonster = null;
        this.kineticCoreMesh = null;
        this.kineticField = null;

        // Viewmodel Hierarchies
        this.weaponContainer = null;
        this.weaponMeshes = [];
        this.dualPistolArms = { left: null, right: null, leftSlide: null, rightSlide: null };
        this.akRifleGroup = null;
        this.akSlideMesh = null;
        this.muzzleLight = null;

        // Texture System
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};

        this.init();
    }

    init() {
        this.loadTextures();
        this.setupThreeScene();
        this.setupLighting();
        this.buildLevelArchitecture();
        this.buildWeaponViewmodels();
        this.spawnAct1Monsters();
        this.setupUIEvents();

        window.addEventListener('resize', () => this.onWindowResize());
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    loadTextures() {
        const texPath = "assets/textures/";
        const load = (name) => this.textureLoader.load(texPath + name);

        this.textures.ancientStone = load("ancient_stone_albedo.png");
        this.textures.ancientStoneNormal = load("ancient_stone_normal.png");
        this.textures.cobblestone = load("cobblestone_albedo.png");
        this.textures.cobblestoneNormal = load("cobblestone_normal.png");
        this.textures.woodenGate = load("wooden_gate_albedo.png");
        this.textures.woodenGateNormal = load("wooden_gate_normal.png");
        this.textures.woodFloor = load("polished_wood_floor.png");
        this.textures.woodFloorNormal = load("polished_wood_normal.png");
        this.textures.conduitWall = load("conduit_wall_albedo.png");
        this.textures.conduitWallNormal = load("conduit_wall_normal.png");
        this.textures.tacticalGlove = load("tactical_glove_albedo.png");
        this.textures.tacticalGloveNormal = load("tactical_glove_normal.png");
        this.textures.vendingMachine = load("vending_machine.png");
        this.textures.tacticalBoard = load("tactical_briefing_board.png");
        this.textures.cosmicNeonAk = load("cosmic_neon_ak.png");
        this.textures.kineticAlbedo = load("kinetic_albedo.png");
        this.textures.kineticNormal = load("kinetic_normal.png");
        this.textures.buggedSkin = load("bugged_skin.png");
        this.textures.buntingPennants = load("bunting_pennants.png");
        this.textures.breakerBox = load("electrical_breaker_box.png");
        this.textures.exitSign = load("exit_sign_neon.png");
        this.textures.anomalyCrystal = load("anomaly_crystal.png");

        // Set wrapping & repeats
        [this.textures.cobblestone, this.textures.cobblestoneNormal].forEach(t => {
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(24, 24);
        });

        [this.textures.ancientStone, this.textures.ancientStoneNormal].forEach(t => {
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(12, 6);
        });

        [this.textures.woodFloor, this.textures.woodFloorNormal].forEach(t => {
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(3, 15);
        });

        [this.textures.conduitWall, this.textures.conduitWallNormal].forEach(t => {
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(4, 2);
        });
    }

    setupThreeScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x070b12);
        this.scene.fog = new THREE.FogExp2(0x0a101d, 0.02);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 200);
        this.camera.position.set(0, 1.7, 0);

        this.player = new THREE.Object3D();
        this.player.position.set(0, 0, 8);
        this.scene.add(this.player);
        this.player.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(0x242d3d, 1.4);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xaad5ff, 2.2);
        sun.position.set(15, 30, 20);
        this.scene.add(sun);

        const courtyardFill = new THREE.PointLight(0xffaa55, 0.9, 35);
        courtyardFill.position.set(0, 5, 0);
        this.scene.add(courtyardFill);
    }

    buildLevelArchitecture() {
        this.levelGeometry = [];

        // =========================================================================
        // --- SECTOR 1: SPACESHIP STASIS HANGAR & CRYO CONTAINMENT DECK (ACT 1) ---
        // =========================================================================
        const deckMat = new THREE.MeshStandardMaterial({
            map: this.textures.conduitWall,
            normalMap: this.textures.conduitWallNormal,
            roughness: 0.38,
            metalness: 0.72
        });
        const hangarFloor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), deckMat);
        hangarFloor.rotation.x = -Math.PI / 2;
        hangarFloor.position.set(0, 0, 0);
        this.scene.add(hangarFloor);
        this.levelGeometry.push(hangarFloor);

        // Deck Hazard & Navigation Seam Lines
        const deckStripeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45 });
        [-12, 0, 12].forEach(lx => {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 48), deckStripeMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(lx, 0.02, 0);
            this.scene.add(stripe);
        });

        const hullWallMat = new THREE.MeshStandardMaterial({
            map: this.textures.conduitWall,
            normalMap: this.textures.conduitWallNormal,
            roughness: 0.5,
            metalness: 0.65
        });

        const addWall = (w, h, x, y, z, rotY = 0) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), hullWallMat);
            wall.position.set(x, y, z);
            wall.rotation.y = rotY;
            this.scene.add(wall);
            this.levelGeometry.push(wall);
            return wall;
        };

        // Spaceship Containment Deck Exterior Bulkhead Walls
        addWall(50, 9, 0, 4.5, 25);
        addWall(50, 9, -25, 4.5, 0, Math.PI / 2);
        addWall(50, 9, 25, 4.5, 0, Math.PI / 2);

        // Forward Bulkhead Wall with Airlock Portal Opening into Sector 2
        addWall(19, 9, -15.5, 4.5, -25);
        addWall(19, 9, 15.5, 4.5, -25);
        addWall(12, 3, 0, 7.5, -25);

        // Heavy Reinforced Titanium Airlock Frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x181e28, metalness: 0.9, roughness: 0.25 });
        const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 2.2), frameMat);
        leftFrame.position.set(-5.5, 3.75, -24.5);
        this.scene.add(leftFrame);

        const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 2.2), frameMat);
        rightFrame.position.set(5.5, 3.75, -24.5);
        this.scene.add(rightFrame);

        const topArchFrame = new THREE.Mesh(new THREE.BoxGeometry(12.6, 1.5, 2.2), frameMat);
        topArchFrame.position.set(0, 6.75, -24.5);
        this.scene.add(topArchFrame);

        // Heavy Hydraulic Sliding Blast Airlock Doors at z = -24.8
        const blastDoorMat = new THREE.MeshStandardMaterial({
            color: 0x222a36,
            metalness: 0.88,
            roughness: 0.32
        });
        const hazardMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

        // Left Blast Door (Slides left along X)
        this.gateLeftGroup = new THREE.Group();
        this.gateLeftGroup.position.set(0, 3.0, -24.8);
        const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(4.8, 6.0, 0.4), blastDoorMat);
        doorLeft.position.set(-2.4, 0, 0);
        this.gateLeftGroup.add(doorLeft);
        [-1.8, 0, 1.8].forEach(hy => {
            const hz = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.2, 0.42), hazardMat);
            hz.position.set(-2.4, hy, 0);
            this.gateLeftGroup.add(hz);
        });
        this.scene.add(this.gateLeftGroup);

        // Right Blast Door (Slides right along X)
        this.gateRightGroup = new THREE.Group();
        this.gateRightGroup.position.set(0, 3.0, -24.8);
        const doorRight = new THREE.Mesh(new THREE.BoxGeometry(4.8, 6.0, 0.4), blastDoorMat);
        doorRight.position.set(2.4, 0, 0);
        this.gateRightGroup.add(doorRight);
        [-1.8, 0, 1.8].forEach(hy => {
            const hz = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.2, 0.42), hazardMat);
            hz.position.set(2.4, hy, 0);
            this.gateRightGroup.add(hz);
        });
        this.scene.add(this.gateRightGroup);

        // 4 Cryogenic Stasis Containment Pods in Sector 1
        const podGlassMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.45,
            roughness: 0.1,
            metalness: 0.2
        });
        const podCoreMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
        const podBaseMat = new THREE.MeshStandardMaterial({ color: 0x161c24, metalness: 0.9, roughness: 0.3 });

        const addCryoPod = (x, z) => {
            const pod = new THREE.Group();
            pod.position.set(x, 0, z);

            const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.6, 16), podBaseMat);
            base.position.y = 0.3;
            pod.add(base);

            const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.2, 16), podGlassMat);
            glass.position.y = 2.2;
            pod.add(glass);

            const core = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.6, 12), podCoreMat);
            core.position.y = 2.2;
            pod.add(core);

            const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.5, 16), podBaseMat);
            cap.position.y = 4.0;
            pod.add(cap);

            const podLight = new THREE.PointLight(0x00f0ff, 1.4, 8);
            podLight.position.y = 2.4;
            pod.add(podLight);

            this.scene.add(pod);
            this.levelGeometry.push(base);
        };
        addCryoPod(-10, -10);
        addCryoPod(10, -10);
        addCryoPod(-10, 10);
        addCryoPod(10, 10);

        // Sci-Fi Cargo Containers in Hangar
        const sciFiCrateMat = new THREE.MeshStandardMaterial({
            map: this.textures.conduitWall,
            roughness: 0.45,
            metalness: 0.75
        });
        const addSciFiContainer = (x, z, sx = 2.4, sy = 2.0, sz = 2.4, rotY = 0) => {
            const c = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), sciFiCrateMat);
            c.position.set(x, sy / 2, z);
            c.rotation.y = rotY;
            this.scene.add(c);
            this.levelGeometry.push(c);
        };
        addSciFiContainer(-8, 5, 2.4, 2.0, 2.4, 0.2);
        addSciFiContainer(-6.5, 6.5, 1.8, 1.6, 1.8, -0.15);
        addSciFiContainer(11, 2, 2.6, 2.2, 2.6, 0.35);
        addSciFiContainer(10, 4.5, 2.0, 1.8, 2.0, -0.4);

        // Structural Support Ribs spanning the Spaceship Ceiling
        const ribMat = new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: 0.85, roughness: 0.35 });
        [-15, 0, 15].forEach(rz => {
            const arch = new THREE.Mesh(new THREE.BoxGeometry(50, 0.8, 1.4), ribMat);
            arch.position.set(0, 8.6, rz);
            this.scene.add(arch);

            const archGlow = new THREE.PointLight(0x00f0ff, 0.8, 18);
            archGlow.position.set(0, 8.0, rz);
            this.scene.add(archGlow);
        });

        // Overhead Spaceship Observation Skylight looking into Deep Space Stars
        const starGeom = new THREE.BufferGeometry();
        const starCount = 200;
        const starCoords = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
            starCoords[i] = (Math.random() - 0.5) * 80;
            starCoords[i + 1] = 18 + Math.random() * 25;
            starCoords[i + 2] = (Math.random() - 0.5) * 80;
        }
        starGeom.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
        const starPoints = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xeeffff, size: 0.4 }));
        this.scene.add(starPoints);

        // =========================================================================
        // --- SECTOR 2: SPACESHIP CONDUIT CORRIDOR & MOVEMENT PUZZLE (ACT 2) ---
        // =========================================================================
        const woodFloorMat = new THREE.MeshStandardMaterial({
            map: this.textures.woodFloor,
            normalMap: this.textures.woodFloorNormal,
            roughness: 0.22,
            metalness: 0.55
        });
        const facilityFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 60), woodFloorMat);
        facilityFloor.rotation.x = -Math.PI / 2;
        facilityFloor.position.set(0, 0, -55);
        this.scene.add(facilityFloor);
        this.levelGeometry.push(facilityFloor);

        const conduitWallMat = new THREE.MeshStandardMaterial({
            map: this.textures.conduitWall,
            normalMap: this.textures.conduitWallNormal,
            roughness: 0.65,
            metalness: 0.35
        });

        const leftCorrWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 60), conduitWallMat);
        leftCorrWall.position.set(-6, 3.75, -55);
        this.scene.add(leftCorrWall);
        this.levelGeometry.push(leftCorrWall);

        const rightCorrWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 60), conduitWallMat);
        rightCorrWall.position.set(6, 3.75, -55);
        this.scene.add(rightCorrWall);
        this.levelGeometry.push(rightCorrWall);

        const corrCeil = new THREE.Mesh(new THREE.PlaneGeometry(12, 60), conduitWallMat);
        corrCeil.rotation.x = Math.PI / 2;
        corrCeil.position.set(0, 7.5, -55);
        this.scene.add(corrCeil);

        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x333b45, metalness: 0.85, roughness: 0.3 });
        [-2.5, 2.5].forEach(pipeX => {
            const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 60, 12), pipeMat);
            pipe.rotation.x = Math.PI / 2;
            pipe.position.set(pipeX, 7.0, -55);
            this.scene.add(pipe);
        });

        [-35, -50, -65, -78].forEach(lightZ => {
            const fixture = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.8), new THREE.MeshStandardMaterial({ color: 0x111620 }));
            fixture.position.set(0, 7.4, lightZ);
            this.scene.add(fixture);

            const emitter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 0.4), new THREE.MeshBasicMaterial({ color: 0xeeffff }));
            emitter.position.set(0, 7.3, lightZ);
            this.scene.add(emitter);

            const stripLight = new THREE.PointLight(0xddeeff, 1.4, 18);
            stripLight.position.set(0, 6.8, lightZ);
            this.scene.add(stripLight);
            this.corridorLights.push(stripLight);
        });

        const vendingMat = new THREE.MeshStandardMaterial({
            map: this.textures.vendingMachine,
            roughness: 0.3,
            metalness: 0.5
        });
        const addVendingMachine = (x, z, rotY) => {
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 1.2), vendingMat);
            body.position.set(x, 1.6, z);
            body.rotation.y = rotY;
            this.scene.add(body);

            const vLight = new THREE.PointLight(0x00f0ff, 0.8, 5);
            vLight.position.set(x + (rotY > 0 ? 0.8 : -0.8), 2.0, z);
            this.scene.add(vLight);
        };
        addVendingMachine(-5.1, -40, Math.PI / 2);
        addVendingMachine(-5.1, -62, Math.PI / 2);

        const boardMat = new THREE.MeshStandardMaterial({
            map: this.textures.tacticalBoard,
            roughness: 0.4,
            metalness: 0.2
        });
        const addBriefingBoard = (x, z, rotY) => {
            const board = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 4.0), boardMat);
            board.position.set(x, 3.2, z);
            board.rotation.y = rotY;
            this.scene.add(board);
        };
        addBriefingBoard(5.3, -42, 0);
        addBriefingBoard(5.3, -65, 0);

        // Industrial Electrical Breaker Boxes
        const breakerMat = new THREE.MeshStandardMaterial({
            map: this.textures.breakerBox,
            roughness: 0.45,
            metalness: 0.65
        });
        const addBreakerBox = (x, y, z, rotY = 0) => {
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.3), breakerMat);
            box.position.set(x, y, z);
            box.rotation.y = rotY;
            this.scene.add(box);
        };
        addBreakerBox(-5.35, 3.2, -48, Math.PI / 2);
        addBreakerBox(5.35, 3.2, -72, -Math.PI / 2);

        // --- CORRIDOR MOVEMENT PUZZLE: 4 KINETIC LASER RESONANCE BARRIERS ---
        this.laserBarriers = [];
        const pylonMat = new THREE.MeshStandardMaterial({ color: 0x161e28, metalness: 0.88, roughness: 0.28 });
        const barrierZCoords = [-38, -52, -66, -78];

        barrierZCoords.forEach((bz) => {
            const barrierGroup = new THREE.Group();
            barrierGroup.position.set(0, 0, bz);

            const leftPylon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.2, 0.6), pylonMat);
            leftPylon.position.set(-5.6, 3.6, 0);
            barrierGroup.add(leftPylon);

            const rightPylon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.2, 0.6), pylonMat);
            rightPylon.position.set(5.6, 3.6, 0);
            barrierGroup.add(rightPylon);

            const beams = [];
            [1.2, 2.4, 3.8].forEach(by => {
                const beamGeo = new THREE.CylinderGeometry(0.045, 0.045, 10.8, 8);
                const beamMesh = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
                    color: 0x00f0ff,
                    transparent: true,
                    opacity: 0.75
                }));
                beamMesh.rotation.z = Math.PI / 2;
                beamMesh.position.set(0, by, 0);
                barrierGroup.add(beamMesh);
                beams.push(beamMesh);
            });

            const statusMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
            statusMesh.position.set(0, 6.8, 0);
            barrierGroup.add(statusMesh);

            const statusLight = new THREE.PointLight(0x00f0ff, 0.9, 10);
            statusLight.position.set(0, 6.5, 0);
            barrierGroup.add(statusLight);

            this.scene.add(barrierGroup);
            this.laserBarriers.push({
                z: bz,
                group: barrierGroup,
                beams: beams,
                statusMesh: statusMesh,
                statusLight: statusLight
            });
        });

        // Kinetic Stasis Core Artifact Mesh at z = -80
        const coreGeo = new THREE.IcosahedronGeometry(1.4, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xff8800,
            emissiveIntensity: 0.9,
            roughness: 0.15,
            metalness: 0.95
        });
        this.kineticCoreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.kineticCoreMesh.position.set(0, 2.2, -80);
        this.scene.add(this.kineticCoreMesh);

        const coreRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.12, 12, 32), new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9 }));
        coreRing.position.set(0, 2.2, -80);
        this.scene.add(coreRing);
        this.coreRingMesh = coreRing;

        // --- EXTERIOR PLANETARY AIRLOCK GATES (AT z = -86) ---
        const airlockBulkhead = new THREE.Mesh(new THREE.BoxGeometry(12, 7.5, 1.2), hullWallMat);
        airlockBulkhead.position.set(0, 3.75, -86);
        this.scene.add(airlockBulkhead);
        this.levelGeometry.push(airlockBulkhead);

        const airlockArchPortal = new THREE.Mesh(new THREE.BoxGeometry(7.2, 5.8, 1.4), new THREE.MeshBasicMaterial({ color: 0x04060a }));
        airlockArchPortal.position.set(0, 2.9, -86);
        this.scene.add(airlockArchPortal);

        // Airlock Doors Left & Right
        this.airlockLeftGroup = new THREE.Group();
        this.airlockLeftGroup.position.set(0, 2.9, -85.8);
        const airlockLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.8, 0.35), blastDoorMat);
        airlockLeftMesh.position.set(-1.8, 0, 0);
        this.airlockLeftGroup.add(airlockLeftMesh);
        this.scene.add(this.airlockLeftGroup);

        this.airlockRightGroup = new THREE.Group();
        this.airlockRightGroup.position.set(0, 2.9, -85.8);
        const airlockRightMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.8, 0.35), blastDoorMat);
        airlockRightMesh.position.set(1.8, 0, 0);
        this.airlockRightGroup.add(airlockRightMesh);
        this.scene.add(this.airlockRightGroup);

        // Metallic Descent Ramp leading down to Planet Surface
        const rampMat = new THREE.MeshStandardMaterial({ color: 0x252e3b, metalness: 0.8, roughness: 0.4 });
        const ramp = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), rampMat);
        ramp.rotation.x = -Math.PI / 2 + 0.08;
        ramp.position.set(0, 0.25, -90);
        this.scene.add(ramp);
        this.levelGeometry.push(ramp);

        // =========================================================================
        // --- SECTOR 3: EXOPLANET KELVON-9 SURFACE (ACT 3) ---
        // =========================================================================
        const planetTerrainMat = new THREE.MeshStandardMaterial({
            color: 0x1f1424,
            roughness: 0.92,
            metalness: 0.12
        });
        const planetGround = new THREE.Mesh(new THREE.PlaneGeometry(120, 140), planetTerrainMat);
        planetGround.rotation.x = -Math.PI / 2;
        planetGround.position.set(0, 0, -155);
        this.scene.add(planetGround);
        this.levelGeometry.push(planetGround);

        // Boundary Mountain Crags around the planet surface
        const cragMat = new THREE.MeshStandardMaterial({ color: 0x181020, roughness: 0.95 });
        [-60, 60].forEach(cx => {
            const crag = new THREE.Mesh(new THREE.BoxGeometry(10, 24, 140), cragMat);
            crag.position.set(cx, 12, -155);
            this.scene.add(crag);
            this.levelGeometry.push(crag);
        });
        const backRidge = new THREE.Mesh(new THREE.BoxGeometry(120, 24, 10), cragMat);
        backRidge.position.set(0, 12, -225);
        this.scene.add(backRidge);
        this.levelGeometry.push(backRidge);

        // Landed Spaceship Rear Exterior Hull (behind player at z = -86)
        const shipHullMat = new THREE.MeshStandardMaterial({ color: 0x1a212d, metalness: 0.9, roughness: 0.3 });
        const shipHullExterior = new THREE.Mesh(new THREE.BoxGeometry(40, 22, 6), shipHullMat);
        shipHullExterior.position.set(0, 11, -83);
        this.scene.add(shipHullExterior);
        this.levelGeometry.push(shipHullExterior);

        // Alien Celestial Sky Elements: Twin Moons & Nebula
        const primaryMoon = new THREE.Mesh(
            new THREE.SphereGeometry(16, 24, 24),
            new THREE.MeshBasicMaterial({ color: 0x99ccff })
        );
        primaryMoon.position.set(38, 52, -190);
        this.scene.add(primaryMoon);

        const moonGlow = new THREE.PointLight(0x77bbff, 1.8, 220);
        moonGlow.position.set(38, 52, -190);
        this.scene.add(moonGlow);

        const ringedMoonGroup = new THREE.Group();
        ringedMoonGroup.position.set(-42, 58, -180);
        const secMoon = new THREE.Mesh(new THREE.SphereGeometry(7, 18, 18), new THREE.MeshBasicMaterial({ color: 0xcc66ff }));
        ringedMoonGroup.add(secMoon);
        const moonRing = new THREE.Mesh(new THREE.TorusGeometry(12, 0.4, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffaa55 }));
        moonRing.rotation.x = Math.PI / 3;
        ringedMoonGroup.add(moonRing);
        this.scene.add(ringedMoonGroup);

        // 8 Floating Chronal Crystalline Obelisks across the planetary surface
        const crystalMat = new THREE.MeshStandardMaterial({
            map: this.textures.anomalyCrystal,
            roughness: 0.25,
            metalness: 0.65,
            emissive: 0x00ff88,
            emissiveIntensity: 0.35
        });

        [-18, 0, 18].forEach(cx => {
            [-115, -145, -175].forEach(cz => {
                if (cx === 0 && cz === -145) return; // Open central battle arena
                const crystalGroup = new THREE.Group();
                crystalGroup.position.set(cx, 4.2, cz);

                const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), crystalMat);
                crystalGroup.add(crystal);

                const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 8, 24), new THREE.MeshBasicMaterial({ color: 0xaa44ff }));
                orbitRing.rotation.x = Math.PI / 2;
                crystalGroup.add(orbitRing);

                const crystalLight = new THREE.PointLight(0x00f0ff, 1.5, 14);
                crystalGroup.add(crystalLight);

                this.scene.add(crystalGroup);
                this.floatingCrystals.push(crystalGroup);
            });
        });

        // Spawn Environmental Pickups (HP & Ammo)
        this.initPickups();
    }

    createTacticalHandMesh(isLeft, pose = 'pistol') {
        const handGroup = new THREE.Group();
        const sideSign = isLeft ? -1 : 1;

        const gloveMat = new THREE.MeshStandardMaterial({
            map: this.textures.tacticalGlove,
            normalMap: this.textures.tacticalGloveNormal,
            roughness: 0.42,
            metalness: 0.38,
            color: 0x4a5058
        });

        const fabricSleeveMat = new THREE.MeshStandardMaterial({
            color: 0x1f2329,
            roughness: 0.88,
            metalness: 0.12
        });

        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.078, 0.38, 12), fabricSleeveMat);
        sleeve.position.set(0, -0.16, 0.14);
        sleeve.rotation.x = Math.PI / 3.4;
        handGroup.add(sleeve);

        const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.063, 0.063, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x121418, metalness: 0.8, roughness: 0.4 }));
        wrist.position.set(0, -0.06, 0.05);
        wrist.rotation.x = Math.PI / 3.4;
        handGroup.add(wrist);

        if (isLeft) {
            const watchBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 12), new THREE.MeshStandardMaterial({ color: 0x080a0d, metalness: 0.9 }));
            watchBezel.position.set(-0.045, -0.05, 0.06);
            watchBezel.rotation.y = Math.PI / 3;
            const watchScreen = new THREE.Mesh(new THREE.CircleGeometry(0.016, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
            watchScreen.position.set(-0.045, -0.05, 0.068);
            watchScreen.rotation.y = Math.PI / 3;
            handGroup.add(watchBezel);
            handGroup.add(watchScreen);
        }

        const palm = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.05, 0.10), gloveMat);
        palm.position.set(0, 0, 0);
        handGroup.add(palm);

        const knucklePlate = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.022, 0.04), new THREE.MeshStandardMaterial({
            color: 0x16181d,
            roughness: 0.25,
            metalness: 0.85
        }));
        knucklePlate.position.set(0, 0.022, -0.01);
        handGroup.add(knucklePlate);

        if (pose === 'pistol' || pose === 'trigger_grip') {
            for (let f = 0; f < 3; f++) {
                const finger = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.026, 0.06), gloveMat);
                finger.position.set(sideSign * 0.032, -0.022 - f * 0.022, -0.01 + f * 0.012);
                finger.rotation.y = sideSign * 0.45;
                handGroup.add(finger);
            }
            const triggerFinger = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.022, 0.08), gloveMat);
            triggerFinger.position.set(sideSign * 0.035, 0.015, -0.05);
            triggerFinger.rotation.y = sideSign * 0.2;
            handGroup.add(triggerFinger);

            const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.026, 0.065), gloveMat);
            thumb.position.set(-sideSign * 0.038, 0.01, 0.02);
            thumb.rotation.y = -sideSign * 0.6;
            handGroup.add(thumb);
        } else if (pose === 'cradle_handguard') {
            for (let f = 0; f < 4; f++) {
                const finger = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.025, 0.065), gloveMat);
                finger.position.set(0.028, -0.01 + f * 0.018, -0.02 + f * 0.01);
                finger.rotation.z = -0.55;
                handGroup.add(finger);
            }
            const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.026, 0.06), gloveMat);
            thumb.position.set(-0.035, 0.02, 0.01);
            thumb.rotation.y = -0.4;
            handGroup.add(thumb);
        }

        return handGroup;
    }

    buildWeaponViewmodels() {
        this.weaponContainer = new THREE.Group();
        this.camera.add(this.weaponContainer);

        this.muzzleLight = new THREE.PointLight(0xff9933, 0, 10);
        this.muzzleLight.position.set(0.2, -0.15, -0.9);
        this.camera.add(this.muzzleLight);

        const pistolMetalMat = new THREE.MeshStandardMaterial({ color: 0x1b1d22, metalness: 0.94, roughness: 0.25 });
        const pistolGripMat = new THREE.MeshStandardMaterial({ color: 0x2c3139, metalness: 0.45, roughness: 0.65 });
        const sightTritiumMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

        // 1. DUAL TACTICAL PISTOLS (Slot 0 - Image 2)
        const dualPistolsGroup = new THREE.Group();

        const buildPistolArmAssembly = (isLeft) => {
            const pGroup = new THREE.Group();
            const sideSign = isLeft ? -1 : 1;

            const arm = this.createTacticalHandMesh(isLeft, 'pistol');
            arm.position.set(0, -0.08, 0.08);
            pGroup.add(arm);

            const frame = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.052, 0.28), pistolMetalMat);
            frame.position.set(0, 0, -0.05);
            pGroup.add(frame);

            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.15, 0.075), pistolGripMat);
            grip.position.set(0, -0.09, 0.04);
            grip.rotation.x = 0.24;
            pGroup.add(grip);

            const slide = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.054, 0.31), pistolMetalMat);
            slide.position.set(0, 0.045, -0.05);
            pGroup.add(slide);

            for (let s = 0; s < 4; s++) {
                const groove = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.03, 0.008), new THREE.MeshStandardMaterial({ color: 0x0d0f12 }));
                groove.position.set(0, 0.048, 0.04 + s * 0.016);
                pGroup.add(groove);
            }

            const muzzleHole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.33, 12), new THREE.MeshBasicMaterial({ color: 0x050505 }));
            muzzleHole.rotation.x = Math.PI / 2;
            muzzleHole.position.set(0, 0.045, -0.07);
            pGroup.add(muzzleHole);

            const tacModule = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.032, 0.11), new THREE.MeshStandardMaterial({ color: 0x14171c, metalness: 0.8 }));
            tacModule.position.set(0, -0.032, -0.12);
            pGroup.add(tacModule);

            const tacLens = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
            tacLens.position.set(0, -0.032, -0.176);
            pGroup.add(tacLens);

            const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.008), sightTritiumMat);
            frontSight.position.set(0, 0.082, -0.19);
            pGroup.add(frontSight);

            const rearSightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.014, 0.008), sightTritiumMat);
            rearSightLeft.position.set(-0.014, 0.082, 0.09);
            pGroup.add(rearSightLeft);

            const rearSightRight = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.014, 0.008), sightTritiumMat);
            rearSightRight.position.set(0.014, 0.082, 0.09);
            pGroup.add(rearSightRight);

            pGroup.rotation.y = -sideSign * 0.08;
            pGroup.rotation.z = sideSign * 0.05;

            return { group: pGroup, slide: slide };
        };

        const leftPistol = buildPistolArmAssembly(true);
        leftPistol.group.position.set(-0.21, -0.25, -0.52);
        dualPistolsGroup.add(leftPistol.group);
        this.dualPistolArms.left = leftPistol.group;
        this.dualPistolArms.leftSlide = leftPistol.slide;

        const rightPistol = buildPistolArmAssembly(false);
        rightPistol.group.position.set(0.21, -0.25, -0.52);
        dualPistolsGroup.add(rightPistol.group);
        this.dualPistolArms.right = rightPistol.group;
        this.dualPistolArms.rightSlide = rightPistol.slide;

        this.weaponContainer.add(dualPistolsGroup);
        this.weaponMeshes.push(dualPistolsGroup);

        // 2. COSMIC NEON AK-CHRONO WITH HOLOGRAPHIC REFLEX OPTIC (Slot 1 - Image 4)
        const akGroup = new THREE.Group();
        const akCamoMat = new THREE.MeshStandardMaterial({
            map: this.textures.cosmicNeonAk,
            metalness: 0.88,
            roughness: 0.26
        });

        const akReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.10, 0.44), akCamoMat);
        akReceiver.position.set(0, 0, 0);
        akGroup.add(akReceiver);

        const dustCover = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.42, 14, 1, false, 0, Math.PI), akCamoMat);
        dustCover.rotation.z = Math.PI / 2;
        dustCover.rotation.y = Math.PI / 2;
        dustCover.position.set(0, 0.05, 0);
        akGroup.add(dustCover);

        const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.082, 0.32), akCamoMat);
        handguard.position.set(0, 0.01, -0.34);
        akGroup.add(handguard);

        const akBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.54, 12), pistolMetalMat);
        akBarrel.rotation.x = Math.PI / 2;
        akBarrel.position.set(0, 0.032, -0.62);
        akGroup.add(akBarrel);

        const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.020, 0.09, 12), pistolMetalMat);
        muzzleBrake.rotation.x = Math.PI / 2;
        muzzleBrake.position.set(0, 0.032, -0.89);
        akGroup.add(muzzleBrake);

        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.28, 0.12), pistolMetalMat);
        mag.position.set(0, -0.17, -0.12);
        mag.rotation.x = -0.32;
        akGroup.add(mag);

        const akGrip = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.16, 0.075), pistolGripMat);
        akGrip.position.set(0, -0.12, 0.14);
        akGrip.rotation.x = 0.34;
        akGroup.add(akGrip);

        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.018, 0.42), pistolMetalMat);
        rail.position.set(0, 0.092, -0.06);
        akGroup.add(rail);

        // Open-frame Reflex Sight with coated glass & reticle
        const opticGroup = new THREE.Group();
        opticGroup.position.set(0, 0.10, -0.08);

        const opticBase = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.016, 0.10), pistolMetalMat);
        opticBase.position.set(0, 0.008, 0);
        opticGroup.add(opticBase);

        const leftStrut = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.065, 0.08), pistolMetalMat);
        leftStrut.position.set(-0.028, 0.042, 0);
        opticGroup.add(leftStrut);

        const rightStrut = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.065, 0.08), pistolMetalMat);
        rightStrut.position.set(0.028, 0.042, 0);
        opticGroup.add(rightStrut);

        const topHood = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.008, 0.08), pistolMetalMat);
        topHood.position.set(0, 0.074, 0);
        opticGroup.add(topHood);

        const lensMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.38,
            roughness: 0.05,
            metalness: 0.95
        });
        const reflexLens = new THREE.Mesh(new THREE.PlaneGeometry(0.048, 0.056), lensMat);
        reflexLens.position.set(0, 0.042, 0);
        opticGroup.add(reflexLens);

        const reticleRedDot = new THREE.Mesh(new THREE.CircleGeometry(0.0035, 12), new THREE.MeshBasicMaterial({ color: 0xff1133 }));
        reticleRedDot.position.set(0, 0.042, 0.002);
        opticGroup.add(reticleRedDot);

        const reticleCyanRing = new THREE.Mesh(new THREE.RingGeometry(0.009, 0.012, 16), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
        reticleCyanRing.position.set(0, 0.042, 0.002);
        opticGroup.add(reticleCyanRing);

        akGroup.add(opticGroup);

        const rightRifleHand = this.createTacticalHandMesh(false, 'trigger_grip');
        rightRifleHand.position.set(0, -0.12, 0.14);
        rightRifleHand.rotation.x = 0.34;
        akGroup.add(rightRifleHand);

        const leftRifleArmGroup = new THREE.Group();
        leftRifleArmGroup.position.set(-0.06, -0.06, -0.32);
        leftRifleArmGroup.rotation.x = 0.22;
        leftRifleArmGroup.rotation.y = 0.40;
        leftRifleArmGroup.rotation.z = -0.35;

        const leftGlovedHand = this.createTacticalHandMesh(true, 'cradle_handguard');
        leftRifleArmGroup.add(leftGlovedHand);
        akGroup.add(leftRifleArmGroup);

        akGroup.position.set(0.16, -0.22, -0.54);
        akGroup.rotation.y = -0.05;
        akGroup.rotation.z = 0.04;

        this.akRifleGroup = akGroup;
        this.weaponContainer.add(akGroup);
        this.weaponMeshes.push(akGroup);

        // 3. HEAVY ROTARY CANNON (Slot 2)
        const cannonGroup = new THREE.Group();
        const cannonBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.20, 0.52), pistolMetalMat);
        cannonGroup.add(cannonBody);

        const barrelAssembly = new THREE.Group();
        for (let b = 0; b < 6; b++) {
            const angle = (b / 6) * Math.PI * 2;
            const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.72, 8), pistolMetalMat);
            bMesh.rotation.x = Math.PI / 2;
            bMesh.position.set(Math.cos(angle) * 0.065, Math.sin(angle) * 0.065, -0.52);
            barrelAssembly.add(bMesh);
        }
        cannonGroup.add(barrelAssembly);
        this.cannonBarrelAssembly = barrelAssembly;

        const rightCannonHand = this.createTacticalHandMesh(false, 'pistol');
        rightCannonHand.position.set(0.08, -0.12, 0.16);
        cannonGroup.add(rightCannonHand);

        const leftCannonHand = this.createTacticalHandMesh(true, 'pistol');
        leftCannonHand.position.set(-0.08, 0.10, -0.08);
        cannonGroup.add(leftCannonHand);

        cannonGroup.position.set(0.24, -0.28, -0.65);
        this.weaponContainer.add(cannonGroup);
        this.weaponMeshes.push(cannonGroup);

        this.updateActiveWeaponView();
    }

    updateActiveWeaponView() {
        this.weaponMeshes.forEach((mesh, idx) => {
            mesh.visible = (idx === this.input.selectedWeaponIndex);
        });

        // ADS weapon positioning alignment
        if (this.akRifleGroup && this.input.selectedWeaponIndex === 1) {
            const targetX = this.input.isADS ? 0.0 : 0.16;
            const targetY = this.input.isADS ? -0.142 : -0.22;
            const targetZ = this.input.isADS ? -0.38 : -0.54;
            this.akRifleGroup.position.x = THREE.MathUtils.lerp(this.akRifleGroup.position.x, targetX, 0.25);
            this.akRifleGroup.position.y = THREE.MathUtils.lerp(this.akRifleGroup.position.y, targetY, 0.25);
            this.akRifleGroup.position.z = THREE.MathUtils.lerp(this.akRifleGroup.position.z, targetZ, 0.25);
        }

        const currentWep = this.weapons[this.input.selectedWeaponIndex];
        const ammoDisplay = document.getElementById('hud-ammo');
        if (ammoDisplay) {
            ammoDisplay.textContent = `${currentWep.ammo} / ${currentWep.maxAmmo}`;
        }
    }

    spawnAct1Monsters() {
        this.monsters = [];
        for (let i = 0; i < 6; i++) {
            this.spawnMonster(1);
        }
    }

    spawnMonster(actType = 1) {
        const monster = new THREE.Group();

        if (actType === 1) {
            // Act 1 Crimson Demon Brute: Obsidian-carved torso, curved horns, glowing amber eyes
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x991122,
                roughness: 0.35,
                metalness: 0.65
            });
            const runeMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

            // Muscular segmented torso
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.25, 0.55), bodyMat);
            torso.position.y = 1.05;

            // Glowing Chronal Rune on chest
            const chestRune = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), runeMat);
            chestRune.position.set(0, 1.15, 0.29);
            monster.add(chestRune);

            // Demonic Head with Brow & Snout
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 0.50), bodyMat);
            head.position.set(0, 1.85, 0);

            // Glowing Piercing Eyes
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
            const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.05), eyeMat);
            leftEye.position.set(-0.14, 1.88, 0.26);
            const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.05), eyeMat);
            rightEye.position.set(0.14, 1.88, 0.26);
            monster.add(leftEye);
            monster.add(rightEye);

            // Curved Horns
            const hornMat = new THREE.MeshStandardMaterial({ color: 0x220508, roughness: 0.2, metalness: 0.9 });
            const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.55, 8), hornMat);
            leftHorn.position.set(-0.25, 2.22, -0.05);
            leftHorn.rotation.z = 0.4;
            leftHorn.rotation.x = -0.2;
            const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.55, 8), hornMat);
            rightHorn.position.set(0.25, 2.22, -0.05);
            rightHorn.rotation.z = -0.4;
            rightHorn.rotation.x = -0.2;
            monster.add(leftHorn);
            monster.add(rightHorn);

            // Armored Claw Arms
            [-0.55, 0.55].forEach(ax => {
                const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.25), bodyMat);
                arm.position.set(ax, 0.95, 0.1);
                arm.rotation.x = 0.35;
                monster.add(arm);

                // Blade claw tip
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 4), hornMat);
                claw.position.set(ax, 0.4, 0.28);
                claw.rotation.x = Math.PI / 1.8;
                monster.add(claw);
            });

            monster.add(torso);
            monster.add(head);
            monster.type = "aggressive";
            monster.speed = 0.085;
            monster.health = 90;
            monster.chestRune = chestRune;
            monster.eyes = [leftEye, rightEye];        } else {
            const skinMat = new THREE.MeshStandardMaterial({
                map: this.textures.buggedSkin,
                roughness: 0.25,
                metalness: 0.1
            });
            const suitMat = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.8 });

            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.4), suitMat);
            torso.position.y = 1.0;

            const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), skinMat);
            head.position.y = 1.85;

            const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), suitMat);
            leftArm.position.set(-0.48, 0.9, 0);
            const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), suitMat);
            rightArm.position.set(0.48, 0.9, 0);

            monster.add(torso);
            monster.add(head);
            monster.add(leftArm);
            monster.add(rightArm);
            monster.type = "bugged";
            monster.speed = 0.065;
            monster.health = 120;
            monster.tick = Math.floor(Math.random() * 100);
            monster.headMesh = head;
        }

        const zMin = actType === 1 ? -18 : -170;
        const zMax = actType === 1 ? 4 : -115;
        const xRange = actType === 1 ? 16 : 28;

        monster.position.set(
            (Math.random() - 0.5) * xRange * 2,
            0,
            zMin + Math.random() * (zMax - zMin)
        );

        this.scene.add(monster);
        this.monsters.push(monster);
    }

    setupUIEvents() {
        const commsDismissBtn = document.getElementById('comms-btn-dismiss');
        const commsBox = document.getElementById('comms-transmission');
        const dismissComms = () => {
            if (commsBox) commsBox.style.display = 'none';
            if (this.commsDismissTimeout) clearTimeout(this.commsDismissTimeout);
        };
        if (commsDismissBtn) {
            commsDismissBtn.addEventListener('click', dismissComms);
            commsDismissBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                dismissComms();
            }, { passive: false });
        }
        if (commsBox) {
            commsBox.addEventListener('click', (e) => {
                if (e.target.id === 'comms-transmission' || e.target.closest('#comms-btn-dismiss')) {
                    dismissComms();
                }
            });
        }

        const cinematicSkipBtn = document.getElementById('cinematic-skip-btn');
        if (cinematicSkipBtn) {
            cinematicSkipBtn.addEventListener('click', () => this.finishPlanetArrivalCutscene());
            cinematicSkipBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.finishPlanetArrivalCutscene();
            }, { passive: false });
        }

        // Universal Click & Touch Bind Helper
        const bindTap = (elem, handler) => {
            if (!elem) return;
            elem.addEventListener('click', handler);
            elem.addEventListener('touchstart', (e) => {
                if (e.cancelable) e.preventDefault();
                handler(e);
            }, { passive: false });
        };

        const btnSettings = document.getElementById('btn-settings-toggle');
        const settingsModal = document.getElementById('settings-modal');
        const btnCloseSettings = document.getElementById('btn-settings-close');

        if (btnSettings && settingsModal) {
            bindTap(btnSettings, () => {
                const isOpen = settingsModal.style.display === 'flex';
                settingsModal.style.display = isOpen ? 'none' : 'flex';
            });
            if (btnCloseSettings) {
                bindTap(btnCloseSettings, () => {
                    settingsModal.style.display = 'none';
                });
            }
        }

        document.querySelectorAll('.btn-act-warp').forEach(btn => {
            bindTap(btn, (e) => {
                const act = parseInt(e.target.dataset.act, 10);
                this.warpToAct(act);
                if (settingsModal) settingsModal.style.display = 'none';
            });
        });

        const sensSlider = document.getElementById('setting-sensitivity');
        if (sensSlider) {
            sensSlider.addEventListener('input', (e) => {
                this.input.sensitivity = parseFloat(e.target.value);
            });
        }

        const btnAudio = document.getElementById('btn-toggle-audio');
        if (btnAudio) {
            bindTap(btnAudio, () => {
                const isMuted = btnAudio.classList.toggle('disabled');
                btnAudio.textContent = isMuted ? "MUTED" : "ENABLED";
                this.audio.setMuted(isMuted);
            });
        }

        const btnShake = document.getElementById('btn-toggle-shake');
        if (btnShake) {
            bindTap(btnShake, () => {
                this.screenShakeEnabled = !this.screenShakeEnabled;
                btnShake.textContent = this.screenShakeEnabled ? "ENABLED" : "DISABLED";
                btnShake.classList.toggle('disabled', !this.screenShakeEnabled);
                if (this.audio) this.audio.playMenuClick();
            });
        }

        const btnCrt = document.getElementById('btn-toggle-crt');
        if (btnCrt) {
            bindTap(btnCrt, () => {
                this.crtScanlinesEnabled = !this.crtScanlinesEnabled;
                btnCrt.textContent = this.crtScanlinesEnabled ? "ENABLED" : "DISABLED";
                btnCrt.classList.toggle('disabled', !this.crtScanlinesEnabled);
                const crtOverlay = document.querySelector('.crt-overlay');
                if (crtOverlay) crtOverlay.style.display = this.crtScanlinesEnabled ? 'block' : 'none';
                if (this.audio) this.audio.playMenuClick();
            });
        }

        const btnRestart = document.getElementById('btn-restart-game');
        if (btnRestart) {
            bindTap(btnRestart, () => {
                this.warpToAct(1);
                if (settingsModal) settingsModal.style.display = 'none';
            });
        }

        const btnReturnMenu = document.getElementById('btn-return-main-menu');
        if (btnReturnMenu) {
            bindTap(btnReturnMenu, () => {
                this.returnToMainMenu();
            });
        }

        // --- TITLE MENU EVENTS & NAVIGATION ---
        const btnMenuCampaign = document.getElementById('btn-menu-campaign');
        bindTap(btnMenuCampaign, () => this.startCampaign(1));

        const modalChapters = document.getElementById('modal-chapters');
        const modalArsenal = document.getElementById('modal-arsenal');
        const modalIntel = document.getElementById('modal-intel');

        const btnMenuChapters = document.getElementById('btn-menu-chapters');
        bindTap(btnMenuChapters, () => {
            if (modalChapters) modalChapters.style.display = 'flex';
            if (this.audio) this.audio.playMenuClick();
        });

        const btnMenuArsenal = document.getElementById('btn-menu-arsenal');
        bindTap(btnMenuArsenal, () => {
            if (modalArsenal) modalArsenal.style.display = 'flex';
            if (this.audio) this.audio.playMenuClick();
        });

        const btnMenuIntel = document.getElementById('btn-menu-intel');
        bindTap(btnMenuIntel, () => {
            if (modalIntel) modalIntel.style.display = 'flex';
            if (this.audio) this.audio.playMenuClick();
        });

        const btnMenuSettings = document.getElementById('btn-menu-settings');
        bindTap(btnMenuSettings, () => {
            if (settingsModal) settingsModal.style.display = 'flex';
            if (this.audio) this.audio.playMenuClick();
        });

        // Modal Close Buttons
        const btnCloseChapters = document.getElementById('btn-close-chapters');
        bindTap(btnCloseChapters, () => { if (modalChapters) modalChapters.style.display = 'none'; });

        const btnCloseArsenal = document.getElementById('btn-close-arsenal');
        bindTap(btnCloseArsenal, () => { if (modalArsenal) modalArsenal.style.display = 'none'; });

        const btnCloseIntel = document.getElementById('btn-close-intel');
        bindTap(btnCloseIntel, () => { if (modalIntel) modalIntel.style.display = 'none'; });

        // Warp from Chapter Select Modal
        document.querySelectorAll('.btn-warp-chapter').forEach(btn => {
            bindTap(btn, (e) => {
                const target = e.currentTarget || e.target;
                const act = parseInt(target.dataset.act, 10) || 1;
                if (modalChapters) modalChapters.style.display = 'none';
                this.startCampaign(act);
            });
        });

        // Audio Pill Toggle on Title Bar
        const audioPill = document.getElementById('title-audio-pill');
        bindTap(audioPill, () => {
            if (this.audio.isMuted) {
                this.audio.setMuted(false);
                audioPill.textContent = "🔊 AUDIO: UNMUTED";
                this.audio.startTitleDrone();
            } else {
                this.audio.setMuted(true);
                audioPill.textContent = "🔇 AUDIO: MUTED";
                this.audio.stopTitleDrone();
            }
        });
    }

    startCampaign(actNum = 1) {
        if (this.audio) {
            this.audio.playWeaponCock();
            this.audio.stopTitleDrone();
        }

        const titleScreen = document.getElementById('title-screen');
        const hud = document.getElementById('hud-overlay');

        if (titleScreen) {
            titleScreen.classList.add('fade-out');
            setTimeout(() => {
                titleScreen.style.display = 'none';
                titleScreen.classList.remove('fade-out');
            }, 550);
        }

        if (hud) {
            hud.style.display = 'block';
        }

        this.warpToAct(actNum);
        this.gameState = 'PLAYING';
    }

    returnToMainMenu() {
        this.gameState = 'TITLE_MENU';
        const titleScreen = document.getElementById('title-screen');
        const hud = document.getElementById('hud-overlay');
        const settingsModal = document.getElementById('settings-modal');

        if (settingsModal) settingsModal.style.display = 'none';
        if (hud) hud.style.display = 'none';

        if (titleScreen) {
            titleScreen.style.display = 'flex';
            titleScreen.classList.remove('fade-out');
        }

        if (this.audio && !this.audio.isMuted) {
            this.audio.startTitleDrone();
        }
    }

    warpToAct(actNum) {
        this.currentAct = actNum;
        this.monsters.forEach(m => this.scene.remove(m));
        this.monsters = [];
        this.health = 100;
        this.armor = 100;
        this.dialogueTriggered = false;
        this.talkingMonster = null;
        this.inDialogue = false;

        const comms = document.getElementById('comms-transmission');
        if (comms) comms.style.display = 'none';

        const freezeBtn = document.getElementById('btn-power-freeze');
        const kineticBtn = document.getElementById('btn-power-kinetic');

        if (actNum === 1) {
            this.player.position.set(0, 0, 8);
            this.manualFreezeUnlocked = false;
            this.kineticTrapUnlocked = false;
            this.gatesOpening = false;
            this.gateOpenAngle = 0;
            if (this.gateLeftGroup) this.gateLeftGroup.position.x = 0;
            if (this.gateRightGroup) this.gateRightGroup.position.x = 0;
            this.airlockDoorsOpening = false;
            this.airlockOpenProgress = 0;
            if (this.airlockLeftGroup) this.airlockLeftGroup.position.x = 0;
            if (this.airlockRightGroup) this.airlockRightGroup.position.x = 0;
            if (freezeBtn) freezeBtn.style.display = 'none';
            if (kineticBtn) kineticBtn.style.display = 'none';
            this.updateActBanner("ACT 1: FROZEN ONSLAUGHT", "SURVIVE THE CRYO STASIS HANGAR");
            this.spawnAct1Monsters();
        } else if (actNum === 2) {
            this.player.position.set(0, 0, -32);
            this.manualFreezeUnlocked = true;
            this.kineticTrapUnlocked = false;
            this.gatesOpening = true;
            this.gateOpenAngle = 1.0;
            if (this.gateLeftGroup) this.gateLeftGroup.position.x = -3.8;
            if (this.gateRightGroup) this.gateRightGroup.position.x = 3.8;
            this.airlockDoorsOpening = false;
            this.airlockOpenProgress = 0;
            if (this.airlockLeftGroup) this.airlockLeftGroup.position.x = 0;
            if (this.airlockRightGroup) this.airlockRightGroup.position.x = 0;
            if (freezeBtn) freezeBtn.style.display = 'flex';
            if (kineticBtn) kineticBtn.style.display = 'none';
            this.updateActBanner("ACT 2: THE KINETIC TRAP", "NAVIGATE CONDUIT CORRIDOR WITH SLOW VELOCITY OR TIME-FREEZE");
        } else if (actNum === 3) {
            this.player.position.set(0, 0, -98);
            this.manualFreezeUnlocked = true;
            this.kineticTrapUnlocked = true;
            this.gatesOpening = true;
            this.gateOpenAngle = 1.0;
            if (this.gateLeftGroup) this.gateLeftGroup.position.x = -3.8;
            if (this.gateRightGroup) this.gateRightGroup.position.x = 3.8;
            this.airlockDoorsOpening = true;
            this.airlockOpenProgress = 1.0;
            if (this.airlockLeftGroup) this.airlockLeftGroup.position.x = -4.2;
            if (this.airlockRightGroup) this.airlockRightGroup.position.x = 4.2;
            if (freezeBtn) freezeBtn.style.display = 'flex';
            if (kineticBtn) kineticBtn.style.display = 'flex';
            this.updateActBanner("ACT 3: EXOPLANET KELVON-9", "SURVIVE THE ALIEN GLITCHED SWARM");
            this.spawnAct3BuggedSwarm();
        }
        this.updateActiveWeaponView();
        const hpBar = document.getElementById('hud-hp-bar');
        const armorBar = document.getElementById('hud-armor-bar');
        const hpLabel = document.getElementById('hud-hp-label');
        const armorLabel = document.getElementById('hud-armor-label');
        if (hpBar) hpBar.style.width = '100%';
        if (armorBar) armorBar.style.width = '100%';
        if (hpLabel) hpLabel.textContent = '+ 100';
        if (armorLabel) armorLabel.textContent = '100';
        this.showNotification(`WARPED TO ACT ${actNum}`);
    }

    advanceFromDialogue() {
        const comms = document.getElementById('comms-transmission');
        if (comms) comms.style.display = 'none';
        this.inDialogue = false;

        this.manualFreezeUnlocked = true;
        const freezeBtn = document.getElementById('btn-power-freeze');
        if (freezeBtn) freezeBtn.style.display = 'flex';

        this.audio.playPowerChime();
        this.showNotification("UNLOCKED: MANUAL TIME-FREEZE [TAP FREEZE / KEY F]");

        this.gatesOpening = true;
        this.currentAct = 2;
        this.updateActBanner("ACT 2: THE KINETIC TRAP", "NAVIGATE THE CORRIDOR IN SLOW MOTION");
    }

    updateActBanner(title, objective) {
        const actTitle = document.getElementById('hud-act-title');
        const actObj = document.getElementById('hud-act-objective');
        if (actTitle) actTitle.textContent = title;
        if (actObj) actObj.textContent = objective;
    }

    showNotification(text, durationMs = 5500) {
        const banner = document.getElementById('hud-notification-banner');
        if (banner) {
            banner.textContent = text;
            banner.classList.add('visible');
            if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
            this.notificationTimeout = setTimeout(() => {
                banner.classList.remove('visible');
            }, durationMs);
        }
    }

    triggerKineticSpeedBlock() {
        this.audio.playKineticBlock();
        const alertBox = document.getElementById('kinetic-alert');
        if (alertBox) {
            alertBox.style.opacity = '1';
            setTimeout(() => { alertBox.style.opacity = '0'; }, 600);
        }
        this.addTrauma(0.35);
        this.triggerHitStop(0.06);
    }

    // --- GAME JUICE & COMBAT FEEL ENGINE ---
    triggerHitStop(duration = 0.045) {
        this.hitStopTimer = Math.max(this.hitStopTimer, duration);
    }

    addTrauma(amount) {
        this.cameraTrauma = Math.min(1.0, this.cameraTrauma + amount);
    }

    updateCameraTrauma(delta) {
        if (!this.screenShakeEnabled) {
            this.cameraTrauma = 0;
            this.shakeRotation.set(0, 0, 0);
            this.shakeOffset.set(0, 0, 0);
            return;
        }

        if (this.cameraTrauma > 0) {
            const shake = this.cameraTrauma * this.cameraTrauma; // Quadratic trauma curve
            const maxPitch = 0.045;
            const maxYaw = 0.045;
            const maxRoll = 0.065;
            const maxPos = 0.08;

            this.shakeRotation.x = (Math.random() * 2 - 1) * maxPitch * shake;
            this.shakeRotation.y = (Math.random() * 2 - 1) * maxYaw * shake;
            this.shakeRotation.z = (Math.random() * 2 - 1) * maxRoll * shake;
            this.shakeOffset.x = (Math.random() * 2 - 1) * maxPos * shake;
            this.shakeOffset.y = (Math.random() * 2 - 1) * maxPos * shake;
            this.shakeOffset.z = (Math.random() * 2 - 1) * (maxPos * 0.4) * shake;

            this.cameraTrauma = Math.max(0, this.cameraTrauma - delta * 1.6);
        } else {
            this.shakeRotation.set(0, 0, 0);
            this.shakeOffset.set(0, 0, 0);
        }
    }

    updateWeaponSwayAndBob(delta, now) {
        if (!this.weaponContainer) return;

        // Smoothly interpolate weapon sway toward target look delta
        this.weaponSway.x = THREE.MathUtils.lerp(this.weaponSway.x, this.targetWeaponSway.x, delta * 12.0);
        this.weaponSway.y = THREE.MathUtils.lerp(this.weaponSway.y, this.targetWeaponSway.y, delta * 12.0);
        this.targetWeaponSway.x = THREE.MathUtils.lerp(this.targetWeaponSway.x, 0, delta * 10.0);
        this.targetWeaponSway.y = THREE.MathUtils.lerp(this.targetWeaponSway.y, 0, delta * 10.0);

        // Organic breathing oscillation
        const breath = Math.sin(now * 0.0018) * 0.003;

        // Harmonic weapon bobbing linked to footsteps
        const moveBobX = Math.cos(this.strideCycle * 0.5) * 0.005;
        const moveBobY = Math.sin(this.strideCycle) * 0.006;

        this.weaponContainer.position.x = this.weaponSway.x + moveBobX;
        this.weaponContainer.position.y = this.weaponSway.y + breath + moveBobY;
        this.weaponContainer.rotation.z = -this.weaponSway.x * 0.65;
        this.weaponContainer.rotation.y = this.weaponSway.x * 0.45;
        this.weaponContainer.rotation.x = breath * 0.4;
    }

    createSparkParticles(pos, normal = new THREE.Vector3(0, 1, 0)) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const size = 0.035 + Math.random() * 0.035;
            const sparkMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.3 ? 0xffea00 : 0xffffff
            });
            const p = new THREE.Mesh(new THREE.BoxGeometry(size, size, size * 2.5), sparkMat);
            p.position.copy(pos);

            const spread = new THREE.Vector3(
                (Math.random() - 0.5) * 2.2,
                (Math.random() - 0.5) * 2.2,
                (Math.random() - 0.5) * 2.2
            );
            const vel = normal.clone().multiplyScalar(4.5 + Math.random() * 5.0).add(spread);
            p.lookAt(p.position.clone().add(vel));

            this.scene.add(p);
            this.particles.push({ mesh: p, velocity: vel, life: 0.22 + Math.random() * 0.15, isSpark: true });
        }
    }

    gameLoop(now) {
        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;

        // In Title Menu, smoothly orbit the courtyard camera and pause game entities
        if (this.gameState === 'TITLE_MENU') {
            const orbit = now * 0.00022;
            this.camera.position.set(Math.sin(orbit) * 6, 2.4 + Math.sin(now * 0.0005) * 0.3, 16 + Math.cos(orbit) * 3);
            this.camera.lookAt(0, 1.8, 0);

            if (this.weaponContainer) this.weaponContainer.visible = false;

            if (this.floatingCrystals) {
                this.floatingCrystals.forEach((c, idx) => {
                    c.rotation.y += 0.015 * (idx % 2 === 0 ? 1 : -1);
                    c.position.y = 3.8 + Math.sin(now * 0.002 + idx) * 0.35;
                });
            }

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        if (this.inCutscene) {
            this.updatePlanetArrivalCutscene(delta);
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        if (this.weaponContainer && !this.weaponContainer.visible) {
            this.weaponContainer.visible = true;
        }

        // Update Screen Shake Trauma & Weapon Sway/Bobbing
        this.updateCameraTrauma(delta);
        this.updateWeaponSwayAndBob(delta, now);

        this.handlePlayerLook();
        this.handleWeaponsAndShooting(now);
        this.handlePowers(delta);
        this.handleGrenadeAction();

        // Hit Lag / Freeze Frame: Brief time-dilation pause on bullet impact
        let isHitStopped = false;
        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= delta;
            isHitStopped = true;
        }

        const isFiringThisTick = this.input.isFiring || this.input.pendingFire;
        const timeAdvances = AluLogicBridge.calculateTimeAdvance(
            isFiringThisTick,
            this.timeAdvanceTicks,
            this.manualFreezeActive
        );

        if (this.timeAdvanceTicks > 0) this.timeAdvanceTicks--;

        const timeBadge = document.getElementById('hud-time-badge');
        if (timeBadge && !this.manualFreezeActive) {
            if (timeAdvances) {
                timeBadge.textContent = "TIME: ADVANCING [FIRE PULSE]";
                timeBadge.classList.add('pulsing');
            } else {
                timeBadge.textContent = "TIME: FROZEN [FIRE TO MOVE]";
                timeBadge.classList.remove('pulsing');
            }
        }

        this.handlePlayerMovement(delta);
        this.updateCorridorMovementPuzzle(now, delta);

        // Stride slows down world to 0.25x slow-motion, Time Freeze freezes world completely
        const worldDelta = this.strideActive ? (delta * 0.25) : delta;
        const monstersCanMove = timeAdvances && !this.manualFreezeActive && !isHitStopped;
        const worldPhysicsAdvance = !this.manualFreezeActive && !isHitStopped;

        this.updateMonsters(worldDelta, monstersCanMove);
        this.updateProjectiles(worldDelta, worldPhysicsAdvance);
        this.updateParticles(worldDelta, true);
        this.updateSpentCasings(delta);
        this.updatePickups(delta);
        this.checkActObjectives();
        this.drawMinimapRadar();

        // Animate Spaceship Blast Sliding Gate Open smoothly
        if (this.gatesOpening && this.gateOpenAngle < 1.0) {
            this.gateOpenAngle = Math.min(1.0, this.gateOpenAngle + delta * 1.2);
            if (this.gateLeftGroup) this.gateLeftGroup.position.x = -this.gateOpenAngle * 3.8;
            if (this.gateRightGroup) this.gateRightGroup.position.x = this.gateOpenAngle * 3.8;
            this.addTrauma(0.012);
        }

        // Floating Crystals Orbit & Bob in Act 3
        if (this.floatingCrystals) {
            this.floatingCrystals.forEach((c, idx) => {
                c.rotation.y += 0.015 * (idx % 2 === 0 ? 1 : -1);
                c.position.y = 3.8 + Math.sin(now * 0.002 + idx) * 0.35;
            });
        }

        if (this.kineticCoreMesh) {
            this.kineticCoreMesh.rotation.y += 0.02;
            this.kineticCoreMesh.rotation.x += 0.01;
            if (this.coreRingMesh) this.coreRingMesh.rotation.z += 0.015;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    handlePlayerLook() {
        if (this.inDialogue) return;
        const d = this.input.consumeLookDelta();
        this.playerYaw -= d.x;
        this.playerPitch -= d.y;
        this.playerPitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.playerPitch));

        // Weapon sway accumulation from look movement
        this.targetWeaponSway.x += -d.x * 0.45;
        this.targetWeaponSway.y += -d.y * 0.45;
        this.targetWeaponSway.x = Math.max(-0.06, Math.min(0.06, this.targetWeaponSway.x));
        this.targetWeaponSway.y = Math.max(-0.05, Math.min(0.05, this.targetWeaponSway.y));

        this.player.rotation.y = this.playerYaw;
        this.camera.rotation.x = this.playerPitch + this.shakeRotation.x;
        this.camera.rotation.y = this.shakeRotation.y;
        this.camera.rotation.z = this.strafeRoll + this.shakeRotation.z;

        // Dynamic FOV: Zoom in on ADS (42 deg), expand on Kinetic Stride (+14 deg hyper-speed sensation)
        let targetFOV = this.input.isADS ? 42 : 75;
        if (this.strideActive) targetFOV += 14;
        if (this.strideActive && this.manualFreezeActive) targetFOV += 4;

        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.22);
        this.camera.updateProjectionMatrix();

        const targetHeight = this.input.isCrouching ? 0.95 : 1.7;
        this.cameraHeight = THREE.MathUtils.lerp(this.cameraHeight, targetHeight, 0.18);
        this.camera.position.x = this.bobOffset.x + this.shakeOffset.x;
        this.camera.position.y = this.cameraHeight + this.bobOffset.y + this.shakeOffset.y - this.landingCompression;
        this.camera.position.z = this.shakeOffset.z;
    }

    handlePlayerMovement(delta) {
        if (this.inDialogue) return;
        const m = this.input.getMovement();
        let targetSpeed = m.magnitude * (this.input.isCrouching ? 0.07 : 0.14);

        // Kinetic Stride grants 2.2x hyper-velocity
        if (this.strideActive) {
            targetSpeed *= 2.2;
        }

        if (this.input.wantsJump && this.isGrounded) {
            this.input.wantsJump = false;
            this.playerVelocity.y = 5.2;
            this.isGrounded = false;
        }

        if (!this.isGrounded) {
            this.playerVelocity.y -= 9.8 * delta;
            this.player.position.y += this.playerVelocity.y * delta;
            if (this.player.position.y <= 0) {
                this.player.position.y = 0;
                this.playerVelocity.y = 0;
                this.isGrounded = true;
            }
        }

        // Jump landing impact compression and tactile thud
        if (!this.lastGrounded && this.isGrounded) {
            this.landingCompression = 0.16;
            this.addTrauma(0.18);
            this.audio.playJumpLand();
        }
        this.landingCompression = THREE.MathUtils.lerp(this.landingCompression, 0, delta * 14.0);
        this.lastGrounded = this.isGrounded;

        // In Act 2 Kinetic Trap: Stride OR Time Freeze grants full immunity; normal speed triggers non-Newtonian dampener block
        if (this.currentAct === 2 && this.player.position.z < -25 && this.player.position.z > -85) {
            if (!this.strideActive && !this.manualFreezeActive) {
                const checkedSpeed = AluLogicBridge.calculateKineticVelocity(targetSpeed, 0.055);
                if (checkedSpeed === 0 && targetSpeed > 0.055) {
                    this.triggerKineticSpeedBlock();
                    targetSpeed = 0;
                } else {
                    targetSpeed = checkedSpeed;
                }
            }
        }

        this.lastPlayerSpeed = targetSpeed;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerYaw);

        const moveDir = new THREE.Vector3()
            .addScaledVector(forward, -m.y)
            .addScaledVector(right, m.x)
            .normalize();

        if (m.magnitude > 0.05) {
            this.player.position.addScaledVector(moveDir, targetSpeed);
        }

        // Speed-Synced Head Bobbing & Procedural Footsteps
        if (m.magnitude > 0.05 && this.isGrounded) {
            const bobRate = (targetSpeed > 0.15) ? 82.0 : 55.0;
            this.strideCycle += targetSpeed * delta * bobRate;
            this.bobOffset.y = Math.sin(this.strideCycle) * 0.038;
            this.bobOffset.x = Math.cos(this.strideCycle * 0.5) * 0.022;

            const currentSin = Math.sin(this.strideCycle);
            if (currentSin < -0.92 && this.lastBobSin >= -0.92) {
                let surface = "metal";
                if (this.currentAct === 2) surface = "wood";
                else if (this.currentAct === 3) surface = "metal";
                this.audio.playFootstep(surface);
            }
            this.lastBobSin = currentSin;
        } else {
            this.bobOffset.lerp(new THREE.Vector3(0, 0, 0), delta * 10.0);
        }

        // Strafe Camera Roll Banking (tilt camera into strafe direction)
        let targetRoll = 0;
        if (m.x < -0.15) targetRoll = -0.042; // Strafe Left -> tilt camera left (-2.4 deg)
        else if (m.x > 0.15) targetRoll = 0.042; // Strafe Right -> tilt camera right (+2.4 deg)
        this.strafeRoll = THREE.MathUtils.lerp(this.strafeRoll, targetRoll, delta * 10.0);
    }

    handleWeaponsAndShooting(now) {
        if (this.inDialogue) return;
        const wep = this.weapons[this.input.selectedWeaponIndex];

        this.updateActiveWeaponView();

        if (this.input.wantsReload) {
            this.input.wantsReload = false;
            wep.ammo = wep.maxAmmo;
            this.updateActiveWeaponView();
            this.audio.playTimeWarp();
        }

        if ((this.input.isFiring || this.input.pendingFire) && now - wep.lastFired > wep.fireRate * 1000) {
            this.input.pendingFire = false;
            if (wep.ammo > 0) {
                wep.ammo--;
                wep.lastFired = now;
                this.timeAdvanceTicks = wep.recoilTicks;

                this.fireBullet(wep);
                this.updateActiveWeaponView();
            } else {
                wep.ammo = wep.maxAmmo;
            }
        }
    }

    fireBullet(wep) {
        const wepIndex = this.input.selectedWeaponIndex;
        const wepType = wepIndex === 2 ? "cannon" : wepIndex === 0 ? "pistol" : "rifle";
        this.audio.playGunshot(wepType);
        this.audio.playTimeWarp();
        this.ejectCasing(wepType);

        // Firing Recoil Trauma Shake
        this.addTrauma(wepType === "cannon" ? 0.35 : wepType === "pistol" ? 0.05 : 0.08);

        this.muzzleLight.intensity = 3.0;
        setTimeout(() => { this.muzzleLight.intensity = 0; }, 50);

        if (wepIndex === 0) {
            const isLeft = (this.activePistolHand % 2 === 1);
            this.activePistolHand++;
            const arm = isLeft ? this.dualPistolArms.left : this.dualPistolArms.right;
            const slide = isLeft ? this.dualPistolArms.leftSlide : this.dualPistolArms.rightSlide;

            if (arm) {
                arm.position.z += 0.08;
                arm.position.y += 0.03;
                setTimeout(() => {
                    arm.position.z -= 0.08;
                    arm.position.y -= 0.03;
                }, 80);
            }
            if (slide) {
                slide.position.z += 0.05;
                setTimeout(() => { slide.position.z -= 0.05; }, 70);
            }
        } else if (wepIndex === 1) {
            if (this.akRifleGroup) {
                this.akRifleGroup.position.z += 0.07;
                this.akRifleGroup.rotation.x += 0.04;
                setTimeout(() => {
                    this.akRifleGroup.position.z -= 0.07;
                    this.akRifleGroup.rotation.x -= 0.04;
                }, 75);
            }
        } else if (wepIndex === 2) {
            if (this.cannonBarrelAssembly) {
                this.cannonBarrelAssembly.rotation.z += 1.2;
            }
        }

        const lookDir = new THREE.Vector3();
        this.camera.getWorldDirection(lookDir);
        const pitchDeg = -this.playerPitch * (180 / Math.PI);
        const isSkyShot = (lookDir.y > 0.42) || AluLogicBridge.isSkywardShot(pitchDeg);

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        if (!isSkyShot) {
            const hitTargets = [];
            this.monsters.forEach(m => {
                const hits = raycaster.intersectObjects(m.children, true);
                if (hits.length > 0) {
                    hitTargets.push({ monster: m, distance: hits[0].distance, point: hits[0].point });
                }
            });

            if (hitTargets.length > 0) {
                hitTargets.sort((a, b) => a.distance - b.distance);
                const target = hitTargets[0];
                this.damageMonster(target.monster, wep.damage, target.point, lookDir);

                const hm = document.getElementById('hit-marker');
                if (hm) {
                    hm.style.opacity = '1';
                    setTimeout(() => { hm.style.opacity = '0'; }, 80);
                }
            } else if (this.levelGeometry.length > 0) {
                // Architectural wall/floor hits -> spawn rich sparks and play ricochet audio
                const geoHits = raycaster.intersectObjects(this.levelGeometry, true);
                if (geoHits.length > 0) {
                    const hit = geoHits[0];
                    const norm = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
                    if (hit.object) norm.applyQuaternion(hit.object.getWorldQuaternion(new THREE.Quaternion()));
                    this.createSparkParticles(hit.point, norm);
                    this.audio.playWallRicochet();
                    this.addTrauma(0.025);
                }
            }
        } else {
            this.checkSkyShotDialogueTrigger();
        }
    }

    handleGrenadeAction() {
        if (!this.input.wantsGrenade) return;
        this.input.wantsGrenade = false;

        if (this.grenades <= 0) {
            this.showNotification("OUT OF TACTICAL GRENADES!");
            return;
        }

        this.grenades--;
        const badge = document.getElementById('hud-grenade-count');
        if (badge) badge.textContent = this.grenades;

        this.showNotification("CHRONAL GRENADE DEPLOYED!");
        this.audio.playTimeWarp();

        const grenadeMat = new THREE.MeshStandardMaterial({
            color: 0x1f242c,
            metalness: 0.85,
            roughness: 0.3
        });
        const grenadeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12), grenadeMat);
        const ringLight = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 8, 16), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
        ringLight.rotation.x = Math.PI / 2;
        grenadeMesh.add(ringLight);

        const spawnPos = new THREE.Vector3();
        this.camera.getWorldPosition(spawnPos);
        const throwDir = new THREE.Vector3();
        this.camera.getWorldDirection(throwDir);
        spawnPos.addScaledVector(throwDir, 0.6);
        grenadeMesh.position.copy(spawnPos);

        const velocity = throwDir.clone().multiplyScalar(16).add(new THREE.Vector3(0, 4.5, 0));
        this.scene.add(grenadeMesh);
        this.projectiles.push({
            mesh: grenadeMesh,
            velocity: velocity,
            timer: 1.6,
            radius: 8.5,
            damage: 220
        });
    }

    updateProjectiles(delta, timeAdvances) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.velocity.y -= 14.0 * delta;
            p.mesh.rotation.x += 8.0 * delta;
            p.mesh.rotation.z += 5.0 * delta;

            if (p.mesh.position.y <= 0.12) {
                p.mesh.position.y = 0.12;
                p.velocity.y = -p.velocity.y * 0.45;
                p.velocity.x *= 0.7;
                p.velocity.z *= 0.7;
            }

            p.timer -= delta;
            if (p.timer <= 0) {
                this.detonateGrenade(p);
                this.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }
    }

    detonateGrenade(grenade) {
        this.audio.playExplosion();
        this.audio.playPowerChime();
        this.addTrauma(0.65);
        this.triggerHitStop(0.08);

        // Spawn explosive spall sparks
        this.createSparkParticles(grenade.mesh.position, new THREE.Vector3(0, 1, 0));

        const shockGeo = new THREE.SphereGeometry(grenade.radius * 0.6, 24, 24);
        const shockMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.75,
            wireframe: true
        });
        const shockMesh = new THREE.Mesh(shockGeo, shockMat);
        shockMesh.position.copy(grenade.mesh.position);
        this.scene.add(shockMesh);

        const blastLight = new THREE.PointLight(0x00f0ff, 4.0, 20);
        blastLight.position.copy(grenade.mesh.position);
        this.scene.add(blastLight);

        setTimeout(() => {
            this.scene.remove(shockMesh);
            this.scene.remove(blastLight);
        }, 350);

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const m = this.monsters[i];
            const dist = m.position.distanceTo(grenade.mesh.position);
            if (dist <= grenade.radius) {
                const blastDir = new THREE.Vector3().subVectors(m.position, grenade.mesh.position).normalize();
                this.damageMonster(m, grenade.damage, grenade.mesh.position, blastDir);
            }
        }
    }

    checkSkyShotDialogueTrigger() {
        if (this.currentAct !== 1 || this.dialogueTriggered) return;

        let closestDist = 999;
        let closestMonster = null;

        this.monsters.forEach(m => {
            const dist = this.player.position.distanceTo(m.position);
            if (dist < closestDist) {
                closestDist = dist;
                closestMonster = m;
            }
        });

        if (!closestMonster) {
            // If all initial monsters were eliminated, summon Azazel directly in front
            this.spawnMonster(1);
            closestMonster = this.monsters[this.monsters.length - 1];
            closestMonster.position.set(this.player.position.x, 0, this.player.position.z - 4.5);
            closestDist = 4.5;
        }

        if (closestMonster) {
            closestMonster.isPeacefulApproaching = true;
            this.talkingMonster = closestMonster;
            closestMonster.children.forEach(c => {
                if (c.material) {
                    c.material.color.setHex(0x00ffcc);
                    if (c.material.emissive) c.material.emissive.setHex(0x004433);
                }
            });
            this.showNotification("AZAZEL HALTS: SECURE COMM FREQUENCY ESTABLISHED...", 4500);
            this.audio.playMonsterSpeech();
            this.initiateSatiricalDialogue(closestMonster);
        }
    }

    initiateSatiricalDialogue(monster) {
        this.dialogueTriggered = true;
        this.talkingMonster = monster;

        this.audio.playMonsterSpeech();

        // Monster visually enters peaceful stasis ally state with green glow
        monster.children.forEach(c => {
            if (c.material) {
                c.material.color.setHex(0x00ff88);
                if (c.material.emissive) c.material.emissive.setHex(0x003322);
            }
        });

        // Add a friendly glowing halo ring above the monster's head
        const halo = new THREE.Mesh(
            new THREE.TorusGeometry(0.45, 0.05, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, 2.4, 0);
        monster.add(halo);

        // Fetch military sci-fi comms dialogue
        const dialogueData = AluLogicBridge.getSatiricalDialogue(this.kills);
        const comms = document.getElementById('comms-transmission');
        const commsSender = document.getElementById('comms-sender-callsign');
        const commsRoast = document.getElementById('comms-roast');
        const commsBody = document.getElementById('comms-body');

        if (comms) {
            if (commsSender) commsSender.textContent = dialogueData.callsign || "AZAZEL // ANOMALY DEFECTOR";
            if (commsRoast) commsRoast.textContent = `"${dialogueData.roast}"`;
            if (commsBody) commsBody.textContent = dialogueData.text;
            comms.style.display = 'flex';

            // Keep dialogue comfortable to read (18 seconds or dismiss by tap)
            if (this.commsDismissTimeout) clearTimeout(this.commsDismissTimeout);
            this.commsDismissTimeout = setTimeout(() => {
                if (comms) comms.style.display = 'none';
            }, 18000);
        }

        // Seamlessly slide open the spaceship hangar blast doors
        this.gatesOpening = true;
        this.audio.playPowerChime();

        // Unlock Manual Time-Freeze power on tactical HUD
        this.manualFreezeUnlocked = true;
        const freezeBtn = document.getElementById('btn-power-freeze');
        if (freezeBtn) freezeBtn.style.display = 'flex';

        this.updateActBanner("ACT 1 // BLAST DOORS UNLOCKED", "PROCEED THROUGH HANGAR BLAST DOORS TO SECTOR 2 CORRIDOR");
        this.showNotification("CHRONO-STASIS SYNCED! TAP [FREEZE] OR KEY [F] FOR 6s TIME STOP", 7000);
    }

    damageMonster(monster, damage, hitPoint, lookDir = null) {
        const isCrit = (damage >= 50);
        monster.health -= damage;

        // Hit Lag / Freeze Frame: Instant impact weight
        this.triggerHitStop(isCrit ? 0.075 : 0.045);

        // Screen Shake
        this.addTrauma(isCrit ? 0.28 : 0.12);

        // Hit Marker Audio
        this.audio.playHitImpact(isCrit);

        // Material Hit Flash: Instant white emissive flare
        monster.hitFlashTimer = 0.085;
        monster.traverse(child => {
            if (child.isMesh && child.material) {
                if (!child.userData.origEmissive) {
                    child.userData.origEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0, 0, 0);
                }
                if (child.material.emissive) {
                    child.material.emissive.setHex(0xffffff);
                }
            }
        });

        // Squash & Stretch Wobble + Impact Pushback
        monster.scale.set(1.28, 0.74, 1.28);
        if (lookDir) {
            const push = lookDir.clone().setY(0).normalize();
            monster.position.addScaledVector(push, isCrit ? 0.45 : 0.22);
        }

        this.createBloodParticles(hitPoint);

        if (hitPoint) {
            const v = hitPoint.clone().project(this.camera);
            if (v.z < 1.0) {
                const screenX = (v.x * 0.5 + 0.5) * window.innerWidth;
                const screenY = (-(v.y * 0.5) + 0.5) * window.innerHeight;
                this.showFloatingDamage({ x: screenX, y: screenY }, damage, isCrit);
            }
        }

        if (monster.health <= 0) {
            this.kills++;
            this.score += 150;
            const killEl = document.getElementById('hud-kills');
            const scoreEl = document.getElementById('hud-score');
            if (killEl) killEl.textContent = this.kills;
            if (scoreEl) scoreEl.textContent = this.score;

            // Extra kill punch
            this.addTrauma(0.18);
            this.triggerHitStop(0.06);

            this.scene.remove(monster);
            const idx = this.monsters.indexOf(monster);
            if (idx !== -1) this.monsters.splice(idx, 1);

            if (this.currentAct === 1 && !this.dialogueTriggered) {
                this.spawnMonster(1);
                this.spawnMonster(1);
            }
        }
    }

    showFloatingDamage(screenPos, damage, isCrit) {
        const hud = document.getElementById('hud-overlay');
        if (!hud) return;
        const el = document.createElement('div');
        el.className = 'damage-number' + (isCrit ? ' crit' : '');
        if (isCrit) {
            el.innerHTML = `-${damage}<span class="crit-tag">CRIT!</span>`;
        } else {
            el.textContent = `-${damage}`;
        }
        const jitterX = (Math.random() - 0.5) * 26;
        el.style.left = `${Math.round(screenPos.x + jitterX)}px`;
        el.style.top = `${Math.round(screenPos.y)}px`;
        hud.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 800);
    }

    createBloodParticles(pos) {
        for (let i = 0; i < 8; i++) {
            const p = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.08, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xff1133 })
            );
            p.position.copy(pos);
            p.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 4
            );
            this.scene.add(p);
            this.particles.push({ mesh: p, velocity: p.velocity, life: 0.6, isSpark: false });
        }
    }

    updateParticles(delta, timeAdvances) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.isSpark || timeAdvances) {
                p.mesh.position.addScaledVector(p.velocity, delta);
                if (p.isSpark) {
                    p.velocity.y -= 14.0 * delta;
                    p.velocity.multiplyScalar(0.92);
                } else {
                    p.velocity.y -= 9.8 * delta;
                }
                p.life -= delta;
                if (p.life <= 0) {
                    this.scene.remove(p.mesh);
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    handlePowers(delta) {
        const freezeBtn = document.getElementById('btn-power-freeze');
        const kineticBtn = document.getElementById('btn-power-kinetic');
        const freezeVignette = document.getElementById('chrono-freeze-vignette');
        const strideVignette = document.getElementById('kinetic-stride-vignette');

        // Trigger Time Freeze (6.0-second duration)
        if (this.input.wantsTimeFreeze && this.manualFreezeUnlocked) {
            this.input.wantsTimeFreeze = false;
            if (this.freezeTimer <= 0) {
                this.freezeTimer = this.freezeDuration;
                this.manualFreezeActive = true;
                this.audio.playTimeWarp();
                if (this.strideActive) {
                    this.showNotification("SUPER-STASIS COMBO: HYPER-SPEED THROUGH FROZEN TIME!");
                } else {
                    this.showNotification("CHRONO-STASIS ENGAGED: WORLD FROZEN FOR 6.0 SECONDS!");
                }
                if (freezeBtn) freezeBtn.classList.add('power-active');
                if (freezeVignette) freezeVignette.classList.add('active');
            } else {
                this.freezeTimer = 0;
            }
        }

        // Active Time Freeze countdown
        if (this.freezeTimer > 0) {
            this.freezeTimer = Math.max(0, this.freezeTimer - delta);
            if (freezeBtn) {
                freezeBtn.textContent = `FREEZE (${this.freezeTimer.toFixed(1)}s)`;
            }
            if (this.freezeTimer <= 0) {
                this.manualFreezeActive = false;
                if (freezeBtn) {
                    freezeBtn.classList.remove('power-active');
                    freezeBtn.textContent = "FREEZE";
                }
                if (freezeVignette) freezeVignette.classList.remove('active');
                this.audio.playPowerChime();
                this.showNotification("CHRONO-STASIS DEPLETED: NORMAL TIMELINE RESTORED");
            }
        }

        // Trigger Kinetic Stride (6.0-second duration, 2.2x speed, 0.25x world slowmo)
        if (this.input.wantsKineticPower && this.kineticTrapUnlocked) {
            this.input.wantsKineticPower = false;
            if (this.strideTimer <= 0) {
                this.strideTimer = this.strideDuration;
                this.strideActive = true;
                this.audio.playPowerChime();
                if (this.manualFreezeActive) {
                    this.showNotification("SUPER-STASIS COMBO: HYPER-SPEED THROUGH FROZEN TIME!");
                } else {
                    this.showNotification("KINETIC STRIDE ENGAGED: 2.2x HYPER-SPEED (6.0s)!");
                }
                if (kineticBtn) kineticBtn.classList.add('power-active');
                if (strideVignette) strideVignette.classList.add('active');
            } else {
                this.strideTimer = 0;
            }
        }

        // Active Kinetic Stride countdown
        if (this.strideTimer > 0) {
            this.strideTimer = Math.max(0, this.strideTimer - delta);
            if (kineticBtn) {
                kineticBtn.textContent = `STRIDE (${this.strideTimer.toFixed(1)}s)`;
            }
            if (this.strideTimer <= 0) {
                this.strideActive = false;
                if (kineticBtn) {
                    kineticBtn.classList.remove('power-active');
                    kineticBtn.textContent = "STRIDE";
                }
                if (strideVignette) strideVignette.classList.remove('active');
                this.showNotification("KINETIC STRIDE DEPLETED");
            }
        }

        // Concurrent Super-Stasis Combo HUD State
        const timeBadge = document.getElementById('hud-time-badge');
        if (timeBadge) {
            if (this.manualFreezeActive && this.strideActive) {
                timeBadge.textContent = `SUPER-STASIS [F:${this.freezeTimer.toFixed(1)}s | S:${this.strideTimer.toFixed(1)}s]`;
                timeBadge.classList.add('pulsing');
            } else if (this.manualFreezeActive) {
                timeBadge.textContent = `CHRONO STASIS [${this.freezeTimer.toFixed(1)}s ACTIVE]`;
                timeBadge.classList.add('pulsing');
            } else if (this.strideActive) {
                timeBadge.textContent = `KINETIC STRIDE [${this.strideTimer.toFixed(1)}s ACTIVE]`;
                timeBadge.classList.add('pulsing');
            }
        }
    }

    initPickups() {
        this.pickups = [];
        const pickupConfigs = [
            { type: 'health', pos: new THREE.Vector3(-6, 0.6, -12) },
            { type: 'ammo', pos: new THREE.Vector3(8, 0.6, -8) },
            { type: 'health', pos: new THREE.Vector3(4, 0.6, -45) },
            { type: 'ammo', pos: new THREE.Vector3(-4, 0.6, -65) },
            { type: 'ammo', pos: new THREE.Vector3(0, 0.6, -135) }
        ];

        pickupConfigs.forEach(cfg => {
            const group = new THREE.Group();
            group.position.copy(cfg.pos);

            if (cfg.type === 'health') {
                const boxMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3, emissive: 0x004422 });
                const baseBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), boxMat);
                group.add(baseBox);

                const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.52), crossMat);
                const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.52), crossMat);
                group.add(crossH);
                group.add(crossV);

                const pLight = new THREE.PointLight(0x00ff88, 0.8, 4);
                group.add(pLight);
            } else {
                const ammoMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
                const ammoCan = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.6), ammoMat);
                group.add(ammoCan);

                const pLight = new THREE.PointLight(0xffd700, 0.8, 4);
                group.add(pLight);
            }

            this.scene.add(group);
            this.pickups.push({
                type: cfg.type,
                mesh: group,
                basePos: cfg.pos.clone(),
                active: true,
                respawnTimer: 0
            });
        });
    }

    updatePickups(delta) {
        const playerPos = this.player.position;
        this.pickups.forEach(p => {
            if (!p.active) {
                p.respawnTimer -= delta;
                if (p.respawnTimer <= 0) {
                    p.active = true;
                    p.mesh.visible = true;
                }
                return;
            }

            p.mesh.rotation.y += 2.0 * delta;
            p.mesh.position.y = p.basePos.y + Math.sin(performance.now() * 0.003) * 0.12;

            const dist = playerPos.distanceTo(p.mesh.position);
            if (dist < 1.8) {
                p.active = false;
                p.mesh.visible = false;
                p.respawnTimer = 18.0;

                this.audio.playPowerChime();
                if (p.type === 'health') {
                    this.health = Math.min(100, this.health + 40);
                    this.armor = Math.min(100, this.armor + 25);
                    const hpBar = document.getElementById('hud-hp-bar');
                    const armorBar = document.getElementById('hud-armor-bar');
                    const hpLabel = document.getElementById('hud-hp-label');
                    const armorLabel = document.getElementById('hud-armor-label');
                    if (hpBar) hpBar.style.width = `${this.health}%`;
                    if (armorBar) armorBar.style.width = `${this.armor}%`;
                    if (hpLabel) hpLabel.textContent = `+ ${this.health}`;
                    if (armorLabel) armorLabel.textContent = `${this.armor}`;
                    this.showNotification("OBTAINED: NANO-MEDKIT (+40 HP, +25 ARMOR)");
                } else {
                    this.weapons.forEach(w => { w.ammo = w.maxAmmo; });
                    this.grenades = Math.min(4, this.grenades + 1);
                    const badge = document.getElementById('hud-grenade-count');
                    if (badge) badge.textContent = this.grenades;
                    this.updateActiveWeaponView();
                    this.showNotification("OBTAINED: AMMUNITION REFILL & GRENADE");
                }
            }
        });
    }

    ejectCasing(wepType) {
        if (wepType === "cannon") return;
        const casingGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.055, 6);
        const casingMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.25
        });
        const casing = new THREE.Mesh(casingGeo, casingMat);

        const spawnPos = new THREE.Vector3(0.22, -0.16, -0.42);
        spawnPos.applyMatrix4(this.camera.matrixWorld);
        casing.position.copy(spawnPos);

        const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const upDir = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
        const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

        const vel = rightDir.multiplyScalar(2.2 + Math.random() * 0.8)
            .add(upDir.multiplyScalar(1.2 + Math.random() * 0.6))
            .add(forwardDir.multiplyScalar(-0.6 - Math.random() * 0.3));

        casing.velocity = vel;
        casing.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18
        );
        casing.life = 1.4;

        this.scene.add(casing);
        this.spentCasings.push(casing);
    }

    updateSpentCasings(delta) {
        for (let i = this.spentCasings.length - 1; i >= 0; i--) {
            const c = this.spentCasings[i];
            c.position.addScaledVector(c.velocity, delta);
            c.velocity.y -= 9.8 * delta;
            c.rotation.x += c.rotationSpeed.x * delta;
            c.rotation.y += c.rotationSpeed.y * delta;
            c.rotation.z += c.rotationSpeed.z * delta;

            if (c.position.y <= 0.03) {
                c.position.y = 0.03;
                c.velocity.y = -c.velocity.y * 0.35;
                c.velocity.x *= 0.65;
                c.velocity.z *= 0.65;
            }

            c.life -= delta;
            if (c.life <= 0) {
                this.scene.remove(c);
                this.spentCasings.splice(i, 1);
            }
        }
    }

    updateMonsters(delta, timeAdvances) {
        this.monsters.forEach(m => {
            // Hit Flash Emissive Decay
            if (m.hitFlashTimer > 0) {
                m.hitFlashTimer -= delta;
                if (m.hitFlashTimer <= 0) {
                    m.traverse(child => {
                        if (child.isMesh && child.material && child.userData.origEmissive && child.material.emissive) {
                            child.material.emissive.copy(child.userData.origEmissive);
                        }
                    });
                }
            }

            // Squash & Stretch Scale Recovery Spring
            m.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1.0, delta * 15.0));

            if (m.isPeacefulApproaching) {
                const toPlayer = new THREE.Vector3().subVectors(this.player.position, m.position);
                toPlayer.y = 0;
                const dist = toPlayer.length();
                if (dist > 3.8) {
                    toPlayer.normalize();
                    m.position.addScaledVector(toPlayer, m.speed * 1.5);
                    m.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
                } else if (!this.dialogueTriggered) {
                    this.initiateSatiricalDialogue(m);
                }
                return;
            }

            if (m === this.talkingMonster) return;

            if (m.type === "bugged") {
                m.tick++;
                const glitchOffset = AluLogicBridge.calculateBuggedGlitchOffset(m.tick, m.id || 1);
                if (glitchOffset > 0) {
                    m.position.x += (Math.random() - 0.5) * glitchOffset * 4;
                    if (m.headMesh) m.headMesh.rotation.y = (Math.random() - 0.5) * 1.5;
                    this.audio.playGlitchSnap();
                }
            }

            if (timeAdvances || this.currentAct === 3) {
                const toPlayer = new THREE.Vector3().subVectors(this.player.position, m.position);
                toPlayer.y = 0;
                const dist = toPlayer.length();

                if (dist > 1.2) {
                    toPlayer.normalize();
                    m.position.addScaledVector(toPlayer, m.speed);
                    m.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
                } else {
                    this.damagePlayer(8);
                }
            }
        });
    }

    damagePlayer(amount) {
        this.audio.playPlayerHurt();
        this.triggerHitStop(0.06);
        this.addTrauma(0.42);

        if (this.armor > 0) {
            this.armor = Math.max(0, this.armor - amount);
        } else {
            this.health = Math.max(0, this.health - amount);
        }

        const hpBar = document.getElementById('hud-hp-bar');
        const armorBar = document.getElementById('hud-armor-bar');
        const hpLabel = document.getElementById('hud-hp-label');
        const armorLabel = document.getElementById('hud-armor-label');

        if (hpBar) hpBar.style.width = `${this.health}%`;
        if (armorBar) armorBar.style.width = `${this.armor}%`;
        if (hpLabel) hpLabel.textContent = `+ ${this.health}`;
        if (armorLabel) armorLabel.textContent = `${this.armor}`;

        const dmgFlash = document.getElementById('damage-flash');
        if (dmgFlash) {
            dmgFlash.style.opacity = '0.85';
            setTimeout(() => { dmgFlash.style.opacity = '0'; }, 160);
        }
    }

    checkActObjectives() {
        // Transition from Act 1 Hangar through opened blast doors into Sector 2 Corridor
        if (this.currentAct === 1 && this.gatesOpening && this.player.position.z < -25.5) {
            this.currentAct = 2;
            this.updateActBanner("ACT 2: THE KINETIC TRAP", "NAVIGATE CORRIDOR WITH SLOW VELOCITY OR TIME-FREEZE");
            this.showNotification("ENTERED SECTOR 2: KINETIC FIELD DETECTED // CROUCH OR FREEZE TIME", 5500);
            this.monsters.forEach(m => this.scene.remove(m));
            this.monsters = [];
        }

        // Sector 2 to Act 3: When approaching airlock at z <= -84, trigger cinematic cutscene!
        if (this.currentAct === 2) {
            if (this.player.position.z <= -84 && !this.inCutscene) {
                this.startPlanetArrivalCutscene();
            }
        }

        if (this.currentAct === 3 && this.monsters.length < 8) {
            this.spawnMonster(3);
        }
    }

    startPlanetArrivalCutscene() {
        if (this.inCutscene) return;
        this.inCutscene = true;
        this.cutsceneTimer = 0;
        this.cutsceneDuration = 8.5;

        // Hide HUD overlay and show cinematic letterbox overlay
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.style.display = 'none';

        const cinematicOverlay = document.getElementById('cinematic-overlay');
        if (cinematicOverlay) cinematicOverlay.style.display = 'block';

        const caption = document.getElementById('cinematic-caption');
        if (caption) caption.textContent = "SECTOR 2 AIRLOCK // DECOMPRESSION CYCLE INITIATED";

        // Hide weapon viewmodel
        if (this.weaponContainer) this.weaponContainer.visible = false;

        // Start airlock door opening sound and animation
        this.airlockDoorsOpening = true;
        if (this.audio) this.audio.playAirlockOpen();

        // Reset player root to origin during cutscene so camera coordinates are in world space
        this.player.position.set(0, 0, 0);
        this.player.rotation.set(0, 0, 0);
        this.playerYaw = 0;
        this.playerPitch = 0;
    }

    updatePlanetArrivalCutscene(delta) {
        this.cutsceneTimer += delta;
        const t = this.cutsceneTimer;
        const caption = document.getElementById('cinematic-caption');

        // Animate airlock doors sliding open horizontally into bulkheads
        if (this.airlockDoorsOpening && this.airlockOpenProgress < 1.0) {
            this.airlockOpenProgress = Math.min(1.0, this.airlockOpenProgress + delta * 0.65);
            if (this.airlockLeftGroup) this.airlockLeftGroup.position.x = -this.airlockOpenProgress * 4.2;
            if (this.airlockRightGroup) this.airlockRightGroup.position.x = this.airlockOpenProgress * 4.2;
            this.addTrauma(0.012);
        }

        // Camera path:
        // Phase 1 (0.0 to 2.5s): Camera stays inside corridor facing airlock, doors part open, revealing glowing nebula horizon
        if (t < 2.5) {
            this.camera.position.set(0, 1.7, -81);
            this.camera.rotation.set(0, 0, 0);
            if (caption) caption.textContent = "SECTOR 2 AIRLOCK // DEPRESSURIZING EXPEDITION BAY";
        }
        // Phase 2 (2.5 to 5.5s): Camera glides forward through open airlock portal, across ramp, tilting up to alien sky
        else if (t < 5.5) {
            const prog = (t - 2.5) / 3.0; // 0 to 1
            const camZ = THREE.MathUtils.lerp(-81, -94, prog);
            const camY = THREE.MathUtils.lerp(1.7, 3.2, Math.sin(prog * Math.PI));
            const pitch = THREE.MathUtils.lerp(0, 0.28, Math.sin(prog * Math.PI)); // tilt up to sky
            this.camera.position.set(0, camY, camZ);
            this.camera.rotation.set(pitch, 0, 0);
            if (caption) caption.textContent = "EXPEDITION ARRIVAL: EXOPLANET KELVON-9 SURFACE";
        }
        // Phase 3 (5.5 to 8.5s): Camera settles down to player eye height at start of planet surface, leveling forward
        else if (t < this.cutsceneDuration) {
            const prog = (t - 5.5) / 3.0; // 0 to 1
            const camZ = THREE.MathUtils.lerp(-94, -98, prog);
            const camY = THREE.MathUtils.lerp(3.2, 1.7, prog);
            const pitch = THREE.MathUtils.lerp(0.28, 0, prog);
            this.camera.position.set(0, camY, camZ);
            this.camera.rotation.set(pitch, 0, 0);
            if (caption) caption.textContent = "CHRONAL ANOMALY DETECTED // GLITCH SWARM DETECTED ON SURFACE";
        }
        // Cutscene finished
        else {
            this.finishPlanetArrivalCutscene();
        }
    }

    finishPlanetArrivalCutscene() {
        if (!this.inCutscene) return;
        this.inCutscene = false;

        const cinematicOverlay = document.getElementById('cinematic-overlay');
        if (cinematicOverlay) cinematicOverlay.style.display = 'none';

        const hud = document.getElementById('hud-overlay');
        if (hud) hud.style.display = 'block';

        if (this.weaponContainer) this.weaponContainer.visible = true;

        // Ensure airlock is fully open
        this.airlockOpenProgress = 1.0;
        if (this.airlockLeftGroup) this.airlockLeftGroup.position.x = -4.2;
        if (this.airlockRightGroup) this.airlockRightGroup.position.x = 4.2;

        // Position player on planet surface
        this.player.position.set(0, 0, -98);
        this.playerYaw = 0;
        this.playerPitch = 0;
        this.camera.position.set(0, 1.7, 0);
        this.camera.rotation.set(0, 0, 0);

        // Advance to Act 3
        this.currentAct = 3;
        this.kineticTrapUnlocked = true;
        const kineticBtn = document.getElementById('btn-power-kinetic');
        if (kineticBtn) kineticBtn.style.display = 'flex';

        this.updateActBanner("ACT 3: EXOPLANET KELVON-9", "SURVIVE THE ALIEN GLITCHED SWARM");
        this.showNotification("PLANETARY SURFACE REACHED! KINETIC STRIDE UNLOCKED [TAP STRIDE / KEY E]", 7000);
        this.spawnAct3BuggedSwarm();
    }

    updateCorridorMovementPuzzle(now, delta) {
        const velocityGauge = document.getElementById('kinetic-velocity-gauge');
        const gaugeFill = document.getElementById('kinetic-gauge-fill');
        const gaugeVal = document.getElementById('kinetic-gauge-val');

        if (this.currentAct === 2) {
            if (velocityGauge) velocityGauge.style.display = 'block';

            const playerSpeed = this.lastPlayerSpeed || 0;
            const maxSafeSpeed = 0.055;
            const speedRatio = Math.min(1.0, playerSpeed / 0.14);

            if (gaugeFill) gaugeFill.style.width = `${Math.round(speedRatio * 100)}%`;

            let hazardState = "HARMONIC"; // "HARMONIC", "OVERLOAD", "FROZEN", "PHASE"
            if (this.manualFreezeActive) {
                hazardState = "FROZEN";
                if (gaugeVal) gaugeVal.textContent = `STASIS ACTIVE [${this.freezeTimer.toFixed(1)}s] // HAZARD BYPASS`;
                if (gaugeFill) gaugeFill.style.background = "#00f0ff";
            } else if (this.strideActive) {
                hazardState = "PHASE";
                if (gaugeVal) gaugeVal.textContent = `KINETIC PHASE [${this.strideTimer.toFixed(1)}s] // 2.2x HYPER-STRIDE`;
                if (gaugeFill) gaugeFill.style.background = "#ffd700";
            } else if (playerSpeed <= maxSafeSpeed) {
                hazardState = "HARMONIC";
                if (gaugeVal) gaugeVal.textContent = `VELOCITY: ${(playerSpeed * 10).toFixed(2)} m/s [OPTIMAL HARMONIC]`;
                if (gaugeFill) gaugeFill.style.background = "#00ff88";
            } else {
                hazardState = "OVERLOAD";
                if (gaugeVal) gaugeVal.textContent = `VELOCITY: ${(playerSpeed * 10).toFixed(2)} m/s [WARNING: SPEED LOCK]`;
                if (gaugeFill) gaugeFill.style.background = "#ff3344";
            }

            // Update each laser barrier's visual state based on proximity & movement
            if (this.laserBarriers) {
                this.laserBarriers.forEach(barrier => {
                    const dz = Math.abs(this.player.position.z - barrier.z);
                    let col = 0x00f0ff;
                    let intensity = 0.9;
                    let beamAlpha = 0.75;

                    if (hazardState === "FROZEN") {
                        col = 0x00f0ff; // Cold frozen stasis blue
                        beamAlpha = 0.35;
                    } else if (hazardState === "PHASE") {
                        col = 0xffd700; // Phase gold
                        beamAlpha = 0.4;
                    } else if (hazardState === "HARMONIC") {
                        col = 0x00ff88; // Harmonic emerald
                        beamAlpha = dz < 4.0 ? 0.2 : 0.65;
                    } else {
                        col = 0xff2233; // Overload crimson
                        beamAlpha = 0.85 + Math.sin(now * 0.015) * 0.15;
                        intensity = 1.6;
                    }

                    barrier.statusMesh.material.color.setHex(col);
                    barrier.statusLight.color.setHex(col);
                    barrier.statusLight.intensity = intensity;
                    barrier.beams.forEach(b => {
                        b.material.color.setHex(col);
                        b.material.opacity = beamAlpha;
                        if (hazardState === "HARMONIC" && dz < 3.0) {
                            // Lasers part/retract safely when moving slowly
                            b.scale.set(0.1, 0.1, 0.1);
                        } else {
                            b.scale.set(1.0, 1.0, 1.0);
                        }
                    });

                    // Collision / Repulsion if player rushes through without powers or slow-walking
                    if (hazardState === "OVERLOAD" && dz < 0.9 && Math.abs(this.player.position.x) < 5.0) {
                        if (now - this.lastKineticAlertTime > 1200) {
                            this.lastKineticAlertTime = now;
                            this.triggerKineticSpeedBlock();
                            if (this.audio) this.audio.playLaserTrip();
                            this.showNotification("KINETIC OVERLOAD: CROUCH OR SLOW-WALK TO HARMONIZE, OR FREEZE TIME");
                            this.player.position.z = barrier.z + 1.2;
                        }
                    }
                });
            }
        } else {
            if (velocityGauge) velocityGauge.style.display = 'none';
        }
    }

    spawnAct3BuggedSwarm() {
        for (let i = 0; i < 7; i++) {
            this.spawnMonster(3);
        }
    }

    drawMinimapRadar() {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = 110;
        const h = canvas.height = 110;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 50;
        const scale = 1.8;

        ctx.clearRect(0, 0, w, h);

        // Circular Tactical Radar Bezel & Background
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // Dark Tactical Scanner Background
        const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
        bgGrad.addColorStop(0, "rgba(5, 20, 25, 0.88)");
        bgGrad.addColorStop(0.75, "rgba(2, 10, 16, 0.94)");
        bgGrad.addColorStop(1, "rgba(0, 5, 8, 0.98)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Tactical Coordinate Grid
        ctx.strokeStyle = "rgba(0, 240, 255, 0.10)";
        ctx.lineWidth = 1;
        for (let x = 11; x < w; x += 22) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 11; y < h; y += 22) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Concentric Tactical Range Rings (15m, 30m, 45m)
        ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
        [16, 32, 46].forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Continuous 360-Degree Rotating Sonar Sweep Line with Phosphor Glow Wedge
        this.radarSweepAngle = (this.radarSweepAngle + 0.045) % (Math.PI * 2);
        const trailSteps = 16;
        const trailArc = 0.55;
        for (let i = 0; i < trailSteps; i++) {
            const frac = i / trailSteps;
            const a1 = this.radarSweepAngle - (1 - frac) * trailArc;
            const a2 = a1 + (trailArc / trailSteps);
            const alpha = 0.22 * Math.pow(frac, 2.0);

            ctx.fillStyle = `rgba(0, 255, 200, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, a1, a2);
            ctx.closePath();
            ctx.fill();
        }

        // Leading Sonar Sweep Beam
        ctx.strokeStyle = "rgba(100, 255, 220, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(this.radarSweepAngle) * radius, cy + Math.sin(this.radarSweepAngle) * radius);
        ctx.stroke();

        // World to Radar Transform (Player-centric heading)
        const cosY = Math.cos(this.playerYaw);
        const sinY = Math.sin(this.playerYaw);
        const toRadar = (wx, wz) => {
            const rx = (wx - this.player.position.x) * scale;
            const rz = (wz - this.player.position.z) * scale;
            return {
                x: cx + (rx * cosY - rz * sinY),
                y: cy + (rx * sinY + rz * cosY)
            };
        };

        // Draw Architectural Boundaries
        ctx.strokeStyle = "rgba(0, 240, 255, 0.50)";
        ctx.lineWidth = 1.5;

        if (this.currentAct === 1) {
            const p1 = toRadar(-25, 25);
            const p2 = toRadar(25, 25);
            const p3 = toRadar(25, -25);
            const p4 = toRadar(-25, -25);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();
            ctx.stroke();

            // Fortress Gate Line (Golden amber or opening green)
            const g1 = toRadar(-5.5, -25);
            const g2 = toRadar(5.5, -25);
            ctx.strokeStyle = this.gatesOpening ? "#00ff88" : "#ffd700";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(g1.x, g1.y);
            ctx.lineTo(g2.x, g2.y);
            ctx.stroke();
        } else if (this.currentAct === 2) {
            const c1 = toRadar(-6, -25);
            const c2 = toRadar(6, -25);
            const c3 = toRadar(6, -85);
            const c4 = toRadar(-6, -85);

            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.lineTo(c3.x, c3.y);
            ctx.lineTo(c4.x, c4.y);
            ctx.closePath();
            ctx.stroke();

            // Sector 2 Kinetic Core Target Blip (Pulsing Amber Diamond)
            const coreP = toRadar(0, -80);
            const pulse = 1.0 + Math.sin(performance.now() * 0.006) * 0.25;
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.moveTo(coreP.x, coreP.y - 6 * pulse);
            ctx.lineTo(coreP.x + 6 * pulse, coreP.y);
            ctx.lineTo(coreP.x, coreP.y + 6 * pulse);
            ctx.lineTo(coreP.x - 6 * pulse, coreP.y);
            ctx.closePath();
            ctx.fill();
        }

        // Draw Pickups (Health = Cyan Cross, Ammo = Gold Crate)
        this.pickups.forEach(p => {
            if (!p.active) return;
            const pt = toRadar(p.mesh.position.x, p.mesh.position.z);
            if (pt.x >= 0 && pt.x <= w && pt.y >= 0 && pt.y <= h) {
                if (p.type === 'health') {
                    ctx.fillStyle = "#00ffcc";
                    ctx.fillRect(pt.x - 3.5, pt.y - 1.2, 7, 2.4);
                    ctx.fillRect(pt.x - 1.2, pt.y - 3.5, 2.4, 7);
                } else {
                    ctx.fillStyle = "#ffd700";
                    ctx.fillRect(pt.x - 2.5, pt.y - 2.5, 5, 5);
                }
            }
        });

        // Translucent Forward Vision Cone (75 deg Field of View)
        const fovGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 46);
        fovGrad.addColorStop(0, "rgba(255, 230, 0, 0.35)");
        fovGrad.addColorStop(0.65, "rgba(0, 240, 255, 0.16)");
        fovGrad.addColorStop(1, "rgba(0, 240, 255, 0.0)");

        ctx.fillStyle = fovGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 46, -Math.PI / 2 - 0.48, -Math.PI / 2 + 0.48);
        ctx.closePath();
        ctx.fill();

        // Monster Entity Blips
        this.monsters.forEach(m => {
            const mp = toRadar(m.position.x, m.position.z);
            if (mp.x >= 0 && mp.x <= w && mp.y >= 0 && mp.y <= h) {
                if (m === this.talkingMonster || m.isPeacefulApproaching) {
                    // Azazel Defector - Green Beacon with Halo Ring
                    ctx.fillStyle = "#00ff88";
                    ctx.beginPath();
                    ctx.arc(mp.x, mp.y, 4.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "rgba(0, 255, 136, 0.7)";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(mp.x, mp.y, 7.5 + Math.sin(performance.now() * 0.008) * 1.5, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (m.type === "bugged") {
                    // Act 3 The Bugged - Glitched Violet Diamond
                    ctx.fillStyle = "#bf00ff";
                    ctx.beginPath();
                    ctx.moveTo(mp.x, mp.y - 4);
                    ctx.lineTo(mp.x + 4, mp.y);
                    ctx.lineTo(mp.x, mp.y + 4);
                    ctx.lineTo(mp.x - 4, mp.y);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Hostile Crimson Monster - Red Dot with Pulsing Threat Halo
                    ctx.fillStyle = "#ff3344";
                    ctx.beginPath();
                    ctx.arc(mp.x, mp.y, 4, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "rgba(255, 51, 68, 0.55)";
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.arc(mp.x, mp.y, 6.5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        });

        // Player Center Arrow Chevron
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "rgba(0, 240, 255, 0.8)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx - 5.5, cy + 6);
        ctx.lineTo(cx, cy + 3.5);
        ctx.lineTo(cx + 5.5, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore(); // Restore clip

        // Tactical Compass Cardinal Markers (N, S, E, W) on Radar Bezel
        const northAngle = -this.playerYaw - Math.PI / 2;
        const cardinals = [
            { label: 'N', angle: northAngle, color: '#00f0ff' },
            { label: 'E', angle: northAngle + Math.PI / 2, color: 'rgba(0, 240, 255, 0.5)' },
            { label: 'S', angle: northAngle + Math.PI, color: 'rgba(0, 240, 255, 0.5)' },
            { label: 'W', angle: northAngle + Math.PI * 1.5, color: 'rgba(0, 240, 255, 0.5)' }
        ];

        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        cardinals.forEach(c => {
            const bx = cx + Math.cos(c.angle) * (radius - 5);
            const by = cy + Math.sin(c.angle) * (radius - 5);
            ctx.fillStyle = c.color;
            ctx.fillText(c.label, bx, by);
        });

        // Outer Bezel High-Tech Ring
        ctx.strokeStyle = "rgba(0, 240, 255, 0.65)";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new ChronoGame();

    window.game.debugShoot = function() {
        this.fireBullet(this.weapons[this.input.selectedWeaponIndex]);
    };
    window.game.debugShootSky = function() {
        this.playerPitch = -1.2;
        this.camera.rotation.x = -1.2;
        this.fireBullet(this.weapons[this.input.selectedWeaponIndex]);
    };
    window.game.debugAdvanceAct = function(actNum) {
        if (actNum === 2) {
            this.advanceFromDialogue();
        } else if (actNum === 3) {
            this.currentAct = 3;
            this.kineticTrapUnlocked = true;
            const kineticBtn = document.getElementById('btn-power-kinetic');
            if (kineticBtn) kineticBtn.style.display = 'flex';
            this.player.position.set(0, 0, -125);
            this.updateActBanner("ACT 3: THE BUGGED", "SURVIVE THE ENDLESS GLITCHED SWARM");
            this.spawnAct3BuggedSwarm();
        }
    };
    window.game.debugTriggerKineticBlock = function() {
        this.triggerKineticSpeedBlock();
    };
    window.game.debugThrowGrenade = function() {
        this.input.wantsGrenade = true;
        this.handleGrenadeAction();
    };
    window.game.debugHitMonster = function(dmg = 65) {
        let bestM = null;
        let bestDist = 999;
        this.monsters.forEach(m => {
            if (m.position.z < this.player.position.z) {
                const d = this.player.position.distanceTo(m.position);
                if (d < bestDist) {
                    bestDist = d;
                    bestM = m;
                }
            }
        });
        if (bestM) {
            // Orient player camera directly toward the monster
            const toM = new THREE.Vector3().subVectors(bestM.position, this.player.position);
            this.playerYaw = Math.atan2(-toM.x, -toM.z);
            this.playerPitch = 0.05;
            const hitPt = bestM.position.clone().add(new THREE.Vector3(0, 1.2, 0));
            this.damageMonster(bestM, dmg, hitPt, new THREE.Vector3(0, 0, -1));
        }
    };
    window.game.debugShootWall = function() {
        this.playerPitch = 0;
        this.playerYaw = 0;
        this.fireBullet(this.weapons[1]);
    };
    window.game.debugDamagePlayer = function() {
        this.damagePlayer(25);
    };
    window.game.debugStrafeBanking = function(dir = -1) {
        this.input.movement = { x: dir, y: 0, magnitude: 1.0 };
    };
    window.game.debugJumpAndLand = function() {
        this.input.wantsJump = true;
    };
    window.game.debugTriggerCutscene = function() {
        this.startPlanetArrivalCutscene();
    };
    window.game.debugFreeze = function() {
        this.manualFreezeUnlocked = true;
        this.input.wantsTimeFreeze = true;
    };
    window.game.debugStride = function() {
        this.kineticTrapUnlocked = true;
        this.input.wantsKineticPower = true;
    };
    window.game.debugSuperStasis = function() {
        this.manualFreezeUnlocked = true;
        this.kineticTrapUnlocked = true;
        this.input.wantsTimeFreeze = true;
        this.input.wantsKineticPower = true;
    };
});
