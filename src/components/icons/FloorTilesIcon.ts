import { createLucideIcon } from "lucide-react";

// Floor tiles seen in perspective (a tiled floor running away from you), drawn on
// lucide's 24px grid so it matches the other icons. Lucide has no flooring icon.
const FloorTilesIcon = createLucideIcon("floor-tiles", [
  // The floor's outline
  ["path", { d: "M6 6h12l4 14H2Z", key: "floor" }],
  // Rows of tiles
  ["path", { d: "M4.86 10h14.28", key: "row-1" }],
  ["path", { d: "M3.57 14.5h16.86", key: "row-2" }],
  // Joints running towards the back
  ["path", { d: "M10 6 8.67 20", key: "joint-1" }],
  ["path", { d: "M14 6l1.33 14", key: "joint-2" }],
]);

export default FloorTilesIcon;
