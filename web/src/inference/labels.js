/**
 * 13 Morphological RBC classes from Chula-RBC-12 dataset.
 * Matches ml/src/data_prep.py index order (0..12).
 */
export const RBC_CLASSES = [
  { id: 0, name: "Normal", color: "#10b981", isAbnormal: false, desc: "Biconcave disc, central pallor ~1/3 diameter." },
  { id: 1, name: "Macrocyte", color: "#38bdf8", isAbnormal: true, desc: "Abnormally large RBC (>8.5µm). Often seen in B12/folate deficiency." },
  { id: 2, name: "Microcyte", color: "#818cf8", isAbnormal: true, desc: "Abnormally small RBC (<6.0µm). Associated with iron deficiency or thalassemia." },
  { id: 3, name: "Spherocyte", color: "#f43f5e", isAbnormal: true, desc: "Spherical cell with loss of central pallor. Hereditary spherocytosis or AIHA." },
  { id: 4, name: "Target_cell", color: "#f59e0b", isAbnormal: true, desc: "Bullseye appearance with central hemoglobin condensation. Hemoglobinopathies." },
  { id: 5, name: "Stomatocyte", color: "#fb923c", isAbnormal: true, desc: "Slit-like, mouth-shaped central pallor. Liver disease or hereditary stomatocytosis." },
  { id: 6, name: "Ovalocyte", color: "#e879f9", isAbnormal: true, desc: "Oval-shaped erythrocyte with rounded ends. Ovalocytosis / megaloblastic anemia." },
  { id: 7, name: "Teardrop", color: "#c084fc", isAbnormal: true, desc: "Dacryocyte; pear or teardrop shape. Myelofibrosis or marrow infiltration." },
  { id: 8, name: "Burr_cell", color: "#eab308", isAbnormal: true, desc: "Echinocyte with regular small blunt projections. Renal failure or uremia." },
  { id: 9, name: "Schistocyte", color: "#ef4444", isAbnormal: true, desc: "Fragmented RBC helmet cell. Critical finding in microangiopathic hemolytic anemia (TTP/HUS)." },
  { id: 10, name: "Uncategorised", color: "#94a3b8", isAbnormal: false, desc: "Atypical morphology or unresolvable overlapping cell." },
  { id: 11, name: "Hypochromia", color: "#2dd4bf", isAbnormal: true, desc: "Enlarged central pallor (>1/2 diameter). Reduced hemoglobin content." },
  { id: 12, name: "Elliptocyte", color: "#ec4899", isAbnormal: true, desc: "Elongated rod-shaped or pencil-shaped cell. Hereditary elliptocytosis or iron deficiency." }
];

export const CLASS_BY_NAME = Object.fromEntries(RBC_CLASSES.map(c => [c.name, c]));
