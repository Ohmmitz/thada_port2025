const API_URL = "https://script.google.com/macros/s/AKfycbyTHy97sczZP2YKB9mGR18GsszuTxIVcphS2FGkZBHyzELUGwBxenrHuvH13X3wb4eByA/exec";

let visibleCount = 3;
let groupedTimeline = {};

// ================= CATEGORY =================
const categoryMap = {
  income: ["INCO", "INOT", "FMGM", "BONU"],
  food: ["COOK", "DINE", "CELE", "DRNK"],
  utility: ["WATE", "ELEC", "YOUT", "NETX", "AISP", "FIBE"],
  transport: ["BTST", "GRAB", "TAXI", "BUST", "CC10"],
  personal: ["TSSP", "WDEQ", "ETCM"],
  self: ["WANT", "SAVE", "DEBT", "MFGM"]
};

// ================= LOADING =================
function showLoading() {
  document.getElementById("loadingBar").style.display = "block";
}

function hideLoading() {
  document.getElementById("loadingBar").style.display = "none";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("refreshBtn")
    .addEventListener("click", loadHistory);

  document
    .getElementById("loadMoreBtn")
    .addEventListener("click", () => {
      visibleCount += 3;
      displayHistory();
    });

  renderBillingRange();

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

    renderTimeline(data);

    calculateSummary(data);

    calculateCategorySummary(data);

  } catch (err) {

    console.error(err);

  } finally {

    hideLoading();

  }

}

// ================= TIMELINE =================
function renderTimeline(data) {

  const today = new Date();

  const sorted = data
    .filter(row => parseDate(row.timestamp || row.Timestamp))
    .sort((a, b) =>
      parseDate(b.timestamp || b.Timestamp) -
      parseDate(a.timestamp || a.Timestamp)
    );

  const todayList = [];
  const yesterdayList = [];
  const olderList = [];

  sorted.forEach(row => {

    const d = parseDate(row.timestamp || row.Timestamp);

    if (isSameDay(d, today)) {

      todayList.push(row);

    } else {

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (isSameDay(d, yesterday)) {
        yesterdayList.push(row);
      } else {
        olderList.push(row);
      }

    }

  });

  groupedTimeline = {
    today: todayList,
    yesterday: yesterdayList,
    older: olderList
  };

  // 🔥 เริ่มต้นแสดงเฉพาะวันนี้ 3 รายการ
  visibleCount = 3;

  displayHistory();
}

// ================= DISPLAY =================
function displayHistory() {

  const container = document.getElementById("historyList");

  container.innerHTML = "";

  // 🔥 TODAY
  renderSection(
    container,
    "วันนี้",
    groupedTimeline.today.slice(0, visibleCount),
    groupedTimeline.today // ✅ ส่ง full list
  );

  // 🔥 ถ้าเกินวันนี้ → เริ่มแสดงเมื่อวาน
  if (visibleCount > groupedTimeline.today.length) {

    const remain =
      visibleCount - groupedTimeline.today.length;

    renderSection(
      container,
      "เมื่อวาน",
      groupedTimeline.yesterday.slice(0, remain),
      groupedTimeline.yesterday // ✅ full list
    );

    // 🔥 ถ้าเกินเมื่อวาน → แสดงย้อนหลัง
    if (
      remain >
      groupedTimeline.yesterday.length
    ) {

      const olderRemain =
        remain - groupedTimeline.yesterday.length;

      renderSection(
        container,
        "ย้อนหลัง",
        groupedTimeline.older.slice(0, olderRemain),
        groupedTimeline.older // ✅ full list
      );

    }

  }

  updateLoadMoreButton();
}


// ================= SECTION =================

function renderSection(container, title, list, fullList = []) {

  if (!list.length) return;

  // 🔥 ใช้ fullList คำนวณยอดรวมทั้งหมดของวัน
  let sectionExpense = 0;
  let sectionIncome = 0;

  fullList.forEach(item => {

    const value = Number(item.value) || 0;

    if (item.type === "income") {
      sectionIncome += value;
    } else {
      sectionExpense += value;
    }

  });

  const section = document.createElement("div");

  section.className = "timeline-section";

  section.innerHTML = `
    <div class="timeline-header">

      <div class="timeline-title">
        ${title}
      </div>

      <div class="timeline-summary">

        ${
          sectionExpense > 0
          ? `
            <b>
              ใช้ไป ${sectionExpense.toLocaleString()} บาท
            </b>
          `
          : ""
        }

      </div>

    </div>

    ${list.map(item => {

      const isIncome = item.type === "income";

      const value = Number(item.value) || 0;

      const sign = isIncome ? "+" : "-";

      const date = parseDate(item.timestamp || item.Timestamp);

      const time = date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="history-item">

          <div class="history-top">

            <div>
              <h4>${item.item || "-"}</h4>
            </div>
            <div>
              เส้นทางการเงิน : ${item.from || "-"}
            </div>
            <div>
              เวลา : ${time}
            </div>
          </div>

          <div class="history-bottom">

            <div class="${
              isIncome
                ? "history-income"
                : "history-expense"
            }">

              ${sign}${value.toLocaleString()} บาท

            </div>

          </div>

        </div>
      `;

    }).join("")}
  `;

  container.appendChild(section);
}
// ================= LOAD MORE =================
function updateLoadMoreButton() {

  const btn = document.getElementById("loadMoreBtn");

  const totalItems =
    groupedTimeline.today.length +
    groupedTimeline.yesterday.length +
    groupedTimeline.older.length;

  btn.style.display =
    visibleCount >= totalItems
      ? "none"
      : "block";
}

// ================= SUMMARY =================
function calculateSummary(data) {

  const today = new Date();

  const { start, end } = getBillingRange();

  let expenseToday = 0;
  let incomeMonth = 0;
  let expenseMonth = 0;

  data.forEach(row => {

    const d = parseDate(row.timestamp || row.Timestamp);

    if (!d) return;

    const value = Number(row.value) || 0;

    const isIncome = row.type === "income";

    const isToday = isSameDay(d, today);

    const isInBilling =
      d >= start &&
      d <= end;

    // TODAY
    if (isToday) {

      if (!isIncome) {
        expenseToday += value;
      }

    }

    // BILLING
    if (isInBilling) {

      if (isIncome) {
        incomeMonth += value;
      } else {
        expenseMonth += value;
      }

    }

  });

  const balance = incomeMonth - expenseMonth;

  updateSummaryUI(
    incomeMonth,
    expenseToday,
    expenseMonth,
    balance
  );

  updateBudgetBar(
    incomeMonth,
    expenseMonth
  );
}

// ================= SUMMARY UI =================
function updateSummaryUI(
  incomeMonth,
  expenseToday,
  expenseMonth,
  balance
) {

  animateNumber(
    document.getElementById("sumIncomeMonth"),
    incomeMonth
  );

  animateNumber(
    document.getElementById("sumExpenseToday"),
    expenseToday
  );

  animateNumber(
    document.getElementById("sumExpenseMonth"),
    expenseMonth
  );

  const balanceEl =
    document.getElementById("sumBalance");

  animateNumber(balanceEl, balance);

}

// ================= BUDGET BAR =================
function updateBudgetBar(
  incomeMonth,
  expenseMonth
) {

  const budget = incomeMonth;

  const used = expenseMonth;

  const percent = budget > 0
    ? Math.min((used / budget) * 100, 999)
    : 0;

  const progressEl =
    document.getElementById("budgetProgress");

  const percentEl =
    document.getElementById("budgetPercent");

  requestAnimationFrame(() => {
    progressEl.style.width = percent + "%";
  });

  percentEl.innerText =
    Math.floor(percent) + "%";

  document.getElementById("budgetUsed").innerText =
    used.toLocaleString();

  document.getElementById("budgetTotal").innerText =
    budget.toLocaleString();

  if (percent >= 100) {

    progressEl.style.background =
      "linear-gradient(90deg,#FF1744,#D50000)";

  } else if (percent >= 80) {

    progressEl.style.background =
      "linear-gradient(90deg,#FF9100,#FF6D00)";

  } else {

    progressEl.style.background =
      "linear-gradient(90deg,#00C853,#64DD17)";

  }

}

// ================= CATEGORY SUMMARY =================
function calculateCategorySummary(data) {

  const { start, end } =
    getBillingRange();

  const totals = {};

  Object.keys(categoryMap).forEach(cat => {
    totals[cat] = 0;
  });

  data.forEach(row => {

    const d = parseDate(
      row.timestamp || row.Timestamp
    );

    if (!d) return;

    if (d < start || d > end) return;

    const value =
      Number(row.value) || 0;

    if (row.type === "income") return;

    Object.entries(categoryMap).forEach(
      ([category, codes]) => {

        if (codes.includes(row.code)) {
          totals[category] += value;
        }

      }
    );

  });

  renderCategorySummary(totals);
}

// ================= CATEGORY UI =================
function renderCategorySummary(totals) {

  const container =
    document.getElementById("categoryList");

  const labels = {
    food: "ค่าอาหาร",
    utility: "ค่าสาธารณูปโภค",
    transport: "ค่าเดินทาง",
    personal: "ค่าของใช้ส่วนตัว",
    self: "เกี่ยวกับตัวเอง"
  };

  const sorted = Object.entries(totals)
    .filter(([k, v]) =>
      k !== "income" && v > 0
    )
    .sort((a, b) => b[1] - a[1]);

  container.innerHTML = sorted.map(
    ([key, value]) => `

      <div class="category-item">

        <p class="category-name">
          ${labels[key] || key}
        </p>

        <h3 class="category-value">
          ${value.toLocaleString()}
        </h3>

        <p>บาท</p>

      </div>

    `
  ).join("");

}

// ================= ANIMATION =================
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateNumber(
  el,
  to,
  duration = 600
) {

  const from =
    getRawNumber(el.innerText);

  const start =
    performance.now();

  function frame(now) {

    const progress =
      Math.min(
        (now - start) / duration,
        1
      );

    const eased =
      easeOutCubic(progress);

    const current =
      Math.round(
        from + (to - from) * eased
      );

    el.innerText =
      current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(frame);
    }

  }

  requestAnimationFrame(frame);
}

function getRawNumber(value) {
  return Number(
    value.replace(/\D/g, "")
  ) || 0;
}

// ================= DATE =================
function parseDate(val) {

  if (!val) return null;

  const d = new Date(val);

  return isNaN(d)
    ? null
    : d;
}

function isSameDay(a, b) {

  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );

}

// ================= BILLING =================
function getBillingRange() {

  const now = new Date();

  let start, end;

  if (now.getDate() >= 25) {

    start = new Date(
      now.getFullYear(),
      now.getMonth(),
      25
    );

    end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      24,
      23,
      59,
      59
    );

  } else {

    start = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      25
    );

    end = new Date(
      now.getFullYear(),
      now.getMonth(),
      24,
      23,
      59,
      59
    );

  }

  return { start, end };
}

// ================= BILLING UI =================
function renderBillingRange() {

  const { start, end } =
    getBillingRange();

  const opt = {
    day: "numeric",
    month: "short"
  };

  const text =
    `${start.toLocaleDateString("th-TH", opt)} - ${end.toLocaleDateString("th-TH", opt)}`;

  const el =
    document.getElementById("billingRange");

  if (el) {
    el.innerText =
      "รอบบัญชี: " + text;
  }

}

// ================= NAV =================
function goBack() {
  window.location.href = "IE25.html";
}