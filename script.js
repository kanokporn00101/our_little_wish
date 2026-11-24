(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const SVGNS = "http://www.w3.org/2000/svg";
  const POLL_MS = 3000;
  const STYLES = {
    lotus: { zh: "粉莲", th: "บัวชมพู", desc: "柔情 · ความรักอ่อนหวาน" },
    white: { zh: "白莲", th: "บัวขาว", desc: "安宁 · ความสงบสุข" },
    leaf: { zh: "蕉叶灯", th: "กระทงใบตอง", desc: "吉祥 · โชคดีมงคล" },
  };
  const styleOf = (k) => STYLES[k.style] || STYLES.lotus;
  const NUM_ZH = { 3: "三", 2: "二", 1: "一" };

  /* ---------- วาดกระทงด้วย SVG (ไม่ใช้อีโมจิ) ---------- */
  /* ---------- กระทงบัว: กลีบซ้อนหลายชั้น กุหลาบ มะลิ ท่อนกล้วย ธูป และป้ายคำอธิษฐาน ---------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const hash = (i) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const CX = 100,
    Y0 = 118,
    VS = 0.74,
    VC = 0.67; // มุมมองจากด้านหน้าเยื้องขึ้นบน
  const PET =
    "M0 0C-.5 -.1 -.62 -.5 -.27 -.85Q0 -1.05 .27 -.85C.62 -.5 .5 -.1 0 0Z";
  const LEAF = "M0 0C-.62 -.12 -.56 -.62 0 -1C.56 -.62 .62 -.12 0 0Z";
  const PAL = {
    lotus: {
      back: "url(#pgb-lotus)",
      front: "url(#pgf-lotus)",
      edge: "rgba(205,85,120,.5)",
      fold: "#c4506f",
      hi: "#fff",
    },
    white: {
      back: "url(#pgb-white)",
      front: "url(#pgf-white)",
      edge: "rgba(150,140,200,.5)",
      fold: "#a69ccb",
      hi: "#fff",
    },
    leaf: {
      back: "url(#pgb-leaf)",
      front: "url(#pgf-leaf)",
      edge: "rgba(14,60,24,.9)",
      fold: "#d8f2a8",
      hi: "#e6ffc0",
    },
  };
  const RINGS = {
    petal: [
      { n: 15, R: 40, h: 7, L: 42, a: 46, w: 25, off: 0.2, fl: 1 },
      { n: 12, R: 31, h: 11, L: 52, a: 34, w: 24, off: 0.55, fl: 0.8 },
      { n: 10, R: 21, h: 17, L: 48, a: 22, w: 22, off: 0.1, fl: 0.66 },
    ],
    leaf: [
      { n: 18, R: 40, h: 0, L: 34, a: 42, w: 19, off: 0.1, fl: 1 },
      { n: 15, R: 32, h: 6, L: 40, a: 34, w: 17, off: 0.4, fl: 0.76 },
      { n: 12, R: 23, h: 13, L: 42, a: 26, w: 15, off: 0.2, fl: 0.62 },
    ],
  };
  function petalSVG(bx, by, rot, len, w, P, side, shape, leafy) {
    const fill = side === "back" ? P.back : P.front;
    const g = `<path d="${shape}" fill="${fill}" stroke="${P.edge}" stroke-width=".7" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;
    const extra = leafy
      ? `<path d="M0 0C.1 -.3 .1 -.7 0 -1L.58 -.6C.6 -.3 .4 -.1 0 0Z" fill="#06240d" opacity=".28"/><path d="M0 -.04L0 -.9" stroke="${P.fold}" stroke-width=".8" vector-effect="non-scaling-stroke" opacity=".7"/>`
      : `<path d="${shape}" fill="url(#petShade)"/><path d="${shape}" fill="url(#sheenG)"/><path d="M0 -.1C.03 -.3 .03 -.55 0 -.78M-.14 -.14C-.22 -.35 -.2 -.55 -.12 -.7M.14 -.14C.22 -.35 .2 -.55 .12 -.7" fill="none" stroke="${P.fold}" stroke-width=".55" vector-effect="non-scaling-stroke" opacity=".3"/><path d="M.46 -.2C.56 -.45 .42 -.72 .22 -.86" fill="none" stroke="${P.hi}" stroke-width="1" vector-effect="non-scaling-stroke" opacity=".55"/>`;
    return `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${w.toFixed(2)} ${len.toFixed(2)})">${g}${extra}</g>`;
  }
  function ringSVG(d, P, side, shape, leafy) {
    const al = (d.a * Math.PI) / 180,
      list = [];
    for (let i = 0; i < d.n; i++) {
      const th = d.off + (2 * Math.PI * i) / d.n,
        sn = Math.sin(th);
      if ((side === "front") !== sn > 0) continue;
      list.push({ th, sn, cs: Math.cos(th), i });
    }
    list.sort((p, q) => p.sn - q.sn);
    return list
      .map(({ sn, cs, i }) => {
        const l =
          d.L *
          (1 + (hash(i + d.n * 7) - 0.5) * 0.12) *
          (side === "front" ? d.fl : 1.08);
        const bx = CX + d.R * cs,
          by = Y0 - d.h * VC + d.R * VS * sn;
        const dx = l * Math.sin(al) * cs * 1.12,
          dy =
            -l * Math.cos(al) * VC * 1.12 + l * Math.sin(al) * VS * sn * 0.42; // กลีบโค้งช้อนขึ้น ปลายกลีบไม่ชี้เข้าหาคนดู
        const len = Math.hypot(dx, dy),
          rot = (Math.atan2(dx, -dy) * 180) / Math.PI;
        return petalSVG(
          bx,
          by,
          rot,
          len,
          d.w * (1 + (hash(i * 3 + d.n) - 0.5) * 0.1),
          P,
          side,
          shape,
          leafy,
        );
      })
      .join("");
  }
  function rose(cx, cy, r, style, i) {
    const g = style === "white" ? "url(#rosePinkG)" : "url(#roseG)",
      dk = style === "white" ? "#9c2a55" : "#650716";
    return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(hash(i * 3) * 360).toFixed(0)}) scale(${r.toFixed(2)})">
    <circle r="1" fill="${g}" stroke="${dk}" stroke-width=".06"/>
    <path d="M-.86 .1C-.8 .72 .2 1 .78 .44" fill="none" stroke="${dk}" stroke-width=".07" opacity=".5"/>
    <path d="M-.9 -.12C-.62 -.82 .42 -.96 .86 -.34" fill="none" stroke="#fff" stroke-width=".06" opacity=".3"/>
    <path d="M-.62 .02C-.56 .56 .3 .68 .58 .16C.66 -.4 -.1 -.68 -.46 -.34" fill="none" stroke="${dk}" stroke-width=".07" opacity=".55"/>
    <path d="M-.32 .06C-.22 .4 .22 .4 .34 .06C.34 -.24 0 -.34 -.24 -.18C-.34 -.06 -.1 .12 .12 .03" fill="none" stroke="${dk}" stroke-width=".08"/>
    <circle r=".1" fill="${dk}" opacity=".85"/></g>`;
  }
  function marigold(cx, cy, r, i) {
    let p = "";
    for (let k = 0; k < 11; k++)
      p += `<ellipse cy="${(-r * 0.6).toFixed(2)}" rx="${(r * 0.3).toFixed(2)}" ry="${(r * 0.6).toFixed(2)}" transform="rotate(${k * 32.7})" fill="#ffb21f" stroke="#d96b00" stroke-width=".3"/>`;
    for (let k = 0; k < 8; k++)
      p += `<ellipse cy="${(-r * 0.34).toFixed(2)}" rx="${(r * 0.22).toFixed(2)}" ry="${(r * 0.38).toFixed(2)}" transform="rotate(${k * 45 + 18})" fill="#ff8a00"/>`;
    return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(hash(i * 5) * 90).toFixed(0)})">${p}<circle r="${(r * 0.18).toFixed(2)}" fill="#b94a00"/></g>`;
  }
  function jasmine(cx, cy, k, seed) {
    let s = "";
    for (let i = 0; i < k; i++) {
      const a = hash(seed + i) * 6.283,
        d = 1 + hash(seed + i * 5) * 5;
      s += `<g transform="translate(${(cx + Math.cos(a) * d).toFixed(1)} ${(cy + Math.sin(a) * d * 0.7).toFixed(1)}) rotate(${(hash(seed + i * 9) * 180).toFixed(0)})"><ellipse rx="1.7" ry="3.1" fill="#fffef4" stroke="#e0d5ab" stroke-width=".3"/><path d="M0 -2.7L0 -.4" stroke="#efe5bd" stroke-width=".3"/><circle cy="2.5" r=".75" fill="#9cc25e"/></g>`;
    }
    return s;
  }
  // ป้ายคำอธิษฐาน: ความกว้างข้อความโดยประมาณ (ตัวจีน = 1, ไทย/อังกฤษ ≈ .55)
  function tagText(t) {
    const s = String(t || "")
      .trim()
      .slice(0, 12);
    if (!s) return "";
    let wd = 0;
    for (const ch of s)
      wd += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.55;
    const fs = 8,
      w = wd * fs,
      max = 46;
    return `<text x="0" y="3" text-anchor="middle" font-family="'Noto Serif SC','Kanit',serif" font-size="${fs}" font-weight="600" fill="#5a3418"${w > max ? ` textLength="${max}" lengthAdjust="spacingAndGlyphs"` : ""}>${esc(s)}</text>`;
  }
  function krathongSVG(style, water, tag) {
    if (!PAL[style]) style = "lotus";
    const P = PAL[style],
      leafy = style === "leaf",
      rings = leafy ? RINGS.leaf : RINGS.petal,
      shape = leafy ? LEAF : PET;
    const cyI = Y0 - 44 * VC; // ศูนย์กลางของกองดอกไม้ด้านใน
    // ดอกไม้ด้านใน แยกหลัง/หน้า
    const flowers = [];
    const NR = leafy ? 7 : 8;
    for (let i = 0; i < NR; i++) {
      const th = 0.35 + (2 * Math.PI * i) / NR,
        sn = Math.sin(th),
        cs = Math.cos(th),
        r = 10 + 1.8 * sn;
      const x = CX + 17 * cs,
        y = cyI + 17 * VS * sn + 3;
      flowers.push({
        sn,
        svg:
          leafy && i % 2
            ? marigold(x, y, r * 1.02, i)
            : rose(x, y, r, style, i),
      });
      const th2 = th + Math.PI / NR,
        sn2 = Math.sin(th2),
        cs2 = Math.cos(th2);
      if (!leafy)
        flowers.push({
          sn: sn2 - 0.01,
          svg: jasmine(CX + 21 * cs2, cyI + 21 * VS * sn2 + 1, 6, i * 11 + 3),
        });
      else
        flowers.push({
          sn: sn2 - 0.01,
          svg: marigold(CX + 22 * cs2, cyI + 22 * VS * sn2 + 1, 5.2, i + 40),
        });
    }
    if (!leafy)
      [-1, 0, 1].forEach((k, j) =>
        flowers.push({
          sn: 0.2 + j * 0.1,
          svg: jasmine(CX + k * 7, cyI + 8, 5, 90 + j * 7),
        }),
      );
    [
      [-13, -7],
      [13, -8],
      [0, -12],
      [-22, 2],
      [22, 1],
    ].forEach(([dx, dy], j) =>
      flowers.push({
        sn: -1.5 - j * 0.01,
        svg:
          leafy && j % 2
            ? marigold(CX + dx, cyI + dy, 8.5, j + 60)
            : rose(CX + dx, cyI + dy, 8.8, style, j + 20),
      }),
    );
    flowers.sort((a, b) => a.sn - b.sn);
    const flBack = flowers
      .filter((f) => f.sn < 0)
      .map((f) => f.svg)
      .join("");
    const flFront = flowers
      .filter((f) => f.sn >= 0)
      .map((f) => f.svg)
      .join("");
    // ท่อนกล้วย ธูป เทียน
    const LT = cyI - 6;
    const log = `<path d="M88 ${LT}V${LT + 15}A12 5.2 0 0 0 112 ${LT + 15}V${LT}Z" fill="url(#logG)" stroke="#b3a684" stroke-width=".5"/>
    <path d="M93 ${LT + 2}V${LT + 17}M97.5 ${LT + 3}V${LT + 18.5}M102.5 ${LT + 3}V${LT + 18.5}M107 ${LT + 2}V${LT + 17}" stroke="#b3a684" stroke-opacity=".5" stroke-width=".4"/>
    <ellipse cx="100" cy="${LT}" rx="12" ry="5.2" fill="url(#logTopG)" stroke="#cdbf9a" stroke-width=".5"/>
    <ellipse cx="100" cy="${LT}" rx="8" ry="3.4" fill="none" stroke="#c8b88c" stroke-width=".4"/><ellipse cx="100" cy="${LT}" rx="5" ry="2.1" fill="none" stroke="#c8b88c" stroke-width=".4"/><ellipse cx="100" cy="${LT}" rx="2" ry=".9" fill="#d9c9a0"/>`;
    const sticks = [
      [-13, 62, 95.5],
      [-1.5, 69, 100],
      [11, 60, 104.5],
    ]
      .map(([ang, len, bx]) => {
        const a = (ang * Math.PI) / 180,
          tx = bx + Math.sin(a) * len,
          ty = LT - 1 - Math.cos(a) * len;
        return `<line x1="${bx}" y1="${LT - 1}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#7a3510" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="${bx}" y1="${LT - 1}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="url(#incG)" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="1.4" fill="#ff5a3a"/><circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="5" fill="url(#glowG)" opacity=".75"/>`;
      })
      .join("");
    const tipX = 100 + Math.sin((-1.5 * Math.PI) / 180) * 69,
      tipY = LT - 1 - 69;
    const candle = `<rect x="97.4" y="${LT - 22}" width="5.2" height="22" rx="1.2" fill="url(#waxG)" stroke="#c9a46a" stroke-width=".5"/>
    <path d="M97.4 ${LT - 20}Q99.4 ${LT - 15} 99 ${LT - 11}Q98.6 ${LT - 9} 98.1 ${LT - 12}Z" fill="#fffaf0" opacity=".9"/>
    <line x1="100" y1="${LT - 25}" x2="100" y2="${LT - 22}" stroke="#2b1a10" stroke-width=".9"/>
    <path class="flame" d="M100 ${LT - 42}C94.5 ${LT - 34} 95 ${LT - 27} 100 ${LT - 24}C105 ${LT - 27} 105.5 ${LT - 34} 100 ${LT - 42}Z" fill="#ff9a1f"/>
    <path class="flame" d="M100 ${LT - 37}C97.6 ${LT - 32} 98 ${LT - 28} 100 ${LT - 26}C102 ${LT - 28} 102.4 ${LT - 32} 100 ${LT - 37}Z" fill="#fff2b0"/>
    <path d="M98.7 ${LT - 25.4}Q100 ${LT - 23.2} 101.3 ${LT - 25.4}Q100 ${LT - 27} 98.7 ${LT - 25.4}Z" fill="#79b1ff" opacity=".75"/>`;
    // ป้าย
    const tg =
      tag === undefined || tag === null
        ? ""
        : `
    <line x1="128" y1="${cyI + 6}" x2="131" y2="30" stroke="#7a5326" stroke-width="1.5" stroke-linecap="round"/>
    <g transform="translate(152 22) rotate(5)">
      <rect x="-29" y="-12" width="60" height="26" rx="3" fill="#1b1209" opacity=".9"/>
      <rect x="-31" y="-14" width="60" height="26" rx="3" fill="url(#tagG)" stroke="#e8d9b2" stroke-width=".4"/>
      <rect x="-28.4" y="-11.4" width="54.8" height="20.8" rx="1.8" fill="none" stroke="#c9a574" stroke-width=".7" stroke-dasharray="2.2 1.6"/>
      <g transform="translate(-2 -1)">${tagText(tag || "心愿")}</g>
    </g>`;
    const ripples = water
      ? `
    <ellipse class="rip" cx="100" cy="148" rx="74" ry="8" fill="none" stroke="#cfe0ff" stroke-width="1"/>
    <ellipse class="rip r2" cx="100" cy="148" rx="74" ry="8" fill="none" stroke="#cfe0ff" stroke-width="1"/>
    <ellipse cx="100" cy="150" rx="58" ry="6" fill="url(#glowG)" opacity=".5"/>`
      : "";
    return `<svg viewBox="0 0 200 160" role="img" aria-hidden="true">
    ${ripples}
    <ellipse cx="100" cy="148" rx="64" ry="8" fill="rgba(0,0,0,.42)"/>
    <path d="M58 ${Y0 - 2 * VC}A42 ${42 * VS} 0 0 0 142 ${Y0 - 2 * VC}L130 ${Y0 + 16 * VC}A30 ${30 * VS} 0 0 1 70 ${Y0 + 16 * VC}Z" fill="url(#bowlG)" stroke="#7a8d18" stroke-width=".7"/>
    <path d="M62 ${Y0 + 1}A40 ${40 * VS * 0.9} 0 0 0 138 ${Y0 + 1}" fill="none" stroke="#fffbb0" stroke-width="1" opacity=".5"/>
    ${[...rings]
      .reverse()
      .map((d) => ringSVG(d, P, "back", shape, leafy))
      .join("")}
    <ellipse cx="100" cy="${(cyI + 8).toFixed(1)}" rx="29" ry="19" fill="${leafy ? "#cfe6a0" : "url(#floorG)"}"/>
    ${flBack}
    ${tg}
    ${log}
    ${sticks}
    <path class="smoke" d="M${tipX.toFixed(1)} ${tipY.toFixed(1)}q-5 -6 0 -11t0 -11" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="100" cy="${LT - 33}" r="34" fill="url(#glowG)" class="kr-glow"/>
    ${candle}
    ${flFront}
    ${rings
      .slice()
      .reverse()
      .map((d) => ringSVG(d, P, "front", shape, leafy))
      .join("")}
    ${leafy ? marigold(62, 138, 5.2, 71) + marigold(139, 139, 5.6, 72) : ""}
  </svg>`;
  }
  function lanternSVG(w) {
    return `<svg viewBox="0 0 80 134" width="${w}" aria-hidden="true">
    <line x1="40" y1="0" x2="40" y2="16" stroke="#d9a441" stroke-width="2"/>
    <rect x="27" y="14" width="26" height="7" rx="2" fill="#e8b95a"/>
    <ellipse cx="40" cy="58" rx="35" ry="37" fill="url(#lanternG)"/>
    <path d="M40 21Q17 58 40 95M40 21Q63 58 40 95M40 21V95" fill="none" stroke="#6d0813" stroke-opacity=".55" stroke-width="1.4"/>
    <rect x="27" y="92" width="26" height="7" rx="2" fill="#e8b95a"/>
    <text x="40" y="68" text-anchor="middle" font-family="'Ma Shan Zheng','Noto Serif SC',serif" font-size="28" fill="#ffd98a">福</text>
    <path d="M40 99V126M34 99L32 122M46 99L48 122" stroke="#e8b95a" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
  }

  /* ---------- ตกแต่งฉาก ---------- */
  (function decorate() {
    const L = $("#lanterns");
    [
      [2, 74, 0],
      [12, 52, 1.2],
      [88, 56, 2.1],
      [97, 78, 0.6],
    ].forEach(([x, w, d]) => {
      const el = document.createElement("div");
      el.className = "hang";
      el.style.left = `calc(${x}% - ${w / 2}px)`;
      el.style.animationDelay = d + "s";
      el.innerHTML = lanternSVG(w);
      L.appendChild(el);
    });
    $("#heroKr").innerHTML = krathongSVG("lotus", false, "愿");
    const st = $("#riverStars");
    for (let i = 0; i < 70; i++) {
      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", Math.random() * 1000);
      c.setAttribute("cy", Math.random() * 280);
      c.setAttribute("r", (Math.random() * 1.3 + 0.4).toFixed(2));
      c.setAttribute("fill", "#fff4d6");
      c.setAttribute("opacity", (Math.random() * 0.6 + 0.3).toFixed(2));
      st.appendChild(c);
    }
    const rp = $("#ripples");
    for (let i = 0; i < 44; i++) {
      const p = document.createElementNS(SVGNS, "path");
      const y = 330 + Math.pow(Math.random(), 1.4) * 215,
        x = Math.random() * 920,
        w = 24 + Math.random() * 70 * (1 + (y - 330) / 200);
      p.setAttribute("d", `M${x} ${y}q${w / 4} -4 ${w / 2} 0t${w / 2} 0`);
      rp.appendChild(p);
    }
    const NS = (tag, attrs, parent) => {
      const e = document.createElementNS(SVGNS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      parent.appendChild(e);
      return e;
    };
    // ต้นไม้ริมน้ำ + ต้นมะพร้าว
    const tr = $("#trees");
    for (let x = -20; x < 1040; x += 30) {
      const mid = x > 380 && x < 730,
        cy = mid ? 306 - hash(x) * 8 : 296 - hash(x) * 34;
      NS(
        "ellipse",
        {
          cx: x,
          cy,
          rx: 26 + hash(x + 1) * 22,
          ry: mid ? 12 : 20 + hash(x + 2) * 26,
          fill: hash(x + 3) > 0.5 ? "#0a1510" : "#0e1e15",
        },
        tr,
      );
    }
    NS("ellipse", { cx: 150, cy: 252, rx: 120, ry: 62, fill: "#0b1812" }, tr);
    NS("ellipse", { cx: 880, cy: 238, rx: 140, ry: 74, fill: "#0b1812" }, tr);
    NS(
      "ellipse",
      { cx: 880, cy: 292, rx: 150, ry: 20, fill: "#ffb04a", opacity: 0.1 },
      tr,
    );
    NS(
      "ellipse",
      { cx: 150, cy: 298, rx: 130, ry: 18, fill: "#ffb04a", opacity: 0.1 },
      tr,
    );
    [
      [58, 300, 150],
      [372, 304, 110],
      [960, 302, 140],
    ].forEach(([x, y, h], j) => {
      NS(
        "path",
        {
          d: `M${x} ${y}Q${x + 6} ${y - h * 0.55} ${x + 3 + j * 3} ${y - h}`,
          stroke: "#07100c",
          "stroke-width": 4,
          fill: "none",
        },
        tr,
      );
      for (let f = 0; f < 7; f++) {
        const a = -Math.PI + (f * Math.PI) / 6 - 0.1,
          tx = x + 3 + j * 3,
          ty = y - h;
        NS(
          "path",
          {
            d: `M${tx} ${ty}Q${tx + Math.cos(a) * 24} ${ty + Math.sin(a) * 18 - 8} ${tx + Math.cos(a) * 44} ${ty + Math.sin(a) * 26 + 14}`,
            stroke: "#07100c",
            "stroke-width": 3,
            fill: "none",
            "stroke-linecap": "round",
          },
          tr,
        );
      }
    });
    for (let i = 0; i < 46; i++)
      NS(
        "circle",
        {
          cx: 10 + hash(i * 3) * 980,
          cy: 262 + hash(i * 7) * 40,
          r: 0.9 + hash(i) * 0.8,
          fill: "#ffd37a",
          opacity: 0.5 + hash(i + 2) * 0.4,
        },
        tr,
      );
    // ไฟริมฝั่ง เสาไฟ และโคมแดง
    const sl = $("#shoreLights");
    for (let x = 14; x < 1000; x += 24 + hash(x) * 14) {
      NS(
        "circle",
        {
          cx: x,
          cy: 302 + hash(x + 1) * 6,
          r: 8 + hash(x + 2) * 4,
          fill: "url(#stGl)",
          opacity: 0.75,
        },
        sl,
      );
      NS(
        "circle",
        { cx: x, cy: 303 + hash(x + 1) * 6, r: 1.5, fill: "#fff6d8" },
        sl,
      );
    }
    [60, 205, 335, 590, 760, 930].forEach((x) => {
      NS(
        "line",
        {
          x1: x,
          y1: 276,
          x2: x,
          y2: 309,
          stroke: "#2a2018",
          "stroke-width": 2,
        },
        sl,
      );
      NS(
        "circle",
        { cx: x, cy: 274, r: 24, fill: "url(#stGl)", opacity: 0.85 },
        sl,
      );
      NS("circle", { cx: x, cy: 274, r: 2.6, fill: "#fffbe8" }, sl);
      NS(
        "path",
        {
          d: `M${x - 14} 274H${x + 14}M${x} 260V288`,
          stroke: "#fff3c4",
          "stroke-width": 0.8,
          opacity: 0.55,
        },
        sl,
      );
    });
    [120, 270, 395, 555, 700, 835, 975].forEach((x) => {
      NS(
        "line",
        {
          x1: x,
          y1: 286,
          x2: x,
          y2: 292,
          stroke: "#c9a040",
          "stroke-width": 1,
        },
        sl,
      );
      NS(
        "circle",
        { cx: x, cy: 298, r: 16, fill: "#ff5a3a", opacity: 0.22 },
        sl,
      );
      NS("ellipse", { cx: x, cy: 298, rx: 5.5, ry: 7, fill: "#e2352b" }, sl);
      NS(
        "rect",
        { x: x - 3, y: 290.5, width: 6, height: 2, fill: "#e8b95a" },
        sl,
      );
    });
    // กลีบดอกไม้ลอยบนน้ำ
    const fl = $("#floaters");
    for (let i = 0; i < 22; i++) {
      const x = 30 + hash(i * 4) * 940,
        y = 345 + hash(i * 9) * 190,
        k = 0.6 + (y - 345) / 190;
      NS(
        "ellipse",
        {
          cx: x,
          cy: y,
          rx: 4.5 * k,
          ry: 2.2 * k,
          fill: hash(i) > 0.3 ? "#f58bad" : "#fff0f0",
          opacity: 0.75,
          transform: `rotate(${hash(i * 5) * 180} ${x} ${y})`,
        },
        fl,
      );
    }
    const pe = $("#petals");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < 14; i++) {
        const p = document.createElement("i");
        p.className = "petal";
        p.style.left = Math.random() * 100 + "%";
        p.style.animationDuration = 12 + Math.random() * 14 + "s";
        p.style.animationDelay = -Math.random() * 20 + "s";
        p.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
        pe.appendChild(p);
      }
    }
  })();

  /* ---------- พลุดอก (peony) ---------- */
  const fw = (() => {
    const c = $("#fw"),
      x = c.getContext("2d");
    const COLORS = [
      "#ff4d5e",
      "#ffd27a",
      "#ff8fb8",
      "#fff4d6",
      "#ff9a3c",
      "#9fd8ff",
      "#ffb3cf",
    ];
    let W = 0,
      H = 0,
      parts = [],
      rockets = [],
      running = false;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function resize() {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      c.width = W * d;
      c.height = H * d;
      x.setTransform(d, 0, 0, d, 0, 0);
    }
    addEventListener("resize", resize);
    resize();
    const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)];
    function burst(cx, cy) {
      const c1 = pick();
      let c2 = pick();
      while (c2 === c1) c2 = pick();
      const n = reduce ? 40 : W < 600 ? 90 : 140,
        scale = W < 600 ? 0.75 : 1;
      for (let i = 0; i < n; i++) {
        // กลีบดอกชั้นนอก
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.05;
        const sp = (4.2 + Math.random() * 0.5) * scale;
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.01 + Math.random() * 0.004,
          col: c1,
          r: 2,
        });
      }
      for (let i = 0; i < n * 0.55; i++) {
        // แกนกลางอีกสี
        const a = Math.random() * Math.PI * 2,
          sp = (1 + Math.random() * 2) * scale;
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.014 + Math.random() * 0.005,
          col: c2,
          r: 1.6,
        });
      }
    }
    function launch(tx, ty) {
      rockets.push({
        x: tx + (Math.random() - 0.5) * 80,
        y: H + 10,
        tx,
        ty,
        t: 0,
      });
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    }
    function show(count = 6) {
      for (let i = 0; i < count; i++)
        setTimeout(
          () =>
            launch(
              W * (0.12 + Math.random() * 0.76),
              H * (0.1 + Math.random() * 0.38),
            ),
          i * 380,
        );
    }
    function loop() {
      x.globalCompositeOperation = "destination-out";
      x.fillStyle = "rgba(0,0,0,.2)";
      x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = "lighter";
      rockets = rockets.filter((r) => {
        r.t += 0.022;
        const k = 1 - Math.pow(1 - Math.min(r.t, 1), 2);
        const px = r.x + (r.tx - r.x) * k,
          py = H + 10 + (r.ty - H - 10) * k;
        x.fillStyle = "#ffe4a8";
        x.beginPath();
        x.arc(px, py, 2, 0, 7);
        x.fill();
        if (r.t >= 1) {
          burst(r.tx, r.ty);
          return false;
        }
        return true;
      });
      parts = parts.filter((p) => {
        p.vx *= 0.972;
        p.vy = p.vy * 0.972 + 0.05;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) return false;
        x.globalAlpha = Math.max(p.life, 0);
        x.fillStyle = p.col;
        x.beginPath();
        x.arc(p.x, p.y, p.r * (0.5 + p.life * 0.6), 0, 7);
        x.fill();
        return true;
      });
      x.globalAlpha = 1;
      if (parts.length || rockets.length) requestAnimationFrame(loop);
      else {
        running = false;
        x.clearRect(0, 0, W, H);
      }
    }
    return { show };
  })();

  /* ---------- ข้อมูล: เซิร์ฟเวอร์ หรือโหมดในเครื่อง ---------- */
  let mode = "unknown"; // 'firebase' | 'local'
  const enc = encodeURIComponent;
  const lsKey = (r) => "olw_room_" + r;
  const DB_URL = (window.FIREBASE_DATABASE_URL || "").replace(/\/$/, "");
  const dbRoomUrl = (room) =>
    DB_URL + "/rooms/" + enc(room) + "/krathongs.json";

  async function getRoom(room) {
    if (DB_URL) {
      try {
        const r = await fetch(dbRoomUrl(room), { cache: "no-store" });
        if (!r.ok) throw new Error("Firebase read " + r.status);
        mode = "firebase";
        const data = await r.json();
        return data ? Object.values(data) : [];
      } catch (e) {
        console.warn("Firebase unavailable; using local browser mode.", e);
        mode = "local";
      }
    } else {
      mode = "local";
    }
    try {
      return JSON.parse(localStorage.getItem(lsKey(room)) || "[]");
    } catch (e) {
      return [];
    }
  }
  async function postKr(room, k) {
    if (DB_URL && mode === "firebase") {
      // PUT by participant id: prevents duplicate lanterns if the same button is retried.
      const url =
        DB_URL + "/rooms/" + enc(room) + "/krathongs/" + enc(k.id) + ".json";
      try {
        const ex = await fetch(url, { cache: "no-store" });
        if (ex.ok) {
          const old = await ex.json();
          if (old) return old;
        }
      } catch (e) {} // ปล่อยได้ใบเดียว ไม่เขียนทับ
      const r = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...k, at: Date.now() }),
      });
      if (!r.ok) throw new Error("Firebase write " + r.status);
      return await r.json();
    }
    const list = await getRoom(room);
    const old = list.find((i) => i.id === k.id);
    if (old) return old;
    const nk = { ...k, at: Date.now() };
    list.push(nk);
    localStorage.setItem(lsKey(room), JSON.stringify(list));
    return nk;
  }

  /* ---------- สถานะ ---------- */
  const uid = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : "u" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  let me = { id: "", name: "", room: "" };
  try {
    me = Object.assign(me, JSON.parse(localStorage.getItem("olw_me") || "{}"));
  } catch (e) {}
  if (!me.id) me.id = uid();
  const saveMe = () => localStorage.setItem("olw_me", JSON.stringify(me));
  const items = new Map(); // id -> {data, el, x, lane, tx, ph}
  let chosen = "",
    polling = null,
    firstSync = true,
    animOn = false;

  function show(id) {
    document.body.classList.toggle("river-mode", id === "river");
    if (id === "river") {
      requestAnimationFrame(fitScene);
      setTimeout(fitScene, 120);
    }
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.toggle("active", s.id === id));
    scrollTo({ top: 0, behavior: "smooth" });
  }
  const toastEl = $("#toast");
  let toastObj;
  function toast(msg) {
    $("#toastBody").textContent = msg;
    (toastObj =
      toastObj ||
      bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4200 })).show();
  }
  const fmt = (t) => new Date(t).toLocaleString("zh-CN", { hour12: false });
  const myItem = () => items.get(me.id);

  /* ---------- หน้าเข้าห้อง ---------- */
  const qRoom = new URLSearchParams(location.search).get("room");
  $("#nameInput").value = me.name || "";
  $("#roomInput").value = qRoom || me.room || "";
  $("#joinForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    me.name = $("#nameInput").value.trim().slice(0, 16);
    me.room = $("#roomInput")
      .value.trim()
      .replace(/[^\w\u4e00-\u9fa5\u0e00-\u0e7f-]/g, "")
      .slice(0, 24);
    if (!me.name || !me.room) {
      toast("请填写名字和暗号 · กรุณาใส่ชื่อและรหัสห้อง");
      return;
    }
    saveMe();
    await enterRoom();
  });
  async function enterRoom() {
    $("#roomLabel").textContent = me.room;
    clearInterval(polling);
    items.forEach((i) => i.el.remove());
    items.clear();
    firstSync = true;
    await sync();
    polling = setInterval(sync, POLL_MS);
    show(myItem() ? "river" : "make");
    refreshInvite();
  }
  $("#peekRiver").addEventListener("click", () => show("river"));
  $("#makeMine").addEventListener("click", () => show("make"));
  $("#backBtn").addEventListener("click", () =>
    show(myItem() ? "join" : "make"),
  );
  $("#backJoin").addEventListener("click", () => show("join"));

  /* ---------- เลือกกระทง & เขียนคำอธิษฐาน ---------- */
  const opts = $("#styleOptions");
  Object.entries(STYLES).forEach(([key, s]) => {
    const col = document.createElement("div");
    col.className = "col-4";
    col.innerHTML = `<button type="button" class="opt" data-style="${key}"><div class="opt-art">${krathongSVG(key)}</div><b>${s.zh}</b><small>${s.th}</small></button>`;
    opts.appendChild(col);
  });
  opts.addEventListener("click", (e) => {
    const b = e.target.closest(".opt");
    if (!b) return;
    chosen = b.dataset.style;
    opts
      .querySelectorAll(".opt")
      .forEach((o) => o.classList.toggle("selected", o === b));
    drawPreview();
    validate();
  });
  $("#previewStage").innerHTML =
    '<div class="text-center text-muted-lt py-5">请先挑选一盏灯 <small>เลือกกระทงก่อนนะ</small></div>';
  $("#tagInput").addEventListener("input", drawPreview);
  $("#wishInput").addEventListener("input", () => {
    $("#wishCount").textContent = $("#wishInput").value.length + " / 200";
    validate();
  });
  function drawPreview() {
    if (chosen)
      $("#previewStage").innerHTML = krathongSVG(
        chosen,
        false,
        $("#tagInput").value.trim() || "心愿",
      );
  }
  function validate() {
    $("#releaseBtn").disabled = !(chosen && $("#wishInput").value.trim());
  }

  $("#releaseBtn").addEventListener("click", async () => {
    const wish = $("#wishInput").value.trim();
    if (!wish || !chosen) return;
    $("#releaseBtn").disabled = true;
    const cd = $("#countdown");
    cd.classList.add("on");
    for (const n of [3, 2, 1]) {
      $("#countNum").textContent = NUM_ZH[n];
      await new Promise((r) => setTimeout(r, 900));
    }
    try {
      const k = await postKr(me.room, {
        id: me.id,
        name: me.name,
        style: chosen,
        wish,
        tag: $("#tagInput").value.trim().slice(0, 12),
      });
      cd.classList.remove("on");
      addKrathong(k);
      renderList();
      show("river");
      fw.show(7);
      toast("你的水灯已入河 · กระทงของเธอลอยลงน้ำแล้ว");
    } catch (err) {
      cd.classList.remove("on");
      validate();
      toast("放灯失败，请稍后再试 · ปล่อยไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
    refreshInvite();
  });

  /* ---------- แม่น้ำ ---------- */
  const layer = $("#riverLayer");
  function addKrathong(k) {
    if (items.has(k.id)) return;
    const mine = k.id === me.id;
    const el = document.createElement("button");
    el.type = "button";
    el.className = "kr" + (mine ? " mine" : "");
    const art = krathongSVG(k.style, true, k.tag || "心愿");
    el.innerHTML = `<span class="kr-refl" aria-hidden="true">${art}</span><span class="kr-art">${art}</span><span class="kr-name"></span>`;
    el.querySelector(".kr-name").textContent = (mine ? "我 · " : "") + k.name;
    el.setAttribute("aria-label", k.name + " 的水灯");
    el.addEventListener("click", () => openWish(k));
    layer.appendChild(el);
    items.set(k.id, {
      data: k,
      el,
      x: -14,
      lane: 0,
      tx: 50,
      ph: Math.random() * 6.28,
    });
    layoutRiver();
    startAnim();
  }
  const LANES = [
    { y: 0.2, s: 0.5 },
    { y: 0.38, s: 0.62 },
    { y: 0.62, s: 0.8 },
    { y: 0.86, s: 1 },
  ]; // y = สัดส่วนจากเส้นขอบฟ้าถึงขอบล่าง
  let horizonPx = 0,
    sceneH = 1;
  function fitScene() {
    const box = $("#riverScene"),
      svg = box.querySelector(".river-bg"),
      W = box.clientWidth,
      H = box.clientHeight;
    if (!W || !H) return;
    const sc = Math.max(W / 1000, H / 560),
      vw = Math.min(1000, W / sc);
    const vx = Math.max(0, Math.min(1000 - vw, 590 - vw / 2)); // จอแนวตั้ง: เลื่อนให้เห็นวัดและเจดีย์
    svg.setAttribute("viewBox", `${vx.toFixed(1)} 0 ${vw.toFixed(1)} 560`);
    horizonPx = H - (560 - 316) * sc;
    sceneH = H;
  }
  addEventListener("resize", fitScene);
  if (window.ResizeObserver)
    new ResizeObserver(fitScene).observe($("#riverScene")); // คำนวณใหม่ทันทีที่ฉากปรากฏ/เปลี่ยนขนาด
  const OTHER_LANES = [2, 1, 2, 0, 1, 2, 0, 1];
  function layoutRiver() {
    const arr = [...items.values()].sort((a, b) => a.data.at - b.data.at);
    const n = arr.length,
      span = Math.min(60, 26 * (n - 1));
    arr.forEach((it, i) => {
      it.lane =
        it.data.id === me.id
          ? 3
          : OTHER_LANES[
              (i + (it.data.id === me.id ? 0 : 0)) % OTHER_LANES.length
            ]; // ของเราอยู่แนวหน้าสุด
      it.tx = n === 1 ? 50 : 50 - span / 2 + (span * i) / (n - 1);
      it.el.style.setProperty("--s", LANES[it.lane].s);
      it.el.style.zIndex = 10 + it.lane;
    });
    $("#riverEmpty").classList.toggle("d-none", n > 0);
    $("#riverHint").classList.toggle("d-none", n === 0);
  }
  function startAnim() {
    if (!animOn) {
      animOn = true;
      requestAnimationFrame(tick);
    }
  }
  function tick(t) {
    items.forEach((it) => {
      it.x += (it.tx - it.x) * 0.012;
      const bob = Math.sin(t / 700 + it.ph) * 3.2,
        rot = Math.sin(t / 1100 + it.ph) * 2.2,
        sway = Math.sin(t / 2300 + it.ph) * 0.6;
      it.el.style.left = it.x + sway + "%";
      it.el.style.top =
        horizonPx + LANES[it.lane].y * (sceneH - horizonPx) + 6 + "px";
      it.el.style.transform = `translate(-50%,-92%) translateY(${bob}px) rotate(${rot}deg)`;
    });
    requestAnimationFrame(tick);
  }
  function renderList() {
    $("#makeMineWrap").classList.toggle("d-none", !!myItem() || !me.name);
  }
  let wishModal;
  function openWish(k) {
    $("#modalKr").innerHTML = krathongSVG(k.style, false, k.tag || "心愿");
    $("#modalOwner").textContent = (k.id === me.id ? "我" : k.name) + " 的心愿";
    $("#modalText").textContent = k.wish;
    $("#modalTime").textContent =
      "放灯时间 · ปล่อยเมื่อ " +
      fmt(k.at) +
      "  ·  " +
      styleOf(k).zh +
      " " +
      styleOf(k).th;
    (wishModal = wishModal || new bootstrap.Modal($("#wishModal"))).show();
  }

  /* ---------- ซิงก์ ---------- */
  async function sync() {
    if (!me.room) return;
    const list = await getRoom(me.room);
    const fresh = list.filter((k) => !items.has(k.id));
    const had = items.size;
    fresh
      .sort((a, b) => a.at - b.at)
      .forEach((k) => {
        addKrathong(k);
        if (!firstSync && k.id !== me.id) {
          toast(k.name + " 的水灯来了 · กระทงของ " + k.name + " ลอยมาแล้ว");
          fw.show(4);
        }
      });
    if (firstSync && list.length) setTimeout(() => fw.show(2), 600);
    firstSync = false;
    if (fresh.length || had === 0) renderList();
    const b = $("#statusBadge");
    b.className = "badge status " + (mode === "firebase" ? "ok" : "local");
    b.textContent =
      mode === "firebase" ? "在线 · ออนไลน์" : "本机模式 · ในเครื่อง";

    const ln = $("#localNote");

    if (mode === "firebase") {
      // เชื่อมต่อ Firebase สำเร็จ ซ่อนข้อความแจ้งเตือน
      ln.classList.add("d-none");
    } else {
      // ยังไม่ได้เชื่อมต่อ Firebase แสดงข้อความแจ้งเตือน
      ln.textContent =
        "Firebase ยังไม่ได้เชื่อมต่อหรือมีปัญหา: กระทงจะแสดงเฉพาะเครื่องนี้ ตรวจสอบ firebase-config.js และ Database Rules ก่อน · ยังไม่ออนไลน์";

      if (!ln.dataset.closed) {
        ln.classList.remove("d-none");
      }
    }
  }
  $("#localNote").addEventListener("click", (e) => {
    e.currentTarget.dataset.closed = "1";
    e.currentTarget.classList.add("d-none");
  }); // แตะเพื่อปิดคำเตือน
  addEventListener("storage", (e) => {
    if (e.key && e.key === lsKey(me.room)) sync();
  });

  let inviteLink = "";
  function refreshInvite() {
    inviteLink = location.origin + location.pathname + "?room=" + enc(me.room);
  }

  const copyLinkBtn = $("#copyLink");

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", async () => {
      const link = inviteLink || location.href;
      try {
        await navigator.clipboard.writeText(link);
        toast("邀请链接已复制 · คัดลอกลิงก์แล้ว");
      } catch (e) {
        prompt("复制这个链接 / คัดลอกลิงก์นี้", link);
      }
    });
  }

  $("#fwBtn").addEventListener("click", () => fw.show(6));

  /* ---------- เพลง: สังเคราะห์เพลงจีนเอง (กู่เจิง + เอ๋อหู) หรือใช้ music.mp3 ถ้ามี ---------- */
  const music = (() => {
    const btn = $("#musicBtn");
    let want = localStorage.getItem("olw_music") !== "off",
      playing = false,
      hasFile = false,
      audio = null;
    let ctx,
      master,
      reverb,
      timer,
      nextT = 0,
      beat = 0,
      idx = 4;
    const SCALE = [
      146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0,
      493.88, 587.33, 659.25,
    ]; // D E F# A B (เพนทาโทนิก)
    const sync = () => btn.classList.toggle("off", !playing);
    function impulse(sec) {
      const len = ctx.sampleRate * sec,
        buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      return buf;
    }
    function pluck(f, t, vol = 0.22, dur = 2.2) {
      // เสียงดีดสายแบบกู่เจิง
      const o = ctx.createOscillator(),
        o2 = ctx.createOscillator(),
        g = ctx.createGain(),
        lp = ctx.createBiquadFilter();
      o.type = "triangle";
      o.frequency.value = f;
      o2.type = "sine";
      o2.frequency.value = f * 2;
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(4200, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + dur * 0.6);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      const g2 = ctx.createGain();
      g2.gain.value = 0.35;
      o2.connect(g2);
      g2.connect(lp);
      o.connect(lp);
      lp.connect(g);
      g.connect(master);
      o.start(t);
      o2.start(t);
      o.stop(t + dur + 0.1);
      o2.stop(t + dur + 0.1);
    }
    function erhu(f, t, dur) {
      // เสียงสีแบบเอ๋อหู มีวิบราโต
      const o = ctx.createOscillator(),
        g = ctx.createGain(),
        bp = ctx.createBiquadFilter(),
        lfo = ctx.createOscillator(),
        lg = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 0.97, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.25);
      lfo.frequency.value = 5.4;
      lg.gain.value = f * 0.012;
      lfo.connect(lg);
      lg.connect(o.frequency);
      bp.type = "bandpass";
      bp.frequency.value = 1500;
      bp.Q.value = 0.9;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.5);
      g.gain.setValueAtTime(0.07, t + dur - 0.6);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(bp);
      bp.connect(g);
      g.connect(master);
      o.start(t);
      lfo.start(t);
      o.stop(t + dur + 0.1);
      lfo.stop(t + dur + 0.1);
    }
    function pad(t) {
      [73.42, 110.0].forEach((f) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 2);
        g.gain.linearRampToValueAtTime(0, t + 7.2);
        o.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + 7.4);
      });
    }
    const BEAT = 0.46;
    function schedule() {
      while (nextT < ctx.currentTime + 0.8) {
        const t = nextT;
        if (beat % 16 === 0) pad(t);
        if (beat % 4 === 0) pluck(SCALE[beat % 8 === 0 ? 0 : 3] / 2, t, 0.2, 3);
        if (beat % 16 === 8)
          erhu(SCALE[[5, 4, 7, 6][((beat / 16) | 0) % 4]], t, 3.4);
        if (beat % 8 === 7) {
          // รูดสายขึ้น/ลง
          const up = Math.random() < 0.6,
            n = 6;
          for (let k = 0; k < n; k++)
            pluck(
              SCALE[Math.max(0, Math.min(11, up ? 2 + k : 9 - k))],
              t + k * 0.075,
              0.12,
              1.6,
            );
        } else if (Math.random() < 0.82) {
          idx = Math.max(
            1,
            Math.min(
              10,
              idx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)],
            ),
          );
          pluck(SCALE[idx], t, 0.17 + Math.random() * 0.06, 2.2);
        }
        nextT += BEAT;
        beat++;
      }
    }

    async function start() {
      want = true;
      localStorage.setItem("olw_music", "on");

      // ตรวจสอบไฟล์ MP3 ก่อนเริ่มเล่น
      try {
        const response = await fetch("./music.mp3", {
          method: "HEAD",
          cache: "no-store",
        });

        hasFile =
          response.ok &&
          !(response.headers.get("content-type") || "").includes("text/html");
      } catch (error) {
        hasFile = false;
        console.error("ตรวจสอบไฟล์ MP3 ไม่สำเร็จ:", error);
      }

      // ถ้ามีไฟล์ MP3 ให้หยุดเพลงเดิมและเล่น MP3
      if (hasFile) {
        clearInterval(timer);

        if (ctx && ctx.state !== "suspended") {
          await ctx.suspend();
        }

        audio = audio || new Audio("./music.mp3");
        audio.loop = true;
        audio.volume = 0.8;

        try {
          await audio.play();
          playing = true;
          sync();
          console.log("กำลังเล่นเพลง MP3");
          return;
        } catch (error) {
          console.error("เล่น MP3 ไม่สำเร็จ:", error);
        }
      }

      // หากไม่มี MP3 ให้ใช้เพลงสังเคราะห์เดิม
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;

        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.75;
        reverb = ctx.createConvolver();
        reverb.buffer = impulse(3);

        const wet = ctx.createGain();
        wet.gain.value = 0.45;
        master.connect(ctx.destination);
        master.connect(reverb);
        reverb.connect(wet);
        wet.connect(ctx.destination);
      }

      await ctx.resume();
      nextT = ctx.currentTime + 0.1;
      clearInterval(timer);
      timer = setInterval(schedule, 200);
      schedule();

      playing = true;
      sync();
    }

    function stop(remember = true) {
      if (remember) {
        want = false;
        localStorage.setItem("olw_music", "off");
      }
      if (audio) audio.pause();
      clearInterval(timer);
      if (ctx) ctx.suspend();
      playing = false;
      sync();
    }
    btn.addEventListener("click", () => (playing ? stop() : start()));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && playing) {
        stop(false);
        music.resumeLater = true;
      } else if (!document.hidden && music.resumeLater) {
        music.resumeLater = false;
        start();
      }
    });
    const first = (e) => {
      if (e && e.target && e.target.closest && e.target.closest("#musicBtn")) {
        removeEventListener("pointerdown", first);
        removeEventListener("keydown", first);
        return;
      }
      removeEventListener("pointerdown", first);
      removeEventListener("keydown", first);
      if (want && !playing) start();
    };
    addEventListener("pointerdown", first);
    addEventListener("keydown", first);
    fetch("music.mp3", { method: "HEAD" })
      .then((r) => {
        hasFile =
          r.ok && !(r.headers.get("content-type") || "").includes("html");
      })
      .catch(() => {});
    return { start, stop, resumeLater: false };
  })();
})();
