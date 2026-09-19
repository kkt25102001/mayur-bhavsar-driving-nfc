/**
 * Mayur Bhavsar - Professional Car Driving Trainer (Surat)
 * NFC Mini Website Interactive Logic
 * Powered by Khushi Creative Tech (khushicreativetech.in)
 */

// Global Configuration
const CONFIG = {
  name: "Mayur Bhavsar",
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
  makeLogoTransparent();
  initDatePicker();
  initUpiQrCode(CONFIG.currentAmount);
  initWebsiteQrCode();
  initEventListeners();
  initTestimonialAutoSlide();
});

/**
 * Automatically Remove Solid Black Background from Logo (Make Transparent PNG)
 */
function makeLogoTransparent() {
  const logoElements = document.querySelectorAll(".brand-logo-img, .footer-logo-img");
  if (!logoElements.length) return;

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

      // BFS Flood Fill from the 4 outer image borders to remove outer black background
      const visited = new Uint8Array(w * h);
      const queue = [];

      for (let x = 0; x < w; x++) {
        queue.push(x, 0);
        queue.push(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        queue.push(0, y);
        queue.push(w - 1, y);
      }

      const threshold = 35;

      let qIdx = 0;
      while (qIdx < queue.length) {
        const cx = queue[qIdx++];
        const cy = queue[qIdx++];
        const idx = cy * w + cx;

        if (visited[idx]) continue;
        visited[idx] = 1;

        const pIdx = idx * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];

        if (r <= threshold && g <= threshold && b <= threshold) {
          const maxVal = Math.max(r, g, b);
          if (maxVal < 14) {
            data[pIdx + 3] = 0;
          } else {
            data[pIdx + 3] = Math.round(((maxVal - 14) / (threshold - 14)) * 255);
          }

          if (cx > 0 && !visited[idx - 1]) queue.push(cx - 1, cy);
          if (cx < w - 1 && !visited[idx + 1]) queue.push(cx + 1, cy);
          if (cy > 0 && !visited[idx - w]) queue.push(cx, cy - 1);
          if (cy < h - 1 && !visited[idx + w]) queue.push(cx, cy + 1);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const transparentDataUrl = canvas.toDataURL("image/png");

      logoElements.forEach(img => {
        img.src = transparentDataUrl;
      });
    } catch (e) {
      console.warn("Logo transparency processing:", e);
    }
  };

  const firstLogo = logoElements[0];
  if (firstLogo) tempImg.src = firstLogo.src;
}

/**
 * Initialize Monday to Friday Date Picker & Quick Weekday Chips
 */
function initDatePicker() {
  const scheduleInput = document.getElementById("scheduleDateInput");
  const formDateInput = document.getElementById("trainingStartDate");

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1); // Start from tomorrow

  const minFormatted = formatDateToISO(minDate);

  if (scheduleInput) scheduleInput.min = minFormatted;
  if (formDateInput) formDateInput.min = minFormatted;

  // Find the first valid weekday (Mon-Fri)
  let initialDate = new Date(minDate);
  const day = initialDate.getDay();
  if (day === 0) { // Sunday -> move to Monday
    initialDate.setDate(initialDate.getDate() + 1);
  } else if (day === 6) { // Saturday -> move to Monday
    initialDate.setDate(initialDate.getDate() + 2);
  }

  const initialIso = formatDateToISO(initialDate);
  CONFIG.currentDate = initialIso;
  CONFIG.currentDateFormatted = formatDisplayDate(initialDate);
  CONFIG.studentBooking.startDate = CONFIG.currentDateFormatted;

  if (scheduleInput) scheduleInput.value = initialIso;
  if (formDateInput) formDateInput.value = initialIso;

  const sumStartDate = document.getElementById("sumStartDate");
  if (sumStartDate) sumStartDate.textContent = CONFIG.currentDateFormatted;

  renderQuickWeekdayChips(initialDate);
}

/**
 * Generate 5 upcoming Monday to Friday shortcut pills
 */
function renderQuickWeekdayChips(startDate) {
  const container = document.getElementById("quickWeekdaysContainer");
  if (!container) return;

  container.innerHTML = "";
  const weekdays = [];
  let cur = new Date(startDate);

  while (weekdays.length < 5) {
    const d = cur.getDay();
    if (d >= 1 && d <= 5) { // Mon to Fri
      weekdays.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  weekdays.forEach((wDate, idx) => {
    const iso = formatDateToISO(wDate);
    const dayName = wDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = wDate.getDate();
    const month = wDate.toLocaleDateString('en-US', { month: 'short' });

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `weekday-pill ${idx === 0 ? 'active' : ''}`;
    pill.setAttribute("data-iso", iso);
    pill.innerHTML = `<i class="fa-regular fa-calendar"></i> ${dayName}, ${dayNum} ${month}`;
    
    pill.addEventListener("click", () => {
      handleDateChange(iso);
    });

    container.appendChild(pill);
  });
}

/**
 * Handle Date Picker changes with strict Monday to Friday enforcement
 */
function handleDateChange(isoValue) {
  if (!isoValue) return;

  const pickedDate = new Date(isoValue + "T00:00:00");
  const dayOfWeek = pickedDate.getDay(); // 0: Sun, 6: Sat

  let finalDate = new Date(pickedDate);

  if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend selected!
    const daysToAdd = (dayOfWeek === 6) ? 2 : 1;
    finalDate.setDate(finalDate.getDate() + daysToAdd);
    const correctedIso = formatDateToISO(finalDate);

    showToast(`⚠️ Batches run Mon to Fri only. Adjusted to Monday (${formatDisplayDate(finalDate)})`);
    isoValue = correctedIso;
  }

  CONFIG.currentDate = isoValue;
  CONFIG.currentDateFormatted = formatDisplayDate(finalDate);
  CONFIG.studentBooking.startDate = CONFIG.currentDateFormatted;

  // Sync inputs
  const scheduleInput = document.getElementById("scheduleDateInput");
  const formDateInput = document.getElementById("trainingStartDate");

  if (scheduleInput) scheduleInput.value = isoValue;
  if (formDateInput) formDateInput.value = isoValue;

  const sumStartDate = document.getElementById("sumStartDate");
  if (sumStartDate) sumStartDate.textContent = CONFIG.currentDateFormatted;

  // Highlight active pill if matches
  document.querySelectorAll(".weekday-pill").forEach(p => {
    p.classList.remove("active");
    if (p.getAttribute("data-iso") === isoValue) {
      p.classList.add("active");
    }
  });

  showToast(`Start Date: ${CONFIG.currentDateFormatted}`);
}

function handleFormDateChange(isoValue) {
  handleDateChange(isoValue);
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
    CONFIG.currentPackage = "Silver Package (₹5,000 / 5 Days)";
    CONFIG.studentBooking.package = CONFIG.currentPackage;
    if (packageSelect) packageSelect.value = "Silver Package (₹5,000 / 5 Days)";
    if (sumPackage) sumPackage.textContent = "Silver (5 Days)";
  } else {
    CONFIG.currentPackage = "Gold Package (₹10,000 / 10 Days)";
    CONFIG.studentBooking.package = CONFIG.currentPackage;
    if (packageSelect) packageSelect.value = "Gold Package (₹10,000 / 10 Days)";
    if (sumPackage) sumPackage.textContent = "Gold (10 Days)";
  }

  initUpiQrCode(amount);
  showToast(`Payment amount set to ₹${amount.toLocaleString("en-IN")}/-`);
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
  CONFIG.currentPackage = val;
  CONFIG.studentBooking.package = val;
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
 * Surat City Location Validation
 */
const SURAT_AREAS = [
  "surat", "vesu", "adajan", "pal", "piplod", "althan", "city light", "citylight",
  "varachha", "katargam", "vip road", "ghod dod", "athwa", "athwalines", "athwagate",
  "rander", "jahangirpura", "dindoli", "udhna", "bhatar", "dumas", "magdalla",
  "nana varachha", "mota varachha", "amroli", "sarthana", "bhestan", "pandesara",
  "pande sara", "kamrej", "punagam", "ved road", "dabholi", "olpad", "godadara",
  "parvat patiya", "hazira", "singanpore", "ring road", "textile market", "bhimrad",
  "sultanabad", "bhatha", "gaviyar", "ichhapore", "sachin", "khatodara", "mahidharpura"
];

const NON_SURAT_CITIES = [
  "ahmedabad", "amdavad", "vadodara", "baroda", "rajkot", "bhavnagar", "jamnagar",
  "gandhinagar", "junagadh", "anand", "nadiad", "navsari", "bharuch", "ankleshwar",
  "vapi", "valsad", "mumbai", "bombay", "pune", "delhi", "noida", "gurgaon",
  "bangalore", "bengaluru", "hyderabad", "kolkata", "chennai", "jaipur", "indore",
  "bhopal", "bardoli", "vyara", "mandvi", "songadh", "outside surat", "surat ke bahar"
];

function validateSuratLocation(val) {
  const warningBox = document.getElementById("suratLocationWarning");
  const feedbackRow = document.getElementById("suratLocationFeedback");
  const inputElem = document.getElementById("studentAddress");

  if (!val || val.trim().length === 0) {
    if (warningBox) warningBox.style.display = "none";
    if (feedbackRow) feedbackRow.innerHTML = '<span class="input-helper-text"><i class="fa-solid fa-circle-info"></i> Doorstep training across Surat city only.</span>';
    if (inputElem) inputElem.style.borderColor = "";
    return true;
  }

  const clean = val.toLowerCase().trim();

  // Check if explicit non-surat city is entered
  const isExplicitOutside = NON_SURAT_CITIES.some(city => clean.includes(city));

  if (isExplicitOutside) {
    if (warningBox) {
      warningBox.style.display = "flex";
      warningBox.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <strong>📍 Only Surat Location Allowed / सिर्फ सूरत में सर्विस उपलब्ध है</strong>
          <p>Humari car driving training service <strong>sirf Surat city</strong> ke liye available hai. Surat ke bahar training provide nahi hoti.</p>
        </div>
      `;
    }
    if (feedbackRow) feedbackRow.innerHTML = '';
    if (inputElem) inputElem.style.borderColor = "#EF4444";
    return false;
  }

  // Check if known Surat locality or 'surat' is present
  const isSuratMatch = SURAT_AREAS.some(area => clean.includes(area));

  if (isSuratMatch) {
    if (warningBox) warningBox.style.display = "none";
    if (feedbackRow) {
      feedbackRow.innerHTML = '<span class="location-valid-tag"><i class="fa-solid fa-circle-check text-green"></i> Verified Surat Area &bull; Doorstep coaching available!</span>';
    }
    if (inputElem) inputElem.style.borderColor = "#10B981";
    return true;
  }

  // If text is entered but Surat is not mentioned yet
  if (clean.length >= 3) {
    if (warningBox) {
      warningBox.style.display = "flex";
      warningBox.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <strong>📍 Only Surat Location Allowed</strong>
          <p>Training exclusively within Surat city. Please specify your Surat locality (e.g., <em>Vesu, Adajan, Pal, Piplod, Surat</em>).</p>
        </div>
      `;
    }
    if (feedbackRow) feedbackRow.innerHTML = '';
    if (inputElem) inputElem.style.borderColor = "#F59E0B";
    return true;
  } else {
    if (warningBox) warningBox.style.display = "none";
    if (feedbackRow) feedbackRow.innerHTML = '<span class="input-helper-text"><i class="fa-solid fa-circle-info"></i> Doorstep training across Surat city only.</span>';
    if (inputElem) inputElem.style.borderColor = "";
    return true;
  }
}

/**
 * Step 1: Interactive Booking Form Submit -> Locks Details & Takes User to QR Payment Section
 */
function handleBookingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("studentName")?.value.trim();
  const phone = document.getElementById("studentPhone")?.value.trim();
  const car = document.getElementById("studentCar")?.value.trim();
  const address = document.getElementById("studentAddress")?.value.trim();
  const pkg = document.getElementById("selectedPackageForm")?.value || CONFIG.currentPackage;
  const slot = document.getElementById("selectedSlotForm")?.value || CONFIG.currentSlot;
  const startDate = CONFIG.currentDateFormatted || document.getElementById("trainingStartDate")?.value || "Next Monday Batch";

  if (!name || !phone || !car || !address) {
    showToast("Please fill all required student details");
    return;
  }

  // Strict Surat Location Verification
  const cleanAddr = address.toLowerCase().trim();
  const isExplicitOutside = NON_SURAT_CITIES.some(city => cleanAddr.includes(city));
  if (isExplicitOutside) {
    showToast("⚠️ Service is only available in Surat City!");
    const warningBox = document.getElementById("suratLocationWarning");
    if (warningBox) {
      warningBox.style.display = "flex";
      warningBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    document.getElementById("studentAddress")?.focus();
    return;
  }

  // Determine amount
  const amount = (pkg.includes("5,000") || pkg.includes("Silver")) ? 5000 : 10000;

  // Save to CONFIG.studentBooking state
  CONFIG.studentBooking = {
    name,
    phone,
    car,
    address,
    package: pkg,
    slot,
    startDate,
    amount,
    txnId: document.getElementById("upiTransactionId")?.value.trim() || ""
  };

  // Sync Payment Amount & QR Terminal
  setPaymentAmount(amount);

  // Update Real-time Summary Card in QR Payment Section
  const sumStudentName = document.getElementById("sumStudentName");
  const sumStudentCar = document.getElementById("sumStudentCar");
  const sumPackage = document.getElementById("sumPackage");
  const sumStartDate = document.getElementById("sumStartDate");
  const sumSlot = document.getElementById("sumSlot");
  const sumAddress = document.getElementById("sumAddress");
  const summaryAmountText = document.getElementById("summaryAmountText");
  const summaryStatusText = document.getElementById("summaryStatusText");

  if (sumStudentName) sumStudentName.textContent = name;
  if (sumStudentCar) sumStudentCar.textContent = car;
  if (sumPackage) sumPackage.textContent = amount === 5000 ? "Silver (5 Days)" : "Gold (10 Days)";
  if (sumStartDate) sumStartDate.textContent = startDate;
  if (sumSlot) sumSlot.textContent = slot;
  if (sumAddress) sumAddress.textContent = address;
  if (summaryAmountText) summaryAmountText.textContent = `₹${amount.toLocaleString("en-IN")}/-`;
  if (summaryStatusText) summaryStatusText.textContent = `Slot Locked for ${name.split(" ")[0]}`;

  // Smooth scroll down to QR payment section
  smoothScrollTo("bookingPaymentSection");

  // Highlight and focus the Transaction ID input
  setTimeout(() => {
    const txnField = document.getElementById("upiTransactionId");
    if (txnField) {
      txnField.focus();
    }
  }, 600);

  // Celebrate with confetti & notify user
  triggerConfetti();
  showToast(`✅ Details locked! Scan QR below & enter Transaction ID`);
}

/**
 * Handle Live Input in Transaction ID Field (Enables/Disables WhatsApp Button)
 */
function handleTxnInput() {
  const txnField = document.getElementById("upiTransactionId");
  const txnVal = txnField ? txnField.value.trim() : "";
  const btn = document.getElementById("btnSendWhatsappWithTxn");
  const btnText = document.getElementById("btnWhatsappText");
  const hint = document.getElementById("txnBtnHint");
  const badge = document.querySelector(".txn-required-badge");

  if (CONFIG.studentBooking) {
    CONFIG.studentBooking.txnId = txnVal;
  }

  // Minimum required length for Transaction ID / UTR (typically 6-12 digits)
  if (txnVal.length >= 4) {
    if (btn) btn.disabled = false;
    if (txnField) txnField.classList.add("valid");
    if (badge) {
      badge.classList.add("valid");
      badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> UTR Entered`;
    }
    if (btnText) {
      btnText.textContent = `✅ Send Payment (UTR: ${txnVal}) & Booking Details on WhatsApp`;
    }
    if (hint) {
      hint.innerHTML = `<span class="hint-unlocked"><i class="fa-solid fa-circle-check text-green"></i> Transaction ID linked! Tap button above to send on WhatsApp.</span>`;
    }
  } else {
    if (btn) btn.disabled = true;
    if (txnField) txnField.classList.remove("valid");
    if (badge) {
      badge.classList.remove("valid");
      badge.innerHTML = `<i class="fa-solid fa-lock"></i> Required to Unlock`;
    }
    if (btnText) {
      btnText.textContent = "🔒 Enter Transaction ID Above to Unlock";
    }
    if (hint) {
      hint.innerHTML = `<i class="fa-solid fa-lock text-gold"></i> Please enter your UPI Transaction ID above to enable WhatsApp confirmation.`;
    }
  }
}

/**
 * Step 2: Final WhatsApp Submission with Payment Status, Txn ID, and all Client Details
 */
function sendFinalBookingWhatsApp() {
  const txnField = document.getElementById("upiTransactionId");
  const txnId = txnField ? txnField.value.trim() : (CONFIG.studentBooking.txnId || "");

  // Strict check: Transaction ID MUST be entered
  if (!txnId || txnId.length < 4) {
    showToast("⚠️ Please enter your UPI Transaction ID / UTR number first!");
    if (txnField) {
      txnField.focus();
      txnField.classList.add("shake-alert");
      setTimeout(() => txnField.classList.remove("shake-alert"), 600);
    }
    return;
  }

  // Read latest values from state or direct form fields
  const name = CONFIG.studentBooking.name || document.getElementById("studentName")?.value.trim() || "";
  const phone = CONFIG.studentBooking.phone || document.getElementById("studentPhone")?.value.trim() || "";
  const car = CONFIG.studentBooking.car || document.getElementById("studentCar")?.value.trim() || "";
  const address = CONFIG.studentBooking.address || document.getElementById("studentAddress")?.value.trim() || "";
  const pkg = CONFIG.studentBooking.package || document.getElementById("selectedPackageForm")?.value || CONFIG.currentPackage;
  const slot = CONFIG.studentBooking.slot || document.getElementById("selectedSlotForm")?.value || CONFIG.currentSlot;
  const startDate = CONFIG.studentBooking.startDate || CONFIG.currentDateFormatted || "Next Monday Batch";
  const amount = CONFIG.currentAmount || 10000;

  // If student hasn't entered name or phone, smoothly guide them to registration form
  if (!name || !phone || !car || !address) {
    showToast("Please fill your student details in the form above first!");
    smoothScrollTo("reservationSection");
    setTimeout(() => {
      document.getElementById("studentName")?.focus();
    }, 400);
    return;
  }

  // Construct comprehensive formatted WhatsApp message
  const pkgTierName = amount === 5000 ? "Silver Package - ₹5,000 (5 Days)" : "Gold Package - ₹10,000 (10 Days Intensive)";

  const message = `*🚗 NEW CAR DRIVING TRAINING BOOKING & PAYMENT (SURAT)*
━━━━━━━━━━━━━━━━━━━━━
✅ *PAYMENT STATUS: COMPLETED*
💰 *Amount Paid:* ₹${amount.toLocaleString("en-IN")}/- (${pkgTierName})
🔢 *UPI Transaction ID / UTR:* ${txnId}
━━━━━━━━━━━━━━━━━━━━━
👤 *Client & Student Details:*
• *Full Name:* ${name}
• *Phone Number:* ${phone}
• *Car Model:* ${car}
• *Surat Area / Address:* ${address}
• *Selected Package:* ${pkg}
• *Training Start Date:* ${startDate} (Mon-Fri)
• *Preferred Batch Slot:* ${slot}
━━━━━━━━━━━━━━━━━━━━━
📍 *Doorstep Personal Coaching across Surat City*
_I have completed the UPI payment. Please verify the transaction, confirm my slot lock, and share the training schedule!_`;

  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/91${CONFIG.phone}?text=${encoded}`;

  triggerConfetti();
  showToast("Opening WhatsApp with payment & student details...");
  window.open(whatsappUrl, "_blank");
}

/**
 * Save Contact (vCard .vcf Generator)
 */
function downloadVCard() {
  const vCardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${CONFIG.name}`,
    `N:Bhavsar;Mayur;;;`,
    `ORG:Mayur Bhavsar - Car Driving Professional Trainer`,
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
  link.setAttribute("download", "Mayur_Bhavsar_Driving_Trainer.vcf");
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
    title: "Mayur Bhavsar - Car Driving Professional Trainer (Surat)",
    text: "Learn to Drive on Your Own Car with Mayur Bhavsar in Surat (13+ Years Experience). Connect & Book your batch slot!",
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
  const currentUrl = window.location.href || "https://mayurbhavsar.driving.card";

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
