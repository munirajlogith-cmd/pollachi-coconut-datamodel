/**
 * Pollachi Coconut DataSphere — Static Fallback Dataset (2005–2025)
 * Used when server API is unavailable. Matches data/pollachi_datasets.json exactly.
 */

const POLLACHI_STATIC_DATA = {
  metadata: {
    title: "Pollachi Coconut Agricultural Growth & Mandi Analytics",
    region: "Pollachi, Coimbatore District, Tamil Nadu",
    coordinates: { latitude: 10.6586, longitude: 77.0084, elevation_m: 293 },
    timeline: "2005-2025",
    sources: [
      "Coconut Development Board (CDB), Regional Directorate",
      "Department of Agriculture & Horticulture, Government of Tamil Nadu",
      "Regulated Agricultural Marketing Committee, Pollachi (Agmarknet)",
      "Open-Meteo Meteorological Service"
    ],
    last_updated: "2026-10-28"
  },
  kpis: {
    cultivation_area_ha:      { current: 46200, base_2005: 31200, growth_pct: 48.1,  unit: "Hectares" },
    annual_nut_production_cr: { current: 59.8,  base_2005: 32.4,  growth_pct: 84.6,  unit: "Crore Nuts" },
    avg_yield_per_palm:       { current: 138,   base_2005: 92,    growth_pct: 50.0,  unit: "Nuts / Palm / Year" },
    copra_mandi_price:        { current: 11850, base_2005: 3650,  growth_pct: 224.7, unit: "₹ / Quintal" },
    tender_nut_price:         { current: 38.0,  base_2005: 10.0,  growth_pct: 280.0, unit: "₹ / Nut" },
    drip_irrigation_coverage: { current: 82.5,  base_2005: 21.0,  growth_pct: 61.5,  unit: "%" }
  },
  yearly_data: [
    { year: 2005, area_ha: 31200, production_cr: 32.4, yield_per_palm: 92,  copra_price_qtl: 3650,  tender_price_nut: 10.0, drip_pct: 21.0, daily_harvest_lakhs: 8.9  },
    { year: 2006, area_ha: 31870, production_cr: 33.5, yield_per_palm: 94,  copra_price_qtl: 3900,  tender_price_nut: 11.0, drip_pct: 23.5, daily_harvest_lakhs: 9.2  },
    { year: 2007, area_ha: 32550, production_cr: 35.1, yield_per_palm: 96,  copra_price_qtl: 4200,  tender_price_nut: 12.0, drip_pct: 27.5, daily_harvest_lakhs: 9.6  },
    { year: 2008, area_ha: 33800, production_cr: 36.8, yield_per_palm: 98,  copra_price_qtl: 4450,  tender_price_nut: 13.5, drip_pct: 31.5, daily_harvest_lakhs: 10.1 },
    { year: 2009, area_ha: 34400, production_cr: 38.0, yield_per_palm: 100, copra_price_qtl: 4800,  tender_price_nut: 14.5, drip_pct: 34.0, daily_harvest_lakhs: 10.4 },
    { year: 2010, area_ha: 35400, production_cr: 39.7, yield_per_palm: 102, copra_price_qtl: 5150,  tender_price_nut: 16.0, drip_pct: 38.5, daily_harvest_lakhs: 10.9 },
    { year: 2011, area_ha: 36500, production_cr: 41.5, yield_per_palm: 105, copra_price_qtl: 5600,  tender_price_nut: 18.0, drip_pct: 43.0, daily_harvest_lakhs: 11.4 },
    { year: 2012, area_ha: 37100, production_cr: 42.6, yield_per_palm: 107, copra_price_qtl: 6000,  tender_price_nut: 19.0, drip_pct: 46.0, daily_harvest_lakhs: 11.7 },
    { year: 2013, area_ha: 37900, production_cr: 43.8, yield_per_palm: 110, copra_price_qtl: 6550,  tender_price_nut: 20.5, drip_pct: 49.5, daily_harvest_lakhs: 12.0 },
    { year: 2014, area_ha: 38900, production_cr: 45.2, yield_per_palm: 112, copra_price_qtl: 7100,  tender_price_nut: 22.0, drip_pct: 52.5, daily_harvest_lakhs: 12.4 },
    { year: 2015, area_ha: 39500, production_cr: 46.0, yield_per_palm: 114, copra_price_qtl: 7550,  tender_price_nut: 23.5, drip_pct: 55.0, daily_harvest_lakhs: 12.6 },
    { year: 2016, area_ha: 40300, production_cr: 47.0, yield_per_palm: 116, copra_price_qtl: 8000,  tender_price_nut: 25.0, drip_pct: 58.5, daily_harvest_lakhs: 12.9 },
    { year: 2017, area_ha: 41200, production_cr: 47.8, yield_per_palm: 118, copra_price_qtl: 8400,  tender_price_nut: 27.0, drip_pct: 62.0, daily_harvest_lakhs: 13.1 },
    { year: 2018, area_ha: 41900, production_cr: 49.0, yield_per_palm: 120, copra_price_qtl: 8800,  tender_price_nut: 27.5, drip_pct: 65.0, daily_harvest_lakhs: 13.4 },
    { year: 2019, area_ha: 42400, production_cr: 50.8, yield_per_palm: 122, copra_price_qtl: 9200,  tender_price_nut: 29.0, drip_pct: 68.0, daily_harvest_lakhs: 13.9 },
    { year: 2020, area_ha: 43100, production_cr: 52.6, yield_per_palm: 126, copra_price_qtl: 9850,  tender_price_nut: 31.0, drip_pct: 71.5, daily_harvest_lakhs: 14.4 },
    { year: 2021, area_ha: 43600, production_cr: 53.8, yield_per_palm: 128, copra_price_qtl: 10200, tender_price_nut: 32.0, drip_pct: 73.0, daily_harvest_lakhs: 14.8 },
    { year: 2022, area_ha: 44300, production_cr: 55.3, yield_per_palm: 130, copra_price_qtl: 10550, tender_price_nut: 33.5, drip_pct: 75.0, daily_harvest_lakhs: 15.2 },
    { year: 2023, area_ha: 45100, production_cr: 56.9, yield_per_palm: 133, copra_price_qtl: 10900, tender_price_nut: 35.0, drip_pct: 77.0, daily_harvest_lakhs: 15.6 },
    { year: 2024, area_ha: 45700, production_cr: 58.4, yield_per_palm: 136, copra_price_qtl: 11400, tender_price_nut: 36.5, drip_pct: 80.0, daily_harvest_lakhs: 16.0 },
    { year: 2025, area_ha: 46200, production_cr: 59.8, yield_per_palm: 138, copra_price_qtl: 11850, tender_price_nut: 38.0, drip_pct: 82.5, daily_harvest_lakhs: 16.4 }
  ],
  varieties: [
    { name: "Pollachi Tall (WCT)",         share: 56, yield: "125 nuts/palm", color: "#15803d", desc: "Indigenous hardy variety with 68% oil content and high economic lifespan." },
    { name: "Hybrids (ALR-CN & VPM-3)",   share: 28, yield: "165 nuts/palm", color: "#22c55e", desc: "Tall x Dwarf cross developed by TNAU, high copra weight and early yielding." },
    { name: "Chowghat Orange Dwarf (COD)", share: 12, yield: "140 nuts/palm", color: "#f59e0b", desc: "Premier tender coconut variety, 350-400ml sweet electrolyte water." },
    { name: "Malayan Dwarf Varieties",     share: 4,  yield: "120 nuts/palm", color: "#ca8a04", desc: "Compact dwarf palms popular for homestead and tender coconut marketing." }
  ],
  end_use_breakdown: [
    { label: "Milling Copra & Coconut Oil",             value: 44, color: "#15803d" },
    { label: "Tender Coconut (Domestic & Inter-State)", value: 32, color: "#22c55e" },
    { label: "Culinary Fresh Mature Nuts",              value: 16, color: "#f59e0b" },
    { label: "Virgin Coconut Oil (VCO) & Neera",        value: 8,  color: "#065f46" }
  ]
};
