const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const sidebar = document.getElementById("sidebar");
const input = document.getElementById("newCharInput");
const addBtn = document.getElementById("addBtn");
const biggerBtn = document.getElementById("bigger");
const smallerBtn = document.getElementById("smaller");
const undoBtn = document.getElementById("undo");

let selectedChar = null;   // 當前選中的字
let placedChars = [];      // 已放置的字方塊
let frontsize = 150;      // 當前的文字大小
updateFontsizeDisplay()  //更新字體大小的顯示

// 側邊選單點擊
document.querySelectorAll(".char-btn").forEach(btn => {
  btn.addEventListener("click", () => {
     // 取消其他按鈕的 active
    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
    // 設定目前按鈕 active
    btn.classList.add("active");
    // 更新選中的字
    selectedChar = btn.textContent;
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

// 滑鼠移動 → 顯示跟隨的字
canvas.addEventListener("mousemove", (e) => {
  if (!selectedChar) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  redrawCanvas();

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
});

// 點擊 → 放置字
canvas.addEventListener("click", (e) => {
  if (!selectedChar) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  placedChars.push({ char: selectedChar, char_frontsize: frontsize, x, y });
  redrawCanvas();
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