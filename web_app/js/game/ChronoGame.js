/**
 * Chronofrag Main 3D Game Engine
 * Act 1: Frozen Stasis & Skyward Aim Satirical Dialogue Trap
 * Act 2: Non-Newtonian Kinetic Trap (Speed Block vs Slowmo Glide)
 * Act 3: Endless Survival against "The Bugged" (Uncanny Glitched Faceless Humans)
 */
class ChronoGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.input = new ChronoInput();
        this.audio = window.ChronoAudio;

        // Game State
        this.currentAct = 1; // 1: Stasis, 2: Kinetic Trap, 3: The Bugged (Endless)
        this.health = 100;
        this.armor = 100;
        this.kills = 0;
        this.score = 0;
        this.wave = 1;

        // Time Dilation State
        this.isTimeFrozen = true;
        this.timeAdvanceTicks = 0;
        this.manualFreezeUnlocked = false;
        this.manualFreezeActive = false;
        this.manualFreezeTimer = 0;

        // Kinetic Trap State
        this.kineticTrapUnlocked = false;
        this.kineticPowerActive = false;
        this.kineticBlockCooldown = 0;

        // Dialogue State
        this.inDialogue = false;
        this.dialogueTriggered = false;

        // Weapons Arsenal
        this.weapons = [
            { name: "DUAL PISTOLS", ammo: 40, maxAmmo: 40, damage: 35, fireRate: 0.18, lastFired: 0, recoilTicks: 5 },
            { name: "NEON AK-CHRONO", ammo: 30, maxAmmo: 30, damage: 45, fireRate: 0.11, lastFired: 0, recoilTicks: 4 },
            { name: "HEAVY CANNON", ammo: 8, maxAmmo: 8, damage: 160, fireRate: 0.45, lastFired: 0, recoilTicks: 9 }
        ];

        // Three.js Systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.playerVelocity = new THREE.Vector3();
        this.playerYaw = 0;
        this.playerPitch = 0;

        // Entities & World
        this.monsters = [];
        this.projectiles = [];
        this.particles = [];
        this.sectorObjects = [];
        this.talkingMonster = null;
        this.kineticCoreMesh = null;

        // Weapon 3D Viewmodels
        this.weaponContainer = null;
        this.weaponMeshes = [];
        this.muzzleLight = null;
        this.recoilOffset = 0;

        // Texture Loader
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};

        this.init();
    }

    init() {
        this.loadGameTextures();
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

    loadGameTextures() {
        const texPath = "assets/textures/";
        this.textures.wallAlbedo = this.textureLoader.load(texPath + "wall_albedo.png");
        this.textures.wallNormal = this.textureLoader.load(texPath + "wall_normal.png");
        this.textures.floorAlbedo = this.textureLoader.load(texPath + "floor_albedo.png");
        this.textures.floorNormal = this.textureLoader.load(texPath + "floor_normal.png");
        this.textures.kineticAlbedo = this.textureLoader.load(texPath + "kinetic_albedo.png");
        this.textures.buggedSkin = this.textureLoader.load(texPath + "bugged_skin.png");
        this.textures.weaponCamo = this.textureLoader.load(texPath + "weapon_camo.png");

        // Repeat settings
        [this.textures.wallAlbedo, this.textures.wallNormal, this.textures.floorAlbedo, this.textures.floorNormal].forEach(t => {
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
        });
        this.textures.wallAlbedo.repeat.set(4, 2);
        this.textures.wallNormal.repeat.set(4, 2);
        this.textures.floorAlbedo.repeat.set(6, 6);
        this.textures.floorNormal.repeat.set(6, 6);
    }

    setupThreeScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x06080c);
        this.scene.fog = new THREE.FogExp2(0x080c14, 0.025);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 150);
        this.camera.position.set(0, 1.7, 0);

        this.player = new THREE.Object3D();
        this.player.position.set(0, 1.7, 10);
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
        this.renderer.toneMappingExposure = 1.1;
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x182030, 1.2);
        this.scene.add(ambientLight);

        // Dimensional Sky Rift Light
        const riftLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
        riftLight.position.set(0, 25, 0);
        this.scene.add(riftLight);

        // Subtle warm fill
        const fillLight = new THREE.PointLight(0xff4422, 0.8, 30);
        fillLight.position.set(0, 4, 10);
        this.scene.add(fillLight);
    }

    buildLevelArchitecture() {
        // --- SECTOR 1: THE CHAMBER OF STASIS (Act 1) ---
        const floorGeo = new THREE.PlaneGeometry(50, 50);
        const floorMat = new THREE.MeshStandardMaterial({
            map: this.textures.floorAlbedo,
            normalMap: this.textures.floorNormal,
            roughness: 0.4,
            metalness: 0.6
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, 0);
        this.scene.add(floor);

        // Ceiling with open Skyward Skylight
        const ceilGeo = new THREE.RingGeometry(6, 25, 32);
        const ceilMat = new THREE.MeshStandardMaterial({
            map: this.textures.wallAlbedo,
            roughness: 0.8
        });
        const ceil = new THREE.Mesh(ceilGeo, ceilMat);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(0, 8, 0);
        this.scene.add(ceil);

        // Sky Portal above skylight
        const skyGeo = new THREE.SphereGeometry(30, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const skyMat = new THREE.MeshBasicMaterial({
            color: 0x002244,
            side: THREE.BackSide,
            wireframe: true
        });
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        skyDome.position.set(0, 8, 0);
        this.scene.add(skyDome);

        // Walls around Sector 1
        const wallMat = new THREE.MeshStandardMaterial({
            map: this.textures.wallAlbedo,
            normalMap: this.textures.wallNormal,
            roughness: 0.7
        });
        const createWall = (w, h, x, y, z, rotY = 0) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), wallMat);
            mesh.position.set(x, y, z);
            mesh.rotation.y = rotY;
            this.scene.add(mesh);
            this.sectorObjects.push(mesh);
            return mesh;
        };

        createWall(50, 8, 0, 4, -25); // North
        createWall(50, 8, 0, 4, 25);  // South
        createWall(50, 8, -25, 4, 0, Math.PI / 2); // West
        createWall(50, 8, 25, 4, 0, Math.PI / 2);  // East

        // Pillars
        [-10, 10].forEach(px => {
            [-10, 10].forEach(pz => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 8, 16), wallMat);
                pillar.position.set(px, 4, pz);
                this.scene.add(pillar);
            });
        });

        // --- SECTOR 2: THE NON-NEWTONIAN KINETIC CORRIDOR (Act 2) ---
        // Situated north beyond z = -25 through a gateway
        const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 60), floorMat);
        corridorFloor.rotation.x = -Math.PI / 2;
        corridorFloor.position.set(0, 0, -55);
        this.scene.add(corridorFloor);

        // Kinetic Viscosity Fluid Field (Volumetric glow)
        const kineticFieldGeo = new THREE.BoxGeometry(11, 7, 58);
        const kineticFieldMat = new THREE.MeshBasicMaterial({
            map: this.textures.kineticAlbedo,
            transparent: true,
            opacity: 0.28,
            color: 0x00ffff,
            side: THREE.DoubleSide
        });
        this.kineticField = new THREE.Mesh(kineticFieldGeo, kineticFieldMat);
        this.kineticField.position.set(0, 3.5, -55);
        this.scene.add(this.kineticField);

        // Kinetic Energy Core at end of corridor (z = -80)
        const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xff9900,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.9
        });
        this.kineticCoreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.kineticCoreMesh.position.set(0, 2.0, -80);
        this.scene.add(this.kineticCoreMesh);

        // --- SECTOR 3: THE ENDLESS ANOMALY VAULT (Act 3) ---
        const vaultFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
        vaultFloor.rotation.x = -Math.PI / 2;
        vaultFloor.position.set(0, 0, -140);
        this.scene.add(vaultFloor);

        createWall(80, 10, 0, 5, -180); // Far North
        createWall(80, 10, -40, 5, -140, Math.PI / 2);
        createWall(80, 10, 40, 5, -140, Math.PI / 2);
    }

    buildWeaponViewmodels() {
        this.weaponContainer = new THREE.Group();
        this.camera.add(this.weaponContainer);

        // Muzzle flash dynamic light
        this.muzzleLight = new THREE.PointLight(0xff9933, 0, 8);
        this.muzzleLight.position.set(0.3, -0.2, -0.9);
        this.camera.add(this.muzzleLight);

        // 1. Dual Pistols (Slot 0)
        const pistolGroup = new THREE.Group();
        const pistolMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.9, roughness: 0.3 });
        [-0.22, 0.22].forEach(px => {
            const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.45), pistolMat);
            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.08), pistolMat);
            grip.position.set(0, -0.1, 0.12);
            grip.rotation.x = 0.25;
            const single = new THREE.Group();
            single.add(barrel);
            single.add(grip);
            single.position.set(px, -0.28, -0.6);
            pistolGroup.add(single);
        });
        this.weaponContainer.add(pistolGroup);
        this.weaponMeshes.push(pistolGroup);

        // 2. Assault Rifle with Neon Camo (Slot 1)
        const rifleGroup = new THREE.Group();
        const camoMat = new THREE.MeshStandardMaterial({
            map: this.textures.weaponCamo,
            metalness: 0.7,
            roughness: 0.35
        });
        const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.8), camoMat);
        const holoSight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.12), new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true }));
        holoSight.position.set(0, 0.1, -0.05);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.1), pistolMat);
        mag.position.set(0, -0.16, 0.05);
        mag.rotation.x = -0.2;
        rifleGroup.add(rifleBody);
        rifleGroup.add(holoSight);
        rifleGroup.add(mag);
        rifleGroup.position.set(0.24, -0.28, -0.65);
        this.weaponContainer.add(rifleGroup);
        this.weaponMeshes.push(rifleGroup);

        // 3. Heavy Cannon (Slot 2)
        const cannonGroup = new THREE.Group();
        const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.9, 16), pistolMat);
        cannonBarrel.rotation.x = Math.PI / 2;
        cannonGroup.add(cannonBarrel);
        cannonGroup.position.set(0.28, -0.32, -0.7);
        this.weaponContainer.add(cannonGroup);
        this.weaponMeshes.push(cannonGroup);

        this.updateActiveWeaponView();
    }

    updateActiveWeaponView() {
        this.weaponMeshes.forEach((mesh, idx) => {
            mesh.visible = (idx === this.input.selectedWeaponIndex);
        });
        const currentWep = this.weapons[this.input.selectedWeaponIndex];
        const ammoDisplay = document.getElementById('hud-ammo');
        if (ammoDisplay) {
            ammoDisplay.textContent = `${currentWep.ammo} / ${currentWep.maxAmmo}`;
        }
    }

    spawnAct1Monsters() {
        this.monsters = [];
        // Spawn 6 aggressive monsters in Sector 1
        for (let i = 0; i < 6; i++) {
            this.spawnMonster(1);
        }
    }

    spawnMonster(actType = 1) {
        const monster = new THREE.Group();

        if (actType === 1) {
            // Act 1 Demonic Monster: Crimson aggressive crystalline brute
            const mat = new THREE.MeshStandardMaterial({
                color: 0xdd1122,
                emissive: 0x550011,
                roughness: 0.3,
                metalness: 0.8
            });
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), mat);
            torso.position.y = 1.0;
            const head = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 8), mat);
            head.position.y = 1.8;
            head.rotation.x = Math.PI;

            // Spikes
            for (let s = 0; s < 4; s++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), mat);
                spike.position.set((s % 2 === 0 ? 0.45 : -0.45), 1.2 + s * 0.15, -0.2);
                spike.rotation.z = s % 2 === 0 ? -0.5 : 0.5;
                monster.add(spike);
            }

            monster.add(torso);
            monster.add(head);
            monster.type = "aggressive";
            monster.speed = 0.08;
            monster.health = 80;
        } else {
            // Act 3: "The Bugged" (Human figures with completely blank featureless faces)
            const skinMat = new THREE.MeshStandardMaterial({
                map: this.textures.buggedSkin,
                roughness: 0.25,
                metalness: 0.1
            });
            const suitMat = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.8 });

            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.4), suitMat);
            torso.position.y = 1.0;

            // Completely blank featureless smooth head
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), skinMat);
            head.position.y = 1.85;

            // Limbs
            const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), suitMat);
            leftArm.position.set(-0.48, 0.9, 0);
            const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), suitMat);
            rightArm.position.set(0.48, 0.9, 0);

            monster.add(torso);
            monster.add(head);
            monster.add(leftArm);
            monster.add(rightArm);
            monster.type = "bugged";
            monster.speed = 0.06;
            monster.health = 120;
            monster.tick = Math.floor(Math.random() * 100);
            monster.headMesh = head;
        }

        // Position
        const zMin = actType === 1 ? -20 : -170;
        const zMax = actType === 1 ? 2 : -115;
        const xRange = actType === 1 ? 18 : 30;

        monster.position.set(
            (Math.random() - 0.5) * xRange * 2,
            0,
            zMin + Math.random() * (zMax - zMin)
        );

        this.scene.add(monster);
        this.monsters.push(monster);
    }

    setupUIEvents() {
        const dialogueBtn = document.getElementById('dialogue-btn-proceed');
        if (dialogueBtn) {
            dialogueBtn.addEventListener('click', () => this.advanceFromDialogue());
            dialogueBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.advanceFromDialogue();
            }, { passive: false });
        }
    }

    advanceFromDialogue() {
        const modal = document.getElementById('dialogue-modal');
        if (modal) modal.style.display = 'none';
        this.inDialogue = false;

        // Grant Time Freeze Power!
        this.manualFreezeUnlocked = true;
        const freezeBtn = document.getElementById('btn-power-freeze');
        if (freezeBtn) freezeBtn.style.display = 'flex';

        this.audio.playPowerChime();
        this.showNotification("UNLOCKED: MANUAL TIME-FREEZE! (Tap [FREEZE] to activate)");

        // Transition to Act 2
        this.currentAct = 2;
        this.player.position.set(0, 1.7, -32);
        this.updateActBanner("ACT 2: THE KINETIC TRAP", "NAVIGATE THE CORRIDOR IN SLOW MOTION");

        // Clear Act 1 monsters and open corridor
        this.monsters.forEach(m => this.scene.remove(m));
        this.monsters = [];
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
            setTimeout(() => {
                badge.classList.remove('pulsing');
            }, 3000);
        }
    }

    triggerKineticSpeedBlock() {
        this.audio.playKineticBlock();
        const alertBox = document.getElementById('kinetic-alert');
        if (alertBox) {
            alertBox.style.opacity = '1';
            setTimeout(() => { alertBox.style.opacity = '0'; }, 600);
        }
        // Camera jolt
        this.camera.rotation.z = (Math.random() - 0.5) * 0.2;
    }

    // --- MAIN GAME TICK ---
    gameLoop(now) {
        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;

        this.handlePlayerLook();
        this.handleWeaponsAndShooting(now);
        this.handlePowers(delta);

        // Determine if Time advances using Alu Logic
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
        this.updateMonsters(delta, timeAdvances);
        this.updateProjectiles(delta, timeAdvances);
        this.updateParticles(delta, timeAdvances);
        this.checkActObjectives();
        this.drawMinimapRadar();

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

        // ADS Zoom
        const targetFOV = this.input.isADS ? 40 : 75;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.2);
        this.camera.updateProjectionMatrix();
    }

    handlePlayerMovement(delta) {
        if (this.inDialogue) return;
        const m = this.input.getMovement();
        let targetSpeed = m.magnitude * 0.14; // Base max speed

        // --- ACT 2: KINETIC TRAP SPEED BLOCK LOGIC ---
        if (this.currentAct === 2 && this.player.position.z < -25 && this.player.position.z > -85) {
            if (!this.kineticPowerActive) {
                const checkedSpeed = AluLogicBridge.calculateKineticVelocity(targetSpeed, 0.055);
                if (checkedSpeed === 0 && targetSpeed > 0.055) {
                    // Hard Speed Block hit!
                    this.triggerKineticSpeedBlock();
                    targetSpeed = 0;
                } else {
                    targetSpeed = checkedSpeed;
                }
            }
        }

        // Apply movement along camera forward/right vectors
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerYaw);

        const moveDir = new THREE.Vector3()
            .addScaledVector(forward, -m.y)
            .addScaledVector(right, m.x)
            .normalize();

        if (m.magnitude > 0.05) {
            this.player.position.addScaledVector(moveDir, targetSpeed);
        }

        // Camera recoil spring back
        this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, 0, 0.1);
    }

    handleWeaponsAndShooting(now) {
        if (this.inDialogue) return;
        const wep = this.weapons[this.input.selectedWeaponIndex];

        // Weapon switch check
        this.updateActiveWeaponView();

        // Reload check
        if (this.input.wantsReload) {
            this.input.wantsReload = false;
            wep.ammo = wep.maxAmmo;
            this.updateActiveWeaponView();
            this.audio.playTimeWarp();
        }

        // Firing check
        if ((this.input.isFiring || this.input.pendingFire) && now - wep.lastFired > wep.fireRate * 1000) {
            this.input.pendingFire = false;
            if (wep.ammo > 0) {
                wep.ammo--;
                wep.lastFired = now;
                this.timeAdvanceTicks = wep.recoilTicks;

                this.fireBullet(wep);
                this.updateActiveWeaponView();
            } else {
                wep.ammo = wep.maxAmmo; // Auto reload
            }
        }
    }

    fireBullet(wep) {
        const wepType = this.input.selectedWeaponIndex === 2 ? "cannon" : this.input.selectedWeaponIndex === 0 ? "pistol" : "rifle";
        this.audio.playGunshot(wepType);
        this.audio.playTimeWarp();

        // Muzzle flash
        this.muzzleLight.intensity = 2.5;
        setTimeout(() => { this.muzzleLight.intensity = 0; }, 50);

        // Weapon recoil animation
        const activeMesh = this.weaponMeshes[this.input.selectedWeaponIndex];
        if (activeMesh) {
            activeMesh.position.z += 0.08;
            setTimeout(() => { activeMesh.position.z -= 0.08; }, 80);
        }

        // Pitch in degrees & skyward look vector
        const lookDir = new THREE.Vector3();
        this.camera.getWorldDirection(lookDir);
        const pitchDeg = -this.playerPitch * (180 / Math.PI);
        const isSkyShot = (lookDir.y > 0.40) || AluLogicBridge.isSkywardShot(pitchDeg);

        // Raycast Bullet
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        if (!isSkyShot) {
            // Check monster hits
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

                // Show hitmarker
                const hm = document.getElementById('hit-marker');
                if (hm) {
                    hm.style.opacity = '1';
                    setTimeout(() => { hm.style.opacity = '0'; }, 80);
                }
            }
        } else {
            // SKYWARD SHOT! Advancing time peacefully & triggering monster conversation
            this.checkSkyShotDialogueTrigger();
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
                // Transition appearance to peaceful emerald / cyan
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
        this.inDialogue = true;
        this.dialogueTriggered = true;
        this.talkingMonster = monster;

        this.audio.playMonsterSpeech();

        // Monster changes appearance to peaceful green / golden
        monster.children.forEach(c => {
            if (c.material) c.material.color.setHex(0x00ff88);
        });

        // Get roast from Alu Logic
        const dialogueData = AluLogicBridge.getSatiricalDialogue(this.kills);

        const modal = document.getElementById('dialogue-modal');
        const titleEl = document.getElementById('dialogue-title');
        const roastEl = document.getElementById('dialogue-roast');
        const bodyEl = document.getElementById('dialogue-body');

        if (modal) {
            titleEl.textContent = dialogueData.title;
            roastEl.textContent = `"${dialogueData.roast}"`;
            bodyEl.textContent = dialogueData.text;
            modal.style.display = 'flex';
        }
    }

    damageMonster(monster, damage, hitPoint) {
        monster.health -= damage;
        this.createBloodParticles(hitPoint);

        // Floating combat damage text
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

            // Remove monster
            this.scene.remove(monster);
            const idx = this.monsters.indexOf(monster);
            if (idx !== -1) this.monsters.splice(idx, 1);

            // Act 1 Trap: Shooting monsters directly spawns more monsters!
            if (this.currentAct === 1 && !this.dialogueTriggered) {
                this.spawnMonster(1);
                this.spawnMonster(1); // Multiplying trap!
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
        // Manual Freeze
        if (this.input.wantsTimeFreeze && this.manualFreezeUnlocked) {
            this.input.wantsTimeFreeze = false;
            this.manualFreezeActive = !this.manualFreezeActive;
            this.audio.playTimeWarp();
            this.showNotification(this.manualFreezeActive ? "CHRONO STASIS: ACTIVE" : "CHRONO STASIS: RELEASED");
        }

        // Kinetic Stride Power
        if (this.input.wantsKineticPower && this.kineticTrapUnlocked) {
            this.input.wantsKineticPower = false;
            this.kineticPowerActive = true;
            this.audio.playPowerChime();
            this.showNotification("KINETIC DAMPENER: HYPER-VELOCITY ENGAGED!");
            setTimeout(() => {
                this.kineticPowerActive = false;
            }, 6000);
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

            if (m === this.talkingMonster) return; // Stopped peaceful

            if (m.type === "bugged") {
                // "The Bugged" Uncanny Glitch Stutter
                m.tick++;
                const glitchOffset = AluLogicBridge.calculateBuggedGlitchOffset(m.tick, m.id || 1);
                if (glitchOffset > 0) {
                    m.position.x += (Math.random() - 0.5) * glitchOffset * 4;
                    if (m.headMesh) m.headMesh.rotation.y = (Math.random() - 0.5) * 1.5;
                    this.audio.playGlitchSnap();
                }
            }

            // In Act 1, monsters ONLY move when time advances!
            // In Act 3, they close in relentlessly
            if (timeAdvances || this.currentAct === 3) {
                const toPlayer = new THREE.Vector3().subVectors(this.player.position, m.position);
                toPlayer.y = 0;
                const dist = toPlayer.length();

                if (dist > 1.2) {
                    toPlayer.normalize();
                    m.position.addScaledVector(toPlayer, m.speed);
                    m.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
                } else {
                    // Attack player!
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

        // Red damage flash
        this.camera.rotation.z = (Math.random() - 0.5) * 0.15;
    }

    checkActObjectives() {
        // Act 2 completion check: Reaching the Kinetic Core at z = -80
        if (this.currentAct === 2) {
            const distToCore = this.player.position.distanceTo(this.kineticCoreMesh.position);
            if (distToCore < 3.5) {
                this.kineticTrapUnlocked = true;
                const kineticBtn = document.getElementById('btn-power-kinetic');
                if (kineticBtn) kineticBtn.style.display = 'flex';

                this.audio.playPowerChime();
                this.showNotification("OBTAINED: KINETIC DAMPENER POWER!");

                // Advance to Act 3: Endless Mode
                this.currentAct = 3;
                this.player.position.set(0, 1.7, -115);
                this.updateActBanner("ACT 3: THE BUGGED", "SURVIVE THE ENDLESS GLITCHED SWARM");
                this.spawnAct3BuggedSwarm();
            }
        }

        // Act 3 Endless spawning
        if (this.currentAct === 3 && this.monsters.length < 8) {
            this.spawnMonster(3);
        }
    }

    spawnAct3BuggedSwarm() {
        for (let i = 0; i < 7; i++) {
            this.spawnMonster(3);
        }
    }

    updateProjectiles(delta, timeAdvances) {
        // Any physical rockets or grenades update here
    }

    drawMinimapRadar() {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = 110;
        const h = canvas.height = 110;
        const cx = w / 2;
        const cy = h / 2;
        const scale = 2.2;

        ctx.clearRect(0, 0, w, h);

        // Grid rings
        ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.stroke();

        // Player vision cone
        ctx.fillStyle = "rgba(255, 255, 0, 0.15)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 40, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
        ctx.closePath();
        ctx.fill();

        // Player pointer (center)
        ctx.fillStyle = "#00f0ff";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx - 5, cy + 5);
        ctx.lineTo(cx + 5, cy + 5);
        ctx.closePath();
        ctx.fill();

        // Monsters relative to player
        this.monsters.forEach(m => {
            const rx = (m.position.x - this.player.position.x) * scale;
            const rz = (m.position.z - this.player.position.z) * scale;

            // Rotate relative to player yaw
            const cos = Math.cos(this.playerYaw);
            const sin = Math.sin(this.playerYaw);
            const mapX = cx + (rx * cos - rz * sin);
            const mapY = cy + (rx * sin + rz * cos);

            if (mapX >= 0 && mapX <= w && mapY >= 0 && mapY <= h) {
                ctx.fillStyle = m.type === "bugged" ? "#bf00ff" : m.isPeacefulApproaching ? "#00ffcc" : m === this.talkingMonster ? "#00ff88" : "#ff3344";
                ctx.beginPath();
                ctx.arc(mapX, mapY, 3.5, 0, Math.PI * 2);
                ctx.fill();
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
    
    // Live remote inspection & debugging API for ADB
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
            this.player.position.set(0, 1.7, -125);
            this.updateActBanner("ACT 3: THE BUGGED", "SURVIVE THE ENDLESS GLITCHED SWARM");
            this.spawnAct3BuggedSwarm();
        }
    };
    window.game.debugTriggerKineticBlock = function() {
        this.triggerKineticSpeedBlock();
    };
});
