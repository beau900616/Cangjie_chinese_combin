const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let items = []; // 已放置的部首

// 當前拖拉的部首
let currentChar = null;

// 允許拖拉
document.querySelectorAll(".radical").forEach(el => {
  el.addEventListener("dragstart", e => {
    currentChar = e.target.innerText;
  });
});

// 畫布放置
canvas.addEventListener("dragover", e => e.preventDefault());
canvas.addEventListener("drop", e => {
  e.preventDefault();
  if (currentChar) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    items.push({ char: currentChar, x, y, size: 40, rotation: 0 });
    redraw();
    currentChar = null;
  }
});

// 重新繪製
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  items.forEach(item => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.font = item.size + "px sans-serif";
    ctx.fillText(item.char, 0, 0);
    ctx.restore();
  });
}

// 儲存按鈕
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
