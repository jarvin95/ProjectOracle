from PIL import Image, ImageFont, ImageDraw, ImageEnhance
import sys

# python3 draw_bounding_boxes.py <filename> <x1> <y1> <x2> <y2>

if len(sys.argv) < 6:
	print("Insufficient arguments!\nUsage: python3 draw_bounding_boxes.py <filename> <x1> <y1> <x2> <y2>")
	exit()

source_img = Image.open(sys.argv[1])

x1 = int(sys.argv[2])
y1 = int(sys.argv[3])
x2 = int(sys.argv[4])
y2 = int(sys.argv[5])

draw = ImageDraw.Draw(source_img)
draw.rectangle(((x1 - 10, y1 - 10), (x2 + 10, y1)), fill="yellow")
draw.rectangle(((x1 - 10, y1 - 10), (x1, y2 + 10)), fill="yellow")
draw.rectangle(((x1 - 10, y2), (x2 + 10, y2 + 10)), fill="yellow")
draw.rectangle(((x2, y1 - 10), (x2 + 10, y2 + 10)), fill="yellow")

source_img.save(sys.argv[1] + "-bounded", "JPEG")
