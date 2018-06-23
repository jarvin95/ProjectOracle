from io import BytesIO
from time import sleep
from picamera import PiCamera
from PIL import Image
import requests
import sys
import json
import base64

CAMERA_ID = '2'
SERVER_URL = 'https://www.kodyac.tech:8080/api/v1/image/new'
IMAGE_PATH = '/home/pi/my_image.jpg'

# Create camera object
camera = PiCamera()

# Repeatedly take photo and send
while True:
    try:
        # Camera warm up
        camera.start_preview()
        sleep(2)

        # Take photo
        my_file = open(IMAGE_PATH, 'r+b')
        camera.capture(my_file)
        
        # Send file to server        
        files = {'file': open(IMAGE_PATH, 'r+b')}
        payload = {'cameraID': CAMERA_ID}
        result = requests.post(SERVER_URL, files=files, data=payload)

        print(result)
        print(result.text)

        # Stop and rest
        my_file.close()
        camera.stop_preview()
        sleep(60)

    except KeyboardInterrupt:
        print("Bye")
        sys.exit()
