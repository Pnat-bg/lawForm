export function restrictIdCard(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
  if (input.value.length > 13) {
    input.value = input.value.slice(0, 13);
  }
}

export function openTab(tabName) {
  const tabs = document.getElementsByClassName("tab-content");
  const buttons = document.getElementsByClassName("tab-btn");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
    buttons[i].classList.remove("active");
  }
  document.getElementById(tabName).classList.add("active");
  document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add("active");
  window.debouncedUpdatePreview();
}

export function createPlaintiffTab(index) {
  const container = document.getElementById("plaintiffTabsContainer");
  const tab = document.createElement("div");
  tab.className = "plaintiff-tab";
  tab.dataset.index = index;
  tab.draggable = true;
  tab.ondragstart = window.dragPlaintiffTab;
  tab.ondragover = window.allowDropPlaintiffTab;
  tab.ondrop = window.dropPlaintiffTab;
  container.appendChild(tab);
  window.updatePlaintiffTabNames();
}

export function updatePlaintiffTabNames() {
  const container = document.getElementById("plaintiffTabsContainer");
  const tabs = container.getElementsByClassName("plaintiff-tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].dataset.index = i;
    const name = tabs.length === 1 ? "โจทก์" : `โจทก์ ${i + 1}`;
    const label = "โจทก์";
    const number = tabs.length === 1 ? "" : `${i + 1}`;
    tabs[i].innerHTML = `
      <span class="drag-handle">☰</span>
      <span class="tab-label" onclick="window.selectPlaintiffTab(${i})">
        <span class="tab-name">${label}</span>
        ${number ? `<span class="tab-number">${number}</span>` : ""}
      </span>
      <button class="removeBtn" onclick="window.removePlaintiffTab(${i})">✕</button>
    `;
    tabs[i].ondragstart = window.dragPlaintiffTab;
    tabs[i].ondragover = window.allowDropPlaintiffTab;
    tabs[i].ondrop = window.dropPlaintiffTab;
  }
}

export function addPlaintiffTab() {
  const container = document.getElementById("plaintiffTabsContainer");
  const tabs = container.getElementsByClassName("plaintiff-tab");
  const index = tabs.length;

  window.plaintiffData.push({
    name: "",
    idCard: "",
    type: "individual",
    nationality: "ไทย",
    citizenship: "ไทย",
    occupation: "",
    age: "",
    houseNumber: "",
    village: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    phone: "",
    fax: "",
    email: ""
  });

  createPlaintiffTab(index);

  if (index === 0) {
    window.selectPlaintiffTab(0);
  } else {
    window.selectPlaintiffTab(index);
  }
}

export function selectPlaintiffTab(index) {
  if (window.currentPlaintiffIndex !== -1) {
    window.savePlaintiffData(window.currentPlaintiffIndex);
  }

  const tabs = document.getElementsByClassName("plaintiff-tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  const selectedTab = Array.from(tabs).find(tab => parseInt(tab.dataset.index) === index);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  window.currentPlaintiffIndex = index;
  renderPlaintiffForm(index);
}

export function savePlaintiffData(index) {
  const form = document.querySelector("#plaintiffFormContainer .plaintiff-form-content");
  if (!form) return;

  window.plaintiffData[index] = {
    name: form.querySelector("[data-field='name']")?.value || "",
    idCard: form.querySelector("[data-field='idCard']")?.value.replace(/[^0-9]/g, "") || "",
    type: form.querySelector("[data-field='type']")?.value || "individual",
    nationality: form.querySelector("[data-field='nationality']")?.value || "ไทย",
    citizenship: form.querySelector("[data-field='citizenship']")?.value || "ไทย",
    occupation: form.querySelector("[data-field='occupation']")?.value || "",
    age: form.querySelector("[data-field='age']")?.value || "",
    houseNumber: form.querySelector("[data-field='houseNumber']")?.value || "",
    village: form.querySelector("[data-field='village']")?.value || "",
    road: form.querySelector("[data-field='road']")?.value || "",
    alley: form.querySelector("[data-field='alley']")?.value || "",
    subDistrict: form.querySelector("[data-field='subDistrict']")?.value || "",
    district: form.querySelector("[data-field='district']")?.value || "",
    province: form.querySelector("[data-field='province']")?.value || "",
    postalCode: form.querySelector("[data-field='postalCode']")?.value || "",
    phone: form.querySelector("[data-field='phone']")?.value || "",
    fax: form.querySelector("[data-field='fax']")?.value || "",
    email: form.querySelector("[data-field='email']")?.value || ""
  };
}

export function renderPlaintiffForm(index) {
  const container = document.getElementById("plaintiffFormContainer");
  container.innerHTML = "";

  const form = document.createElement("div");
  form.className = "plaintiff-form-content";
  form.innerHTML = `
    <div class="form-row">
      <div class="form-field" style="flex: 2;">
        <label>ชื่อ-นามสกุล:</label>
        <input type="text" class="plaintiff-input" data-field="name" maxlength="30" value="${window.plaintiffData[index].name || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>ประเภท:</label>
        <select class="plaintiff-input" data-field="type" onchange="window.savePlaintiffData(${index}); window.updateIdLabel(${index}); window.debouncedUpdatePreview()">
          <option value="individual" ${window.plaintiffData[index].type === "individual" ? "selected" : ""}>บุคคลธรรมดา</option>
          <option value="entity" ${window.plaintiffData[index].type === "entity" ? "selected" : ""}>นิติบุคคล</option>
        </select>
      </div>
      <div class="form-field" style="flex: 1;">
        <label for="idCard">${window.plaintiffData[index].type === "entity" ? "เลขทะเบียนนิติบุคคล:" : "เลขประจำตัวประชาชน:"}</label>
        <input type="text" class="plaintiff-input" data-field="idCard" maxlength="17" value="${window.formatIdCardInputDisplay(window.plaintiffData[index].idCard || "")}" oninput="window.restrictIdCard(this); window.savePlaintiffData(${index}); window.debouncedUpdatePreview(); window.formatIdCardInput(this);" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>เชื้อชาติ:</label>
        <input type="text" class="plaintiff-input" data-field="nationality" maxlength="10" value="${window.plaintiffData[index].nationality || 'ไทย'}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>สัญชาติ:</label>
        <input type="text" class="plaintiff-input" data-field="citizenship" maxlength="10" value="${window.plaintiffData[index].citizenship || 'ไทย'}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>อาชีพ:</label>
        <input type="text" class="plaintiff-input" data-field="occupation" maxlength="20" value="${window.plaintiffData[index].occupation || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 0.3;">
        <label>อายุ:</label>
        <input type="text" class="plaintiff-input" data-field="age" maxlength="3" value="${window.plaintiffData[index].age || ""}" oninput="window.restrictNumberInput(this); window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>บ้านเลขที่:</label>
        <input type="text" class="plaintiff-input" data-field="houseNumber" maxlength="10" value="${window.plaintiffData[index].houseNumber || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 0.5;">
        <label>หมู่ที่:</label>
        <input type="text" class="plaintiff-input" data-field="village" maxlength="2" value="${window.plaintiffData[index].village || ""}" oninput="window.restrictNumberInput(this); window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>ถนน:</label>
        <input type="text" class="plaintiff-input" data-field="road" maxlength="20" value="${window.plaintiffData[index].road || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1.5;">
        <label>ตรอก/ซอย:</label>
        <input type="text" class="plaintiff-input" data-field="alley" maxlength="20" value="${window.plaintiffData[index].alley || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1.5;">
        <label>ตำบล/แขวง:</label>
        <input type="text" class="plaintiff-input" data-field="subDistrict" maxlength="20" value="${window.plaintiffData[index].subDistrict || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>เขต/อำเภอ:</label>
        <input type="text" class="plaintiff-input" data-field="district" maxlength="20" value="${window.plaintiffData[index].district || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>จังหวัด:</label>
        <input type="text" list="provinceList" class="plaintiff-input" data-field="province" maxlength="20" value="${window.plaintiffData[index].province || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
        <datalist id="provinceList">
          ${provinces.map(prov => `<option value="${prov}">`).join('')}
        </datalist>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>รหัสไปรษณีย์:</label>
        <input type="text" class="plaintiff-input" data-field="postalCode" maxlength="5" value="${window.plaintiffData[index].postalCode || ""}" oninput="window.restrictNumberInput(this); window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>โทรศัพท์:</label>
        <input type="text" class="plaintiff-input" data-field="phone" maxlength="10" value="${window.plaintiffData[index].phone || ""}" oninput="window.restrictNumberInput(this); window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>โทรสาร:</label>
        <input type="text" class="plaintiff-input" data-field="fax" maxlength="10" value="${window.plaintiffData[index].fax || ""}" oninput="window.restrictNumberInput(this); window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>ไปรษณีย์อิเล็กทรอนิกส์:</label>
        <input type="text" class="plaintiff-input" data-field="email" maxlength="50" value="${window.plaintiffData[index].email || ""}" oninput="window.savePlaintiffData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
  `;
  container.appendChild(form);
}

window.updateIdLabel = function(index) {
  const form = document.querySelector("#plaintiffFormContainer .plaintiff-form-content");
  if (!form) return;
  const type = window.plaintiffData[index].type || "individual";
  const idLabel = form.querySelector("label[for='idCard']");
  idLabel.textContent = type === "individual" ? "เลขประจำตัวประชาชน:" : "เลขทะเบียนนิติบุคคล:";
};

window.formatIdCardInput = function(input) {
  let value = input.value.replace(/[^0-9]/g, "");
  if (value.length > 13) value = value.slice(0, 13);
  let formatted = "";
  if (value.length > 0) formatted += value[0];
  if (value.length > 1) formatted += "-" + value.slice(1, Math.min(5, value.length));
  if (value.length > 5) formatted += "-" + value.slice(5, Math.min(10, value.length));
  if (value.length > 10) formatted += "-" + value.slice(10, Math.min(12, value.length));
  if (value.length > 12) formatted += "-" + value[12];
  input.value = formatted;
};

window.formatIdCardInputDisplay = function(id) {
  if (!id || id.length !== 13) return id || "";
  return `${id[0]}-${id.slice(1, 5)}-${id.slice(5, 10)}-${id.slice(10, 12)}-${id[12]}`;
};

window.restrictNumberInput = function(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
};

const provinces = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา",
  "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก",
  "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน",
  "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา",
  "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "พะเยา", "ภูเก็ต",
  "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยะลา", "ยโสธร", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
  "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี",
  "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อุดรธานี", "อุทัยธานี", "อุตรดิตถ์", "อุบลราชธานี",
  "อำนาจเจริญ"
];

export function removePlaintiffTab(index) {
  const tabsContainer = document.getElementById("plaintiffTabsContainer");
  const tabs = tabsContainer.getElementsByClassName("plaintiff-tab");
  if (tabs.length <= 1) return;

  window.plaintiffData.splice(index, 1);

  for (let i = 0; i < tabs.length; i++) {
    if (parseInt(tabs[i].dataset.index) === index) {
      tabs[i].remove();
      break;
    }
  }

  window.updatePlaintiffTabNames();

  if (window.currentPlaintiffIndex >= window.plaintiffData.length) {
    window.currentPlaintiffIndex = window.plaintiffData.length - 1;
  } else if (window.currentPlaintiffIndex === index) {
    window.currentPlaintiffIndex = Math.max(0, index - 1);
  } else if (window.currentPlaintiffIndex > index) {
    window.currentPlaintiffIndex--;
  }

  if (window.plaintiffData.length > 0) {
    window.selectPlaintiffTab(window.currentPlaintiffIndex);
  } else {
    window.currentPlaintiffIndex = -1;
    document.getElementById("plaintiffFormContainer").innerHTML = "";
  }

  window.debouncedUpdatePreview();
}

export function createDefendantTab(index) {
  const container = document.getElementById("defendantTabsContainer");
  const tab = document.createElement("div");
  tab.className = "defendant-tab";
  tab.dataset.index = index;
  tab.draggable = true;
  tab.ondragstart = window.dragDefendantTab;
  tab.ondragover = window.allowDropDefendantTab;
  tab.ondrop = window.dropDefendantTab;
  container.appendChild(tab);
  window.updateDefendantTabNames();
}

export function updateDefendantTabNames() {
  const container = document.getElementById("defendantTabsContainer");
  const tabs = container.getElementsByClassName("defendant-tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].dataset.index = i;
    const name = tabs.length === 1 ? "จำเลย" : `จำเลย ${i + 1}`;
    const label = "จำเลย";
    const number = tabs.length === 1 ? "" : `${i + 1}`;
    tabs[i].innerHTML = `
      <span class="drag-handle">☰</span>
      <span class="tab-label" onclick="window.selectDefendantTab(${i})">
        <span class="tab-name">${label}</span>
        ${number ? `<span class="tab-number">${number}</span>` : ""}
      </span>
      <button class="removeBtn" onclick="window.removeDefendantTab(${i})">✕</button>
    `;
    tabs[i].ondragstart = window.dragDefendantTab;
    tabs[i].ondragover = window.allowDropDefendantTab;
    tabs[i].ondrop = window.dropDefendantTab;
  }
}

export function addDefendantTab() {
  const container = document.getElementById("defendantTabsContainer");
  const tabs = container.getElementsByClassName("defendant-tab");
  const index = tabs.length;

  window.defendantData.push({
    name: "",
    idCard: "",
    type: "individual",
    nationality: "ไทย",
    citizenship: "ไทย",
    occupation: "",
    age: "",
    houseNumber: "",
    village: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    phone: "",
    fax: "",
    email: ""
  });

  createDefendantTab(index);

  if (index === 0) {
    window.selectDefendantTab(0);
  } else {
    window.selectDefendantTab(index);
  }
}

export function selectDefendantTab(index) {
  if (window.currentDefendantIndex !== -1) {
    window.saveDefendantData(window.currentDefendantIndex);
  }

  const tabs = document.getElementsByClassName("defendant-tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  const selectedTab = Array.from(tabs).find(tab => parseInt(tab.dataset.index) === index);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  window.currentDefendantIndex = index;
  renderDefendantForm(index);
}

export function saveDefendantData(index) {
  const form = document.querySelector("#defendantFormContainer .defendant-form-content");
  if (!form) return;

  window.defendantData[index] = {
    name: form.querySelector("[data-field='name']")?.value || "",
    idCard: form.querySelector("[data-field='idCard']")?.value.replace(/[^0-9]/g, "") || "",
    type: form.querySelector("[data-field='type']")?.value || "individual",
    nationality: form.querySelector("[data-field='nationality']")?.value || "ไทย",
    citizenship: form.querySelector("[data-field='citizenship']")?.value || "ไทย",
    occupation: form.querySelector("[data-field='occupation']")?.value || "",
    age: form.querySelector("[data-field='age']")?.value || "",
    houseNumber: form.querySelector("[data-field='houseNumber']")?.value || "",
    village: form.querySelector("[data-field='village']")?.value || "",
    road: form.querySelector("[data-field='road']")?.value || "",
    alley: form.querySelector("[data-field='alley']")?.value || "",
    subDistrict: form.querySelector("[data-field='subDistrict']")?.value || "",
    district: form.querySelector("[data-field='district']")?.value || "",
    province: form.querySelector("[data-field='province']")?.value || "",
    postalCode: form.querySelector("[data-field='postalCode']")?.value || "",
    phone: form.querySelector("[data-field='phone']")?.value || "",
    fax: form.querySelector("[data-field='fax']")?.value || "",
    email: form.querySelector("[data-field='email']")?.value || ""
  };
}

export function renderDefendantForm(index) {
  const container = document.getElementById("defendantFormContainer");
  container.innerHTML = "";

  const form = document.createElement("div");
  form.className = "defendant-form-content";
  form.innerHTML = `
    <div class="form-row">
      <div class="form-field" style="flex: 2;">
        <label>ชื่อ-นามสกุล:</label>
        <input type="text" class="defendant-input" data-field="name" maxlength="30" value="${window.defendantData[index].name || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>ประเภท:</label>
        <select class="defendant-input" data-field="type" onchange="window.saveDefendantData(${index}); window.updateDefendantIdLabel(${index}); window.debouncedUpdatePreview()">
          <option value="individual" ${window.defendantData[index].type === "individual" ? "selected" : ""}>บุคคลธรรมดา</option>
          <option value="entity" ${window.defendantData[index].type === "entity" ? "selected" : ""}>นิติบุคคล</option>
        </select>
      </div>
      <div class="form-field" style="flex: 1;">
        <label for="idCard">${window.defendantData[index].type === "entity" ? "เลขทะเบียนนิติบุคคล:" : "เลขประจำตัวประชาชน:"}</label>
        <input type="text" class="defendant-input" data-field="idCard" maxlength="17" value="${window.formatIdCardInputDisplay(window.defendantData[index].idCard || "")}" oninput="window.restrictIdCard(this); window.saveDefendantData(${index}); window.debouncedUpdatePreview(); window.formatIdCardInput(this);" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>เชื้อชาติ:</label>
        <input type="text" class="defendant-input" data-field="nationality" maxlength="10" value="${window.defendantData[index].nationality || 'ไทย'}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>สัญชาติ:</label>
        <input type="text" class="defendant-input" data-field="citizenship" maxlength="10" value="${window.defendantData[index].citizenship || 'ไทย'}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>อาชีพ:</label>
        <input type="text" class="defendant-input" data-field="occupation" maxlength="20" value="${window.defendantData[index].occupation || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 0.3;">
        <label>อายุ:</label>
        <input type="text" class="defendant-input" data-field="age" maxlength="3" value="${window.defendantData[index].age || ""}" oninput="window.restrictNumberInput(this); window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>บ้านเลขที่:</label>
        <input type="text" class="defendant-input" data-field="houseNumber" maxlength="10" value="${window.defendantData[index].houseNumber || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 0.5;">
        <label>หมู่ที่:</label>
        <input type="text" class="defendant-input" data-field="village" maxlength="2" value="${window.defendantData[index].village || ""}" oninput="window.restrictNumberInput(this); window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>ถนน:</label>
        <input type="text" class="defendant-input" data-field="road" maxlength="20" value="${window.defendantData[index].road || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1.5;">
        <label>ตรอก/ซอย:</label>
        <input type="text" class="defendant-input" data-field="alley" maxlength="20" value="${window.defendantData[index].alley || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1.5;">
        <label>ตำบล/แขวง:</label>
        <input type="text" class="defendant-input" data-field="subDistrict" maxlength="20" value="${window.defendantData[index].subDistrict || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>เขต/อำเภอ:</label>
        <input type="text" class="defendant-input" data-field="district" maxlength="20" value="${window.defendantData[index].district || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 1;">
        <label>จังหวัด:</label>
        <input type="text" list="provinceList" class="defendant-input" data-field="province" maxlength="20" value="${window.defendantData[index].province || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
        <datalist id="provinceList">
          ${provinces.map(prov => `<option value="${prov}">`).join('')}
        </datalist>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>รหัสไปรษณีย์:</label>
        <input type="text" class="defendant-input" data-field="postalCode" maxlength="5" value="${window.defendantData[index].postalCode || ""}" oninput="window.restrictNumberInput(this); window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>โทรศัพท์:</label>
        <input type="text" class="defendant-input" data-field="phone" maxlength="10" value="${window.defendantData[index].phone || ""}" oninput="window.restrictNumberInput(this); window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 1;">
        <label>โทรสาร:</label>
        <input type="text" class="defendant-input" data-field="fax" maxlength="10" value="${window.defendantData[index].fax || ""}" oninput="window.restrictNumberInput(this); window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
      <div class="form-field" style="flex: 2;">
        <label>ไปรษณีย์อิเล็กทรอนิกส์:</label>
        <input type="text" class="defendant-input" data-field="email" maxlength="50" value="${window.defendantData[index].email || ""}" oninput="window.saveDefendantData(${index}); window.debouncedUpdatePreview()" autocomplete="off">
      </div>
    </div>
  `;
  container.appendChild(form);
}

export function removeDefendantTab(index) {
  const tabsContainer = document.getElementById("defendantTabsContainer");
  const tabs = tabsContainer.getElementsByClassName("defendant-tab");
  if (tabs.length <= 1) return;

  window.defendantData.splice(index, 1);

  for (let i = 0; i < tabs.length; i++) {
    if (parseInt(tabs[i].dataset.index) === index) {
      tabs[i].remove();
      break;
    }
  }

  window.updateDefendantTabNames();

  if (window.currentDefendantIndex >= window.defendantData.length) {
    window.currentDefendantIndex = window.defendantData.length - 1;
  } else if (window.currentDefendantIndex === index) {
    window.currentDefendantIndex = Math.max(0, index - 1);
  } else if (window.currentDefendantIndex > index) {
    window.currentDefendantIndex--;
  }

  if (window.defendantData.length > 0) {
    window.selectDefendantTab(window.currentDefendantIndex);
  } else {
    window.currentDefendantIndex = -1;
    document.getElementById("defendantFormContainer").innerHTML = "";
  }

  window.debouncedUpdatePreview();
}

window.updateDefendantIdLabel = function(index) {
  const form = document.querySelector("#defendantFormContainer .defendant-form-content");
  if (!form) return;
  const type = window.defendantData[index].type || "individual";
  const idLabel = form.querySelector("label[for='idCard']");
  idLabel.textContent = type === "individual" ? "เลขประจำตัวประชาชน:" : "เลขทะเบียนนิติบุคคล:";
};