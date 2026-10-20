import { useEffect, useState } from 'react'
import { Icon, Logo, Stars } from '../components/icons'

const WORDS = ['Track workouts.', 'Get stronger.', 'Stay consistent.']

const TESTIMONIALS = [
  {
    name: 'Arjun M.',
    handle: '@arjun.lifts',
    color: '#2f6bff',
    quote:
      'I tried every tracker out there. This is the first one I actually open at the gym. Logging a set takes two seconds.',
  },
  {
    name: 'Priya S.',
    handle: '@priyasquats',
    color: '#ec4899',
    quote:
      'The rest timer alone is worth it. My workouts are tighter and the PR notifications keep me chasing numbers.',
  },
  {
    name: 'Marcus T.',
    handle: '@mtfitness',
    color: '#f59e0b',
    quote:
      'Routines are a game changer. I set up my 4-day split once and now every session is one tap away.',
  },
  {
    name: 'Elena K.',
    handle: '@elenakfit',
    color: '#22c55e',
    quote:
      'The progress charts showed me my bench had stalled for two months. Deloaded, rebuilt, and just hit a new PR.',
  },
  {
    name: 'David O.',
    handle: '@dolifts',
    color: '#a855f7',
    quote:
      'Clean, fast, no ads, no upsells. It just does exactly what I need and gets out of the way.',
  },
  {
    name: 'Sana R.',
    handle: '@sana.runs',
    color: '#06b6d4',
    quote:
      'I log my strength work and my runs in the same place. The weekly volume chart is dangerously motivating.',
  },
]

const GUIDES = [
  {
    tag: 'Training',
    title: 'The 3-day workout split: the complete guide',
    emoji: '🏋️',
    c1: '#2f6bff',
    c2: '#7c3aed',
  },
  {
    tag: 'Progress',
    title: 'Progressive overload, explained simply',
    emoji: '📈',
    c1: '#ec4899',
    c2: '#f59e0b',
  },
  {
    tag: 'Recovery',
    title: 'How to warm up for heavy lifts (and why it matters)',
    emoji: '🧘',
    c1: '#06b6d4',
    c2: '#22c55e',
  },
]

function Rotator() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="rotator">
      {WORDS.map((w, idx) => (
        <span key={w} className={`rotator-word ${idx === i ? 'rotator-on' : ''}`}>
          {w}
        </span>
      ))}
    </span>
  )
}

/** Static mini version of the app home screen for the hero phone. */
function PhoneMock() {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="pm-status">
          <span>9:41</span>
          <span className="pm-status-icons">▮▮▮ ⚡</span>
        </div>
        <div className="pm-head">
          <div>
            <p className="pm-hi">Good afternoon,</p>
            <p className="pm-name">Alex</p>
          </div>
          <div className="pm-avatar">A</div>
        </div>
        <div className="pm-week">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="pm-day">
              <span>{d}</span>
              <i className={i === 2 || i === 4 ? 'on' : i === 5 ? 'today' : ''} />
            </div>
          ))}
        </div>
        <div className="pm-stats">
          <div>
            <strong>3</strong>
            <span>workouts</span>
          </div>
          <div>
            <strong>18.2k</strong>
            <span>volume</span>
          </div>
          <div>
            <strong>🔥 6</strong>
            <span>streak</span>
          </div>
        </div>
        <button className="pm-start">
          <Icon name="plus" size={16} /> Start Empty Workout
        </button>
        <div className="pm-quick">
          {['Push Day', 'Pull Day', 'Leg Day'].map((r) => (
            <div key={r} className="pm-routine">
              <Icon name="play" size={10} fill="currentColor" />
              {r}
            </div>
          ))}
        </div>
        <div className="pm-recent">
          <p className="pm-label">Recent Workouts</p>
          {[
            ['Full Body', '1d ago · 71m', '8,410'],
            ['Pull Day', '3d ago · 72m', '7,940'],
          ].map(([n, s, v]) => (
            <div key={n} className="pm-row">
              <div className="pm-dumb">
                <Icon name="dumbbell" size={12} />
              </div>
              <div>
                <strong>{n}</strong>
                <span>{s}</span>
              </div>
              <span className="pm-vol">{v}</span>
            </div>
          ))}
        </div>
        <div className="pm-tabbar">
          <span className="pm-tab pm-tab-on">
            <Icon name="home" size={14} />
            Home
          </span>
          <span className="pm-tab">
            <Icon name="layers" size={14} />
            Routines
          </span>
          <span className="pm-tab">
            <Icon name="book" size={14} />
            Exercises
          </span>
          <span className="pm-tab">
            <Icon name="user" size={14} />
            Profile
          </span>
        </div>
      </div>
    </div>
  )
}

/** Mini mockups for the feature sections. */
function SetsMock() {
  return (
    <div className="mini dark-mock">
      <div className="mini-title">Bench Press</div>
      <div className="mini-grid mini-head">
        <span>SET</span>
        <span>PREV</span>
        <span>KG</span>
        <span>REPS</span>
        <span />
      </div>
      {[
        ['W', '40×10', '40', '10'],
        ['1', '60×8', '62.5', '8'],
        ['2', '60×7', '62.5', '7'],
      ].map(([s, p, w, r], i) => (
        <div className="mini-grid" key={i}>
          <span className={`mini-badge ${s === 'W' ? 'warm' : ''}`}>{s}</span>
          <span className="mini-prev">{p}</span>
          <span className="mini-input">{w}</span>
          <span className="mini-input">{r}</span>
          <span className={`mini-check ${i > 0 ? 'on' : ''}`}>✓</span>
        </div>
      ))}
      <div className="mini-rest">
        <Icon name="timer" size={14} />
        Rest · 1:24 <span className="mini-rest-btns">+15s +1m ✕</span>
      </div>
    </div>
  )
}

function ChartMock() {
  const bars = [38, 52, 44, 61, 55, 72, 66, 81, 77, 92]
  return (
    <div className="mini dark-mock">
      <div className="mini-title">Estimated 1RM — Squat</div>
      <div className="mini-chart">
        {bars.map((h, i) => (
          <div key={i} className="mini-bar-w">
            <div
              className={`mini-bar ${i === bars.length - 1 ? 'last' : ''}`}
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mini-pr">
        <Icon name="trophy" size={14} /> New PR · 120kg × 5 · est. 1RM 140kg
      </div>
    </div>
  )
}

function FeedMock() {
  return (
    <div className="mini dark-mock">
      <div className="mini-post">
        <span className="mini-av" style={{ background: '#ec4899' }}>MR</span>
        <div>
          <strong>Maya Reyes</strong> · Push Day
          <div className="mini-sub">2h ago · 6,420kg · 58m</div>
        </div>
        <span className="mini-heart">
          <Icon name="heart" size={14} fill="currentColor" /> 24
        </span>
      </div>
      <div className="mini-post">
        <span className="mini-av" style={{ background: '#3b82f6' }}>DS</span>
        <div>
          <strong>Dev Sharma</strong> · Leg Day
          <div className="mini-sub">7h ago · 9,840kg · 72m</div>
        </div>
        <span className="mini-heart">
          <Icon name="heart" size={14} fill="currentColor" /> 41
        </span>
      </div>
      <div className="mini-post">
        <span className="mini-av" style={{ background: '#22c55e' }}>JW</span>
        <div>
          <strong>Jonas Weber</strong> · Easy 5K
          <div className="mini-sub">1d ago · 5.2km · 31m</div>
        </div>
        <span className="mini-heart off">
          <Icon name="heart" size={14} fill="none" /> 9
        </span>
      </div>
    </div>
  )
}

function Feature({
  id,
  kicker,
  title,
  copy,
  bullets,
  visual,
  flip,
}: {
  id?: string
  kicker: string
  title: string
  copy: string
  bullets: string[]
  visual: React.ReactNode
  flip?: boolean
}) {
  return (
    <section className="feature" id={id}>
      <div className={`feature-grid ${flip ? 'feature-flip' : ''}`}>
        <div className="feature-copy">
          <p className="kicker">{kicker}</p>
          <h2>{title}</h2>
          <p className="lead">{copy}</p>
          <ul className="feature-list">
            {bullets.map((b) => (
              <li key={b}>
                <Icon name="check" size={16} strokeWidth={3} /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="feature-visual">{visual}</div>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <div className="landing">
      <nav className="lnav">
        <a className="brand" href="#/">
          <Logo size={28} />
          <span>
            REA<span className="brand-accent">FIT</span>
          </span>
        </a>
        <div className="lnav-links">
          <a href="#features">Features</a>
          <a href="#community">Community</a>
          <a href="#guides">Guides</a>
        </div>
        <a className="btn-cta" href="#/app">
          Open the app
        </a>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <div className="hero-pill">
            <Icon name="zap" size={13} /> Free forever · no account needed
          </div>
          <h1>
            <Rotator />
            <br />
            <span className="hero-rest">Become the athlete you keep planning to be.</span>
          </h1>
          <p className="hero-sub">
            REA Fit is a free workout tracker for the web. Plan routines, log every set, chase new
            PRs — and actually enjoy the process.
          </p>
          <div className="hero-actions">
            <a className="btn-cta btn-cta-lg" href="#/app">
              Start your first workout
              <Icon name="arrowRight" size={16} />
            </a>
            <a className="btn-outline" href="#features">
              Explore features
            </a>
          </div>
          <div className="hero-proof">
            <div className="hero-avatars">
              {['#2f6bff', '#ec4899', '#f59e0b', '#22c55e', '#a855f7'].map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
            <div>
              <Stars />
              <strong>4.9</strong>
              <span className="muted">· loved by lifters everywhere</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <PhoneMock />
        </div>
      </header>

      <section className="press">
        <p>Featured on</p>
        <div className="press-row">
          <span className="press-serif">Iron Weekly</span>
          <span className="press-black">THE LIFT JOURNAL</span>
          <span className="press-mono">gymtech.today</span>
          <span className="press-serif">Pulse Magazine</span>
          <span className="press-black">STRENGTH DIGEST</span>
        </div>
      </section>

      <Feature
        id="features"
        kicker="Log workouts"
        title="A tracker that just works"
        copy="Everything you need to log your workouts and smash your goals — nothing you don't."
        bullets={[
          'One tap to log weight & reps',
          'Warm-up, drop and failure sets',
          'Automatic rest timers',
          'Notes on every exercise',
        ]}
        visual={<SetsMock />}
      />

      <Feature
        kicker="Measure progress"
        title="Staying motivated is easier when you can see how far you've come"
        copy="Every set you log feeds your charts, records and history — so progress is impossible to miss."
        bullets={[
          'Weekly volume charts',
          'Personal record tracking',
          'One-rep-max estimates',
          'Complete exercise history',
        ]}
        visual={<ChartMock />}
        flip
      />

      <Feature
        id="community"
        kicker="Join the community"
        title="Follow friends. Trade routines. Stay accountable."
        copy="Training is better with an audience. Share workouts, cheer each other on, and borrow the routines that work."
        bullets={[
          'Share workouts to your feed',
          'Likes and comments',
          'Follow athletes you rate',
          'Stay accountable',
        ]}
        visual={<FeedMock />}
      />

      <section className="devices">
        <div className="devices-grid">
          <div className="feature-copy">
            <p className="kicker">Every device</p>
            <h2>Your gym bag, on every screen</h2>
            <p className="lead">
              Phone, tablet or laptop — REA Fit runs in the browser with nothing to install.
            </p>
            <ul className="feature-list">
              <li>
                <Icon name="check" size={16} strokeWidth={3} /> Works on any device with a browser
              </li>
              <li>
                <Icon name="check" size={16} strokeWidth={3} /> No install, no account, no ads
              </li>
              <li>
                <Icon name="check" size={16} strokeWidth={3} /> Your data stays on your device
              </li>
              <li>
                <Icon name="check" size={16} strokeWidth={3} /> Export a backup any time
              </li>
            </ul>
          </div>
          <div className="devices-icons">
            <div className="device-chip">
              <Icon name="monitor" size={22} /> Desktop
            </div>
            <div className="device-chip">
              <Icon name="watch" size={22} /> Phone &amp; tablet
            </div>
            <div className="device-chip">
              <Icon name="timer" size={22} /> Gym-ready
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band">
        <div>
          <strong>1,300+</strong>
          <span>exercises built in</span>
        </div>
        <div>
          <strong>∞</strong>
          <span>workouts, free forever</span>
        </div>
        <div>
          <strong>0</strong>
          <span>ads or trackers</span>
        </div>
        <div>
          <strong>1 tap</strong>
          <span>to start a routine</span>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <h2>Loved by athletes everywhere</h2>
        <div className="t-grid">
          {TESTIMONIALS.map((t) => (
            <figure key={t.handle} className="t-card">
              <Stars />
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="t-avatar" style={{ background: t.color }}>
                  {t.name[0]}
                </span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.handle}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="guides" id="guides">
        <h2>Our guides</h2>
        <p className="lead">Short, practical reads to make your next training block your best.</p>
        <div className="g-grid">
          {GUIDES.map((g) => (
            <a key={g.title} className="g-card" href="#/app">
              <div className="g-cover" style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }}>
                <span>{g.emoji}</span>
                <em>{g.tag}</em>
              </div>
              <h3>{g.title}</h3>
              <span className="g-cta">
                Open the app to practice <Icon name="arrowRight" size={14} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Your first workout is one tap away</h2>
        <p>Join the lifters who never skip logging day. Free forever.</p>
        <a className="btn-cta btn-cta-lg btn-cta-light" href="#/app">
          Open REA Fit <Icon name="arrowRight" size={16} />
        </a>
      </section>

      <footer className="lfooter">
        <div className="lfooter-grid">
          <div className="lfooter-brand">
            <a className="brand" href="#/">
              <Logo size={26} />
              <span>
                REA<span className="brand-accent">FIT</span>
              </span>
            </a>
            <p>
              The free workout tracker for people who train. Log workouts. Get stronger. Stay
              consistent.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#/app">Web app</a>
            <a href="#features">Features</a>
            <a href="#guides">Guides</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#/app">Exercise library</a>
            <a href="#/app">Sample data</a>
            <a
              href="https://github.com/shogun-support-99/Fitness-REA"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repo
            </a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#testimonials">Reviews</a>
            <a href="https://github.com/shogun-support-99/Fitness-REA">About</a>
            <a href="#/">Home</a>
          </div>
        </div>
        <div className="lfooter-bottom">
          <span>© 2026 REA Fit · Built as an open-source demo.</span>
          <span>
            Inspired by <a href="https://www.hevyapp.com/">Hevy</a> — not affiliated with or endorsed
            by Hevy.
          </span>
        </div>
      </footer>
    </div>
  )
}
