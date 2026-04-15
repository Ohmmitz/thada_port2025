const API_URL = "https://script.google.com/macros/s/AKfycbyTHy97sczZP2YKB9mGR18GsszuTxIVcphS2FGkZBHyzELUGwBxenrHuvH13X3wb4eByA/exec";

let selectedCode = "INCO";
let selectedType = "income";
let tempData = {};

const codeConfig = {
  INCO: { type: "income" },
  COOK: { type: "expense" },
  DINE: { type: "expense" },
  CELE: { type: "expense" },
  WATE: { type: "expense" },
  ELEC: { type: "expense" },
  YOUT: { type: "expense", value: 199, item: "จ่ายค่า Youtube premium"},
  NETX: { type: "expense", value: 419, item: "จ่ายค่า Netflix"},
  AISP: { type: "expense", value: 641, item: "จ่ายค่าเบอร์มือถือรายเดือน"},
  BTST: { type: "expense", value: 1190, item: "เติมเงินเที่ยวเดิน (BTS)"},
  CC10: { type: "expense" },
  TSSP: { type: "expense" },
  WDEQ: { type: "expense" },
  ETCM: { type: "expense" },
  WANT: { type: "expense" },
  SAVE: { type: "expense" },
  DEBT: { type: "expense" },
  INOT: { type: "income" },
  FMGM: { type: "income" },
  MFGM: { type: "expense" },
  EMTC: { type: "expense" }
};

document.querySelectorAll(".tag").forEach(tag => {
  tag.addEventListener("click", () => {
    document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
    tag.classList.add("active");

    selectedCode = tag.dataset.value;

    applyCodeConfig(selectedCode); // 🔥 เรียกใช้ตรงนี้
  });
});

function applyCodeConfig(code) {
  const config = codeConfig[code];

  if (!config) return;

  // ================= TYPE =================
  if (config.type) {
    selectedType = config.type;

    document.querySelectorAll(".toggle").forEach(b => {
      b.classList.remove("active");
      if (b.dataset.type === config.type) {
        b.classList.add("active");
      }
    });
  }

  // ================= VALUE =================
  if (config.value) {
    const input = document.getElementById("amountMoney");
    input.value = Number(config.value).toLocaleString();
  }

  if (!config.value) {
    document.getElementById("amountMoney").value = "";
    }

  // ================= ITEM =================
  if (config.item) {
    document.getElementById("item").value = config.item;
  }

  if (!config.item) {
    document.getElementById("item").value = "";
    }



  
}

document.querySelectorAll(".toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toggle").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedType = btn.dataset.type;

    // UX: เปลี่ยน placeholder
    const input = document.getElementById("amountMoney");
    input.placeholder = selectedType === "income"
      ? "รายรับ (บาท)"
      : "รายจ่าย (บาท)";
  });
});


const amountInput = document.getElementById("amountMoney");

amountInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/,/g, "");

  if (value > 99999) {
    value = 99999;
  }

  if (!isNaN(value) && value !== "") {
    e.target.value = Number(value).toLocaleString();
  }
});


function submitData() {
  let rawAmount = amountInput.value.replace(/,/g, "");

  // ✅ validation
  if (!rawAmount || rawAmount <= 0) {
    alert("กรุณาใส่จำนวนเงิน");
    return;
  }

  if (!document.getElementById("item").value) {
    alert("กรุณากรอกรายการ");
    return;
  }

  tempData = {
    code: selectedCode,
    item: document.getElementById("item").value,
    amount: document.getElementById("amount").value,
    value: rawAmount,
    unit: document.getElementById("unit").value,
    from: document.getElementById("from").value,
    type: selectedType,
    income: selectedType === "income" ? rawAmount : "",
    expense: selectedType === "expense" ? rawAmount : "",
    note: document.getElementById("note").value
  };

  showSummary();
}

function showSummary() {
  const summary = `
    <p><b>Code:</b> ${tempData.code}</p>
    <p><b>รายการ:</b> ${tempData.item}</p>
    <p><b>จำนวน:</b> ${tempData.amount || "-"} ${tempData.unit}</p>
    <p><b>จำนวนเงิน:</b> ${Number(tempData.value).toLocaleString()} บาท</p>
    <p><b>ช่วงเวลา:</b> ${tempData.from || "-"}</p>
    ${tempData.type === "income" ? `
    <p><b>รายรับ:</b> <span style="color:green">${Number(tempData.value).toLocaleString()}</span></p>
        ` : `
        <p><b>รายจ่าย:</b> <span style="color:red">${Number(tempData.value).toLocaleString()}</span></p>
        `}
    <p><b>หมายเหตุ:</b> ${tempData.note || "-"}</p>
    `;

  document.getElementById("summary").innerHTML = summary;
  document.getElementById("confirmModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("confirmModal").style.display = "none";
}

function confirmSubmit() {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(tempData)
  })
  .then(res => res.json())
  .then(() => {
    const now = new Date();
    const formattedDate = now.toLocaleString('th-TH');

    closeModal();

    document.getElementById("successTime").innerText = formattedDate;
    document.getElementById("successModal").style.display = "flex";

    clearForm();

    // ✅ auto close success
    setTimeout(closeSuccess, 2000);
  })
  .catch(err => {
    alert("❌ เกิดข้อผิดพลาด");
    console.error(err);
  });
}

// ================= SUCCESS =================
function closeSuccess() {
  document.getElementById("successModal").style.display = "none";
}

// ================= CLEAR =================
function clearForm() {
  document.querySelectorAll("input").forEach(i => i.value = "");
}

// ================= CLOCK =================
function updateClock() {
  const now = new Date();
  document.getElementById("clock").innerText =
    now.toLocaleString('th-TH');
}

updateClock();
setInterval(updateClock, 1000);
