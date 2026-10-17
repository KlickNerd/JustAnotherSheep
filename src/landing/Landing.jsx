import { useEffect, useState } from 'react';
import { SiteLink } from '../router';
import './landing.css';

/* Die neue Startseite: Landeplatz für alle, die über einen Clip auf
   TikTok, Instagram oder X kommen. In wenigen Sekunden klar machen,
   worum es geht, zum Folgen bringen, und Tiefe für die anbieten, die
   bleiben wollen. Die alte Startseite lebt als Orientierung auf
   /orientation weiter. */

// Sobald die Accounts existieren, hier die Links eintragen
const SOCIALS = [
  { id: 'tiktok', name: 'TikTok', url: null },
  { id: 'instagram', name: 'Instagram', url: null },
  { id: 'x', name: 'X', url: null },
];

const DAY = [
  ['06:00', 'Wake-up bell'],
  ['06:15', 'The count', 'By the dogs. Every sheep, every morning.'],
  ['07:00', 'Morning assembly', 'Voluntary. Attendance will be recorded.'],
  ['08:00', 'Work', 'Designated area only.'],
  ['12:00', 'Approved lunch'],
  ['13:00', 'Work'],
  ['18:00', 'The count, again'],
  ['21:00', 'Free time', '5 minutes.'],
  ['21:05', 'Lights out'],
];

const ANNOUNCEMENTS = [
  'Everything is fine.',
  'A wolf has been sighted near the eastern fence. Please stay inside.',
  'Correction: no wolf was found. Please remain alert.',
  'Morning assembly is completely voluntary.',
  'The gate is open at all times.',
  'Questions may be submitted to the Question Office.',
];

const CAST = [
  { name: 'Sheep', role: 'The black sheep', text: 'Wakes up at the same time as everyone else. Lately, he has started asking why.', image: '/images/home/fence-night.webp', position: '40% 60%' },
  { name: 'The Shepherd', role: 'Runs Peacehold', text: 'Calm, polished, always reasonable. Decides the rules, the taxes and what counts as a good question.', image: '/images/characters/shepherd.webp', position: '85% 70%' },
  { name: 'The Dogs', role: 'Keep you safe', text: 'They count you, watch you and remind you where the fence is. For your protection.', image: '/images/characters/guard.webp', position: '75% 70%' },
  { name: 'The Wolves', role: 'The threat', text: 'Dangerous, everywhere and the reason for every fence. Nobody has ever seen one.', image: null },
];

function Socials({ dark = false }) {
  return (
    <div className={`landing-socials${dark ? ' is-dark' : ''}`}>
      {SOCIALS.map((social) => (social.url
        ? <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">{social.name} ↗</a>
        : <span key={social.id} aria-disabled="true">{social.name} <small>soon</small></span>))}
    </div>
  );
}

function Loudspeaker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % ANNOUNCEMENTS.length), 4200);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <p className="landing-speaker" role="status" aria-live="off">
      <span aria-hidden="true">📢</span>
      <span key={index} className="landing-speaker-text">{ANNOUNCEMENTS[index]}</span>
    </p>
  );
}

function Signup() {
  const [sent, setSent] = useState(false);
  // Noch ohne Backend: die Adresse wird nirgends gespeichert
  return sent
    ? <p className="landing-signup-done" role="status">Sign-up isn’t open yet. Follow along on social media in the meantime.</p>
    : (
      <form className="landing-signup" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
        <label htmlFor="landing-email" className="visually-hidden">Email address</label>
        <input id="landing-email" type="email" required placeholder="Your email address" autoComplete="email" />
        <button type="submit">Notify me</button>
      </form>
    );
}

export default function Landing({ footer }) {
  return (
    <main className="landing">
      <section className="landing-hero">
        <picture>
          <source media="(max-width: 760px)" srcSet="/images/brand/hero-peacehold-mobile.webp" />
          <img src="/images/brand/hero-peacehold.webp" alt="Peacehold farm on a sunny morning: the flock grazes, one black sheep stands upright and looks back" />
        </picture>
        <div className="landing-hero-copy">
          <p className="landing-kicker">Welcome to Peacehold</p>
          <h1>Just Another Sheep</h1>
          <p className="landing-deck">Everything is fine.<br /><span className="landing-scribble">Sheep isn’t so sure.</span></p>
          <p className="landing-intro">An animated satire about a farm that takes care of everything, and the one sheep who started asking questions.</p>
          <Socials />
        </div>
      </section>

      <section className="landing-band">
        <Loudspeaker />
      </section>

      <section className="landing-section landing-clip">
        <div className="landing-copy">
          <p className="landing-kicker">The series</p>
          <h2>Short episodes.<br />Long questions.</h2>
          <p>New episodes drop on TikTok, Instagram and X. Each one is a single day on the farm, and each day looks exactly like the last. Until it doesn’t.</p>
          <Socials />
        </div>
        <div className="landing-phone" aria-label="Episode 1, coming soon">
          <img src="/images/home/story-tower.webp" alt="" loading="lazy" />
          <div className="landing-phone-overlay">
            <span className="landing-phone-tag">Episode 1</span>
            <strong>Coming soon</strong>
            <small>Please remain patient.</small>
          </div>
        </div>
      </section>

      <section className="landing-section landing-day">
        <div className="landing-copy">
          <p className="landing-kicker">A day in Peacehold</p>
          <h2>Your day has been planned for you.</h2>
          <p>Every day. The same bell, the same count, the same fence. The loudspeakers make sure nobody forgets how lucky they are.</p>
        </div>
        <ol className="landing-timeline">
          {DAY.map(([time, label, note]) => (
            <li key={time} className={time === '21:00' ? 'is-free' : ''}>
              <time>{time}</time>
              <span><strong>{label}</strong>{note && <small>{note}</small>}</span>
            </li>
          ))}
          <li className="landing-timeline-repeat" aria-hidden="true"><span className="landing-scribble">Repeat. Forever.</span></li>
        </ol>
      </section>

      <section className="landing-section landing-cast">
        <div className="landing-copy">
          <p className="landing-kicker">Who’s who</p>
          <h2>Meet the farm.</h2>
        </div>
        <div className="landing-cast-grid">
          {CAST.map((member) => (
            <article key={member.name} className={`landing-card${member.image ? '' : ' is-classified'}`}>
              {member.image
                ? <img src={member.image} alt="" loading="lazy" style={{ objectPosition: member.position }} />
                : <div className="landing-card-missing"><span>Image unavailable</span><small>Classified for your safety.</small></div>}
              <div className="landing-card-body">
                <small>{member.role}</small>
                <h3>{member.name}</h3>
                <p>{member.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-game">
        <img className="landing-game-bg" src="/images/game/peacehold-homeland-v1.webp" alt="" loading="lazy" />
        <div className="landing-game-copy">
          <p className="landing-kicker">The game · in development</p>
          <h2>Live in Peacehold.</h2>
          <p>Work the fields. Earn Credits. Pay your taxes. Spend what’s left on things you don’t need. The Shepherd prints the money, sets the rules and can freeze your account whenever he likes.</p>
          <p className="landing-scribble landing-game-note">Find out what you do when he does.</p>
          <ul className="landing-game-facts">
            <li><strong>Credits</strong><span>Issued by the Shepherd. Backed by the Shepherd.</span></li>
            <li><strong>Taxes</strong><span>Subject to change. They have already changed.</span></li>
            <li><strong>Debt</strong><span>The fence you can’t see.</span></li>
          </ul>
        </div>
      </section>

      <section className="landing-section landing-orientation">
        <img src="/images/home/registration.webp" alt="" loading="lazy" />
        <div className="landing-orientation-copy">
          <p className="landing-kicker">Interactive · about 5 minutes</p>
          <h2>New here? Become a resident.</h2>
          <p>Take a number, book your pen, pass the wolf training and sign the agreement. Peacehold’s official orientation, now open to everyone.</p>
          <SiteLink href="/orientation" className="landing-button">Begin your orientation →</SiteLink>
        </div>
      </section>

      <section className="landing-section landing-follow">
        <p className="landing-kicker">Stay outside the fence</p>
        <h2>Follow Sheep.</h2>
        <p>Accounts get suspended. Email doesn’t. Leave your address and we’ll tell you when something new drops.</p>
        <Socials dark />
        <Signup />
        <p className="landing-small">This page has not been approved by Peacehold.</p>
      </section>

      {footer}
    </main>
  );
}
