import { useEffect, useRef, useState } from 'react';
import { SiteLink } from '../router';
import './truth.css';

/* Der erste Bildschirm: zwei Wirklichkeiten übereinander.
   Oben die offizielle Peacehold-Broschüre, darunter, wie es wirklich ist.
   Sheeps Taschenlampe (Maus oder Finger) schneidet ein Loch in die
   Broschüre. Solange niemand führt, wandert das Licht von selbst über
   die Stellen, an denen die Broschüre lügt. Die Seite läuft auf
   Peacehold-Zeit (Ortszeit des Besuchers): Zählung, fünf Minuten
   Freizeit, nachts Lichter aus. Zum Testen: ?time=21:02 */

// Positionen in Prozent des Bildes: [x, y] im Querformat, [mx, my] im Hochformat (null = dort ausgeblendet)
const MARKS = [
  { id: 'beacon', at: [49.9, 14.3], m: [27.5, 14.3], text: 'It never blinks.', side: 'right' },
  { id: 'bell', at: [49.9, 29.5], m: [27.5, 29.5], text: 'Decides when you wake up.', side: 'left' },
  { id: 'sheep', at: [60.4, 37.5], m: [51.1, 38.3], text: 'The only one looking back.', side: 'right' },
  { id: 'lamp', at: [83.1, 53.7], m: null, text: 'Not a lamp.', side: 'left' },
  { id: 'pen', at: [92.7, 59], m: [84, 60], text: 'Your pen. 2 m².', side: 'left' },
  { id: 'fence', at: [52, 88], m: null, text: 'This fence faces inward.', side: 'right' },
];
const TAGS = [
  { at: [33.6, 80.5], m: null, n: '48,211' },
  { at: [38.9, 73.5], m: null, n: '48,212' },
  { at: [50.6, 70.5], m: [67, 71], n: '48,214' },
  { at: [67.4, 84.5], m: null, n: '48,215' },
  { at: [92.4, 73], m: null, n: '48,216' },
];
// Die Wanderroute des Lichts, solange niemand führt (Prozent des Bildschirms)
const ROUTE = { wide: [[60, 38], [50, 18], [84, 55], [52, 86], [30, 60]], tall: [[52, 38], [28, 30], [28, 17], [70, 48], [40, 74], [52, 38]] };

const SCHEDULE = [
  [0, 'Lights out'], [360, 'Morning count'], [375, 'Wool inspection'], [420, 'Morning assembly (voluntary)'],
  [480, 'Work, designated area'], [720, 'Approved lunch'], [780, 'Work, designated area'], [1080, 'Evening count'],
  [1095, 'Dinner'], [1140, 'Gratitude reflection'], [1260, 'Free time'], [1265, 'Lights out'],
];

function readOverride() {
  try {
    const value = new URLSearchParams(window.location.search).get('time');
    const match = value && value.match(/^(\d{1,2}):(\d{2})$/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  } catch { return null; }
}

// Minuten seit Mitternacht, Sekunden mitgezählt; mit ?time= läuft die Uhr ab dort weiter
function usePeaceholdClock() {
  const [start] = useState(() => ({ override: readOverride(), at: Date.now() }));
  const read = () => {
    if (start.override === null) { const d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
    return (start.override + (Date.now() - start.at) / 60000) % 1440;
  };
  const [now, setNow] = useState(read);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(read()), 1000);
    return () => window.clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return now;
}

function phaseOf(minute) {
  if (minute >= 1265 || minute < 360) return 'night';
  if (minute >= 1260) return 'free';
  if ((minute >= 360 && minute < 375) || (minute >= 1080 && minute < 1095)) return 'count';
  return 'day';
}

const pad = (n) => String(Math.floor(n)).padStart(2, '0');
const clock = (minute) => `${pad(minute / 60)}:${pad(minute % 60)}`;

function activity(minute) {
  let current = SCHEDULE[0];
  let next = SCHEDULE[1];
  SCHEDULE.forEach((entry, index) => { if (minute >= entry[0]) { current = entry; next = SCHEDULE[index + 1] || SCHEDULE[1]; } });
  return { now: current[1], next: next[1], nextAt: clock(next[0]) };
}

function pos(point) {
  return point ? { '--x': `${point[0]}%`, '--y': `${point[1]}%` } : {};
}
function posBoth(mark) {
  return { ...pos(mark.at), ...(mark.m ? { '--mx': `${mark.m[0]}%`, '--my': `${mark.m[1]}%` } : {}) };
}

function Stage({ truth, night }) {
  return (
    <div className={`ph-stage${night && truth ? ' is-night' : ''}`}>
      {night && truth ? (
        <img className="ph-stage-img is-night-truth" src="/images/home/fence-night.webp" alt="" />
      ) : (
        <picture>
          <source media="(max-aspect-ratio: 1/1)" srcSet="/images/brand/hero-peacehold-mobile.webp" />
          <img className="ph-stage-img" src="/images/brand/hero-peacehold.webp" alt="" />
        </picture>
      )}
      {truth && !night && (
        <>
          {TAGS.map((tag) => (
            <span key={tag.n} className={`ph-tag${tag.m ? '' : ' is-wide-only'}`} style={posBoth(tag)}><b>#{tag.n}</b></span>
          ))}
          {MARKS.map((mark) => (
            <span key={mark.id} className={`ph-mark ph-mark-${mark.side}${mark.m ? '' : ' is-wide-only'}`} style={posBoth(mark)}>
              <svg viewBox="0 0 100 60" aria-hidden="true"><path d="M14,34 C14,12 46,6 74,10 C94,14 94,46 70,52 C44,58 10,54 8,36 C7,24 20,16 34,14" /></svg>
              <em>{mark.text}</em>
            </span>
          ))}
        </>
      )}
    </div>
  );
}

function Copy({ truth, phase, minute }) {
  const free = Math.max(0, 1265 - minute) * 60;
  if (phase === 'night') {
    return truth ? (
      <div className="ph-copy">
        <p className="ph-kicker">Just Another Sheep · 03:00, behind the barn</p>
        <h1 className="ph-scrawl">He’s awake.</h1>
        <p className="ph-deck">Every night Sheep walks to the fence and asks the same question. Nobody has answered yet.</p>
      </div>
    ) : (
      <div className="ph-copy">
        <p className="ph-kicker">Peacehold · Official Resident Portal</p>
        <h1>Lights out.</h1>
        <p className="ph-deck">Rest is mandatory. Peacehold will wake you at 06:00.</p>
        <div className="ph-actions">
          <a className="ph-button" href="#series">Sleep well, resident</a>
        </div>
      </div>
    );
  }
  return truth ? (
    <div className="ph-copy">
      <p className="ph-kicker">Just Another Sheep · what they don’t print</p>
      <h1 className="ph-scrawl">Then why the fences?</h1>
      <p className="ph-deck">Counted twice a day. Five minutes of free time. Nobody has ever seen a wolf.</p>
      <div className="ph-actions"><span className="ph-scrawl ph-keep">Keep looking.</span></div>
    </div>
  ) : (
    <div className="ph-copy">
      <p className="ph-kicker">Peacehold · Official Resident Portal</p>
      <h1>Everything is fine.</h1>
      <p className="ph-deck">
        {phase === 'free'
          ? <>Free time has begun. Enjoy it: <strong>{pad(free / 60)}:{pad(free % 60)}</strong> remaining.</>
          : 'A safe place. A simple life. Everything taken care of.'}
      </p>
      <div className="ph-actions">
        <SiteLink href="/orientation" className="ph-button">Become a resident</SiteLink>
        <a className="ph-link" href="#series">Learn more ↓</a>
      </div>
    </div>
  );
}

function StatusBar({ truth, phase, minute, counted }) {
  const { now, next, nextAt } = activity(minute);
  const time = clock(minute);
  if (truth) {
    return (
      <div className="ph-status">
        <span><b>{time}</b> Same as yesterday.</span>
        <span>Same as tomorrow.</span>
        <span>Wolves ever seen: <b>0</b></span>
      </div>
    );
  }
  return (
    <div className="ph-status">
      <span><i className="ph-dot" aria-hidden="true" />Peacehold time <b>{time}</b></span>
      <span>{phase === 'count' ? <>Count in progress · <b>{counted.toLocaleString('en-US')}</b> counted</> : <>Now: <b>{now}</b></>}</span>
      <span>Next: {next} at {nextAt}</span>
      <span>Wolves sighted today: <b>0</b></span>
    </div>
  );
}

export default function TruthHero() {
  const ref = useRef(null);
  const lamp = useRef({ x: 58, y: 40, tx: 58, ty: 40, leg: 0, guided: 0 });
  const [touched, setTouched] = useState(false);
  const [hint, setHint] = useState(false);
  const minute = usePeaceholdClock();
  const phase = phaseOf(minute);
  const night = phase === 'night';
  const [counted, setCounted] = useState(48190);

  useEffect(() => {
    if (phase !== 'count') return undefined;
    const timer = window.setInterval(() => setCounted((value) => value + 1 + Math.floor(Math.random() * 3)), 700);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHint(true), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  // Das Licht: folgt der Hand, sonst wandert es die Route ab
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame;
    const tick = () => {
      const state = lamp.current;
      const box = el.getBoundingClientRect();
      if (!still && Date.now() - state.guided > 3500) {
        const route = box.width >= box.height ? ROUTE.wide : ROUTE.tall;
        const [tx, ty] = route[state.leg % route.length];
        state.tx = tx; state.ty = ty;
        if (Math.hypot(state.x - tx, state.y - ty) < 1.2) state.leg += 1;
        state.x += (state.tx - state.x) * 0.018;
        state.y += (state.ty - state.y) * 0.018;
      } else {
        state.x += (state.tx - state.x) * 0.25;
        state.y += (state.ty - state.y) * 0.25;
      }
      el.style.setProperty('--lx', `${state.x}%`);
      el.style.setProperty('--ly', `${state.y}%`);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const guide = (event) => {
    const box = ref.current.getBoundingClientRect();
    const state = lamp.current;
    state.tx = ((event.clientX - box.left) / box.width) * 100;
    state.ty = ((event.clientY - box.top) / box.height) * 100;
    state.guided = Date.now();
    if (!touched) setTouched(true);
  };

  return (
    <section ref={ref} className={`ph ph-${phase}`} onPointerMove={guide} onPointerDown={guide}>
      <div className="ph-layer ph-official">
        <Stage night={night} />
        <Copy phase={phase} minute={minute} />
        <StatusBar phase={phase} minute={minute} counted={counted} />
      </div>
      <div className="ph-layer ph-truth" aria-hidden="true">
        <Stage truth night={night} />
        <Copy truth phase={phase} minute={minute} />
        <StatusBar truth phase={phase} minute={minute} />
      </div>
      <div className="ph-lamp" aria-hidden="true" />
      {phase === 'count' && <p className="ph-banner" role="status">Count in progress. Please remain still.</p>}
      {phase === 'free' && <p className="ph-banner is-free" role="status">Free time. Make it count.</p>}
      <p className={`ph-hint${hint && !touched ? ' is-shown' : ''}`} aria-hidden="true">
        <span className="ph-hint-wide">Move your light. Look closer.</span>
        <span className="ph-hint-tall">Drag your finger. Look closer.</span>
      </p>
      <p className="visually-hidden">Behind the official brochure: the bell tower watches, the fences face inward, every sheep wears a number, and nobody has ever seen a wolf.</p>
    </section>
  );
}
