const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const sidebar = document.getElementById("sidebar");
const input = document.getElementById("newCharInput");
const addBtn = document.getElementById("addBtn");
const biggerBtn = document.getElementById("bigger");
const smallerBtn = document.getElementById("smaller");
const undoBtn = document.getElementById("undo");
const cutBtn = document.getElementById("cut");
const pasteBtn = document.getElementById("paste");

class FunctionPlacedChars {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.active = false;
    this.frontsize = 150;
    this.selectedChar = null;
  }

  init() {
    this._notify_changefrontsize();
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

//-----frontsize功能區-----------
placedChars_Mode.init();

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
    cutingImage_Mode.activate();
    placedChars_Mode.deactivate();
    pasteCutImage_Mode.deactivate();
    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
  }
});

//-----右側功能選單切換為貼上模式-----------
pasteBtn.addEventListener("click", () => {
  if (pasteCutImage_Mode.check_active()) {
    pasteCutImage_Mode.deactivate();
  } else {
    pasteCutImage_Mode.activate();
    cutingImage_Mode.deactivate();
    placedChars_Mode.deactivate();
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
  if (pasteCutImage_Mode.check_active()) {
    return;
    /* // === 貼上模式：跟隨 cutImage ===
    if ((!selectedChar) && isPasting && cutImage) {
      ctx.globalAlpha = 0.8;
      ctx.drawImage(cutImage, x - cutImage.width/2, y - cutImage.height/2);
      ctx.globalAlpha = 1.0;
      return;
  } */
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

  }
  if (pasteCutImage_Mode.check_active()) {
    return;
  }

  /* if ((!selectedChar) && isPasting) {
    
    redrawCanvas(); // 每次更新座標都重新繪製
    return;
  } */


 /*  if ((!selectedChar) && isCutting) {
    if (startX !== null && startY !== null && endX === null && endY === null) {
      // 第二次點擊 → 設定結束點
      endX = x;
      endY = y;

      // 取出矩形區塊，生成 cutImage
      const w = endX - startX;
      const h = endY - startY;

      if (w > 0 && h > 0) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(canvas, startX, startY, w, h, 0, 0, w, h);
        cutImage = new Image();
        cutImage.src = tempCanvas.toDataURL();
         // === 顯示到右邊功能欄 ===
        const cutResultDiv = document.getElementById("cutResult");
        cutResultDiv.innerHTML = ""; // 清空舊的
        cutResultDiv.appendChild(cutImage);

        console.log("已擷取矩形區域並顯示在功能欄");
      }

    } else {
      // 第一次點擊 或者 已經有完整的四個座標 → 重新設定
      startX = x;
      startY = y;
      endX = null;
      endY = null;
    }
    redrawCanvas(); // 每次更新座標都重新繪製
    return;
  } */

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
    if (item.char == '橡皮擦'){
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