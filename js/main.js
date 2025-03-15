import { 
  openTab, 
  addPlaintiffTab, 
  selectPlaintiffTab, 
  removePlaintiffTab, 
  savePlaintiffData, 
  renderPlaintiffForm, 
  updatePlaintiffTabNames, 
  addDefendantTab,
  selectDefendantTab, 
  removeDefendantTab, 
  saveDefendantData, 
  renderDefendantForm, 
  updateDefendantTabNames, 
  restrictIdCard,
  createPlaintiffTab,
  createDefendantTab
} from './uiManager.js';

import { 
  generatePDF, 
  getCurrentThaiDate, 
  convertArabicToThai 
} from './pdfUtils.js';

import { 
  dragPlaintiffTab, 
  allowDropPlaintiffTab, 
  dropPlaintiffTab,
  dragDefendantTab,
  allowDropDefendantTab,
  dropDefendantTab
} from './eventHandlers.js';

import { 
  updatePreview, 
  downloadPDF, 
  debounce 
} from './preview.js';

// === ตัวแปร global ===
window.cachedTemplateArrayBuffer = null;
window.cachedFont = null;
window.currentPlaintiffIndex = -1;
window.plaintiffData = [];
window.lastValidDate = getCurrentThaiDate();
window.defendantData = [];
window.currentDefendantIndex = -1;
window.requestCount = 1;
window.criminalRequestCount = 1;

// === กำหนดฟังก์ชัน global ===
window.openTab = openTab;
window.addPlaintiffTab = addPlaintiffTab;
window.selectPlaintiffTab = selectPlaintiffTab;
window.removePlaintiffTab = removePlaintiffTab;
window.addDefendantTab = addDefendantTab;
window.removeDefendantTab = removeDefendantTab;
window.updateDefendantTabLabels = updateDefendantTabNames;
window.restrictIdCard = restrictIdCard;
window.updatePlaintiffTabNames = updatePlaintiffTabNames;
window.savePlaintiffData = savePlaintiffData;
window.renderPlaintiffForm = renderPlaintiffForm;
window.generatePDF = generatePDF;
window.getCurrentThaiDate = getCurrentThaiDate;
window.convertArabicToThai = convertArabicToThai;
window.dragPlaintiffTab = dragPlaintiffTab;
window.allowDropPlaintiffTab = allowDropPlaintiffTab;
window.dropPlaintiffTab = dropPlaintiffTab;
window.dragDefendantTab = dragDefendantTab;
window.allowDropDefendantTab = allowDropDefendantTab;
window.dropDefendantTab = dropDefendantTab;
window.updatePreview = updatePreview;
window.downloadPDF = downloadPDF;
window.debouncedUpdatePreview = debounce(() => {
  saveFormData();
  updatePreview();
}, 300);
window.addDefendantTab = addDefendantTab;
window.selectDefendantTab = selectDefendantTab;
window.removeDefendantTab = removeDefendantTab;
window.saveDefendantData = saveDefendantData;
window.renderDefendantForm = renderDefendantForm;
window.updateDefendantTabNames = updateDefendantTabNames;

function autoResizeTextarea(textarea) {
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function initializeRequestInputs() {
  const requestInputs = document.querySelectorAll(".civil-request-input, .criminal-request-input, #criminalLawInput");
  requestInputs.forEach((textarea) => {
    autoResizeTextarea(textarea);
    textarea.addEventListener("input", () => {
      autoResizeTextarea(textarea);
      window.debouncedUpdatePreview();
    });
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        textarea.value = value.substring(0, start) + "\t" + value.substring(end);
        const newPosition = start + 1;
        textarea.selectionStart = textarea.selectionEnd = newPosition;
        autoResizeTextarea(textarea);
        window.debouncedUpdatePreview();
      }
    });
  });
}

function saveFormData() {
  const formData = {
    caseNumber: document.getElementById("caseNumberInput").value,
    court: document.getElementById("courtInput").value,
    date: document.getElementById("dateInput").value,
    caseType: document.getElementById("caseTypeInput").value,
    charge: document.getElementById("chargeInput").value,
    amountBaht: document.getElementById("amountBahtInput").value,
    amountSatang: document.getElementById("amountSatangInput").value,
    complaintContent: document.getElementById("complaintContentInput").value,
    requestType: document.getElementById("requestType").value,
    requestCopies: document.getElementById("requestCopiesInput").value,
    plaintiffOrLawyerName: document.getElementById("plaintiffOrLawyerNameInput").value,
    plaintiffOrLawyerType: document.getElementById("plaintiffOrLawyerTypeSelect").value,
    criminalPlaintiffOrLawyerName: document.getElementById("criminalPlaintiffOrLawyerNameInput").value,
    criminalPlaintiffOrLawyerType: document.getElementById("criminalPlaintiffOrLawyerTypeSelect").value,
    summonWord: document.getElementById("summonWordInput").value,
    criminalLaw: document.getElementById("criminalLawInput").value,
    plaintiffs: window.plaintiffData,
    defendants: window.defendantData,
    civilRequests: getCivilRequestsData(),
    criminalRequests: getCriminalRequestsData()
  };
  localStorage.setItem("complaintFormData", JSON.stringify(formData));
}

function getCivilRequestsData() {
  const requests = [];
  const requestItems = document.querySelectorAll("#civilRequestItems .request-item");
  requestItems.forEach(item => {
    requests.push(item.querySelector(".civil-request-input").value);
  });
  return requests;
}

function getCriminalRequestsData() {
  const requests = [];
  const requestItems = document.querySelectorAll("#criminalRequestItems .request-item");
  requestItems.forEach(item => {
    requests.push(item.querySelector(".criminal-request-input").value);
  });
  return requests;
}

function loadFormData() {
  const savedData = localStorage.getItem("complaintFormData");
  if (savedData) {
    const formData = JSON.parse(savedData);

    document.getElementById("caseNumberInput").value = formData.caseNumber || "";
    document.getElementById("courtInput").value = formData.court || "";
    document.getElementById("dateInput").value = formData.date || window.lastValidDate;
    document.getElementById("caseTypeInput").value = formData.caseType || "";
    document.getElementById("chargeInput").value = formData.charge || "";
    document.getElementById("amountBahtInput").value = formData.amountBaht || "";
    document.getElementById("amountSatangInput").value = formData.amountSatang || "";
    document.getElementById("complaintContentInput").value = formData.complaintContent || "";
    document.getElementById("requestType").value = formData.requestType || "civil";
    document.getElementById("requestCopiesInput").value = formData.requestCopies || "";
    document.getElementById("plaintiffOrLawyerNameInput").value = formData.plaintiffOrLawyerName || "";
    document.getElementById("plaintiffOrLawyerTypeSelect").value = formData.plaintiffOrLawyerType || "ทนายโจทก์";
    document.getElementById("criminalPlaintiffOrLawyerNameInput").value = formData.criminalPlaintiffOrLawyerName || "";
    document.getElementById("criminalPlaintiffOrLawyerTypeSelect").value = formData.criminalPlaintiffOrLawyerType || "ทนายโจทก์";
    document.getElementById("summonWordInput").value = formData.summonWord || "";
    document.getElementById("criminalLawInput").value = formData.criminalLaw || "";

    window.plaintiffData = formData.plaintiffs || [];
    document.getElementById("plaintiffTabsContainer").innerHTML = "";
    if (window.plaintiffData.length > 0) {
      window.plaintiffData.forEach((plaintiff, index) => {
        createPlaintiffTab(index);
        renderPlaintiffForm(index);
      });
      selectPlaintiffTab(0);
    }

    window.defendantData = formData.defendants || [];
    document.getElementById("defendantTabsContainer").innerHTML = "";
    if (window.defendantData.length > 0) {
      window.defendantData.forEach((defendant, index) => {
        createDefendantTab(index);
        renderDefendantForm(index);
      });
      selectDefendantTab(0);
    }

    if (formData.civilRequests && formData.civilRequests.length > 0) {
      document.getElementById("civilRequestItems").innerHTML = "";
      window.requestCount = 0;
      formData.civilRequests.forEach(request => {
        addRequestItem();
        const item = document.querySelectorAll("#civilRequestItems .request-item")[window.requestCount - 1];
        item.querySelector(".civil-request-input").value = request || "";
      });
    }

    if (formData.criminalRequests && formData.criminalRequests.length > 0) {
      document.getElementById("criminalRequestItems").innerHTML = "<h3>คำขอ</h3>";
      window.criminalRequestCount = 0;
      formData.criminalRequests.forEach(request => {
        addCriminalRequestItem();
        const item = document.querySelectorAll("#criminalRequestItems .request-item")[window.criminalRequestCount - 1];
        item.querySelector(".criminal-request-input").value = request || "";
      });
    }

    toggleRequestForm();
    initializeRequestInputs();
    updatePreview();
  } else {
    window.plaintiffData = [];
    window.defendantData = [];
    document.getElementById("plaintiffTabsContainer").innerHTML = "";
    document.getElementById("defendantTabsContainer").innerHTML = "";
    initializeRequestInputs();
    updatePreview();
  }
}

window.addRequestItem = function() {
  window.requestCount++;
  const requestItems = document.getElementById('civilRequestItems');
  const newItem = document.createElement('div');
  newItem.classList.add('request-item', 'form-field');
  newItem.setAttribute('data-index', window.requestCount);
  newItem.innerHTML = `
    <div class="request-header">
      <label>ข้อ ${window.requestCount}:</label>
      <button class="removeRequestBtn" onclick="removeRequestItem(this)">ลบ</button>
    </div>
    <textarea class="civil-request-input" placeholder="กรุณากรอกคำขอ เช่น ขอให้จำเลยชดใช้เงิน 100,000 บาท" oninput="debouncedUpdatePreview()"></textarea>
  `;
  requestItems.appendChild(newItem);
  
  const newTextarea = newItem.querySelector(".civil-request-input");
  autoResizeTextarea(newTextarea);
  newTextarea.addEventListener("input", () => {
    autoResizeTextarea(newTextarea);
    window.debouncedUpdatePreview();
  });
  newTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = newTextarea.selectionStart;
      const end = newTextarea.selectionEnd;
      const value = newTextarea.value;
      newTextarea.value = value.substring(0, start) + "\t" + value.substring(end);
      const newPosition = start + 1;
      newTextarea.selectionStart = newTextarea.selectionEnd = newPosition;
      autoResizeTextarea(newTextarea);
      window.debouncedUpdatePreview();
    }
  });
  window.debouncedUpdatePreview();
};

window.removeRequestItem = function(button) {
  const requestItem = button.closest('.request-item');
  requestItem.remove();
  updateRequestNumbers();
  window.debouncedUpdatePreview();
};

function updateRequestNumbers() {
  const requestItems = document.querySelectorAll('#civilRequestItems .request-item');
  window.requestCount = requestItems.length;
  requestItems.forEach((item, index) => {
    const label = item.querySelector('label');
    label.textContent = `ข้อ ${index + 1}:`;
    item.setAttribute('data-index', index + 1);
  });
}

window.addCriminalRequestItem = function() {
  window.criminalRequestCount++;
  const requestItems = document.getElementById('criminalRequestItems');
  const newItem = document.createElement('div');
  newItem.classList.add('request-item', 'form-field');
  newItem.setAttribute('data-index', window.criminalRequestCount);
  newItem.innerHTML = `
    <div class="request-header">
      <label>ข้อ ${window.criminalRequestCount}:</label>
      <button class="removeRequestBtn" onclick="removeCriminalRequestItem(this)">ลบ</button>
    </div>
    <textarea class="criminal-request-input" placeholder="กรุณากรอกคำขอ เช่น ขอให้ลงโทษจำเลยตามกฎหมาย" oninput="debouncedUpdatePreview()"></textarea>
  `;
  requestItems.appendChild(newItem);
  
  const newTextarea = newItem.querySelector(".criminal-request-input");
  autoResizeTextarea(newTextarea);
  newTextarea.addEventListener("input", () => {
    autoResizeTextarea(newTextarea);
    window.debouncedUpdatePreview();
  });
  newTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = newTextarea.selectionStart;
      const end = newTextarea.selectionEnd;
      const value = newTextarea.value;
      newTextarea.value = value.substring(0, start) + "\t" + value.substring(end);
      const newPosition = start + 1;
      newTextarea.selectionStart = newTextarea.selectionEnd = newPosition;
      autoResizeTextarea(newTextarea);
      window.debouncedUpdatePreview();
    }
  });
  window.debouncedUpdatePreview();
};

window.removeCriminalRequestItem = function(button) {
  const requestItem = button.closest('.request-item');
  requestItem.remove();
  updateCriminalRequestNumbers();
  window.debouncedUpdatePreview();
};

function updateCriminalRequestNumbers() {
  const requestItems = document.querySelectorAll('#criminalRequestItems .request-item');
  window.criminalRequestCount = requestItems.length;
  requestItems.forEach((item, index) => {
    const label = item.querySelector('label');
    label.textContent = `ข้อ ${index + 1}:`;
    item.setAttribute('data-index', index + 1);
  });
};

window.toggleRequestForm = function() {
  const requestType = document.getElementById('requestType').value;
  const civilForm = document.getElementById('civilRequestForm');
  const criminalForm = document.getElementById('criminalRequestForm');

  if (requestType === 'civil') {
    civilForm.classList.add('active');
    criminalForm.classList.remove('active');
  } else {
    civilForm.classList.remove('active');
    criminalForm.classList.add('active');
  }
  window.debouncedUpdatePreview();
};

window.resetForm = function() {
  localStorage.removeItem("complaintFormData");
  document.querySelectorAll("input, textarea, select").forEach(element => {
    if (element.tagName === "SELECT") {
      element.selectedIndex = 0;
    } else if (element.id === "dateInput") {
      element.value = getCurrentThaiDate();
    } else {
      element.value = "";
    }
  });
  window.plaintiffData = [];
  window.defendantData = [];
  document.getElementById("plaintiffTabsContainer").innerHTML = "";
  document.getElementById("defendantTabsContainer").innerHTML = "";
  document.getElementById("civilRequestItems").innerHTML = "";
  document.getElementById("criminalRequestItems").innerHTML = "<h3>คำขอ</h3>";
  window.requestCount = 0;
  window.criminalRequestCount = 0;
  addPlaintiffTab();
  addDefendantTab();
  addRequestItem();
  addCriminalRequestItem();
  toggleRequestForm();
  updatePreview();
};

window.onload = function() {
  flatpickr("#dateInput", {
    dateFormat: "d/m/Y",
    minDate: "01/01/2400",
    maxDate: "31/12/2600",
    defaultDate: window.lastValidDate,
    allowInput: false,
    clickOpens: true,
    locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
        longhand: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"],
      },
      months: {
        shorthand: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
        longhand: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
      },
    },
    onChange: function(selectedDates, dateStr) {
      window.lastValidDate = dateStr;
      window.debouncedUpdatePreview();
    }
  });

  document.getElementById("courtInput").addEventListener("input", window.debouncedUpdatePreview);
  document.getElementById("caseTypeInput").addEventListener("input", window.debouncedUpdatePreview);
  document.getElementById("chargeInput").addEventListener("input", window.debouncedUpdatePreview);
  document.getElementById("caseNumberInput").addEventListener("input", window.debouncedUpdatePreview);
  document.getElementById("amountBahtInput").addEventListener("input", window.debouncedUpdatePreview);
  document.getElementById("amountSatangInput").addEventListener("input", window.debouncedUpdatePreview);

  // เพิ่ม event listener สำหรับการลากและวาง
  const plaintiffContainer = document.getElementById("plaintiffTabsContainer");
  const defendantContainer = document.getElementById("defendantTabsContainer");
  plaintiffContainer.addEventListener("dragover", window.allowDropPlaintiffTab);
  defendantContainer.addEventListener("dragover", window.allowDropDefendantTab);

  loadFormData();
};