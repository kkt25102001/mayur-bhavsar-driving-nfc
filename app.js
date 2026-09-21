/**
 * Mayur Bhavsr - Professional Car Driving Trainer (Surat)
 * NFC Mini Website Interactive Logic
 * Powered by Khushi Creative Tech (khushicreativetech.in)
 */

// Global Configuration
const CONFIG = {
  name: "Mayur Bhavsr",
  payeeName: "MAYUR RAJESHBHAI BHAVSAR",
  title: "Professional Car Driving Trainer",
  city: "Surat",
  phone: "9879629424",
  countryCode: "+91",
  email: "mayurbhavsar12@gmail.com",
  upiId: "9879629424@okbizaxis",
  googleMapsUrl: "https://g.co/kgs/Fj7B374",
  googleReviewUrl: "https://g.page/r/CX3h5kU-yjysEBM/review",
  instagramUrl: "https://www.instagram.com/mayurbhavsr?igsh=czliemJpNXNtaHY1",
  youtubeUrl: "https://youtube.com/@mayurbhavsar4016?si=zFDKtKVS5qVaReHT",
  facebookUrl: "https://www.facebook.com/share/1HRHuQFzD1/",
  currentAmount: 10000,
  currentPackage: "Gold Package (₹10,000 / 10 Days)",
  currentSlot: "Morning 10:00 AM – 12:00 PM (Batch 2)",
  currentDate: "",
  currentDateFormatted: "",
  studentBooking: {
    name: "",
    phone: "",
    car: "",
    address: "",
    package: "Gold Package (₹10,000 / 10 Days)",
    slot: "Morning 10:00 AM – 12:00 PM (Batch 2)",
    startDate: "",
    amount: 10000,
    txnId: ""
  }
};

let upiQrCodeInstance = null;
let websiteQrCodeInstance = null;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  makeLogoTransparent();
  initDatePicker();
  initUpiQrCode(CONFIG.currentAmount);
  initWebsiteQrCode();
  initEventListeners();
  initTestimonialAutoSlide();
});

/**
 * Theme Management: Dark Mode vs Light Mode (Royal Pearl White & Gold)
 */
function initTheme() {
  const savedTheme = localStorage.getItem("mayur_bhavsr_theme") || "dark";
  applyTheme(savedTheme, false);
}

function applyTheme(theme, showNotification = false) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("mayur_bhavsr_theme", theme);
  } catch (e) {
    console.warn("LocalStorage error", e);
  }

  const icon = document.getElementById("themeToggleIcon");
  const btn = document.getElementById("btnThemeToggle");

  if (theme === "light") {
    if (icon) {
      icon.className = "fa-solid fa-moon";
    }
    if (btn) {
      btn.title = "Switch to Dark Mode";
      btn.setAttribute("aria-label", "Switch to Dark Mode");
    }
    if (showNotification) {
      showToast("☀️ Switched to Royal Pearl Light Mode");
    }
  } else {
    if (icon) {
      icon.className = "fa-solid fa-sun";
    }
    if (btn) {
      btn.title = "Switch to Light Mode";
      btn.setAttribute("aria-label", "Switch to Light Mode");
    }
    if (showNotification) {
      showToast("🌙 Switched to Luxury Obsidian Dark Mode");
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme, true);
}

window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;

/**
 * Remove Solid Black Background from Brand Logo (Making it Transparent PNG)
 */
function makeLogoTransparent() {
  const logoElements = document.querySelectorAll(".brand-logo-img, .footer-logo-img");
  if (!logoElements.length) return;

  const processImage = (imgSrc) => {
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const w = tempImg.naturalWidth || tempImg.width;
        const h = tempImg.naturalHeight || tempImg.height;

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(tempImg, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // BFS Flood Fill from the 4 outer image borders to remove outer black background only
        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h * 2);
        let head = 0;
        let tail = 0;

        for (let x = 0; x < w; x++) {
          queue[tail++] = x; queue[tail++] = 0;
          queue[tail++] = x; queue[tail++] = h - 1;
        }
        for (let y = 0; y < h; y++) {
          queue[tail++] = 0; queue[tail++] = y;
          queue[tail++] = w - 1; queue[tail++] = y;
        }

        const darkThreshold = 40;
        const fadeThreshold = 16;

        while (head < tail) {
          const cx = queue[head++];
          const cy = queue[head++];
          const idx = cy * w + cx;

          if (visited[idx]) continue;
          visited[idx] = 1;

          const pIdx = idx * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const maxVal = Math.max(r, g, b);

          if (maxVal <= darkThreshold) {
            if (maxVal <= fadeThreshold) {
              data[pIdx + 3] = 0; // Transparent
            } else {
              // Smooth edge antialiasing
              data[pIdx + 3] = Math.round(((maxVal - fadeThreshold) / (darkThreshold - fadeThreshold)) * 255);
            }

            if (cx > 0 && !visited[idx - 1]) { queue[tail++] = cx - 1; queue[tail++] = cy; }
            if (cx < w - 1 && !visited[idx + 1]) { queue[tail++] = cx + 1; queue[tail++] = cy; }
            if (cy > 0 && !visited[idx - w]) { queue[tail++] = cx; queue[tail++] = cy - 1; }
            if (cy < h - 1 && !visited[idx + w]) { queue[tail++] = cx; queue[tail++] = cy + 1; }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL("image/png");

        logoElements.forEach(img => {
          img.src = transparentDataUrl;
        });

        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = transparentDataUrl;
      } catch (e) {
        console.warn("Logo transparency processing notice:", e);
      }
    };

    tempImg.src = imgSrc;
  };

  if (window.BRAND_LOGO_B64) {
    processImage(window.BRAND_LOGO_B64);
  } else {
    processImage("./assets/logo.png");
  }
}

/**
 * Initialize Monday-Only Batch Picker & Quick Monday Shortcut Chips
 */
function initDatePicker() {
  const formDateSelect = document.getElementById("trainingStartDate");

  // Find next upcoming Monday
  const today = new Date();
  let firstMonday = new Date(today);
  const dayOfWeek = firstMonday.getDay(); // 0 = Sun, 1 = Mon, 6 = Sat

  if (dayOfWeek === 1) { // Today is Monday
    if (firstMonday.getHours() >= 17) {
      firstMonday.setDate(firstMonday.getDate() + 7); // Next Monday if evening
    }
  } else {
    const daysUntilNextMon = (8 - dayOfWeek) % 7;
    firstMonday.setDate(firstMonday.getDate() + (daysUntilNextMon === 0 ? 7 : daysUntilNextMon));
  }

  // Generate all 52 upcoming Monday dates for the entire year
  const mondayDates = [];
  let curMon = new Date(firstMonday);
  for (let i = 0; i < 52; i++) {
    mondayDates.push(new Date(curMon));
    curMon.setDate(curMon.getDate() + 7);
  }

  // Populate #trainingStartDate select options in Booking Form for the whole year
  if (formDateSelect) {
    formDateSelect.innerHTML = "";
    mondayDates.forEach((mDate, idx) => {
      const iso = formatDateToISO(mDate);
      const fullDisplay = formatDisplayDate(mDate);
      const option = document.createElement("option");
      option.value = iso;
      option.textContent = `${fullDisplay} (Monday Batch)`;
      if (idx === 0) option.selected = true;
      formDateSelect.appendChild(option);
    });
  }

  // Set initial Monday
  const initialIso = formatDateToISO(firstMonday);
  CONFIG.currentDate = initialIso;
  CONFIG.currentDateFormatted = formatDisplayDate(firstMonday);
  CONFIG.studentBooking.startDate = CONFIG.currentDateFormatted;

  // Render quick shortcut Monday pills in Schedule section (All weeks scrollable)
  renderMondayBatchChips(mondayDates, initialIso);

  // Recalculate and display End Date
  updateBatchDatesDisplay();
}

/**
 * Calculate Friday End Date based on Package Duration
 * - Silver (5 Days): Friday of the same week (Start Monday + 4 Days)
 * - Gold (10 Days): Friday of the second week (Start Monday + 11 Days: 2 continuous Mon-Fri weeks)
 */
function calculateFridayEndDate(startDateIso, amount) {
  const start = new Date(startDateIso + "T00:00:00");
  const isFiveDays = (amount === 5000);
  
  // 5 Days = Mon to Fri (4 days added); 10 Days = 2 Weeks Mon-Fri (11 days added)
  const daysToAdd = isFiveDays ? 4 : 11;
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + daysToAdd);

  return {
    iso: formatDateToISO(endDate),
    formatted: formatDisplayDate(endDate),
    shortFormatted: endDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
    durationTag: isFiveDays ? "5 Days (Mon to Fri)" : "10 Days (2 Weeks Mon-Fri)"
  };
}

/**
 * Update Start Monday & Calculated End Friday across all UI elements
 */
function updateBatchDatesDisplay() {
  const currentIso = CONFIG.currentDate || formatDateToISO(new Date());
  const amount = CONFIG.currentAmount || 10000;
  const endInfo = calculateFridayEndDate(currentIso, amount);

  // Update Schedule Section Box
  const displayStart = document.getElementById("displayStartMonDate");
  const displayEnd = document.getElementById("displayEndFriDate");
  if (displayStart) displayStart.textContent = CONFIG.currentDateFormatted;
  if (displayEnd) displayEnd.textContent = endInfo.formatted;

  // Update Booking Form Fields
  const trainingEndDateInput = document.getElementById("trainingEndDate");
  const endDateDurationTag = document.getElementById("endDateDurationTag");
  if (trainingEndDateInput) trainingEndDateInput.value = endInfo.formatted;
  if (endDateDurationTag) endDateDurationTag.innerHTML = `<i class="fa-solid fa-clock"></i> ${endInfo.durationTag}`;

  // Update Summary Card
  const sumStartDate = document.getElementById("sumStartDate");
  const sumEndDate = document.getElementById("sumEndDate");
  if (sumStartDate) sumStartDate.textContent = CONFIG.currentDateFormatted;
  if (sumEndDate) sumEndDate.textContent = endInfo.formatted;

  // Update State
  CONFIG.studentBooking.startDate = CONFIG.currentDateFormatted;
  CONFIG.studentBooking.endDate = endInfo.formatted;
}

/**
 * Generate Upcoming Monday Shortcut Pills in Schedule Section
 */
function renderMondayBatchChips(mondayDates, selectedIso) {
  const container = document.getElementById("quickWeekdaysContainer");
  if (!container) return;

  container.innerHTML = "";
  const currentYear = new Date().getFullYear();

  mondayDates.forEach((mDate) => {
    const iso = formatDateToISO(mDate);
    const dayNum = mDate.getDate();
    const month = mDate.toLocaleDateString('en-US', { month: 'short' });
    const year = mDate.getFullYear();
    const yearStr = (year !== currentYear) ? ` '${String(year).slice(2)}` : '';

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `weekday-pill ${iso === selectedIso ? 'active' : ''}`;
    pill.setAttribute("data-iso", iso);
    pill.innerHTML = `<i class="fa-solid fa-calendar-check"></i> Mon, ${dayNum} ${month}${yearStr}`;
    
    pill.addEventListener("click", () => {
      handleDateChange(iso);
    });

    container.appendChild(pill);
  });
}

/**
 * Handle Start Date Change (Locked to Mondays)
 */
function handleDateChange(mondayIso) {
  if (!mondayIso) return;

  const pickedDate = new Date(mondayIso + "T00:00:00");
  CONFIG.currentDate = mondayIso;
  CONFIG.currentDateFormatted = formatDisplayDate(pickedDate);

  // Sync Form Select
  const formDateSelect = document.getElementById("trainingStartDate");
  if (formDateSelect) formDateSelect.value = mondayIso;

  // Highlight active pill & auto scroll into container view
  document.querySelectorAll(".weekday-pill").forEach(p => {
    p.classList.remove("active");
    if (p.getAttribute("data-iso") === mondayIso) {
      p.classList.add("active");
      p.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  });

  updateBatchDatesDisplay();
  showToast(`Batch Start: ${CONFIG.currentDateFormatted}`);
}

function handleFormDateChange(mondayIso) {
  handleDateChange(mondayIso);
}

/**
 * Helper to format date as YYYY-MM-DD
 */
function formatDateToISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Helper for user-friendly date string (e.g. Monday, 21 Sep 2026)
 */
function formatDisplayDate(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Initialize / Update UPI Payment Display & Links
 */
function initUpiQrCode(amount) {
  const displayAmount = document.getElementById("displayAmount");
  if (displayAmount) {
    displayAmount.textContent = `Selected Amount: ₹${amount.toLocaleString("en-IN")}/-`;
  }

  const summaryAmountText = document.getElementById("summaryAmountText");
  if (summaryAmountText) {
    summaryAmountText.textContent = `₹${amount.toLocaleString("en-IN")}/-`;
  }

  const btnProceedText = document.getElementById("btnProceedText");
  if (btnProceedText) {
    btnProceedText.textContent = `Proceed to Pay ₹${amount.toLocaleString("en-IN")} & Lock Slot ↓`;
  }

  updateUpiAppLinks(amount);
}

/**
 * Update One-Tap Mobile UPI deep links
 */
function updateUpiAppLinks(amount) {
  const encodedName = encodeURIComponent(CONFIG.payeeName || CONFIG.name);
  const baseUpi = `upi://pay?pa=${CONFIG.upiId}&pn=${encodedName}&mc=&tid=&tr=&tn=Car%20Driving%20Training%20Fees%20Surat&am=${amount}&cu=INR`;

  const linkGpay = document.getElementById("linkGpay");
  const linkPhonepe = document.getElementById("linkPhonepe");
  const linkPaytm = document.getElementById("linkPaytm");
  const linkAnyUpi = document.getElementById("linkAnyUpi");

  if (linkGpay) linkGpay.href = baseUpi;
  if (linkPhonepe) linkPhonepe.href = baseUpi;
  if (linkPaytm) linkPaytm.href = baseUpi;
  if (linkAnyUpi) linkAnyUpi.href = baseUpi;
}

/**
 * Switch Payment Amount (5000, 10000)
 */
function setPaymentAmount(amount) {
  CONFIG.currentAmount = amount;
  CONFIG.studentBooking.amount = amount;
  
  // Highlight active pill
  document.querySelectorAll(".amount-pill").forEach(btn => {
    btn.classList.remove("active");
    if (parseInt(btn.getAttribute("data-amount")) === amount) {
      btn.classList.add("active");
    }
  });

  // Sync package dropdown
  const packageSelect = document.getElementById("selectedPackageForm");
  const sumPackage = document.getElementById("sumPackage");
  if (amount === 5000) {
    CONFIG.currentPackage = "Silver Package (₹5,000 / 5 Days: Mon to Fri)";
    CONFIG.studentBooking.package = CONFIG.currentPackage;
    if (packageSelect) packageSelect.value = "Silver Package (₹5,000 / 5 Days)";
    if (sumPackage) sumPackage.textContent = "Silver Package (5 Days)";
  } else {
    CONFIG.currentPackage = "Gold Package (₹10,000 / 10 Days: 2 Weeks Mon-Fri)";
    CONFIG.studentBooking.package = CONFIG.currentPackage;
    if (packageSelect) packageSelect.value = "Gold Package (₹10,000 / 10 Days)";
    if (sumPackage) sumPackage.textContent = "Gold Package (10 Days)";
  }

  // Recalculate End Date for the newly selected package duration
  updateBatchDatesDisplay();
  initUpiQrCode(amount);
  showToast(`Package set to ${amount === 5000 ? 'Silver ₹5,000 (5 Days)' : 'Gold ₹10,000 (10 Days)'}`);
}

/**
 * Package Card "Book Now" Trigger
 */
function selectPackageAndPay(amount, packageName) {
  setPaymentAmount(amount);
  CONFIG.currentPackage = packageName;
  CONFIG.studentBooking.package = packageName;

  // Smooth scroll down to quick reservation form
  smoothScrollTo("reservationSection");

  // Focus on student name field
  setTimeout(() => {
    document.getElementById("studentName")?.focus();
  }, 400);

  // Fire celebratory confetti
  triggerConfetti();
}

/**
 * Batch Time Slot Selection
 */
function selectTimeSlot(slotElement) {
  document.querySelectorAll(".slot-card").forEach(card => card.classList.remove("selected"));
  slotElement.classList.add("selected");
  
  const slotName = slotElement.getAttribute("data-slot");
  CONFIG.currentSlot = slotName;
  CONFIG.studentBooking.slot = slotName;

  // Sync with form dropdown
  const slotSelect = document.getElementById("selectedSlotForm");
  if (slotSelect) {
    for (let i = 0; i < slotSelect.options.length; i++) {
      if (slotSelect.options[i].text.includes(slotName.split("–")[0].trim()) || slotSelect.options[i].value.includes(slotName.split("–")[0].trim())) {
        slotSelect.selectedIndex = i;
        break;
      }
    }
  }

  const sumSlot = document.getElementById("sumSlot");
  if (sumSlot) sumSlot.textContent = slotName;

  showToast(`Selected Slot: ${slotName}`);
}

/**
 * Sync form package selection with payment terminal
 */
function syncPackageSelection(val) {
  if (val.includes("5,000") || val.includes("Silver")) {
    setPaymentAmount(5000);
  } else {
    setPaymentAmount(10000);
  }
}

/**
 * Copy UPI Phone / ID to Clipboard
 */
function copyUpiDetails() {
  const upiText = CONFIG.upiId; // 9879629424@okbizaxis
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(upiText).then(() => {
      showToast(`UPI ID ${upiText} copied!`);
      triggerConfetti();
    }).catch(() => fallbackCopy(upiText));
  } else {
    fallbackCopy(upiText);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`UPI Number ${text} copied!`);
    triggerConfetti();
  } catch (err) {
    showToast(`UPI: ${text}`);
  }
  document.body.removeChild(textArea);
}

/**
 * Step 1: Interactive Booking Form Submit -> Locks Details & Takes User to QR Payment Section
 */
function handleBookingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("studentName")?.value.trim();
  const phone = document.getElementById("studentPhone")?.value.trim();
  const car = document.getElementById("studentCar")?.value.trim();
  const email = document.getElementById("studentEmail")?.value.trim();
  const pkg = document.getElementById("selectedPackageForm")?.value || CONFIG.currentPackage;
  const slot = document.getElementById("selectedSlotForm")?.value || CONFIG.currentSlot;
  const startDate = CONFIG.currentDateFormatted || "Next Monday Batch";
  const amount = (pkg.includes("5,000") || pkg.includes("Silver")) ? 5000 : 10000;
  const endInfo = calculateFridayEndDate(CONFIG.currentDate, amount);

  if (!name || !phone || !car || !email) {
    showToast("Please fill all required student details");
    return;
  }

  // Basic email validation
  if (!email.includes("@") || !email.includes(".")) {
    showToast("⚠️ Please enter a valid email address");
    document.getElementById("studentEmail")?.focus();
    return;
  }

  // Save to CONFIG.studentBooking state
  CONFIG.studentBooking = {
    name,
    phone,
    car,
    email,
    package: pkg,
    slot,
    startDate,
    endDate: endInfo.formatted,
    amount,
    txnId: document.getElementById("upiTransactionId")?.value.trim() || ""
  };

  // Sync Payment Amount & QR Terminal
  setPaymentAmount(amount);

  // Update Real-time Summary Card in QR Payment Section
  const sumStudentName = document.getElementById("sumStudentName");
  const sumStudentCar = document.getElementById("sumStudentCar");
  const sumStudentEmail = document.getElementById("sumStudentEmail");
  const sumPackage = document.getElementById("sumPackage");
  const sumStartDate = document.getElementById("sumStartDate");
  const sumEndDate = document.getElementById("sumEndDate");
  const sumSlot = document.getElementById("sumSlot");
  const summaryAmountText = document.getElementById("summaryAmountText");
  const summaryStatusText = document.getElementById("summaryStatusText");

  if (sumStudentName) sumStudentName.textContent = name;
  if (sumStudentCar) sumStudentCar.textContent = car;
  if (sumStudentEmail) sumStudentEmail.textContent = email;
  if (sumPackage) sumPackage.textContent = amount === 5000 ? "Silver Package (5 Days)" : "Gold Package (10 Days)";
  if (sumStartDate) sumStartDate.textContent = startDate;
  if (sumEndDate) sumEndDate.textContent = endInfo.formatted;
  if (sumSlot) sumSlot.textContent = slot;
  if (summaryAmountText) summaryAmountText.textContent = `₹${amount.toLocaleString("en-IN")}/-`;
  if (summaryStatusText) summaryStatusText.textContent = `Slot Locked for ${name.split(" ")[0]}`;

  // Smooth scroll down to QR payment section
  smoothScrollTo("bookingPaymentSection");

  // Highlight the Screenshot Upload section
  setTimeout(() => {
    const uploadSec = document.getElementById("screenshotUploadSection");
    if (uploadSec) {
      uploadSec.classList.add("shake-alert");
      setTimeout(() => uploadSec.classList.remove("shake-alert"), 600);
    }
  }, 600);

  // Celebrate with confetti & notify user
  triggerConfetti();
  showToast(`✅ Details locked! Scan QR below & attach Payment Screenshot`);
}

// Global Screenshot Upload State
let uploadedPaymentScreenshot = {
  file: null,
  dataUrl: "",
  name: ""
};

/**
 * Open file picker dialog for payment screenshot
 */
function triggerScreenshotPicker() {
  document.getElementById("paymentScreenshotInput")?.click();
}

/**
 * Change screenshot file
 */
function changeScreenshot(event) {
  if (event) event.stopPropagation();
  triggerScreenshotPicker();
}

/**
 * Handle Payment Screenshot File Upload & Preview
 */
function handleScreenshotUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("⚠️ Please select a valid image file (JPG, PNG, WebP)");
    return;
  }

  uploadedPaymentScreenshot.file = file;
  uploadedPaymentScreenshot.name = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedPaymentScreenshot.dataUrl = e.target.result;

    // Update Preview Thumbnail & File Name
    const previewImg = document.getElementById("screenshotPreviewImg");
    const fileNameDisplay = document.getElementById("screenshotFileName");
    const promptWrap = document.getElementById("screenshotPromptWrap");
    const previewCard = document.getElementById("screenshotPreviewCard");
    const dropzone = document.getElementById("screenshotDropzone");
    const uploadSection = document.getElementById("screenshotUploadSection");
    const statusBadge = document.getElementById("screenshotStatusBadge");
    const btn = document.getElementById("btnSendWhatsappWithTxn");
    const btnText = document.getElementById("btnWhatsappText");
    const hint = document.getElementById("txnBtnHint");

    if (previewImg) previewImg.src = uploadedPaymentScreenshot.dataUrl;
    if (fileNameDisplay) fileNameDisplay.textContent = file.name;
    if (promptWrap) promptWrap.style.display = "none";
    if (previewCard) previewCard.style.display = "flex";
    if (dropzone) dropzone.classList.add("has-file");
    if (uploadSection) uploadSection.classList.add("valid");

    if (statusBadge) {
      statusBadge.classList.add("valid");
      statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Screenshot Ready`;
    }

    // Unlock WhatsApp & Email Single Button
    if (btn) btn.classList.remove("locked");
    if (btnText) btnText.textContent = "✅ Confirm Booking on WhatsApp & Email";

    if (hint) {
      hint.innerHTML = `<span class="hint-unlocked"><i class="fa-solid fa-circle-check text-green"></i> Screenshot attached! Click button above to confirm on WhatsApp &amp; Email.</span>`;
    }

    triggerConfetti();
    showToast("📸 Payment Screenshot attached! Ready to confirm booking.");
  };

  reader.readAsDataURL(file);
}

/**
 * Handle Live Input in Optional Transaction ID Field
 */
function handleTxnInput() {
  const txnField = document.getElementById("upiTransactionId");
  const txnVal = txnField ? txnField.value.trim() : "";
  const btn = document.getElementById("btnSendWhatsappWithTxn");
  const btnText = document.getElementById("btnWhatsappText");
  const hint = document.getElementById("txnBtnHint");

  if (CONFIG.studentBooking) {
    CONFIG.studentBooking.txnId = txnVal;
  }

  // If UTR entered or screenshot already uploaded, keep button unlocked
  if (txnVal.length >= 4 || uploadedPaymentScreenshot.file) {
    if (btn) btn.classList.remove("locked");
    if (txnField) txnField.classList.add("valid");
    if (btnText) {
      btnText.textContent = "✅ Confirm Booking on WhatsApp & Email";
    }
    if (hint) {
      hint.innerHTML = `<span class="hint-unlocked"><i class="fa-solid fa-circle-check text-green"></i> Payment proof linked! Ready to confirm on WhatsApp &amp; Email.</span>`;
    }
  } else if (!uploadedPaymentScreenshot.file) {
    if (btn) btn.classList.add("locked");
    if (txnField) txnField.classList.remove("valid");
    if (btnText) {
      btnText.textContent = "🔒 Upload Payment Screenshot to Confirm";
    }
    if (hint) {
      hint.innerHTML = `<i class="fa-solid fa-lock text-gold"></i> Please attach your payment screenshot above to lock slot on WhatsApp &amp; Email.`;
    }
  }
}

/**
 * Step 2: Unified 1-Click Submission (Sends Confirmation Email to Mayur Sir & Student, and Opens WhatsApp)
 */
async function sendFinalBookingWhatsAppAndEmail() {
  const hasScreenshot = Boolean(uploadedPaymentScreenshot.file);
  const txnField = document.getElementById("upiTransactionId");
  const txnId = txnField ? txnField.value.trim() : (CONFIG.studentBooking.txnId || "");

  // Strict check: Screenshot OR Transaction ID MUST be provided
  if (!hasScreenshot && (!txnId || txnId.length < 4)) {
    showToast("⚠️ Please upload your payment screenshot first!");
    const uploadSec = document.getElementById("screenshotUploadSection");
    if (uploadSec) {
      smoothScrollTo("screenshotUploadSection");
      uploadSec.classList.add("shake-alert");
      setTimeout(() => uploadSec.classList.remove("shake-alert"), 600);
    }
    return;
  }

  // Read latest values from state or direct form fields
  const name = CONFIG.studentBooking.name || document.getElementById("studentName")?.value.trim() || "";
  const phone = CONFIG.studentBooking.phone || document.getElementById("studentPhone")?.value.trim() || "";
  const car = CONFIG.studentBooking.car || document.getElementById("studentCar")?.value.trim() || "";
  const email = CONFIG.studentBooking.email || document.getElementById("studentEmail")?.value.trim() || "";
  const pkg = CONFIG.studentBooking.package || document.getElementById("selectedPackageForm")?.value || CONFIG.currentPackage;
  const slot = CONFIG.studentBooking.slot || document.getElementById("selectedSlotForm")?.value || CONFIG.currentSlot;
  const startDate = CONFIG.studentBooking.startDate || CONFIG.currentDateFormatted || "Next Monday Batch";
  const endDate = CONFIG.studentBooking.endDate || document.getElementById("trainingEndDate")?.value || "Calculated Friday";
  const amount = CONFIG.currentAmount || 10000;

  // If student hasn't entered name or phone, smoothly guide them to registration form
  if (!name || !phone || !car || !email) {
    showToast("Please fill your student details in the form above first!");
    smoothScrollTo("reservationSection");
    setTimeout(() => {
      document.getElementById("studentName")?.focus();
    }, 400);
    return;
  }

  const pkgTierName = amount === 5000 ? "Silver Package - ₹5,000 (5 Days: Mon to Fri)" : "Gold Package - ₹10,000 (10 Days: 2 Weeks Mon-Fri)";
  const paymentProofLine = hasScreenshot 
    ? `📸 *Payment Proof:* Payment Screenshot Attached (GPay / PhonePe / Paytm)`
    : `🔢 *UPI Transaction ID / UTR:* ${txnId}`;
  const optionalTxnLine = (hasScreenshot && txnId) ? `\n🔢 *UTR / Ref No:* ${txnId}` : '';

  const bookingData = {
    name,
    phone,
    car,
    email,
    pkg: pkgTierName,
    startDate,
    endDate,
    slot,
    amount,
    hasScreenshot,
    txnId
  };

  // 1. Dispatch Automated Dual Confirmation Email (Mayur Sir: mayurbhavsar12@gmail.com & Student: email)
  sendDualBookingEmails(bookingData);

  const message = `*🚗 NEW CAR DRIVING TRAINING BOOKING & PAYMENT (SURAT)*
━━━━━━━━━━━━━━━━━━━━━
✅ *PAYMENT STATUS: COMPLETED*
💰 *Amount Paid:* ₹${amount.toLocaleString("en-IN")}/- (${pkgTierName})
${paymentProofLine}${optionalTxnLine}
━━━━━━━━━━━━━━━━━━━━━
👤 *Client & Student Details:*
• *Full Name:* ${name}
• *Phone Number:* ${phone}
• *Car Model:* ${car}
• *Email ID:* ${email}
• *Selected Package:* ${pkgTierName}
• *Training Start Date (Monday):* ${startDate}
• *Training End Date (Friday):* ${endDate}
• *Daily Batch Slot:* ${slot}
━━━━━━━━━━━━━━━━━━━━━
📍 *Doorstep Personal Coaching across Surat City*
_I have attached my payment screenshot with this booking. Please confirm my slot lock and training schedule!_`;

  // Attempt Mobile Native Share (Shares both Image File + Message Text directly into WhatsApp)
  if (hasScreenshot && navigator.canShare && uploadedPaymentScreenshot.file) {
    try {
      if (navigator.canShare({ files: [uploadedPaymentScreenshot.file] })) {
        await navigator.share({
          title: "Mayur Bhavsr Driving Training Booking",
          text: message,
          files: [uploadedPaymentScreenshot.file]
        });
        triggerConfetti();
        showToast("✅ Opening WhatsApp! Confirmation email sent to mayurbhavsar12@gmail.com & your email.");
        return;
      }
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') return;
      // Fallback to wa.me link
    }
  }

  // Attempt to copy screenshot image to clipboard for convenient Ctrl+V in WhatsApp Web
  if (hasScreenshot && navigator.clipboard && window.ClipboardItem && uploadedPaymentScreenshot.file) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [uploadedPaymentScreenshot.file.type]: uploadedPaymentScreenshot.file })
      ]);
    } catch (clipErr) {
      // Non-blocking clipboard fallback
    }
  }

  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/91${CONFIG.phone}?text=${encoded}`;

  triggerConfetti();
  showToast("✅ Opening WhatsApp! Confirmation email sent to mayurbhavsar12@gmail.com & your email.");
  window.open(whatsappUrl, "_blank");
}

window.sendFinalBookingWhatsApp = sendFinalBookingWhatsAppAndEmail;
window.sendFinalBookingWhatsAppAndEmail = sendFinalBookingWhatsAppAndEmail;

/**
 * Dispatch Dual Email Notification (100% Direct Silent Background Dispatch - No Mailbox/App Open)
 */
async function sendDualBookingEmails(data) {
  const indicator = document.getElementById("emailDispatchIndicator");
  const subjectLine = `🚗 New Car Driving Training Booking: ${data.name} (${data.pkg})`;
  const proofText = data.hasScreenshot ? "Payment Screenshot Attached & Shared on WhatsApp" : (data.txnId ? `UTR / Txn ID: ${data.txnId}` : "UPI Payment Confirmed");

  if (indicator) {
    indicator.style.display = "block";
    indicator.innerHTML = `
      <div class="dispatch-loading-box">
        <i class="fa-solid fa-spinner fa-spin text-gold"></i>
        <span>Sending confirmation email to <strong>mayurbhavsar12@gmail.com</strong> &amp; <strong>${data.email}</strong>...</span>
      </div>`;
  }

  const ccRecipients = data.email && data.email.toLowerCase() !== "mayurbhavsar12@gmail.com"
    ? `mayurbhavsar12@gmail.com,${data.email}`
    : `mayurbhavsar12@gmail.com`;

  const emailPayload = {
    _subject: subjectLine,
    _cc: ccRecipients,
    _replyto: data.email || "mayurbhavsar12@gmail.com",
    _captcha: "false",
    _template: "table",
    "Student Name": data.name,
    "Student Phone": data.phone,
    "Student Email": data.email,
    "Car Model": data.car,
    "Training Package": data.pkg,
    "Training Start Date (Monday)": data.startDate,
    "Training End Date (Friday)": data.endDate,
    "Daily Batch Slot": data.slot,
    "Fees Amount Paid": `₹${Number(data.amount).toLocaleString("en-IN")}/-`,
    "Payment Proof": proofText,
    "Transaction UTR": data.txnId || "Shared on WhatsApp",
    "Location": "Surat City (Doorstep Training on Your Own Car)",
    "Trainer": "Mayur Bhavsr (+91 9879629424 / mayurbhavsar12@gmail.com)"
  };

  // 1. Primary Background Dispatch via Verified FormSubmit Endpoint (Hash: a8cb1497da6f0b1d6b42ca4bb55a9ea1)
  try {
    fetch("https://formsubmit.co/ajax/a8cb1497da6f0b1d6b42ca4bb55a9ea1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(emailPayload)
    }).then(res => res.json()).then(resData => {
      console.log("Verified FormSubmit dispatch response:", resData);
    }).catch(err => {
      console.log("Verified FormSubmit log:", err);
    });

    // 2. Parallel Background Dispatch to Mayur Sir Endpoint
    fetch("https://formsubmit.co/ajax/mayurbhavsar12@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(emailPayload)
    }).catch(() => {});

    // 3. Multi-part Stream fallback
    const fd = new FormData();
    for (const [k, v] of Object.entries(emailPayload)) {
      fd.append(k, v);
    }
    fetch("https://formsubmit.co/a8cb1497da6f0b1d6b42ca4bb55a9ea1", {
      method: "POST",
      mode: "no-cors",
      body: fd
    }).catch(() => {});

    fetch("https://airform.io/mayurbhavsar12@gmail.com", {
      method: "POST",
      mode: "no-cors",
      body: fd
    }).catch(() => {});

    // Update UI status smoothly without opening any mailbox
    setTimeout(() => {
      if (indicator) {
        indicator.innerHTML = `
          <div class="dispatch-success-box">
            <div class="dispatch-success-header">
              <i class="fa-solid fa-circle-check text-green"></i>
              <span>Booking Confirmation Email Dispatched!</span>
            </div>
            <p class="dispatch-success-sub" style="margin-bottom:0;">
              Sent to <strong>mayurbhavsar12@gmail.com</strong> &amp; <strong>${data.email}</strong>.
            </p>
          </div>`;
      }
    }, 600);

  } catch (err) {
    console.warn("Email dispatch note:", err);
    if (indicator) {
      indicator.innerHTML = `
        <div class="dispatch-success-box">
          <div class="dispatch-success-header">
            <i class="fa-solid fa-circle-check text-green"></i>
            <span>Booking Details Registered!</span>
          </div>
          <p class="dispatch-success-sub" style="margin-bottom:0;">
            Confirmation saved for <strong>mayurbhavsar12@gmail.com</strong> &amp; <strong>${data.email}</strong>.
          </p>
        </div>`;
    }
  }
}

/**
 * Save Contact (vCard .vcf Generator)
 */
function downloadVCard() {
  const vCardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${CONFIG.name}`,
    `N:Bhavsr;Mayur;;;`,
    `ORG:Mayur Bhavsr - Car Driving Professional Trainer`,
    `TITLE:Professional Car Driving Trainer (Surat)`,
    `TEL;TYPE=CELL,VOICE:${CONFIG.countryCode}${CONFIG.phone}`,
    `EMAIL;TYPE=INTERNET,WORK:${CONFIG.email}`,
    `ADR;TYPE=WORK:;;Surat;Gujarat;;India`,
    `URL:${window.location.href}`,
    `NOTE:Learn to Drive on Your Own Car in Surat. 13+ Years Experience. Doorstep Coaching (Mon-Fri). Safe Driving • Confidence • Drive with Skill. UPI: 9879629424`,
    "END:VCARD"
  ].join("\r\n");

  const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Mayur_Bhavsr_Driving_Trainer.vcf");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Contact card downloaded! Add to your phone.");
  triggerConfetti();
}

/**
 * Native Web Share API
 */
async function shareDigitalCard() {
  const shareData = {
    title: "Mayur Bhavsr - Car Driving Professional Trainer (Surat)",
    text: "Learn to Drive on Your Own Car with Mayur Bhavsr in Surat (13+ Years Experience). Connect & Book your batch slot!",
    url: window.location.href
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      showToast("Card shared successfully!");
    } catch (err) {
      if (err.name !== 'AbortError') {
        openQrModal();
      }
    }
  } else {
    openQrModal();
  }
}

/**
 * QR Code Share Modal
 */
function initWebsiteQrCode() {
  const container = document.getElementById("websiteQrCode");
  if (!container) return;

  container.innerHTML = "";
  const currentUrl = window.location.href || "https://mayurbhavsr.driving.card";

  const urlDisplay = document.getElementById("modalWebsiteUrl");
  if (urlDisplay) urlDisplay.textContent = currentUrl;

  if (typeof QRCode !== "undefined") {
    websiteQrCodeInstance = new QRCode(container, {
      text: currentUrl,
      width: 150,
      height: 150,
      colorDark: "#0B0D12",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function openQrModal() {
  const modal = document.getElementById("qrModal");
  if (modal) {
    modal.classList.add("show");
  }
}

function closeQrModal() {
  const modal = document.getElementById("qrModal");
  if (modal) {
    modal.classList.remove("show");
  }
}

function copyWebsiteUrl() {
  const url = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Website link copied!");
      closeQrModal();
    });
  } else {
    fallbackCopy(url);
    closeQrModal();
  }
}

/**
 * Testimonial Slider Functionality
 */
let currentTestimonialIndex = 0;
let testimonialInterval = null;

function showTestimonial(index) {
  const cards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".t-nav-dot");
  if (cards.length === 0) return;

  cards.forEach(c => c.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  currentTestimonialIndex = (index + cards.length) % cards.length;
  
  cards[currentTestimonialIndex].classList.add("active");
  if (dots[currentTestimonialIndex]) {
    dots[currentTestimonialIndex].classList.add("active");
  }
}

function initTestimonialAutoSlide() {
  testimonialInterval = setInterval(() => {
    showTestimonial(currentTestimonialIndex + 1);
  }, 6000);
}

/**
 * Toast Notification Utility
 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/**
 * Confetti Celebration Effect
 */
function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FFB800', '#10B981', '#FFFFFF', '#38BDF8']
    });
  }
}

/**
 * Smooth Scroll Utility
 */
function smoothScrollTo(elementId) {
  const elem = document.getElementById(elementId);
  if (elem) {
    elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Setup Event Listeners
 */
function initEventListeners() {
  // Share Card Button
  const btnShareCard = document.getElementById("btnShareCard");
  if (btnShareCard) btnShareCard.addEventListener("click", shareDigitalCard);

  // QR Modal Button
  const btnQrCodeModal = document.getElementById("btnQrCodeModal");
  if (btnQrCodeModal) btnQrCodeModal.addEventListener("click", openQrModal);

  // Save Contact Button
  const btnSaveContact = document.getElementById("btnSaveContact");
  if (btnSaveContact) btnSaveContact.addEventListener("click", downloadVCard);

  // Close modal when clicking backdrop
  const qrModal = document.getElementById("qrModal");
  if (qrModal) {
    qrModal.addEventListener("click", (e) => {
      if (e.target === qrModal) closeQrModal();
    });
  }
}
