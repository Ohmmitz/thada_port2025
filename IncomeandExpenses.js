const API_URL = "https://script.google.com/macros/s/AKfycbyTHy97sczZP2YKB9mGR18GsszuTxIVcphS2FGkZBHyzELUGwBxenrHuvH13X3wb4eByA/exec";

let selectedCode = "INCO";
let tempData = {};

document.querySelectorAll(".tag").forEach(tag => {
  tag.addEventListener("click", () => {
    document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
    tag.classList.add("active");

    selectedCode = tag.dataset.value;
  });
});

function submitData() {
  tempData = {
    code: selectedCode,
    item: document.getElementById("item").value,
    amount: document.getElementById("amount").value,
    unit: document.getElementById("unit").value,
    from: document.getElementById("from").value,
    to: document.getElementById("to").value,
    income: document.getElementById("income").value,
    expense: document.getElementById("expense").value,
    note: document.getElementById("note").value
  };

  showSummary();
}  

function showSummary() {
    const summary = `
            <p><b>Code:</b> ${tempData.code}</p>
            <p><b>รายการ:</b> ${tempData.item}</p>
            <p><b>จำนวน:</b> ${tempData.amount} ${tempData.unit}</p>
            <p><b>ช่วงเวลา:</b> ${tempData.from} → ${tempData.to}</p>
            <p><b>รายรับ:</b> ${tempData.income}</p>
            <p><b>รายจ่าย:</b> ${tempData.expense}</p>
            <p><b>หมายเหตุ:</b> ${tempData.note}</p>
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
  .then(res => {
    const now = new Date();
    const formattedDate = now.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // ปิด popup confirm
    closeModal();

    // แสดง popup success
    document.getElementById("successTime").innerText = formattedDate;
    document.getElementById("successModal").style.display = "flex";

    clearForm();
  })
  .catch(err => {
    alert("❌ เกิดข้อผิดพลาด");
    console.error(err);
  });
}

function closeSuccess() {
  document.getElementById("successModal").style.display = "none";
}


function clearForm() {
  document.querySelectorAll("input").forEach(i => i.value = "");
}

function updateClock() {
  const now = new Date();

  const formatted = now.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  document.getElementById("clock").innerText = formatted;
}

updateClock();

setInterval(updateClock, 1000);
