#!/usr/bin/env python3
"""
Chronofrag Advanced Procedural & AI Texture Generator
Pure Python Standard Library (No external dependencies required).
Generates high-fidelity PBR textures, tangent-space normal maps, and architectural assets
strictly matching reference photos (ancient stone, wooden fortress gates, cobblestones,
polished wood flooring, conduit facility walls, tactical gloves, and cosmic neon weapon camo).
"""

import os
import zlib
import struct
import math
import random

def write_png(filename, width, height, pixels):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        start = y * width * 4
        raw_data.extend(pixels[start:start + width * 4])
    
    def png_chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = png_chunk(b"IHDR", ihdr_data)
    idat = png_chunk(b"IDAT", zlib.compress(bytes(raw_data), 9))
    iend = png_chunk(b"IEND", b"")

    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    with open(filename, "wb") as f:
        f.write(header + ihdr + idat + iend)

def generate_normal_from_height(height_map, width, height, strength=2.5):
    normals = bytearray(width * height * 4)
    for y in range(height):
        for x in range(width):
            x_prev = (x - 1) % width
            x_next = (x + 1) % width
            y_prev = (y - 1) % height
            y_next = (y + 1) % height

            dx = (height_map[y * width + x_next] - height_map[y * width + x_prev]) * strength
            dy = (height_map[y_next * width + x] - height_map[y_prev * width + x]) * strength
            dz = 1.0

            length = math.sqrt(dx * dx + dy * dy + dz * dz)
            nx = -dx / length
            ny = -dy / length
            nz = dz / length

            idx = (y * width + x) * 4
            normals[idx] = int((nx * 0.5 + 0.5) * 255)
            normals[idx + 1] = int((ny * 0.5 + 0.5) * 255)
            normals[idx + 2] = int((nz * 0.5 + 0.5) * 255)
            normals[idx + 3] = 255
    return normals

def clamp(val, low=0, high=255):
    return max(low, min(high, int(val)))

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "../web_app/assets/textures")
    os.makedirs(target_dir, exist_ok=True)
    print(f"Generating textures in {target_dir}...")

    size = 256
    random.seed(42)

    # 1. Ancient Stone Masonry (Albedo & Normal) - Images 2 & 3
    stone_albedo = bytearray(size * size * 4)
    stone_height = [0.5] * (size * size)
    brick_h = 32
    brick_w = 64
    for y in range(size):
        row = y // brick_h
        y_in_brick = y % brick_h
        x_offset = (brick_w // 2) if (row % 2 == 1) else 0
        for x in range(size):
            x_shifted = (x + x_offset) % size
            x_in_brick = x_shifted % brick_w

            is_mortar = (y_in_brick < 3) or (x_in_brick < 3)
            grain = (math.sin(x * 0.35) * math.cos(y * 0.35) * 0.15) + (random.random() - 0.5) * 0.12
            
            if is_mortar:
                h = 0.15 + grain * 0.1
                r = 135 + int(grain * 40)
                g = 125 + int(grain * 40)
                b = 110 + int(grain * 30)
            else:
                edge_dist = min(x_in_brick - 2, brick_w - x_in_brick, y_in_brick - 2, brick_h - y_in_brick)
                bevel = min(1.0, max(0.0, edge_dist / 6.0))
                h = (0.5 + bevel * 0.45) + grain * 0.15
                
                base_r = 195 + (row * 7) % 25
                base_g = 170 + (row * 5) % 20
                base_b = 135 + (row * 3) % 15
                r = clamp(base_r + grain * 60)
                g = clamp(base_g + grain * 50)
                b = clamp(base_b + grain * 40)

            stone_height[y * size + x] = h
            idx = (y * size + x) * 4
            stone_albedo[idx] = r
            stone_albedo[idx + 1] = g
            stone_albedo[idx + 2] = b
            stone_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "ancient_stone_albedo.png"), size, size, stone_albedo)
    write_png(os.path.join(target_dir, "ancient_stone_normal.png"), size, size, generate_normal_from_height(stone_height, size, size, 3.5))
    print("✓ Ancient stone textures created (Images 2 & 3)")

    # 2. Cobblestone Pavement (Albedo & Normal) - Image 2
    cobble_albedo = bytearray(size * size * 4)
    cobble_height = [0.5] * (size * size)
    cs = 32
    for y in range(size):
        cy = y // cs
        for x in range(size):
            cx = (x + (cs // 2 if cy % 2 == 1 else 0)) // cs
            px = (x + (cs // 2 if cy % 2 == 1 else 0)) % cs
            py = y % cs
            
            dx = (px - cs/2) / (cs/2)
            dy = (py - cs/2) / (cs/2)
            dist2 = dx*dx + dy*dy

            noise = (math.sin(x * 0.4) + math.cos(y * 0.4)) * 0.08 + (random.random() - 0.5) * 0.1
            if dist2 > 0.85:
                h = 0.1
                r, g, b = 75, 70, 65
            else:
                dome = math.sqrt(max(0.0, 1.0 - dist2))
                h = 0.3 + dome * 0.65 + noise
                shade = (cx * 17 + cy * 23) % 35
                r = clamp(130 + shade + noise * 40)
                g = clamp(120 + shade + noise * 40)
                b = clamp(110 + shade + noise * 40)

            cobble_height[y * size + x] = h
            idx = (y * size + x) * 4
            cobble_albedo[idx] = r
            cobble_albedo[idx + 1] = g
            cobble_albedo[idx + 2] = b
            cobble_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "cobblestone_albedo.png"), size, size, cobble_albedo)
    write_png(os.path.join(target_dir, "cobblestone_normal.png"), size, size, generate_normal_from_height(cobble_height, size, size, 4.0))
    print("✓ Cobblestone textures created (Image 2)")

    # 3. Wooden Fortress Gate with Iron Straps (Albedo & Normal) - Image 3
    gate_albedo = bytearray(size * size * 4)
    gate_height = [0.5] * (size * size)
    plank_w = 42
    for y in range(size):
        is_iron_strap = (y >= 45 and y <= 65) or (y >= 185 and y <= 205)
        for x in range(size):
            plank_idx = x // plank_w
            x_in_plank = x % plank_w
            is_seam = (x_in_plank < 3)

            grain = math.sin(x * 0.1 + y * 0.8) * 0.15 + (random.random() - 0.5) * 0.08

            if is_iron_strap:
                is_rivet = (abs(x_in_plank - 21) <= 5) and (abs((y - 55) if y < 100 else (y - 195)) <= 5)
                if is_rivet:
                    h = 1.0
                    r, g, b = 60, 60, 65
                else:
                    h = 0.85
                    r, g, b = 40, 42, 45
            elif is_seam:
                h = 0.1
                r, g, b = 25, 18, 12
            else:
                wood_grain = math.sin(y * 0.4 + grain * 4.0) * 0.15
                h = 0.55 + wood_grain * 0.2
                base = 90 + int(grain * 35) + int(wood_grain * 30)
                r = clamp(base)
                g = clamp(int(base * 0.65))
                b = clamp(int(base * 0.38))

            gate_height[y * size + x] = h
            idx = (y * size + x) * 4
            gate_albedo[idx] = r
            gate_albedo[idx + 1] = g
            gate_albedo[idx + 2] = b
            gate_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "wooden_gate_albedo.png"), size, size, gate_albedo)
    write_png(os.path.join(target_dir, "wooden_gate_normal.png"), size, size, generate_normal_from_height(gate_height, size, size, 3.8))
    print("✓ Wooden fortress gate textures created (Image 3)")

    # 4. Polished Hardwood Parquet Floor - Image 4
    wood_floor_albedo = bytearray(size * size * 4)
    wood_floor_height = [0.5] * (size * size)
    p_w = 32
    for y in range(size):
        for x in range(size):
            p_idx = x // p_w
            x_in = x % p_w
            is_joint = (x_in < 2) or (y % 128 < 2)
            
            fine_grain = math.sin(y * 0.6 + math.cos(x * 0.1) * 2.0) * 0.1 + (random.random() - 0.5) * 0.05
            h = 0.2 if is_joint else (0.7 + fine_grain * 0.2)
            wood_floor_height[y * size + x] = h

            if is_joint:
                r, g, b = 65, 40, 20
            else:
                shade = (p_idx * 13) % 25
                r = clamp(195 + shade + fine_grain * 50)
                g = clamp(135 + shade + fine_grain * 35)
                b = clamp(70 + shade + fine_grain * 20)

            idx = (y * size + x) * 4
            wood_floor_albedo[idx] = r
            wood_floor_albedo[idx + 1] = g
            wood_floor_albedo[idx + 2] = b
            wood_floor_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "polished_wood_floor.png"), size, size, wood_floor_albedo)
    write_png(os.path.join(target_dir, "polished_wood_normal.png"), size, size, generate_normal_from_height(wood_floor_height, size, size, 1.8))
    print("✓ Polished hardwood floor textures created (Image 4)")

    # 5. Facility Corridor Concrete & Conduit Wall - Image 4
    conduit_albedo = bytearray(size * size * 4)
    conduit_height = [0.5] * (size * size)
    for y in range(size):
        is_pipe = (y >= 80 and y <= 92) or (y >= 100 and y <= 112)
        for x in range(size):
            is_breaker_box = (x >= 40 and x <= 110 and y >= 130 and y <= 210)
            is_warning_sign = (x >= 150 and x <= 220 and y >= 140 and y <= 180)

            grain = (random.random() - 0.5) * 0.06
            if is_breaker_box:
                h = 0.85
                r, g, b = 150, 155, 160
                if x == 40 or x == 110 or y == 130 or y == 210:
                    r, g, b = 70, 75, 80
            elif is_pipe:
                py = (y - 86 if y < 96 else y - 106)
                pipe_dome = math.sqrt(max(0.0, 36 - py * py)) / 6.0
                h = 0.6 + pipe_dome * 0.35
                c = clamp(170 + int(pipe_dome * 60))
                r, g, b = c, c, c + 5
            elif is_warning_sign:
                h = 0.65
                r, g, b = 230, 90, 30
            else:
                h = 0.45 + grain * 0.2
                c = clamp(180 + grain * 50)
                r, g, b = c, int(c * 0.98), int(c * 0.95)

            conduit_height[y * size + x] = h
            idx = (y * size + x) * 4
            conduit_albedo[idx] = r
            conduit_albedo[idx + 1] = g
            conduit_albedo[idx + 2] = b
            conduit_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "conduit_wall_albedo.png"), size, size, conduit_albedo)
    write_png(os.path.join(target_dir, "conduit_wall_normal.png"), size, size, generate_normal_from_height(conduit_height, size, size, 3.0))
    print("✓ Facility conduit wall textures created (Image 4)")

    # 6. Tactical Combat Gloves Texture - Images 2, 3, 4
    glove_albedo = bytearray(size * size * 4)
    glove_height = [0.5] * (size * size)
    for y in range(size):
        for x in range(size):
            is_knuckle_pad = (y >= 60 and y <= 120 and (x % 50 < 40))
            is_stitch = (x % 50 == 0) or (y % 60 == 0)

            leather_grain = (random.random() - 0.5) * 0.08
            if is_knuckle_pad:
                h = 0.85
                base = 32 + int(leather_grain * 30)
                r, g, b = base, base, base + 2
            elif is_stitch:
                h = 0.2
                r, g, b = 15, 15, 18
            else:
                h = 0.5 + leather_grain * 0.2
                base = 45 + int(leather_grain * 30)
                r, g, b = base, base + 2, base + 5

            glove_height[y * size + x] = h
            idx = (y * size + x) * 4
            glove_albedo[idx] = r
            glove_albedo[idx + 1] = g
            glove_albedo[idx + 2] = b
            glove_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "tactical_glove_albedo.png"), size, size, glove_albedo)
    write_png(os.path.join(target_dir, "tactical_glove_normal.png"), size, size, generate_normal_from_height(glove_height, size, size, 2.5))
    print("✓ Tactical glove textures created (Images 2, 3, 4)")

    # 7. "Atlas Power Drink" Vending Machine Texture - Image 4
    vending = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            is_glass = (y >= 60 and y <= 170 and x >= 30 and x <= 226)
            is_neon_header = (y >= 15 and y <= 50 and x >= 20 and x <= 236)
            is_dispenser = (y >= 190 and y <= 240 and x >= 50 and x <= 206)

            if is_neon_header:
                r, g, b = (20, 180, 255) if x < 128 else (240, 20, 180)
            elif is_glass:
                can_col = (x // 28) % 3
                if can_col == 0:
                    r, g, b = 230, 30, 50
                elif can_col == 1:
                    r, g, b = 30, 180, 240
                else:
                    r, g, b = 180, 40, 240
                if (y % 36 < 4) or (x % 28 < 4):
                    r, g, b = 30, 35, 45
            elif is_dispenser:
                r, g, b = 20, 22, 28
            else:
                r, g, b = 15, 20, 30

            idx = (y * size + x) * 4
            vending[idx] = r
            vending[idx + 1] = g
            vending[idx + 2] = b
            vending[idx + 3] = 255
    write_png(os.path.join(target_dir, "vending_machine.png"), size, size, vending)
    print("✓ Vending machine texture created (Image 4)")

    # 8. Tactical Briefing Board Texture - Image 4
    board = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            is_border = (x < 10 or x > size - 10 or y < 10 or y > size - 10)
            is_satellite = (x >= 30 and x <= 160 and y >= 30 and y <= 170)
            is_doc1 = (x >= 175 and x <= 235 and y >= 35 and y <= 100)
            is_doc2 = (x >= 175 and x <= 235 and y >= 115 and y <= 190)

            if is_border:
                r, g, b = 35, 38, 42
            elif is_satellite:
                wave = math.sin(x * 0.1) * math.cos(y * 0.1)
                r = clamp(70 + wave * 30)
                g = clamp(110 + wave * 40)
                b = clamp(60 + wave * 25)
            elif is_doc1 or is_doc2:
                r, g, b = (235, 235, 230) if (x % 14 > 3 or y % 8 > 2) else (180, 40, 40)
            else:
                r, g, b = 45, 52, 58

            idx = (y * size + x) * 4
            board[idx] = r
            board[idx + 1] = g
            board[idx + 2] = b
            board[idx + 3] = 255
    write_png(os.path.join(target_dir, "tactical_briefing_board.png"), size, size, board)
    print("✓ Tactical briefing board texture created (Image 4)")

    # 9. Cosmic Neon AK-Chrono Metallic Camo - Image 4
    ak_camo = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            u = x / size
            v = y / size
            wave1 = math.sin(u * 12.0 + v * 8.0)
            wave2 = math.cos(u * 8.0 - v * 14.0)
            blend = (wave1 + wave2) * 0.5

            if blend > 0.35:
                r, g, b = 30, 220, 255
            elif blend < -0.2:
                r, g, b = 180, 20, 230
            elif blend < 0.1:
                r, g, b = 50, 15, 80
            else:
                r, g, b = 25, 25, 32

            idx = (y * size + x) * 4
            ak_camo[idx] = r
            ak_camo[idx + 1] = g
            ak_camo[idx + 2] = b
            ak_camo[idx + 3] = 255
    write_png(os.path.join(target_dir, "cosmic_neon_ak.png"), size, size, ak_camo)
    print("✓ Cosmic Neon AK camo texture created (Image 4)")

    # 10. Concrete Wall
    wall_albedo = bytearray(size * size * 4)
    wall_height = [0.5] * (size * size)
    for y in range(size):
        for x in range(size):
            is_seam = (x % 64 < 2) or (y % 64 < 2)
            noise = (math.sin(x * 0.15) * math.cos(y * 0.15) + (random.random() - 0.5) * 0.1)
            h = 0.2 if is_seam else (0.5 + noise * 0.2)
            wall_height[y * size + x] = h

            base_col = 45 if is_seam else int(85 + noise * 30)
            base_col = clamp(base_col, 20, 220)
            idx = (y * size + x) * 4
            wall_albedo[idx] = base_col
            wall_albedo[idx + 1] = int(base_col * 0.95)
            wall_albedo[idx + 2] = int(base_col * 1.05)
            wall_albedo[idx + 3] = 255
    write_png(os.path.join(target_dir, "wall_albedo.png"), size, size, wall_albedo)
    write_png(os.path.join(target_dir, "wall_normal.png"), size, size, generate_normal_from_height(wall_height, size, size, 3.0))

    # 11. Floor Grid
    floor_albedo = bytearray(size * size * 4)
    floor_height = [0.5] * (size * size)
    for y in range(size):
        for x in range(size):
            grid_border = (x % 32 < 2) or (y % 32 < 2)
            hazard_stripe = ((x + y) // 16) % 2 == 0 and (x < 16 or x > size - 16 or y < 16 or y > size - 16)
            h = 0.1 if grid_border else 0.6
            floor_height[y * size + x] = h
            idx = (y * size + x) * 4
            if hazard_stripe:
                floor_albedo[idx] = 230; floor_albedo[idx+1] = 180; floor_albedo[idx+2] = 20
            elif grid_border:
                floor_albedo[idx] = 25; floor_albedo[idx+1] = 25; floor_albedo[idx+2] = 28
            else:
                c = 60 + int((math.sin(x * 0.2) + math.cos(y * 0.2)) * 10)
                floor_albedo[idx] = c; floor_albedo[idx+1] = c; floor_albedo[idx+2] = c + 5
            floor_albedo[idx + 3] = 255
    write_png(os.path.join(target_dir, "floor_albedo.png"), size, size, floor_albedo)
    write_png(os.path.join(target_dir, "floor_normal.png"), size, size, generate_normal_from_height(floor_height, size, size, 4.0))

    # 12. Kinetic Viscosity Fluid
    kinetic_albedo = bytearray(size * size * 4)
    kinetic_height = [0.5] * (size * size)
    for y in range(size):
        for x in range(size):
            dist = math.sqrt((x - size/2)**2 + (y - size/2)**2)
            ripple = math.sin(dist * 0.2) * 0.5 + 0.5
            kinetic_height[y * size + x] = ripple
            idx = (y * size + x) * 4
            kinetic_albedo[idx] = int(20 + ripple * 40)
            kinetic_albedo[idx + 1] = int(120 + ripple * 135)
            kinetic_albedo[idx + 2] = int(200 + ripple * 55)
            kinetic_albedo[idx + 3] = int(160 + ripple * 95)
    write_png(os.path.join(target_dir, "kinetic_albedo.png"), size, size, kinetic_albedo)
    write_png(os.path.join(target_dir, "kinetic_normal.png"), size, size, generate_normal_from_height(kinetic_height, size, size, 2.5))

    # 13. "The Bugged" Skin
    bugged_skin = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            noise = (math.sin(x * 0.5) * math.cos(y * 0.5)) * 4
            idx = (y * size + x) * 4
            bugged_skin[idx] = int(225 + noise)
            bugged_skin[idx + 1] = int(218 + noise)
            bugged_skin[idx + 2] = int(215 + noise)
            bugged_skin[idx + 3] = 255
    write_png(os.path.join(target_dir, "bugged_skin.png"), size, size, bugged_skin)

    # 14. Weapon Camo
    weapon_camo = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            block = ((x // 16) * 7 + (y // 16) * 13) % 5
            idx = (y * size + x) * 4
            if block == 0:
                weapon_camo[idx] = 160; weapon_camo[idx+1] = 20; weapon_camo[idx+2] = 220
            elif block == 1:
                weapon_camo[idx] = 30; weapon_camo[idx+1] = 200; weapon_camo[idx+2] = 240
            elif block == 2:
                weapon_camo[idx] = 40; weapon_camo[idx+1] = 20; weapon_camo[idx+2] = 60
            else:
                weapon_camo[idx] = 15; weapon_camo[idx+1] = 15; weapon_camo[idx+2] = 20
            weapon_camo[idx + 3] = 255
    write_png(os.path.join(target_dir, "weapon_camo.png"), size, size, weapon_camo)

    print("\nAll Chronofrag advanced procedural PBR textures synthesized successfully!")

if __name__ == "__main__":
    main()
