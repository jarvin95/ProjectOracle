from time import sleep
from picamera import PiCamera
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
        my_file = open('/home/pi/my_image.jpg', 'wb')
        
        # Camera warm up
        camera.start_preview()
        sleep(2)

        # Take photo
        camera.capture(my_file)
        my_file.close()
        camera.stop_preview()
        sleep(60)

    except KeyboardInterrupt:
        print("Bye")
        sys.exit()
