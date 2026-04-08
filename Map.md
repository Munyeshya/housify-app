# 🗺️ Rwanda Administrative Map: Developer Manual

This manual provides a step-by-step guide to building an interactive, hierarchical map of Rwanda (Districts → Sectors → Cells → Villages) using **React**, **Vite**, and **Leaflet**.

---

## 1. Project Architecture
To ensure high performance, we use a **"Lazy-Loading"** strategy. Instead of loading one massive 100MB file of all 14,800+ villages, the app fetches data only for the specific area selected.

### Data Hierarchy
- **Level 1:** `districts.json` (Always loaded first)
- **Level 2:** `sectors_{district_id}.json` (Loaded when a District is clicked)
- **Level 3:** `cells_{sector_id}.json` (Loaded when a Sector is clicked)
- **Level 4:** `villages_{cell_id}.json` (Loaded when a Cell is clicked)

---

## 2. Prerequisites & Setup
In your Vite project folder, run:
`npm install react-leaflet leaflet lucide-react`

---

## 3. Data Preparation
You must **split** your data into small, manageable chunks:
1. **Source:** Get Shapefiles from [NISR Rwanda](https://www.statistics.gov.rw/).
2. **Convert:** Use [Mapshaper.org](https://mapshaper.org/) to convert them to GeoJSON.
3. **Split:** Use the `split` command in Mapshaper (e.g., `split district_name`) to create individual files for each region.

---

## 4. Key React Logic
Use the `key` prop on your `<GeoJSON />` component to force it to re-render whenever you swap from a "District" view to a "Sector" view.


this mmight help https://data.humdata.org/dataset/cod-ab-rwa