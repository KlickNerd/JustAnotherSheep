import { useCallback, useEffect, useRef, useState } from 'react';
import { SiteLink } from '../router';
import './home.css';

/* Die Startseite ist das System: Cookie-Banner, Zählung, Feed, Captcha,
   Abstimmung und Assistent wenden Peaceholds Kontrollmechanismen auf den
   Besucher selbst an. Nichts davon erhebt echte Daten — alles ist gespielt. */

const ANNOUNCEMENTS = {
  climb: 'Attention, please. A resident has left the designated path. Please remain calm. Everything is fine.',
  accept: 'Thank you for your cooperation. You have been counted. Have a perfect day.',
  wolf: 'BREAKING: A wolf has been sighted near the eastern fence. Please stay inside.',
  correction: 'CORRECTION: No wolf was found. Please remain alert.',
  vote: 'Reminder: Morning assembly is completely voluntary. Attendance will be recorded.',
  questions: 'Attention: A resident is asking questions. This is not a cause for concern.',
};

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

/* Ein Lautsprecher für die ganze Seite: Durchsage als Text-Einblendung
   (immer) und als Ton (nur nach einem Klick und wenn nicht stummgeschaltet). */
function useLoudspeaker() {
  const [muted, setMuted] = useState(() => readStorage('localStorage', 'jas-muted') === '1');
  const [toasts, setToasts] = useState([]);
  const audioRef = useRef(null);
  const mutedRef = useRef(muted);
  const played = useRef(new Set());

  useEffect(() => {
    mutedRef.current = muted;
    writeStorage('localStorage', 'jas-muted', muted ? '1' : '0');
    if (muted && audioRef.current) audioRef.current.pause();
  }, [muted]);

  const announce = useCallback((id) => {
    if (played.current.has(id)) return;
    played.current.add(id);
    const key = `${id}-${Date.now()}`;
    setToasts((current) => [...current.slice(-2), { key, id, text: ANNOUNCEMENTS[id] }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.key !== key)), 8500);
    if (mutedRef.current) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.pause();
    audio.src = `/audio/announcements/${id}.mp3`;
    audio.volume = 0.85;
    audio.play().catch(() => { /* Browser erlaubt noch keinen Ton — die Einblendung reicht */ });
  }, []);

  return { muted, setMuted, toasts, announce };
}

/* Löst einen Callback einmal aus, sobald das Element sichtbar wird. */
function useOnceVisible(ref, callback, threshold = 0.35) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        callbackRef.current();
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
}

function residentNumber() {
  return (48213 + Math.floor((Date.now() - 1792000000000) / 90000)).toLocaleString('en-US');
}

function ConsentBanner({ onAccept, onClimb }) {
  const [managing, setManaging] = useState(false);
  const [tearing, setTearing] = useState(false);
  const climb = () => { setTearing(true); window.setTimeout(onClimb, 650); };
  return (
    <div className="consent-backdrop">
      <div className={`consent${tearing ? ' is-torn' : ''}`} role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <p className="consent-brand">Peacehold · Privacy & Safety</p>
        <h2 id="consent-title">Peacehold uses fences to improve your experience.</h2>
        <p>We and our one trusted shepherd use fences, bells and loudspeakers to keep you safe, comfortable and exactly where you are. By continuing, you agree to everything.</p>
        {managing && (
          <ul className="consent-prefs">
            {PREFERENCES.map(([name, reason]) => <li key={name}><span><strong>{name}</strong><small>{reason}</small></span><span className="consent-switch" aria-label={`${name}: always on`} /></li>)}
          </ul>
        )}
        <div className="consent-actions">
          <button type="button" className="consent-secondary" onClick={() => (managing ? onAccept() : setManaging(true))}>{managing ? 'Save preferences' : 'Manage preferences'}</button>
          <button type="button" className="consent-secondary" onClick={onAccept}>Accept all fences</button>
          <button type="button" className="consent-primary" onClick={onAccept}>Accept all fences (recommended)</button>
        </div>
        <button type="button" className="scribble consent-climb" onClick={climb}>or climb over →</button>
      </div>
    </div>
  );
}

function Feed({ announce }) {
  const ref = useRef(null);
  const [posts, setPosts] = useState(FEED_POSTS);
  const [news, setNews] = useState([]);
  const [loadedMore, setLoadedMore] = useState(false);

  useOnceVisible(ref, () => {
    announce('wolf');
    setNews([{ type: 'breaking', text: 'Wolf sighted near the eastern fence. Stay inside.' }]);
    window.setTimeout(() => {
      announce('correction');
      setNews((current) => [{ type: 'correction', text: 'No wolf was found. Remain alert.' }, ...current]);
    }, 9000);
  });

  return (
    <section className="home-section feed-section" id="feed" ref={ref}>
      <div className="home-copy">
        <p className="home-kicker">Recommended for you</p>
        <h2>Your daily feed.<br />Personalized for everyone.</h2>
        <p>Curated by Peacehold to match your interests. Your interests have been curated to match Peacehold.</p>
        {loadedMore && <p className="scribble feed-note">It’s the same post.</p>}
      </div>
      <div className="feed-phone">
        <div className="feed-scroll">
          {news.map((item) => <article key={item.type} className={`feed-card feed-${item.type}`}><span>{item.type === 'breaking' ? 'BREAKING' : 'CORRECTION'}</span><p>{item.text}</p><small>Peacehold Safety Office</small></article>)}
          {posts.map((post, index) => <article key={index} className="feed-card"><header><i aria-hidden="true" /><strong>{post.author}</strong><em>{post.badge}</em></header><p>{post.text}</p><small>♥ {post.meta}</small></article>)}
          <button type="button" className="feed-more" onClick={() => { setPosts((current) => [...current, ...FEED_POSTS]); setLoadedMore(true); }}>Load more</button>
        </div>
      </div>
    </section>
  );
}

function Captcha() {
  const [selected, setSelected] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const passed = attempts >= 2;
  const image = attempts % 2 === 0 ? '/images/home/fence.webp' : '/images/brand/hero-peacehold.webp';

  const verify = () => {
    if (selected.length === 0) { setMessage('Please select all squares containing wolves.'); return; }
    setSelected([]);
    setAttempts((count) => count + 1);
    setMessage('Verification failed. Please try again.');
  };

  return (
    <section className="home-section captcha-section" id="verify">
      <div className="home-copy">
        <p className="home-kicker">Security check</p>
        <h2>Before you continue, please verify that you are not a wolf.</h2>
        <p>This helps us keep Peacehold safe from threats we have never seen.</p>
        {passed && <p className="scribble captcha-note">There are no wolves.</p>}
      </div>
      <div className="captcha" aria-live="polite">
        <div className="captcha-head"><span>Select all squares with</span><strong>wolves</strong><span>Click verify once there are none left.</span></div>
        {passed ? (
          <div className="captcha-passed"><strong>Fine.</strong><p>We’ll keep an eye on you.</p></div>
        ) : (
          <div className="captcha-grid">
            {Array.from({ length: 9 }, (_, index) => (
              <button
                key={`${attempts}-${index}`}
                type="button"
                aria-pressed={selected.includes(index)}
                aria-label={`Square ${index + 1}`}
                className={selected.includes(index) ? 'is-selected' : ''}
                style={{ backgroundImage: `url(${image})`, backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` }}
                onClick={() => setSelected((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]))}
              />
            ))}
          </div>
        )}
        {!passed && <div className="captcha-foot"><span>{message}</span><button type="button" onClick={verify}>Verify</button></div>}
      </div>
    </section>
  );
}

function Vote({ announce }) {
  const ref = useRef(null);
  const areaRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [result, setResult] = useState('');
  useOnceVisible(ref, () => announce('vote'));

  const dodge = (event) => {
    if (event.pointerType !== 'mouse') return;
    const area = areaRef.current.getBoundingClientRect();
    const x = (Math.random() - 0.5) * Math.min(area.width * 0.7, 420);
    const y = (Math.random() - 0.5) * 120;
    setOffset({ x, y });
  };

  return (
    <section className="home-section vote-section" id="vote" ref={ref}>
      <div className="home-copy">
        <p className="home-kicker">Community decision</p>
        <h2>Morning assembly is voluntary. Will you attend?</h2>
        <p>Your voice matters. Please choose freely.</p>
      </div>
      <div className="vote-box" ref={areaRef}>
        <div className="vote-options">
          <button type="button" onClick={() => setResult('yes')}>Yes</button>
          <button type="button" onClick={() => setResult('yes')}>Yes, gladly</button>
          <button type="button" className="vote-no" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} onPointerEnter={dodge} onClick={() => setResult('no')}>No</button>
        </div>
        {result && (
          <div className="vote-result" role="status">
            {result === 'no' && <p className="vote-recorded">Your answer has been recorded as: <strong>Yes</strong>.</p>}
            <p><strong>Results:</strong> Yes 100% · Yes, gladly 100% · No 0%</p>
            <p>Turnout: 100%. Thank you for your voluntary participation.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Assistant({ announce }) {
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
    setDraft('');
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((current) => [...current, { from: 'bot', text: assistantReply(text, index) }]);
      if (asked.current >= 2) announce('questions');
    }, 1100);
  };

  return (
    <section className="home-section assistant-section" id="assistant">
      <div className="home-copy">
        <p className="home-kicker">Peacehold Assistant · powered by the Shepherd</p>
        <h2>Ask me anything.</h2>
        <p>Our new assistant answers every question. Especially the ones you didn’t ask.</p>
      </div>
      <div className="assistant">
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
    </section>
  );
}

export default function HomePage() {
  const { muted, setMuted, toasts, announce } = useLoudspeaker();
  const [consent, setConsent] = useState(() => readStorage('sessionStorage', 'jas-consent'));
  const [resident] = useState(residentNumber);
  const breakRef = useRef(null);
  useOnceVisible(breakRef, () => announce('questions'), 0.25);

  useEffect(() => {
    document.body.style.overflow = consent ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [consent]);

  const decide = (choice) => {
    writeStorage('sessionStorage', 'jas-consent', choice);
    setConsent(choice);
    announce(choice);
  };

  return (
    <main className="home">
      {!consent && <ConsentBanner onAccept={() => decide('accept')} onClimb={() => decide('climb')} />}

      <div className="loudspeaker-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => <p key={toast.key} className={`toast toast-${toast.id}`}><span aria-hidden="true">📢</span>{toast.text}</p>)}
      </div>
      {consent && <button type="button" className="mute-toggle" aria-pressed={!muted} onClick={() => setMuted(!muted)}>{muted ? '🔇 Loudspeaker off' : '🔊 Loudspeaker on'}</button>}

      <section className="home-hero">
        <picture>
          <source media="(max-width: 760px)" srcSet="/images/brand/hero-peacehold-mobile.webp" />
          <img src="/images/brand/hero-peacehold.webp" alt="Peacehold farm on a sunny morning: the flock grazes, one black sheep stands upright and looks back" />
        </picture>
        <div className="home-hero-content">
          <p className="home-kicker">Welcome to Peacehold.</p>
          <h1>Just Another Sheep</h1>
          <p className="home-deck">A safe place. A simple life. Everything taken care of.</p>
          <a href="#feed" className="home-button">Take the tour ↓</a>
          {consent && <p className="resident-badge">You are resident <strong>#{resident}</strong>. You have been counted.</p>}
        </div>
      </section>

      <Feed announce={announce} />
      <Captcha />
      <Vote announce={announce} />
      <Assistant announce={announce} />

      <section className="home-break" id="behind-the-fence" ref={breakRef}>
        <div className="break-recap">
          <p className="eyebrow">Behind the fence</p>
          <h2>Did you notice?<br />None of that was a choice.</h2>
          <ul>
            <li>You were counted before you said a word.</li>
            <li>You were shown the same post until it felt true.</li>
            <li>You had to prove you weren’t a threat — from a threat nobody has seen.</li>
            <li>You could vote for anything, as long as it was yes.</li>
            <li>Your questions were answered. None of them were answered.</li>
          </ul>
          <p className="break-personal">{consent === 'climb' ? 'You climbed over the fence in the first five seconds. He’d like you.' : 'You accepted all fences. Most do. He did too, for a long time.'}</p>
        </div>
        <div className="break-story">
          <img src="/images/home/fence-night.webp" alt="Black Sheep alone at the fence at night, looking at faint lights beyond the hills" loading="lazy" />
          <div>
            <h3>One resident stopped following.</h3>
            <p>He didn’t plan a rebellion. He never wanted to be a hero. He just ran out of patience for bad answers.</p>
            <blockquote className="scribble">“I’m not lost. I just stopped following.”</blockquote>
            <p>His story begins at a morning assembly. Attendance is completely voluntary.</p>
            <SiteLink href="/episodes/001-voluntary-assembly" className="home-button home-button-light">Start with Episode 001 →</SiteLink>
            <div className="break-track"><span>Episode 001 · Soundtrack · “It’s Voluntary”</span><audio controls preload="none" src="/audio/episode-001-its-voluntary.mp3">Audio playback is not supported in this browser.</audio></div>
          </div>
        </div>
      </section>

      <section className="home-invite">
        <h2>You noticed too,<br />didn’t you?</h2>
        <p>Nobody here will tell you what to think. Just this: look around.</p>
        <p className="home-kicker invite-kicker">The only real choice on this page</p>
        <div className="invite-choices">
          <form onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="email">New episodes by email</label>
            <div><input id="email" type="email" placeholder="Your email address" /><button type="submit">Join the herd you choose ↗</button></div>
          </form>
          <a className="invite-alt" href="https://x.com/" target="_blank" rel="noopener noreferrer">Follow on X ↗</a>
          <p className="invite-alt invite-nothing">Or do nothing. That’s allowed too.</p>
        </div>
        <p className="home-disclaimer">This page has not been approved by Peacehold.</p>
      </section>
    </main>
  );
}
