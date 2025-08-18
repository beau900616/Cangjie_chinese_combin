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

@app.route("/generate", methods=["POST"])
def generate():
    """
    接收前端 JSON (部首字元、位置、大小、旋轉)，輸出透明 PNG
    """
    data = request.get_json()
    items = data.get("items", [])
    canvas_size = (400, 400)

    # 建立透明背景
    img = Image.new("RGBA", canvas_size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    for item in items:
        char = item["char"]
        x, y = item["x"], item["y"]
        size = item["size"]
        rotation = item["rotation"]

        # 設定字型
        font = ImageFont.truetype(FONT_PATH, size)

        # 先畫字到暫存圖層
        temp_img = Image.new("RGBA", canvas_size, (255, 255, 255, 0))
        temp_draw = ImageDraw.Draw(temp_img)
        temp_draw.text((x, y), char, font=font, fill=(0, 0, 0, 255))

        # 旋轉處理
        rotated = temp_img.rotate(rotation, expand=1)

        # 合併到主圖層
        img = Image.alpha_composite(img, rotated)

    # 輸出成 PNG
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return send_file(buffer, mimetype="image/png", as_attachment=True, download_name="result.png")


if __name__ == "__main__":
    app.run(debug=True)
