import { useState } from 'react';
import { buy, CreditCard, CreditsPill, DailyBonus, formatCredits, inflation, ITEMS, priceOf, residentNumber, useCredits } from '../credits';
import './store.css';

/* Der Peacehold Store: sinnlose Waren für sinnloses Geld. Die Preise
   steigen mit jedem verdienten Credit, und geliefert wird nie etwas. */

export default function StorePage() {
  const credits = useCredits();
  const [resident] = useState(residentNumber);
  const [messages, setMessages] = useState({});
  const rise = Math.round((inflation(credits) - 1) * 100);
  const owned = ITEMS.filter((item) => credits.owned[item.id]);

  return (
    <main className="store-page">
      <section className="store-hero">
        <div>
          <p className="store-kicker">Peacehold Store</p>
          <h1>Treat yourself.<br />You’ve complied.</h1>
          <p>Spend your Compliance Credits on approved items. Prices adjusted for your convenience.</p>
          <DailyBonus />
          {rise > 0 && <p className="store-inflation">Prices have risen {rise}% since your arrival. This is normal.</p>}
        </div>
        <CreditCard resident={resident} />
      </section>

      <section className="store-grid" aria-label="Approved items">
        {ITEMS.map((item) => (
          <article key={item.id} className={`store-item${item.soldOut ? ' is-sold-out' : ''}`}>
            <span className="store-icon" aria-hidden="true">{item.icon}</span>
            <h2>{item.name}</h2>
            <p>{item.note}</p>
            <div className="store-buy">
              <strong>{formatCredits(priceOf(item, credits))} CC</strong>
              <button type="button" onClick={() => setMessages((current) => ({ ...current, [item.id]: buy(item) }))}>{item.soldOut ? 'Out of stock' : 'Buy'}</button>
            </div>
            {credits.owned[item.id] ? <small className="store-owned">Owned × {credits.owned[item.id]}</small> : null}
            {messages[item.id] && <p className="store-message" role="status">{messages[item.id]}</p>}
          </article>
        ))}
      </section>

      <section className="store-deliveries">
        <h2>Your deliveries</h2>
        {owned.length === 0
          ? <p>You haven’t bought anything yet. Your future purchases will not be delivered either.</p>
          : <ul>{owned.map((item) => <li key={item.id}><span>{item.icon} {item.name} × {credits.owned[item.id]}</span><em>Not delivered</em></li>)}</ul>}
        <p className="store-sheep">What are they for?</p>
        <p className="store-print">Compliance Credits have no value outside Peacehold. Or inside it. Credits cannot be exchanged, transferred or withdrawn. Peacehold may adjust, freeze or remove credits at any time, for your safety.</p>
      </section>
      <CreditsPill />
    </main>
  );
}
