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

let selectedChar = null;   // 當前選中的字
let placedChars = [];      // 已放置的字方塊
let frontsize = 150;      // 當前的文字大小
updateFontsizeDisplay()  //更新字體大小的顯示

// === 剪下 / 貼上相關變數 ===
let isCutting = false;
let selecting = false;
let startX = null, startY = null, endX = null, endY = null;
let cutImage = null;

// 側邊選單點擊
document.querySelectorAll(".char-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      // 如果已經是 active → 取消選取
      btn.classList.remove("active");
      selectedChar = null;
    }
    else {
      // 取消其他按鈕的 active
      document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
      // 設定目前按鈕 active
      btn.classList.add("active");
      // 更新選中的字
      selectedChar = btn.textContent;
    }
    redrawCanvas();
  });
});

// 點擊新增按鈕 → 新增部首
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

biggerBtn.addEventListener("click", () => {
  if (frontsize <= 200) {
    frontsize = frontsize + 2
    updateFontsizeDisplay()
  }
});

smallerBtn.addEventListener("click", () => {
  if (frontsize >= 10) {
    frontsize = frontsize - 2
    updateFontsizeDisplay()
  }
});

function updateFontsizeDisplay() {
  document.getElementById("fontsize-display").innerText = `字體大小：${frontsize}px`;
}

// 點擊剪下按鈕，並在畫布剪下滑鼠所框的矩形
cutBtn.addEventListener("click", () => {
  isCutting = !isCutting; // 切換 true/false
  if (isCutting) {
    canvas.style.cursor = "crosshair"; // 進入剪下模式
    // 取消其他按鈕的 active
    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
    selectedChar = null;
  } else {
    canvas.style.cursor = "default";   // 回復預設模式
    startX = null;
    startY = null;
    endX = null;
    endY = null;
  }
  redrawCanvas();  // 重新繪製
});

// 滑鼠移動 → 顯示跟隨的字
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  redrawCanvas();

  if ((!selectedChar) && isCutting) {
    if (startX !== null && startY !== null && endX === null && endY === null) {
      // 畫出臨時矩形框
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } 
    return;
  }

  if (selectedChar) {
    // 畫跟隨的字（半透明）
    ctx.globalAlpha = 0.8;
    ctx.font = frontsize + "px Microsoft JhengHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (selectedChar == '橡皮擦'){
      // 畫白色矩形遮住
      ctx.fillStyle = "white";
      // 這裡設一個矩形大小，例如 40x40，可依需求調整
      ctx.fillRect(x - 20, y - 20, frontsize, frontsize);
    }
    else {
      ctx.fillStyle = "black"; // 正常文字黑色
      ctx.fillText(selectedChar, x, y);
    };
    ctx.globalAlpha = 1.0;
  }
  
});

// 點擊畫布 放置字 or 檢取初始點
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if ((!selectedChar) && isCutting) {
    if (startX !== null && startY !== null && endX === null && endY === null) {
      // 第二次點擊 → 設定結束點
      endX = x;
      endY = y;
    } else {
      // 第一次點擊 或者 已經有完整的四個座標 → 重新設定
      startX = x;
      startY = y;
      endX = null;
      endY = null;
    }
    redrawCanvas(); // 每次更新座標都重新繪製
    return;
  }

  if (selectedChar) {
    placedChars.push({ char: selectedChar, char_frontsize: frontsize, x, y });
    redrawCanvas();
  }
});

// 點擊 回復上一步
undoBtn.addEventListener("click", () => {
  if (placedChars.length > 0 ) {
    placedChars.pop();  // 移除最後一個放上的字
    redrawCanvas();  // 重新繪製
  }
});

// 重繪 Canvas（已放置字）
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px Microsoft JhengHei";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  placedChars.forEach(item => {
    if (item.char == '橡皮擦'){
      // 畫白色矩形遮住
      ctx.fillStyle = "white";
      // 這裡設一個矩形大小，例如 40x40，可依需求調整
      ctx.fillRect(item.x - 20, item.y - 20, frontsize, frontsize);
    }
    else {
      ctx.font = item.char_frontsize + "px Microsoft JhengHei";
      ctx.fillStyle = "black"; // 正常文字黑色
      ctx.fillText(item.char, item.x, item.y);
    };
    
  });
}