import cv2
from models.router import route
from services.garment_pipeline import process_garment
from services.person_pipline import process_person


def main(image_path, mode="auto"):
    image = cv2.imread(image_path)

    task = route(image, mode)

    if task == "garment":
        result = process_garment(image, "output.png")
    else:
        result = process_person(image)

    print(result)


if __name__ == "__main__":
    main("test_images/test.jpg", mode="garment")