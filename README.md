# 🥥 Pollachi Coconut Information System
> **An Interactive Web Application for Agricultural Growth & Mandi Analytics**  
> **Region:** Pollachi Division, Coimbatore District, Tamil Nadu (Lat: 10.6586° N, Lon: 77.0084° E)  
> **Timeline:** 2005 – 2025 (Historical Records) + Dynamic Projection Management  
> **Tech Stack:** Node.js, RESTful APIs, Custom SVG Visualizations, Open-Meteo Integration

---

## 📌 Project Overview
The **Pollachi Coconut Information System** is an agricultural analytics platform developed to track, visualize, and analyze the 20-year agro-economic evolution (2005–2025) of coconut farming in **Pollachi, Coimbatore District**—the premier coconut production and copra trading center in South India.

The platform provides an integrated suite of analytical tools:
1. **Production & Cultivation Analytics:** Dual-axis visualization of acreage expansion (31,200 Ha $\to$ 46,200 Ha) and annual nut yields (32.4 Cr $\to$ 59.8 Cr nuts).
2. **Post-Harvest Value Chain:** Proportional distribution of milling copra, tender coconuts, culinary nuts, and virgin coconut oil.
3. **Mandi Economics & Copra Pricing:** Historical auction prices from the Pollachi Regulated Market Committee and farmgate realization trends.
4. **Cultivar Diversity:** Varietal acreage distribution across Pollachi Tall (WCT), High-Yield Hybrids (ALR-CN/VPM-3), and Chowghat Orange Dwarf.
5. **Micro-Irrigation Adoption:** Pressurized drip coverage progression (21.0% $\to$ 82.5%) and its agronomic correlation with palm productivity.
6. **Agro-Meteorological Feed:** Real-time meteorological observations for Pollachi fetched via Open-Meteo REST service.
7. **Dataset Management & Multi-Format Exports:** Direct in-browser dataset updates with server disk synchronization, and one-click exports to **CSV**, **Excel (.xls)**, and **PDF**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v16 or higher recommended)
- Standard web browser (Chrome, Edge, Firefox, Safari)

### 2. Installation & Running
```bash
# Clone the repository
git clone https://github.com/<your-username>/pollachi-coconut-data-viz.git
cd pollachi-coconut-data-viz

# Start the server (Option A: npm)
npm install
npm start

# Start the server (Option B: direct Node execution)
node server.js
```

Open your browser and navigate to:  
👉 **`http://localhost:5000`**

*(Alternative Python runner: `python server.py`)*

---

## 🔑 Authentication & Role-Based Access Control (RBAC)

The portal implements role-based authentication and authorization mechanisms satisfying academic evaluation guidelines:

| Role | Username | Password | Role Permissions & Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | **Full Read & Write Access**: Edit annual records, append future forecast years (e.g. 2026), delete rows, save changes to disk/localStorage, and trigger defaults reset. |
| **Student** | `student` | `student123` | **Read-Only Analytics**: Explore all 7 analytical views, filter custom From/To year ranges, inspect KPI cards, and export reports (CSV/Excel/PDF). |
| **Faculty Evaluator** | `faculty` | `faculty123` | **Evaluation Access**: Inspect interactive data visualizations, review Power BI integration workspace, verify audit logs, and download raw datasets. |

---

## 📊 Microsoft Power BI Dashboard Integration

This application includes a dedicated **Microsoft Power BI Analytics** module integrating the 21-year Pollachi Coconut Dataset (`data/pollachi_datasets.csv`):

1. **Integrated Power BI Tab:** Accessible directly from the sidebar navigation (`Power BI Dashboard`).
2. **Visual Analytics Workspace:** Embedded KPI cards and DAX measures:
   - **Production Growth (CAGR):** `DIVIDE(MAX('Data'[Production_Cr]) - MIN('Data'[Production_Cr]), MIN('Data'[Production_Cr]))`
   - **Mandi Price Realization:** `AVERAGE('Data'[Copra_Price_Qtl])`
   - **Water Conservation Index:** `SUM('Data'[Area_Ha]) * AVERAGE('Data'[Drip_Pct]) * 0.45`
3. **Dataset Ingestion:** Direct one-click download of `pollachi_datasets.csv` formatted for direct import into Power BI Desktop (`Get Data -> Text/CSV`).

---

## 📊 Summary of Agro-Economic Indicators (2005 vs 2025)

| Parameter | Year 2005 | Year 2025 | Overall Change |
| :--- | :--- | :--- | :--- |
| **Cultivation Area** | 31,200 Ha | 46,200 Ha | **+48.1%** |
| **Annual Nut Production** | 32.4 Crore | 59.8 Crore | **+84.6%** |
| **Yield per Palm** | 92 nuts/yr | 138 nuts/yr | **+50.0%** |
| **Copra Mandi Price** | ₹3,650 / Qtl | ₹11,850 / Qtl | **+224.7%** |
| **Tender Coconut Price** | ₹10.0 / nut | ₹38.0 / nut | **+280.0%** |
| **Drip Irrigation Coverage** | 21.0% | 82.5% | **+61.5% pts** |
| **Daily Harvest Volume** | 8.9 Lakh nuts | 16.4 Lakh nuts | **+84.3%** |

---

## 📁 Repository Structure

```
pollachi-coconut-data-viz/
│
├── package.json              # Node.js project manifest & scripts
├── server.js                 # Production Node.js backend server & REST APIs
├── server.py                 # Alternative Python backend server
├── .gitignore                # Git ignore configuration
├── GITHUB_GUIDE.md           # Step-by-step GitHub repository instructions
├── README.md                 # Complete project documentation
├── PROJECT_REPORT.md         # Comprehensive Academic Project Report
│
├── data/
│   ├── pollachi_datasets.json # Master time-series records (2005 - 2025)
│   └── pollachi_datasets.csv  # Standard CSV version of records
│
├── css/
│   └── styles.css            # Responsive layout and presentation styles
│
└── js/
    ├── api.js                # Client API service for REST calls & auth
    ├── charts.js             # Dual-axis SVG charting & donut engine
    └── app.js                # Core controller, exports, and data management
```

---

## 📜 Data Sources & Acknowledgments
- **Coconut Development Board (CDB)**, Regional Directorate, Kochi & Coimbatore
- **Department of Agriculture & Horticulture**, Government of Tamil Nadu
- **Regulated Agricultural Marketing Committee, Pollachi (Agmarknet)**
- **Open-Meteo Meteorological Service** (Open Public Weather Data)
