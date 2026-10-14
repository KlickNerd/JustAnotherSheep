import { useEffect, useState, useSyncExternalStore } from 'react';
import { SiteLink } from './router';
import './credits.css';

/* Compliance Credits: Peaceholds Systemgeld. Aus dem Nichts ausgegeben,
   nur innerhalb von Peacehold etwas wert, mit Inflation, Schulden und
   Käufen, die nie geliefert werden. Gespeichert wird alles nur im
   Browser des Besuchers. Die Credits werden nie in etwas Echtes
   umtauschbar sein, genau darin liegt die Pointe. */

const KEY = 'jas-credits';
const DAY = 86400000;
const listeners = new Set();

function fresh() {
  return { balance: 0, earned: 0, once: {}, streak: 0, lastDay: null, owned: {}, resident: null, event: null };
}

function load() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY));
    return stored ? { ...fresh(), ...stored, event: null } : fresh();
  } catch {
    return fresh();
  }
}

let state = load();
let eventId = 0;

function save(next) {
  state = next;
  try {
    const { event, ...persisted } = next; // eslint-disable-line no-unused-vars
    window.localStorage.setItem(KEY, JSON.stringify(persisted));
  } catch { /* privater Modus o. Ä. */ }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCredits() {
  return useSyncExternalStore(subscribe, () => state);
}

/* Gutschrift oder Gebühr. Einmalige Anlässe zählen pro Besucher nur einmal. */
export function award(key, amount, label, { once = true } = {}) {
  if (once && state.once[key]) return false;
  eventId += 1;
  save({
    ...state,
    balance: state.balance + amount,
    earned: state.earned + Math.max(0, amount),
    once: once ? { ...state.once, [key]: true } : state.once,
    event: { id: eventId, amount, label },
  });
  return true;
}

/* Die Nummer ist, wie Peacehold verspricht, dauerhaft */
export function residentNumber() {
  if (!state.resident) {
    save({ ...state, resident: 48213 + Math.floor((Date.now() - 1792000000000) / 90000) });
  }
  return state.resident;
}

function localDay(time = Date.now()) {
  const date = new Date(time);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function dailyClaimed() {
  return state.lastDay === localDay();
}

export function claimDaily() {
  if (dailyClaimed()) return false;
  const streak = state.lastDay === localDay(Date.now() - DAY) ? state.streak + 1 : 1;
  const amount = Math.min(20 + (streak - 1) * 5, 50);
  eventId += 1;
  save({
    ...state,
    balance: state.balance + amount,
    earned: state.earned + amount,
    streak,
    lastDay: localDay(),
    event: { id: eventId, amount, label: `Attendance bonus · Day ${streak}` },
  });
  return true;
}

export const ITEMS = [
  { id: 'grass', icon: '🌱', name: 'Premium Grass', note: 'The same grass. But premium.', base: 30 },
  { id: 'freetime', icon: '⏱', name: '30 extra seconds of free time', note: 'Supervised.', base: 50 },
  { id: 'pen7', icon: '🏠', name: 'Upgrade to Pen 7', note: 'You are already in Pen 7.', base: 80 },
  { id: 'question', icon: '❓', name: 'Permission to ask one question', note: 'Question not included.', base: 120 },
  { id: 'badge', icon: '🎖', name: 'Good Resident Badge', note: 'Shown next to your name. You don’t have a name.', base: 150, delivered: 'Badge awarded. Nobody can see it.' },
  { id: 'golden', icon: '🏷', name: 'Golden Ear Tag', note: 'Your number. But gold.', base: 200, delivered: 'Your ear tag is now gold. Nothing else has changed.' },
  { id: 'wolfskip', icon: '🐺', name: 'Skip the wolf news', note: 'Very popular.', base: 60, soldOut: true },
  { id: 'gatekey', icon: '🔑', name: 'Gate key', note: 'The gate is always open.', base: 500, soldOut: true },
];

/* Inflation: Die Preise steigen genau so schnell, wie man verdient,
   und jedes gekaufte Stück wird teurer */
export function inflation(credits = state) {
  return 1 + credits.earned / 250;
}

export function priceOf(item, credits = state) {
  return Math.round(item.base * inflation(credits) * 1.5 ** (credits.owned[item.id] || 0));
}

export function buy(item) {
  if (item.soldOut) return 'Out of stock. Thank you for your patience.';
  const price = priceOf(item);
  const loan = state.balance < price;
  eventId += 1;
  save({
    ...state,
    balance: state.balance - price,
    owned: { ...state.owned, [item.id]: (state.owned[item.id] || 0) + 1 },
    event: { id: eventId, amount: -price, label: item.name },
  });
  const delivered = item.delivered || 'Nothing has been delivered.';
  return loan
    ? `A Peacehold loan has been approved for you. Thank you for your purchase. ${delivered}`
    : `Thank you for your purchase. ${delivered}`;
}

export function formatCredits(value) {
  return `${value < 0 ? '−' : ''}${Math.abs(value).toLocaleString('en-US')}`;
}

/* Der Zähler unten rechts mit den aufsteigenden Gutschriften */
export function CreditsPill({ dark = false }) {
  const credits = useCredits();
  const [pop, setPop] = useState(null);
  useEffect(() => {
    if (!credits.event) return undefined;
    setPop(credits.event);
    const timer = window.setTimeout(() => setPop(null), 2600);
    return () => window.clearTimeout(timer);
  }, [credits.event]);

  return (
    <div className={`credits-pill-wrap${dark ? ' is-dark' : ''}`}>
      {pop && (
        <span key={pop.id} className={`credit-pop${pop.amount < 0 ? ' is-fee' : ''}`} role="status">
          <strong>{pop.amount >= 0 ? '+' : ''}{formatCredits(pop.amount)}</strong> {pop.label}
        </span>
      )}
      <SiteLink href="/store" className={`credits-pill${credits.balance < 0 ? ' is-debt' : ''}`} aria-label={`Compliance Credits: ${credits.balance}. Open the Peacehold Store`}>
        <i aria-hidden="true">◉</i>
        <strong>{formatCredits(credits.balance)}</strong>
        <span>CC</span>
        {credits.owned.badge ? <em aria-hidden="true">🎖</em> : null}
      </SiteLink>
    </div>
  );
}

/* Die Karte von Peacehold: Kontostand und das Kleingedruckte */
export function CreditCard({ resident }) {
  const credits = useCredits();
  return (
    <div className="credit-card-wrap">
    <div className={`credit-card${credits.owned.golden ? ' is-golden' : ''}`}>
      <div className="credit-card-top"><span>Peacehold</span><i aria-hidden="true" /></div>
      <p className="credit-card-label">Compliance Credits</p>
      <p className={`credit-card-balance${credits.balance < 0 ? ' is-debt' : ''}`}>{formatCredits(credits.balance)} <small>CC</small></p>
      {credits.balance < 0 && <p className="credit-card-debt">You owe Peacehold. Peacehold thanks you.</p>}
      <div className="credit-card-bottom"><span>Resident #{(resident || 0).toLocaleString('en-US')}</span><span>Valid forever</span></div>
    </div>
      <ul className="credit-card-print">
        <li>Issued by the Shepherd. Backed by the Shepherd.</li>
        <li>Spendable on approved items only.</li>
        <li>May be frozen at any time, for your safety.</li>
      </ul>
    </div>
  );
}

export function DailyBonus() {
  const credits = useCredits();
  const claimed = credits.lastDay && dailyClaimed();
  return claimed
    ? <p className="daily-bonus is-claimed">Attendance recorded · Day {credits.streak} streak. Come back tomorrow. You will.</p>
    : <button type="button" className="daily-bonus" onClick={claimDaily}>Claim attendance bonus <strong>+{Math.min(20 + (credits.lastDay === localDay(Date.now() - DAY) ? credits.streak : 0) * 5, 50)} CC</strong></button>;
}
