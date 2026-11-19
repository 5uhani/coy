// Generates a placeholder portrait (SVG) from an id, so the app needs no
// external image hosts and photos always load, even offline.
export function renderAvatar(seed, name = '?') {
  const h1 = (seed * 47 + 20) % 360;
  const h2 = (h1 + 42) % 360;
  const initial = String(name).trim().charAt(0).toUpperCase().replace(/[<>&"']/g, '') || '?';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="${initial}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1} 72% 74%)"/><stop offset="1" stop-color="hsl(${h2} 62% 46%)"/></linearGradient>
<radialGradient id="r" cx=".25" cy=".15" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="800" fill="url(#g)"/>
<rect width="600" height="800" fill="url(#r)"/>
<circle cx="480" cy="150" r="130" fill="hsl(${h2} 85% 85%)" fill-opacity=".35"/>
<circle cx="90" cy="520" r="90" fill="hsl(${h1} 80% 88%)" fill-opacity=".25"/>
<ellipse cx="300" cy="700" rx="270" ry="290" fill="hsl(${h1} 42% 20%)" fill-opacity=".88"/>
<rect x="258" y="340" width="84" height="110" rx="34" fill="hsl(${h1} 42% 24%)"/>
<circle cx="300" cy="270" r="115" fill="hsl(${h1} 42% 24%)"/>
<text x="300" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="130" fill="#fff" fill-opacity=".92">${initial}</text>
</svg>`;
}
