#!/usr/bin/env python3
"""
Chronofrag Procedural & AI Texture Generator
Pure Python Standard Library (No external dependencies required).
Generates game-ready PBR textures, normal maps, and HUD assets.
"""

import os
import zlib
import struct
import math
import random

def write_png(filename, width, height, pixels):
    """
    Writes RGBA pixel buffer to a valid PNG file using pure Python stdlib.
    pixels: list of bytearrays or bytes of length (width * height * 4)
    """
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

def generate_normal_from_height(height_map, width, height, strength=2.0):
    """Computes tangent-space normal map (RGB) from a scalar height array."""
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

            # Normalize
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

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "../web_app/assets/textures")
    os.makedirs(target_dir, exist_ok=True)
    print(f"Generating textures in {target_dir}...")

    size = 256

    # 1. Concrete Wall (Albedo & Normal)
    wall_albedo = bytearray(size * size * 4)
    wall_height = [0.5] * (size * size)
    for y in range(size):
        for x in range(size):
            # Panel lines
            is_seam = (x % 64 < 2) or (y % 64 < 2)
            noise = (math.sin(x * 0.15) * math.cos(y * 0.15) + (random.random() - 0.5) * 0.1)
            h = 0.2 if is_seam else (0.5 + noise * 0.2)
            wall_height[y * size + x] = h

            base_col = 45 if is_seam else int(85 + noise * 30)
            base_col = max(20, min(220, base_col))
            idx = (y * size + x) * 4
            wall_albedo[idx] = base_col
            wall_albedo[idx + 1] = int(base_col * 0.95)
            wall_albedo[idx + 2] = int(base_col * 1.05)
            wall_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "wall_albedo.png"), size, size, wall_albedo)
    wall_norm = generate_normal_from_height(wall_height, size, size, strength=3.0)
    write_png(os.path.join(target_dir, "wall_normal.png"), size, size, wall_norm)
    print("✓ Wall textures created")

    # 2. Industrial Floor Grid (Albedo & Normal)
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
                floor_albedo[idx] = 230
                floor_albedo[idx + 1] = 180
                floor_albedo[idx + 2] = 20
            elif grid_border:
                floor_albedo[idx] = 25
                floor_albedo[idx + 1] = 25
                floor_albedo[idx + 2] = 28
            else:
                c = 60 + int((math.sin(x * 0.2) + math.cos(y * 0.2)) * 10)
                floor_albedo[idx] = c
                floor_albedo[idx + 1] = c
                floor_albedo[idx + 2] = c + 5
            floor_albedo[idx + 3] = 255

    write_png(os.path.join(target_dir, "floor_albedo.png"), size, size, floor_albedo)
    floor_norm = generate_normal_from_height(floor_height, size, size, strength=4.0)
    write_png(os.path.join(target_dir, "floor_normal.png"), size, size, floor_norm)
    print("✓ Floor textures created")

    # 3. Kinetic Trap Viscosity Texture
    kinetic_albedo = bytearray(size * size * 4)
    kinetic_height = [0.5] * (size * size)
    for y in range(size):
        for x in range(size):
            dist = math.sqrt((x - size/2)**2 + (y - size/2)**2)
            ripple = math.sin(dist * 0.2) * 0.5 + 0.5
            kinetic_height[y * size + x] = ripple

            idx = (y * size + x) * 4
            kinetic_albedo[idx] = int(20 + ripple * 40)
            kinetic_albedo[idx + 1] = int(120 + ripple * 135) # Cyan glow
            kinetic_albedo[idx + 2] = int(200 + ripple * 55)
            kinetic_albedo[idx + 3] = int(160 + ripple * 95)

    write_png(os.path.join(target_dir, "kinetic_albedo.png"), size, size, kinetic_albedo)
    kinetic_norm = generate_normal_from_height(kinetic_height, size, size, strength=2.5)
    write_png(os.path.join(target_dir, "kinetic_normal.png"), size, size, kinetic_norm)
    print("✓ Kinetic Trap textures created")

    # 4. "The Bugged" Faceless Skin (Porcelain uncanny tone)
    bugged_skin = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            # Extremely flat, smooth with subtle micro-veins
            noise = (math.sin(x * 0.5) * math.cos(y * 0.5)) * 4
            idx = (y * size + x) * 4
            bugged_skin[idx] = int(225 + noise)     # Eerie pale
            bugged_skin[idx + 1] = int(218 + noise)
            bugged_skin[idx + 2] = int(215 + noise)
            bugged_skin[idx + 3] = 255
    write_png(os.path.join(target_dir, "bugged_skin.png"), size, size, bugged_skin)
    print("✓ 'The Bugged' skin texture created")

    # 5. Weapon Camo (Purple / Cyan Digital Camo matching screenshot)
    weapon_camo = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            block = ((x // 16) * 7 + (y // 16) * 13) % 5
            idx = (y * size + x) * 4
            if block == 0:
                weapon_camo[idx] = 160; weapon_camo[idx+1] = 20; weapon_camo[idx+2] = 220 # Neon Purple
            elif block == 1:
                weapon_camo[idx] = 30; weapon_camo[idx+1] = 200; weapon_camo[idx+2] = 240 # Cyan
            elif block == 2:
                weapon_camo[idx] = 40; weapon_camo[idx+1] = 20; weapon_camo[idx+2] = 60 # Dark Plum
            else:
                weapon_camo[idx] = 15; weapon_camo[idx+1] = 15; weapon_camo[idx+2] = 20 # Matte Gunmetal
            weapon_camo[idx + 3] = 255
    write_png(os.path.join(target_dir, "weapon_camo.png"), size, size, weapon_camo)
    print("✓ Weapon Camo texture created")

    print("All Chronofrag procedural & AI texture sets generated successfully!")

if __name__ == "__main__":
    main()
