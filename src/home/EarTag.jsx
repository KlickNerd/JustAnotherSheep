import { useEffect, useState } from 'react';
import { useCredits } from '../credits';

/* Die eigene Ohrmarke zum Mitnehmen: ein Bild (1080 × 1350) mit der
   Bewohnernummer, je nach Entscheidung am Zaun angepasst. Wird im
   Browser gezeichnet, nichts verlässt das Gerät, bis man es teilt. */

const W = 1080;
const H = 1350;
const FONTS = ['500 110px "DM Mono"', '400 28px "DM Mono"', '700 84px Caveat', '700 46px "Libre Baskerville"', '700 44px Oswald'];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function spaced(ctx, value) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function tagShape(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.7);
  ctx.bezierCurveTo(x, y - r * 0.15, x + w, y - r * 0.15, x + w, y + r * 0.7);
  ctx.lineTo(x + w, y + h - 34);
  ctx.quadraticCurveTo(x + w, y + h, x + w - 34, y + h);
  ctx.lineTo(x + 34, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - 34);
  ctx.closePath();
}

async function drawCard({ resident, climbed, golden, earned }) {
  await Promise.all(FONTS.map((font) => document.fonts.load(font).catch(() => null)));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const bg = climbed ? '#15120d' : '#f6f1e5';
  const ink = climbed ? '#f0e9dc' : '#1f1b14';
  const number = `#${resident.toLocaleString('en-US')}`;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Bild oben, nach unten in den Hintergrund auslaufend
  try {
    const image = await loadImage('/images/brand/sheet-deadpan.webp');
    const area = { w: W, h: 760 };
    const scale = Math.max(area.w / image.width, area.h / image.height);
    const sw = area.w / scale;
    const sh = area.h / scale;
    ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) * 0.12, sw, sh, 0, 0, area.w, area.h);
    const fade = ctx.createLinearGradient(0, 520, 0, 760);
    fade.addColorStop(0, climbed ? 'rgba(21,18,13,0)' : 'rgba(246,241,229,0)');
    fade.addColorStop(1, bg);
    ctx.fillStyle = fade;
    ctx.fillRect(0, 500, W, 262);
  } catch { /* ohne Bild bleibt die Karte schlicht */ }

  // Die Ohrmarke
  ctx.save();
  ctx.translate(540, 830);
  ctx.rotate(-0.07);
  const tw = 500;
  const th = 380;
  ctx.shadowColor = 'rgba(40,25,0,.45)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 26;
  tagShape(ctx, -tw / 2, -th / 2, tw, th);
  const plastic = ctx.createLinearGradient(-tw / 2, -th / 2, tw / 2, th / 2);
  if (golden) {
    plastic.addColorStop(0, '#fff1b8'); plastic.addColorStop(0.45, '#e6b422'); plastic.addColorStop(1, '#8a6408');
  } else {
    plastic.addColorStop(0, '#f8d65a'); plastic.addColorStop(0.55, '#f2c230'); plastic.addColorStop(1, '#d9a91b');
  }
  ctx.fillStyle = plastic;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(0, -th / 2 + 52, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2310';
  ctx.textAlign = 'center';
  ctx.font = '400 28px "DM Mono"';
  spaced(ctx, '8px');
  ctx.fillText('PEACEHOLD', 0, -th / 2 + 140);
  spaced(ctx, '0px');
  ctx.font = '500 104px "DM Mono"';
  ctx.fillText(number, 0, 60);
  if (climbed) {
    ctx.strokeStyle = '#a3392a';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-200, 40);
    ctx.quadraticCurveTo(0, 10, 205, 0);
    ctx.stroke();
    ctx.rotate(-0.08);
    ctx.fillStyle = '#a3392a';
    ctx.font = '700 84px Caveat';
    ctx.fillText('You have a name.', 10, 160);
  } else {
    ctx.rotate(-0.24);
    ctx.strokeStyle = 'rgba(163,57,42,.85)';
    ctx.lineWidth = 7;
    ctx.strokeRect(-20, 92, 290, 74);
    ctx.fillStyle = 'rgba(163,57,42,.85)';
    ctx.font = '700 44px Oswald';
    spaced(ctx, '6px');
    ctx.fillText('COMPLIANT', 125, 146);
    spaced(ctx, '0px');
  }
  ctx.restore();

  // Text
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = '700 46px "Libre Baskerville"';
  ctx.fillText(climbed ? `Resident ${number} stopped following.` : `Resident ${number} of Peacehold.`, W / 2, 1120, W - 120);
  ctx.font = climbed ? '700 64px Caveat' : '400 34px "Libre Baskerville"';
  ctx.fillStyle = climbed ? '#b69b77' : 'rgba(31,27,20,.65)';
  ctx.fillText(climbed ? 'I’m not lost.' : 'Everything is fine.', W / 2, 1180);

  ctx.font = '400 24px "DM Mono"';
  spaced(ctx, '4px');
  ctx.fillStyle = climbed ? 'rgba(240,233,220,.5)' : 'rgba(31,27,20,.5)';
  ctx.fillText(`COMPLIANCE CREDITS EARNED: ${earned.toLocaleString('en-US')}`, W / 2, 1232);

  ctx.textAlign = 'left';
  ctx.fillStyle = ink;
  ctx.font = '700 40px Oswald';
  spaced(ctx, '2px');
  ctx.fillText('JUST ANOTHER SHEEP', 60, 1300);
  ctx.textAlign = 'right';
  ctx.font = '400 22px "DM Mono"';
  spaced(ctx, '2px');
  ctx.fillStyle = climbed ? 'rgba(240,233,220,.6)' : 'rgba(31,27,20,.55)';
  ctx.fillText(window.location.host.toUpperCase(), W - 60, 1298);
  return canvas;
}

export default function EarTagCard({ resident, consent, active }) {
  const credits = useCredits();
  const climbed = consent === 'climb';
  const golden = Boolean(credits.owned.golden);
  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!active || !resident) return undefined;
    let cancelled = false;
    drawCard({ resident, climbed, golden, earned: credits.earned }).then((canvas) => {
      if (cancelled) return;
      canvas.toBlob((blob) => {
        if (cancelled || !blob) return;
        setCard((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return { url: URL.createObjectURL(blob), blob };
        });
      }, 'image/png');
    });
    return () => { cancelled = true; };
  }, [active, resident, climbed, golden, credits.earned]);

  const fileName = `peacehold-resident-${resident}.png`;
  const text = climbed ? `I’m Resident #${resident.toLocaleString('en-US')}. I stopped following.` : `I’m Resident #${resident.toLocaleString('en-US')} of Peacehold. Everything is fine.`;
  const file = card && typeof File === 'function' ? new File([card.blob], fileName, { type: 'image/png' }) : null;
  const canShare = file && navigator.canShare?.({ files: [file] });
  const share = () => navigator.share({ files: [file], text: `${text} #JustAnotherSheep` }).catch(() => {});
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(`${text} #JustAnotherSheep`)}&url=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="ear-card">
      <p className="home-kicker choice-kicker">Take your ear tag</p>
      <div className="ear-card-preview">
        {card ? <img src={card.url} alt={`Your Peacehold ear tag: resident ${resident}`} /> : <span>Printing your ear tag…</span>}
      </div>
      <div className="ear-card-actions">
        {canShare && <button type="button" onClick={share}>Share</button>}
        {card && <a href={card.url} download={fileName}>Download</a>}
        <a href={xUrl} target="_blank" rel="noopener noreferrer">Post on X ↗</a>
      </div>
    </div>
  );
}
