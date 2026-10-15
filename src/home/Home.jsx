import { useCallback, useEffect, useRef, useState } from 'react';
import { SiteLink } from '../router';
import { accrueInterest, award, buy, chargeExit, CreditCard, CreditsPill, formatCredits, ITEMS, priceOf, residentNumber, useCredits } from '../credits';
import EarTagCard from './EarTag';
import './home.css';

/* Die Startseite ist ein Onboarding in Peacehold: 15 bildschirmfüllende
   Szenen, durch die man von Container zu Container springt. Das System
   gliedert den Besucher ein (Nummer, Gatter, Tagesplan, Belohnungen, Feed, Schulung,
   Prüfung, Abstimmung, Assistent, Vertrag), Sheep sabotiert es nach und
   nach, bis das Onboarding zusammenbricht. Nichts davon erhebt echte
   Daten — Zählung, Captcha und Abstimmung sind gespielt. */

const SCENES = ['welcome', 'number', 'rewards', 'home', 'day', 'feed', 'training', 'verify', 'vote', 'assistant', 'agreement', 'error', 'night', 'story', 'choice'];
const ORIENTATION_STEPS = 10;
const at = (id) => SCENES.indexOf(id);

const ANNOUNCEMENTS = {
  climb: 'Attention, please. A resident has left the designated path. Please remain calm. Everything is fine.',
  accept: 'Thank you for your cooperation. You have been counted. Have a perfect day.',
  wolf: 'BREAKING: A wolf has been sighted near the eastern fence. Please stay inside.',
  correction: 'CORRECTION: No wolf was found. Please remain alert.',
  verify: 'Unusual activity detected. Please verify that you are not a wolf.',
  vote: 'Reminder: Morning assembly is completely voluntary. Attendance will be recorded.',
  questions: 'Attention: A resident is asking questions. This is not a cause for concern.',
  glitch: 'Every— every— everything is fine. Please remain— please remain— please remain calm.',
};

const MUSIC_VOLUME = 0.2;
const MUSIC_DUCKED = 0.04;
const DEGRADE_RATES = [1, 0.985, 0.955, 0.92];

const ACCOUNTS = [
  { id: 'news', name: 'Peacehold News', image: '/images/home/story-meadow.webp' },
  { id: 'wooly', name: 'Wooly', image: '/images/home/story-selfie.webp' },
  { id: 'shepherd', name: 'The Shepherd', image: '/images/home/story-tower.webp' },
  { id: 'trending', name: 'Trending', image: '/images/home/story-crowd.webp' },
  { id: 'friends', name: 'Your friends', image: '/images/home/story-friends.webp' },
];
const STORIES = [
  { account: 'news', image: '/images/home/story-meadow.webp', text: 'Everything is fine.', font: 'serif', place: 'top', meta: '12,847 views' },
  { account: 'wooly', image: '/images/home/story-selfie.webp', text: 'Everything is fine! 🌾', font: 'hand', place: 'top', meta: 'Lovely day for it' },
  { account: 'sponsored', image: '/images/home/story-fence-ad.webp', text: 'Feel safe. Stay inside.', font: 'serif', place: 'top', meta: 'Sponsored · Peacehold Fences', ad: true },
  { account: 'shepherd', image: '/images/home/story-tower.webp', text: 'Everything is fine. Thank you for not asking.', font: 'sans', place: 'bottom', meta: 'Pinned' },
  { account: 'trending', image: '/images/home/story-crowd.webp', text: '#EverythingIsFine', font: 'sans', place: 'top', meta: 'Trending for 35 years' },
  { account: 'friends', image: '/images/home/story-friends.webp', text: 'Everyone you know thinks everything is fine.', font: 'hand', place: 'top', meta: 'Liked by everyone you know' },
];
const STORY_TIME = 4000;

const PREFERENCES = [
  ['Fences', 'Required for your safety'],
  ['Bells', 'Required for your schedule'],
  ['Loudspeakers', 'Required for your information'],
  ['Wolves', 'Required for your motivation'],
];

// Der Tagesplan: Minuten ab 06:00, jede Woche sieben Mal derselbe Tag
const DAY_START = 6 * 60;
const DAY_LENGTH = 15.5 * 60;
const SCHEDULE = [
  { from: '06:00', to: '06:15', label: 'Wake-up bell', color: 'yellow' },
  { from: '06:15', to: '07:00', label: 'Wool inspection', color: 'blue' },
  { from: '07:00', to: '08:00', label: 'Morning assembly (voluntary)', color: 'red' },
  { from: '08:00', to: '12:00', label: 'Grazing, designated area', color: 'green' },
  { from: '12:00', to: '13:00', label: 'Approved lunch', color: 'orange' },
  { from: '13:00', to: '18:00', label: 'Grazing, designated area', color: 'green' },
  { from: '18:00', to: '19:00', label: 'Evening count', color: 'purple' },
  { from: '19:00', to: '21:00', label: 'Gratitude reflection', color: 'teal' },
  { from: '21:00', to: '21:05', label: 'Free time', color: 'gold', free: true },
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_LOOP = 20000;
const minutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m - DAY_START; };
const dayPercent = (time) => (minutes(time) / DAY_LENGTH) * 100;

const QUIZ = ['Dangerous', 'Very dangerous', 'Like anyone who asks questions'];

const CLAUSES = [
  ['§1', 'The resident agrees to be safe.'],
  ['§2', 'Safety is defined by Peacehold.'],
  ['§3', 'The gate is open at all times.', '§3a', 'The gate is closed at all times.', 'Which one?'],
  ['§4', 'Questions may be submitted to the Question Office.', '§4a', 'The Question Office does not exist.'],
  ['§5', 'The resident’s wool remains the property of the resident.', '§5a', 'The resident remains the property of Peacehold.', '!!'],
  ['§6', 'Wolves are real.', '§6a', 'Evidence of wolves is classified for your safety.'],
  ['§7', 'This agreement may change at any time without notice. It has already changed.'],
  ['§8', 'By reading this, you have agreed to it.'],
];

const ASSISTANT_SUGGESTIONS = ['Can I leave Peacehold?', 'Who rings the bell?', 'Are there really wolves?', 'Why?'];
const ASSISTANT_FALLBACKS = [
  'I’m sorry, that topic is outside the approved knowledge base. Here’s something you might enjoy instead: Everything is fine.',
  'That’s a great question! I’ve forwarded it to the appropriate office. The office is closed.',
  'I understand your concern. Your concern has been noted, filed and resolved. You’re welcome!',
];

function assistantReply(question, fallbackIndex) {
  const q = question.toLowerCase();
  if (q.includes('why')) return '“Why” is not a supported question type. Please rephrase your question as a “yes”.';
  if (/leave|gate|outside|exit|escape/.test(q)) return 'Great question! The gate is always open. Studies show that 100% of residents choose to stay. Is there anything else I can help you accept today?';
  if (q.includes('wolf') || q.includes('wolves')) return 'Wolves are a serious threat. For your safety, I can’t share information about wolves. Or about whether they exist.';
  if (/bell|who|decide/.test(q)) return 'The bell rings because it is time. It is time because the bell rings. I hope this helps!';
  return ASSISTANT_FALLBACKS[fallbackIndex % ASSISTANT_FALLBACKS.length];
}

function readStorage(store, key) {
  try { return window[store].getItem(key); } catch { return null; }
}
function writeStorage(store, key, value) {
  try { window[store].setItem(key, value); } catch { /* privater Modus o. Ä. */ }
}

/* Die Entscheidung am Zaun gilt nur bis zum nächsten Neuladen: Handy-Browser
   behalten den Sitzungsspeicher sogar nach dem Schließen, und erst der Klick
   auf den Banner schaltet den Ton frei. Beim Wechsel zwischen Unterseiten
   bleibt sie erhalten. */
let pageConsent = null;


function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------------------------------------------------------
   Tonanlage über die Web Audio API. Normale <audio>-Elemente
   scheitern auf dem Handy: iOS blockiert jede Wiedergabe, die nicht
   direkt aus einem Tippen kommt (also alle Durchsagen beim Scrollen),
   ignoriert die Lautstärke (kein Ducking) und lässt mehrere Elemente
   einander stören. Ein AudioContext wird einmal im ersten Klick
   freigegeben und spielt danach alles selbst: Durchsagen, die leise
   Peacehold-Schleife mit Ducking, Leiern und Bandstopp. Nur Sheeps
   Song bleibt ein Audio-Element mit eigenem Abspielknopf.
   --------------------------------------------------------------- */
const MUSIC_URL = '/audio/music/peacehold-loop.mp3';
const SONG_URL = '/audio/episode-001-its-voluntary.mp3';
const announcementUrl = (id) => `/audio/announcements/${id}.mp3`;

// Ein Zehntelsekunde Stille: damit wird Sheeps Song-Element im Tippen
// freigeschaltet, ohne dass der Song selbst je zu früh anläuft
let silentClip = null;
function silentWav() {
  if (silentClip) return silentClip;
  const samples = 800;
  const view = new DataView(new ArrayBuffer(44 + samples));
  const text = (offset, value) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + samples, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  text(36, 'data'); view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i += 1) view.setUint8(44 + i, 128);
  silentClip = URL.createObjectURL(new Blob([view.buffer], { type: 'audio/wav' }));
  return silentClip;
}

const isSong = (audio) => audio.src.endsWith(SONG_URL);
function loadSong(audio) {
  if (!isSong(audio)) audio.src = SONG_URL;
  return audio;
}

function decode(ctx, data) {
  return new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject));
}

function useSoundSystem(wantMusicFromStart) {
  const [muted, setMutedState] = useState(() => readStorage('localStorage', 'jas-muted') === '1');
  const [toasts, setToasts] = useState([]);
  const mutedRef = useRef(muted);
  const engine = useRef(null);
  const musicSource = useRef(null);
  const voiceSource = useRef(null);
  const song = useRef(null);
  const songPrimed = useRef(false);
  const musicWanted = useRef(wantMusicFromStart);
  const musicStopped = useRef(false);
  const speaking = useRef(false);
  const degradeLevel = useRef(0);
  const wobble = useRef(null);
  const played = useRef(new Set());

  const load = useCallback((url) => {
    const e = engine.current;
    if (!e.buffers.has(url)) {
      e.buffers.set(url, fetch(url).then((response) => response.arrayBuffer()).then((data) => decode(e.ctx, data)));
    }
    return e.buffers.get(url);
  }, []);

  const getSong = useCallback(() => {
    if (!song.current) {
      song.current = new Audio();
      song.current.preload = 'none';
    }
    return song.current;
  }, []);

  const duck = useCallback((on) => {
    const e = engine.current;
    if (!e || !musicSource.current || musicStopped.current) return;
    e.musicGain.gain.cancelScheduledValues(e.ctx.currentTime);
    e.musicGain.gain.setTargetAtTime(on ? MUSIC_DUCKED : MUSIC_VOLUME, e.ctx.currentTime, on ? 0.12 : 0.4);
  }, []);

  const startMusic = useCallback(async () => {
    musicWanted.current = true;
    const e = engine.current;
    if (!e || musicStopped.current || musicSource.current) return;
    const buffer = await load(MUSIC_URL).catch(() => null);
    if (!buffer || musicSource.current || musicStopped.current) return;
    const source = e.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = DEGRADE_RATES[degradeLevel.current];
    source.connect(e.musicGain);
    source.start();
    musicSource.current = source;
    const now = e.ctx.currentTime;
    e.musicGain.gain.cancelScheduledValues(now);
    e.musicGain.gain.setValueAtTime(0, now);
    e.musicGain.gain.linearRampToValueAtTime(speaking.current ? MUSIC_DUCKED : MUSIC_VOLUME, now + 2.5);
  }, [load]);

  // Muss direkt in einem Klick/Tippen laufen: erst dann darf das Handy Ton abspielen
  const unlock = useCallback(() => {
    if (!engine.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* nur Safari kennt das */ }
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      master.gain.value = mutedRef.current ? 0 : 1;
      master.connect(ctx.destination);
      const musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(master);
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.9;
      voiceGain.connect(master);
      engine.current = { ctx, master, musicGain, voiceGain, buffers: new Map() };
      const blip = ctx.createBufferSource();
      blip.buffer = ctx.createBuffer(1, 1, 22050);
      blip.connect(ctx.destination);
      blip.start(0);
      load(MUSIC_URL).catch(() => {});
      Object.keys(ANNOUNCEMENTS).forEach((id) => load(announcementUrl(id)).catch(() => {}));
    }
    const { ctx } = engine.current;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    if (musicWanted.current) startMusic();
  }, [load, startMusic]);

  // Sheeps Song einmal in einem Tippen anstoßen, damit er später von selbst starten darf
  const primeSong = useCallback(() => {
    if (songPrimed.current) return;
    songPrimed.current = true;
    const audio = getSong();
    if (isSong(audio)) return;
    audio.src = silentWav();
    audio.play().catch(() => { songPrimed.current = false; });
  }, [getSong]);

  const announce = useCallback((id, onDone) => {
    if (played.current.has(id)) return;
    played.current.add(id);
    const key = `${id}-${Date.now()}`;
    setToasts((current) => [...current.slice(-1), { key, id, text: ANNOUNCEMENTS[id] }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.key !== key)), 8000);

    const e = engine.current;
    if (!e || mutedRef.current) { if (onDone) window.setTimeout(onDone, 2500); return; }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      speaking.current = false;
      duck(false);
      onDone?.();
    };
    speaking.current = true;
    duck(true);
    load(announcementUrl(id)).then((buffer) => {
      try { voiceSource.current?.stop(); } catch { /* lief schon nicht mehr */ }
      const source = e.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(e.voiceGain);
      source.onended = finish;
      source.start();
      voiceSource.current = source;
      window.setTimeout(finish, (buffer.duration + 1) * 1000);
    }).catch(finish);
  }, [duck, load]);

  const degrade = useCallback((level) => {
    if (level <= degradeLevel.current || musicStopped.current) return;
    degradeLevel.current = level;
    const e = engine.current;
    if (e && musicSource.current) musicSource.current.playbackRate.setTargetAtTime(DEGRADE_RATES[level], e.ctx.currentTime, 0.8);
    if (level >= 2 && !wobble.current) {
      let phase = 0;
      wobble.current = window.setInterval(() => {
        const current = engine.current;
        if (musicStopped.current || !current || !musicSource.current) return;
        phase += 0.5;
        const rate = DEGRADE_RATES[degradeLevel.current] + Math.sin(phase) * 0.012 * degradeLevel.current;
        musicSource.current.playbackRate.setTargetAtTime(rate, current.ctx.currentTime, 0.08);
      }, 180);
    }
  }, []);

  const tapeStop = useCallback(() => {
    if (musicStopped.current) return;
    musicStopped.current = true;
    window.clearInterval(wobble.current);
    const e = engine.current;
    const source = musicSource.current;
    if (!e || !source) return;
    const now = e.ctx.currentTime;
    source.playbackRate.cancelScheduledValues(now);
    source.playbackRate.setValueAtTime(source.playbackRate.value, now);
    source.playbackRate.exponentialRampToValueAtTime(0.08, now + 1.6);
    e.musicGain.gain.cancelScheduledValues(now);
    e.musicGain.gain.setValueAtTime(e.musicGain.gain.value, now);
    e.musicGain.gain.linearRampToValueAtTime(0, now + 1.6);
    source.stop(now + 1.7);
  }, []);

  // Kleine Geräusche, direkt erzeugt: Gong der Wartemarke, Klacken der Ohrmarkenzange
  const sfx = useCallback((kind) => {
    const e = engine.current;
    if (!e || mutedRef.current) return;
    const { ctx } = e;
    const now = ctx.currentTime;
    if (kind === 'ding') {
      [[1318.5, 0], [1046.5, 0.16]].forEach(([frequency, offset]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.1);
        osc.connect(gain).connect(e.master);
        osc.start(now + offset);
        osc.stop(now + offset + 1.2);
      });
    } else {
      const length = Math.floor(ctx.sampleRate * ({ clack: 0.09, scratch: 0.32 }[kind] || 0.025));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const shape = kind === 'scratch' ? (i) => Math.sin(Math.PI * i / length) * (0.6 + 0.4 * Math.sin(i / 900)) : (i) => (1 - i / length) ** 3;
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * shape(i);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = { clack: 1800, scratch: 4200 }[kind] || 3200;
      const gain = ctx.createGain();
      gain.gain.value = { clack: 0.9, scratch: 0.18 }[kind] || 0.25;
      source.connect(filter).connect(gain).connect(e.master);
      source.start(now);
    }
  }, []);

  const playSong = useCallback(() => {
    if (mutedRef.current) return;
    loadSong(getSong()).play().catch(() => { /* ohne vorheriges Tippen: der Abspielknopf bleibt sichtbar */ });
  }, [getSong]);

  const setMuted = useCallback((value) => {
    mutedRef.current = value;
    setMutedState(value);
    writeStorage('localStorage', 'jas-muted', value ? '1' : '0');
    const e = engine.current;
    if (e) e.master.gain.setTargetAtTime(value ? 0 : 1, e.ctx.currentTime, 0.05);
    if (value) song.current?.pause();
  }, []);

  // Tab im Hintergrund: Ton anhalten, beim Zurückkommen weiter
  useEffect(() => {
    const onVisibility = () => {
      const e = engine.current;
      if (!e) return;
      if (document.hidden) e.ctx.suspend().catch(() => {});
      else e.ctx.resume().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => () => {
    window.clearInterval(wobble.current);
    song.current?.pause();
    engine.current?.ctx.close().catch(() => {});
  }, []);

  return { muted, setMuted, toasts, announce, startMusic, unlock, primeSong, degrade, tapeStop, playSong, getSong, sfx };
}

function SongPlayer({ getSong }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const audio = getSong();
    const sync = () => {
      const real = isSong(audio);
      setPlaying(real && !audio.paused);
      setProgress(real && audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange'];
    events.forEach((name) => audio.addEventListener(name, sync));
    sync();
    return () => events.forEach((name) => audio.removeEventListener(name, sync));
  }, [getSong]);
  const toggle = () => {
    const audio = getSong();
    if (!isSong(audio) || audio.paused) loadSong(audio).play().catch(() => {}); else audio.pause();
  };
  return (
    <div className="story-track">
      <span>{playing ? 'Now playing' : 'Listen'} · “It’s Voluntary”</span>
      <div className="song-player">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause song' : 'Play song'}>{playing ? '❚❚' : '▶'}</button>
        <i aria-hidden="true"><b style={{ width: `${progress * 100}%` }} /></i>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Bausteine
   --------------------------------------------------------------- */
function Scene({ id, className = '', children }) {
  return <section id={id} data-index={at(id)} className={`scene scene-${id} ${className}`}>{children}</section>;
}

function Next({ to, children = 'Next step' }) {
  return <button type="button" className="scene-next" onClick={() => goTo(to)}>{children} <span aria-hidden="true">↓</span></button>;
}

function ConsentBanner({ onGesture, onAccept, onClimb }) {
  const [managing, setManaging] = useState(false);
  const [tearing, setTearing] = useState(false);
  const climb = () => { setTearing(true); window.setTimeout(onClimb, 650); };
  return (
    <div className="consent-backdrop">
      <div className={`consent${tearing ? ' is-torn' : ''}`} onClickCapture={onGesture} role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <p className="consent-brand">Peacehold · Privacy & Safety</p>
        <h2 id="consent-title">Peacehold uses fences to improve your experience.</h2>
        <p>We and our one trusted shepherd use fences, bells and loudspeakers to keep you safe, comfortable and exactly where you are. By continuing, you agree to everything.</p>
        {managing && (
          <ul className="consent-prefs">
            {PREFERENCES.map(([name, reason]) => <li key={name}><span><strong>{name}</strong><small>{reason}</small></span><span className="consent-switch" aria-label={`${name}: always on`} /></li>)}
          </ul>
        )}
        <div className="consent-actions">
          <button type="button" className="scribble consent-climb" onClick={climb}>or climb over →</button>
          <button type="button" className="consent-secondary" onClick={() => (managing ? onAccept() : setManaging(true))}>{managing ? 'Save preferences' : 'Manage preferences'}</button>
          <button type="button" className="consent-secondary" onClick={onAccept}>Accept all fences</button>
          <button type="button" className="consent-primary" onClick={onAccept}>Accept all fences (recommended)</button>
        </div>
      </div>
    </div>
  );
}

function registeredToday() {
  const now = new Date();
  return 1180 + Math.floor((now.getHours() * 60 + now.getMinutes()) * 0.85);
}

function FlapNumber({ value }) {
  const chars = `#${value.toLocaleString('en-US')}`.split('');
  return (
    <span className="flap-number" aria-label={`Number ${value}`}>
      {chars.map((char, index) => <span key={`${index}-${char}`} className={`flap${/[0-9]/.test(char) ? '' : ' flap-sign'}`} style={{ animationDelay: `${index * 45}ms` }}>{char}</span>)}
    </span>
  );
}

function NumberScene({ entered, resident, sfx }) {
  const [stage, setStage] = useState('waiting'); // waiting → printing → tagged
  const [drag, setDrag] = useState(0);
  const [choice, setChoice] = useState(null); // confirmed | name
  const [name, setName] = useState('');
  const [count, setCount] = useState(registeredToday);
  const dragStart = useRef(null);
  const digits = String(resident);

  useEffect(() => {
    if (!entered) return undefined;
    const timer = window.setInterval(() => setCount((current) => current + 1), 3500);
    return () => window.clearInterval(timer);
  }, [entered]);

  const pull = () => {
    if (stage !== 'waiting') return;
    setDrag(0);
    setStage('printing');
    sfx('ding');
    window.setTimeout(() => { setStage('tagged'); sfx('clack'); }, 1500);
  };
  const onPointerDown = (event) => { dragStart.current = event.clientY; event.currentTarget.setPointerCapture?.(event.pointerId); };
  const onPointerMove = (event) => { if (dragStart.current !== null) setDrag(Math.max(0, Math.min(90, event.clientY - dragStart.current))); };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (drag > 45) pull(); else setDrag(0);
  };

  const confirm = () => { setChoice('confirmed'); award('number', 10, 'Number confirmed'); };
  const keepName = () => { setChoice('name'); award('name', -10, 'Unregistered name detected'); };
  // Jeder getippte Buchstabe wird zur Ziffer der eigenen Nummer
  const typeName = (event) => setName([...event.target.value].map((char, index) => (char === ' ' ? ' ' : digits[index % digits.length])).join(''));

  return (
    <Scene id="number" className={`is-${stage}${choice ? ' has-choice' : ''}`}>
      <picture className="scene-picture" aria-hidden="true">
        <source media="(max-width: 760px)" srcSet="/images/home/registration-mobile.webp" />
        <img src="/images/home/registration.webp" alt="" loading="lazy" />
      </picture>
      <div className="scene-inner number-layout">
        <div className="number-copy">
          <p className="step-label">Step 1 · Your number</p>
          <h2>Welcome, resident.<br />{stage === 'tagged' ? 'This is who you are now.' : 'Please take a number.'}</h2>
          <p className="number-lead">{stage === 'tagged' ? 'Your number is unique, permanent and much easier to remember than a name.' : 'Every resident is counted. It only takes a second and lasts forever.'}</p>
          {stage !== 'tagged' && <button type="button" className="home-button" onClick={pull} disabled={stage !== 'waiting'}>Take a number</button>}
          {stage === 'tagged' && !choice && (
            <div className="number-actions">
              <button type="button" className="home-button" onClick={confirm}>Confirm my number</button>
              <button type="button" className="ghost-button" onClick={keepName}>I’d rather keep my name</button>
            </div>
          )}
          {choice === 'name' && (
            <div className="name-field">
              <label htmlFor="resident-name">Your name</label>
              <input id="resident-name" value={name} onChange={typeName} autoComplete="off" placeholder="Type your name" />
              {name.replace(/ /g, '').length >= 3 && (
                <div className="scene-feedback" role="status">
                  <p><strong>Name not recognised.</strong> Did you mean #{resident.toLocaleString('en-US')}?</p>
                  <button type="button" className="link-button" onClick={confirm}>Yes, that’s me</button>
                </div>
              )}
            </div>
          )}
          {(choice === 'confirmed' || name) && <p className="scribble scene-note">You have a name.</p>}
          {(choice === 'confirmed' || name.replace(/ /g, '').length >= 3) && <Next to="rewards" />}
        </div>

        <div className="registration">
          <div className="serving-board">
            <span>Now serving</span>
            <FlapNumber value={stage === 'waiting' ? resident - 1 : resident} />
          </div>
          {stage !== 'tagged' ? (
            <div className="dispenser">
              <div className="dispenser-body"><i aria-hidden="true" /><span>Please take<br />a number</span><b aria-hidden="true" /></div>
              <button
                type="button"
                className="ticket"
                style={{ transform: `translateY(${drag}px)` }}
                onClick={pull}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                aria-label="Pull a ticket"
              >
                <span>Peacehold</span>
                <strong>{stage === 'printing' ? `#${resident.toLocaleString('en-US')}` : '#·····'}</strong>
                <small>Please wait to be counted</small>
              </button>
            </div>
          ) : (
            <div className="ear-tag is-punched" aria-label={`Resident number ${resident}`}>
              <span className="ear-tag-hole" aria-hidden="true" />
              <span className="ear-tag-label">Peacehold</span>
              <strong>#{resident.toLocaleString('en-US')}</strong>
              {choice === 'confirmed' && <span className="stamp">Confirmed</span>}
            </div>
          )}
          <p className="registry-stats">Registered today <strong>{count.toLocaleString('en-US')}</strong><span aria-hidden="true">·</span>Left Peacehold <strong>0</strong></p>
        </div>
      </div>
    </Scene>
  );
}

const LISTINGS = [
  { pen: 3, title: 'Cozy pen with fence view', meta: '2 m² · straw included', badge: 'Guest favourite', was: 32 },
  { pen: 7, title: 'Spacious pen with fence view', meta: '2 m² · fully fenced', badge: 'Recommended' },
  { pen: 11, title: 'Quiet pen near the bell', meta: '2 m² · bell rings hourly', badge: null, was: 35 },
  { pen: 12, title: 'Sunny pen with fence view', meta: '2 m² · sun 11:00–11:20', badge: 'Rare find' },
  { pen: 5, title: 'Charming starter pen', meta: '2 m² · your forever home', badge: 'Best price' },
  { pen: 9, title: 'Minimalist pen, fence view', meta: '2 m² · nothing to distract you', badge: 'New', was: 28 },
];

// Ein von Hand gezogener Kreis um den Zaun, bei jeder Karte ein wenig anders
function fenceCircle(index) {
  const j = (n) => ((index * 37 + n * 13) % 7) - 3;
  return `M${16 + j(1)},${31 + j(2)} C${18 + j(3)},${15 + j(4)} ${52 + j(5)},${12 + j(6)} ${86 + j(7)},${16 + j(8)} `
    + `C${95 + j(9) / 2},${19 + j(1)} ${96 + j(2) / 2},${48 + j(3)} ${86 + j(4)},${54 + j(5)} `
    + `C${60 + j(6)},${59 + j(7) / 2} ${26 + j(8)},${59 + j(9) / 2} ${14 + j(1)},${53 + j(2)} `
    + `C${7 + j(3) / 2},${48 + j(4)} ${8 + j(5) / 2},${26 + j(6)} ${24 + j(7)},${20 + j(8)}`;
}

function HomeScene({ sfx }) {
  const [booked, setBooked] = useState(null);
  const [scribbled, setScribbled] = useState(false);
  const [liked, setLiked] = useState([]);
  const [notice, setNotice] = useState('');

  const book = (pen) => {
    if (booked !== null) return;
    setBooked(pen);
    award('rent', -40, 'Rent · Pen 7 · first month');
    window.setTimeout(() => {
      setScribbled(true);
      LISTINGS.forEach((_, index) => window.setTimeout(() => sfx('scratch'), index * 320));
    }, 1300);
  };

  return (
    <Scene id="home" className={`${booked !== null ? 'is-booked' : ''}${scribbled ? ' is-scribbled' : ''}`}>
      <div className="scene-inner listings-layout">
        <div className="listings-top">
          <div className="listings-copy">
            <p className="step-label">Step 3 · Your home</p>
            <h2>Find your perfect pen.</h2>
            <p className="listings-lead">Every resident gets a home. Browse our hand-picked listings and book the one that feels like you.</p>
          </div>
          {booked !== null && (
            <div className="booking-confirm" role="status">
              <p className="booking-head"><span aria-hidden="true">✉</span> Booking confirmed</p>
              <p>You booked <strong>Pen {booked}</strong>. You have been assigned <strong>Pen 7</strong>.</p>
              <p className="booking-rent">First month’s rent: <strong>−40 CC</strong>, charged automatically.</p>
              <p className="booking-small">Pen 7 is identical to your choice. Rent renews monthly. Check-out: —</p>
            </div>
          )}
          {scribbled && (
            <div className="listings-sheep">
              <p className="scribble">They all face the fence.</p>
              <Next to="day" />
            </div>
          )}
        </div>

        <div className="portal">
          <div className="portal-search" aria-hidden="true">
            <span><b>Where</b>Peacehold</span><span><b>When</b>Forever</span><span><b>Who</b>1 resident</span><i>⌕</i>
          </div>
          <div className="portal-filters">
            <button type="button" className="chip is-active" aria-pressed="true">Fence <span className="chip-view">view</span> ✓</button>
            <button type="button" className="chip" onClick={() => setNotice('0 pens near the gate. Showing pens near the fence instead.')}>Near the gate</button>
            <button type="button" className="chip" disabled title="Not available in Peacehold">Sea view</button>
            <span className="portal-count">{notice || `${LISTINGS.length} results · all results are Pen 7 · *plus wool`}</span>
          </div>
          <div className="listing-row">
            {LISTINGS.map((listing, index) => (
              <article key={listing.pen} className={`listing${booked === listing.pen ? ' is-booked' : ''}${booked !== null && listing.pen === 7 ? ' is-assigned' : ''}`}>
                <div className="listing-photo">
                  <img src="/images/home/pen.webp" alt="" loading="lazy" />
                  {listing.badge && <span className="listing-badge">{listing.badge}</span>}
                  <button type="button" className={`listing-heart${liked.includes(listing.pen) ? ' is-liked' : ''}`} aria-label={`Save pen ${listing.pen}`} onClick={() => setLiked((current) => (current.includes(listing.pen) ? current.filter((pen) => pen !== listing.pen) : [...current, listing.pen]))}>♥</button>
                  <svg className="fence-circle" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <path d={fenceCircle(index)} pathLength="1" style={{ animationDelay: `${index * 0.32}s` }} />
                  </svg>
                </div>
                <div className="listing-body">
                  <p className="listing-rating"><span>Pen {listing.pen}</span><span>★ 5.0 <small>(48,213)</small></span></p>
                  <h3>{listing.title}</h3>
                  <p className="listing-meta">{listing.meta}</p>
                  <div className="listing-foot">
                    <p>{listing.was && <s>{listing.was}</s>} <strong>40 CC</strong> <small>/ month*</small></p>
                    <button type="button" onClick={() => book(listing.pen)} disabled={booked !== null}>{booked === listing.pen ? 'Booked' : 'Book'}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}

function Tally({ groups }) {
  return (
    <svg className="tally" viewBox={`0 0 ${groups * 34} 30`} aria-hidden="true">
      {Array.from({ length: groups }, (_, g) => (
        <g key={g} transform={`translate(${g * 34} 0)`}>
          {[0, 1, 2, 3].map((n) => <path key={n} d={`M${4 + n * 6},${4 + ((g + n) % 3)} L${3 + n * 6},${26 - ((g * 2 + n) % 3)}`} />)}
          <path d={`M0,${20 + (g % 3)} L${26},${6 + (g % 2)}`} />
        </g>
      ))}
    </svg>
  );
}

function DayScene({ active, sfx }) {
  const [day, setDay] = useState(1);
  const [current, setCurrent] = useState(-1);
  const [erase, setErase] = useState({});
  const [rewritten, setRewritten] = useState({});
  const [message, setMessage] = useState('');
  const [short, setShort] = useState('');
  const [sheep, setSheep] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState([]);
  const [processed, setProcessed] = useState(0);
  const [coins, setCoins] = useState(0);
  const wipe = useRef(null);

  // Zeitraffer: Die Glocke läutet bei jedem Punkt, dann beginnt derselbe Tag von vorn
  useEffect(() => {
    if (!active) return undefined;
    const timers = SCHEDULE.map((block, index) => window.setTimeout(() => { setCurrent(index); sfx('tick'); }, (minutes(block.from) / DAY_LENGTH) * WEEK_LOOP + 200));
    timers.push(window.setTimeout(() => { setDay((value) => value + 1); setCurrent(-1); sfx('ding'); setSheep(true); }, WEEK_LOOP));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [active, day, sfx]);

  // Kreide wegwischen: je weiter man wischt, desto mehr verschmiert sie, dann schreibt sich der Plan neu
  const onDown = (event, index) => {
    wipe.current = { index, x: event.clientX, total: 0, sound: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onMove = (event) => {
    const state = wipe.current;
    if (!state) return;
    state.total += Math.abs(event.clientX - state.x);
    state.x = event.clientX;
    const amount = Math.min(1, state.total / 240);
    setErase((value) => ({ ...value, [state.index]: amount }));
    if (amount > 0.15 && !state.sound) { state.sound = true; sfx('scratch'); }
  };
  const onUp = () => {
    const state = wipe.current;
    if (!state) return;
    wipe.current = null;
    if (state.total < 20) setErase((value) => ({ ...value, [state.index]: 0.4 }));
    window.setTimeout(() => {
      setErase((value) => ({ ...value, [state.index]: 0 }));
      setRewritten((value) => ({ ...value, [state.index]: (value[state.index] || 0) + 1 }));
      setMessage('The plan rewrites itself.');
      setShort('The plan rewrites itself.');
      setSheep(true);
    }, 900);
  };

  const drop = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = Date.now();
    setDraft('');
    setSuggesting(false);
    setNotes((value) => [...value, { id, text }]);
    award('suggestion', -5, 'Suggestion handling fee', { once: false });
    window.setTimeout(() => {
      setNotes((value) => value.filter((note) => note.id !== id));
      setProcessed((value) => value + 1);
      setMessage(`“${text}” has been received and processed.`);
      setShort(`“${text}” has been processed.`);
      setSheep(true);
    }, 1800);
  };
  const insertCoin = () => {
    setCoins((value) => value + 1);
    sfx('clack');
    award('freetime-upgrade', -20, 'Free time extension', { once: false });
    setMessage('Payment received. Free time remains 21:00–21:05. Your extension has been applied to next week.');
    setShort('Paid. Free time remains 5 min.');
  };

  return (
    <Scene id="day" className={`${sheep ? 'is-scribbled' : ''}${message ? ' has-message' : ''}`}>
      <picture className="scene-picture" aria-hidden="true">
        <source media="(max-width: 760px)" srcSet="/images/home/barn-mobile.webp" />
        <img src="/images/home/barn.webp" alt="" loading="lazy" />
      </picture>
      <div className="scene-inner barn-layout">
        <div className="barn-copy">
          <p className="step-label">Step 4 · Your day</p>
          <h2>Your day has been planned for you.</h2>
          <p className="barn-lead">It’s on the board. It will always be on the board. Feel free to adjust anything.</p>
          {message && <p className="scene-feedback barn-message" role="status">{message}</p>}
          <div className="barn-next">
            <Next to="feed" />
          </div>
        </div>

        <div className="board-wrap">
          <div className="board">
            <div className="board-head">
              <h3>Today’s plan</h3>
              <span key={day} className="board-day">Day {day}</span>
              <span key={`bell-${current}`} className={`board-bell${current >= 0 ? ' is-ringing' : ''}`} aria-hidden="true">🔔</span>
            </div>
            {short && <p className="board-message" aria-hidden="true">{short}</p>}
            <ol className="board-list">
              {SCHEDULE.map((block, index) => (
                <li
                  key={block.from}
                  className={`board-row${current === index ? ' is-now' : ''}${block.free ? ' is-free' : ''}`}
                  style={{ '--erase': erase[index] || 0 }}
                  onPointerDown={(event) => onDown(event, index)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                >
                  <span key={rewritten[index] || 0} className={`board-text${rewritten[index] ? ' is-rewriting' : ''}`}>
                    <time>{block.from}</time>{block.label}{block.free && <small> (5 min)</small>}
                  </span>
                </li>
              ))}
              {sheep && <li className="board-sheep" aria-hidden="true"><Tally groups={4} /><span className="scribble">Same day. 4,381 times.</span></li>}
            </ol>
            <div className="board-foot">
              <span>Wipe a line to change it</span>
              <button type="button" className="suggest-toggle" onClick={() => setSuggesting((value) => !value)}>✉ Suggest</button>
              <button type="button" className="coin-slot" onClick={insertCoin}>
                <i aria-hidden="true" key={coins} className={coins ? 'is-dropping' : ''} />
                <span>Free time +5 min<br /><b>Insert 20 CC</b></span>
              </button>
            </div>
          </div>

          <form className={`suggestions${suggesting ? ' is-open' : ''}`} onSubmit={drop}>
            <div className="suggestion-box" aria-hidden="true">
              <span className="suggestion-label">Suggestions</span>
              <span className="suggestion-slot" />
              {notes.map((note) => <span key={note.id} className="suggestion-note">{note.text}</span>)}
              <span className="suggestion-bin">🗑<small>{processed}</small></span>
            </div>
            <label htmlFor="suggestion" className="visually-hidden">Your suggestion</label>
            <input id="suggestion" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Your suggestion" autoComplete="off" />
            <button type="submit">Drop in</button>
          </form>

          {sheep && (
            <div className="barn-sheep" aria-hidden="true">
              <Tally groups={6} />
              <p className="scribble">Same day. 4,381 times.</p>
            </div>
          )}
        </div>
      </div>
    </Scene>
  );
}

const MINI_STORE = ['grass', 'freetime', 'pen7'];

function RewardsScene({ resident, climbed }) {
  const credits = useCredits();
  const [message, setMessage] = useState('');
  const claimed = Boolean(credits.once.welcome || credits.once['fence-damage']);
  const claim = () => {
    if (climbed) {
      award('fence-damage', -50, 'Fence damage fee');
      setMessage('Welcome gift revoked. Unauthorized entry detected. A fence damage fee has been charged.');
    } else {
      award('welcome', 50, 'Welcome gift');
      setMessage('Your welcome gift has been credited. Enjoy it responsibly.');
    }
  };
  return (
    <Scene id="rewards" className={claimed ? 'is-claimed' : ''}>
      <div className="scene-inner split-layout rewards-layout">
        <div>
          <p className="step-label">Step 2 · Your welcome gift</p>
          <h2>A little something to get you started.</h2>
          <p>Every new resident receives 50 Compliance Credits, the official currency of Peacehold. Spend them on anything you need. Everything you need costs something.</p>
          {!claimed
            ? <button type="button" className="home-button gift-button" onClick={claim}><span aria-hidden="true">🎁</span> Claim my welcome gift</button>
            : <p className="scene-feedback" role="status">{message || 'Your welcome gift has already been credited.'}</p>}
          {claimed && <p className="scribble scene-note">That’s not money. That’s a leash.</p>}
          <span className="desktop-only"><Next to="home" /></span>
        </div>
        <div className="rewards-side">
          <CreditCard resident={resident} />
          <div className="mini-store">
            <p className="mini-store-title"><span>Spend your credits</span><SiteLink href="/store">Full store →</SiteLink></p>
            {ITEMS.filter((item) => MINI_STORE.includes(item.id)).map((item) => (
              <button key={item.id} type="button" onClick={() => setMessage(buy(item))}>
                <span aria-hidden="true">{item.icon}</span><strong>{item.name}</strong><em>{formatCredits(priceOf(item, credits))} CC</em>
              </button>
            ))}
          </div>
          <span className="mobile-only"><Next to="home" /></span>
        </div>
      </div>
    </Scene>
  );
}

function FeedScene({ entered, active, announce, sfx }) {
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [special, setSpecial] = useState(null); // breaking | correction
  const [toast, setToast] = useState(null);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [sheep, setSheep] = useState(false);
  const [bought, setBought] = useState(false);
  const watched = useRef(0);
  const started = useRef(false);
  const story = STORIES[index];
  const account = ACCOUNTS.find((item) => item.id === story.account);

  const say = (text) => {
    const id = Date.now();
    setToast({ id, text });
    window.setTimeout(() => setToast((current) => (current && current.id === id ? null : current)), 3200);
  };
  const go = (step) => {
    setIndex((current) => {
      const next = (current + step + STORIES.length) % STORIES.length;
      if (step > 0 && next === 0) { setRound((value) => value + 1); setSheep(true); }
      return next;
    });
    if (step > 0 && watched.current < STORIES.length) {
      watched.current += 1;
      award('watch', 1, 'Watch time reward', { once: false });
    }
  };

  // Wolf, dann die stille Korrektur
  useEffect(() => {
    if (!entered || started.current) return undefined;
    started.current = true;
    const timers = [
      window.setTimeout(() => { setSpecial('breaking'); announce('wolf'); }, 900),
      window.setTimeout(() => setSpecial(null), 6500),
      window.setTimeout(() => { setSpecial('correction'); announce('correction'); }, 9000),
      window.setTimeout(() => setSpecial(null), 13000),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [entered, announce]);

  // Stories laufen von selbst weiter
  useEffect(() => {
    if (!active || special || replying) return undefined;
    const timer = window.setTimeout(() => go(1), STORY_TIME);
    return () => window.clearTimeout(timer);
  }, [active, special, replying, index, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (event) => {
    if (special) return;
    const box = event.currentTarget.getBoundingClientRect();
    go(event.clientX - box.left < box.width * 0.3 ? -1 : 1);
    sfx('tick');
  };
  const notInterested = (event) => {
    event.stopPropagation();
    say('Noted. Here’s more of it.');
    setRound((value) => value + 1);
    setSheep(true);
  };
  const shop = (event) => {
    event.stopPropagation();
    if (!bought) { award('fence-decor', -15, 'Decorative fence'); setBought(true); }
    say('Purchase complete. Your fence will be installed around you.');
  };
  const sendReply = (event) => {
    event.preventDefault();
    setReplying(false);
    setReply('');
    say('Replies are disabled for your safety.');
  };

  return (
    <Scene id="feed" className={sheep ? 'is-scribbled' : ''}>
      <picture className="scene-picture" aria-hidden="true">
        <img src="/images/home/feed-green.webp" alt="" loading="lazy" />
      </picture>
      <div className="scene-inner split-layout feed-layout">
        <div className="feed-copy">
          <p className="step-label">Step 5 · Stay informed</p>
          <h2>Your feed.<br />Personalized for everyone.</h2>
          <p className="feed-lead">Curated by Peacehold to match your interests. Your interests have been curated to match Peacehold.</p>
          <Next to="training" />
        </div>
        <div className="feed-phone">
          <div className="stories">
            <div className="story-avatars">
              {ACCOUNTS.map((item) => (
                <span key={item.id} className={`story-avatar${item.id === story.account ? ' is-active' : ''}`}>
                  <img src={item.image} alt="" loading="lazy" />
                  <small>{item.name}</small>
                </span>
              ))}
              <svg className="story-strings" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                {[10, 30, 70, 90].map((x, n) => <path key={x} d={`M${x},6 Q${(x + 50) / 2},${26 + (n % 2) * 3} 50,6`} pathLength="1" style={{ animationDelay: `${n * 0.25}s` }} />)}
              </svg>
              {sheep && <span className="scribble story-sheep">Five faces. One voice.</span>}
            </div>

            <div className={`story${special ? ` is-${special}` : ''}${story.ad ? ' is-ad' : ''}`} onClick={tap} role="button" tabIndex={0} aria-label="Next story" onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'Enter') go(1); if (event.key === 'ArrowLeft') go(-1); }}>
              {STORIES.map((item, n) => <img key={item.image} className={`story-image${n === index ? ' is-shown' : ''}`} src={item.image} alt="" loading="lazy" />)}
              <div className="story-bars" aria-hidden="true">
                {STORIES.map((item, n) => <i key={`${n}-${round}`} className={n < index ? 'is-done' : n === index ? `is-current${special || replying ? ' is-paused' : ''}` : ''} />)}
              </div>
              {special === 'breaking' && (
                <div className="story-alert"><b>BREAKING</b><p>A wolf has been sighted near the eastern fence.</p><small>Stay inside. Peacehold Safety Office</small></div>
              )}
              {special === 'correction' && (
                <div className="story-alert"><b>Correction</b><p>No wolf was found.</p><small>Remain alert.</small></div>
              )}
              {!special && (
                <>
                  <div className="story-head">
                    {story.ad ? <span className="story-ad">Ad</span> : <img src={account.image} alt="" />}
                    <strong>{story.ad ? 'Peacehold Fences' : account.name}</strong><span className="story-check" aria-label="verified">✓</span>
                    <button type="button" className="story-mute" onClick={notInterested}>Not interested</button>
                  </div>
                  <p key={`${index}-${round}`} className={`story-text story-${story.font} story-${story.place}`}><span>{story.text}</span></p>
                  {story.ad && <button type="button" className="story-shop" onClick={shop}>{bought ? 'Purchased ✓' : 'Shop now · 15 CC'}</button>}
                  <p className="story-meta">{story.meta}</p>
                </>
              )}
              {toast && <p key={toast.id} className="story-toast" role="status">{toast.text}</p>}
              <div className="story-bottom" onClick={(event) => event.stopPropagation()}>
                {replying ? (
                  <form onSubmit={sendReply}>
                    <label htmlFor="story-reply" className="visually-hidden">Reply</label>
                    <input id="story-reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Send a reply…" autoComplete="off" autoFocus />
                    <button type="submit">Send</button>
                  </form>
                ) : (
                  <button type="button" className="story-reply" onClick={() => setReplying(true)}>Reply…</button>
                )}
                <span className="story-like" aria-label="You liked this">♥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

function TrainingScene() {
  const [answered, setAnswered] = useState(false);
  return (
    <Scene id="training">
      <div className="scene-inner training-layout">
        <p className="step-label">Step 6 · Safety training</p>
        <h2>Know your enemy.</h2>
        <div className="wolf-cards">
          {['Wolf (adult)', 'Wolf (young)', 'Wolf (disguised as sheep)'].map((label) => (
            <figure key={label}><div className="wolf-missing" aria-hidden="true"><span>?</span></div><figcaption><strong>{label}</strong><small>Image unavailable</small></figcaption></figure>
          ))}
        </div>
        <div className="quiz">
          <p className="quiz-question">Quick check: What does a wolf look like?</p>
          <div className="quiz-options">{QUIZ.map((option) => <button key={option} type="button" onClick={() => { setAnswered(true); award('training', 5, 'Certificate of safety'); }}>{option}</button>)}</div>
          {answered && <p className="scene-feedback" role="status">Correct! All answers are correct. You have completed your safety training.</p>}
          {answered && <p className="scribble scene-note">Has anyone ever seen one?</p>}
        </div>
        <Next to="verify" />
      </div>
    </Scene>
  );
}

function VerifyScene({ onPass, passed }) {
  const [selected, setSelected] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const image = attempts % 2 === 0 ? '/images/home/fence.webp' : '/images/brand/hero-peacehold.webp';

  const verify = () => {
    if (selected.length === 0) { setMessage('Please select all squares containing wolves.'); return; }
    setSelected([]);
    setAttempts((count) => count + 1);
    setMessage('Verification failed. Please try again.');
  };

  return (
    <Scene id="verify" className={passed ? 'is-passed' : ''}>
      <div className="scene-inner verify-layout">
        <p className="step-label">Step 7 · Verification</p>
        <div className={`captcha${passed ? ' is-broken' : ''}`} aria-live="polite">
          <div className="captcha-head"><span>Select all squares with</span><strong>wolves</strong><span>Click verify once there are none left.</span></div>
          <div className="captcha-grid">
            {Array.from({ length: 9 }, (_, index) => (
              <button
                key={`${attempts}-${index}`}
                type="button"
                disabled={passed}
                aria-pressed={selected.includes(index)}
                aria-label={`Square ${index + 1}`}
                className={selected.includes(index) ? 'is-selected' : ''}
                style={{ backgroundImage: `url(${image})`, backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` }}
                onClick={() => setSelected((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]))}
              />
            ))}
          </div>
          <div className="captcha-foot"><span>{message}</span><button type="button" onClick={verify} disabled={passed}>Verify</button></div>
          {passed && <span className="scribble captcha-scrawl" aria-hidden="true">There are no wolves.</span>}
        </div>
        {!passed && attempts >= 2 && <button type="button" className="scribble sheep-skip" onClick={onPass}>There are no wolves. Skip it →</button>}
        {!passed && <p className="locked-hint">🔒 Complete verification to continue</p>}
        {passed && <Next to="vote" />}
      </div>
    </Scene>
  );
}

function VoteScene() {
  const areaRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [result, setResult] = useState('');
  const dodge = (event) => {
    if (event.pointerType !== 'mouse') return;
    const area = areaRef.current.getBoundingClientRect();
    setOffset({ x: (Math.random() - 0.5) * Math.min(area.width * 0.7, 440), y: (Math.random() - 0.5) * 140 });
  };
  return (
    <Scene id="vote">
      <div className="scene-inner vote-layout">
        <p className="step-label">Step 8 · Your voice matters</p>
        <h2>Morning assembly is voluntary.<br />Will you attend?</h2>
        <div className="vote-box" ref={areaRef}>
          <div className="vote-options">
            <button type="button" onClick={() => { setResult('yes'); award('vote', -5, 'Processing fee · participation is free'); }}>Yes</button>
            <button type="button" onClick={() => { setResult('yes'); award('vote', -5, 'Processing fee · participation is free'); }}>Yes, gladly</button>
            <button type="button" className="vote-no" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} onPointerEnter={dodge} onClick={() => { setResult('no'); award('vote', -5, 'Processing fee · your “No” was recorded as Yes'); }}>No</button>
          </div>
          {result && (
            <div className="vote-result" role="status">
              {result === 'no' && <p className="vote-recorded">Your answer has been recorded as: <strong>Yes</strong>.</p>}
              <p><strong>Results:</strong> Yes 100% · Yes, gladly 100% · No 0%</p>
              <p>Turnout: 100%. Thank you for your voluntary participation.</p>
            </div>
          )}
        </div>
        {result && <Next to="assistant" />}
      </div>
    </Scene>
  );
}

function AssistantScene({ announce }) {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! I’m your Peacehold Assistant. I can answer any question. How can I help you comply today?' }]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const asked = useRef(0);
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [messages, typing]);

  const ask = (question) => {
    const text = question.trim();
    if (!text || typing) return;
    const index = asked.current;
    asked.current += 1;
    setMessages((current) => [...current, { from: 'you', text }]);
    award('question', -15, 'Curiosity fee', { once: false });
    setDraft('');
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((current) => [...current, { from: 'bot', text: assistantReply(text, index) }]);
      if (asked.current >= 2) announce('questions');
    }, 1100);
  };

  return (
    <Scene id="assistant">
      <div className="scene-inner split-layout">
        <div>
          <p className="step-label">Step 9 · Your assistant</p>
          <h2>Ask me anything.</h2>
          <p>Our new assistant answers every question. Especially the ones you didn’t ask.</p>
          {asked.current >= 1 && <Next to="agreement" />}
        </div>
        <div className="assistant">
          <div className="assistant-top"><img src="/images/home/shepherd.webp" alt="" /><span><strong>Peacehold Assistant</strong><small>powered by the Shepherd · always online</small></span></div>
          <div className="assistant-log" ref={logRef} aria-live="polite">
            {messages.map((message, index) => <p key={index} className={`bubble bubble-${message.from}`}>{message.text}</p>)}
            {typing && <p className="bubble bubble-bot bubble-typing" aria-label="Assistant is typing"><i /><i /><i /></p>}
          </div>
          <div className="assistant-chips">{ASSISTANT_SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => ask(suggestion)}>{suggestion}</button>)}</div>
          <form className="assistant-input" onSubmit={(event) => { event.preventDefault(); ask(draft); }}>
            <label htmlFor="assistant-question" className="visually-hidden">Your question</label>
            <input id="assistant-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything approved…" autoComplete="off" />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </Scene>
  );
}

function AgreementScene() {
  return (
    <Scene id="agreement">
      <div className="scene-inner agreement-layout">
        <p className="step-label">Step 10 · The agreement</p>
        <h2>Almost done. Please review your agreement.</h2>
        <div className="agreement">
          <div className="agreement-text" tabIndex={0} aria-label="Resident agreement">
            <h3>Resident Agreement of Peacehold</h3>
            {CLAUSES.map(([n1, t1, n2, t2, note]) => (
              <p key={n1} className={note ? 'is-marked' : ''}>
                <strong>{n1}</strong> {t1}{n2 && <><br /><strong>{n2}</strong> {t2}</>}
                {note && <span className="scribble clause-note">{note}</span>}
              </p>
            ))}
          </div>
          <label className="agreement-check"><input type="checkbox" checked disabled readOnly /> I have read and agree to everything</label>
          <div className="agreement-sign"><span>Signature</span><strong className="scribble">Don’t sign.</strong></div>
          <button type="button" className="home-button" onClick={() => { award('agreement', -25, 'Signing fee'); goTo('error'); }}>Complete orientation</button>
        </div>
      </div>
    </Scene>
  );
}

/* ---------------------------------------------------------------
   Seite
   --------------------------------------------------------------- */
export default function HomePage({ footer }) {
  const [consent, setConsent] = useState(() => pageConsent);
  const { muted, setMuted, toasts, announce, startMusic, unlock, primeSong, degrade, tapeStop, playSong, getSong, sfx } = useSoundSystem(Boolean(consent));
  const songAllowed = useRef(false);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(() => new Set([0]));
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [exitState, setExitState] = useState('closed'); // closed → denied → torn
  const freed = exitState === 'torn';
  const [resident] = useState(residentNumber);
  const credits = useCredits();
  const containerRef = useRef(null);

  // Welche Szene ist gerade zu sehen?
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.index);
        setActive(index);
        setEntered((current) => (current.has(index) ? current : new Set(current).add(index)));
      });
    }, { root, threshold: 0.55 });
    root.querySelectorAll('.scene').forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, [captchaPassed, freed]);

  // Was passiert, wenn eine Szene zum ersten Mal betreten wird
  const handled = useRef(new Set());
  useEffect(() => {
    entered.forEach((index) => {
      if (handled.current.has(index)) return;
      handled.current.add(index);
      const id = SCENES[index];
      if (id === 'day') award('activities', -15, 'Mandatory activities fee');
      if (id === 'feed') award('feed-sub', -10, 'Stay informed Premium · renews automatically');
      if (id === 'training') award('course', -20, 'Course fee');
      if (id === 'verify') award('verify-fee', -10, 'Verification fee');
      if (id === 'training') degrade(1);
      if (id === 'verify') announce('verify');
      if (id === 'vote') announce('vote');
      if (id === 'assistant') degrade(2);
      if (id === 'agreement') degrade(3);
      if (id === 'error') { announce('glitch'); tapeStop(); }
      if (id === 'story') playSong();
    });
  }, [entered, announce, degrade, tapeStop, playSong]);

  // Jedes Tippen hält den Ton am Leben (Handy-Sperre, Anruf, Tab-Wechsel)
  // und gibt nach dem Captcha auch Sheeps Song frei
  useEffect(() => {
    if (!consent) return undefined;
    const onGesture = () => {
      unlock();
      if (songAllowed.current) primeSong();
    };
    const events = ['click', 'touchend', 'keydown'];
    events.forEach((name) => window.addEventListener(name, onGesture, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, onGesture));
  }, [consent, unlock, primeSong]);

  const decide = (choice) => {
    pageConsent = choice;
    setConsent(choice);
    announce(choice, startMusic);
    containerRef.current?.focus({ preventScroll: true });
  };

  const passCaptcha = () => {
    songAllowed.current = true;
    award('captcha', -10, 'Unverified resident surcharge');
    setCaptchaPassed(true);
    window.setTimeout(() => goTo('vote'), 700);
  };

  // Tastatur (Leertaste, Pfeile, Bild ab) soll sofort die Szenen bewegen
  useEffect(() => {
    if (consent) containerRef.current?.focus({ preventScroll: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const outside = active >= at('error');

  // Zinsen: Schulden wachsen auch, wenn man nichts tut, bis Sheep die Karte zerreißt
  const accruing = Boolean(consent) && !freed && credits.balance < 0;
  useEffect(() => {
    if (!accruing) return undefined;
    const timer = window.setInterval(() => accrueInterest(1), 3000);
    return () => window.clearInterval(timer);
  }, [accruing]);

  const tryExit = () => {
    chargeExit();
    setExitState('denied');
    sfx('clack');
  };
  const tearCard = () => {
    setExitState('torn');
    sfx('scratch');
    window.setTimeout(() => goTo('night'), 1500);
  };
  const step = active >= 1 && active <= ORIENTATION_STEPS ? active : null;

  return (
    <main className={`home${consent ? '' : ' is-locked'}${outside ? ' is-outside' : ''}`}>
      {!consent && <ConsentBanner onGesture={unlock} onAccept={() => decide('accept')} onClimb={() => decide('climb')} />}

      {step && (
        <div className="orientation" aria-hidden="true">
          <span>Resident Orientation · Step {step} of {ORIENTATION_STEPS}</span>
          <i style={{ width: `${(step / ORIENTATION_STEPS) * 100}%` }} />
        </div>
      )}
      {active === at('error') && <div className="orientation orientation-broken" aria-hidden="true"><span>Resident Orientation · Step 11 of 10 · Step 12 of 10 · Step ∞</span><i /></div>}

      <div className="loudspeaker-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => <p key={toast.key} className={`toast toast-${toast.id}`}><span aria-hidden="true">📢</span>{toast.text}</p>)}
      </div>
      {consent && <CreditsPill dark={outside} interest={accruing} voided={freed} />}
      {consent && <button type="button" className="mute-toggle" aria-pressed={!muted} onClick={() => setMuted(!muted)}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</button>}

      <div className="scenes" ref={containerRef} tabIndex={-1}>
        <Scene id="welcome" className="scene-hero">
          <picture>
            <source media="(max-width: 760px)" srcSet="/images/brand/hero-peacehold-mobile.webp" />
            <img src="/images/brand/hero-peacehold.webp" alt="Peacehold farm on a sunny morning: the flock grazes, one black sheep stands upright and looks back" />
          </picture>
          <div className="hero-copy">
            <p className="home-kicker">Welcome to Peacehold.</p>
            <h1>Just Another Sheep</h1>
            <p className="home-deck">A safe place. A simple life. Everything taken care of.</p>
            <button type="button" className="home-button" onClick={() => goTo('number')}>Begin your orientation ↓</button>
          </div>
        </Scene>

        <NumberScene entered={entered.has(at('number'))} resident={resident} sfx={sfx} />
        <RewardsScene resident={resident} climbed={consent === 'climb'} />
        <HomeScene sfx={sfx} />
        <DayScene active={active === at('day')} sfx={sfx} />
        <FeedScene entered={entered.has(at('feed'))} active={active === at('feed')} announce={announce} sfx={sfx} />
        <TrainingScene />
        <VerifyScene onPass={passCaptcha} passed={captchaPassed} />

        {captchaPassed && (
          <>
            <VoteScene />
            <AssistantScene announce={announce} />
            <AgreementScene />

            <Scene id="error" className={exitState !== 'closed' ? 'has-exit' : ''}>
              <div className="error-noise" aria-hidden="true" />
              <div className="scene-inner error-layout">
                <p className="error-code">ORIENTATION ERROR 0x442</p>
                <h2 className="glitch" data-text="Resident not compliant.">Resident not compliant.</h2>
                <p className="error-line">Every— every— everything is fine.</p>
                {exitState === 'closed' && <button type="button" className="scribble sheep-gap" onClick={tryExit}>There’s a gap in the fence →</button>}
                {exitState !== 'closed' && (
                  <div className={`exit-check${freed ? ' is-torn' : ''}`}>
                    <div className="exit-denied" role="alert">
                      <p className="exit-head">Exit denied</p>
                      <p>Exit requires a balance of <strong>0 CC</strong>. Your balance: <strong className="exit-balance">{formatCredits(credits.balance)} CC</strong>.</p>
                      <p className="exit-small">Please remain a resident until your debt is settled. The gate is open at all times.</p>
                    </div>
                    <div className="exit-card" aria-hidden="true">
                      <div className="exit-half exit-left"><CreditCard resident={resident} /></div>
                      <div className="exit-half exit-right"><CreditCard resident={resident} /></div>
                    </div>
                    <p className="scribble exit-sheep">They don’t need a lock. They have your balance.</p>
                    {!freed && <button type="button" className="scribble sheep-gap" onClick={tearCard}>You can’t owe them something they made up →</button>}
                  </div>
                )}
              </div>
            </Scene>

            {freed && (
            <>
            <Scene id="night">
              <img className="scene-bg" src="/images/home/fence-night.webp" alt="" loading="lazy" />
              <div className="scene-inner night-layout">
                <p className="eyebrow">Behind the fence</p>
                <h2>One resident stopped following.</h2>
                <p>He didn’t plan a rebellion. He never wanted to be a hero. He just ran out of patience for bad answers.</p>
                <blockquote className="scribble">“I’m not lost. I just stopped following.”</blockquote>
                <Next to="story">Follow the story</Next>
              </div>
            </Scene>

            <Scene id="story">
              <div className="scene-inner story-layout">
                <img src="/images/brand/sheet-deadpan.webp" alt="Black Sheep standing in a barn, calm and unimpressed" loading="lazy" />
                <div>
                  <p className="eyebrow">Episode 001 · Voluntary Assembly</p>
                  <h2>His story begins at a morning assembly.</h2>
                  <p>Attendance is completely voluntary.</p>
                  <p className="story-personal">{consent === 'climb' ? 'You climbed over the fence in the first five seconds. He’d like you.' : 'You accepted all fences. Most do. He did too, for a long time.'}</p>
                  <SiteLink href="/episodes/001-voluntary-assembly" className="home-button home-button-light">Start with Episode 001 →</SiteLink>
                  <SongPlayer getSong={getSong} />
                  <Next to="choice">One more thing</Next>
                </div>
              </div>
            </Scene>

            <Scene id="choice">
              <div className="scene-inner choice-layout">
                <div className="choice-copy">
                  <h2>You noticed too,<br />didn’t you?</h2>
                  <p>Nobody here will tell you what to think. Just this: look around.</p>
                  <p className="scribble choice-sheep">{credits.balance < 0 ? `They say you owe them ${formatCredits(-credits.balance)} credits. I owe them nothing. Guess which one of us is free.` : `You have ${formatCredits(credits.balance)} credits. I have none. Guess which one of us is free.`}</p>
                  <p className="home-kicker choice-kicker">The only real choice on this page</p>
                  <div className="choice-options">
                    <form onSubmit={(event) => event.preventDefault()}>
                      <label htmlFor="email">New episodes by email</label>
                      <div><input id="email" type="email" placeholder="Your email address" /><button type="submit">Join the herd you choose ↗</button></div>
                    </form>
                    <a className="choice-alt" href="https://x.com/" target="_blank" rel="noopener noreferrer">Follow on X ↗</a>
                    <p className="choice-alt choice-nothing">Or do nothing. That’s allowed too.</p>
                  </div>
                  <p className="home-disclaimer">This page has not been approved by Peacehold.</p>
                </div>
                <EarTagCard resident={resident} consent={consent} active={entered.has(at('story'))} />
              </div>
              {footer}
            </Scene>
            </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
