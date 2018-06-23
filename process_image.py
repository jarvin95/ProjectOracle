import sys
from subprocess import call, STDOUT
import os
from PIL import Image
from base64 import decodestring
import time

# python3 process_image.py <base64String> <width> <height> <cameraId>

filename = str(time.time())

#image = Image.fromstring('RGB', (int(sys.argv[2]), int(sys.argv[3])), decodestring(sys.argv[1]))
#image.save(filename + ".jpg")
image = Image.open("darknet/data/dog.jpg")

FNULL = open(os.devnull, 'w')

print("Processing image " + filename + ".jpg")

os.chdir("darknet")
call(["./darknet", "detect", "cfg/yolov3.cfg", "yolov3.weights", "data/dog.jpg"], stdout=FNULL, stderr = STDOUT)
os.chdir("..")

boundingFile = open("darknet/bounding.txt", "r")
boundingBoxes = []
crops = []
labels = []
lineCount = 0

for l in boundingFile.readlines():
	l = l.rstrip("\n")
	if lineCount % 2 == 0:
		arr = l.split(", ")
		boundingBoxes.append(arr)
	else:
		arr = boundingBoxes[int(lineCount / 2)]
		arr.append(l)
		image.crop((int(arr[0]), int(arr[1]), int(arr[2]), int(arr[3]))).save("crops/" + filename + "-" + arr[4] + ".jpg")
		crops.append(filename + "-" + arr[4] + ".jpg")
		labels.append(l)

	lineCount += 1


