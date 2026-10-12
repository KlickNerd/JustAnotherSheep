import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { characterImageUrl, characters } from './data/characters';
import { arcs, episodeOneMemes, episodeTwoMemes, episodeThreeMemes, episodeFourMemes, episodeFiveMemes, episodeSixMemes, episodeSevenMemes, episodeEightMemes, episodeNineMemes, episodeTenMemes, episodeElevenMemes, episodeTwelveMemes, episodeThirteenMemes, files } from './data/archive';
import { forumThreads, notebookEntries, peaceholdRecords } from './data/pages';
import './styles.css';

const imageFolders = {
  'public-street.webp': 'brand',
  'public-portrait.webp': 'brand',
  'gate.webp': 'characters',
  'wooly.webp': 'characters',
  'larry.webp': 'characters',
  'doris.webp': 'characters',
  'shepherd.webp': 'characters',
  'guard.webp': 'characters',
  'flock.webp': 'characters',
  'voluntary.webp': 'episodes',
  'episode-001-frame-01.png': 'episodes',
  'episode-001-frame-02.png': 'episodes',
  'episode-001-frame-03.png': 'episodes',
  'episode-001-frame-04.png': 'episodes',
  'episode-001-frame-05.png': 'episodes',
  'episode-001-frame-06.png': 'episodes',
  'episode-002-frame-01.png': 'episodes',
  'episode-002-frame-02.png': 'episodes',
  'episode-002-frame-03.png': 'episodes',
  'episode-002-frame-04.png': 'episodes',
  'episode-002-frame-05.png': 'episodes',
  'episode-002-frame-06.png': 'episodes',
  'episode-003-frame-01.png': 'episodes',
  'episode-003-frame-02.png': 'episodes',
  'episode-003-frame-03.png': 'episodes',
  'episode-003-frame-04.png': 'episodes',
  'episode-003-frame-05.png': 'episodes',
  'episode-003-frame-06.png': 'episodes',
  'episode-004-frame-01.png': 'episodes',
  'episode-004-frame-02.png': 'episodes',
  'episode-004-frame-03.png': 'episodes',
  'episode-004-frame-04.png': 'episodes',
  'episode-004-frame-05.png': 'episodes',
  'episode-004-frame-06.png': 'episodes',
  'episode-005-frame-01.png': 'episodes',
  'episode-005-frame-02.png': 'episodes',
  'episode-005-frame-03.png': 'episodes',
  'episode-005-frame-04.png': 'episodes',
  'episode-005-frame-05.png': 'episodes',
  'episode-005-frame-06.png': 'episodes',
  'episode-006-frame-01.png': 'episodes',
  'episode-006-frame-02.png': 'episodes',
  'episode-006-frame-03.png': 'episodes',
  'episode-006-frame-04.png': 'episodes',
  'episode-006-frame-05.png': 'episodes',
  'episode-006-frame-06.png': 'episodes',
  'episode-007-frame-01.png': 'episodes',
  'episode-007-frame-02.png': 'episodes',
  'episode-007-frame-03.png': 'episodes',
  'episode-007-frame-04.png': 'episodes',
  'episode-007-frame-05.png': 'episodes',
  'episode-007-frame-06.png': 'episodes',
  'episode-008-frame-01.png': 'episodes',
  'episode-008-frame-02.png': 'episodes',
  'episode-008-frame-03.png': 'episodes',
  'episode-008-frame-04.png': 'episodes',
  'episode-008-frame-05.png': 'episodes',
  'episode-008-frame-06.png': 'episodes',
  'episode-009-frame-01.png': 'episodes',
  'episode-009-frame-02.png': 'episodes',
  'episode-009-frame-03.png': 'episodes',
  'episode-009-frame-04.png': 'episodes',
  'episode-009-frame-05.png': 'episodes',
  'episode-009-frame-06.png': 'episodes',
  'episode-010-frame-01.png': 'episodes',
  'episode-010-frame-02.png': 'episodes',
  'episode-010-frame-03.png': 'episodes',
  'episode-010-frame-04.png': 'episodes',
  'episode-010-frame-05.png': 'episodes',
  'episode-010-frame-06.png': 'episodes',
  'episode-011-frame-01.png': 'episodes',
  'episode-011-frame-02.png': 'episodes',
  'episode-011-frame-03.png': 'episodes',
  'episode-011-frame-04.png': 'episodes',
  'episode-011-frame-05.png': 'episodes',
  'episode-011-frame-06.png': 'episodes',
  'episode-012-frame-01.png': 'episodes',
  'episode-012-frame-02.png': 'episodes',
  'episode-012-frame-03.png': 'episodes',
  'episode-012-frame-04.png': 'episodes',
  'episode-012-frame-05.png': 'episodes',
  'episode-012-frame-06.png': 'episodes',
  'episode-013-frame-01.png': 'episodes',
  'episode-013-frame-02.png': 'episodes',
  'episode-013-frame-03.png': 'episodes',
  'episode-013-frame-04.png': 'episodes',
  'episode-013-frame-05.png': 'episodes',
  'episode-013-frame-06.png': 'episodes',
};

const localImage = (image) => `/images/${imageFolders[image] ?? 'files'}/${image}`;
const episodeOneAudio = '/audio/episode-001-its-voluntary.mp3';
const episodeTwoAudio = '/audio/episode-002-fear-of-art.mp3';
const episodeThreeAudio = '/audio/episode-003-bringing-chalk.mp3';
const episodeFourAudio = '/audio/episode-004-everyone-is-going-this-way.mp3';
const episodeFiveAudio = '/audio/Safe%20From%20What.mp3';
const episodeSixAudio = '/audio/episode-006-open-gate-policy.mp3';
const episodeSevenAudio = '/audio/episode-007-terms-and-conditions-apply.mp3';
const episodeEightAudio = '/audio/episode-008-the-bell-department.mp3';
const episodeNineAudio = '/audio/episode-009-inside-the-lines.mp3';
const episodeTenAudio = '/audio/episode-010-nothing-of-value.mp3';
const episodeElevenAudio = '/audio/episode-011-keep-your-head-down.mp3';
const episodeTwelveAudio = '/audio/episode-012-ownership-survives-the-edit.mp3';
const episodeThirteenAudio = '/audio/episode-013-temporary-lives-here.mp3';

const exploreLinks = [
  ['Start Here', '/start-here'],
  ['Sounds of Peacehold', '/sounds'],
  ['Meet the Flock', '/meet-the-flock'],
  ['Peacehold', '/peacehold'],
  ['About', '/about'],
];

const primaryLinks = [
  ['Episodes', '/episodes'],
  ['Episode 005 · Safety Concerns', '/episodes/005-safety-concerns'],
  ['Episode 006 · Open Gate Policy', '/episodes/006-open-gate-policy'],
  ['Episode 007 · Terms and Conditions Apply', '/episodes/007-terms-and-conditions-apply'],
  ['Episode 008 · The Bell Department', '/episodes/008-the-bell-department'],
  ['Episode 009 · Inside the Lines', '/episodes/009-inside-the-lines'],
  ['Episode 010 · Nothing of Value', '/episodes/010-nothing-of-value'],
  ['Episode 011 · Keep Your Head Down', '/episodes/011-keep-your-head-down'],
  ['Episode 012 · Ownership Survives the Edit', '/episodes/012-ownership-survives-the-edit'],
  ['Episode 013 · Temporary Lives Here', '/episodes/013-temporary-lives-here'],
  ['The Black Sheep Files', '/files'],
  ['Watch', '/watch'],
  ["Black Sheep’s Notebook", '/notebook'],
  ['The Open Field', '/open-field'],
];

const dispatches = [
  ['voluntary.webp', 'Choice, according to Peacehold', 'Voluntary assembly', 'Two ways to attend. Neither involves staying home.'],
  ['control.webp', 'A familiar routine', 'The hardware of control', 'Doris recognizes the pattern long before anyone calls it a pattern.'],
  ['fragile.webp', 'The dangerous question', 'How fragile is stable?', 'If one question can undo a system, what was holding it up?'],
];

function routeTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function SiteLink({ href, children, className = '', onClick }) {
  return <a className={className} href={href} onClick={(event) => { event.preventDefault(); onClick?.(); routeTo(href); }}>{children}</a>;
}

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <SiteLink href="/" className="wordmark" onClick={() => setMenuOpen(false)}>JUST ANOTHER SHEEP</SiteLink>
      <button className="menu-trigger" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        <span>{menuOpen ? 'Close' : 'Menu'}</span><i aria-hidden="true" />
      </button>
      {menuOpen && (
        <nav className="menu-panel" aria-label="Main navigation">
          <div className="menu-columns">
            <div>
              <span className="menu-label">Navigate</span>
              {primaryLinks.map(([label, href]) => <SiteLink key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</SiteLink>)}
            </div>
            <div>
              <span className="menu-label">Explore</span>
              {exploreLinks.map(([label, href]) => <SiteLink key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</SiteLink>)}
            </div>
          </div>
          <SiteLink href="/start-here" className="menu-cta" onClick={() => setMenuOpen(false)}>Join the Flock <span>↗</span></SiteLink>
        </nav>
      )}
    </header>
  );
}

function SectionHeading({ eyebrow, title, children }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

function StartHerePage() {
  return <main className="subpage section-dark"><section className="subpage-hero"><div><span className="eyebrow">A way into the story</span><h1>You found the gate.</h1><p>You found the gate. Begin with one small contradiction, then follow Black Sheep through Peacehold.</p><SiteLink href="/episodes/001-voluntary-assembly" className="text-link">Start the story <span>↗</span></SiteLink></div><img src={localImage("public-street.webp")} alt="Realistic Black Sheep on a city street" /></section><section className="story-facts"><article><span className="eyebrow">Who is Black Sheep?</span><h3>The one who asks why.</h3><p>Resident classification: Difficult. Occupation: Asking questions. First appearance: Episode 001.</p></article><article><span className="eyebrow">What is Peacehold?</span><h3>A place with an answer for everything.</h3><p>Signs, rules, broadcasts, and reassuring explanations. The gaps between them tell another story.</p></article><article><span className="eyebrow">How it works</span><h3>100 episodes · 10 arcs.</h3><p>Each visual piece stands alone. Across episodes, the characters and consequences accumulate.</p></article></section><section className="path-through"><span className="eyebrow">A path through Peacehold</span><h2>Watch → Read → Listen → Discuss</h2><div className="path-grid">{[['01', 'Watch', 'Begin with the visual story.', '/watch'], ['02', 'Read', 'Follow the notes behind the questions.', '/notebook'], ['03', 'Listen', 'Hear the motifs as the score arrives.', '/sounds'], ['04', 'Discuss', 'Add your own reading of the story.', '/open-field']].map(([number, title, copy, href]) => <SiteLink key={href} href={href}><span>{number}</span><h3>{title}</h3><p>{copy}</p></SiteLink>)}</div></section></main>;
}

function AboutPage() {
  return <main className="about-page section-dark"><section className="about-intro"><span className="eyebrow">About the project</span><h1>Just Another Sheep</h1><p>A story about a sheep who started asking questions.</p></section><section className="about-story"><div><h2>One story.<br />Many ways in.</h2><p>Just Another Sheep is a serialized satirical story told across 100 planned episodes and 10 arcs. Visual pieces, video, music, editorial notes, and conversation each reveal a different part of Black Sheep’s journey.</p><p>It invites people to notice contradictions, test claims, and reach their own conclusions.</p><SiteLink href="/start-here" className="text-link">Start here <span>↗</span></SiteLink></div><img src={localImage("public-street.webp")} alt="Realistic Black Sheep walking through the city" /></section></main>;
}

function WatchPage() {
  return <main className="watch-page section-dark"><section className="watch-intro"><span className="eyebrow">The viewing room</span><h1>Watch</h1><p>Episode 001’s visual story is open. The video is pending release.</p></section><section className="watch-feature"><img src={localImage("voluntary.webp")} alt="Black Sheep at the voluntary assembly" /><div><span className="eyebrow">Start from the beginning · Arc 01</span><h2>Episode 001 · Voluntary Assembly</h2><p>Peacehold calls it a choice. The guards handle the details.</p><p>Episode video pending release. The visual story and discussion are available now.</p><SiteLink href="/episodes/001-voluntary-assembly" className="text-link">Open episode <span>↗</span></SiteLink></div></section><section className="arc-shelf"><h2>The arc shelf</h2><p>Ten arcs, one connected story. Select an arc in the episode archive to see its place in the series.</p><SiteLink href="/episodes" className="text-link">Browse 10 arcs <span>↗</span></SiteLink></section></main>;
}

function SoundsPage() {
  return <main className="sounds-page section-dark">
    <section className="sounds-intro"><span className="eyebrow">Music from the series</span><h1>Sounds of Peacehold</h1><p>One serialized score, with recurring motifs for Black Sheep, Peacehold, Shepherd, SolAngeles, and the road beyond.</p></section>
    <section className="track-feature"><img src={localImage("voluntary.webp")} alt="Episode 001 Voluntary Assembly artwork" /><div><span className="eyebrow">Episode 001 · Soundtrack</span><h2>It's Voluntary</h2><p>An upbeat folk march that sounds a little too pleased with itself. About 118 BPM, with acoustic guitar, snare, and handclaps.</p><div className="audio-status"><audio controls preload="metadata" src={episodeOneAudio} aria-label="Play It's Voluntary, Episode 001 soundtrack">Audio playback is not supported in this browser.</audio></div><details><summary>Lyrics / track notes</summary><p>Track notes and lyrics will be added separately.</p></details><SiteLink href="/episodes/001-voluntary-assembly" className="text-link">Open episode <span>↗</span></SiteLink></div></section>
    <section className="track-entry" aria-labelledby="episode-002-track"><span className="eyebrow">Episode 002 · Soundtrack</span><h2 id="episode-002-track">Fear of Art</h2><p>The song accompanying Episode 002.</p><div className="audio-status"><audio controls preload="metadata" src={episodeTwoAudio} aria-label="Play Fear of Art, Episode 002 soundtrack">Audio playback is not supported in this browser.</audio></div><SiteLink href="/episodes/002-fear-of-art" className="text-link">Open Episode 002 <span>↗</span></SiteLink></section>
    <section className="track-entry" aria-labelledby="episode-003-track"><span className="eyebrow">Episode 003 · Soundtrack</span><h2 id="episode-003-track">Bringing Chalk</h2><p>The song accompanying Episode 003.</p><div className="audio-status"><audio controls preload="metadata" src={episodeThreeAudio} aria-label="Play Bringing Chalk, Episode 003 soundtrack">Audio playback is not supported in this browser.</audio></div><SiteLink href="/episodes/003-your-voice-matters" className="text-link">Open Episode 003 <span>↗</span></SiteLink></section>
    <section className="track-entry" aria-labelledby="episode-004-track"><span className="eyebrow">Episode 004 · Soundtrack</span><h2 id="episode-004-track">Everyone Is Going This Way</h2><p>The song accompanying Episode 004.</p><div className="audio-status"><audio controls preload="metadata" src={episodeFourAudio} aria-label="Play Everyone Is Going This Way, Episode 004 soundtrack">Audio playback is not supported in this browser.</audio></div><SiteLink href="/episodes/004-consensus-is-not-a-compass" className="text-link">Open Episode 004 <span>↗</span></SiteLink></section>
    <section className="track-entry" aria-labelledby="episode-005-track"><span className="eyebrow">Episode 005 · Soundtrack</span><h2 id="episode-005-track">Safe From What</h2><p>The song accompanying Episode 005.</p><div className="audio-status"><audio controls preload="metadata" src={episodeFiveAudio} aria-label="Play Safe From What, Episode 005 soundtrack">Audio playback is not supported in this browser.</audio></div><SiteLink href="/episodes/005-safety-concerns" className="text-link">Open Episode 005 <span>↗</span></SiteLink></section>
    <section className="motifs"><span className="eyebrow">Recurring motifs</span><h2>A score with a memory.</h2><div>{['Black Sheep', 'Peacehold', 'Shepherd', 'SolAngeles', 'Arc themes'].map((motif) => <span key={motif}>{motif}</span>)}</div><p>Playback starts only when you press Play.</p></section>
  </main>;
}

function PeaceholdPage() {
  return <main className="peacehold-page section-dark"><section className="peacehold-intro"><span className="eyebrow">Community records office</span><h1>Peacehold</h1><p>A remarkably well documented place. Some of the most interesting details are the ones missing from the record.</p></section><section className="route-document"><div><span className="eyebrow">Route document · PH/01</span><h2>The route through Peacehold</h2><p>Assembly Yard → Administration → Main Gate → Beyond the Farm</p></div><div className="record-grid">{peaceholdRecords.map(([code, stamp, title, copy]) => <article key={code}><span>{code}</span><strong>{stamp}</strong><h3>{title}</h3><p>{copy}</p><button type="button">Open record</button></article>)}</div></section></main>;
}

function OpenFieldPage() {
  const categories = ['All discussions', 'Episode Discussions', 'Themes & Ideas', 'Questions Worth Asking', 'The Writers’ Room', 'Community'];
  const [activeCategory, setActiveCategory] = useState('All discussions');
  const threads = activeCategory === 'All discussions' ? forumThreads : forumThreads.filter(([category]) => category === activeCategory);
  return <main className="open-field-page section-ivory"><section className="field-hero"><img src={localImage("public-street.webp")} alt="Black Sheep outside Peacehold" /><div><span className="eyebrow">Just Another Sheep · Community</span><h1>The Open Field</h1><p>Where questions are allowed.</p><p>Challenge ideas. Don’t attack people. You don’t have to agree. You do have to think.</p></div></section><section className="featured-thread"><SiteLink href="/open-field/thread/?id=episode-001-voluntary"><span className="eyebrow">Featured discussion · Episode 001</span><h2>When does “voluntary” stop meaning voluntary?</h2><p>If refusing an invitation has consequences, what kind of choice remains?</p><span className="text-link">Join the discussion</span></SiteLink><div><span className="eyebrow">Latest discussions</span>{forumThreads.slice(1, 3).map(([, title, , , id]) => <SiteLink key={id} href={`/open-field/thread/?id=${id}`}>{title}</SiteLink>)}<span className="eyebrow">Most active</span><SiteLink href="/open-field/thread/?id=episode-001-voluntary">Episode 001 · The assembly question</SiteLink></div></section><section className="forum-area"><aside><h2>Conversations</h2><div role="group" aria-label="Discussion categories">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><p>Sign in to join the discussion. Older drafts remain on this device.</p></aside><div className="discussion-feed"><div className="feed-heading"><h2>{activeCategory}</h2><a href="#new-thread">Start a discussion</a></div>{threads.map(([category, title, copy, replies, id]) => <SiteLink key={id} href={`/open-field/thread/?id=${id}`} className="thread-card"><span>{category} · Story preview</span><h3>{title}</h3><p>{copy}</p><small>{replies}</small></SiteLink>)}<p>To share a discussion with everyone, <a href="/signin-with-chatgpt?return_to=%2Fopen-field%2F%23new-thread">sign in with ChatGPT</a>.</p><h2 id="new-thread">Start a discussion</h2><form onSubmit={(event) => event.preventDefault()}><label htmlFor="category">Category</label><select id="category" defaultValue="Episode Discussions">{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select><label htmlFor="question">Your question</label><input id="question" placeholder="What are you wondering about?" /><label htmlFor="thought">Your thought</label><textarea id="thought" placeholder="Give the conversation somewhere to begin." /><button type="submit">Post discussion</button></form></div></section></main>;
}

function NotebookPage() {
  const categories = ['All notes', 'From the Episode', 'Questions Worth Asking', 'Field Notes', 'Behind Peacehold', 'The Long Read'];
  const [activeCategory, setActiveCategory] = useState('All notes');
  const entries = activeCategory === 'All notes' ? notebookEntries : notebookEntries.filter(([category]) => category === activeCategory);
  return <main className="notebook-page section-ivory"><section className="notebook-hero"><div><span className="eyebrow">The official JAS blog</span><h1>Black Sheep’s Notebook</h1><p>Notes, questions, observations, and inconvenient thoughts.</p><span className="notebook-note">Notes and questions from beyond the gate.</span></div><img src={localImage("public-portrait.webp")} alt="Realistic Black Sheep portrait" /></section><section className="notebook-articles" aria-label="Notebook articles"><div className="category-filter" role="group" aria-label="Filter articles by category">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="entry-list">{entries.map(([category, title, copy, slug]) => <SiteLink key={slug} href={`/notebook/${slug}`}><span>{category}</span><h2>{title}</h2><p>{copy}</p><small>Read entry · 2 min</small></SiteLink>)}</div><p>{entries.length} entries</p></section></main>;
}

function EpisodesPage() {
  return <main className="episodes-page section-dark"><section className="episodes-intro"><span className="eyebrow">The story archive</span><h1>100 Episodes.<br />10 Arcs.</h1><p>Start at the beginning or trace the growing questions. Episode pages appear here as their media is prepared.</p><SiteLink href="/episodes/001-voluntary-assembly" className="text-link">Start the story <span>↗</span></SiteLink></section><section className="arc-grid">{arcs.map(([number, range, title, copy, status]) => <article key={number}><span className="arc-label">Arc {number} · Episodes {range}</span><h2>{title}</h2><p>{copy}</p><strong>{status}</strong><div className="arc-episode-links"><SiteLink href={number === '01' ? '/episodes/001-voluntary-assembly' : '/episodes'}>{number === '01' ? 'Open Episode 001' : 'Open arc'} <span>↗</span></SiteLink>{number === '01' && <SiteLink href="/episodes/002-fear-of-art">Open Episode 002 <span>↗</span></SiteLink>}{number === '01' && <SiteLink href="/episodes/003-your-voice-matters">Open Episode 003 <span>↗</span></SiteLink>}{number === '01' && <SiteLink href="/episodes/004-consensus-is-not-a-compass">Open Episode 004 <span>↗</span></SiteLink>}</div></article>)}</section></main>;
}

function EpisodePage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 001</span><h1>Voluntary Assembly</h1><p>Every morning, Peacehold residents are called to the official assembly. The loudspeaker calls it voluntary. The guards ensure nobody stays away. Black Sheep notices the contradiction.</p><a href="#story" className="text-link">See the story <span>↓</span></a></section><section id="story" className="episode-feature"><div><span className="eyebrow">Resident record · 001</span><h2>Attend willingly.<br />Or attend unwillingly.</h2><p>Two routes lead to the assembly yard. Neither points home.</p><p>The six-frame visual story and accompanying song are now available. The episode video is pending release.</p><SiteLink href="/files" className="text-link">See the Black Sheep Files <span>↗</span></SiteLink></div><img src={localImage("voluntary.webp")} alt="Black Sheep at Peacehold's voluntary assembly with guards and residents" /></section><section className="episode-story-sequence" aria-labelledby="episode-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-story-title">A voluntary morning.</h2></div><div className="episode-meme-grid">{episodeOneMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 001 · Soundtrack</span><h2>It's Voluntary</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeOneAudio} aria-label="Play It's Voluntary, Episode 001 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">Core idea</span><h2>Choice, with conditions.</h2><p>Mandatory participation disguised as voluntary choice.</p></div><div><span className="eyebrow">What do you think?</span><h3>Can a choice still be voluntary when refusing it carries consequences?</h3><SiteLink href="/open-field/thread/?id=episode-001-voluntary" className="text-link">Join the discussion <span>↗</span></SiteLink></div></section><section className="episode-continue"><span className="eyebrow">Continue exploring</span><h2>The question does not end here.</h2><SiteLink href="/notebook/when-does-voluntary-stop-meaning-voluntary" className="text-link">Read Black Sheep’s Notebook <span>↗</span></SiteLink></section></main>;
}

function EpisodeTwoPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 002</span><h1>Fear of Art</h1><p>Black Sheep brings music into Peacehold’s workplace. Management calls it unauthorized productivity software; the flock hears rhythm, curiosity, and ideas.</p><a href="#episode-002-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 002</span><h2>Apparently joy isn’t compatible with the operating system.</h2><p>When music arrives on the production line, Peacehold measures everything except what it might reveal.</p><SiteLink href="/sounds" className="text-link">Listen to “Fear of Art” <span>↗</span></SiteLink></div><img src={localImage('episode-002-frame-01.png')} alt="Black Sheep plays music among workers as Peacehold labels it unauthorized productivity software" /></section><section id="episode-002-story" className="episode-story-sequence" aria-labelledby="episode-002-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-002-story-title">Unauthorized productivity software.</h2></div><div className="episode-meme-grid">{episodeTwoMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 002 · Soundtrack</span><h2>Fear of Art</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeTwoAudio} aria-label="Play Fear of Art, Episode 002 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">Core idea</span><h2>Creativity as a hazard.</h2><p>Peacehold calls music a threat when it makes room for independent thought.</p></div><div><span className="eyebrow">Continue through Arc 01</span><h3>One song is enough to challenge the rules.</h3><SiteLink href="/episodes/001-voluntary-assembly" className="text-link">Previous episode · 001 <span>↗</span></SiteLink></div></section><section className="episode-continue"><span className="eyebrow">Continue exploring</span><h2>Follow the questions.</h2><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></section></main>;
}

function EpisodeThreePage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 003</span><h1>Your Voice Matters</h1><p>Peacehold introduces ranked-choice voting. The slogans celebrate choice, but every ballot leads to the same approved answer. Black Sheep notices the missing option.</p><a href="#episode-003-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 003</span><h2>More choices.<br />Fewer possibilities.</h2><p>Every voice matters, provided it says yes.</p><p>The six-frame visual story is now available.</p></div><img src={localImage('episode-003-frame-01.png')} alt="Black Sheep questions Peacehold's two-box election ballot, where both choices mean yes" /></section><section id="episode-003-story" className="episode-story-sequence" aria-labelledby="episode-003-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-003-story-title">Your voice matters.</h2></div><div className="episode-meme-grid">{episodeThreeMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 003 · Soundtrack</span><h2>Bringing Chalk</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeThreeAudio} aria-label="Play Bringing Chalk, Episode 003 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>Can a choice be meaningful when one answer is forbidden?</h2><p>Peacehold says every voice matters. Look at the ballot, the tally, and the rules around the booth. What does the system allow people to say?</p><SiteLink href="/open-field" className="text-link">Take the question to the Open Field <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeFourPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 004</span><h1>Consensus Is Not a Compass</h1><p>Peacehold points in one approved direction and calls the crowd’s movement proof. Black Sheep wonders whether popularity can tell anyone where they should go.</p><a href="#episode-004-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 004</span><h2>Everyone is going this way.</h2><p>The crowd can show you its direction. It cannot choose your destination.</p><p>The six-frame visual story is now available.</p></div><img src={localImage('episode-004-frame-01.png')} alt="A guard points Black Sheep toward the crowd while Black Sheep questions whether consensus is a compass" /></section><section id="episode-004-story" className="episode-story-sequence" aria-labelledby="episode-004-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-004-story-title">Consensus is not a compass.</h2></div><div className="episode-meme-grid">{episodeFourMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 004 · Soundtrack</span><h2>Everyone Is Going This Way</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeFourAudio} aria-label="Play Everyone Is Going This Way, Episode 004 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>Does a popular direction make it the right destination?</h2><p>A crowd can tell you what most people are doing. It cannot answer what they should do, or where they want to end up.</p><SiteLink href="/open-field" className="text-link">Take the question to the Open Field <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeFivePage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 005</span><h1>Safety Concerns</h1><p>Peacehold says the fence keeps everyone safe, but never quite explains what it is keeping out. Black Sheep asks the question the flock has learned not to ask.</p><a href="#episode-005-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 005</span><h2>Fear works best when the threat stays undefined.</h2><p>More security, less transparency, and a threat level residents are asked to take on trust.</p><p>The six-frame visual story is now available.</p></div><img src={localImage('episode-005-frame-01.png')} alt="Peacehold's safety fence and Black Sheep questioning what the fence is keeping out" /></section><section id="episode-005-story" className="episode-story-sequence" aria-labelledby="episode-005-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-005-story-title">Safety, by Peacehold's definition.</h2></div><div className="episode-meme-grid">{episodeFiveMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 005 · Soundtrack</span><h2>Safe From What</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeFiveAudio} aria-label="Play Safe From What, Episode 005 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>Safety from what, and at what cost?</h2><p>When a threat cannot be named or examined, fear becomes a useful reason to keep every gate closed.</p></div></section></main>;
}

function EpisodeSixPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 006</span><h1>Open Gate Policy</h1><p>Peacehold promises freedom of movement, then puts it behind checkpoints, permits, temporary restrictions, and a single approved route. Black Sheep asks what an open gate means when access is still controlled.</p><a href="#episode-006-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 006</span><h2>Maximum freedom.<br />Minimum destinations.</h2><p>Every road but one is crossed out, and the locked gate is open in principle.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-006-frame-01.png')} alt="Black Sheep questions a barrier said to protect freedom, while a Peacehold guard blocks the way" /></section><section id="episode-006-story" className="episode-story-sequence" aria-labelledby="episode-006-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-006-story-title">Freedom, by authorization.</h2></div><div className="episode-meme-grid">{episodeSixMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 006 · Soundtrack</span><h2>Open Gate Policy</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeSixAudio} aria-label="Play Open Gate Policy, Episode 006 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>If freedom needs authorization, who decides when you’re free?</h2><p>A right that depends on permission can be suspended, narrowed, or rerouted by whoever controls the gate.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeSevenPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 007</span><h1>Terms and Conditions Apply</h1><p>Peacehold encourages independent thinking, provided it arrives at the approved conclusion. Black Sheep discovers that every idea is welcome until it asks the wrong question.</p><a href="#episode-007-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 007</span><h2>Think for yourself.<br />Terms and conditions apply.</h2><p>Original thoughts are encouraged. Standardized results are expected.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-007-frame-01.png')} alt="Peacehold announces that independent thinking is encouraged, while Black Sheep raises a hand to question the terms" /></section><section id="episode-007-story" className="episode-story-sequence" aria-labelledby="episode-007-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-007-story-title">Independent thinking, approved.</h2></div><div className="episode-meme-grid">{episodeSevenMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 007 · Soundtrack</span><h2>Terms and Conditions Apply</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeSevenAudio} aria-label="Play Terms and Conditions Apply, Episode 007 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>How independent is a thought when its conclusion is predetermined?</h2><p>A rule that welcomes every idea but screens out inconvenient questions is conformity with better branding.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeEightPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 008</span><h1>The Bell Department</h1><p>Peacehold’s morning bell is treated as essential infrastructure, even when residents ask for a little quiet or Black Sheep offers to fix it. The request is filed, reviewed, and left ringing.</p><a href="#episode-008-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 008</span><h2>Nothing says freedom like a mandatory sunrise.</h2><p>Resident feedback is welcome. The response time is eventually.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-008-frame-01.png')} alt="Black Sheep sits awake as the Peacehold bell rings at sunrise and residents jump from their beds" /></section><section id="episode-008-story" className="episode-story-sequence" aria-labelledby="episode-008-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-008-story-title">The Bell Department.</h2></div><div className="episode-meme-grid">{episodeEightMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 008 · Soundtrack</span><h2>The Bell Department</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeEightAudio} aria-label="Play The Bell Department, Episode 008 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>Who decides which routines are too essential to question?</h2><p>A system that treats every complaint as non-essential can keep the bell ringing forever.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeNinePage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 009</span><h1>Inside the Lines</h1><p>Peacehold proudly supports free speech, provided it stays in a designated zone, at an approved volume, and within carefully measured boundaries. Black Sheep wonders how free a voice can be when the lines do most of the talking.</p><a href="#episode-009-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 009</span><h2>Freedom that needs a boundary is usually describing the boundary.</h2><p>Unlimited expression. Limited occupancy.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-009-frame-01.png')} alt="Black Sheep and a Peacehold guard stand inside a designated free-speech area as a sign limits where liberty can go" /></section><section id="episode-009-story" className="episode-story-sequence" aria-labelledby="episode-009-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-009-story-title">Please keep all liberty inside the lines.</h2></div><div className="episode-meme-grid">{episodeNineMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 009 · Soundtrack</span><h2>Inside the Lines</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeNineAudio} aria-label="Play Inside the Lines, Episode 009 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>What does free speech mean when it is only allowed inside the approved lines?</h2><p>A boundary can protect a right, or quietly define how little of it is available.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeTenPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 01 · Episode 010</span><h1>Nothing of Value</h1><p>Peacehold insists there is nothing worth seeing beyond its fence, discourages curiosity, and publishes a map that leaves the outside blank. Then the lights come on, and Black Sheep sees a destination.</p><a href="#episode-010-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 010</span><h2>Nothing attracts attention faster than a warning against attention.</h2><p>The less evidence provided, the more interesting the claim becomes.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-010-frame-01.png')} alt="Black Sheep reads a warning that nothing of value exists beyond the boundary while a guard stands nearby" /></section><section id="episode-010-story" className="episode-story-sequence" aria-labelledby="episode-010-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-010-story-title">The world beyond the warning.</h2></div><div className="episode-meme-grid">{episodeTenMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 010 · Soundtrack</span><h2>Nothing of Value</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeTenAudio} aria-label="Play Nothing of Value, Episode 010 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>What becomes valuable when someone insists it is worth nothing?</h2><p>A warning against curiosity can turn the unknown into a destination.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeElevenPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 02 · Episode 011</span><h1>Keep Your Head Down</h1><p>Peacehold issues new behavioral guidance about posture, attention, and obedience. The instructions contradict one another, but the resident is still expected to get them right. Black Sheep follows the order literally and gives it a reason.</p><a href="#episode-011-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 011</span><h2>Instructions work better when they accidentally make sense.</h2><p>Keep your head down. Keep your eyes forward. Questioning is weakness.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-011-frame-01.png')} alt="Black Sheep points out Peacehold's keep-your-head-down guidance while a guard bends to examine the sign" /></section><section id="episode-011-story" className="episode-story-sequence" aria-labelledby="episode-011-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-011-story-title">Behavioral guidance, in practice.</h2></div><div className="episode-meme-grid">{episodeElevenMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 011 · Soundtrack</span><h2>Keep Your Head Down</h2><p>The song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeElevenAudio} aria-label="Play Keep Your Head Down, Episode 011 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>What happens when every instruction is followed, but the rules cannot agree?</h2><p>Contradictory orders keep residents focused on compliance instead of asking who wrote the rules.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeTwelvePage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 02 · Episode 012</span><h1>Ownership Survives the Edit</h1><p>Peacehold calls discarded materials its property, even after they hit the trash. Black Sheep turns scrap into a guitar, and the town discovers that useless things become valuable when someone else makes them useful.</p><a href="#episode-012-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 012</span><h2>Nothing wastes resources like protecting their uselessness.</h2><p>The guitar was trash until it made music.</p><p>The six-frame visual story and accompanying song are now available.</p></div><img src={localImage('episode-012-frame-01.png')} alt="Peacehold guard claims ownership of discarded materials while Black Sheep plays a handmade guitar from the trash" /></section><section id="episode-012-story" className="episode-story-sequence" aria-labelledby="episode-012-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-012-story-title">Ownership survives disposal.</h2></div><div className="episode-meme-grid">{episodeTwelveMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 012 · Soundtrack</span><h2>Ownership Survives the Edit</h2><p>The full song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeTwelveAudio} aria-label="Play Ownership Survives the Edit, Episode 012 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>Who owns something once it has been discarded, repaired, and made useful?</h2><p>Value appears; ownership returns. Peacehold's rules protect the claim more carefully than they protect the resources.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function EpisodeThirteenPage() {
  return <main className="episode-page section-dark"><section className="episode-intro"><span className="eyebrow">Arc 02 · Episode 013</span><h1>Temporary Lives Here</h1><p>Peacehold keeps extending its emergency restrictions, celebrating their anniversaries, and maintaining the signs better than the buildings. After enough generations, “temporary” stops describing the policy and starts describing the residents.</p><a href="#episode-013-story" className="text-link">See the story <span>↓</span></a></section><section className="episode-feature"><div><span className="eyebrow">Resident record · 013</span><h2>A permanent policy, 30 days at a time.</h2><p>Nothing lasts quite like an emergency with a maintenance budget.</p><p>The six-frame visual story and full song are now available.</p></div><img src={localImage('episode-013-frame-01.png')} alt="Black Sheep questions Peacehold's temporary emergency restrictions as an elderly sheep says the sign was already there when she was young" /></section><section id="episode-013-story" className="episode-story-sequence" aria-labelledby="episode-013-story-title"><div className="episode-story-heading"><span className="eyebrow">The visual story · 6 frames</span><h2 id="episode-013-story-title">When temporary becomes tradition.</h2></div><div className="episode-meme-grid">{episodeThirteenMemes.map(([image, title, caption], index) => <figure key={image}><img src={localImage(image)} alt={`${title}. ${caption}`} loading="lazy" /><figcaption><span>{String(index + 1).padStart(2, '0')} / 06</span><strong>{title}</strong><p>{caption}</p></figcaption></figure>)}</div></section><section className="episode-soundtrack"><div><span className="eyebrow">Episode 013 · Soundtrack</span><h2>Temporary Lives Here</h2><p>The full song accompanying this episode.</p></div><div className="audio-status"><audio controls preload="metadata" src={episodeThirteenAudio} aria-label="Play Temporary Lives Here, Episode 013 soundtrack">Audio playback is not supported in this browser.</audio></div></section><section className="episode-idea"><div><span className="eyebrow">The question underneath</span><h2>When does a temporary emergency become the permanent way of life?</h2><p>Repeated extensions make a policy feel ordinary while its emergency label stays intact.</p><SiteLink href="/episodes" className="text-link">Back to the episode archive <span>↗</span></SiteLink></div></section></main>;
}

function FilesPage() {
  const [episode, setEpisode] = useState('All episodes');
  const [arc, setArc] = useState('All arcs');
  const [theme, setTheme] = useState('All themes');
  const [sort, setSort] = useState('Newest');
  const [selectedFile, setSelectedFile] = useState(null);
  const filteredFiles = files.filter(([, , fileEpisode, fileTheme, fileThemeKey]) => (episode === 'All episodes' || fileEpisode === episode) && (arc === 'All arcs' || fileEpisode === arc) && (theme === 'All themes' || fileThemeKey === theme.toLowerCase()));
  return <main className="files-page section-dark"><section className="files-intro"><span className="eyebrow">The visual archive</span><h1>The Black Sheep Files</h1><p>A record of the things Peacehold would prefer everyone stop noticing.</p></section><section className="file-archive"><div className="file-filters"><label>Episode<select value={episode} onChange={(event) => setEpisode(event.target.value)}><option>All episodes</option><option>Episode 001</option><option>Uncatalogued records</option></select></label><label>Arc<select value={arc} onChange={(event) => setArc(event.target.value)}><option>All arcs</option><option>Arc 01</option><option>Arc 06</option><option>Arc 08</option></select></label><label>Theme<select value={theme} onChange={(event) => setTheme(event.target.value)}><option>All themes</option>{['Choice', 'Freedom', 'Authority', 'Truth', 'Speech', 'Censorship', 'Control', 'Fear', 'Belonging'].map((item) => <option key={item}>{item}</option>)}</select></label><div><button type="button" className={sort === 'Newest' ? 'active' : ''} onClick={() => setSort('Newest')}>Newest</button><button type="button" className={sort === 'Popular picks' ? 'active' : ''} onClick={() => setSort('Popular picks')}>Popular picks</button></div></div><p className="file-count">{filteredFiles.length} records</p><div className="file-grid">{filteredFiles.map(([image, title, fileEpisode, fileTheme]) => <button type="button" key={title} onClick={() => setSelectedFile({ image, title, fileEpisode, fileTheme })}><img src={localImage(image)} alt={`${title} visual story piece`} /><span>{fileEpisode} · {fileTheme}</span><strong>{title}</strong><small>Open file</small></button>)}</div><p className="section-note">Some archive records remain uncatalogued.</p></section>{selectedFile && <div className="file-modal" role="dialog" aria-modal="true"><button type="button" className="modal-close" onClick={() => setSelectedFile(null)}>Close ×</button><img src={localImage(selectedFile.image)} alt={`${selectedFile.title} visual story piece`} /><span>{selectedFile.fileEpisode} · {selectedFile.fileTheme}</span><h2>{selectedFile.title}</h2><p>Full visual record preserved in the Black Sheep Files.</p></div>}</main>;
}

function CharacterDetailPage({ id }) {
  const character = characters.find((item) => item.id === id) || characters[0];
  return <main className="character-detail-page section-dark"><SiteLink href="/meet-the-flock" className="back-link">← Meet the Flock</SiteLink><section className="character-detail-intro"><h1>{character.name}</h1><p>{character.name === 'Black Sheep' ? 'Resident classification: Difficult. Occupation: Asking questions. Known for noticing what everyone else stopped noticing.' : character.description}</p></section><section className="character-record"><img src={characterImageUrl(character.image)} alt={`${character.name} in Peacehold`} /><div><span className="eyebrow">{character.classification}</span><h2>On the record.</h2><p>{character.description}</p><p>{character.collective ? 'Status: General Population. Known for: Following the rules everyone else is following.' : `Status: ${character.name === 'Shepherd' ? 'Administrator' : 'Peacehold resident'}. Known for: ${character.description}`}</p><SiteLink href={character.collective ? '/episodes/001-voluntary-assembly' : '/files'} className="text-link">{character.collective ? 'Start the story' : 'Open the Files'} <span>↗</span></SiteLink></div></section></main>;
}

function NotebookEntryPage({ slug }) {
  const entry = notebookEntries.find((item) => item[3] === slug) || notebookEntries[0];
  const isFirstEntry = entry[3] === 'when-does-voluntary-stop-meaning-voluntary';
  return <main className="notebook-entry-page section-ivory"><SiteLink href="/notebook" className="back-link">← Back to the Notebook</SiteLink><section className="entry-intro"><span className="eyebrow">{entry[0]}</span><h1>{entry[1]}</h1><p>{entry[2]}</p><small>Black Sheep’s Notebook · 2 min read</small></section><article className="entry-body"><h2>{isFirstEntry ? 'The word on the sign' : 'The question beneath the notice'}</h2><p>{isFirstEntry ? 'At Peacehold, attendance is voluntary. The guards at the gate can explain exactly how voluntary. They even have a second route for residents who prefer to arrive under escort.' : entry[2]}</p><blockquote>{isFirstEntry ? 'A real choice leaves room for refusal.' : 'A useful question is often the one the sign did not anticipate.'}</blockquote><h2>{isFirstEntry ? 'The cost of no' : 'What the answer costs'}</h2><p>{isFirstEntry ? 'A real choice leaves room for refusal. If “no” triggers a penalty, a public mark against your name, or a quiet visit from security, the language of choice is doing more work than the choice itself.' : 'The label may explain the routine, but it does not settle the question. Look closely at who benefits from the answer and who is expected to accept it.'}</p><h2>{isFirstEntry ? 'A useful question' : 'Keep questioning'}</h2><p>{isFirstEntry ? 'Before accepting a policy described as optional, Black Sheep would ask: What happens to someone who declines? The answer says more than the label.' : 'Before accepting a reassuring explanation, ask what it leaves out. The missing detail may be the part worth following.'}</p><section className="entry-follow"><span className="eyebrow">Keep questioning</span><h2>What do you think?</h2><p>Read another note or return to Black Sheep’s story.</p><SiteLink href="/notebook" className="text-link">More from the Notebook <span>↗</span></SiteLink><SiteLink href="/open-field/thread/?id=episode-001-voluntary" className="text-link">The Open Field discussion <span>↗</span></SiteLink></section></article></main>;
}

function ThreadPage() {
  const params = new URLSearchParams(window.location.search);
  const thread = forumThreads.find((item) => item[4] === params.get('id')) || forumThreads[0];
  return <main className="thread-page section-ivory"><SiteLink href="/open-field" className="back-link">← All discussions</SiteLink><section className="thread-intro"><span className="eyebrow">{thread[0]}</span><h1>{thread[1]}</h1><p>{thread[2]}</p><small>Sign in to share a reply. Older drafts remain on this device.</small></section><section className="replies"><h2>Conversation</h2><article><strong>Peacehold Reader</strong><span>Opening question · Story preview</span><p>{thread[2]}</p><button type="button">Hide on this device</button><button type="button">Report</button></article><article><strong>Resident 014</strong><span>Reply · Story preview</span><p>Perhaps the test is whether refusing changes how a resident is treated afterward.</p><button type="button">Hide on this device</button><button type="button">Report</button></article></section><form className="reply-form" onSubmit={(event) => event.preventDefault()}><h2>Add your thought</h2><label htmlFor="reply">Reply</label><textarea id="reply" placeholder="Challenge ideas. Don’t attack people." /><button type="submit">Post reply</button></form><SiteLink href="/open-field" className="text-link">More discussions <span>↗</span></SiteLink></main>;
}

function CharacterCard({ character, wide = false }) {
  return <article className={`character-card${wide ? ' character-card-wide' : ''}`}>
    <img src={characterImageUrl(character.image)} alt={`${character.name} in Peacehold`} style={{ objectPosition: character.imagePosition }} />
    <span>{character.classification}</span>
    <h3>{character.name}</h3>
    {character.subtitle && <strong>{character.subtitle}</strong>}
    <p>{character.description}</p>
    <SiteLink href={`/meet-the-flock/${character.id}`}>{character.collective ? 'View population record' : 'Open record'} <span>↗</span></SiteLink>
  </article>;
}

function HomePage() {
  return <>
    <main>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content">
          <p className="eyebrow">A story from Peacehold Farm</p>
          <h1>Just<br />Another<br />Sheep.</h1>
          <p className="hero-deck">Everybody follows something.</p>
          <div className="hero-actions"><SiteLink href="/episodes/001-voluntary-assembly">Start the story <span>↗</span></SiteLink><SiteLink href="/episodes/001-voluntary-assembly">Watch latest episode <span>↗</span></SiteLink></div>
        </div>
      </section>
      <div className="ticker"><span>Attendance is completely voluntary ✦ You are free to attend willingly or unwillingly ✦</span><span>Attendance is completely voluntary ✦ You are free to attend willingly or unwillingly ✦</span></div>

      <section className="welcome section-dark">
        <div><span className="eyebrow">Welcome to Peacehold</span><h2>Everything is fine.<br />It says so on the sign.</h2></div>
        <div className="welcome-copy"><p>Peacehold Farm has a rule for everything, a reassuring explanation for every rule, and a guard nearby in case you need help agreeing.</p><p>Black Sheep starts with the obvious questions. The answers reveal a world where language can be bent, choices can be staged, and “stability” has a very particular meaning.</p><p>Follow the satire one scene at a time. Each image stands on its own; together they tell a larger story about freedom, conformity, and the nerve to think for yourself.</p></div>
        <div className="welcome-images"><img src={localImage("voluntary.webp")} alt="Black Sheep faces Peacehold guards beneath a notice about voluntary attendance" /><img src={localImage("gate.webp")} alt="Black Sheep studies the mechanism at Peacehold's main gate" /></div>
      </section>

      <section className="trail section-ivory"><SectionHeading eyebrow="The latest from the archive" title="Follow the thread." >Watch, read, listen, and join the conversation. Each trail leads deeper into Peacehold.</SectionHeading><div className="trail-grid"><article className="feature-card"><img src={localImage("voluntary.webp")} alt="Black Sheep between Peacehold guards at assembly" /><span>Latest · Episode 001</span><h3>Voluntary Assembly</h3><p>Attendance is optional. The guards can show you both options.</p><SiteLink href="/episodes/001-voluntary-assembly">Start the story <span>→</span></SiteLink></article><div className="trail-stack"><article><span>Latest Black Sheep File</span><h3>Dangerous Questions</h3><SiteLink href="/files">Open file <span>→</span></SiteLink></article><article><span>Latest Notebook entry</span><h3>When Does “Voluntary” Stop Meaning Voluntary?</h3><SiteLink href="/notebook/when-does-voluntary-stop-meaning-voluntary">Read entry <span>→</span></SiteLink></article></div></div></section>

      <section className="dispatches section-dark"><SectionHeading eyebrow="From the story" title="Dispatches from Peacehold">A first look at the rules, the questions, and the people who keep this place running.</SectionHeading><div className="dispatch-grid">{dispatches.map(([image, eyebrow, title, copy]) => <SiteLink key={title} href="/files" className="dispatch-card"><img src={localImage(image)} alt={title} /><span>{eyebrow}</span><h3>{title}</h3><p>{copy}</p></SiteLink>)}</div><p className="section-note">Open a dispatch to see the full file.</p></section>

      <section className="cast section-ivory"><SectionHeading eyebrow="The people of Peacehold" title="Meet the cast">Every good system needs its believers, its enforcers, and someone willing to ask the wrong question.</SectionHeading><div className="cast-grid">{characters.filter((character) => !character.collective).map((character) => <CharacterCard key={character.id} character={character} />)}</div><SiteLink href="/meet-the-flock" className="text-link">Meet the Flock <span>↗</span></SiteLink></section>

      <section className="notebook section-ivory"><div><span className="eyebrow">Black Sheep’s Notebook · From beyond the gate</span><h2>Some thoughts don’t fit on the notice board.</h2><p>Notes, questions, observations, and inconvenient thoughts from beyond the gate.</p><SiteLink href="/notebook" className="text-link">Read the Notebook <span>↗</span></SiteLink></div><div className="notebook-entry"><span>From the Episode</span><h3>When Does “Voluntary” Stop Meaning Voluntary?</h3><p>A choice with consequences for saying no may be a decision in form only.</p><SiteLink href="/notebook/when-does-voluntary-stop-meaning-voluntary" className="text-link">Read entry <span>↗</span></SiteLink></div></section>

      <section className="quote section-dark"><img src={localImage("public-portrait.webp")} alt="Photographic portrait of Black Sheep" /><div><span className="eyebrow">Just Another Sheep</span><blockquote>When the answer is already decided,<br /><em>ask a better question.</em></blockquote></div></section>
      <section className="open-field section-red"><span className="eyebrow">The Open Field</span><h2>A question is better<br />when it travels.</h2><p>Where questions are allowed. Challenge ideas. Don’t attack people.</p><SiteLink href="/open-field" className="text-link">Join the discussion <span>↗</span></SiteLink></section>
      <section className="join section-tan"><span className="eyebrow">Join the Flock</span><h2>Don’t miss the<br />next question.</h2><p>New episodes. New files. New questions.</p><form onSubmit={(event) => event.preventDefault()}><label htmlFor="email">Email address</label><div><input id="email" type="email" placeholder="Your email address" /><button type="submit">Join the Flock <span>↗</span></button></div></form><small>Signups are open. Email updates are not yet being sent.</small></section>
    </main>
    <Footer />
  </>;
}

function RouteSkeleton({ path }) {
  return <main className="route-skeleton section-ivory"><span className="eyebrow">Migration checkpoint</span><h1>{path === '/start-here' ? 'Start Here' : 'This route is next.'}</h1><p>The route is reserved in the source tree. Its published content will be migrated after homepage visual approval.</p><SiteLink href="/" className="text-link">Return home <span>↗</span></SiteLink></main>;
}

function MeetTheFlockPage() {
  return <main className="meet-flock-page section-dark"><div className="meet-flock-intro"><span className="eyebrow">The people of Peacehold</span><h1>Meet the Cast</h1><p>Every good system needs its believers, its enforcers, and someone willing to ask the wrong question.</p></div><div className="character-grid">{characters.map((character) => <CharacterCard key={character.id} character={character} wide={character.collective} />)}</div></main>;
}

function Footer() { return <footer className="site-footer"><SiteLink href="/" className="wordmark">JUST ANOTHER SHEEP</SiteLink><div><SiteLink href="/episodes">Episodes</SiteLink><SiteLink href="/files">The Black Sheep Files</SiteLink><SiteLink href="/notebook">Black Sheep’s Notebook</SiteLink><SiteLink href="/open-field">The Open Field</SiteLink><SiteLink href="/start-here">Explore</SiteLink></div><p>© 2026 Just Another Sheep. Question everything.</p></footer>; }

function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, '') || '/');
  const [menuOpen, setMenuOpen] = useState(false);
  window.onpopstate = () => setPath(window.location.pathname.replace(/\/$/, '') || '/');
  const page = path === '/' ? <HomePage /> : path === '/meet-the-flock' ? <MeetTheFlockPage /> : path.startsWith('/meet-the-flock/') ? <CharacterDetailPage id={path.split('/').pop()} /> : path === '/start-here' ? <StartHerePage /> : path === '/about' ? <AboutPage /> : path === '/watch' ? <WatchPage /> : path === '/sounds' ? <SoundsPage /> : path === '/peacehold' ? <PeaceholdPage /> : path === '/open-field' ? <OpenFieldPage /> : path === '/open-field/thread' ? <ThreadPage /> : path === '/notebook' ? <NotebookPage /> : path.startsWith('/notebook/') ? <NotebookEntryPage slug={path.split('/').pop()} /> : path === '/episodes' ? <EpisodesPage /> : path === '/episodes/001-voluntary-assembly' ? <EpisodePage /> : path === '/episodes/002-fear-of-art' ? <EpisodeTwoPage /> : path === '/episodes/003-your-voice-matters' ? <EpisodeThreePage /> : path === '/episodes/004-consensus-is-not-a-compass' ? <EpisodeFourPage /> : path === '/episodes/005-safety-concerns' ? <EpisodeFivePage /> : path === '/episodes/006-open-gate-policy' ? <EpisodeSixPage /> : path === '/episodes/007-terms-and-conditions-apply' ? <EpisodeSevenPage /> : path === '/episodes/008-the-bell-department' ? <EpisodeEightPage /> : path === '/episodes/009-inside-the-lines' ? <EpisodeNinePage /> : path === '/episodes/010-nothing-of-value' ? <EpisodeTenPage /> : path === '/episodes/011-keep-your-head-down' ? <EpisodeElevenPage /> : path === '/episodes/012-ownership-survives-the-edit' ? <EpisodeTwelvePage /> : path === '/episodes/013-temporary-lives-here' ? <EpisodeThirteenPage /> : path === '/files' || path === '/black-sheep-files' ? <FilesPage /> : <RouteSkeleton path={path} />;
  return <><Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />{page}</>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);