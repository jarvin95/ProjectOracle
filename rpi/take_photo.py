import uuid
from picamera import PiCamera
from time import sleep

camera = PiCamera()
filename = str(uuid.uuid4()) + '.jpg'
my_file = open(filename, 'wb')

camera.start_preview()
sleep(2)
camera.capture(my_file)

camera.stop_preview()
my_file.close()