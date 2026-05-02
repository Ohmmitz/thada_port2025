const API_URL = "https://script.google.com/macros/s/AKfycbyTHy97sczZP2YKB9mGR18GsszuTxIVcphS2FGkZBHyzELUGwBxenrHuvH13X3wb4eByA/exec";

// ================= STATE =================
let selectedCode = "";
let tempData = {};
let isSubmitting = false;

// ================= CATEGORY =================
const categoryMap = {
  income: ["INCO", "INOT", "FMGM" ,"BONU"],
  food: ["COOK", "DINE", "CELE", "DRNK"],
  utility: ["WATE", "ELEC", "YOUT", "NETX", "AISP" ,"FIBE"],
  transport: ["BTST", "GRAB", "TAXI", "BUST", "CC10"],
  personal: ["TSSP", "WDEQ", "ETCM"],
  self: ["WANT", "SAVE", "DEBT", "MFGM"]
};

// ================= CODE CONFIG =================
const codeConfig = {
  INCO: { type: "income", value: 11040, item: "เงินเดือน", from: "Remobie", amount: "1", unit:"เดือน"},
  INOT: { type: "income", item: "Incentive", from: "Remobie", amount: "1" , unit:"เดือน" },
  FMGM: { type: "income" },
  BONU: { type: "income" },
  COOK: { type: "expense" },
  DINE: { type: "expense" },
  CELE: { type: "expense" },
  WATE: { type: "expense", item: "จ่ายค่าน้ำ", from: "การประปานครหลวง (ผ่านนิติ)", amount: "1", unit:"งวด"},
  ELEC: { type: "expense", item: "จ่ายค่าไฟ", from: "การไฟฟ้านครหลวง", amount: "1", unit:"งวด"},
  YOUT: { type: "expense", value: 199, item: "จ่ายค่า Youtube premium", from: "Youtube", amount: "1", unit:"เดือน"},
  NETX: { type: "expense", value: 419, item: "จ่ายค่า Netflix", from: "Netflix", amount: "1", unit:"เดือน"},
  AISP: { type: "expense", value: 641, item: "จ่ายค่าเบอร์มือถือรายเดือน", from: "AIS", amount: "1", unit:"เดือน"},
  FIBE: { type: "expense", value: 535, item: "จ่ายเน็ตบ้านรายเดือน", from: "AIS", amount: "1", unit:"เดือน"},
  BTST: { type: "expense", value: 1190, item: "เติมเงินเที่ยวเดิน (BTS)", from: "Rabbit Reward", amount: "1", unit:"เดือน"},
  GRAB: { type: "expense", amount: "1", unit:"เที่ยว"},
  BUST: { type: "expense", value: 8, item: "นั่งรถเมล์", amount: "1", unit:"เที่ยว"},
  CC10: { type: "expense", value: 10, item: "นั่งรถกระป๋อง", amount: "1", unit:"เที่ยว"},
  TAXI: { type: "expense", amount: "1", unit:"เที่ยว"},
  TSSP: { type: "expense" },
  WDEQ: { type: "expense" },
  ETCM: { type: "expense" },
  WANT: { type: "expense" },
  SAVE: { type: "expense" },
  DEBT: { type: "expense" , item: "จ่ายหนี้", },
  MFGM: { type: "expense" },
};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  const tagGroup = document.getElementById("code");

  toggleForm(true); // 👉 ปิด form ตอนแรก
  loadHistory();

  // ================= CATEGORY CLICK =================
  document.querySelectorAll(".category").forEach(btn => {
    btn.addEventListener("click", () => {

      document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.dataset.category;

      tagGroup.style.display = "grid";

      document.querySelectorAll(".tag").forEach(tag => {
        tag.classList.remove("active");

        if (categoryMap[selectedCategory]?.includes(tag.dataset.value)) {
          tag.style.display = "inline-block";
        } else {
          tag.style.display = "none";
        }
      });

      // 👉 reset state
      selectedCode = "";
      toggleForm(true);
    });
  });

  // ================= TAG CLICK =================
  document.querySelectorAll(".tag").forEach(tag => {
    tag.addEventListener("click", () => {

      document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
      tag.classList.add("active");

      selectedCode = tag.dataset.value;

      applyCodeConfig(selectedCode);

      toggleForm(false); // ✅ ปลด disable
    });
  });

});

// ================= APPLY CONFIG =================
function applyCodeConfig(code) {
  const config = codeConfig[code];
  if (!config) return;

  const input = document.getElementById("amountMoney");

  const current = getRawNumber(input.value);
  const target = config.value || 0;

  // 👉 animate เท่านั้น (ห้าม set input.value ซ้ำ)
  animateValue(input, current, target);

  // item auto fill
  document.getElementById("item").value = config.item || "";

  // optional auto fill (from / amount / unit)
  document.getElementById("from").value = config.from || "";
  document.getElementById("amount").value = config.amount || "";
  document.getElementById("unit").value = config.unit || "";

  input.focus();
}


// ================= TYPE =================
function getTypeFromCode(code) {

  return codeConfig[code]?.type || "expense";

}

// ================= INPUT MONEY =================
const amountInput = document.getElementById("amountMoney");

amountInput.addEventListener("input", (e) => {
  let raw = e.target.value.replace(/\D/g, "");
  raw = Math.min(Number(raw), 99999);

  e.target.value = raw ? Number(raw).toLocaleString() : "";
});

function getAmountValue() {
  return Number(amountInput.value.replace(/,/g, "")) || 0;
}

// ================= SUBMIT =================
function submitData() {

  if (!selectedCode) {
    alert("กรุณาเลือก Tag ก่อน");
    return;
  }

  if (!validateForm()) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  const value = getAmountValue();
  const type = getTypeFromCode(selectedCode);

  tempData = {
    code: selectedCode,
    type,
    value,
    item: document.getElementById("item").value,
    amount: document.getElementById("amount").value,
    unit: document.getElementById("unit").value,
    from: document.getElementById("from").value,
    income: type === "income" ? value : "",
    expense: type === "expense" ? value : "",
    note: document.getElementById("note").value,
    timestamp: new Date().toISOString()
  };

  showSummary();
}

// ================= SUMMARY =================
function showSummary() {
  const html = `
    <br>
    <p>รายละเอียด</p>
    <p>ประเภทรายการ : ${tempData.type}</p>
    <p>รายการ : ${tempData.item}</p>
    <p>จำนวน :  ${tempData.amount} ${tempData.unit}</p>
    <p>เส้นทางการเงิน :  ${tempData.from}</p>
    <p><b>มูลค่า :  ${Number(tempData.value).toLocaleString()} บาท</b></p>
    <p></p>
  `;

  document.getElementById("summary").innerHTML = html;
  document.getElementById("confirmModal").style.display = "flex";
}

// ================= CONFIRM =================
async function confirmSubmit() {
  if (isSubmitting) return;
  isSubmitting = true;

  closeModal();
  showLoading();

  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(tempData)
    });

    await loadHistory();

    hideLoading();
    showSuccess();

    resetAll();

  } catch (err) {
    console.warn("fallback success", err);

    await loadHistory();

    hideLoading();
    showSuccess();

    resetAll();
  }

  isSubmitting = false;
}

// ================= RESET =================
function resetAll() {
  document.querySelectorAll("input, textarea").forEach(i => i.value = "");
  document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));

  selectedCode = "";
  toggleForm(true);
}

// ================= VALIDATION =================
function validateForm() {
  const item = document.getElementById("item").value.trim();
  const amount = document.getElementById("amount").value;
  const unit = document.getElementById("unit").value;
  const money = getAmountValue();

  return item && amount > 0 && unit && money > 0;
}

// ================= FORM LOCK =================
function toggleForm(disabled) {
  document.querySelectorAll(".form-input").forEach(el => el.disabled = disabled);

  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = disabled;
}

// ================= HISTORY =================
async function loadHistory() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    renderTodayHistory(data);

  } catch (err) {
    console.error("โหลด history ไม่ได้", err);
  }
}

function renderTodayHistory(data) {
  const today = new Date();

  const list = data.filter(r => {
    const d = new Date(r.timestamp);
    return d.toDateString() === today.toDateString();
  });

  list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  displayHistory(list.slice(0, 5));
}

function displayHistory(list) {
  const el = document.getElementById("historyList");
  if (!el) return;

  if (!list.length) {
    el.innerHTML = "ยังไม่มีรายการวันนี้";
    return;
  }

  el.innerHTML = list.map(i => {
    const isIncome = i.type === "income";
    const sign = isIncome ? "+" : "-";

    return `
      <div class="history-item">
        <div>${i.item}</div>
        <div style="color:${isIncome ? "green" : "red"}">
          ${sign}${Number(i.value).toLocaleString()} บาท
        </div>
      </div>
    `;
  }).join("");
}

// ================= LOADING =================
function showLoading() {
  document.getElementById("loadingModal").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingModal").style.display = "none";
}

// ================= SUCCESS =================
function showSuccess() {
  const now = new Date();

  document.getElementById("successTime").innerText =
    now.toLocaleString('th-TH');

  document.getElementById("successModal").style.display = "flex";

  setTimeout(closeSuccess, 3000);
}

function closeSuccess() {
  document.getElementById("successModal").style.display = "none";
}

// ================= MODAL =================
function closeModal() {
  document.getElementById("confirmModal").style.display = "none";
}

// ================= CLOCK =================
function updateClock() {
  const now = new Date();

  const date = now.toLocaleDateString('th-TH');
  const time = now.toLocaleTimeString('th-TH');

  document.getElementById("clock").innerText =
    `ทำรายการ ณ วันที่ ${date} เวลา ${time}`;
}

setInterval(updateClock, 1000);

// ================= NAV =================
function goToHistory() {
  window.location.href = "IE_History.html";
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateValue(input, from, to, duration = 400) {
  if (from === to) {
    input.value = to ? Number(to).toLocaleString() : "";
    return;
  }

  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutCubic(progress);

    const current = Math.round(from + (to - from) * eased);

    input.value = current ? current.toLocaleString() : "";

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function getRawNumber(value) {
  return Number(value.replace(/\D/g, "")) || 0;
}

console.log(tempData);
