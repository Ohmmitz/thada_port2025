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
  document.getElementById("refreshBtn").addEventListener("click", loadHistory);
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

    renderTodayList(data);
    calculateSummary(data);

  } catch (err) {
    console.error(err);
  } finally {
    hideLoading();
  }
}

//
// ================= TODAY LIST =================
//
function renderTodayList(data) {
  const today = new Date();

  const todayList = data.filter(row => {
    const d = parseDate(row.timestamp || row.Timestamp);
    if (!d) return false;

    return isSameDay(d, today);
  });

  // sort ล่าสุด
  todayList.sort((a, b) => parseDate(b.timestamp) - parseDate(a.timestamp));

  displayHistory(todayList.slice(0, 7));
}

function displayHistory(list) {
  const container = document.getElementById("historyList");

  if (!list.length) {
    container.innerHTML = "<p>ยังไม่มีรายการวันนี้</p>";
    return;
  }

  container.innerHTML = list.map(item => {
    const isIncome = item.type === "income";
    const value = Number(item.value) || 0;
    const sign = isIncome ? "+" : "-";

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

//
// ================= SUMMARY =================
//
function calculateSummary(data) {
  const today = new Date();

  let incomeToday = 0;
  let expenseToday = 0;
  let incomeMonth = 0;
  let expenseMonth = 0;

  data.forEach(row => {
    const d = parseDate(row.timestamp || row.Timestamp);
    if (!d) return;

    const value = Number(row.value) || 0;
    const isIncome = row.type === "income";

    // today
    if (isSameDay(d, today)) {
      if (isIncome) incomeToday += value;
      else expenseToday += value;
    }

    // month
    if (isSameMonth(d, today)) {
      if (isIncome) incomeMonth += value;
      else expenseMonth += value;
    }
  });

  const balance = incomeMonth - expenseMonth;

  updateSummaryUI(incomeMonth, expenseToday, expenseMonth, balance);
}

function updateSummaryUI(income, expenseToday, expenseMonth, balance) {
  animateNumber(document.getElementById("sumIncomeToday"), income);
  animateNumber(document.getElementById("sumExpenseToday"), expenseToday);
  animateNumber(document.getElementById("sumExpenseMonth"), expenseMonth);
  animateNumber(document.getElementById("sumBalance"), balance);
}

//
// ================= ANIMATION =================
//
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateNumber(el, to, duration = 500) {
  const from = getRawNumber(el.innerText);
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutCubic(progress);

    const current = Math.round(from + (to - from) * eased);

    el.innerText = current.toLocaleString();

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function getRawNumber(value) {
  return Number(value.replace(/\D/g, "")) || 0;
}

//
// ================= DATE UTILS =================
//
function parseDate(val) {
  if (!val) return null;

  const d = new Date(val);
  return isNaN(d) ? null : d;
}

function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function isSameMonth(a, b) {
  return (
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

//
// ================= NAV =================
//
function goBack() {
  window.location.href = "IE25.html";
}