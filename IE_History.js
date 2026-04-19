const API_URL = "https://script.google.com/macros/s/AKfycbyTHy97sczZP2YKB9mGR18GsszuTxIVcphS2FGkZBHyzELUGwBxenrHuvH13X3wb4eByA/exec";

// ================= LOADING =================
function showLoading() {
  document.getElementById("loadingBar").style.display = "block";
}

function hideLoading() {
  document.getElementById("loadingBar").style.display = "none";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refreshBtn");

  refreshBtn.addEventListener("click", loadHistory);

  loadHistory();
});

// ================= LOAD =================
async function loadHistory() {
  try {
    showLoading();

    const res = await fetch(API_URL);
    const text = await res.text();

    let data = [];
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("ไม่ใช่ JSON");
    }

    renderTodayHistory(data);

  } catch (err) {
    console.error(err);
  } finally {
    hideLoading();
  }
}

function renderTodayHistory(data) {
  const today = new Date();

  const todayList = data.filter(row => {
    const d = new Date(row.timestamp || row.Timestamp);

    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  todayList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  displayHistory(todayList);
}

function displayHistory(list) {
  const container = document.getElementById("historyList");

  if (list.length === 0) {
    container.innerHTML = "<p>ยังไม่มีรายการวันนี้</p>";
    return;
  }

  container.innerHTML = list.map(item => {

    const isIncome = item.type === "income";
    const value = Number(item.value) || 0;
    const sign = isIncome ? "+ " : "- ";

    return `
      <div class="history-item">
        <div><b>${item.item || "-"}</b></div>
        <div>${item.from || "-"}</div>
        <div class="${isIncome ? "history-income" : "history-expense"}">
          ${sign}${value.toLocaleString()} บาท
        </div>
      </div>
    `;
  }).join("");
}

function renderTodayHistory(data) {
  const today = new Date();

  let incomeTotal = 0;
  let expenseTotal = 0;

  const todayList = data.filter(row => {
    const d = new Date(row.timestamp || row.Timestamp);

    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) {
      const value = Number(row.value) || 0;

      if (row.type === "income") {
        incomeTotal += value;
      } else {
        expenseTotal += value;
      }
    }

    return isToday;
  });

  todayList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  displayHistory(todayList.slice(0, 5));

  // 🔥 ANIMATE SUMMARY
  const incomeEl = document.getElementById("todayIncome");
  const expenseEl = document.getElementById("todayExpense");

  const currentIncome = getRawNumber(incomeEl.innerText);
  const currentExpense = getRawNumber(expenseEl.innerText);

  animateNumber(incomeEl, currentIncome, incomeTotal, 600, " ");
  animateNumber(expenseEl, currentExpense, expenseTotal, 600, " ");
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateNumber(el, from, to, duration = 600, suffix = " บาท") {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutCubic(progress);

    const current = Math.round(from + (to - from) * eased);

    el.innerText = current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function getRawNumber(value) {
  return Number(value.replace(/\D/g, "")) || 0;
}



function goBack() {
  window.location.href = "IE25.html";
}
