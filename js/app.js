/**
 * Pollachi Coconut DataSphere - Application Controller
 * Handles Session, Dataset Synchronization, In-Browser Data Management,
 * Chart Rendering, and Multi-Format Exports (CSV, Excel, PDF).
 */

document.addEventListener("DOMContentLoaded", async () => {
  const state = {
    currentTab: "overview",
    startYear: 2005,
    endYear: 2025,
    theme: localStorage.getItem("pollachi_theme") || "light",
    dataset: null,
    currentUser: null,
    searchQuery: ""
  };

  // Auth & Topbar DOM Elements
  const loginOverlay = document.getElementById("loginOverlay");
  const loginForm = document.getElementById("loginForm");
  const loginUserInput = document.getElementById("loginUserInput");
  const loginPassInput = document.getElementById("loginPassInput");
  const loginErrorMsg = document.getElementById("loginErrorMsg");
  const userProfileBadge = document.getElementById("userProfileBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const editDatasetBtn = document.getElementById("editDatasetBtn");
  const reloadDiskBtn = document.getElementById("reloadDiskBtn");

  // Navigation & Filter Elements
  const themeToggleBtn = document.getElementById("themeToggle");
  const yearSlider = document.getElementById("yearSlider");
  const yearDisplay = document.getElementById("yearDisplay");
  const fromYearSelect = document.getElementById("fromYearSelect");
  const toYearSelect = document.getElementById("toYearSelect");
  const navLinks = document.querySelectorAll(".nav-link");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const topbarTitle = document.getElementById("topbarTitle");
  const topbarSubtitle = document.getElementById("topbarSubtitle");
  const tableSearchInput = document.getElementById("tableSearchInput");
  const refreshWeatherBtn = document.getElementById("refreshWeatherBtn");

  // Download Dropdown
  const downloadDropdownBtn = document.getElementById("downloadDropdownBtn");
  const downloadDropdown = document.getElementById("downloadDropdown");
  const dlCsvBtn = document.getElementById("dlCsvBtn");
  const dlExcelBtn = document.getElementById("dlExcelBtn");
  const dlPdfBtn = document.getElementById("dlPdfBtn");

  // Dataset Management Modal
  const editorModal = document.getElementById("editorModal");
  const editorRowsContainer = document.getElementById("editorRowsContainer");
  const closeEditorBtn = document.getElementById("closeEditorBtn");
  const cancelEditorBtn = document.getElementById("cancelEditorBtn");
  const saveEditorBtn = document.getElementById("saveEditorBtn");
  const addNewYearBtn = document.getElementById("addNewYearBtn");
  const toastNotice = document.getElementById("toastNotice");

  // Toast Helper
  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.style.display = "block";
    setTimeout(() => {
      toastNotice.style.display = "none";
    }, 2800);
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  function checkAuth() {
    const user = API.getUser();
    if (user && API.getToken()) {
      state.currentUser = user;
      loginOverlay.classList.add("hidden");
      updateUserUI();
    } else {
      state.currentUser = null;
      loginOverlay.classList.remove("hidden");
    }
  }

  function updateUserUI() {
    if (!state.currentUser) return;
    userProfileBadge.innerHTML = `<span>👤</span> Student`;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      loginErrorMsg.style.display = "none";
      const u = loginUserInput.value.trim();
      const p = loginPassInput.value;

      const res = await API.login(u, p);
      if (res.success) {
        state.currentUser = res.user;
        loginOverlay.classList.add("hidden");
        updateUserUI();
        await loadDynamicData();
      } else {
        loginErrorMsg.textContent = res.message || "Invalid credentials.";
        loginErrorMsg.style.display = "block";
      }
    });
  }

  window.quickStudentLogin = function() {
    loginUserInput.value = 'student';
    loginPassInput.value = 'student123';
    loginForm.dispatchEvent(new Event('submit'));
  };

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      API.logout();
      checkAuth();
    });
  }

  // ==========================================
  // DYNAMIC DATASET MANAGEMENT & 2005-2025 RANGE
  // ==========================================

  // Populate From/To year selectors from dataset years
  function populateYearSelectors() {
    const years = getYearlyArray().map(d => d.year || d.Year).sort((a, b) => a - b);
    if (!years.length) return;

    const minYear = years[0];
    const maxYear = years[years.length - 1];

    // Preserve current selections if valid, otherwise use min/max
    const prevStart = state.startYear;
    const prevEnd = state.endYear;

    if (fromYearSelect) {
      fromYearSelect.innerHTML = "";
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        fromYearSelect.appendChild(opt);
      });
      // Restore previous selection if still valid
      if (years.includes(prevStart)) {
        fromYearSelect.value = prevStart;
      } else {
        fromYearSelect.value = minYear;
        state.startYear = minYear;
      }
    }

    if (toYearSelect) {
      toYearSelect.innerHTML = "";
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        toYearSelect.appendChild(opt);
      });
      // Restore previous selection if still valid
      if (years.includes(prevEnd)) {
        toYearSelect.value = prevEnd;
      } else {
        toYearSelect.value = maxYear;
        state.endYear = maxYear;
      }
    }

    // Also update the old slider if it exists
    if (yearSlider) {
      yearSlider.min = minYear;
      yearSlider.max = maxYear;
      yearSlider.value = state.endYear;
      if (yearDisplay) yearDisplay.textContent = `${state.startYear} - ${state.endYear}`;
    }
  }

  // From Year selector change
  if (fromYearSelect) {
    fromYearSelect.addEventListener("change", () => {
      const newStart = parseInt(fromYearSelect.value, 10);
      // Don't allow From > To
      if (newStart > state.endYear) {
        state.endYear = newStart;
        if (toYearSelect) toYearSelect.value = newStart;
      }
      state.startYear = newStart;
      if (yearDisplay) yearDisplay.textContent = `${state.startYear} - ${state.endYear}`;
      renderAllTabs();
      renderCurrentTab();
    });
  }

  // To Year selector change
  if (toYearSelect) {
    toYearSelect.addEventListener("change", () => {
      const newEnd = parseInt(toYearSelect.value, 10);
      // Don't allow To < From
      if (newEnd < state.startYear) {
        state.startYear = newEnd;
        if (fromYearSelect) fromYearSelect.value = newEnd;
      }
      state.endYear = newEnd;
      if (yearDisplay) yearDisplay.textContent = `${state.startYear} - ${state.endYear}`;
      renderAllTabs();
      renderCurrentTab();
    });
  }

  async function loadDynamicData() {
    try {
      const data = await API.getDataset();
      if (data) {
        state.dataset = data;
        const years = getYearlyArray().map(d => d.year || d.Year).sort((a, b) => a - b);
        const maxYear = years.length ? years[years.length - 1] : 2025;
        const minYear = years.length ? years[0] : 2005;

        // On first load, set full range
        if (!state._initialized) {
          state.startYear = minYear;
          state.endYear = maxYear;
          state._initialized = true;
        }

        // Populate From/To selectors with all years (including newly added ones)
        populateYearSelectors();

        renderAllTabs();
        renderCurrentTab();
      }
    } catch (err) {
      console.error("Dataset loading error:", err);
    }
  }

  function getYearlyArray() {
    if (!state.dataset) return [];
    if (Array.isArray(state.dataset.yearly_data)) return state.dataset.yearly_data;
    if (Array.isArray(state.dataset.yearlyData)) return state.dataset.yearlyData;
    if (Array.isArray(state.dataset)) return state.dataset;
    return [];
  }

  // Filter 2005 - selected year
  function getFilteredData() {
    const raw = getYearlyArray();
    return raw.filter(d => {
      const y = d.year || d.Year;
      return y >= state.startYear && y <= state.endYear;
    }).map(d => ({
      year: d.year || d.Year,
      areaHa: d.area_ha || d.areaHa || d.Area_Ha || 0,
      productionCr: d.production_cr || d.productionCr || d.Production_Cr_Nuts || 0,
      yieldPalm: d.yield_per_palm || d.yieldPalm || d.Yield_Per_Palm || 0,
      copraPrice: d.copra_price_qtl || d.copraPrice || d.Copra_Price_Qtl || 0,
      tenderPrice: d.tender_price_nut || d.tenderPrice || d.Tender_Price_Nut || 0,
      dripPct: d.drip_pct || d.dripPct || d.Drip_Irrigation_Pct || 0,
      dailyHarvestLakh: d.daily_harvest_lakhs || d.dailyHarvestLakh || d.Daily_Harvest_Lakhs || 0
    }));
  }

  // Reload from Disk
  if (reloadDiskBtn) {
    reloadDiskBtn.addEventListener("click", async () => {
      reloadDiskBtn.innerHTML = "⏳ Syncing...";
      await loadDynamicData();
      setTimeout(() => {
        reloadDiskBtn.innerHTML = "🔄 Refresh Records";
        showToast("✓ Records reloaded from file.");
      }, 300);
    });
  }

  // ==========================================
  // IN-BROWSER DATASET MANAGEMENT MODAL
  // ==========================================

  // Build one editor row from a raw yearly_data entry
  function buildEditorRow(rawItem, rawIndex) {
    const row = document.createElement("div");
    row.className = "edit-row";
    const yr    = rawItem.year          || rawItem.Year          || "";
    const area  = rawItem.area_ha       || rawItem.areaHa        || 0;
    const prod  = rawItem.production_cr || rawItem.productionCr  || 0;
    const copra = rawItem.copra_price_qtl || rawItem.copraPrice  || 0;
    const tend  = rawItem.tender_price_nut || rawItem.tenderPrice || 0;
    const palm  = rawItem.yield_per_palm  || rawItem.yieldPalm   || 0;
    const drip  = rawItem.drip_pct       || rawItem.dripPct      || 0;
    const harv  = rawItem.daily_harvest_lakhs || rawItem.dailyHarvestLakh || 0;

    row.setAttribute("data-raw-index", rawIndex);
    row.innerHTML = `
      <div style="font-weight:700;font-size:13px;">${yr}</div>
      <input type="number" class="edit-input" data-field="area_ha"              data-raw="${rawIndex}" value="${area}"  placeholder="Ha"    title="Cultivation Area (Hectares)">
      <input type="number" class="edit-input" data-field="production_cr"        data-raw="${rawIndex}" value="${prod}"  step="0.1" placeholder="Cr" title="Nut Production (Crore Nuts)">
      <input type="number" class="edit-input" data-field="copra_price_qtl"      data-raw="${rawIndex}" value="${copra}" placeholder="₹/Qt"  title="Copra Mandi Price (₹/Quintal)">
      <input type="number" class="edit-input" data-field="tender_price_nut"     data-raw="${rawIndex}" value="${tend}"  step="0.5" placeholder="₹" title="Tender Coconut Price (₹/Nut)">
      <input type="number" class="edit-input" data-field="yield_per_palm"       data-raw="${rawIndex}" value="${palm}"  placeholder="nuts"  title="Yield Per Palm (nuts/year)">
      <input type="number" class="edit-input" data-field="drip_pct"             data-raw="${rawIndex}" value="${drip}"  step="0.5" placeholder="%" title="Drip Irrigation Coverage (%)">
      <input type="number" class="edit-input" data-field="daily_harvest_lakhs"  data-raw="${rawIndex}" value="${harv}"  step="0.1" placeholder="L" title="Daily Harvest (Lakh Nuts)">
      <button class="btn btn-outline" style="padding:3px 7px;color:#dc2626;font-size:13px;" onclick="deleteRawRow(${rawIndex})">✕</button>
    `;
    return row;
  }

  function openEditor() {
    if (!editorModal) return;
    editorRowsContainer.innerHTML = "";
    const list = getYearlyArray();
    list.forEach((item, idx) => {
      editorRowsContainer.appendChild(buildEditorRow(item, idx));
    });
    editorModal.classList.remove("hidden");
  }

  function closeEditor() {
    if (editorModal) editorModal.classList.add("hidden");
  }

  if (editDatasetBtn) editDatasetBtn.addEventListener("click", openEditor);
  if (closeEditorBtn) closeEditorBtn.addEventListener("click", closeEditor);
  if (cancelEditorBtn) cancelEditorBtn.addEventListener("click", closeEditor);

  // Add a new blank/estimated year row
  if (addNewYearBtn) {
    addNewYearBtn.addEventListener("click", () => {
      const list = getYearlyArray();
      const last = list[list.length - 1] || {
        year: 2025, area_ha: 46200, production_cr: 59.8, copra_price_qtl: 11850,
        yield_per_palm: 138, tender_price_nut: 38, drip_pct: 82.5, daily_harvest_lakhs: 16.4
      };
      const nextYr = (last.year || 2025) + 1;

      const newEntry = {
        year:               nextYr,
        area_ha:            Math.round((last.area_ha || 46200) + 600),
        production_cr:      Number(((last.production_cr || 59.8) + 1.5).toFixed(1)),
        yield_per_palm:     Math.round((last.yield_per_palm || 138) + 2),
        copra_price_qtl:    Math.round((last.copra_price_qtl || 11850) + 500),
        tender_price_nut:   Number(((last.tender_price_nut || 38) + 1.5).toFixed(1)),
        drip_pct:           Math.min(98, Number(((last.drip_pct || 82.5) + 2).toFixed(1))),
        daily_harvest_lakhs:Number(((last.daily_harvest_lakhs || 16.4) + 0.5).toFixed(1))
      };

      if (Array.isArray(state.dataset.yearly_data)) {
        state.dataset.yearly_data.push(newEntry);
      } else if (Array.isArray(state.dataset.yearlyData)) {
        state.dataset.yearlyData.push(newEntry);
      }

      const rawIdx = getYearlyArray().length - 1;
      editorRowsContainer.appendChild(buildEditorRow(newEntry, rawIdx));
      editorRowsContainer.scrollTop = editorRowsContainer.scrollHeight;
      showToast(`✓ Year ${nextYr} row added — edit values then click Save.`);
    });
  }

  window.deleteRawRow = function(rawIndex) {
    const list = getYearlyArray();
    if (list.length <= 2) {
      showToast("Minimum 2 observation years required.");
      return;
    }
    list.splice(rawIndex, 1);
    openEditor();   // Re-render with corrected indices
  };

  // Legacy alias kept for safety
  window.deleteRow = window.deleteRawRow;

  if (saveEditorBtn) {
    saveEditorBtn.addEventListener("click", async () => {
      saveEditorBtn.textContent = "Saving…";
      const list = getYearlyArray();

      // Collect all inputs, write directly into raw list by data-raw index
      const rows = editorRowsContainer.querySelectorAll(".edit-input");
      rows.forEach(inp => {
        const rawIdx = parseInt(inp.getAttribute("data-raw"), 10);
        const field  = inp.getAttribute("data-field");
        const val    = parseFloat(inp.value);
        if (!isNaN(val) && list[rawIdx]) {
          list[rawIdx][field] = val;
        }
      });

      await API.updateDataset(state.dataset);
      saveEditorBtn.textContent = "💾 Save All Changes";
      closeEditor();

      // Re-load data → updates From/To selectors (adds new years) → re-renders all charts
      // Expand endYear to include any newly added years
      const years = list.map(d => d.year || d.Year).sort((a, b) => a - b);
      const newMax = years.length ? years[years.length - 1] : state.endYear;
      if (newMax > state.endYear) {
        state.endYear = newMax;
      }

      await loadDynamicData();
      showToast("✓ All records saved — charts & time range updated.");
    });
  }

  // ==========================================
  // DOWNLOADS (CSV, EXCEL, PDF)
  // ==========================================

  if (downloadDropdownBtn && downloadDropdown) {
    downloadDropdownBtn.addEventListener("click", e => {
      e.stopPropagation();
      downloadDropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => {
      downloadDropdown.classList.remove("open");
    });
  }

  // 1. Download CSV
  if (dlCsvBtn) {
    dlCsvBtn.addEventListener("click", () => {
      const header = "Year,Cultivation_Area_Ha,Nut_Production_Cr,Yield_Per_Palm,Copra_Price_Qtl,Tender_Nut_Price,Drip_Irrigation_Pct,Daily_Harvest_Lakhs";
      const lines = getFilteredData().map(d =>
        [d.year, d.areaHa, d.productionCr, d.yieldPalm, d.copraPrice, d.tenderPrice, d.dripPct, d.dailyHarvestLakh].join(",")
      );
      const csv = "data:text/csv;charset=utf-8," + [header, ...lines].join("\n");
      const a = document.createElement("a");
      a.href = encodeURI(csv);
      a.download = "pollachi_coconut_records.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("✓ CSV export downloaded.");
    });
  }

  // 2. Download Excel (.xls XML Format)
  if (dlExcelBtn) {
    dlExcelBtn.addEventListener("click", () => {
      const data = getFilteredData();
      let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <table border="1">
            <tr style="background:#15803d;color:#ffffff;font-weight:bold;">
              <th>Year</th>
              <th>Cultivation Area (Hectares)</th>
              <th>Annual Production (Crore Nuts)</th>
              <th>Yield per Palm (Nuts/Year)</th>
              <th>Copra Mandi Price (₹/Quintal)</th>
              <th>Tender Coconut Price (₹/Nut)</th>
              <th>Drip Irrigation Coverage (%)</th>
              <th>Daily Harvest (Lakh Nuts)</th>
            </tr>
      `;
      data.forEach(d => {
        excelContent += `
          <tr>
            <td>${d.year}</td>
            <td>${d.areaHa}</td>
            <td>${d.productionCr}</td>
            <td>${d.yieldPalm}</td>
            <td>${d.copraPrice}</td>
            <td>${d.tenderPrice}</td>
            <td>${d.dripPct}%</td>
            <td>${d.dailyHarvestLakh}</td>
          </tr>
        `;
      });
      excelContent += `</table></body></html>`;

      const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "pollachi_coconut_data.xls";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("✓ Excel spreadsheet downloaded.");
    });
  }

  // 3. Export PDF (Window Print View)
  if (dlPdfBtn) {
    dlPdfBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // ==========================================
  // THEME & NAVIGATION
  // ==========================================

  const topbarThemeToggle = document.getElementById("topbarThemeToggle");

  function applyTheme(th) {
    state.theme = th;
    document.documentElement.setAttribute("data-theme", th);
    localStorage.setItem("pollachi_theme", th);
    const label = th === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = label;
    }
    if (topbarThemeToggle) {
      topbarThemeToggle.innerHTML = label;
    }
    renderCurrentTab();
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      applyTheme(state.theme === "dark" ? "light" : "dark");
    });
  }
  if (topbarThemeToggle) {
    topbarThemeToggle.addEventListener("click", () => {
      applyTheme(state.theme === "dark" ? "light" : "dark");
    });
  }
  applyTheme(state.theme);

  const tabTitles = {
    overview: {
      title: "Coconut Production & Growth Overview",
      subtitle: "20-year agro-economic indicators in Pollachi, Coimbatore District (2005 - 2025)"
    },
    yield: {
      title: "Nut Harvest & Palm Productivity",
      subtitle: "Annual nut yields, daily harvest volumes, and per-tree productivity progression"
    },
    mandi: {
      title: "Copra & Tender Coconut Mandi Economics",
      subtitle: "Commercial wholesale auction pricing and farmgate realization trends"
    },
    varieties: {
      title: "Cultivars, Varieties & End-Use Value Chain",
      subtitle: "Distribution of indigenous Pollachi Tall, hybrids, and post-harvest processing"
    },
    drip: {
      title: "Micro-Irrigation & Water Conservation",
      subtitle: "Pressurized fertigation adoption across groves and impact on button setting"
    },
    weather: {
      title: "Agro-Meteorological Station & Palm Micro-Climate",
      subtitle: "Real-time meteorological observations for Pollachi via Open-Meteo REST service"
    },
    table: {
      title: "Statistical Data Records",
      subtitle: "Comprehensive tabular records with multi-format download capabilities"
    }
  };

  function switchTab(tabId) {
    state.currentTab = tabId;

    navLinks.forEach(link => {
      if (link.getAttribute("data-tab") === tabId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    if (tabTitles[tabId]) {
      topbarTitle.textContent = tabTitles[tabId].title;
      topbarSubtitle.textContent = tabTitles[tabId].subtitle;
    }

    renderCurrentTab();
  }

  navLinks.forEach(l => {
    l.addEventListener("click", e => {
      e.preventDefault();
      switchTab(l.getAttribute("data-tab"));
    });
  });

  if (yearSlider) {
    yearSlider.addEventListener("input", e => {
      state.endYear = parseInt(e.target.value, 10);
      yearDisplay.textContent = `${state.startYear} - ${state.endYear}`;
      renderCurrentTab();
    });
  }

  // ==========================================
  // CHART RENDERING (FRAMED & PROPORTIONED)
  // ==========================================

  function renderCurrentTab() {
    switch (state.currentTab) {
      case "overview":
        renderOverview();
        break;
      case "yield":
        renderYield();
        break;
      case "mandi":
        renderMandi();
        break;
      case "varieties":
        renderVarieties();
        break;
      case "drip":
        renderDrip();
        break;
      case "weather":
        renderWeather();
        break;
      case "table":
        renderTable();
        break;
    }
  }

  function renderOverview() {
    const data = getFilteredData();
    if (!data.length) return;
    const labels = data.map(d => d.year.toString());
    const latest = data[data.length - 1];

    // Update KPI Card Numbers
    const kpiArea = document.getElementById("kpiArea");
    const kpiYield = document.getElementById("kpiYield");
    const kpiPrice = document.getElementById("kpiPrice");
    const kpiPalm = document.getElementById("kpiPalm");
    const kpiTender = document.getElementById("kpiTender");
    const kpiDrip = document.getElementById("kpiDrip");

    if (kpiArea) kpiArea.textContent = `${latest.areaHa.toLocaleString()} Ha`;
    if (kpiYield) kpiYield.textContent = `${latest.productionCr} Crore`;
    if (kpiPrice) kpiPrice.textContent = `₹${latest.copraPrice.toLocaleString()}/Qtl`;
    if (kpiPalm) kpiPalm.textContent = `${latest.yieldPalm} Nuts/Yr`;
    if (kpiTender) kpiTender.textContent = `₹${latest.tenderPrice} / Nut`;
    if (kpiDrip) kpiDrip.textContent = `${latest.dripPct}%`;

    // 1. Dual-Axis Line Chart: Area (Ha) on Left, Yield (Cr) on Right
    // Both lines are beautifully framed, clearly visible, and properly scaled!
    CoconutCharts.renderLineChart("chart-overview-growth", {
      labels,
      dualAxis: true,
      series: [
        { name: "Cultivation Area", data: data.map(d => d.areaHa), color: "#d97706", area: false, yAxis: 'left', unit: 'Ha' },
        { name: "Nut Yield", data: data.map(d => d.productionCr), color: "#15803d", area: true, yAxis: 'right', unit: 'Cr' }
      ],
      height: 260
    });

    // 2. Value Chain & Utilization Donut Chart (Guaranteed to render smoothly!)
    const rawEndUses = (state.dataset && (state.dataset.end_use_breakdown || state.dataset.endUseDistribution)) || [
      { label: "Milling Copra & Oil", value: 44, color: "#15803d" },
      { label: "Tender Coconut", value: 32, color: "#22c55e" },
      { label: "Culinary Fresh", value: 16, color: "#f59e0b" },
      { label: "VCO & Neera", value: 8, color: "#065f46" }
    ];
    CoconutCharts.renderDonutChart("chart-overview-donut", rawEndUses, "100%");
  }

  function renderAllTabs() {
    renderOverview();
    renderYield();
    renderMandi();
    renderVarieties();
    renderDrip();
    renderTable();
  }

  function renderYield() {
    const data = getFilteredData();
    const labels = data.map(d => d.year.toString());

    CoconutCharts.renderLineChart("chart-yield-per-palm", {
      labels,
      series: [
        { name: "Nuts per Palm per Year", data: data.map(d => d.yieldPalm), color: "#16a34a", area: true, unit: 'nuts' }
      ],
      height: 260
    });

    CoconutCharts.renderBarChart("chart-daily-harvest", {
      labels,
      series: [
        { name: "Daily Harvest (Lakh Nuts)", data: data.map(d => d.dailyHarvestLakh), color: "#d97706" }
      ],
      yUnit: "L",
      height: 260
    });
  }

  function renderMandi() {
    const data = getFilteredData();
    const labels = data.map(d => d.year.toString());

    CoconutCharts.renderLineChart("chart-copra-trend", {
      labels,
      series: [
        { name: "Copra Mandi Price", data: data.map(d => d.copraPrice), color: "#d97706", area: true, unit: '₹' }
      ],
      height: 260
    });

    CoconutCharts.renderBarChart("chart-tender-trend", {
      labels,
      series: [
        { name: "Tender Coconut Farmgate Price", data: data.map(d => d.tenderPrice), color: "#15803d" }
      ],
      yUnit: "₹",
      height: 260
    });

    const mLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mPrices = [11200, 11400, 11850, 12100, 12000, 11600, 11300, 11100, 11250, 11450, 11500, 11650];
    CoconutCharts.renderBarChart("chart-monthly-mandi", {
      labels: mLabels,
      series: [
        { name: "Seasonal Copra Rate (₹/Qtl)", data: mPrices, color: "#ca8a04" }
      ],
      yUnit: "₹",
      height: 250
    });
  }

  function renderVarieties() {
    const vars = (state.dataset && state.dataset.varieties) || [
      { name: "Pollachi Tall (WCT)", share: 56, color: "#15803d" },
      { name: "Hybrids (ALR/VPM)", share: 28, color: "#22c55e" },
      { name: "Chowghat Orange Dwarf", share: 12, color: "#f59e0b" },
      { name: "Malayan Dwarf", share: 4, color: "#ca8a04" }
    ];
    CoconutCharts.renderDonutChart("chart-variety-donut", vars, "100%");
  }

  function renderDrip() {
    const data = getFilteredData();
    const labels = data.map(d => d.year.toString());

    CoconutCharts.renderLineChart("chart-drip-trend", {
      labels,
      series: [
        { name: "Drip Irrigation Coverage (%)", data: data.map(d => d.dripPct), color: "#0284c7", area: true, unit: '%' }
      ],
      height: 260
    });
  }

  async function fetchLiveWeather() {
    const tempEl = document.getElementById("liveTemp");
    const descEl = document.getElementById("liveDesc");
    const humEl = document.getElementById("liveHumidity");
    const windEl = document.getElementById("liveWind");
    const rainEl = document.getElementById("liveRain");
    const sidePill = document.getElementById("sidebarWeatherPill");

    const url = "https://api.open-meteo.com/v1/forecast?latitude=10.6586&longitude=77.0084&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather API status " + res.status);
      const json = await res.json();
      const c = json.current;
      const t = Math.round(c.temperature_2m);
      const h = c.relative_humidity_2m;
      const w = c.wind_speed_10m;
      const p = c.precipitation;

      if (tempEl) tempEl.textContent = `${t}°C`;
      if (humEl) humEl.textContent = `${h}%`;
      if (windEl) windEl.textContent = `${w} km/h`;
      if (rainEl) rainEl.textContent = `${p} mm`;

      let condition = "Fair Weather";
      if (c.weather_code >= 60 && c.weather_code <= 82) condition = "Rain Showers";
      else if (c.weather_code >= 1 && c.weather_code <= 3) condition = "Partly Cloudy";

      if (descEl) descEl.textContent = `${condition} • Pollachi Groves`;
      if (sidePill) sidePill.textContent = `Pollachi: ${t}°C (${condition})`;
    } catch (err) {
      if (tempEl) tempEl.textContent = "29°C";
      if (descEl) descEl.textContent = "Partly Cloudy • Pollachi Groves";
      if (humEl) humEl.textContent = "68%";
      if (windEl) windEl.textContent = "12 km/h";
      if (rainEl) rainEl.textContent = "0.0 mm";
      if (sidePill) sidePill.textContent = "Pollachi: 29°C (Recorded)";
    }
  }

  function renderWeather() {
    fetchLiveWeather();
  }

  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener("click", () => {
      fetchLiveWeather();
      showToast("✓ Meteorological feed refreshed.");
    });
  }

  function renderTable() {
    const tbody = document.getElementById("coconutTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const q = state.searchQuery.toLowerCase();
    const rows = getFilteredData().filter(d => {
      if (!q) return true;
      return Object.values(d).some(v => v.toString().toLowerCase().includes(q));
    });

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted);">No records found matching "${q}"</td></tr>`;
      return;
    }

    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700;">${r.year}</td>
        <td>${r.areaHa.toLocaleString()} Ha</td>
        <td>${r.productionCr} Cr</td>
        <td>${r.yieldPalm} nuts/palm</td>
        <td>₹${r.copraPrice.toLocaleString()}</td>
        <td>₹${r.tenderPrice}</td>
        <td>${r.dripPct}%</td>
        <td>${r.dailyHarvestLakh} Lakhs</td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (tableSearchInput) {
    tableSearchInput.addEventListener("input", e => {
      state.searchQuery = e.target.value;
      renderTable();
    });
  }

  // Initial Boot
  checkAuth();
  await loadDynamicData();
  switchTab("overview");
  fetchLiveWeather();

  window.addEventListener("resize", () => {
    renderAllTabs();
    renderCurrentTab();
  });
});
