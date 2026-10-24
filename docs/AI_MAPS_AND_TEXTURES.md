# AI Generation Pipeline: Maps, Textures, Shaders, & Characters for Chronofrag

This technical blueprint details how generative AI models and pipelines are used to produce production-grade 3D level geometry, seamless PBR texture sets, skyboxes, and uncanny character assets for Chronofrag on Android.

---

## 1. PBR Texture Generation Pipeline (Albedo, Normal, Roughness, AO)

Modern mobile FPS titles require Physically Based Rendering (PBR) materials consisting of:
1. **Albedo / Base Color**: Pure diffuse color without pre-baked lighting.
2. **Normal Map (Tangent Space)**: Surface micro-geometry for dynamic lighting on mobile.
3. **Roughness Map**: Defines specular highlight sharpness.
4. **Metallic Map**: Distinguishes dielectrics (stone/concrete) from conductors (metals/weapon chassis).
5. **Ambient Occlusion (AO)**: Crevice shadows to enhance visual depth on mobile GPUs.

### A. Seamless Albedo Generation via Latent Diffusion
Using **FLUX.1-dev** or **Stable Diffusion XL (SDXL)** with seamless tiling configurations:
- **Tiling Mode**: In ComfyUI or WebUI, enable `Seamless Tile / Circular Padding` in convolution layers.
- **Example Prompts**:
  - *Industrial Concrete*: `"seamless tileable texture of brutalist scuffed concrete wall, dark grey, subtle moisture streaks, micro-scratches, 8k raw photo, diffuse lighting, flat shot, no shadows --no lighting, flash, vignette"`
  - *Kinetic Trap Chamber*: `"seamless tileable non-newtonian fluid wall surface, opalescent dark polymer, iridescent sheen, sub-surface scattering pattern, macro flat surface"`
  - *The Bugged Face Texture*: `"seamless smooth mannequin skin texture, eerie pale flesh tone, zero facial features, poreless uncanny silicone sheen"`

### B. AI Depth & Normal Map Synthesis
Convert raw diffuse images into high-precision tangent-space normal maps:
- **Models**: **Marigold** (Generative Depth Estimation) or **Depth-Anything-V2** produce high-resolution monocular depth from diffuse textures.
- **Normal Conversion**: Compute gradients $\nabla Z = (\frac{\partial z}{\partial x}, \frac{\partial z}{\partial y})$ to construct the tangent-space normal vector $\vec{N} = \text{normalize}(-\nabla Z_x, -\nabla Z_y, 1.0)$ encoded in RGB:
  $$R = 0.5 + 0.5 N_x, \quad G = 0.5 + 0.5 N_y, \quad B = 0.5 + 0.5 N_z$$
- **Tools**: In Python, our bundled script `tools/generate_textures.py` executes Sobel filter-based normal and roughness generation automatically.

---

## 2. 3D Map & Level Geometry Pipeline

First-person mobile shooters need low-poly, optimized collision meshes with high frame-rate rendering.

### A. Modular 3D Kit Generation via Text-to-3D / Image-to-3D
Generative tools for modular architectural geometry:
- **Tripo3D / Meshy.ai API**:
  - Prompt: `"low poly scifi military bunker corridor modular piece, straight hallway segment, flat collision floor, quad mesh, game-ready GLTF"`.
  - Output: GLTF / GLB models under 5,000 polygons, optimal for Android Adreno and Mali GPUs.
- **CSM (Common Sense Machines) / Rodin**:
  - Used for hero assets: the Time-Stasis Anchor, the Kinetic Core, and environmental cover crates.

### B. AI Wave Function Collapse (WFC) & Procedural Level Assembly
Instead of generating a monolithic single mesh that chokes mobile memory, Chronofrag uses **AI-Assisted Modular Assembly**:
1. AI generates a standardized kit of modular tiles:
   - `tile_corridor_straight.gltf`
   - `tile_corner_90.gltf`
   - `tile_intersection_4way.gltf`
   - `tile_vault_arena.gltf`
2. An LLM (e.g. Gemini / Claude / local Gemma) writes the **WFC Adjacency Matrix** in JSON defining which modules connect at sockets [North, South, East, West].
3. The in-engine procedural level builder executes the collapse algorithm to create layout variations for Act 1 (Chamber of Stasis), Act 2 (Kinetic Corridor), and Act 3 (Endless Anomaly Vault).

### C. 360° Skybox Panoramas
- **Tool**: **Blockade Labs (Skybox AI)**
- **Style**: `"Surreal frozen battlefield, time rift tearing open in the dark sky, floating shattered stone debris frozen in midair, eerie cyan and crimson atmospheric lighting, equirectangular 360 panorama"`.
- Mapped onto a low-poly celestial hemisphere in the game engine.

---

## 3. Character & Monster AI Pipeline

### A. Act 1: Aggressive Demonic Monsters
- **Concept**: Intimidating, grotesque fiends sprinting with violent rage—who abruptly halt and speak eloquently when you shoot into the air.
- **Generation**:
  - Image concept generated via Midjourney / FLUX.
  - 3D mesh synthesized via Tripo3D / Meshy.
  - Rigged automatically via Adobe Mixamo with standard humanoid bone skeletons.
  - Animations imported: `Sprint_Aggressive.fbx`, `Idle_Hostile.fbx`, `Puzzled_Look_Up.fbx`, `Cross_Arms_Talk.fbx`.

### B. Act 3: "The Bugged" (The Endless Ending)
- **Concept**: Humanoid forms wearing dark combat attire whose faces are completely smooth and blank (no eyes, no mouth, no nose). They move with uncanny physics: smooth floating combined with sudden 2-frame micro-teleports and jittery neck snaps.
- **Shader Implementation**:
  - Vertex Shader injects high-frequency procedural glitch noise:
    ```glsl
    if (sin(u_time * 20.0 + a_position.y * 10.0) > 0.85) {
        transformed.x += sin(u_time * 50.0) * 0.15;
    }
    ```
  - Fragment Shader applies a featureless porcelain albedo with subtle chromatic edge fringing.

---

## 4. Satirical Dialogue & Audio Synthesis

### A. Dynamic Satirical Roasting Scripting
The monster's dialogue dynamically changes depending on how many monsters the player slaughtered before discovering the sky-shot trick:
- **0 Kills (Pacifist/Omniscient)**:
  *"Wait... you fired straight into the ceiling on your very first round? Are you psychic or did you hack the source code? Either way, you're ruining my dramatic entrance."*
- **1-5 Kills (Normal Learner)**:
  *"Took down a couple of my guys before you realized aiming at clouds advances time without splattering us, huh? Fair enough. Let's talk business."*
- **6-25 Kills (Bloodthirsty)**:
  *"Seriously? You vaporized 17 of my squadmates in frozen time before thinking: 'Hey, what if I don't shoot them directly?' Humans are terrifying."*
- **> 25 Kills (Genocidal Menace)**:
  *"Look around you, John Wick! Half our legion is floating red vapor! You could've just aimed up! Relax your trigger finger, take a deep breath, and let me teach you how to escape before you depopulate the quadrant."*

### B. Voice Synthesis
- Pre-rendered or edge-generated using **Piper TTS** or **Kokoro-82M** with sarcastic British / cynical deadpan voice models (`en_GB-alan-low`, pitch shifted 0.9x with subtle demonic flange).

---

## 5. Offline Texture Generator Tool

We provide `tools/generate_textures.py` to procedurally synthesize the full texture palette locally:
- `concrete_albedo.png` & `concrete_normal.png`
- `floor_grid_albedo.png` & `floor_grid_normal.png`
- `kinetic_barrier_albedo.png` & `kinetic_barrier_normal.png`
- `bugged_skin_albedo.png` & `bugged_skin_normal.png`
- `weapon_camo_albedo.png`
