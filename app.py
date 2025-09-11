from flask import Flask, render_template, request, send_file
from PIL import Image, ImageDraw, ImageFont
import io
import json

app = Flask(__name__)

# 字型檔案，請使用支援中文字的字型 (例如 NotoSansCJK)
FONT_PATH = "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc"

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
