const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const sidebar = document.getElementById("sidebar");
const input = document.getElementById("newCharInput");
const addBtn = document.getElementById("addBtn");
const biggerBtn = document.getElementById("bigger");
const smallerBtn = document.getElementById("smaller");
const undoBtn = document.getElementById("undo");
const cutBtn = document.getElementById("cut");
const lassoBtn = document.getElementById("lasso");
const pasteBtn = document.getElementById("paste");

class FunctionPlacedChars {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.active = false;
    this.frontsize = 150;
    this.selectedChar = null;
  }

  activate(selectchar_input) {
    this.active = true;
    this.canvas.style.cursor = "default";   // 回復預設模式
    this.selectedChar = selectchar_input;
    console.log("文字模式啟動");
    console.log("選擇這個字 : " + this.selectedChar);
  }

  deactivate() {
    this.active = false;
    this.selectedChar = null;
  }

  check_active() {
    return this.active
  }

  get_selectedchar() {
    return this.selectedChar;
  }

  get_frontsize() {
    return this.frontsize;
  }

  bigger_frontsize() {
    if (this.frontsize <= 200) {
      this.frontsize = this.frontsize + 2
      this._notify_changefrontsize();
    }
  }

  smaller_frontsize() {
    if (this.frontsize >= 10) {
      this.frontsize = this.frontsize - 2
      this._notify_changefrontsize();
    }
  }

  _notify_changefrontsize() {
    const event = new CustomEvent("fontsizeChange", {
      detail: { frontsize: this.frontsize }
    });
    this.canvas.dispatchEvent(event); // 事件綁在 canvas
  }

}

class FunctionCutImage {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.active = false;
    this.startX = null;
    this.startY = null;
    this.endX = null;
    this.endY = null;
  }

  activate() {
    this.active = true;
    this.canvas.style.cursor = "crosshair"; // 進入剪下模式
    console.log("剪裁模式啟動");
  }

  deactivate() {
    this.active = false;
    this.startX = null;
    this.startY = null;
    this.endX = null;
    this.endY = null;
    this.canvas.style.cursor = "default";   // 回復預設模式
  }

  get_startendxy() {
    return {startX: this.startX, startY: this.startY, endX: this.endX, endY: this.endY};
  }

  set_XY(input_X, input_Y) {
    // 如果沒有設定起點，先設定起點
    if (this.startX === null && this.startY === null) {
      this.startX = input_X;
      this.startY = input_Y;
      this.endX = null;
      this.endY = null;
      console.log("Cut Mode XY:", this.startX, this.startY, this.endX, this.endY);
      return;
    }

    // 如果已經有起點，但還沒設定終點，就設定終點
    if (this.startX !== null && this.startY !== null && this.endX === null && this.endY === null) {
      this.endX = input_X;
      this.endY = input_Y;
      console.log("Cut Mode XY:", this.startX, this.startY, this.endX, this.endY);
      return;
    }

    // 如果起點和終點都已經設定過，再重新開始新的剪裁
    if (this.startX !== null && this.startY !== null && this.endX !== null && this.endY !== null) {
      this.startX = input_X;
      this.startY = input_Y;
      this.endX = null;
      this.endY = null;
      console.log("Cut Mode XY:", this.startX, this.startY, this.endX, this.endY);
      return;
    }
  }

  check_active() {
    return this.active
  }
}

class FunctionLasso {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.active = false;
    this.points = []; // 存路徑點
    this.isDrawing = false;
  }

  activate() {
    this.active = true;
    this.points = [];
    this.isDrawing = false;
    this.canvas.style.cursor = "crosshair";
    console.log("智慧套索模式啟動");
  }

  deactivate() {
    this.active = false;
    this.points = [];
    this.isDrawing = false;
    this.canvas.style.cursor = "default";
  }

  check_active() {
    return this.active;
  }

  set_isDrawing() {
    this.isDrawing = true;
  }

  check_isDrawing() {
    return this.isDrawing;
  }

  addPoints(x, y) {
    this.points.push({ x, y });
  }

  getPoints() {
    return this.points;
  }

  clearPoints() {
    this.points = [];
  }

  checkPointsCircle(threshold = 10) {
    if (this.points.length < 3) return false; // 至少三點才可能形成區域
    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < threshold;
  }
}


class FunctionPasteCutImage {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.active = false;
  }

  activate() {
    this.active = true;
    console.log("貼上模式啟動");
  }

  deactivate() {
    this.active = false;
  }

  check_active() {
    return this.active
  }
}

//文字、橡皮擦、剪取圖片放置紀錄
let placed_blocks = [];

// 建立三種運行模式
const placedChars_Mode = new FunctionPlacedChars(canvas, ctx);
const cutingImage_Mode = new FunctionCutImage(canvas, ctx);
const lasso_Mode = new FunctionLasso(canvas, ctx);
const pasteCutImage_Mode = new FunctionPasteCutImage(canvas, ctx);

//-----frontsize功能區-----------
//frontsize變化時改變
canvas.addEventListener("fontsizeChange", (e) => {
  document.getElementById("fontsize-display").innerText = `字體大小：${e.detail.frontsize}px`;
});
//frontsize變大
biggerBtn.addEventListener("click", () => {
  placedChars_Mode.bigger_frontsize();
});
//frontsize變小
smallerBtn.addEventListener("click", () => {
  placedChars_Mode.smaller_frontsize();
});

//-----左側文字選單選字功能區-----------
document.querySelectorAll(".char-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      // 如果已經是 active → 取消選取
      btn.classList.remove("active");
      placedChars_Mode.deactivate();
    }
    else {
      // 取消其他按鈕的 active
      document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
      // 設定目前按鈕 active
      btn.classList.add("active");
      // 更新選中的字
      placedChars_Mode.activate(btn.textContent);
      cutingImage_Mode.deactivate();
      pasteCutImage_Mode.deactivate();
      lasso_Mode.deactivate();
    }
    redrawCanvas();
  });
});

//-----左側文字選單新增部首功能區-----------
addBtn.addEventListener("click", () => {
  const value = input.value.trim();
  if (value) {
    const newBtn = document.createElement("div");
    newBtn.classList.add("char-btn");
    newBtn.innerText = value;
    
    // 加入點擊事件
    newBtn.addEventListener("click", () => {
      document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
      newBtn.classList.add("active");
      selectedChar = newBtn.textContent;
    });

    sidebar.insertBefore(newBtn, document.getElementById("add-section")); // 插在新增區塊前
    input.value = "";
  }
});

//-----右側功能選單切換為剪裁模式-----------
cutBtn.addEventListener("click", () => {
  if (cutingImage_Mode.check_active()) {
    cutingImage_Mode.deactivate();
  } else {
    placedChars_Mode.deactivate();
    pasteCutImage_Mode.deactivate();
    lasso_Mode.deactivate();
    cutingImage_Mode.activate();
    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
  }
  redrawCanvas();  // 重新繪製
});

//-----右側功能選單切換為貼上模式-----------
pasteBtn.addEventListener("click", () => {
  if (pasteCutImage_Mode.check_active()) {
    pasteCutImage_Mode.deactivate();
  } else {
    cutingImage_Mode.deactivate();
    placedChars_Mode.deactivate();
    lasso_Mode.deactivate();
    pasteCutImage_Mode.activate();
    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
  }
  redrawCanvas();  // 重新繪製
});

//-----右側功能選單切換為智慧套索模式-----------
lassoBtn.addEventListener("click", () => {
  if (lasso_Mode.check_active()) {
    lasso_Mode.deactivate();
  } else {
    pasteCutImage_Mode.deactivate();
    cutingImage_Mode.deactivate();
    placedChars_Mode.deactivate();
    lasso_Mode.activate();
    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
  }
  redrawCanvas();  // 重新繪製
});

//-----滑鼠在畫布上的移動功能區-----------
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  

  // === 先清空並重繪已放置內容 ===
  redrawCanvas();
  
  if (placedChars_Mode.check_active()) {
    // 畫跟隨的字（半透明）
    ctx.globalAlpha = 0.8;
    ctx.font = placedChars_Mode.get_frontsize() + "px Microsoft JhengHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    if (placedChars_Mode.get_selectedchar() == '橡皮擦'){
      // 畫白色矩形遮住
      ctx.fillStyle = "white";
      // 這裡設一個矩形大小，例如 40x40，可依需求調整
      ctx.fillRect(x - 20, y - 20, placedChars_Mode.get_frontsize(), placedChars_Mode.get_frontsize());
    }
    else {
      
      ctx.fillStyle = "black"; // 正常文字黑色
      ctx.fillText(placedChars_Mode.get_selectedchar(), x, y);
    };
    ctx.globalAlpha = 1.0;
  }

  if (cutingImage_Mode.check_active()) {
    const { startX, startY, endX, endY } = cutingImage_Mode.get_startendxy();
    if (startX !== null && startY !== null && endX === null && endY === null) {
      // 畫出臨時矩形框
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    }
  }

  if (lasso_Mode.check_active() && lasso_Mode.check_isDrawing()) {
    const pts = lasso_Mode.getPoints();
    if (pts.length > 0) {
      ctx.strokeStyle = "blue";
      ctx.setLineDash([5, 5]); // 虛線
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.lineTo(x, y); // 動態跟隨游標
      ctx.stroke();
      ctx.setLineDash([]); // 還原
      // 畫每個點的小圓
      ctx.fillStyle = "blue";
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); // 半徑3px的小圓
        ctx.fill();
      });
    }
  }

  if (pasteCutImage_Mode.check_active()) {
    // 畫跟隨的圖片（半透明）
    ctx.globalAlpha = 0.7;
    const imgW = cutImage.width;
    const imgH = cutImage.height;
    ctx.drawImage(cutImage, x - imgW / 2, y - imgH / 2); 
    ctx.globalAlpha = 1.0;
  }
});

// 點擊畫布 放置字 or 檢取初始點
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (placedChars_Mode.check_active()) {
    placed_blocks.push({ char: placedChars_Mode.get_selectedchar(), char_frontsize: placedChars_Mode.get_frontsize(), x, y });
    redrawCanvas();
  }
  if (cutingImage_Mode.check_active()) {
    cutingImage_Mode.set_XY(x, y)
    const { startX, startY, endX, endY } = cutingImage_Mode.get_startendxy();
    if (startX !== null && startY !== null && endX !== null && endY !== null) {
      // 取出矩形區塊，生成 cutImage
      redrawCanvas(); // 重繪，避免藍框殘留
      const w = endX - startX;
      const h = endY - startY;

      if (w > 0 && h > 0) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext("2d");

        // 先把選取區域畫到 tempCanvas
        tempCtx.drawImage(canvas, startX, startY, w, h, 0, 0, w, h);

        // 讀取像素資料
        const imageData = tempCtx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // 將接近白色的像素設為透明
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // 判斷是否接近白色（這裡設閾值 240，可依需求調整）
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // 透明
          }
        }

        // 更新回去
        tempCtx.putImageData(imageData, 0, 0);

        // 轉成圖片
        cutImage = new Image();
        cutImage.src = tempCanvas.toDataURL("image/png");

        // === 顯示到右邊功能欄 ===
        const cutResultDiv = document.getElementById("cutResult");
        cutResultDiv.innerHTML = ""; // 清空舊的
        cutResultDiv.appendChild(cutImage);

        console.log("已擷取矩形區域並去掉白色背景，顯示在功能欄");
      }
    }
  }
  if (lasso_Mode.check_active()) {
    if (lasso_Mode.check_isDrawing()) {
      lasso_Mode.addPoints(x, y);
      if (lasso_Mode.checkPointsCircle()) {
        console.log('智慧套索完成')
        // === 先清空並重繪已放置內容 ===
        redrawCanvas();
        const pts = lasso_Mode.getPoints();
        // 計算 bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        pts.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
        const w = Math.ceil(maxX - minX);
        const h = Math.ceil(maxY - minY);

        // === 建立暫存畫布 (大小就是套索範圍) ===
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext("2d");

        // === 設置裁切區域 (把路徑平移到局部座標) ===
        tempCtx.beginPath();
        tempCtx.moveTo(pts[0].x - minX, pts[0].y - minY);
        for (let i = 1; i < pts.length; i++) {
          tempCtx.lineTo(pts[i].x - minX, pts[i].y - minY);
        }
        tempCtx.closePath();
        tempCtx.clip();

        // === 繪製原始畫布內容到暫存 (只取 bounding box 區域) ===
        tempCtx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);

        // === 擷取像素，去掉接近白色的部分 ===
        const imageData = tempCtx.getImageData(0, 0, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i] = data[i + 1] = data[i + 2] = 0; // 避免殘色
            data[i + 3] = 0; // 設透明
          }
        }
        tempCtx.putImageData(imageData, 0, 0);

        // === 轉成圖片物件 ===
        cutImage = new Image();
        cutImage.onload = () => {
          const cutResultDiv = document.getElementById("cutResult");
          cutResultDiv.innerHTML = "";
          cutResultDiv.appendChild(cutImage);
        };
        cutImage.src = tempCanvas.toDataURL("image/png");

        // Reset 狀態
        lasso_Mode.deactivate();
      }
    } else {
      lasso_Mode.set_isDrawing();
      lasso_Mode.addPoints(x, y);
    }
  }
  if (pasteCutImage_Mode.check_active() && cutImage) {
    const imgW = cutImage.width;
    const imgH = cutImage.height;
    placed_blocks.push({type: "image", image: cutImage, x: x - imgW / 2, y: y - imgH / 2, w: imgW, h: imgH});
    redrawCanvas();
  }
});

// 點擊 回復上一步
undoBtn.addEventListener("click", () => {
  if (placed_blocks.length > 0 ) {
    placed_blocks.pop();  // 移除最後一個放上的字
    redrawCanvas();  // 重新繪製
  }
});

// 重繪 Canvas（已放置字）
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  placed_blocks.forEach(item => {
    if (item.type === "image") {
      ctx.drawImage(item.image, item.x, item.y, item.w, item.h);
    }
    else if (item.char == '橡皮擦'){
      // 畫白色矩形遮住
      ctx.fillStyle = "white";
      // 這裡設一個矩形大小，例如 40x40，可依需求調整
      ctx.fillRect(item.x - 20, item.y - 20,  item.char_frontsize,  item.char_frontsize);
    }
    else {
      ctx.font =  item.char_frontsize + "px Microsoft JhengHei";
      ctx.fillStyle = "black"; // 正常文字黑色
      ctx.fillText(item.char, item.x, item.y);
    };
    
  });
}