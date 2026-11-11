import { createLucideIcon } from "lucide-react";

// A bolt of raw fabric: a roll lying on its side with cloth hanging from it,
// drawn on lucide's 24px grid so it matches the other icons (stroke, caps, size).
// Lucide has no fabric icon of its own.
const FabricRollIcon = createLucideIcon("fabric-roll", [
  // The roll's end, with its core
  ["ellipse", { cx: "5", cy: "7", rx: "2", ry: "4", key: "end" }],
  ["ellipse", { cx: "5", cy: "7", rx: "0.6", ry: "1.2", key: "core" }],
  // The roll's body
  ["path", { d: "M5 3h12a2 4 0 0 1 0 8", key: "body" }],
  // The cloth hanging down, with a soft wavy hem
  ["path", { d: "M5 11c0 3.5.6 6.4 1.8 9.2c1.9-1.2 3.6 1.2 5.5 0s3.6 1.2 5.5 0C17.6 17.4 17 14.2 17 11", key: "cloth" }],
  // Folds in the draped cloth
  ["path", { d: "M9.5 11.5c.2 2.6.6 4.8 1.3 6.6", key: "fold-1" }],
  ["path", { d: "M13.5 11.5c0 2.4.3 4.4.9 6.2", key: "fold-2" }],
]);

export default FabricRollIcon;
