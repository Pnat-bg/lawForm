// pdfUtils.js
export async function generatePDF() {
  const { PDFDocument, rgb } = PDFLib;

  try {
    await loadResources();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(window.fontkit);
    const font = await pdfDoc.embedFont(window.cachedFont);
    const garudaSealImage = await pdfDoc.embedPng(window.cachedGarudaSeal);
    const curlyBracesImage = await pdfDoc.embedPng(window.cachedCurlyBraces);

    const firstPage = pdfDoc.addPage([595.28, 841.89]);
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const garudaSealWidth = 90;
    const garudaSealHeight = 90;
    const garudaSealX = (pageWidth - garudaSealWidth) / 2;
    const garudaSealY = 725;
    firstPage.drawImage(garudaSealImage, {
      x: garudaSealX,
      y: garudaSealY,
      width: garudaSealWidth,
      height: garudaSealHeight,
    });

    const curlyBracesWidth = 80;
    const curlyBracesHeight = 80;
    const curlyBracesX = 67;
    const curlyBracesY = 483;
    firstPage.drawImage(curlyBracesImage, {
      x: curlyBracesX,
      y: curlyBracesY,
      width: curlyBracesWidth,
      height: curlyBracesHeight,
    });

    let caseNumberInput = document.getElementById("caseNumberInput")?.value || "";
    const court = document.getElementById("courtInput")?.value || "";
    let dateInput = document.getElementById("dateInput")?.value || window.lastValidDate;
    const caseTypeInput = document.getElementById("caseTypeInput")?.value || "";
    const chargeInput = document.getElementById("chargeInput")?.value || "";
    const amountBahtInput = document.getElementById("amountBahtInput")?.value || "";
    const amountSatangInput = document.getElementById("amountSatangInput")?.value || "";
    const complaintContent = document.getElementById("complaintContentInput")?.value || "";
    const complaintContentThai = window.convertArabicToThai(complaintContent);

    let caseNumber = "";
    let caseYear = "";
    if (caseNumberInput.trim()) {
      const parts = caseNumberInput.split("/");
      caseNumber = parts[0] || "";
      caseYear = parts[1] ? parts[1].slice(-2) : "";
    } else {
      const [_, __, yearBE] = dateInput.split("/");
      caseYear = yearBE.slice(-2);
    }

    caseNumber = window.convertArabicToThai(caseNumber);
    caseYear = window.convertArabicToThai(caseYear);

    const [dayNum, monthNum, yearBE] = dateInput.split("/");
    const day = window.convertArabicToThai(parseInt(dayNum).toString());
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const month = monthNames[parseInt(monthNum) - 1];
    const year = window.convertArabicToThai(yearBE.slice(-2));

    if (window.currentPlaintiffIndex !== -1) {
      window.savePlaintiffData(window.currentPlaintiffIndex);
    }
    if (window.currentDefendantIndex !== -1) {
      window.saveDefendantData(window.currentDefendantIndex);
    }

    // ข้อมูลโจทก์
    let plaintiffs = window.plaintiffData.map(data => window.convertArabicToThai(data.name || ""));
    let plaintiffIdCards = window.plaintiffData.map(data => data.idCard || "");
    let plaintiffTypes = window.plaintiffData.map(data => data.type || "individual");
    let plaintiffNationalities = window.plaintiffData.map(data => window.convertArabicToThai(data.nationality || ""));
    let plaintiffCitizenships = window.plaintiffData.map(data => window.convertArabicToThai(data.citizenship || ""));
    let plaintiffOccupations = window.plaintiffData.map(data => window.convertArabicToThai(data.occupation || ""));
    let plaintiffAges = window.plaintiffData.map(data => window.convertArabicToThai(data.age || ""));
    let plaintiffHouseNumbers = window.plaintiffData.map(data => window.convertArabicToThai(data.houseNumber || ""));
    let plaintiffVillages = window.plaintiffData.map(data => window.convertArabicToThai(data.village || ""));
    let plaintiffRoads = window.plaintiffData.map(data => window.convertArabicToThai(data.road || ""));
    let plaintiffAlleys = window.plaintiffData.map(data => window.convertArabicToThai(data.alley || ""));
    let plaintiffSubDistricts = window.plaintiffData.map(data => window.convertArabicToThai(data.subDistrict || ""));
    let plaintiffDistricts = window.plaintiffData.map(data => window.convertArabicToThai(data.district || ""));
    let plaintiffProvinces = window.plaintiffData.map(data => window.convertArabicToThai(data.province || ""));
    let plaintiffPostalCodes = window.plaintiffData.map(data => window.convertArabicToThai(data.postalCode || ""));
    let plaintiffPhones = window.plaintiffData.map(data => window.convertArabicToThai(data.phone || ""));
    let plaintiffFaxes = window.plaintiffData.map(data => window.convertArabicToThai(data.fax || ""));
    let plaintiffEmails = window.plaintiffData.map(data => window.convertArabicToThai(data.email || ""));

    if (plaintiffs.length === 0) {
      plaintiffs.push("");
      plaintiffIdCards.push("");
      plaintiffTypes.push("individual");
      plaintiffNationalities.push("");
      plaintiffCitizenships.push("");
      plaintiffOccupations.push("");
      plaintiffAges.push("");
      plaintiffHouseNumbers.push("");
      plaintiffVillages.push("");
      plaintiffRoads.push("");
      plaintiffAlleys.push("");
      plaintiffSubDistricts.push("");
      plaintiffDistricts.push("");
      plaintiffProvinces.push("");
      plaintiffPostalCodes.push("");
      plaintiffPhones.push("");
      plaintiffFaxes.push("");
      plaintiffEmails.push("");
    }

    const plaintiffText = plaintiffs.length === 1 
      ? plaintiffs[0] 
      : plaintiffs.map((name, idx) => `${name}${name ? ` ที่ ${window.convertArabicToThai((idx + 1).toString())}` : ""}`).join(", ");

    let plaintiffIdCardText = plaintiffIdCards.length > 0 ? plaintiffIdCards[0].replace(/[^0-9]/g, "") : "";
    let formattedPlaintiffIdCard = window.convertArabicToThai(plaintiffIdCardText);
    const plaintiffIdCardTextArray = formattedPlaintiffIdCard.split("");

    // ข้อมูลจำเลย
    let defendants = window.defendantData.map(data => window.convertArabicToThai(data.name || ""));
    let defendantIdCards = window.defendantData.map(data => data.idCard || "");
    let defendantTypes = window.defendantData.map(data => data.type || "individual");
    let defendantNationalities = window.defendantData.map(data => window.convertArabicToThai(data.nationality || ""));
    let defendantCitizenships = window.defendantData.map(data => window.convertArabicToThai(data.citizenship || ""));
    let defendantOccupations = window.defendantData.map(data => window.convertArabicToThai(data.occupation || ""));
    let defendantAges = window.defendantData.map(data => window.convertArabicToThai(data.age || ""));
    let defendantHouseNumbers = window.defendantData.map(data => window.convertArabicToThai(data.houseNumber || ""));
    let defendantVillages = window.defendantData.map(data => window.convertArabicToThai(data.village || ""));
    let defendantRoads = window.defendantData.map(data => window.convertArabicToThai(data.road || ""));
    let defendantAlleys = window.defendantData.map(data => window.convertArabicToThai(data.alley || ""));
    let defendantSubDistricts = window.defendantData.map(data => window.convertArabicToThai(data.subDistrict || ""));
    let defendantDistricts = window.defendantData.map(data => window.convertArabicToThai(data.district || ""));
    let defendantProvinces = window.defendantData.map(data => window.convertArabicToThai(data.province || ""));
    let defendantPostalCodes = window.defendantData.map(data => window.convertArabicToThai(data.postalCode || ""));
    let defendantPhones = window.defendantData.map(data => window.convertArabicToThai(data.phone || ""));
    let defendantFaxes = window.defendantData.map(data => window.convertArabicToThai(data.fax || ""));
    let defendantEmails = window.defendantData.map(data => window.convertArabicToThai(data.email || ""));

    if (defendants.length === 0) {
      defendants.push("");
      defendantIdCards.push("");
      defendantTypes.push("individual");
      defendantNationalities.push("");
      defendantCitizenships.push("");
      defendantOccupations.push("");
      defendantAges.push("");
      defendantHouseNumbers.push("");
      defendantVillages.push("");
      defendantRoads.push("");
      defendantAlleys.push("");
      defendantSubDistricts.push("");
      defendantDistricts.push("");
      defendantProvinces.push("");
      defendantPostalCodes.push("");
      defendantPhones.push("");
      defendantFaxes.push("");
      defendantEmails.push("");
    }

    const defendantText = defendants.length === 1 
      ? `${defendants[0]}` 
      : defendants.map((name, idx) => `${name}${name ? ` ที่ ${window.convertArabicToThai((idx + 1).toString())}` : ""}`).join(", ");

    let defendantIdCardText = defendantIdCards.length > 0 ? defendantIdCards[0].replace(/[^0-9]/g, "") : "";
    let formattedDefendantIdCard = window.convertArabicToThai(defendantIdCardText);
    const defendantIdCardTextArray = formattedDefendantIdCard.split("");

    const chargeText = window.convertArabicToThai(chargeInput);
    const cleanAmountBaht = amountBahtInput.replace(/,/g, "");
    const amountBaht = formatThaiNumber(cleanAmountBaht);
    const amountSatang = window.convertArabicToThai(amountSatangInput);
    const fullCaseType = window.convertArabicToThai(caseTypeInput || "");

    const fontSize = 16;
    const lineHeight = 15;
    const fieldHeight = 16;
    
    const xPositions = {
      caseNumber: 430,
      caseYear: 499,
      court: 319,
      day: 284,
      month: 351,
      year: 497,
      caseType: 322,
      plaintiffs: 149,
      defendants: 149,
      plaintiffs2: 150,
      charge: 170,
      amountBaht: 143,
      amountSatang: 364,
      idCard: [178, 190, 202, 214, 226, 238, 250, 262, 274, 286, 298, 310, 322, 334, 346, 358, 370],
      nationality: 455,
      citizenship: 108,
      occupation: 210,
      age: 335,
      houseNumber: 440,
      village: 93,
      road: 160,
      alley: 370,
      subDistrict: 124,
      district: 352,
      province: 103,
      postalCode: 310,
      phone: 408,
      fax: 106,
      email: 358
    };
    const yPositions = {
      caseNumber: 717,
      court: 667,
      day: 644,
      caseType: 621,
      plaintiffs: 564,
      defendants: 485,
      
      charge: 450,
      amountBaht: 430,
      amountSatang: 430,

      //ส่วนข้อมูลโจทก์
      plaintiffs2: 410,
      idCard: 390,
      nationality: 390,
      citizenship: 370,
      occupation: 370,
      age: 370,
      houseNumber: 370,
      village: 350,
      road: 350,
      alley: 350,
      subDistrict: 330,
      district: 330,
      province: 310,
      postalCode: 310,
      phone: 310,
      fax: 290,
      email: 290,
      
      //ส่วนข้อมูลจำเลย
      defendant2: 270,
      defendantIdCard: 250,
      defendantNationality: 250,
      defendantCitizenship: 230,
      defendantOccupation: 230,
      defendantAge: 230,
      defendantHouseNumber: 230,
      defendantVillage: 210,
      defendantRoad: 210,
      defendantAlley: 210,
      defendantSubDistrict: 190,
      defendantDistrict: 190,
      defendantProvince: 170,
      defendantPostalCode: 170,
      defendantPhone: 170,
      defendantFax: 150,
      defendantEmail: 150
    };
    const fieldWidths = {
      caseNumber: 48,
      caseYear: 30,
      court: 210,
      day: 35,
      month: 76,
      year: 30,
      caseType: 206,
      plaintiffs: 340,
      defendants: 340,
      plaintiffs2: 375,
      charge: 355,
      amountBaht: 195,
      amountSatang: 130,
      idCard: 11,
      nationality: 70,
      citizenship: 70,
      occupation: 100,
      age: 30,
      houseNumber: 85,
      village: 41,
      road: 154,
      alley: 155,
      subDistrict: 173,
      district: 173,
      province: 143,
      postalCode: 55,
      phone: 118,
      fax: 150,
      email: 167
    };

    const centerTextX = (text, xStart, width, font, size) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      return xStart + (width - textWidth) / 2;
    };

    const centerTextY = (yStart, height) => {
      return yStart + (height - fontSize) / 2 + 3;
    };

    firstPage.drawText("O", { x: 70, y: 790, font, size: 30, color: rgb(0, 0, 0) });
    firstPage.drawText("(๔)", { x: 90, y: 790, font, size: 18, color: rgb(0, 0, 0) });
    firstPage.drawText("คำฟ้อง", { x: 85, y: 760, font, size: 20, color: rgb(0, 0, 0) });

    const caseNumberLabel = "คดีหมายเลขดำที่";
    const caseNumberLabelWidth = font.widthOfTextAtSize(caseNumberLabel, fontSize);
    firstPage.drawText(caseNumberLabel, { 
      x: xPositions.caseNumber - caseNumberLabelWidth, 
      y: yPositions.caseNumber, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(caseNumber, { 
      x: centerTextX(caseNumber, xPositions.caseNumber, fieldWidths.caseNumber, font, fontSize), 
      y: centerTextY(yPositions.caseNumber, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.caseNumber, y: yPositions.caseNumber - 1 },
      end: { x: xPositions.caseNumber + fieldWidths.caseNumber, y: yPositions.caseNumber - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const yearPrefixLabel = "/๒๕";
    const yearPrefixLabelWidth = font.widthOfTextAtSize(yearPrefixLabel, fontSize);
    firstPage.drawText(yearPrefixLabel, { 
      x: xPositions.caseYear - yearPrefixLabelWidth, 
      y: yPositions.caseNumber, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(caseYear, { 
      x: centerTextX(caseYear, xPositions.caseYear, fieldWidths.caseYear, font, fontSize), 
      y: centerTextY(yPositions.caseNumber, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.caseYear, y: yPositions.caseNumber - 1 },
      end: { x: xPositions.caseYear + fieldWidths.caseYear, y: yPositions.caseNumber - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const courtLabel = "ศาล";
    const courtLabelWidth = font.widthOfTextAtSize(courtLabel, fontSize);
    firstPage.drawText(courtLabel, { 
      x: xPositions.court - courtLabelWidth, 
      y: yPositions.court, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(court, { 
      x: xPositions.court + 10,
      y: centerTextY(yPositions.court, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.court, y: yPositions.court - 1 },
      end: { x: xPositions.court + fieldWidths.court, y: yPositions.court - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const dayLabel = "วันที่";
    const dayLabelWidth = font.widthOfTextAtSize(dayLabel, fontSize);
    firstPage.drawText(dayLabel, { 
      x: xPositions.day - dayLabelWidth, 
      y: yPositions.day, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(day, { 
      x: centerTextX(day, xPositions.day, fieldWidths.day, font, fontSize), 
      y: centerTextY(yPositions.day, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.day, y: yPositions.day - 1 },
      end: { x: xPositions.day + fieldWidths.day, y: yPositions.day - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const monthLabel = "เดือน";
    const monthLabelWidth = font.widthOfTextAtSize(monthLabel, fontSize);
    firstPage.drawText(monthLabel, { 
      x: xPositions.month - monthLabelWidth, 
      y: yPositions.day, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(month, { 
      x: centerTextX(month, xPositions.month, fieldWidths.month, font, fontSize), 
      y: centerTextY(yPositions.day, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.month, y: yPositions.day - 1 },
      end: { x: xPositions.month + fieldWidths.month, y: yPositions.day - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const yearLabel = "พุทธศักราช ๒๕";
    const yearLabelWidth = font.widthOfTextAtSize(yearLabel, fontSize);
    firstPage.drawText(yearLabel, { 
      x: xPositions.year - yearLabelWidth, 
      y: yPositions.day, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(year, { 
      x: centerTextX(year, xPositions.year, fieldWidths.year, font, fontSize), 
      y: centerTextY(yPositions.day, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.year, y: yPositions.day - 1 },
      end: { x: xPositions.year + fieldWidths.year, y: yPositions.day - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const caseTypeLabel = "ความ";
    const caseTypeLabelWidth = font.widthOfTextAtSize(caseTypeLabel, fontSize);
    firstPage.drawText(caseTypeLabel, { 
      x: xPositions.caseType - caseTypeLabelWidth, 
      y: yPositions.caseType, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(fullCaseType, { 
      x: xPositions.caseType + 30,
      y: centerTextY(yPositions.caseType, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.caseType, y: yPositions.caseType - 1 },
      end: { x: xPositions.caseType + fieldWidths.caseType, y: yPositions.caseType - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    let plaintiffY = yPositions.plaintiffs;
    let plaintiffLines = [];
    let plaintiffCurrentLine = "";
    const plaintiffParts = plaintiffText.split(", ");
    const plaintiffDetailText = "รายละเอียดปรากฏตามเอกสารท้ายคำฟ้อง";
    let useDetailTextForPlaintiffs = false;
    
    if (plaintiffText.trim()) {
      for (let i = 0; i < plaintiffParts.length; i++) {
        const potentialLine = plaintiffCurrentLine + (plaintiffCurrentLine ? ", " : "") + plaintiffParts[i];
        if (font.widthOfTextAtSize(potentialLine, fontSize) <= fieldWidths.plaintiffs) {
          plaintiffCurrentLine = potentialLine;
        } else {
          if (plaintiffLines.length < 1) {
            plaintiffLines.push(plaintiffCurrentLine);
            plaintiffCurrentLine = plaintiffParts[i];
          } else if (plaintiffLines.length === 1) {
            if (font.widthOfTextAtSize(plaintiffCurrentLine + ", " + plaintiffParts[i], fontSize) > fieldWidths.plaintiffs) {
              useDetailTextForPlaintiffs = true;
              break;
            } else {
              plaintiffCurrentLine += ", " + plaintiffParts[i];
            }
          }
        }
      }
      if (!useDetailTextForPlaintiffs && plaintiffCurrentLine) {
        if (plaintiffLines.length === 1 && font.widthOfTextAtSize(plaintiffCurrentLine, fontSize) > fieldWidths.plaintiffs) {
          useDetailTextForPlaintiffs = true;
        } else if (plaintiffLines.length < 2) {
          plaintiffLines.push(plaintiffCurrentLine);
        }
      }
    }
    
    if (useDetailTextForPlaintiffs) {
      firstPage.drawText(plaintiffDetailText, { 
        x: xPositions.plaintiffs, // ชิดซ้ายโดยใช้ตำแหน่งเริ่มต้น
        y: centerTextY(plaintiffY, fieldHeight), 
        font, 
        size: fontSize 
      });
      firstPage.drawLine({
        start: { x: xPositions.plaintiffs, y: plaintiffY - 1 },
        end: { x: xPositions.plaintiffs + fieldWidths.plaintiffs, y: plaintiffY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    } else if (plaintiffLines.length > 0) {
      plaintiffLines.forEach((line, index) => {
        firstPage.drawText(line, {
          x: xPositions.plaintiffs, 
          y: plaintiffY - (index * lineHeight), 
          font, 
          size: fontSize 
        });
        if (index === 0) {
          firstPage.drawLine({
            start: { x: xPositions.plaintiffs, y: plaintiffY - (index * lineHeight) - 1 },
            end: { x: xPositions.plaintiffs + fieldWidths.plaintiffs, y: plaintiffY - (index * lineHeight) - 1 },
            thickness: 1,
            color: rgb(0, 0, 0),
            dashArray: [1, 1],
          });
        }
      });
    } else {
      firstPage.drawLine({
        start: { x: xPositions.plaintiffs, y: plaintiffY - 1 },
        end: { x: xPositions.plaintiffs + fieldWidths.plaintiffs, y: plaintiffY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    }
    const plaintiffLabel = "โจทก์";
    firstPage.drawText(plaintiffLabel, { 
      x: xPositions.plaintiffs + fieldWidths.plaintiffs + 3,
      y: plaintiffY, 
      font, 
      size: fontSize 
    });

    let defendantY = yPositions.defendants;
    const defendantParts = defendantText.split(", ");
    const multipleDefendants = defendants.length > 1;
    let defendantLines = [];
    let defendantCurrentLine = "";
    const defendantDetailText = "รายละเอียดปรากฏตามเอกสารท้ายคำฟ้อง";
    let useDetailTextForDefendants = false;

    if (defendantText.trim()) {
      for (let i = 0; i < defendantParts.length; i++) {
        const potentialLine = defendantCurrentLine + (defendantCurrentLine ? ", " : "") + defendantParts[i];
        if (font.widthOfTextAtSize(potentialLine, fontSize) <= fieldWidths.defendants) {
          defendantCurrentLine = potentialLine;
        } else {
          if (defendantLines.length < 1) {
            defendantLines.push(defendantCurrentLine);
            defendantCurrentLine = defendantParts[i];
          } else if (defendantLines.length === 1) {
            if (font.widthOfTextAtSize(defendantCurrentLine + ", " + defendantParts[i], fontSize) > fieldWidths.defendants) {
              useDetailTextForDefendants = true;
              break;
            } else {
              defendantCurrentLine += ", " + defendantParts[i];
            }
          }
        }
      }
      if (!useDetailTextForDefendants && defendantCurrentLine) {
        if (defendantLines.length === 1 && font.widthOfTextAtSize(defendantCurrentLine, fontSize) > fieldWidths.defendants) {
          useDetailTextForDefendants = true;
        } else if (defendantLines.length < 2) {
          defendantLines.push(defendantCurrentLine);
        }
      }
    }

    if (useDetailTextForDefendants) {
      firstPage.drawText(defendantDetailText, { 
        x: xPositions.defendants, // ชิดซ้ายโดยใช้ตำแหน่งเริ่มต้น
        y: centerTextY(defendantY, fieldHeight), 
        font, 
        size: fontSize 
      });
      firstPage.drawLine({
        start: { x: xPositions.defendants, y: defendantY - 1 },
        end: { x: xPositions.defendants + fieldWidths.defendants, y: defendantY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    } else if (defendantLines.length > 0) {
      defendantLines.forEach((line, index) => {
        firstPage.drawText(line, {
          x: xPositions.defendants, 
          y: defendantY - (index * lineHeight), 
          font, 
          size: fontSize 
        });
        if (index === 0) {
          firstPage.drawLine({
            start: { x: xPositions.defendants, y: defendantY - (index * lineHeight) - 1 },
            end: { x: xPositions.defendants + fieldWidths.defendants, y: defendantY - (index * lineHeight) - 1 },
            thickness: 1,
            color: rgb(0, 0, 0),
            dashArray: [1, 1],
          });
        }
      });
    } else {
      firstPage.drawLine({
        start: { x: xPositions.defendants, y: defendantY - 1 },
        end: { x: xPositions.defendants + fieldWidths.defendants, y: defendantY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    }
    const defendantLabel = "จำเลย";
    firstPage.drawText(defendantLabel, { 
      x: xPositions.defendants + fieldWidths.defendants + 3,
      y: defendantY, 
      font, 
      size: fontSize 
    });

    let plaintiffY2 = yPositions.plaintiffs2;
    const multiplePlaintiffs = plaintiffs.length > 1;
    
    if (multiplePlaintiffs) {
      const plaintiffPrefixLabel = "ข้าพเจ้า";
      firstPage.drawText(plaintiffPrefixLabel, { 
        x: xPositions.plaintiffs2 - font.widthOfTextAtSize(plaintiffPrefixLabel, fontSize) - 5,
        y: plaintiffY2, 
        font, 
        size: fontSize 
      });
      firstPage.drawText(plaintiffDetailText, { 
        x: xPositions.plaintiffs2 + 10, // ชิดซ้ายโดยใช้ตำแหน่งเริ่มต้น
        y: centerTextY(plaintiffY2, fieldHeight), 
        font, 
        size: fontSize 
      });
      firstPage.drawLine({
        start: { x: xPositions.plaintiffs2, y: plaintiffY2 - 1 },
        end: { x: xPositions.plaintiffs2 + fieldWidths.plaintiffs2, y: plaintiffY2 - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    } else {
      const plaintiffPrefixLabel = "ข้าพเจ้า";
      firstPage.drawText(plaintiffPrefixLabel, { 
        x: xPositions.plaintiffs2 - font.widthOfTextAtSize(plaintiffPrefixLabel, fontSize) - 5,
        y: plaintiffY2, 
        font, 
        size: fontSize 
      });
      firstPage.drawText(plaintiffText, { 
        x: xPositions.plaintiffs2 + 10, 
        y: plaintiffY2 + 3, 
        font, 
        size: fontSize 
      });
      firstPage.drawLine({
        start: { x: xPositions.plaintiffs2, y: plaintiffY2 - 1 },
        end: { x: xPositions.plaintiffs2 + fieldWidths.plaintiffs2, y: plaintiffY2 - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    }

    const chargeLabel = "ข้อหาหรือฐานความผิด";
    firstPage.drawText(chargeLabel, { 
      x: 70,
      y: yPositions.charge, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(chargeText, { 
      x: xPositions.charge + 10, 
      y: centerTextY(yPositions.charge, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.charge, y: yPositions.charge - 1 },
      end: { x: xPositions.charge + fieldWidths.charge, y: yPositions.charge - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });

    const amountLabel = "จำนวนทุนทรัพย์";
    firstPage.drawText(amountLabel, { 
      x: 70,
      y: yPositions.amountBaht, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(amountBaht, { 
      x: xPositions.amountBaht + 30,
      y: centerTextY(yPositions.amountBaht, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.amountBaht, y: yPositions.amountBaht - 1 },
      end: { x: xPositions.amountBaht + fieldWidths.amountBaht, y: yPositions.amountBaht - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });
    const bahtLabel = "บาท";
    firstPage.drawText(bahtLabel, { 
      x: xPositions.amountBaht + fieldWidths.amountBaht + 3,
      y: yPositions.amountBaht, 
      font, 
      size: fontSize 
    });
    firstPage.drawText(amountSatang, { 
      x: xPositions.amountSatang + 20,
      y: centerTextY(yPositions.amountSatang, fieldHeight), 
      font, 
      size: fontSize 
    });
    firstPage.drawLine({
      start: { x: xPositions.amountSatang, y: yPositions.amountSatang - 1 },
      end: { x: xPositions.amountSatang + fieldWidths.amountSatang, y: yPositions.amountSatang - 1 },
      thickness: 1,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });
    const satangLabel = "สตางค์";
    firstPage.drawText(satangLabel, { 
      x: xPositions.amountSatang + fieldWidths.amountSatang + 3,
      y: yPositions.amountSatang, 
      font, 
      size: fontSize 
    });

// ข้อมูลโจทก์ในหน้าแรก (แทนที่ส่วนเดิม)
const plaintiffType = plaintiffTypes[0] || "individual";
const idCardLabel = plaintiffType === "individual" ? "เลขประจำตัวประชาชน" : "เลขทะเบียนนิติบุคคล";
firstPage.drawText(idCardLabel, { 
    x: 70,
    y: yPositions.idCard, 
    font, 
    size: fontSize 
});

for (let i = 0; i < 17; i++) {
    let char = " ";
    if (i === 1 || i === 6 || i === 11 || i === 15) {
        char = "-";
    } else if (!multiplePlaintiffs) {
        if (i === 0) char = plaintiffIdCardTextArray[0] || " ";
        else if (i >= 2 && i <= 5) char = plaintiffIdCardTextArray[i - 1] || " ";
        else if (i >= 7 && i <= 10) char = plaintiffIdCardTextArray[i - 2] || " ";
        else if (i >= 12 && i <= 14) char = plaintiffIdCardTextArray[i - 3] || " ";
        else if (i === 16) char = plaintiffIdCardTextArray[12] || " ";
    }
    if (i !== 1 && i !== 6 && i !== 11 && i !== 15) {
        firstPage.drawRectangle({ 
            x: xPositions.idCard[i], 
            y: yPositions.idCard, 
            width: fieldWidths.idCard, 
            height: fieldHeight, 
            borderColor: rgb(0, 0, 0), 
            borderWidth: 1 
        });
    }
    firstPage.drawText(char, { 
        x: centerTextX(char, xPositions.idCard[i], fieldWidths.idCard, font, fontSize), 
        y: yPositions.idCard + (fieldHeight / 3), 
        font, 
        size: fontSize 
    });
}

firstPage.drawText("โจทก์", { 
    x: xPositions.idCard[16] + fieldWidths.idCard + 10,
    y: yPositions.idCard, 
    font, 
    size: fontSize 
});

const nationalityLabel = "เชื้อชาติ";
firstPage.drawText(nationalityLabel, { 
    x: xPositions.nationality - font.widthOfTextAtSize(nationalityLabel, fontSize), 
    y: yPositions.nationality, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffNationalities[0] || "-") : "-",
    { x: centerTextX(plaintiffNationalities[0] || "-", xPositions.nationality, fieldWidths.nationality, font, fontSize), 
      y: centerTextY(yPositions.nationality, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.nationality, y: yPositions.nationality - 1 },
    end: { x: xPositions.nationality + fieldWidths.nationality, y: yPositions.nationality - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const citizenshipLabel = "สัญชาติ";
firstPage.drawText(citizenshipLabel, { 
    x: 70,
    y: yPositions.citizenship, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffCitizenships[0] || "-") : "-",
    { x: centerTextX(plaintiffCitizenships[0] || "-", xPositions.citizenship, fieldWidths.citizenship, font, fontSize), 
      y: centerTextY(yPositions.citizenship, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.citizenship, y: yPositions.citizenship - 1 },
    end: { x: xPositions.citizenship + fieldWidths.citizenship, y: yPositions.citizenship - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const occupationLabel = "อาชีพ";
firstPage.drawText(occupationLabel, { 
    x: xPositions.occupation - font.widthOfTextAtSize(occupationLabel, fontSize), 
    y: yPositions.occupation, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffOccupations[0] || "-") : "-",
    { x: centerTextX(plaintiffOccupations[0] || "-", xPositions.occupation, fieldWidths.occupation, font, fontSize), 
      y: centerTextY(yPositions.occupation, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.occupation, y: yPositions.occupation - 1 },
    end: { x: xPositions.occupation + fieldWidths.occupation, y: yPositions.occupation - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const ageLabel = "อายุ";
firstPage.drawText(ageLabel, { 
    x: xPositions.age - font.widthOfTextAtSize(ageLabel, fontSize), 
    y: yPositions.age, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffAges[0] || "-") : "-",
    { x: centerTextX(plaintiffAges[0] || "-", xPositions.age, fieldWidths.age, font, fontSize), 
      y: centerTextY(yPositions.age, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.age, y: yPositions.age - 1 },
    end: { x: xPositions.age + fieldWidths.age, y: yPositions.age - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});
firstPage.drawText("ปี", { 
    x: xPositions.age + fieldWidths.age + 4,
    y: yPositions.age, 
    font, 
    size: fontSize 
});

const houseNumberLabel = "อยู่บ้านเลขที่";
firstPage.drawText(houseNumberLabel, { 
    x: xPositions.houseNumber - font.widthOfTextAtSize(houseNumberLabel, fontSize), 
    y: yPositions.houseNumber, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffHouseNumbers[0] || "-") : "-",
    { x: centerTextX(plaintiffHouseNumbers[0] || "-", xPositions.houseNumber, fieldWidths.houseNumber, font, fontSize), 
      y: centerTextY(yPositions.houseNumber, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.houseNumber, y: yPositions.houseNumber - 1 },
    end: { x: xPositions.houseNumber + fieldWidths.houseNumber, y: yPositions.houseNumber - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const villageLabel = "หมู่ที่";
firstPage.drawText(villageLabel, { 
    x: 70,
    y: yPositions.village, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffVillages[0] || "-") : "-",
    { x: centerTextX(plaintiffVillages[0] || "-", xPositions.village, fieldWidths.village, font, fontSize), 
      y: centerTextY(yPositions.village, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.village, y: yPositions.village - 1 },
    end: { x: xPositions.village + fieldWidths.village, y: yPositions.village - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const roadLabel = "ถนน";
firstPage.drawText(roadLabel, { 
    x: xPositions.road - font.widthOfTextAtSize(roadLabel, fontSize), 
    y: yPositions.road, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffRoads[0] || "-") : "-",
    { x: centerTextX(plaintiffRoads[0] || "-", xPositions.road, fieldWidths.road, font, fontSize), 
      y: centerTextY(yPositions.road, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.road, y: yPositions.road - 1 },
    end: { x: xPositions.road + fieldWidths.road, y: yPositions.road - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const alleyLabel = "ตรอก/ซอย";
firstPage.drawText(alleyLabel, { 
    x: xPositions.alley - font.widthOfTextAtSize(alleyLabel, fontSize), 
    y: yPositions.alley, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffAlleys[0] || "-") : "-",
    { x: centerTextX(plaintiffAlleys[0] || "-", xPositions.alley, fieldWidths.alley, font, fontSize), 
      y: centerTextY(yPositions.alley, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.alley, y: yPositions.alley - 1 },
    end: { x: xPositions.alley + fieldWidths.alley, y: yPositions.alley - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const subDistrictLabel = "ตำบล/แขวง";
firstPage.drawText(subDistrictLabel, { 
    x: 70,
    y: yPositions.subDistrict, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffSubDistricts[0] || "-") : "-",
    { x: centerTextX(plaintiffSubDistricts[0] || "-", xPositions.subDistrict, fieldWidths.subDistrict, font, fontSize), 
      y: centerTextY(yPositions.subDistrict, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.subDistrict, y: yPositions.subDistrict - 1 },
    end: { x: xPositions.subDistrict + fieldWidths.subDistrict, y: yPositions.subDistrict - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const districtLabel = "อำเภอ/เขต";
firstPage.drawText(districtLabel, { 
    x: xPositions.district - font.widthOfTextAtSize(districtLabel, fontSize), 
    y: yPositions.district, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffDistricts[0] || "-") : "-",
    { x: centerTextX(plaintiffDistricts[0] || "-", xPositions.district, fieldWidths.district, font, fontSize), 
      y: centerTextY(yPositions.district, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.district, y: yPositions.district - 1 },
    end: { x: xPositions.district + fieldWidths.district, y: yPositions.district - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const provinceLabel = "จังหวัด";
firstPage.drawText(provinceLabel, { 
    x: 70,
    y: yPositions.province, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffProvinces[0] || "-") : "-",
    { x: centerTextX(plaintiffProvinces[0] || "-", xPositions.province, fieldWidths.province, font, fontSize), 
      y: centerTextY(yPositions.province, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.province, y: yPositions.province - 1 },
    end: { x: xPositions.province + fieldWidths.province, y: yPositions.province - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const postalCodeLabel = "รหัสไปรษณีย์";
firstPage.drawText(postalCodeLabel, { 
    x: xPositions.postalCode - font.widthOfTextAtSize(postalCodeLabel, fontSize), 
    y: yPositions.postalCode, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffPostalCodes[0] || "-") : "-",
    { x: centerTextX(plaintiffPostalCodes[0] || "-", xPositions.postalCode, fieldWidths.postalCode, font, fontSize), 
      y: centerTextY(yPositions.postalCode, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.postalCode, y: yPositions.postalCode - 1 },
    end: { x: xPositions.postalCode + fieldWidths.postalCode, y: yPositions.postalCode - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const phoneLabel = "โทรศัพท์";
firstPage.drawText(phoneLabel, { 
    x: xPositions.phone - font.widthOfTextAtSize(phoneLabel, fontSize), 
    y: yPositions.phone, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffPhones[0] || "-") : "-",
    { x: centerTextX(plaintiffPhones[0] || "-", xPositions.phone, fieldWidths.phone, font, fontSize), 
      y: centerTextY(yPositions.phone, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.phone, y: yPositions.phone - 1 },
    end: { x: xPositions.phone + fieldWidths.phone, y: yPositions.phone - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const faxLabel = "โทรสาร";
firstPage.drawText(faxLabel, { 
    x: 70,
    y: yPositions.fax, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffFaxes[0] || "-") : "-",
    { x: centerTextX(plaintiffFaxes[0] || "-", xPositions.fax, fieldWidths.fax, font, fontSize), 
      y: centerTextY(yPositions.fax, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.fax, y: yPositions.fax - 1 },
    end: { x: xPositions.fax + fieldWidths.fax, y: yPositions.fax - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

const emailLabel = "ไปรษณีย์อิเล็กทรอนิกส์";
firstPage.drawText(emailLabel, { 
    x: xPositions.email - font.widthOfTextAtSize(emailLabel, fontSize), 
    y: yPositions.email, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multiplePlaintiffs ? (plaintiffEmails[0] || "-") : "-",
    { x: centerTextX(plaintiffEmails[0] || "-", xPositions.email, fieldWidths.email, font, fontSize), 
      y: centerTextY(yPositions.email, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.email, y: yPositions.email - 1 },
    end: { x: xPositions.email + fieldWidths.email, y: yPositions.email - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

// ข้อมูลจำเลยในหน้าแรก (แทนที่ส่วนเดิม)
const defendantType = defendantTypes[0] || "individual";
const defendantIdCardLabel = defendantType === "individual" ? "เลขประจำตัวประชาชน" : "เลขทะเบียนนิติบุคคล";
firstPage.drawText(defendantIdCardLabel, { 
    x: 70,
    y: yPositions.defendantIdCard, 
    font, 
    size: fontSize 
});

for (let i = 0; i < 17; i++) {
    let char = " ";
    if (i === 1 || i === 6 || i === 11 || i === 15) {
        char = "-";
    } else if (!multipleDefendants) {
        if (i === 0) char = defendantIdCardTextArray[0] || " ";
        else if (i >= 2 && i <= 5) char = defendantIdCardTextArray[i - 1] || " ";
        else if (i >= 7 && i <= 10) char = defendantIdCardTextArray[i - 2] || " ";
        else if (i >= 12 && i <= 14) char = defendantIdCardTextArray[i - 3] || " ";
        else if (i === 16) char = defendantIdCardTextArray[12] || " ";
    }
    if (i !== 1 && i !== 6 && i !== 11 && i !== 15) {
        firstPage.drawRectangle({ 
            x: xPositions.idCard[i], 
            y: yPositions.defendantIdCard, 
            width: fieldWidths.idCard, 
            height: fieldHeight, 
            borderColor: rgb(0, 0, 0), 
            borderWidth: 1 
        });
    }
    firstPage.drawText(char, { 
        x: centerTextX(char, xPositions.idCard[i], fieldWidths.idCard, font, fontSize), 
        y: yPositions.defendantIdCard + (fieldHeight / 3), 
        font, 
        size: fontSize 
    });
}

firstPage.drawText("จำเลย", { 
    x: xPositions.idCard[16] + fieldWidths.idCard + 10,
    y: yPositions.defendantIdCard, 
    font, 
    size: fontSize 
});

firstPage.drawText(nationalityLabel, { 
    x: xPositions.nationality - font.widthOfTextAtSize(nationalityLabel, fontSize), 
    y: yPositions.defendantNationality, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantNationalities[0] || "-") : "-",
    { x: centerTextX(defendantNationalities[0] || "-", xPositions.nationality, fieldWidths.nationality, font, fontSize), 
      y: centerTextY(yPositions.defendantNationality, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.nationality, y: yPositions.defendantNationality - 1 },
    end: { x: xPositions.nationality + fieldWidths.nationality, y: yPositions.defendantNationality - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(citizenshipLabel, { 
    x: 70,
    y: yPositions.defendantCitizenship, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantCitizenships[0] || "-") : "-",
    { x: centerTextX(defendantCitizenships[0] || "-", xPositions.citizenship, fieldWidths.citizenship, font, fontSize), 
      y: centerTextY(yPositions.defendantCitizenship, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.citizenship, y: yPositions.defendantCitizenship - 1 },
    end: { x: xPositions.citizenship + fieldWidths.citizenship, y: yPositions.defendantCitizenship - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(occupationLabel, { 
    x: xPositions.occupation - font.widthOfTextAtSize(occupationLabel, fontSize), 
    y: yPositions.defendantOccupation, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantOccupations[0] || "-") : "-",
    { x: centerTextX(defendantOccupations[0] || "-", xPositions.occupation, fieldWidths.occupation, font, fontSize), 
      y: centerTextY(yPositions.defendantOccupation, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.occupation, y: yPositions.defendantOccupation - 1 },
    end: { x: xPositions.occupation + fieldWidths.occupation, y: yPositions.defendantOccupation - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(ageLabel, { 
    x: xPositions.age - font.widthOfTextAtSize(ageLabel, fontSize), 
    y: yPositions.defendantAge, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantAges[0] || "-") : "-",
    { x: centerTextX(defendantAges[0] || "-", xPositions.age, fieldWidths.age, font, fontSize), 
      y: centerTextY(yPositions.defendantAge, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.age, y: yPositions.defendantAge - 1 },
    end: { x: xPositions.age + fieldWidths.age, y: yPositions.defendantAge - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});
firstPage.drawText("ปี", { 
    x: xPositions.age + fieldWidths.age + 4,
    y: yPositions.defendantAge, 
    font, 
    size: fontSize 
});

firstPage.drawText(houseNumberLabel, { 
    x: xPositions.houseNumber - font.widthOfTextAtSize(houseNumberLabel, fontSize), 
    y: yPositions.defendantHouseNumber, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantHouseNumbers[0] || "-") : "-",
    { x: centerTextX(defendantHouseNumbers[0] || "-", xPositions.houseNumber, fieldWidths.houseNumber, font, fontSize), 
      y: centerTextY(yPositions.defendantHouseNumber, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.houseNumber, y: yPositions.defendantHouseNumber - 1 },
    end: { x: xPositions.houseNumber + fieldWidths.houseNumber, y: yPositions.defendantHouseNumber - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(villageLabel, { 
    x: 70,
    y: yPositions.defendantVillage, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantVillages[0] || "-") : "-",
    { x: centerTextX(defendantVillages[0] || "-", xPositions.village, fieldWidths.village, font, fontSize), 
      y: centerTextY(yPositions.defendantVillage, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.village, y: yPositions.defendantVillage - 1 },
    end: { x: xPositions.village + fieldWidths.village, y: yPositions.defendantVillage - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(roadLabel, { 
    x: xPositions.road - font.widthOfTextAtSize(roadLabel, fontSize), 
    y: yPositions.defendantRoad, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantRoads[0] || "-") : "-",
    { x: centerTextX(defendantRoads[0] || "-", xPositions.road, fieldWidths.road, font, fontSize), 
      y: centerTextY(yPositions.defendantRoad, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.road, y: yPositions.defendantRoad - 1 },
    end: { x: xPositions.road + fieldWidths.road, y: yPositions.defendantRoad - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(alleyLabel, { 
    x: xPositions.alley - font.widthOfTextAtSize(alleyLabel, fontSize), 
    y: yPositions.defendantAlley, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantAlleys[0] || "-") : "-",
    { x: centerTextX(defendantAlleys[0] || "-", xPositions.alley, fieldWidths.alley, font, fontSize), 
      y: centerTextY(yPositions.defendantAlley, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.alley, y: yPositions.defendantAlley - 1 },
    end: { x: xPositions.alley + fieldWidths.alley, y: yPositions.defendantAlley - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(subDistrictLabel, { 
    x: 70,
    y: yPositions.defendantSubDistrict, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantSubDistricts[0] || "-") : "-",
    { x: centerTextX(defendantSubDistricts[0] || "-", xPositions.subDistrict, fieldWidths.subDistrict, font, fontSize), 
      y: centerTextY(yPositions.defendantSubDistrict, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.subDistrict, y: yPositions.defendantSubDistrict - 1 },
    end: { x: xPositions.subDistrict + fieldWidths.subDistrict, y: yPositions.defendantSubDistrict - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(districtLabel, { 
    x: xPositions.district - font.widthOfTextAtSize(districtLabel, fontSize), 
    y: yPositions.defendantDistrict, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantDistricts[0] || "-") : "-",
    { x: centerTextX(defendantDistricts[0] || "-", xPositions.district, fieldWidths.district, font, fontSize), 
      y: centerTextY(yPositions.defendantDistrict, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.district, y: yPositions.defendantDistrict - 1 },
    end: { x: xPositions.district + fieldWidths.district, y: yPositions.defendantDistrict - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(provinceLabel, { 
    x: 70,
    y: yPositions.defendantProvince, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantProvinces[0] || "-") : "-",
    { x: centerTextX(defendantProvinces[0] || "-", xPositions.province, fieldWidths.province, font, fontSize), 
      y: centerTextY(yPositions.defendantProvince, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.province, y: yPositions.defendantProvince - 1 },
    end: { x: xPositions.province + fieldWidths.province, y: yPositions.defendantProvince - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(postalCodeLabel, { 
    x: xPositions.postalCode - font.widthOfTextAtSize(postalCodeLabel, fontSize), 
    y: yPositions.defendantPostalCode, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantPostalCodes[0] || "-") : "-",
    { x: centerTextX(defendantPostalCodes[0] || "-", xPositions.postalCode, fieldWidths.postalCode, font, fontSize), 
      y: centerTextY(yPositions.defendantPostalCode, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.postalCode, y: yPositions.defendantPostalCode - 1 },
    end: { x: xPositions.postalCode + fieldWidths.postalCode, y: yPositions.defendantPostalCode - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(phoneLabel, { 
    x: xPositions.phone - font.widthOfTextAtSize(phoneLabel, fontSize), 
    y: yPositions.defendantPhone, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantPhones[0] || "-") : "-",
    { x: centerTextX(defendantPhones[0] || "-", xPositions.phone, fieldWidths.phone, font, fontSize), 
      y: centerTextY(yPositions.defendantPhone, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.phone, y: yPositions.defendantPhone - 1 },
    end: { x: xPositions.phone + fieldWidths.phone, y: yPositions.defendantPhone - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(faxLabel, { 
    x: 70,
    y: yPositions.defendantFax, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantFaxes[0] || "-") : "-",
    { x: centerTextX(defendantFaxes[0] || "-", xPositions.fax, fieldWidths.fax, font, fontSize), 
      y: centerTextY(yPositions.defendantFax, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.fax, y: yPositions.defendantFax - 1 },
    end: { x: xPositions.fax + fieldWidths.fax, y: yPositions.defendantFax - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});

firstPage.drawText(emailLabel, { 
    x: xPositions.email - font.widthOfTextAtSize(emailLabel, fontSize), 
    y: yPositions.defendantEmail, 
    font, 
    size: fontSize 
});
firstPage.drawText(
    !multipleDefendants ? (defendantEmails[0] || "-") : "-",
    { x: centerTextX(defendantEmails[0] || "-", xPositions.email, fieldWidths.email, font, fontSize), 
      y: centerTextY(yPositions.defendantEmail, fieldHeight), 
      font, 
      size: fontSize 
    }
);
firstPage.drawLine({
    start: { x: xPositions.email, y: yPositions.defendantEmail - 1 },
    end: { x: xPositions.email + fieldWidths.email, y: yPositions.defendantEmail - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
});
    
    // เพิ่มส่วน "ขอยื่นฟ้อง" สำหรับจำเลย
    const defendantPrefixY = yPositions.defendant2;
    const defendantPrefixLabel = "ขอยื่นฟ้อง";
    firstPage.drawText(defendantPrefixLabel, { 
      x: xPositions.plaintiffs2 - font.widthOfTextAtSize(defendantPrefixLabel, fontSize) - 5,
      y: defendantPrefixY, 
      font, 
      size: fontSize 
    });
    
    if (multipleDefendants) {
      firstPage.drawText(defendantDetailText, { 
        x: xPositions.plaintiffs2 + 10, // ชิดซ้ายโดยใช้ตำแหน่งเริ่มต้น
        y: centerTextY(defendantPrefixY, fieldHeight), 
        font, 
        size: fontSize 
      });
      firstPage.drawLine({
        start: { x: xPositions.plaintiffs2, y: defendantPrefixY - 1 },
        end: { x: xPositions.plaintiffs2 + fieldWidths.plaintiffs2, y: defendantPrefixY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    } else {
      firstPage.drawText(defendantText, { 
        x: xPositions.plaintiffs2 + 10, 
        y: defendantPrefixY, 
        font, 
        size: fontSize 
      });
      firstPage.drawLine({
        start: { x: xPositions.plaintiffs2, y: defendantPrefixY - 1 },
        end: { x: xPositions.plaintiffs2 + fieldWidths.plaintiffs2, y: defendantPrefixY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    }
    
// กำหนดตำแหน่งสำหรับเนื้อหาคำฟ้องในหน้าแรก
const complaintHeaderY = 130; // ตำแหน่งของหัวข้อ "มีข้อความตามที่จำกล่าวต่อไปนี้"
const complaintStartY = 110;   // ตำแหน่งเริ่มต้นของเนื้อหาคำฟ้องจริง (ใต้หัวข้อ)
const textX = 70;             // ขอบซ้าย
const textWidth = 465;        // ความกว้างสูงสุดของข้อความ
const textLineHeight = 22;    // ระยะห่างระหว่างบรรทัดในหน้าแรก
const tabWidth = 64;          // ความกว้างของ 1 Tab = 64 พิกเซล

// หัวข้อ "มีข้อความตามที่จำกล่าวต่อไปนี้"
const complaintHeader = "มีข้อความตามที่จำกล่าวต่อไปนี้";
firstPage.drawText(complaintHeader, { 
  x: textX, 
  y: complaintHeaderY, 
  font, 
  size: fontSize + 2, 
  color: rgb(0, 0, 0) 
});

// แยกเนื้อหาคำฟ้องเป็นบรรทัดจาก \n
const rawLines = complaintContentThai ? complaintContentThai.split("\n") : [];
console.log("บรรทัดดิบจาก split:", rawLines); // ดีบัก

// รวมผลลัพธ์จาก wrapText เพื่อนับบรรทัดจริง
let allWrappedLines = [];
rawLines.forEach((line) => {
  const wrapped = wrapText(line, font, fontSize, textWidth, tabWidth);
  allWrappedLines = allWrappedLines.concat(wrapped);
});
console.log("บรรทัดทั้งหมดหลัง wrapText:", allWrappedLines); // ดีบัก

// วาดเส้นประไข่ปลา 2 เส้นในหน้าแรกก่อนเสมอ
for (let i = 0; i < 2; i++) {
  const lineY = complaintStartY - (i * textLineHeight);
  firstPage.drawLine({
    start: { x: textX, y: lineY - 5 },
    end: { x: textX + textWidth, y: lineY - 5 },
    thickness: 0.5,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
  });
}

// วาดข้อความทับเส้นประและปรับเส้นถ้ามี "ข้อ"
for (let i = 0; i < 2 && i < allWrappedLines.length; i++) {
  const line = allWrappedLines[i];
  const lineY = complaintStartY - (i * textLineHeight);

  // ตรวจสอบว่าบรรทัดเริ่มต้นด้วย "ข้อ" หรือมี Tab แล้วตามด้วย "ข้อ"
  const khoMatch = line.match(/^(\s*ข้อ\s*[0-9๐-๙]*)/) || line.match(/^\t(\s*ข้อ\s*[0-9๐-๙]*)/);
  if (khoMatch) {
    const prefix = khoMatch[1]; // คำว่า "ข้อ" หรือ "ข้อ1", "ข้อ 1" เป็นต้น
    const prefixWidth = font.widthOfTextAtSize(prefix, fontSize);
    const startX = textX + prefixWidth + 5; // ตำแหน่งเริ่มต้นของเส้นประหลัง "ข้อ"

    // ลบเส้นประเดิมในส่วนที่ข้อความ "ข้อ" อยู่ด้วยพื้นหลังสีขาว
    firstPage.drawLine({
      start: { x: textX, y: lineY - 5 },
      end: { x: startX, y: lineY - 5 },
      thickness: 2,
      color: rgb(1, 1, 1), // สีขาว
    });

    // วาดเส้นประไข่ปลาใหม่หลังคำว่า "ข้อ"
    firstPage.drawLine({
      start: { x: startX, y: lineY - 5 },
      end: { x: textX + textWidth, y: lineY - 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });
  }

  // วาดข้อความทับเส้นประ
  firstPage.drawText(line, {
    x: textX,
    y: lineY,
    font,
    size: fontSize,
  });
}

// ถ้าเนื้อหาทั้งหมดอยู่ในหน้าแรก (ไม่เกิน 2 บรรทัด) ให้เพิ่ม "ควรมิควรแล้วแต่จะโปรด"
if (allWrappedLines.length <= 2) {
  const lastLineY = complaintStartY - ((allWrappedLines.length - 1) * textLineHeight);
  const finalText = "ควรมิควรแล้วแต่จะโปรด";
  const finalTextWidth = font.widthOfTextAtSize(finalText, fontSize);
  const centerX = (pageWidth - textWidth) / 2 + textX; // จุดกึ่งกลางของพื้นที่ข้อความ
  const finalTextX = centerX + 20; // เลื่อนไปทางขวาของกึ่งกลางนิดหน่อย

  firstPage.drawText(finalText, {
    x: finalTextX,
    y: lastLineY - textLineHeight, // อยู่ถัดจากบรรทัดสุดท้าย
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
}

// ถ้ามีมากกว่า 2 บรรทัดจริงๆ ให้เพิ่มหน้าถัดไป
if (allWrappedLines.length > 2) {
  const maxRowsPerPage = 22;
  const rowHeight = 32;
  const textY = 731;
  const remainingLines = allWrappedLines.slice(2);
  let pageCounter = 1;

  for (let i = 0; i < remainingLines.length; i += maxRowsPerPage) {
    const currentPage = pdfDoc.addPage([595.28, 841.89]);

    currentPage.drawText("(๔๐ ก.)", { 
      x: 70, 
      y: 790, 
      font, 
      size: fontSize, 
      color: rgb(0, 0, 0) 
    });

    const pageNumberThai = window.convertArabicToThai(pageCounter.toString());
    const pageNumberWidth = font.widthOfTextAtSize(pageNumberThai, fontSize);
    const pageNumberX = (pageWidth - pageNumberWidth) / 2;
    currentPage.drawText(pageNumberThai, {
      x: pageNumberX,
      y: 790,
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    for (let j = 0; j < maxRowsPerPage; j++) {
      const lineY = textY - (j * rowHeight);
      currentPage.drawLine({
        start: { x: textX, y: lineY },
        end: { x: textX + textWidth, y: lineY },
        thickness: 0.5,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    }

    const pageLines = remainingLines.slice(i, i + maxRowsPerPage);
    pageLines.forEach((line, index) => {
      const lineY = textY - (index * rowHeight);
      const adjustedY = lineY + 5;

      const khoMatch = line.match(/^(\s*ข้อ\s*[0-9๐-๙]*)/) || line.match(/^\t(\s*ข้อ\s*[0-9๐-๙]*)/);
      if (khoMatch) {
        const prefix = khoMatch[1];
        const prefixWidth = font.widthOfTextAtSize(prefix, fontSize);
        const startX = textX + prefixWidth + 5;

        currentPage.drawLine({
          start: { x: textX, y: lineY },
          end: { x: startX, y: lineY },
          thickness: 2,
          color: rgb(1, 1, 1),
        });

        currentPage.drawLine({
          start: { x: startX, y: lineY },
          end: { x: textX + textWidth, y: lineY },
          thickness: 0.5,
          color: rgb(0, 0, 0),
          dashArray: [1, 1],
        });
      }

      currentPage.drawText(line, {
        x: textX,
        y: adjustedY,
        font,
        size: fontSize,
      });
    });

    // ถ้าเป็นหน้าสุดท้าย ให้เพิ่ม "ควรมิควรแล้วแต่จะโปรด"
    if (i + maxRowsPerPage >= remainingLines.length) {
      const lastLineIndex = pageLines.length - 1;
      const lastLineY = textY - (lastLineIndex * rowHeight);
      const finalText = "ควรมิควรแล้วแต่จะโปรด";
      const finalTextWidth = font.widthOfTextAtSize(finalText, fontSize);
      const centerX = (pageWidth - textWidth) / 2 + textX; // จุดกึ่งกลางของพื้นที่ข้อความ
      const finalTextX = centerX + 200; // เลื่อนไปทางขวาของกึ่งกลางนิดหน่อย

      currentPage.drawText(finalText, {
        x: finalTextX,
        y: lastLineY - rowHeight, // อยู่ถัดจากบรรทัดสุดท้าย
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    }

    pageCounter++;
  }
}

// ฟังก์ชันช่วยในการวาปข้อความ
function wrapText(text, font, fontSize, maxWidth, tabWidth = 64) {
  const spaceWidth = font.widthOfTextAtSize(" ", fontSize);
  const tabSpaces = Math.max(1, Math.ceil(tabWidth / spaceWidth));
  const lines = [];
  let currentLine = "";
  let currentWidth = 0;

  if (!text || text.trim() === "") {
    lines.push(text.replace(/\t/g, " ".repeat(tabSpaces)));
    return lines;
  }

  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    let word = words[i].replace(/\t/g, " ".repeat(tabSpaces));
    const wordWidth = font.widthOfTextAtSize(word, fontSize);
    const space = currentLine ? " " : "";
    const testLine = currentLine + space + word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
      currentWidth = testWidth;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      currentWidth = wordWidth;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

const civilRequestInputs = document.querySelectorAll(".civil-request-input");
    let civilRequests = [];
    civilRequestInputs.forEach((input, index) => {
      const requestText = input.value.trim();
      if (requestText) {
        civilRequests.push({
          index: index + 1,
          text: window.convertArabicToThai(requestText),
        });
      }
    });

    // ดึงข้อมูลคำขอท้ายคำฟ้องอาญา
    const criminalRequestInputs = document.querySelectorAll(".criminal-request-input");
    let criminalRequests = [];
    criminalRequestInputs.forEach((input, index) => {
      const requestText = input.value.trim();
      if (requestText) {
        criminalRequests.push({
          index: index + 1,
          text: window.convertArabicToThai(requestText),
        });
      }
    });

    // ดึงจำนวนฉบับ
    const requestCopiesInput = document.getElementById("requestCopiesInput");
    const requestCopies = requestCopiesInput && requestCopiesInput.value ? parseInt(requestCopiesInput.value, 10) : null;

    // ดึงประเภทคำขอที่เลือก
    const requestType = document.getElementById("requestType").value;

    // ดึงข้อมูลกฎหมายและบทมาตรา
    const criminalLawText = document.getElementById("criminalLawInput").value.trim();
    const lawText = criminalLawText ? window.convertArabicToThai(criminalLawText) : "";

    // ดึงคำที่ต้องการแทน "นัด"
    const summonWordInput = document.getElementById("summonWordInput");
    const summonWord = summonWordInput && summonWordInput.value.trim() 
      ? window.convertArabicToThai(summonWordInput.value.trim()) 
      : "นัด"; // ค่าเริ่มต้นคือ "นัด" ถ้าไม่กรอก

    // ดึงชื่อและประเภทสำหรับคำขอท้ายคำฟ้องแพ่ง
    const civilPlaintiffOrLawyerNameInput = document.getElementById("plaintiffOrLawyerNameInput");
    const civilPlaintiffOrLawyerTypeSelect = document.getElementById("plaintiffOrLawyerTypeSelect");
    const civilPlaintiffOrLawyerName = civilPlaintiffOrLawyerNameInput && civilPlaintiffOrLawyerNameInput.value.trim() 
      ? window.convertArabicToThai(civilPlaintiffOrLawyerNameInput.value.trim()) 
      : "";
    const civilPlaintiffOrLawyerType = civilPlaintiffOrLawyerTypeSelect && civilPlaintiffOrLawyerTypeSelect.value 
      ? civilPlaintiffOrLawyerTypeSelect.value 
      : "โจทก์";
    const civilFullNameLabel = `${civilPlaintiffOrLawyerType}`;

    // ดึงชื่อและประเภทสำหรับคำขอท้ายคำฟ้องอาญา
    const criminalPlaintiffOrLawyerNameInput = document.getElementById("criminalPlaintiffOrLawyerNameInput");
    const criminalPlaintiffOrLawyerTypeSelect = document.getElementById("criminalPlaintiffOrLawyerTypeSelect");
    const criminalPlaintiffOrLawyerName = criminalPlaintiffOrLawyerNameInput && criminalPlaintiffOrLawyerNameInput.value.trim() 
      ? window.convertArabicToThai(criminalPlaintiffOrLawyerNameInput.value.trim()) 
      : "";
    const criminalPlaintiffOrLawyerType = criminalPlaintiffOrLawyerTypeSelect && criminalPlaintiffOrLawyerTypeSelect.value 
      ? criminalPlaintiffOrLawyerTypeSelect.value 
      : "โจทก์";
    const criminalFullNameLabel = `${criminalPlaintiffOrLawyerType}`;

// ส่วนคำขอท้ายคำฟ้องตามประเภทที่เลือก
if (requestType === "civil") {
  console.log("Generating Civil Request Section");
  console.log("Civil Requests:", civilRequests);

  const maxRowsPerPageFirst = 16; // หน้าแรกคงเดิม 16 บรรทัด
  const maxRowsPerPageAdditional = 22; // หน้าต่อไป 22 บรรทัด
  const rowHeight = 32;
  const textX = 70;
  const textY = 656; // ตำแหน่ง Y หน้าแรกคงเดิม
  const textYAdditional = 731; // ตำแหน่ง Y หน้าต่อไปให้ตรงกับเนื้อหาคำฟ้อง
  const textWidth = 465;
  const tabWidth = 64;

  let requestText = "คำขอ\n";
  civilRequests.forEach((request) => {
    requestText += `\tข้อ ${window.convertArabicToThai(request.index.toString())} ${request.text}\n`;
  });

  const requestLinesRaw = requestText.split("\n").filter(line => line.trim() !== "");
  let allRequestLines = [];
  requestLinesRaw.forEach((line) => {
    const wrapped = wrapText(line, font, fontSize, textWidth, tabWidth);
    allRequestLines = allRequestLines.concat(wrapped);
  });
  console.log("Wrapped Civil Request Lines:", allRequestLines);

  const totalLines = allRequestLines.length;
  console.log("Total Civil Lines:", totalLines);

  // หน้าแรก (ไม่เปลี่ยนแปลง)
  const firstPage = pdfDoc.addPage([595.28, 841.89]);
  firstPage.drawText("O", { x: 70, y: 790, font, size: 30, color: rgb(0, 0, 0) });
  firstPage.drawText("(๕)", { x: 90, y: 790, font, size: 18, color: rgb(0, 0, 0) });
  firstPage.drawText("คำขอท้ายคำฟ้องแพ่ง", { x: 85, y: 760, font, size: 20, color: rgb(0, 0, 0) });
  firstPage.drawText("                   เพราะฉะนั้นขอศาลออกหมายเรียกตัวจำเลยมาพิจารณาพิพากษาและบังคับจำเลย", { x: 70, y: 720, font, size: 16, color: rgb(0, 0, 0) });
  firstPage.drawText("ตามคำขอต่อไปนี้", { x: 70, y: 688, font, size: 16, color: rgb(0, 0, 0) });
  firstPage.drawText("                            ข้าพเจ้าได้ยื่นสำเนาคำฟ้องโดยข้อความถูกต้องเป็นอย่างเดียวกันมาด้วย", { x: 70, y: 144, font, size: 16, color: rgb(0, 0, 0) });

  // ส่วนจำนวนฉบับ (ไม่เปลี่ยนแปลง)
  const copiesFieldX = 70;
  const copiesFieldY = 112;
  const copiesFieldWidth = 60;
  const copiesThai = requestCopies ? window.convertArabicToThai(requestCopies.toString()) : "";
  const copiesThaiWidth = font.widthOfTextAtSize(copiesThai, fontSize);

  firstPage.drawText(copiesThai, {
    x: copiesFieldX + (copiesFieldWidth - copiesThaiWidth) / 2,
    y: copiesFieldY,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawLine({
    start: { x: copiesFieldX, y: copiesFieldY - 1 },
    end: { x: copiesFieldX + copiesFieldWidth, y: copiesFieldY - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
  });

  const remainingText = "ฉบับและรอฟังคำสั่งอยู่ ถ้าไม่รอให้ถือว่าทราบแล้ว";
  firstPage.drawText(remainingText, {
    x: copiesFieldX + copiesFieldWidth + 5,
    y: copiesFieldY,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  // วาดเส้นประไข่ปลาในหน้าแรก (16 บรรทัด)
  for (let j = 0; j < maxRowsPerPageFirst; j++) {
    const lineY = textY - (j * rowHeight);
    firstPage.drawLine({
      start: { x: textX, y: lineY },
      end: { x: textX + textWidth, y: lineY },
      thickness: 0.5,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });
  }

  // วาดคำขอในหน้าแรก (สูงสุด 16 บรรทัด)
  const firstPageLines = allRequestLines.slice(0, maxRowsPerPageFirst);
  firstPageLines.forEach((line, index) => {
    const lineY = textY - (index * rowHeight);
    const adjustedY = lineY + 5;

    const requestMatch = line.match(/^(\s*ข้อ\s+[๐-๙]+)\s+/);
    if (requestMatch) {
      const requestPrefix = requestMatch[1];
      const prefixWidth = font.widthOfTextAtSize(requestPrefix, fontSize);
      const startX = textX + prefixWidth + 5;
      const endX = textX + textWidth;

      firstPage.drawLine({
        start: { x: textX, y: lineY },
        end: { x: textX + textWidth, y: lineY },
        thickness: 2,
        color: rgb(1, 1, 1),
      });

      firstPage.drawLine({
        start: { x: startX, y: lineY },
        end: { x: endX, y: lineY },
        thickness: 0.5,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });
    }

    firstPage.drawText(line, {
      x: textX,
      y: adjustedY,
      font,
      size: fontSize,
    });
  });

  // ส่วนลายเซ็น (ไม่เปลี่ยนแปลง)
  const nameX = 300;
  const nameY = copiesFieldY - 32;
  const dashLineWidth = 200;
  const defaultEmptyText = "                       ";
  const nameText = civilPlaintiffOrLawyerName ? `(${civilPlaintiffOrLawyerName})` : `(${defaultEmptyText})`;
  const nameTextWidth = font.widthOfTextAtSize(nameText, fontSize);

  firstPage.drawLine({
    start: { x: nameX, y: nameY - 1 },
    end: { x: nameX + dashLineWidth, y: nameY - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
  });

  firstPage.drawText(civilFullNameLabel, {
    x: nameX + dashLineWidth + 5,
    y: nameY,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(nameText, {
    x: nameX + (dashLineWidth - nameTextWidth) / 2,
    y: nameY - 20,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  if (totalLines > maxRowsPerPageFirst) {
    firstPage.drawText("(พลิก)", {
      x: 500,
      y: nameY - 20,
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  }

  // หน้าที่เพิ่มเติม (ปรับเป็น 22 บรรทัด และ Y=731)
  if (totalLines > maxRowsPerPageFirst) {
    const remainingLines = allRequestLines.slice(maxRowsPerPageFirst);
    for (let i = 0; i < remainingLines.length; i += maxRowsPerPageAdditional) {
      const additionalPage = pdfDoc.addPage([595.28, 841.89]);

      // หัวหน้าแบบ (๔๐ ก.)
      additionalPage.drawText("(๔๐ ก.)", { x: 70, y: 790, font, size: fontSize, color: rgb(0, 0, 0) });

      // วาดเส้นประไข่ปลา 22 บรรทัด
      for (let j = 0; j < maxRowsPerPageAdditional; j++) {
        const lineY = textYAdditional - (j * rowHeight);
        additionalPage.drawLine({
          start: { x: textX, y: lineY },
          end: { x: textX + textWidth, y: lineY },
          thickness: 0.5,
          color: rgb(0, 0, 0),
          dashArray: [1, 1],
        });
      }

      // วาดคำขอที่เกิน
      const pageLines = remainingLines.slice(i, i + maxRowsPerPageAdditional);
      pageLines.forEach((line, index) => {
        const lineY = textYAdditional - (index * rowHeight);
        const adjustedY = lineY + 5;

        const requestMatch = line.match(/^(\s*ข้อ\s+[๐-๙]+)\s+/);
        if (requestMatch) {
          const requestPrefix = requestMatch[1];
          const prefixWidth = font.widthOfTextAtSize(requestPrefix, fontSize);
          const startX = textX + prefixWidth + 5;
          const endX = textX + textWidth;

          additionalPage.drawLine({
            start: { x: textX, y: lineY },
            end: { x: textX + textWidth, y: lineY },
            thickness: 2,
            color: rgb(1, 1, 1),
          });

          additionalPage.drawLine({
            start: { x: startX, y: lineY },
            end: { x: endX, y: lineY },
            thickness: 0.5,
            color: rgb(0, 0, 0),
            dashArray: [1, 1],
          });
        }

        additionalPage.drawText(line, {
          x: textX,
          y: adjustedY,
          font,
          size: fontSize,
        });
      });

      // เพิ่ม "(พลิก)" ถ้ามีหน้าต่อไป
      if (i + maxRowsPerPageAdditional < remainingLines.length) {
        additionalPage.drawText("(พลิก)", {
          x: 500,
          y: textYAdditional - (maxRowsPerPageAdditional * rowHeight) - 20,
          font,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      }
    }
  }
}else if (requestType === "criminal") {
  console.log("Generating Criminal Request Section");
  console.log("Criminal Requests:", criminalRequests);
  console.log("Law Text:", lawText);

  const maxRowsPerPageFirst = 17; // จำนวนบรรทัดสูงสุดในหน้าแรกยังคง 17
  const maxRowsPerPageAdditional = 22; // จำนวนเส้นประไข่ปลาและสูงสุดในหน้าต่อไป 22 บรรทัด
  const rowHeight = 32;
  const textX = 70;
  const textY = 688; // ตำแหน่ง Y หน้าแรกคงเดิม
  const textYAdditional = 731; // ตำแหน่ง Y หน้าต่อไปให้ตรงกับเนื้อหาคำฟ้อง
  const textWidth = 465;
  const tabWidth = 64;

  let requestText = "";
  let lawLines = ["ต่อกฏหมายและบทมาตราดังนี้ คือ ", "", "", ""]; // 4 บรรทัด
  if (lawText) {
    const rawLawLines = lawText.split("\n").map(line => line.trim()).filter(line => line);
    rawLawLines.forEach((line, index) => {
      if (index < 4) {
        lawLines[index] = index === 0 ? `ต่อกฏหมายและบทมาตราดังนี้ คือ ${line}` : line;
      }
    });
  }
  requestText = lawLines.join("\n"); // รวม 4 บรรทัด
  const indentSpaces = "                           ";
  requestText += `\n${indentSpaces}ขอให้ศาลออกหมาย${summonWord}จำเลยมาพิจารณาพิพากษาลงโทษตาม`; // บรรทัดที่ 5
  requestText += "\nกฏหมายและขอให้ศาลสั่งและบังคับจำเลยตามคำขอต่อไปนี้"; // บรรทัดที่ 6
  criminalRequests.forEach((request) => {
    requestText += `\n\t${window.convertArabicToThai(request.index.toString())}. ${request.text}`; // บรรทัดที่ 7 ขึ้นไป
  });

  const requestLinesRaw = requestText.split("\n");
  let allRequestLines = [];
  requestLinesRaw.forEach((line) => {
    const wrapped = wrapText(line, font, fontSize, textWidth, tabWidth);
    allRequestLines = allRequestLines.concat(wrapped); // แก้จาก allWrappedLines เป็น allRequestLines
  });
  console.log("Request Text:", requestText);
  console.log("Raw Lines:", requestLinesRaw);
  console.log("All Wrapped Lines:", allRequestLines);

  const totalLines = allRequestLines.length; // กำหนด totalLines ที่นี่
  console.log("Total Criminal Lines:", totalLines); // ย้ายมาไว้หลังกำหนดค่า

  // หน้าแรก
  const firstPage = pdfDoc.addPage([595.28, 841.89]);
  firstPage.drawText("O", { x: 70, y: 790, font, size: 30, color: rgb(0, 0, 0) });
  firstPage.drawText("(๕)", { x: 90, y: 790, font, size: 18, color: rgb(0, 0, 0) });
  firstPage.drawText("คำขอท้ายคำฟ้องอาญา", { x: 85, y: 760, font, size: 20, color: rgb(0, 0, 0) });
  firstPage.drawText("                   การที่จำเลยได้กระทำตามข้อความที่กล่าวมาในคำฟ้องนั้น ข้าพเจ้าถือว่าเป็นความผิด", { x: 70, y: 720, font, size: 16, color: rgb(0, 0, 0) });
  firstPage.drawText("                            ข้าพเจ้าได้ยื่นสำเนาคำฟ้องโดยข้อความถูกต้องเป็นอย่างเดียวกันมาด้วย", { x: 70, y: 144, font, size: 16, color: rgb(0, 0, 0) });

  const copiesFieldX = 70;
  const copiesFieldY = 112;
  const copiesFieldWidth = 60;
  const copiesThai = requestCopies ? window.convertArabicToThai(requestCopies.toString()) : "";
  const copiesThaiWidth = font.widthOfTextAtSize(copiesThai, fontSize);

  firstPage.drawText(copiesThai, {
    x: copiesFieldX + (copiesFieldWidth - copiesThaiWidth) / 2,
    y: copiesFieldY,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawLine({
    start: { x: copiesFieldX, y: copiesFieldY - 1 },
    end: { x: copiesFieldX + copiesFieldWidth, y: copiesFieldY - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
  });

  const remainingText = "ฉบับและรอฟังคำสั่งอยู่ ถ้าไม่รอให้ถือว่าทราบแล้ว";
  firstPage.drawText(remainingText, {
    x: copiesFieldX + copiesFieldWidth + 5,
    y: copiesFieldY,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  // วาดเส้นประไข่ปลาในหน้าแรก (17 บรรทัด)
  for (let j = 0; j < maxRowsPerPageFirst; j++) {
    const lineY = textY - (j * rowHeight);
    firstPage.drawLine({
      start: { x: textX, y: lineY },
      end: { x: textX + textWidth, y: lineY },
      thickness: 0.5,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });
  }

  // วาดคำขอในหน้าแรก (สูงสุด 17 บรรทัด)
  const firstPageLines = allRequestLines.slice(0, maxRowsPerPageFirst);
  const summonWordFieldX = textX + font.widthOfTextAtSize(indentSpaces + "ขอให้ศาลออกหมาย", fontSize);
  const summonWordFieldWidth = 60;
  const summonWordWidth = font.widthOfTextAtSize(summonWord, fontSize);

  firstPageLines.forEach((line, index) => {
    const lineY = textY - (index * rowHeight);
    const adjustedY = lineY + 5;

    const containsSummonWord = line.includes(`ขอให้ศาลออกหมาย${summonWord}จำเลยมาพิจารณาพิพากษาลงโทษตาม`);
    const containsLawText = line.includes("กฏหมายและขอให้ศาลสั่งและบังคับจำเลยตามคำขอต่อไปนี้");
    const isLawLine = lawLines.some(lawLine => line.trim() === lawLine.trim());

    if (containsSummonWord) {
      firstPage.drawLine({
        start: { x: textX, y: lineY },
        end: { x: summonWordFieldX, y: lineY },
        thickness: 2,
        color: rgb(1, 1, 1),
      });
      firstPage.drawLine({
        start: { x: summonWordFieldX + summonWordFieldWidth, y: lineY },
        end: { x: textX + textWidth, y: lineY },
        thickness: 2,
        color: rgb(1, 1, 1),
      });

      firstPage.drawText(indentSpaces + "ขอให้ศาลออกหมาย", {
        x: textX,
        y: adjustedY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(summonWord, {
        x: summonWordFieldX + (summonWordFieldWidth - summonWordWidth) / 2,
        y: adjustedY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      firstPage.drawLine({
        start: { x: summonWordFieldX, y: lineY - 1 },
        end: { x: summonWordFieldX + summonWordFieldWidth, y: lineY - 1 },
        thickness: 1,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });

      firstPage.drawText("จำเลยมาพิจารณาพิพากษาลงโทษตาม", {
        x: summonWordFieldX + summonWordFieldWidth + 5,
        y: adjustedY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    } else if (containsLawText) {
      firstPage.drawLine({
        start: { x: textX, y: lineY },
        end: { x: textX + textWidth, y: lineY },
        thickness: 2,
        color: rgb(1, 1, 1),
      });

      firstPage.drawText("กฏหมายและขอให้ศาลสั่งและบังคับจำเลยตามคำขอต่อไปนี้", {
        x: textX,
        y: adjustedY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    } else if (isLawLine) {
      const ggPrefix = "ต่อกฏหมายและบทมาตราดังนี้ คือ ";
      const ggWidth = font.widthOfTextAtSize(ggPrefix, fontSize);
      const startX = index === 0 ? textX + ggWidth : textX;
      const endX = textX + textWidth;

      firstPage.drawLine({
        start: { x: textX, y: lineY },
        end: { x: textX + textWidth, y: lineY },
        thickness: 2,
        color: rgb(1, 1, 1),
      });

      firstPage.drawLine({
        start: { x: startX, y: lineY },
        end: { x: endX, y: lineY },
        thickness: 0.5,
        color: rgb(0, 0, 0),
        dashArray: [1, 1],
      });

      firstPage.drawText(line, {
        x: textX,
        y: adjustedY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    } else {
      const requestMatch = line.match(/^(\s*[๐-๙]+\.)\s+/);
      if (requestMatch) {
        const prefix = requestMatch[1];
        const prefixWidth = font.widthOfTextAtSize(prefix, fontSize);
        const startX = textX + prefixWidth + 5;
        const endX = textX + textWidth;

        firstPage.drawLine({
          start: { x: textX, y: lineY },
          end: { x: textX + textWidth, y: lineY },
          thickness: 2,
          color: rgb(1, 1, 1),
        });

        firstPage.drawLine({
          start: { x: startX, y: lineY },
          end: { x: endX, y: lineY },
          thickness: 0.5,
          color: rgb(0, 0, 0),
          dashArray: [1, 1],
        });
      }

      firstPage.drawText(line, {
        x: textX,
        y: adjustedY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    }
  });

  // ส่วนลายเซ็น
  const nameX = 300;
  const nameY = copiesFieldY - 32;
  const dashLineWidth = 200;
  const defaultEmptyText = "                       ";
  const nameText = criminalPlaintiffOrLawyerName ? `(${criminalPlaintiffOrLawyerName})` : `(${defaultEmptyText})`;
  const nameTextWidth = font.widthOfTextAtSize(nameText, fontSize);

  firstPage.drawLine({
    start: { x: nameX, y: nameY - 1 },
    end: { x: nameX + dashLineWidth, y: nameY - 1 },
    thickness: 1,
    color: rgb(0, 0, 0),
    dashArray: [1, 1],
  });

  firstPage.drawText(criminalFullNameLabel, {
    x: nameX + dashLineWidth + 5,
    y: nameY,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(nameText, {
    x: nameX + (dashLineWidth - nameTextWidth) / 2,
    y: nameY - 20,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  if (totalLines > maxRowsPerPageFirst) { // เกิน 17 บรรทัด
    firstPage.drawText("(พลิก)", {
      x: 500,
      y: nameY - 20,
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  }

  // หน้าที่เพิ่มเติม
  if (totalLines > maxRowsPerPageFirst) { // เกิน 17 บรรทัด
    const remainingLines = allRequestLines.slice(maxRowsPerPageFirst);
    console.log("Remaining Lines for Additional Pages:", remainingLines);
    for (let i = 0; i < remainingLines.length; i += maxRowsPerPageAdditional) {
      const additionalPage = pdfDoc.addPage([595.28, 841.89]);

      // หัวหน้าแบบ (๔๐ ก.)
      additionalPage.drawText("(๔๐ ก.)", { x: 70, y: 790, font, size: fontSize, color: rgb(0, 0, 0) });

      // วาดเส้นประไข่ปลา 22 บรรทัด
      for (let j = 0; j < maxRowsPerPageAdditional; j++) {
        const lineY = textYAdditional - (j * rowHeight);
        additionalPage.drawLine({
          start: { x: textX, y: lineY },
          end: { x: textX + textWidth, y: lineY },
          thickness: 0.5,
          color: rgb(0, 0, 0),
          dashArray: [1, 1],
        });
      }

      // วาดคำขอที่เกิน (สูงสุด 22 บรรทัดต่อหน้า)
      const pageLines = remainingLines.slice(i, i + maxRowsPerPageAdditional);
      pageLines.forEach((line, index) => {
        const lineY = textYAdditional - (index * rowHeight);
        const adjustedY = lineY + 5;

        const requestMatch = line.match(/^(\s*[๐-๙]+\.)\s+/);
        if (requestMatch) {
          const prefix = requestMatch[1];
          const prefixWidth = font.widthOfTextAtSize(prefix, fontSize);
          const startX = textX + prefixWidth + 5;
          const endX = textX + textWidth;

          additionalPage.drawLine({
            start: { x: textX, y: lineY },
            end: { x: textX + textWidth, y: lineY },
            thickness: 2,
            color: rgb(1, 1, 1),
          });

          additionalPage.drawLine({
            start: { x: startX, y: lineY },
            end: { x: endX, y: lineY },
            thickness: 0.5,
            color: rgb(0, 0, 0),
            dashArray: [1, 1],
          });
        }

        additionalPage.drawText(line, {
          x: textX,
          y: adjustedY,
          font,
          size: fontSize,
        });
      });

      // เพิ่ม "(พลิก)" ถ้ามีหน้าต่อไป
      if (remainingLines.length > i + maxRowsPerPageAdditional) {
        additionalPage.drawText("(พลิก)", {
          x: 500,
          y: textYAdditional - (maxRowsPerPageAdditional * rowHeight) - 20,
          font,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      }
    }
  }
}

if (multiplePlaintiffs || multipleDefendants) {
  const maxRowsPerPage = 22;
  const rowHeight = 32;
  const textX = 70;
  const textY = 731;
  const textWidth = 465;
  const tabSpace = "        ";

  let fullText = "เอกสารระบุข้อมูลโจทก์ - จำเลย เพิ่มเติม\n";

  // สร้างข้อมูลโจทก์
  if (multiplePlaintiffs) {
    plaintiffs.forEach((name, idx) => {
      const plaintiffInfo = window.plaintiffData[idx];
      let line = `${tabSpace}โจทก์ที่ ${window.convertArabicToThai((idx + 1).toString())} ${name || ""}`;
      if (plaintiffInfo.idCard) line += plaintiffInfo.type === "individual" 
        ? ` เลขประจำตัวประชาชน ${window.convertArabicToThai(formatIdCard(plaintiffInfo.idCard))}` 
        : ` เลขทะเบียนนิติบุคคล ${window.convertArabicToThai(plaintiffInfo.idCard)}`;
      if (plaintiffInfo.nationality) line += ` เชื้อชาติ ${plaintiffNationalities[idx]}`;
      if (plaintiffInfo.citizenship) line += ` สัญชาติ ${plaintiffCitizenships[idx]}`;
      if (plaintiffInfo.occupation) line += ` อาชีพ ${plaintiffOccupations[idx]}`;
      if (plaintiffInfo.age) line += ` อายุ ${plaintiffAges[idx]}`;
      if (plaintiffInfo.houseNumber) line += ` อยู่บ้านเลขที่ ${plaintiffHouseNumbers[idx]}`;
      if (plaintiffInfo.village) line += ` หมู่ที่ ${plaintiffVillages[idx]}`;
      if (plaintiffInfo.road) line += ` ถนน ${plaintiffRoads[idx]}`;
      if (plaintiffInfo.alley) line += ` ตรอก/ซอย ${plaintiffAlleys[idx]}`;
      if (plaintiffInfo.subDistrict) line += ` ตำบล/แขวง ${plaintiffSubDistricts[idx]}`;
      if (plaintiffInfo.district) line += ` เขต/อำเภอ ${plaintiffDistricts[idx]}`;
      if (plaintiffInfo.province) line += ` จังหวัด ${plaintiffProvinces[idx]}`;
      if (plaintiffInfo.postalCode) line += ` รหัสไปรษณีย์ ${plaintiffPostalCodes[idx]}`;
      if (plaintiffInfo.phone) line += ` โทรศัพท์ ${plaintiffPhones[idx]}`;
      if (plaintiffInfo.fax) line += ` โทรสาร ${plaintiffFaxes[idx]}`;
      if (plaintiffInfo.email) line += ` ไปรษณีย์อิเล็กทรอนิกส์ ${plaintiffEmails[idx]}`;
      fullText += line + "\n";
    });
  }

  // สร้างข้อมูลจำเลย
  if (multipleDefendants) {
    defendants.forEach((name, idx) => {
      const defendantInfo = window.defendantData[idx];
      let line = `${tabSpace}จำเลยที่ ${window.convertArabicToThai((idx + 1).toString())} ${name || ""}`;
      if (defendantInfo.idCard) line += defendantInfo.type === "individual" 
        ? ` เลขประจำตัวประชาชน ${window.convertArabicToThai(formatIdCard(defendantInfo.idCard))}` 
        : ` เลขทะเบียนนิติบุคคล ${window.convertArabicToThai(defendantInfo.idCard)}`;
      if (defendantInfo.nationality) line += ` เชื้อชาติ ${defendantNationalities[idx]}`;
      if (defendantInfo.citizenship) line += ` สัญชาติ ${defendantCitizenships[idx]}`;
      if (defendantInfo.occupation) line += ` อาชีพ ${defendantOccupations[idx]}`;
      if (defendantInfo.age) line += ` อายุ ${defendantAges[idx]}`;
      if (defendantInfo.houseNumber) line += ` อยู่บ้านเลขที่ ${defendantHouseNumbers[idx]}`;
      if (defendantInfo.village) line += ` หมู่ที่ ${defendantVillages[idx]}`;
      if (defendantInfo.road) line += ` ถนน ${defendantRoads[idx]}`;
      if (defendantInfo.alley) line += ` ตรอก/ซอย ${defendantAlleys[idx]}`;
      if (defendantInfo.subDistrict) line += ` ตำบล/แขวง ${defendantSubDistricts[idx]}`;
      if (defendantInfo.district) line += ` เขต/อำเภอ ${defendantDistricts[idx]}`;
      if (defendantInfo.province) line += ` จังหวัด ${defendantProvinces[idx]}`;
      if (defendantInfo.postalCode) line += ` รหัสไปรษณีย์ ${defendantPostalCodes[idx]}`;
      if (defendantInfo.phone) line += ` โทรศัพท์ ${defendantPhones[idx]}`;
      if (defendantInfo.fax) line += ` โทรสาร ${defendantFaxes[idx]}`;
      if (defendantInfo.email) line += ` ไปรษณีย์อิเล็กทรอนิกส์ ${defendantEmails[idx]}`;
      fullText += line + "\n";
    });
  }

  // สร้างหน้าเดียวสำหรับข้อมูลนี้
  const currentPage = pdfDoc.addPage([595.28, 841.89]);
  currentPage.drawText("(๔๐ ก.)", { x: 70, y: 790, font, size: fontSize, color: rgb(0, 0, 0) });

  // วาดเส้นประไข่ปลา 22 บรรทัด (สูงสุด 1 หน้า)
  for (let j = 0; j < maxRowsPerPage; j++) {
    const lineY = textY - (j * rowHeight);
    currentPage.drawLine({
      start: { x: textX, y: lineY },
      end: { x: textX + textWidth, y: lineY },
      thickness: 0.5,
      color: rgb(0, 0, 0),
      dashArray: [1, 1],
    });
  }

  // วาดข้อความทั้งหมดในหน้าเดียว
  currentPage.drawText(fullText, {
    x: textX,
    y: textY,
    font,
    size: fontSize,
    lineHeight: rowHeight,
    maxWidth: textWidth,
    wordBreaks: [""],
  });
}

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return null;
  }
}

// ฟังก์ชันอื่นๆ คงไว้ตามเดิม
export async function loadResources() {
  if (!window.cachedFont) {
    const fontUrl = "fonts/THSarabunNew.ttf";
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) {
      throw new Error("ไม่สามารถโหลดฟอนต์ได้ - ตรวจสอบไฟล์ใน fonts/THSarabunNew.ttf");
    }
    window.cachedFont = await fontResponse.arrayBuffer();
  }
  
  if (!window.cachedGarudaSeal) {
    const garudaSealUrl = "images/garuda_seal.png";
    const garudaSealResponse = await fetch(garudaSealUrl);
    if (!garudaSealResponse.ok) {
      throw new Error("ไม่สามารถโหลดรูป images/garuda_seal.png ได้ - ตรวจสอบว่าไฟล์อยู่ในโฟลเดอร์ images");
    }
    window.cachedGarudaSeal = await garudaSealResponse.arrayBuffer();
  }
  
  if (!window.cachedCurlyBraces) {
    const curlyBracesUrl = "images/curly_braces.png";
    const curlyBracesResponse = await fetch(curlyBracesUrl);
    if (!curlyBracesResponse.ok) {
      throw new Error("ไม่สามารถโหลดรูป images/curly_braces.png ได้ - ตรวจสอบว่าไฟล์อยู่ในโฟลเดอร์ images");
    }
    window.cachedCurlyBraces = await curlyBracesResponse.arrayBuffer();
  }
  
  if (!window.fontkit) {
    window.fontkit = await import("https://unpkg.com/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js").then(module => module.default);
  }
}

export function getCurrentThaiDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const yearBE = today.getFullYear() + 543;
  return `${day}/${month}/${yearBE}`;
}

export function convertArabicToThai(text) {
  const arabicDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
  let result = text.toString();
  for (let i = 0; i < arabicDigits.length; i++) {
    result = result.split(arabicDigits[i]).join(thaiDigits[i]);
  }
  return result;
}

export function formatThaiNumber(number) {
  if (!number) return "";
  const cleanNumber = number.toString().replace(/[^0-9]/g, "");
  const formatted = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return convertArabicToThai(formatted);
}

function formatIdCard(idCard) {
  if (!idCard || idCard.length !== 13) return idCard || "";
  return `${idCard[0]}-${idCard.slice(1, 5)}-${idCard.slice(5, 10)}-${idCard.slice(10, 12)}-${idCard[12]}`;
}

function formatNumberWithCommas(number) {
  if (!number) return "";
  const cleanNumber = number.toString().replace(/[^0-9]/g, "");
  return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function initializeAmountBahtInput() {
  const amountBahtInput = document.getElementById("amountBahtInput");
  if (amountBahtInput) {
    amountBahtInput.addEventListener("input", (e) => {
      const rawValue = e.target.value.replace(/,/g, "");
      const formattedValue = formatNumberWithCommas(rawValue);
      e.target.value = formattedValue;
    });
  }
}

// ฟังก์ชันปรับขนาด textarea โดยไม่รีเซ็ตจากศูนย์ขณะพิมพ์
function autoResizeTextarea(preserveFocus = false) {
  const textarea = document.getElementById("complaintContentInput");
  if (textarea) {
    // บันทึกตำแหน่งโฟกัสและการเลื่อน ถ้าต้องการรักษาโฟกัส
    let scrollTop = textarea.scrollTop;
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;

    // ถ้าไม่ใช่การ preserveFocus (เช่น ตอนโหลดหน้าใหม่) ให้รีเซ็ตความสูง
    if (!preserveFocus) {
      textarea.style.height = "auto"; // รีเซ็ตเฉพาะตอนโหลดหน้า
    }

    // ปรับความสูงตาม scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;

    // คืนค่าตำแหน่งโฟกัสและการเลื่อน
    if (preserveFocus) {
      textarea.scrollTop = scrollTop;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }
  }
}

// ฟังก์ชันเริ่มต้นสำหรับ textarea
function initializeComplaintContentInput() {
  const complaintContentInput = document.getElementById("complaintContentInput");
  if (complaintContentInput) {
    // ตั้งค่า line-height
    complaintContentInput.style.lineHeight = "3";

    // โหลดเนื้อหาจาก localStorage (ถ้ามี)
    const savedContent = localStorage.getItem("complaintContent") || "";
    complaintContentInput.value = savedContent;

    // จัดการ Tab key
    complaintContentInput.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = complaintContentInput.selectionStart;
        const end = complaintContentInput.selectionEnd;
        const value = complaintContentInput.value;
        complaintContentInput.value = value.substring(0, start) + "\t" + value.substring(end);
        const newPosition = start + 1;
        complaintContentInput.selectionStart = complaintContentInput.selectionEnd = newPosition;

        window.debouncedUpdatePreview();
        autoResizeTextarea(true); // ปรับขนาดโดยรักษาโฟกัส
      }
    });

    // ปรับขนาดเมื่อพิมพ์ โดยไม่รีเซ็ตจากศูนย์
    complaintContentInput.addEventListener("input", () => {
      autoResizeTextarea(true); // ปรับขนาดโดยรักษาโฟกัส
      // บันทึกเนื้อหาลง localStorage (ถ้าต้องการ)
      localStorage.setItem("complaintContent", complaintContentInput.value);
    });
  }
}

// เรียกเมื่อ DOM โหลดเสร็จ (รีเซ็ตความสูงเฉพาะตอนนี้)
document.addEventListener("DOMContentLoaded", () => {
  initializeComplaintContentInput();
  initializeAmountBahtInput();

  // รีเซ็ตและปรับความสูงครั้งแรกตอนโหลดหน้า
  setTimeout(() => autoResizeTextarea(false), 100); // ไม่รักษาโฟกัส เพราะเป็นการโหลดหน้าใหม่
});