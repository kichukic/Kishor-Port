import os
import numpy as np
from PIL import Image

import sys

def generate_animated_gif(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return
        
    # Load image
    img = Image.open(input_path)
    arr = np.array(img)
    
    h, w, c = arr.shape
    rgb = arr[:, :, :3].astype(np.float32)
    # Self-calibrating background color keyer (detects bg from corners)
    corners = [
        rgb[0, 0],
        rgb[0, w-1],
        rgb[h-1, 0],
        rgb[h-1, w-1]
    ]
    bg_color = np.mean(corners, axis=0)
    print(f"Auto-detected background color: {bg_color}")
    
    # Compute Euclidean distance from the background color in RGB space
    dist_from_bg = np.sqrt(np.sum((rgb - bg_color)**2, axis=2))
    
    # Key out background pixels (distance <= 45)
    alpha = ((dist_from_bg > 45) * 255).astype(np.uint8)
    
    # Grid of coordinates
    y_coords, x_coords = np.ogrid[:h, :w]
    
    # Glow wave travels horizontally from left to right along the X-axis
    dist = x_coords
    
    frames = []
    num_frames = 24
    width = 120.0
    
    # Sweep from -2*width to w + 2*width for a smooth off-screen entry and exit
    min_radius = -2.0 * width
    max_radius = float(w) + 2.0 * width
    
    for t in range(num_frames):
        # Linear interpolation from min_radius to max_radius
        radius = min_radius + (t / float(num_frames - 1)) * (max_radius - min_radius)
        
        # Gaussian wave weight
        weight = np.exp(-((dist - radius) / width)**2)
        
        # Blend original color with bright white highlight along the wave front
        new_rgb = rgb + (255.0 - rgb) * weight[:, :, np.newaxis] * 0.85
        
        # Add subtle random blinking server lights (blinks with t)
        np.random.seed(t % 3)
        blink_mask = (np.random.rand(h, w) > 0.995) & (alpha > 0)
        new_rgb[blink_mask] = [255, 255, 255]
        
        new_rgb = np.clip(new_rgb, 0, 255).astype(np.uint8)
        
        # Construct the frame array
        frame_arr = np.zeros((h, w, 4), dtype=np.uint8)
        frame_arr[:, :, :3] = new_rgb
        frame_arr[:, :, 3] = alpha
        
        frame_img = Image.fromarray(frame_arr)
        frames.append(frame_img)
        
    # Save as transparent animated GIF
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=70,  # ~14 fps
        loop=0,
        disposal=2    # Restore to background (essential for clean transparency)
    )
    print(f"Successfully generated animated GIF at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        inp = sys.argv[1]
        out = sys.argv[2]
    else:
        inp = "/home/hijack/Documents/KishorPortfolio/Kishor-Port/src/images/backend_dev_hero.png"
        out = "/home/hijack/Documents/KishorPortfolio/Kishor-Port/src/images/backend_dev_hero.gif"
    generate_animated_gif(inp, out)
