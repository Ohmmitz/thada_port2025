const API_URL = "https://script.google.com/macros/s/AKfycbyTHy97sczZP2YKB9mGR18GsszuTxIVcphS2FGkZBHyzELUGwBxenrHuvH13X3wb4eByA/exec";

let visibleCount = 3;
let currentList = [];

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

  renderBillingRange(); // 👉 แสดงช่วงรอบบิล
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
    return d && isSameDay(d, today);
  });

  todayList.sort((a, b) => parseDate(b.timestamp) - parseDate(a.timestamp));

  currentList = todayList;
  visibleCount = 3; // reset ทุกครั้งโหลดใหม่

  displayHistory();
}

function displayHistory() {
  const container = document.getElementById("historyList");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (!currentList.length) {
    container.innerHTML = "<p>ยังไม่มีรายการวันนี้</p>";
    loadMoreBtn.style.display = "none";
    return;
  }

  const visibleItems = currentList.slice(0, visibleCount);

  container.innerHTML = visibleItems.map(item => {
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

  // 👉 ซ่อนปุ่มถ้าครบแล้ว
  if (visibleCount >= currentList.length) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "block";
  }
}

document.getElementById("loadMoreBtn").addEventListener("click", () => {
  visibleCount += 3;
  displayHistory();
});

//
// ================= SUMMARY =================
//
function calculateSummary(data) {
  const today = new Date();
  const { start, end } = getBillingRange();

  let incomeToday = 0;
  let expenseToday = 0;
  let incomeMonth = 0;   // 🔥 รายรับทั้งเดือน (26-25)
  let expenseMonth = 0;

  data.forEach(row => {
    const d = parseDate(row.timestamp || row.Timestamp);
    if (!d) return;

    const value = Number(row.value) || 0;
    const isIncome = row.type === "income";

    const isToday = isSameDay(d, today);
    const isInBilling = d >= start && d <= end;

    // ✅ TODAY
    if (isToday) {
      if (isIncome) incomeToday += value;
      else expenseToday += value;
    }

    // ✅ รอบบิล (แทนเดือน)
    if (isInBilling) {
      if (isIncome) incomeMonth += value;
      else expenseMonth += value;
    }
  });

  const balance = incomeMonth - expenseMonth;

  updateSummaryUI(incomeMonth, expenseToday, expenseMonth, balance);

  updateBudgetBar(incomeMonth, expenseMonth);

}

function updateSummaryUI(incomeMonth, expenseToday, expenseMonth, balance) {

  animateNumber(document.getElementById("sumIncomeMonth"), incomeMonth);
  animateNumber(document.getElementById("sumExpenseToday"), expenseToday);
  animateNumber(document.getElementById("sumExpenseMonth"), expenseMonth);

  const balanceEl = document.getElementById("sumBalance");
  animateNumber(balanceEl, balance);

  
}

//
// ================= ANIMATION =================
//
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateNumber(el, to, duration = 600) {
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

//
// 🔥 รอบบิล 26 → 25
//
function getBillingRange() {
  const now = new Date();

  let start, end;

  if (now.getDate() >= 25) {
    start = new Date(now.getFullYear(), now.getMonth(), 25);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 24, 23, 59, 59);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 25);
    end = new Date(now.getFullYear(), now.getMonth(), 24, 23, 59, 59);
  }

  return { start, end };
}

//
// ================= BILLING RANGE UI =================
//
function renderBillingRange() {
  const { start, end } = getBillingRange();

  const opt = { day: "numeric", month: "short" };

  const text =
    `${start.toLocaleDateString("th-TH", opt)} - ${end.toLocaleDateString("th-TH", opt)}`;

  const el = document.getElementById("billingRange");
  if (el) el.innerText = "รอบบัญชี: " + text;
}


function updateBudgetBar(incomeMonth, expenseMonth) {

  const budget = incomeMonth; // 🔥 ใช้รายรับเป็นงบ
  const used = expenseMonth;

  const percent = budget > 0
    ? Math.min((used / budget) * 100, 999)
    : 0;

  const progressEl = document.getElementById("budgetProgress");
  const percentEl = document.getElementById("budgetPercent");

  // 🔥 animate width
  requestAnimationFrame(() => {
    progressEl.style.width = percent + "%";
  });

  // 🔥 text
  percentEl.innerText = Math.floor(percent) + "%";

  document.getElementById("budgetUsed").innerText =
    used.toLocaleString();

  document.getElementById("budgetTotal").innerText =
    budget.toLocaleString();

  // 🔥 สี dynamic
  if (percent >= 100) {
    progressEl.style.background = "linear-gradient(90deg,#FF1744,#D50000)";
  } else if (percent >= 80) {
    progressEl.style.background = "linear-gradient(90deg,#FF9100,#FF6D00)";
  } else {
    progressEl.style.background = "linear-gradient(90deg,#00C853,#64DD17)";
  }
}


//
// ================= NAV =================
//
function goBack() {
  window.location.href = "IE25.html";
}


