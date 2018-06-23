import base64
from io import BytesIO
from time import sleep
from picamera import PiCamera
from PIL import Image
import requests
import sys

CAMERA_ID = 1
SERVER_URL = 'localhost:5000'
#SERVER_URL = 'http://devostrum.no-ip.info:5000/'

# Create camera object
camera = PiCamera()

# Repeatedly take photo and send
while True:
    try:
        # Camera warm up
        camera.start_preview()
        sleep(2)

        # Take photo
        stream = BytesIO()
        camera.capture(stream, format='jpeg')

        # "Rewind" the stream to the beginning so we can read its content
        stream.seek(0)
        
        # Send binary to server
        img_str = base64.b64encode(stream.getvalue())
        payload = {'imageBase64': img_str, 'width': 1024, 'height': 728, 'cameraId': CAMERA_ID}
        result = requests.post(SERVER_URL, payload)
        print(result)

        # Stop and rest
        stream.close()
        camera.stop_preview()
        sleep(60)

    except KeyboardInterrupt:
        print("Bye")
        sys.exit()
