from models.bg_remover import remove_background
from services.color_analyzer import analyze_colors
from services.image_saver import save_image


def process_garment(image, filename):
    mask, cutout = remove_background(image)

    colors = analyze_colors(image, mask)

    save_path = save_image(cutout, filename)

    return {
        "image_path": save_path,
        "colors": colors
    }
