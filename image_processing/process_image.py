import sys
import time
import requests
import json
import os
import re
from PIL import Image
from subprocess import call, STDOUT
from base64 import decodestring, b64encode
from io import BytesIO

# python3 process_image.py <fileName> <cameraId>

filename = str(time.time())

image = Image.open(sys.argv[1])
#image = Image.open("darknet/data/random.jpg")

FNULL = open(os.devnull, 'w')

os.chdir("darknet")
call(["./darknet", "detect", "cfg/yolov3.cfg", "yolov3.weights", "../" + sys.argv[1]], stdout=FNULL, stderr=STDOUT)
os.chdir("..")

boundingFile = open("darknet/bounding.txt", "r")
boundingBox = []
boundingBoxes = []
crops = []
labels = []
lineCount = 0

for l in boundingFile.readlines():
	l = l.rstrip("\n")
	if lineCount % 2 == 0:
		boundingBox = l.split(", ")
	else:
		arr = boundingBox
		arr.append(int((int(arr[0]) + int(arr[2])) / 2))
		arr.append(int((int(arr[1]) + int(arr[3])) / 2))
		boundingBoxes.append(arr)
		c = image.crop((int(arr[0]), int(arr[1]), int(arr[2]), int(arr[3])))
		crops.append(c)
		#c.save(l + ".jpg")
		labels.append(l)

	lineCount += 1

req = dict()
req["requests"] = []

for c in crops:
	request = dict()
	
	image = dict()
	buffer = BytesIO()
	c.save(buffer,format="JPEG") 
	myimage = buffer.getvalue()
	image["content"] = b64encode(myimage).decode()
	#c.save(str(time.time()) + ".jpg")
	request["image"] = image
	
	features = []
	features.append({"type": "TEXT_DETECTION", "maxResults": 50})
	
	request["features"] = features
	
	req["requests"].append(request)

GCP_URL = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDvjf4Eoio4On8HaboSFsFK1ZQj8xhj6Bg"
r = requests.post(GCP_URL, data=json.dumps(req))
response = r.json()

textSets = []

if "responses" not in response.keys():
	print("{}")
	exit()

for r in response["responses"]:
	textSet = set()
	textSets.append(textSet)
	if "textAnnotations" not in r.keys():
		continue
	for a in r["textAnnotations"]:
		a["description"] = a["description"].replace('\n', ' ')
		arr = a["description"].split(" ")
		for t in arr:
			re.sub(r'\W+', '', t)
			textSet.add(t.lower())


objects = dict()

for i in range(len(labels)):
	minj = -1
	mind = 100000000000000000
	
	for j in range(len(labels)):
		if i == j:
			continue
		
		d = ((boundingBoxes[i][4] - boundingBoxes[j][4]) ** 2) + ((boundingBoxes[i][5] - boundingBoxes[j][5]) ** 2)
		
		if d < mind:
			mind = d
			minj = j
	
	l = labels[i]
	if l not in objects.keys():
		objects[l] = []
	if minj != -1:
		boundingBoxes[i].append(labels[minj])
	else:
		boundingBoxes[i].append('')
	
	objects[l].append(boundingBoxes[i])

print(json.dumps(objects))


