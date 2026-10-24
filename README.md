<div align="center">
  <h1>⏳ CHRONOFRAG</h1>
  <p><strong>A Kinetic-Dilation First Person Shooter for Android</strong></p>
  <p><i>Powered by Math-Proven Systems Logic in the Alu Language</i></p>
</div>

---

## 🎮 Game Concept & High Vision

**Chronofrag** is a mobile first-person shooter (FPS) that subverts traditional shooter mechanics:
- **Default State**: Time is frozen. Dust hangs stationary in the air. Enemies freeze mid-stride.
- **The Trigger Pulse**: **Time ONLY moves when you fire your gun.** Every bullet shot pulses time forward by a slice of reality ($\Delta t$).
- **The Combat Illusion**: Terrifying, aggressive red crystalline monsters rush toward the player whenever bullets are fired. If the player shoots the monsters directly, they shatter—only for spatial portals to instantly spawn replacements. Shooting monsters is a psychological trap that locks the player into an endless slaughter loop.

---

## 📖 The Campaign & Story Progression

```
[ ACT 1: THE FROZEN ONSLAUGHT ] 
       │
       ├─► Player shoots monsters directly ──► Monsters multiply endlessly (The Trap)
       │
       └─► Player fires while aiming skyward (> 60° pitch) ──► Time advances safely
             │
             ▼
       [ SATIRICAL MONSTER ENCOUNTER ]
       Monster stops attacking, roasts player's kill count, and reveals the escape method.
             │
             ▼
       [ UNLOCK: MANUAL TIME-FREEZE POWER ]
             │
             ▼
[ ACT 2: THE NON-NEWTONIAN KINETIC TRAP ]
       │
       ├─► Player sprints / moves fast ──► Hard "CHARACTER MOVEMENT SPEED BLOCK" (Halt to 0)
       │
       └─► Player moves in slow-motion ──► Glides through the viscous field without resistance
             │
             ▼
       [ UNLOCK: KINETIC DAMPENER POWER ]
             │
             ▼
[ ACT 3: THE ENDLESS ENDING — "THE BUGGED" ]
       Infinite survival arena against uncanny, faceless humanoid glitch entities.
```

### Act 1: The Frozen Stasis & The Sky-Aim Conversational Twist
1. **The Scenario**: The player spawns in a brutalist chamber surrounded by snarling, aggressive crystalline monsters. Whenever the player fires, time snaps into motion and the monsters charge.
2. **The Deception**: Shooting the monsters only multiplies them. The kill counter ticks up, but escape is impossible through violence alone.
3. **The Discovery**: Unbeknownst to the player, if you aim straight up into the open skylight (pitch $\ge 60^\circ$) and pull the trigger, time advances without killing the incoming monsters.
4. **The Satirical Roast**: When an uninjured monster enters close proximity (< 8m), it drops its arms, changes to peaceful green, and initiates a fourth-wall breaking conversation. The monster dynamically evaluates the player's kill count:
   - **0 Kills**: *"Wait... you fired straight into empty air on your very first shot?! Are you psychic or did you hack the repo? You're ruining my dramatic entrance."*
   - **1–5 Kills**: *"Took down a couple of my cousins before you realized aiming at clouds advances time without splattering us, huh? Fair enough."*
   - **6–25 Kills**: *"Seriously? You vaporized 17 of my squadmates in frozen time before thinking: 'Hey, what if I don't shoot them directly?' Humans are terrifying."*
   - **> 25 Kills**: *"LOOK AT THIS MESS, JOHN WICK! Half our legion is frozen pink mist! Relax your trigger finger, take a breath, and let me teach you how to escape before you depopulate the dimension."*
5. **The Reward**: The monster grants the player the **Manual Time-Freeze Power** (toggleable at will) and opens the gateway to Act 2.

### Act 2: The Non-Newtonian Kinetic Trap
1. **The Deception**: The player enters a long corridor that looks eerily serene, bathed in translucent cyan light.
2. **The Trap**: The corridor is permeated by a non-Newtonian inertial fluid field.
   - If the player pushes the movement joystick firmly or tries to sprint ($v > v_{\text{threshold}}$), the fluid field instantly locks solid, slamming the player into a literal **"Character Movement Speed Block"** where momentum drops to zero.
   - If the player tilts the joystick gently, moving in slow motion ($v \le v_{\text{threshold}}$), the fluid yields and the character glides effortlessly through the field.
3. **The Reward**: Reaching the end of the corridor awards the **Kinetic Dampener Power** (allowing high-speed velocity bursts through kinetic fields).

### Act 3: The Endless Ending — "The Bugged"
1. **The Culmination**: The campaign leads into an infinite survival arena.
2. **The Enemies**: The swarm consists of **"The Bugged"**—uncanny human figures dressed in dark tactical attire whose faces are completely blank, smooth, and featureless (no eyes, mouth, or nose).
3. **Uncanny Animation**: They advance with unnatural physics—gliding smoothly, punctuated by sudden 2-frame positional micro-teleports, neck-snapping twitch rotations, and frame drops.
4. **Infinite Survival**: Players utilize all acquired mechanics—Trigger-Pulsed Time, Manual Time-Freeze, and Kinetic Dampening—to survive endless waves and set high scores.

---

## ⚡ The Alu Language Systems Core

Chronofrag's core game mechanics and mathematical verifications are written in **Alu 1.0** (`alu_core/chrono_core.alu`), the world's first **Physics-First, Proof-Carrying Systems Language**:
- **Zero-Day Immunity & Z3 Mathematical Proofs**: Every routine in `chrono_core.alu` is verified by the Z3 Theorem Prover at compile time to ensure absolute memory safety and bounds correctness.
- **Implemented Alu Logic**:
  - `calculate_time_advance(is_firing, recoil_ticks, manual_freeze_active)`: Proves deterministic time dilation behavior.
  - `is_skyward_shot(pitch_deg)`: Evaluates celestial angles for peace triggers.
  - `can_initiate_monster_dialogue(is_skyward, is_firing, monster_dist)`: State transition guard.
  - `get_satirical_dialogue_id(kill_count)`: Dynamic fourth-wall satirical roast selector.
  - `calculate_kinetic_velocity(target_speed, max_allowed_speed)`: Non-Newtonian shear-thickening velocity limiter.
  - `calculate_bugged_glitch_offset(tick, entity_id)`: Deterministic uncanny micro-jerk generator.

To compile and verify the Alu core:
```bash
./alu_core/build_alu.sh
```

---

## 🎨 AI Generation Pipeline for Maps & Textures

See the dedicated documentation in [`docs/AI_MAPS_AND_TEXTURES.md`](docs/AI_MAPS_AND_TEXTURES.md).

### 1. PBR Texture Synthesis
- **Albedo / Diffuse**: Generated using FLUX.1 / Stable Diffusion XL with `--tile` circular padding prompts:
  `"seamless tileable texture of brutalist scuffed concrete wall, dark grey, subtle moisture streaks, flat shot, no shadows"`
- **Normal & Roughness Maps**: Extracted using monocular depth estimation models (Marigold / Depth-Anything-V2) and converted into tangent-space RGB normal maps via Sobel filters.
- **Offline Generator**: Run `python3 tools/generate_textures.py` to synthesize the full texture set locally with zero dependencies.

### 2. 3D Levels & Meshes
- **Modular Geometry**: Generated via text-to-3D APIs (Tripo3D, Meshy.ai) into low-poly game-ready GLTF models (<5k tris) optimized for mobile GPUs.
- **Procedural Level Assembly**: Assembled via Wave Function Collapse (WFC) using an AI-generated adjacency matrix.
- **360° Skyboxes**: Generated with Blockade Labs Skybox AI for atmospheric dimensional horizons.

### 3. "The Bugged" & Demonic Character Generation
- Concept art generated via Midjourney / FLUX.
- Low-poly mesh synthesized via Tripo3D and auto-rigged with humanoid skeletons in Adobe Mixamo.
- Featureless uncanny faces rendered with porcelain roughness shaders and vertex glitch jitter.

---

## 📱 Mobile FPS Touch Layout

The touch HUD is optimized for high-intensity mobile combat:
- **Left Thumb**: Dynamic floating virtual joystick for omnidirectional movement.
- **Right Screen**: High-precision swipe look zone with inertial dampening and ADS sensitivity reduction.
- **Action Buttons**:
  - **FIRE**: Large ergonomic thumb trigger with muzzle flash feedback.
  - **ADS (Aim Down Sights)**: Toggles optical scope zoom and tightens reticle.
  - **RELOAD**: Quick tactical mag swap.
  - **FREEZE**: Manual time-freeze toggle (unlocked after Act 1).
  - **STRIDE**: Kinetic dampening hyper-stride (unlocked after Act 2).
- **Weapon Dock**: Quick switch between Dual Pistols, Neon AK-Chrono, and Heavy Cannon.
- **Real-Time Minimap Radar**: Top-left tactical radar showing player orientation, vision cone, and color-coded entity blips (Red: Hostile, Green: Peaceful Talker, Purple: The Bugged).

---

## 🛠️ Building & Running Chronofrag

### Build Standalone Android APK
Builds a signed, production-aligned `chronofrag.apk` using the installed Android SDK 36:
```bash
./android_build/build_apk.sh
```
Output: `chronofrag.apk` (1.2 MB, 100% offline, zero network dependencies).

### Install to Connected Device / Emulator
```bash
adb install -r chronofrag.apk
```

### Preview in Browser / Desktop
Run any local static HTTP server:
```bash
cd web_app && python3 -m http.server 8080
```
Open `http://localhost:8080` in Chrome or mobile browser.
Desktop controls: `WASD` to move, `Mouse` to aim, `Left Click` to shoot, `Right Click` to ADS, `R` to reload, `Space` for Freeze, `E` for Stride, `1-3` to swap weapons.

---

## 📂 Project Structure

```
Chronofrag/
├── alu_core/                  # Math-proven systems code in Alu
│   ├── chrono_core.alu        # Core game logic & Z3 verified equations
│   ├── build_alu.sh           # Alu compiler & test script
│   └── libchrono_core.so      # Compiled native shared object
├── android_build/             # Android native packaging
│   ├── AndroidManifest.xml    # App manifest & permissions
│   ├── build_apk.sh           # Automated APK compilation pipeline
│   ├── res/                   # App icons, layouts, and styles
│   └── src/                   # Native Java activity & webview bridge
├── docs/                      # Technical design documentation
│   └── AI_MAPS_AND_TEXTURES.md# Complete AI generation workflows
├── tools/                     # Pipeline utilities
│   └── generate_textures.py   # Pure-Python procedural PBR texture generator
├── web_app/                   # Interactive 3D mobile game engine
│   ├── assets/textures/       # Generated PBR texture sets
│   ├── css/style.css          # Mobile FPS HUD styling
│   ├── index.html             # Main entry point & touch UI
│   └── js/
│       ├── lib/three.min.js   # Three.js 3D library
│       └── game/
│           ├── AudioSystem.js # Procedural WebAudio synthesizer
│           ├── AluLogicBridge.js # Client mirror of Alu algorithms
│           ├── TouchInput.js  # Dual virtual joystick engine
│           └── ChronoGame.js  # Three.js game loop & campaign acts
├── chronofrag.apk             # Standalone installable Android APK
└── README.md                  # Project documentation & lore
```

---

## ⚖️ License
MIT License. Created for the Chronofrag community.
