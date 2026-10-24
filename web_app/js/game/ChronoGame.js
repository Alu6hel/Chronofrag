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

        // Animated Fortress Gates
        this.gateLeftGroup = null;
        this.gateRightGroup = null;
        this.gateOpenAngle = 0;
        this.gatesOpening = false;

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
        // --- SECTOR 1: MEDITERRANEAN FORTRESS COURTYARD (Act 1 - Image 2 & 3) ---
        const cobbleMat = new THREE.MeshStandardMaterial({
            map: this.textures.cobblestone,
            normalMap: this.textures.cobblestoneNormal,
            roughness: 0.65,
            metalness: 0.15
        });
        const courtyardFloor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), cobbleMat);
        courtyardFloor.rotation.x = -Math.PI / 2;
        courtyardFloor.position.set(0, 0, 0);
        this.scene.add(courtyardFloor);

        const stoneMat = new THREE.MeshStandardMaterial({
            map: this.textures.ancientStone,
            normalMap: this.textures.ancientStoneNormal,
            roughness: 0.75,
            metalness: 0.2
        });

        const addWall = (w, h, x, y, z, rotY = 0) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), stoneMat);
            wall.position.set(x, y, z);
            wall.rotation.y = rotY;
            this.scene.add(wall);
            return wall;
        };

        addWall(50, 9, 0, 4.5, 25);
        addWall(50, 9, -25, 4.5, 0, Math.PI / 2);
        addWall(50, 9, 25, 4.5, 0, Math.PI / 2);

        // North Wall with Archway Opening for the Great Wooden Gate
        addWall(19, 9, -15.5, 4.5, -25);
        addWall(19, 9, 15.5, 4.5, -25);
        addWall(12, 3, 0, 7.5, -25);

        // Decorative Stone Archway Framing the Gate
        const archPillarMat = new THREE.MeshStandardMaterial({
            map: this.textures.ancientStone,
            normalMap: this.textures.ancientStoneNormal,
            roughness: 0.6
        });
        const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 2.0), archPillarMat);
        leftPillar.position.set(-5.5, 3.75, -24.5);
        this.scene.add(leftPillar);

        const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 2.0), archPillarMat);
        rightPillar.position.set(5.5, 3.75, -24.5);
        this.scene.add(rightPillar);

        const archRib = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 1.8, 16, 1, false, 0, Math.PI), archPillarMat);
        archRib.rotation.z = Math.PI / 2;
        archRib.rotation.y = Math.PI / 2;
        archRib.position.set(0, 6.0, -24.5);
        this.scene.add(archRib);

        // Heavy Ancient Wooden Fortress Double Doors with Hinged Groups (Strict Reference to Image 3)
        const woodGateMat = new THREE.MeshStandardMaterial({
            map: this.textures.woodenGate,
            normalMap: this.textures.woodenGateNormal,
            roughness: 0.55,
            metalness: 0.4
        });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.4, metalness: 0.9 });

        // Left Gate Group (Hinged at x = -4.75)
        this.gateLeftGroup = new THREE.Group();
        this.gateLeftGroup.position.set(-4.75, 3.0, -24.8);
        const gateLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(4.7, 6.0, 0.35), woodGateMat);
        gateLeftMesh.position.set(2.35, 0, 0); // Origin at hinge
        this.gateLeftGroup.add(gateLeftMesh);

        [ -1.5, 0.2, 1.8 ].forEach(gy => {
            const strap = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 0.42), ironMat);
            strap.position.set(2.35, gy, 0);
            this.gateLeftGroup.add(strap);
        });
        const ringLeft = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 16), ironMat);
        ringLeft.position.set(4.0, -0.2, 0.2);
        this.gateLeftGroup.add(ringLeft);
        this.scene.add(this.gateLeftGroup);

        // Right Gate Group (Hinged at x = 4.75)
        this.gateRightGroup = new THREE.Group();
        this.gateRightGroup.position.set(4.75, 3.0, -24.8);
        const gateRightMesh = new THREE.Mesh(new THREE.BoxGeometry(4.7, 6.0, 0.35), woodGateMat);
        gateRightMesh.position.set(-2.35, 0, 0); // Origin at hinge
        this.gateRightGroup.add(gateRightMesh);

        [ -1.5, 0.2, 1.8 ].forEach(gy => {
            const strap = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 0.42), ironMat);
            strap.position.set(-2.35, gy, 0);
            this.gateRightGroup.add(strap);
        });
        const ringRight = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 16), ironMat);
        ringRight.position.set(-4.0, -0.2, 0.2);
        this.gateRightGroup.add(ringRight);
        this.scene.add(this.gateRightGroup);

        // Courtyard Festive Hanging Bunting Pennants (Reference 1)
        const buntingMat = new THREE.MeshStandardMaterial({
            map: this.textures.buntingPennants,
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 0.75
        });
        const addBuntingLine = (x1, z1, x2, z2, y = 7.2) => {
            const dx = x2 - x1;
            const dz = z2 - z1;
            const len = Math.hypot(dx, dz);
            const angle = Math.atan2(dx, dz);
            const bunting = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.4), buntingMat);
            bunting.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
            bunting.rotation.y = angle + Math.PI / 2;
            this.scene.add(bunting);
            this.decorations.push(bunting);
        };
        addBuntingLine(-11, -10, 11, -10, 7.3);
        addBuntingLine(-11, 10, 11, 10, 7.3);
        addBuntingLine(-11, -10, -11, 10, 7.1);
        addBuntingLine(11, -10, 11, 10, 7.1);
        addBuntingLine(-5.5, -24, 5.5, -24, 6.6);

        // Wrought Iron Lanterns with Warm Amber Flame Lights (Reference 1)
        const lanternMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.9, roughness: 0.3 });
        const lanternBulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });
        const addCourtyardLantern = (x, y, z) => {
            const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4), lanternMat);
            lantern.position.set(x, y, z);
            const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.2), lanternBulbMat);
            lantern.add(bulb);
            const lampLight = new THREE.PointLight(0xffa834, 1.1, 10);
            lantern.add(lampLight);
            this.scene.add(lantern);
        };
        addCourtyardLantern(-5.2, 4.5, -24.0);
        addCourtyardLantern(5.2, 4.5, -24.0);
        addCourtyardLantern(-11, 4.8, -9.0);
        addCourtyardLantern(11, 4.8, -9.0);

        // Courtyard Props: Cover Crates, Barrels, and Stone Columns
        const crateMat = new THREE.MeshStandardMaterial({ map: this.textures.woodenGate, roughness: 0.7 });
        const barrelMat = new THREE.MeshStandardMaterial({ map: this.textures.woodenGate, roughness: 0.6 });

        const addCrate = (x, z, s = 1.4, rotY = 0) => {
            const crate = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), crateMat);
            crate.position.set(x, s / 2, z);
            crate.rotation.y = rotY;
            this.scene.add(crate);
        };
        addCrate(-8, 5, 1.5, 0.3);
        addCrate(-7, 6, 1.3, -0.2);
        addCrate(10, 2, 1.6, 0.45);
        addCrate(11, 4, 1.2, -0.5);

        const addBarrel = (x, z) => {
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.3, 14), barrelMat);
            barrel.position.set(x, 0.65, z);
            this.scene.add(barrel);
        };
        addBarrel(-9, 4);
        addBarrel(-8.2, 3.5);
        addBarrel(12, 1.5);

        [-11, 11].forEach(px => {
            [-10, 10].forEach(pz => {
                const column = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 8.5, 16), stoneMat);
                column.position.set(px, 4.25, pz);
                this.scene.add(column);
                const cap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), stoneMat);
                cap.position.set(px, 8.2, pz);
                this.scene.add(cap);
            });
        });

        const skyRing = new THREE.Mesh(new THREE.RingGeometry(8, 26, 32), stoneMat);
        skyRing.rotation.x = Math.PI / 2;
        skyRing.position.set(0, 9.0, 0);
        this.scene.add(skyRing);

        // --- SECTOR 2: HIGH-TECH TACTICAL FACILITY CORRIDOR (Act 2 - Image 4) ---
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

        const conduitWallMat = new THREE.MeshStandardMaterial({
            map: this.textures.conduitWall,
            normalMap: this.textures.conduitWallNormal,
            roughness: 0.65,
            metalness: 0.35
        });

        const leftCorrWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 60), conduitWallMat);
        leftCorrWall.position.set(-6, 3.75, -55);
        this.scene.add(leftCorrWall);

        const rightCorrWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 60), conduitWallMat);
        rightCorrWall.position.set(6, 3.75, -55);
        this.scene.add(rightCorrWall);

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

        // Illuminated Neon EXIT Signs (Strict Reference to Image 3)
        const exitMat = new THREE.MeshBasicMaterial({ map: this.textures.exitSign, side: THREE.DoubleSide });
        const addExitSign = (x, y, z, rotY = 0) => {
            const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), exitMat);
            sign.position.set(x, y, z);
            sign.rotation.y = rotY;
            const signGlow = new THREE.PointLight(0x00ff88, 1.2, 8);
            signGlow.position.set(0, 0, 0.2);
            sign.add(signGlow);
            this.scene.add(sign);
        };
        addExitSign(0, 6.2, -25.6, Math.PI); // Facing courtyard
        addExitSign(0, 6.2, -26.4, 0);       // Facing into corridor
        addExitSign(0, 6.2, -84.2, 0);       // Above exit into Act 3

        // Industrial Electrical Breaker Boxes on Concrete Pillars (Strict Reference to Image 3)
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
        addBreakerBox(-5.35, 3.2, -36, Math.PI / 2);

        const kineticGeo = new THREE.BoxGeometry(11.5, 7.0, 58);
        const kineticMat = new THREE.MeshBasicMaterial({
            map: this.textures.kineticAlbedo,
            transparent: true,
            opacity: 0.26,
            color: 0x00f0ff,
            side: THREE.DoubleSide
        });
        this.kineticField = new THREE.Mesh(kineticGeo, kineticMat);
        this.kineticField.position.set(0, 3.5, -55);
        this.scene.add(this.kineticField);

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

        // --- SECTOR 3: THE ENDLESS ANOMALY VAULT (Act 3) ---
        const vaultFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), woodFloorMat);
        vaultFloor.rotation.x = -Math.PI / 2;
        vaultFloor.position.set(0, 0, -140);
        this.scene.add(vaultFloor);

        addWall(80, 12, 0, 6, -180);
        addWall(80, 12, -40, 6, -140, Math.PI / 2);
        addWall(80, 12, 40, 6, -140, Math.PI / 2);

        [-18, 18].forEach(vx => {
            [-125, -155].forEach(vz => {
                const p = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 12, 16), stoneMat);
                p.position.set(vx, 6, vz);
                this.scene.add(p);
                const pGlow = new THREE.PointLight(0xbf00ff, 1.2, 14);
                pGlow.position.set(vx, 4, vz);
                this.scene.add(pGlow);
            });
        });

        // Floating Chronal Crystalline Obelisks in Act 3 Endless Vault
        const crystalMat = new THREE.MeshStandardMaterial({
            map: this.textures.anomalyCrystal,
            roughness: 0.15,
            metalness: 0.85,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.5
        });
        [-10, 10].forEach(cx => {
            [-115, -140, -165].forEach(cz => {
                const crystalGroup = new THREE.Group();
                crystalGroup.position.set(cx, 3.8, cz);

                const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), crystalMat);
                crystalGroup.add(crystal);

                const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: 0xaa44ff }));
                orbitRing.rotation.x = Math.PI / 2;
                crystalGroup.add(orbitRing);

                const crystalLight = new THREE.PointLight(0x00f0ff, 1.4, 12);
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
        if (commsDismissBtn) {
            const dismissComms = () => {
                const comms = document.getElementById('comms-transmission');
                if (comms) comms.style.display = 'none';
                if (this.commsDismissTimeout) clearTimeout(this.commsDismissTimeout);
            };
            commsDismissBtn.addEventListener('click', dismissComms);
            commsDismissBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                dismissComms();
            }, { passive: false });
        }

        const btnSettings = document.getElementById('btn-settings-toggle');
        const settingsModal = document.getElementById('settings-modal');
        const btnCloseSettings = document.getElementById('btn-settings-close');

        if (btnSettings && settingsModal) {
            const toggleSettings = (e) => {
                if (e.cancelable) e.preventDefault();
                const isOpen = settingsModal.style.display === 'flex';
                settingsModal.style.display = isOpen ? 'none' : 'flex';
            };
            btnSettings.addEventListener('click', toggleSettings);
            btnSettings.addEventListener('touchstart', toggleSettings, { passive: false });
            if (btnCloseSettings) {
                btnCloseSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });
                btnCloseSettings.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    settingsModal.style.display = 'none';
                }, { passive: false });
            }
        }

        document.querySelectorAll('.btn-act-warp').forEach(btn => {
            btn.addEventListener('click', (e) => {
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
            btnAudio.addEventListener('click', () => {
                const isMuted = btnAudio.classList.toggle('disabled');
                btnAudio.textContent = isMuted ? "MUTED" : "ENABLED";
                this.audio.setMuted(isMuted);
            });
        }

        const btnRestart = document.getElementById('btn-restart-game');
        if (btnRestart) {
            btnRestart.addEventListener('click', () => {
                this.warpToAct(1);
                if (settingsModal) settingsModal.style.display = 'none';
            });
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
            if (this.gateLeftGroup) this.gateLeftGroup.rotation.y = 0;
            if (this.gateRightGroup) this.gateRightGroup.rotation.y = 0;
            if (freezeBtn) freezeBtn.style.display = 'none';
            if (kineticBtn) kineticBtn.style.display = 'none';
            this.updateActBanner("ACT 1: FROZEN ONSLAUGHT", "SURVIVE THE TIME-STASIS CHAMBER");
            this.spawnAct1Monsters();
        } else if (actNum === 2) {
            this.player.position.set(0, 0, -32);
            this.manualFreezeUnlocked = true;
            this.kineticTrapUnlocked = false;
            this.gatesOpening = true;
            this.gateOpenAngle = Math.PI * 0.48;
            if (this.gateLeftGroup) this.gateLeftGroup.rotation.y = -this.gateOpenAngle;
            if (this.gateRightGroup) this.gateRightGroup.rotation.y = this.gateOpenAngle;
            if (freezeBtn) freezeBtn.style.display = 'flex';
            if (kineticBtn) kineticBtn.style.display = 'none';
            this.updateActBanner("ACT 2: THE KINETIC TRAP", "NAVIGATE THE CORRIDOR IN SLOW MOTION");
        } else if (actNum === 3) {
            this.player.position.set(0, 0, -125);
            this.manualFreezeUnlocked = true;
            this.kineticTrapUnlocked = true;
            this.gatesOpening = true;
            this.gateOpenAngle = Math.PI * 0.48;
            if (this.gateLeftGroup) this.gateLeftGroup.rotation.y = -this.gateOpenAngle;
            if (this.gateRightGroup) this.gateRightGroup.rotation.y = this.gateOpenAngle;
            if (freezeBtn) freezeBtn.style.display = 'flex';
            if (kineticBtn) kineticBtn.style.display = 'flex';
            this.updateActBanner("ACT 3: THE BUGGED", "SURVIVE THE ENDLESS GLITCHED SWARM");
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

    showNotification(text) {
        const badge = document.getElementById('hud-time-badge');
        if (badge) {
            badge.textContent = text;
            badge.classList.add('pulsing');
            setTimeout(() => { badge.classList.remove('pulsing'); }, 3000);
        }
    }

    triggerKineticSpeedBlock() {
        this.audio.playKineticBlock();
        const alertBox = document.getElementById('kinetic-alert');
        if (alertBox) {
            alertBox.style.opacity = '1';
            setTimeout(() => { alertBox.style.opacity = '0'; }, 600);
        }
        this.camera.rotation.z = (Math.random() - 0.5) * 0.2;
    }

    gameLoop(now) {
        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;

        this.handlePlayerLook();
        this.handleWeaponsAndShooting(now);
        this.handlePowers(delta);
        this.handleGrenadeAction();

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

        // Stride slows down world to 0.25x slow-motion, Time Freeze freezes world completely
        const worldDelta = this.strideActive ? (delta * 0.25) : delta;
        const monstersCanMove = timeAdvances && !this.manualFreezeActive;
        const worldPhysicsAdvance = !this.manualFreezeActive;

        this.updateMonsters(worldDelta, monstersCanMove);
        this.updateProjectiles(worldDelta, worldPhysicsAdvance);
        this.updateParticles(worldDelta, worldPhysicsAdvance);
        this.updateSpentCasings(delta);
        this.updatePickups(delta);
        this.checkActObjectives();
        this.drawMinimapRadar();

        // Animate Wooden Fortress Gates Swinging Open smoothly
        if (this.gatesOpening && this.gateOpenAngle < Math.PI * 0.48) {
            this.gateOpenAngle = Math.min(Math.PI * 0.48, this.gateOpenAngle + delta * 1.4);
            if (this.gateLeftGroup) this.gateLeftGroup.rotation.y = -this.gateOpenAngle;
            if (this.gateRightGroup) this.gateRightGroup.rotation.y = this.gateOpenAngle;
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

        this.player.rotation.y = this.playerYaw;
        this.camera.rotation.x = this.playerPitch;

        // Dynamic FOV: Zoom in on ADS (42 deg), expand on Kinetic Stride (+8 deg hyper-speed sensation)
        let targetFOV = this.input.isADS ? 42 : 75;
        if (this.strideActive) targetFOV += 8;

        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.22);
        this.camera.updateProjectionMatrix();

        const targetHeight = this.input.isCrouching ? 0.95 : 1.7;
        this.cameraHeight = THREE.MathUtils.lerp(this.cameraHeight, targetHeight, 0.18);
        this.camera.position.y = this.cameraHeight;
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

        // In Act 2 Kinetic Trap: Stride grants full immunity; normal speed triggers non-Newtonian dampener block
        if (this.currentAct === 2 && this.player.position.z < -25 && this.player.position.z > -85) {
            if (!this.strideActive) {
                const checkedSpeed = AluLogicBridge.calculateKineticVelocity(targetSpeed, 0.055);
                if (checkedSpeed === 0 && targetSpeed > 0.055) {
                    this.triggerKineticSpeedBlock();
                    targetSpeed = 0;
                } else {
                    targetSpeed = checkedSpeed;
                }
            }
        }

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerYaw);

        const moveDir = new THREE.Vector3()
            .addScaledVector(forward, -m.y)
            .addScaledVector(right, m.x)
            .normalize();

        if (m.magnitude > 0.05) {
            this.player.position.addScaledVector(moveDir, targetSpeed);
        }

        this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, 0, 0.1);
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
                this.damageMonster(target.monster, wep.damage, target.point);

                const hm = document.getElementById('hit-marker');
                if (hm) {
                    hm.style.opacity = '1';
                    setTimeout(() => { hm.style.opacity = '0'; }, 80);
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
        this.audio.playGunshot("cannon");
        this.audio.playPowerChime();

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
                this.damageMonster(m, grenade.damage, grenade.mesh.position);
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

        if (closestMonster) {
            if (!closestMonster.isPeacefulApproaching) {
                closestMonster.isPeacefulApproaching = true;
                this.talkingMonster = closestMonster;
                closestMonster.children.forEach(c => {
                    if (c.material) {
                        c.material.color.setHex(0x00ffcc);
                        if (c.material.emissive) c.material.emissive.setHex(0x004433);
                    }
                });
                this.showNotification("SURVIVING MONSTER HALTS: APPROACHING TO SPEAK...");
                this.audio.playMonsterSpeech();
            }

            if (closestDist <= 5.5) {
                this.initiateSatiricalDialogue(closestMonster);
            }
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
            if (commsSender) commsSender.textContent = dialogueData.title;
            if (commsRoast) commsRoast.textContent = `"${dialogueData.roast}"`;
            if (commsBody) commsBody.textContent = dialogueData.text;
            comms.style.display = 'flex';

            // Auto-dismiss after 10 seconds if not dismissed by tap
            if (this.commsDismissTimeout) clearTimeout(this.commsDismissTimeout);
            this.commsDismissTimeout = setTimeout(() => {
                if (comms) comms.style.display = 'none';
            }, 10000);
        }

        // Seamlessly unlock and swing open the courtyard fortress double doors
        this.gatesOpening = true;
        this.audio.playPowerChime();

        // Unlock Manual Time-Freeze power on tactical HUD
        this.manualFreezeUnlocked = true;
        const freezeBtn = document.getElementById('btn-power-freeze');
        if (freezeBtn) freezeBtn.style.display = 'flex';

        this.updateActBanner("ACT 1 // GATE UNLOCKED", "PROCEED THROUGH FORTRESS GATE TO SECTOR 2 FACILITY");
        this.showNotification("CHRONO STASIS CORE SYNCED! TAP [FREEZE] OR PRESS [F] FOR 6s TIME STOP");
    }

    damageMonster(monster, damage, hitPoint) {
        monster.health -= damage;
        this.createBloodParticles(hitPoint);

        if (hitPoint) {
            const v = hitPoint.clone().project(this.camera);
            if (v.z < 1.0) {
                const screenX = (v.x * 0.5 + 0.5) * window.innerWidth;
                const screenY = (-(v.y * 0.5) + 0.5) * window.innerHeight;
                this.showFloatingDamage({ x: screenX, y: screenY }, damage, damage >= 50);
            }
        }

        if (monster.health <= 0) {
            this.kills++;
            this.score += 150;
            const killEl = document.getElementById('hud-kills');
            const scoreEl = document.getElementById('hud-score');
            if (killEl) killEl.textContent = this.kills;
            if (scoreEl) scoreEl.textContent = this.score;

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
        el.textContent = `-${damage}` + (isCrit ? ' CRIT!' : '');
        el.style.left = `${Math.round(screenPos.x)}px`;
        el.style.top = `${Math.round(screenPos.y)}px`;
        hud.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 650);
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
            this.particles.push({ mesh: p, life: 0.6 });
        }
    }

    updateParticles(delta, timeAdvances) {
        if (!timeAdvances) return;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.velocity.y -= 9.8 * delta;
            p.life -= delta;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
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
                this.showNotification("CHRONO-STASIS ENGAGED: WORLD FROZEN FOR 6.0 SECONDS!");
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
            const timeBadge = document.getElementById('hud-time-badge');
            if (timeBadge) {
                timeBadge.textContent = `CHRONO STASIS [${this.freezeTimer.toFixed(1)}s ACTIVE]`;
                timeBadge.classList.add('pulsing');
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
                this.showNotification("KINETIC STRIDE ENGAGED: 2.2x HYPER-SPEED (6.0s)!");
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

        this.camera.rotation.z = (Math.random() - 0.5) * 0.15;
    }

    checkActObjectives() {
        // Seamless transition from Act 1 Courtyard through opened wooden fortress doors into Sector 2
        if (this.currentAct === 1 && this.gatesOpening && this.player.position.z < -25.5) {
            this.currentAct = 2;
            this.updateActBanner("ACT 2: THE KINETIC TRAP", "NAVIGATE THE CORRIDOR IN SLOW MOTION");
            this.showNotification("ENTERED SECTOR 2: KINETIC FIELD DETECTED");
            this.monsters.forEach(m => this.scene.remove(m));
            this.monsters = [];
        }

        // Sector 2 Kinetic Core Retrieval
        if (this.currentAct === 2) {
            const distToCore = this.player.position.distanceTo(this.kineticCoreMesh.position);
            if (distToCore < 3.5) {
                this.kineticTrapUnlocked = true;
                const kineticBtn = document.getElementById('btn-power-kinetic');
                if (kineticBtn) kineticBtn.style.display = 'flex';

                this.audio.playPowerChime();
                this.showNotification("OBTAINED: KINETIC STRIDE POWER! [TAP STRIDE / PRESS E]");

                this.currentAct = 3;
                this.updateActBanner("ACT 3: THE BUGGED", "SURVIVE THE ENDLESS GLITCHED SWARM");
                this.spawnAct3BuggedSwarm();
            } else if (this.player.position.z < -86) {
                // Walked past neon EXIT sign directly into Act 3 Endless Vault
                this.currentAct = 3;
                this.kineticTrapUnlocked = true;
                const kineticBtn = document.getElementById('btn-power-kinetic');
                if (kineticBtn) kineticBtn.style.display = 'flex';
                this.updateActBanner("ACT 3: THE BUGGED", "SURVIVE THE ENDLESS GLITCHED SWARM");
                this.spawnAct3BuggedSwarm();
            }
        }

        if (this.currentAct === 3 && this.monsters.length < 8) {
            this.spawnMonster(3);
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
        const scale = 1.8;

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
        ctx.lineWidth = 1;
        for (let x = 10; x < w; x += 22) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 10; y < h; y += 22) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.arc(cx, cy, 44, 0, Math.PI * 2);
        ctx.stroke();

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

        ctx.strokeStyle = "rgba(0, 240, 255, 0.55)";
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

            const g1 = toRadar(-5.5, -25);
            const g2 = toRadar(5.5, -25);
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 3;
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

            const coreP = toRadar(0, -80);
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.moveTo(coreP.x, coreP.y - 5);
            ctx.lineTo(coreP.x + 5, coreP.y);
            ctx.lineTo(coreP.x, coreP.y + 5);
            ctx.lineTo(coreP.x - 5, coreP.y);
            ctx.closePath();
            ctx.fill();
        }

        const fovGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 42);
        fovGrad.addColorStop(0, "rgba(255, 230, 0, 0.40)");
        fovGrad.addColorStop(0.7, "rgba(0, 240, 255, 0.18)");
        fovGrad.addColorStop(1, "rgba(0, 240, 255, 0.0)");

        ctx.fillStyle = fovGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 42, -Math.PI / 2 - 0.48, -Math.PI / 2 + 0.48);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#00f0ff";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx - 5, cy + 5);
        ctx.lineTo(cx + 5, cy + 5);
        ctx.closePath();
        ctx.fill();

        this.monsters.forEach(m => {
            const mp = toRadar(m.position.x, m.position.z);
            if (mp.x >= 0 && mp.x <= w && mp.y >= 0 && mp.y <= h) {
                ctx.fillStyle = m.type === "bugged" ? "#bf00ff" : m.isPeacefulApproaching ? "#00ffcc" : m === this.talkingMonster ? "#00ff88" : "#ff3344";
                ctx.beginPath();
                ctx.arc(mp.x, mp.y, 3.8, 0, Math.PI * 2);
                ctx.fill();

                if (m.type === "aggressive") {
                    ctx.strokeStyle = "rgba(255, 51, 68, 0.5)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(mp.x, mp.y, 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        });
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
});
