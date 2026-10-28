import { useMemo } from "react";
import { showroomHtml } from "../lib/showroom-html";
import type { Showroom } from "../lib/types";
export function ShowroomViewer({ room }: { room: Showroom }) {
  const html = useMemo(() => showroomHtml(room), [room]);
  return (
    <iframe
      title="Không gian 3D"
      srcDoc={html}
      sandbox="allow-scripts"
      style={{ width: "100%", height: 420, border: 0, borderRadius: 20 }}
    />
  );
}
