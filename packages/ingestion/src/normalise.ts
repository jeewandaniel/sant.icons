/**
 * Normalise an SVG string so its outer wrapper has viewBox="0 0 24 24",
 * stripping width/height/class/data-* attributes. If the source viewBox is
 * not 0 0 24 24, the inner content is wrapped in a <g transform> that scales
 * and translates it into the 24×24 coordinate space.
 */
export function normaliseSvg(svg: string): string {
  const openMatch = svg.match(/<svg\b([^>]*)>/);
  if (!openMatch) return svg;
  const attrs = openMatch[1];
  const closeIdx = svg.lastIndexOf("</svg>");
  if (closeIdx === -1) return svg;
  const inner = svg.slice(openMatch.index! + openMatch[0].length, closeIdx).trim();

  const vbMatch = attrs.match(/viewBox\s*=\s*"([^"]+)"/);
  const vb = vbMatch ? vbMatch[1].trim().split(/\s+/).map(Number) : [0, 0, 24, 24];
  const [vx, vy, vw, vh] = vb.length === 4 && vb.every((n) => Number.isFinite(n)) ? vb : [0, 0, 24, 24];

  let body: string;
  if (vx === 0 && vy === 0 && vw === 24 && vh === 24) {
    body = inner;
  } else {
    const scale = 24 / Math.max(vw, vh);
    const tx = -vx * scale;
    const ty = -vy * scale;
    const transform = `scale(${trimNum(scale)}) translate(${trimNum(tx / scale)} ${trimNum(ty / scale)})`;
    body = `<g transform="${transform}">${inner}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${body}</svg>`;
}

function trimNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(4)).toString();
}
