# PEACEHOLD — Product Vision & Game Design
Version 2.1 · 17 October 2026 · Source of truth for design and implementation

## North star
**PEACEHOLD is a satirical, persistent mobile-first farm-building game with short skill-based minigames, classic browser-RPG progression, and a multiplayer society that shapes an ongoing JustAnotherSheep animated story.**

**Core promise:** Players arrive for enjoyable building and minigames; they stay to compete, organize and influence an evolving world. An engaging standalone game is mandatory even if no videos are released.

## Why this exists / distinctive approach
JustAnotherSheep already publishes recurring short-form animated content about PEACEHOLD, the Shepherd, the guard dog, the black Sheep protagonist and other citizens. In-game events can arise from published videos; players act on those events and community outcomes can influence later canonical videos. Characters or notable players may (with consent and moderation) appear in future episodes. This **video → game event → community decision → next video** loop is a distinctive combination, **not a claim to be the world's first interactive narrative game**. Inspirations/precedents include *The Walking Dead: Last Mile* and *Rival Peak*. Do not rely on content frequency alone as a retention strategy.

## Three equally important gameplay pillars
1. **Build & play** — Visual, customizable stall/farm plot, buildings, upgrading and crafting/production; short replayable minigames.
2. **Personal progression & competition** — Timed jobs, Grass/Wool/Coins/Energy/XP, level, skills, gear, trading, rankings, fair PvP.
3. **Society & politics** — Guild-like herds, loyalist/underground/merchant pathways, reputation, elections, policy effects, faction missions, player-driven events.

**Experience:** welcoming pastoral aesthetic that conceals absurd bureaucracy, watchtowers and surveillance. Humor and consequences, not partisan preaching.

## Loop
Collect limited offline output → play optional minigame or run timed jobs → earn resources and XP → purchase upgrades that visibly change the plot and measurably improve output, risk or abilities → trade / compete / contribute to herd or policy → unlock new content and long-term goals → return later.
Each activity must offer a tangible outcome, each upgrade must change something visible and/or mechanical. Provide a meaningful session at 2, 5, 10 or 15+ minutes. No forced minigames for strategy-oriented players.

## Starting experience and goals
Player starts as a *customizable ordinary white sheep* living in a shabby stall. Canonical **black Sheep is a narrative character and game guide, not every player's avatar**. Main early arc: a first job, first skill choice, first visual stall upgrade, first challenge, then discovery of The Open Gate and loyalty/resistance opportunities. Onboarding target 0–60 min (design target, requires playtests).
Persistent long-term aspirations: Wealthiest Sheep (economy), Most Powerful Sheep (office/elections), Legendary Rebel (underground/revolution), plus seasonal rankings and achievements. No permanent ending. Tentative seasons of 8–12 weeks; reset offices/seasonal competitions, not character development or valued purchases.

## Economy and progression
- **Grass**: common farming/building input. **Wool**: production/trade/taxable good. **Coins**: common currency. **Energy**: timed-action limiter. **XP/Level**: unlocks progression.
- Distinct **Influence**, **Reputation** (faction or public standing), **Awareness** (reveals information/actions), and **Suspicion** (administrative attention and clandestine risks). High Awareness is not an automatic universal bonus. Neither Coins nor XP automatically grants votes.
- Skills: Grit (physical contest), Charm (persuasion), Sneak (covert operations), Wit (logic/debate), Endurance (effort). Training must affect gameplay probabilities/economy and be explainable.
- Jobs vary in duration, energy, risk, rewards and faction consequences. Short jobs to check in, long jobs for planned return.
- Buildings: shabby stall → visually upgraded living space → production stations, storage and customization; passive output capped, predictable and readable.
- Trading and item/equipment systems are follow-on features. Prevent runaway wealth gaps and exploit economies; production must be server-authoritative when multiplayer is enabled.

## Minigames (proposals, not all committed to MVP)
- **Don't Wake the Dog** (PRIMARY vertical-slice candidate): quick stealth run; avoid guard dog's patrol/searchlight, collect forbidden supplies, a clear risk/reward loop. Duration ~30–90s, mobile-touch accessible.
- **Wool Rush**: 30-second timing/shearing game, avoid dangerous targets.
- **Fence Jumper**: timing/reflex obstacle run, score and daily leaderboard.
Minigames reward game progression but should not pay-to-win or become mandatory. Skill gameplay balanced with accessible alternative jobs.

## Society
- Players may follow administration (Loyalist), covertly organize (The Open Gate), and/or focus on commerce (Merchant). **Not locked classes**; reputation and actions define access and consequences. Dual allegiance can be strategically possible with appropriate risk.
- Herds: shared resources, coordinated missions, member roles, optional rivalry; guild-like social hub.
- Farm Council and bounded political offices; time-limited mandates; eligibility and campaigning through play. All verified active players get one baseline vote. Financial Influence may fund campaigns or unlock political actions but must not buy unlimited extra votes.
- Weekly (tentative) policy events: e.g. 10% → 15% Wool Tax proposal, with meaningful, bounded and temporary effects on jobs/trade/gameworld. Prevent griefing and power monopolies. Provide safeguards for new players.
- PvP paths: wool raid (limited loot), debate duel (reputation), market contest, farm challenge and political scandal. Match fairly, protect baseline supplies, cap repeated attacks; no permanent destruction or level loss.

## Living World content flywheel (critical design decision)
1. Publish an official animated PEACEHOLD social video (TikTok / Instagram / X), e.g. Shepherd announces a new tax.
2. **Event Engine** activates an associated quest, vote, mission, environmental change or limited-time minigame inside the game.
3. Players choose sides and collective results are tallied through server-validated actions. Clear event start/end, anti-bot checks and auditability.
4. Creators use outcome as input to the **next** official episode, within preauthored narrative branches and realistic production capacity.
5. Reflect result in the world and preserve a readable **Chronicle / History** of canonical developments.

**Important:** Videos can be daily but events do not need to be daily; avoid burnout and production bottlenecks. Tell players which choices matter and when results become canon. Creative team retains moderation/editorial controls. Player appearances in videos require permission and safety review.

**Game Master Dashboard:** mobile-friendly admin interface to schedule events; attach a video/post; specify narrative text, start/end, actions, eligibility, branching choices, reward tables and game modifiers; preview, publish, pause, rollback; inspect logs and participation. Implement only after the first gameplay slice proves fun. Admin access strictly authenticated, with server-side authorization.

## Art & interface direction (approved references)
Cinematic, premium hand-painted/semi-realistic anime/cartoon hybrid; warm muted farm palette; detailed farm town and characters; wood, brass/gold trims and parchment game panels. Never generic gradient website with five floating hotspots, simplistic CSS barns, chibi graphics, glossy 3D or neon cyberpunk. Satirical idyll: central Bell Tower, Shepherd, dog, fences, barns, surveillance, white citizens and iconic black Sheep.
Mobile-first game HUD: avatar/level/XP, resources, Energy, Awareness and Suspicion; rich tactile navigation; clear tap zones and readable typography. Major screens: **Farm** (living hub + owned plot), **Jobs** (illustrated job board), **Sheep** (character & attributes/equipment), **Herd** (members, treasury, missions, rivalry), **Society** (votes/policy; may become a secondary destination). PvP dedicated section as it matures. Approved four UI reference screenshots are the visual target, not the older website artwork reused in the first prototype.
**Crucial:** assets depicting HUD are not sufficient for functioning UI; artwork should be independently positioned behind real responsive controls.

## Technical baseline and delivery constraints
Existing website repo: `KlickNerd/JustAnotherSheep`, Cloudflare Workers asset deployment from a Vite-built site. Current local-only HTML demo lives at `public/peacehold-game/index.html`; deployed URL `https://justanothersheep.klicknerds.workers.dev/peacehold-game/`. Save key `peacehold-mobile-v1`; avoid corrupting old saves. Current demo has tabs/jobs/stats/skill training/stall upgrade/fake society vote/herd join. **This is a prototype, not true online multiplayer.** The live main website must remain unaffected.
Engineering direction: component-based client eventually; responsive canvas/2D rendering as needed for minigames and interactive plot; authoritative backend, persistent accounts/state, transactional resources, rate limiting, anti-cheat, event CMS/admin auth, analytics and observability. Deploy incrementally, test mobile Safari and performance/low bandwidth. Separate test/staging and production; never claim a commit is live before checking deployment.

## Next milestone: a high-quality VERTICAL SLICE, not feature sprawl
Implement and playtest this **small complete experience**:
1. A rich visual **personal stall/plot** with at least 3 visually distinct upgrade states and a visible payoff (e.g. storage/production).
2. Real resource + XP progression: harvest/collect, one timed job, energy, clear affordable upgrade, persistent state, meaningful unlock.
3. One polished playable **Don't Wake the Dog** touch minigame (clear start, input, success/failure, score, reward and replay).
4. One limited **living-world event**: Shepherd announces wool tax, two competing actions, visible progress and outcome; initially a clearly labeled local demo or seeded simulation, not fake real multiplayer.
5. Concise first-run quest tutorial, next goal indicator and satisfying feedback (audio optional), phone-responsive high-fidelity wood/parchment UI.

**Vertical-slice success criteria:** player understands goal without developer explanation; feels visible progress in first 5 minutes; returns to collect/continue; minigame is fun over multiple rounds; no dead buttons; no broken saves. Test with real players, measure tutorial completion, 1st upgrade, session length and next-day return. Only after proof: online herds, true council voting, production event editor, wider building roster, additional minigames, larger economy and PvP.

## Decisions confirmed vs proposals
**Confirmed design direction:** blend of farm building, optional minigames, classic browser RPG, society simulation, living transmedia world; signature PEACEHOLD aesthetic; actual player influence on future stories; local demo is a technical beginning, not final design.
**To validate:** economy numbers/timers, balance, exact skill formulas, first minigame choice, seasonal length, specific political offices, social feature rollout and monetization. Do not treat example numbers as production facts.

## Guiding principle
**MAKE IT PLAYABLE, THEN MAKE IT PRETTY, THEN MAKE IT SOCIAL — but never ship a joyless spreadsheet.**
