const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// === 高 DPI 處理 ===
const ratio = window.devicePixelRatio || 1;
const width = 400;
const height = 400;
canvas.width = width * ratio;
canvas.height = height * ratio;
canvas.style.width = width + "px";
canvas.style.height = height + "px";
ctx.scale(ratio, ratio);

// === 狀態 ===
let items = []; // 已放置的部首
let currentChar = null;

// === 對齊設定（讓文字放置時以中心點為基準） ===
ctx.textAlign = "left";
ctx.textBaseline = "top";

// === 拖拉功能 ===
document.querySelectorAll(".radical").forEach(el => {
  el.addEventListener("dragstart", e => {
    currentChar = e.target.innerText;
    // 計算滑鼠點擊位置相對於文字元素左上角的偏移量
    const rect = e.target.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
  });
});

canvas.addEventListener("dragover", e => e.preventDefault());

canvas.addEventListener("drop", e => {
  e.preventDefault();
  if (currentChar) {
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffsetX;
    let y = e.clientY - rect.top - dragOffsetY + 7; //html內建的文字有上下的空白區塊

    items.push({ char: currentChar, x, y, size: 40, rotation: 0 });
    redraw();
    currentChar = null;
  }
});

// === 繪製 ===
function redraw() {
  ctx.clearRect(0, 0, width, height);

  ctx.textBaseline = "top";   // 修正垂直對齊
  ctx.textAlign = "left";     // 修正水平對齊

  items.forEach(item => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.font = item.size + 'px "Microsoft JhengHei", sans-serif';
    // 用 measureText() 拿字體的真實 metrics
    const metrics = ctx.measureText(item.char);
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    // 在 y 座標上做補償，讓它更接近 HTML div 的 top
    ctx.fillText(item.char, 0, -metrics.actualBoundingBoxAscent);
    ctx.restore();
  });
}

// === 儲存按鈕 ===
document.getElementById("saveBtn").addEventListener("click", () => {
  fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "result.png";
      a.click();
      URL.revokeObjectURL(url);
    });
});
