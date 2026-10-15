import { useCallback, useEffect, useRef, useState } from 'react';
import { SiteLink } from '../router';
import { award, buy, CreditCard, CreditsPill, DailyBonus, formatCredits, ITEMS, priceOf, residentNumber, useCredits } from '../credits';
import EarTagCard from './EarTag';
import './home.css';

/* Die Startseite ist ein Onboarding in Peacehold: 15 bildschirmfüllende
   Szenen, durch die man von Container zu Container springt. Das System
   gliedert den Besucher ein (Nummer, Gatter, Tagesplan, Belohnungen, Feed, Schulung,
   Prüfung, Abstimmung, Assistent, Vertrag), Sheep sabotiert es nach und
   nach, bis das Onboarding zusammenbricht. Nichts davon erhebt echte
   Daten — Zählung, Captcha und Abstimmung sind gespielt. */

const SCENES = ['welcome', 'number', 'home', 'day', 'rewards', 'feed', 'training', 'verify', 'vote', 'assistant', 'agreement', 'error', 'night', 'story', 'choice'];
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

const FEED_POSTS = [
  { author: 'Peacehold News', badge: 'Official', text: 'Everything is fine.', meta: '12,847 likes' },
  { author: 'Wooly', badge: 'Your neighbour', text: 'Everything is fine! Lovely day for it 🌾', meta: 'Liked by everyone you know' },
  { author: 'Trending in Peacehold', badge: '#1', text: '#EverythingIsFine', meta: 'Trending for 35 years' },
  { author: 'The Shepherd', badge: 'Verified', text: 'Everything is fine. Thank you for not asking.', meta: 'Pinned' },
  { author: 'Because you liked “Everything is fine”', badge: 'For you', text: 'Everything is fine.', meta: 'Recommended for you' },
];

const PREFERENCES = [
  ['Fences', 'Required for your safety'],
  ['Bells', 'Required for your schedule'],
  ['Loudspeakers', 'Required for your information'],
  ['Wolves', 'Required for your motivation'],
];

const SCHEDULE = [
  ['06:00', 'Wake-up bell'],
  ['06:15', 'Wool inspection'],
  ['07:00', 'Morning assembly (voluntary)'],
  ['08:00', 'Grazing, designated area'],
  ['12:00', 'Approved lunch'],
  ['13:00', 'Grazing, designated area'],
  ['18:00', 'Evening count'],
  ['21:00', 'Free time (5 min, supervised)'],
  ['21:05', 'Lights out'],
];

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
      const length = Math.floor(ctx.sampleRate * (kind === 'clack' ? 0.09 : 0.025));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = kind === 'clack' ? 1800 : 3200;
      const gain = ctx.createGain();
      gain.gain.value = kind === 'clack' ? 0.9 : 0.25;
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
    <Scene id="number" className={`is-${stage}`}>
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
          {(choice === 'confirmed' || name.replace(/ /g, '').length >= 3) && <Next to="home" />}
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
              {stage === 'waiting' && <p className="dispenser-hint" aria-hidden="true">Pull ↓</p>}
            </div>
          ) : (
            <div className="ear-tag is-punched" aria-label={`Resident number ${resident}`}>
              <span className="ear-tag-hole" aria-hidden="true" />
              <span className="ear-tag-label">Peacehold</span>
              <strong>#{resident.toLocaleString('en-US')}</strong>
              {choice === 'confirmed' && <span className="stamp">Confirmed</span>}
              {(choice === 'confirmed' || name) && <span className="scribble ear-tag-note">You have a name.</span>}
            </div>
          )}
          <p className="registry-stats">Registered today <strong>{count.toLocaleString('en-US')}</strong><span aria-hidden="true">·</span>Left Peacehold <strong>0</strong></p>
        </div>
      </div>
    </Scene>
  );
}

function HomeScene() {
  const [chosen, setChosen] = useState(null);
  return (
    <Scene id="home">
      <div className="scene-inner split-layout">
        <div>
          <p className="step-label">Step 2 · Your home</p>
          <h2>Choose your pen.</h2>
          <p>Every resident gets a home. Pick the one that feels like you.</p>
          {chosen !== null && (
            <div className="scene-feedback" role="status">
              <p>You chose pen {chosen + 1}. <strong>You have been assigned pen 7.</strong></p>
              <p>Pen 7 is identical to all other pens. Excellent choice.</p>
            </div>
          )}
          {chosen !== null && <Next to="day" />}
        </div>
        <div className="pen-map" role="group" aria-label="Available pens">
          {Array.from({ length: 12 }, (_, index) => (
            <button key={index} type="button" className={`pen${chosen === index ? ' is-chosen' : ''}${chosen !== null && index === 6 ? ' is-assigned' : ''}`} onClick={() => { setChosen(index); award('pen', 10, 'Assignment accepted'); }}>
              <span>Pen {index + 1}</span><i aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </Scene>
  );
}

function DayScene() {
  const [shaking, setShaking] = useState(null);
  const [message, setMessage] = useState('');
  const tryChange = (index) => {
    setShaking(index);
    setMessage('Changes to the plan are not part of the plan.');
    window.setTimeout(() => setShaking(null), 500);
  };
  return (
    <Scene id="day">
      <div className="scene-inner split-layout">
        <div>
          <p className="step-label">Step 3 · Your day</p>
          <h2>Your day has been planned for you.</h2>
          <p>So you never have to wonder what comes next. Feel free to adjust anything.</p>
          <button type="button" className="ghost-button" onClick={() => { setMessage('Your request has been received. And denied.'); award('change-fee', -5, 'Change request fee', { once: false }); }}>Request a change</button>
          {message && <p className="scene-feedback" role="status">{message}</p>}
          <Next to="feed" />
        </div>
        <ol className="schedule">
          {SCHEDULE.map(([time, label], index) => (
            <li key={time}>
              <button type="button" className={shaking === index ? 'is-shaking' : ''} onClick={() => tryChange(index)}>
                <time>{time}</time><span>{label}</span><i aria-hidden="true">⋮⋮</i>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Scene>
  );
}

const MINI_STORE = ['grass', 'freetime', 'pen7'];

function RewardsScene({ resident }) {
  const credits = useCredits();
  const [message, setMessage] = useState('');
  return (
    <Scene id="rewards">
      <div className="scene-inner split-layout rewards-layout">
        <div>
          <p className="step-label">Step 4 · Your rewards</p>
          <h2>Good behaviour pays.</h2>
          <p>Meet Compliance Credits, the official currency of Peacehold. Earned by doing what you were going to do anyway. Spent on things you already have.</p>
          <DailyBonus />
          {(message || credits.lastDay) && <p className="scribble scene-note">That’s not money. That’s a leash.</p>}
          <span className="desktop-only"><Next to="feed" /></span>
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
            {message && <p className="scene-feedback" role="status">{message}</p>}
          </div>
          <span className="mobile-only"><Next to="feed" /></span>
        </div>
      </div>
    </Scene>
  );
}

function FeedScene({ entered, announce }) {
  const [posts, setPosts] = useState(FEED_POSTS);
  const [news, setNews] = useState([]);
  const [loadedMore, setLoadedMore] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!entered || started.current) return undefined;
    started.current = true;
    const first = window.setTimeout(() => {
      announce('wolf');
      setNews([{ type: 'breaking', text: 'Wolf sighted near the eastern fence. Stay inside.' }]);
    }, 900);
    const second = window.setTimeout(() => {
      announce('correction');
      setNews((current) => [{ type: 'correction', text: 'No wolf was found. Remain alert.' }, ...current]);
    }, 9000);
    return () => { window.clearTimeout(first); window.clearTimeout(second); };
  }, [entered, announce]);

  return (
    <Scene id="feed">
      <div className="scene-inner split-layout">
        <div>
          <p className="step-label">Step 5 · Stay informed</p>
          <h2>Your feed.<br />Personalized for everyone.</h2>
          <p>Curated by Peacehold to match your interests. Your interests have been curated to match Peacehold.</p>
          {loadedMore && <p className="scribble scene-note">It’s the same post.</p>}
          <Next to="training" />
        </div>
        <div className="feed-phone">
          <div className="feed-scroll">
            {news.map((item) => <article key={item.type} className={`feed-card feed-${item.type}`}><span>{item.type === 'breaking' ? 'BREAKING' : 'CORRECTION'}</span><p>{item.text}</p><small>Peacehold Safety Office</small></article>)}
            {posts.map((post, index) => <article key={index} className="feed-card"><header><i aria-hidden="true" /><strong>{post.author}</strong><em>{post.badge}</em></header><p>{post.text}</p><small>♥ {post.meta}</small></article>)}
            <button type="button" className="feed-more" onClick={() => { setPosts((current) => [...current, ...FEED_POSTS]); setLoadedMore(true); award('feed', 5, 'Engagement reward', { once: false }); }}>Load more</button>
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
          <div className="quiz-options">{QUIZ.map((option) => <button key={option} type="button" onClick={() => { setAnswered(true); award('training', 15, 'Safety training completed'); }}>{option}</button>)}</div>
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
            <button type="button" onClick={() => { setResult('yes'); award('vote', 25, 'Voluntary participation'); }}>Yes</button>
            <button type="button" onClick={() => { setResult('yes'); award('vote', 25, 'Voluntary participation'); }}>Yes, gladly</button>
            <button type="button" className="vote-no" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} onPointerEnter={dodge} onClick={() => { setResult('no'); award('vote', 25, 'Your “No” was recorded as Yes'); }}>No</button>
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
          <button type="button" className="home-button" onClick={() => { award('agreement', 100, 'Agreement signed'); goTo('error'); }}>Complete orientation</button>
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
  }, [captchaPassed]);

  // Was passiert, wenn eine Szene zum ersten Mal betreten wird
  const handled = useRef(new Set());
  useEffect(() => {
    entered.forEach((index) => {
      if (handled.current.has(index)) return;
      handled.current.add(index);
      const id = SCENES[index];
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
    if (choice === 'accept') award('consent', 50, 'Accepted all fences');
    else award('consent', 0, 'Climbing is not a rewarded activity');
    announce(choice, startMusic);
    containerRef.current?.focus({ preventScroll: true });
  };

  const passCaptcha = () => {
    songAllowed.current = true;
    award('captcha', -20, 'Verification skipped');
    setCaptchaPassed(true);
    window.setTimeout(() => goTo('vote'), 700);
  };

  // Tastatur (Leertaste, Pfeile, Bild ab) soll sofort die Szenen bewegen
  useEffect(() => {
    if (consent) containerRef.current?.focus({ preventScroll: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const outside = active >= at('error');
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
      {consent && <CreditsPill dark={outside} />}
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
        <HomeScene />
        <DayScene />
        <RewardsScene resident={resident} />
        <FeedScene entered={entered.has(at('feed'))} announce={announce} />
        <TrainingScene />
        <VerifyScene onPass={passCaptcha} passed={captchaPassed} />

        {captchaPassed && (
          <>
            <VoteScene />
            <AssistantScene announce={announce} />
            <AgreementScene />

            <Scene id="error">
              <div className="error-noise" aria-hidden="true" />
              <div className="scene-inner error-layout">
                <p className="error-code">ORIENTATION ERROR 0x442</p>
                <h2 className="glitch" data-text="Resident not compliant.">Resident not compliant.</h2>
                <p className="error-line">Every— every— everything is fine.</p>
                <button type="button" className="scribble sheep-gap" onClick={() => goTo('night')}>There’s a gap in the fence →</button>
              </div>
            </Scene>

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
                  <p className="scribble choice-sheep">You earned {credits.earned.toLocaleString('en-US')} credits. I earned nothing. Guess which one of us is free.</p>
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
      </div>
    </main>
  );
}
