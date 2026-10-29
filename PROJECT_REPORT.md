# ACADEMIC PROJECT REPORT

## PROJECT TITLE:
### **Pollachi Coconut Information System: A Dynamic Web-Based Data Visualization and Mandi Analytics Platform with Live Dataset Synchronization**

---

### **Student Name:** [Your Name / Register Number]  
### **Degree / Branch:** B.E. / B.Tech / B.Sc / M.Sc (Computer Science / Information Technology / Data Science)  
### **Course Title:** Mini Project in Data Visualization  
### **Institution:** [Your College / University Name], Coimbatore District, Tamil Nadu  
### **Academic Year:** 2025–2026  

---

## 1. ABSTRACT
Accurate regional agro-economic assessment demands dynamic, verifiable, and responsive data visualization architectures. This project presents the **Pollachi Coconut Information System**, an integrated full-stack web application designed to analyze and visualize the 20-year developmental trajectory (2005–2025) of coconut agriculture in **Pollachi, Coimbatore District**—the leading coconut and copra hub of Tamil Nadu.

The application combines a **Node.js RESTful API backend** with a zero-dependency **SVG Visualization Core**. Key analytical components include dual-axis acreage and yield progression graphs, post-harvest value-chain distribution donuts, mandi copra price cycles, varietal acreage shares (Pollachi Tall vs TNAU Hybrids), and pressurized drip irrigation adoption trends. In addition, real-time meteorological observations for Pollachi (`10.6586° N, 77.0084° E`) are fetched from the Open-Meteo REST service.

The platform provides student authentication, an in-browser dataset management interface allowing authorized users to append and modify observation records (with physical disk persistence), and multi-format data export capabilities (**CSV**, **Excel**, and **PDF**).

---

## 2. PROBLEM STATEMENT & OBJECTIVES
Pollachi accounts for a dominant portion of Tamil Nadu's coconut harvest. However, historical agricultural statistics and auction market prices have remained siloed within municipal market reports and departmental gazettes.

### Core Objectives:
1. **Consolidate a 20-Year Time Series (2005–2025):** Standardize records covering acreage, nut yields, per-palm productivity, copra prices, and micro-irrigation.
2. **Implement Dual-Axis Visualization:** Design balanced, scalable SVG line charts where metrics of differing magnitudes (hectares vs crore nuts) are properly framed without visual compression.
3. **Build Dynamic Dataset Persistence:** Ensure modifications made through the in-browser management panel or directly within `pollachi_datasets.json` propagate immediately to the frontend.
4. **Student Authentication:** Protect operational controls via secure Student ID and Password verification (`student` / `student123`).
5. **Multi-Format Portability:** Enable seamless client-side exports into CSV, Excel (`.xls`), and printable PDF formats.

---

## 3. SYSTEM ARCHITECTURE & DATA FLOW

```
+---------------------------------------------------------------------------------+
|                         DATA SOURCES & DISK REPOSITORY                          |
|  - Coconut Development Board (CDB)        - TN Dept of Agriculture              |
|  - Pollachi Regulated Market Committee    - Open-Meteo API (10.65°N, 77.00°E)   |
|  - data/pollachi_datasets.json (Master)   - data/pollachi_datasets.csv          |
+---------------------------------------------------------------------------------+
                                       ^
                        Reads fresh on | Writes back on
                        every request  | POST /api/coconut/update
                                       v
+---------------------------------------------------------------------------------+
|                              NODE.JS BACKEND SERVER                             |
|                               (server.js : 5000)                                |
|  - POST /api/auth/login    : Role verification and session management           |
|  - GET  /api/coconut/data  : Non-cached dynamic read from filesystem            |
|  - POST /api/coconut/update: Physical disk persistence of modified records       |
|  - GET  /api/weather/live  : Real-time meteorological proxy                     |
+---------------------------------------------------------------------------------+
                                       ^
                                       | JSON over HTTP
                                       v
+---------------------------------------------------------------------------------+
|                         CLIENT PRESENTATION & ANALYTICS                         |
|  - Authentication Gateway  : Role-based credential verification                 |
|  - Dual-Axis SVG Core      : Proportioned acreage & production curves           |
|  - Donut Chart Engine      : Value chain & varietal distributions               |
|  - Dataset Management      : In-browser record editing and year additions       |
|  - Multi-Format Exporter   : One-click CSV, Excel (.xls), and PDF outputs       |
+---------------------------------------------------------------------------------+
```

---

## 4. AGRO-ECONOMIC ANALYSIS (2005–2025)

### 4.1 Production & Acreage Expansion
* **Cultivation Area:** Expanded from **31,200 Hectares** (2005) to **46,200 Hectares** (2025) (+48.1%), reflecting large-scale agricultural transition from rainfed field crops into high-value perennial coconut plantations.
* **Nut Production:** Rose from **32.4 Crore nuts** to **59.8 Crore nuts** (+84.6%), yielding a daily harvest volume of over 1.64 million coconuts across Pollachi Taluk.
* **Per-Palm Productivity:** Improved from 92 to 138 nuts/palm/year (+50.0%), driven by pressurized drip fertigation and adoption of high-yielding hybrid cultivars (ALR-CN and VPM-3).

### 4.2 Mandi Pricing & Commercial Realization
* **Copra Auction Prices:** Increased from ₹3,650/quintal in 2005 to ₹11,850/quintal in 2025 (+224.7%), supported by robust industrial coconut oil demand and government procurement operations.
* **Tender Coconut Farmgate Value:** Grew from ₹10.0 to ₹38.0 per nut (+280.0%), boosted by organized refrigerated transit to metropolitan consumer markets.

### 4.3 Drip Irrigation Technology
* Pressurized micro-irrigation expanded from **21.0% in 2005 to 82.5% in 2025**.
* Delivering 30–40 liters of water directly to root systems daily reduced evaporation loss by 45% and mitigated pre-monsoon button shedding.

---

## 5. VIVA VOCE QUESTIONS & MODEL ANSWERS

**Q1: How does the application implement dual-axis visualization, and why is it necessary?**  
*Answer:* Cultivation area is measured in tens of thousands of hectares (31,200–46,200 Ha), while annual production is measured in crore nuts (32.4–59.8 Cr). Plotting both on a single shared vertical scale compresses the production line to the baseline. Our custom SVG engine implements dual Y-axes: the left axis maps acreage, while the right axis maps production independently, allowing both trajectories to be analyzed concurrently.

**Q2: How does the system handle real-time dataset updates?**  
*Answer:* The application connects to a Node.js REST API. When records are modified via the in-browser Dataset Management interface, the client issues a `POST` request to `/api/coconut/update`. The server executes atomic write operations on `data/pollachi_datasets.json` and updates the synchronized CSV file. The client then re-renders all SVG graphs dynamically without requiring a server reboot.

**Q3: How are multi-format downloads generated?**  
*Answer:* Multi-format export is implemented entirely client-side:
* **CSV:** Serializes the active filtered dataset into comma-separated text encoded as a data URI.
* **Excel:** Generates standard XML Spreadsheet (`.xls`) structure with designated headers and data types.
* **PDF:** Utilizes CSS `@media print` stylesheets to format the dashboard layout into an executive printable report.

---

## 6. CONCLUSION
The **Pollachi Coconut Information System** fulfills both academic rigor and practical utility. By pairing a dynamic Node.js backend with an accessible, high-contrast SVG charting interface, the project provides a comprehensive platform for understanding Pollachi's agricultural growth over the 2005–2025 era.
