from PIL import Image
import sys

def remove_background(input_path, output_path):
    # Open the image and convert to RGBA
    img = Image.open(input_path).convert("RGBA")
    
    # Get pixel data
    datas = img.getdata()
    new_data = []
    
    # Tolerance for white (e.g., 230 to 255)
    for item in datas:
        # Check if the pixel is close to white
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            # Change to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    # Update image data
    img.putdata(new_data)
    
    # Optional: crop the image to its bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Save as PNG
    img.save(output_path, "PNG")
    print("Background removed and saved to", output_path)

if __name__ == "__main__":
    remove_background('C:/Users/diskonekted/.gemini/antigravity/brain/a774d4fd-73fa-4bad-901d-0fb23bb0b8ae/pawon_logo_1780629476192.png', 'public/logo-transparent.png')
