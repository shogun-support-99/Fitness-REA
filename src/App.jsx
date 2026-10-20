import { useEffect, useState } from 'react'
import {
  Activity, Apple, ArrowRight, BarChart3, Check, ChevronDown, Clock3,
  Dumbbell, Flame, Heart, Menu, MessageCircle, Minus, Play, Plus,
  Share2, ShieldCheck, Sparkles, Star, TimerReset, Trophy, Users, X, Zap
} from 'lucide-react'

const routines = [
  { name: 'Bench Press', detail: '3 × 8', color: '#4169ff' },
  { name: 'Incline Dumbbell Press', detail: '3 × 10', color: '#ad72ff' },
  { name: 'Cable Fly', detail: '3 × 12', color: '#ff7b55' },
]

function Brand() {
  return <a className="brand" href="#top" aria-label="Forge home"><span className="brand-mark"><Dumbbell size={20}/></span><span>FORGE</span></a>
}

function Header({ onDemo }) {
  const [open, setOpen] = useState(false)
  const links = [['Features','#features'],['Community','#community'],['For Coaches','#coaches'],['Pricing','#pricing']]
  return <header className="nav-wrap">
    <nav className="nav container">
      <Brand />
      <div className={'nav-links ' + (open ? 'open' : '')}>
        {links.map(([label,href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <button className="btn btn-dark mobile-cta" onClick={() => {setOpen(false); onDemo()}}>Try the demo <ArrowRight size={16}/></button>
      </div>
      <button className="btn btn-dark desktop-cta" onClick={onDemo}>Try Forge <ArrowRight size={16}/></button>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
    </nav>
  </header>
}

function Phone({ compact=false }) {
  const [active, setActive] = useState('Workout')
  return <div className={'phone ' + (compact ? 'compact' : '')}>
    <div className="phone-top"><span>9:41</span><div className="island"/><span className="signals">● )))</span></div>
    <div className="app-head"><div><small>GOOD MORNING</small><h3>Ready to train?</h3></div><div className="avatar">JD</div></div>
    <div className="week-strip">
      {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className={i===3 ? 'today' : ''}><span>{d}</span><b>{14+i}</b></div>)}
    </div>
    <div className="streak"><div className="streak-icon"><Flame size={20}/></div><div><b>4 day streak</b><small>You're on fire. Keep it going!</small></div><strong>4</strong></div>
    <div className="section-label"><b>Today's routine</b><span>Push day · 45 min</span></div>
    <div className="routine-card">
      <div className="routine-title"><div className="exercise-pic"><Dumbbell size={24}/></div><div><b>Chest & Triceps</b><span>6 exercises</span></div><button><Play size={15} fill="currentColor"/></button></div>
      {routines.map((r,i) => <div className="routine-row" key={r.name}><i style={{background:r.color}}>{i+1}</i><span>{r.name}</span><b>{r.detail}</b></div>)}
      <div className="more">+ 3 more exercises</div>
    </div>
    <div className="phone-tabs">
      {[[Activity,'Home'],[Dumbbell,'Workout'],[BarChart3,'Progress'],[Users,'Social']].map(([Icon,n]) => <button key={n} className={active===n ? 'active' : ''} onClick={() => setActive(n)}><Icon size={17}/><span>{n}</span></button>)}
    </div>
  </div>
}

function AppBadge({ store }) {
  return <button className="store-badge" onClick={() => alert('Thanks for checking out Forge! The mobile app is coming soon.')}>
    {store === 'Apple' ? <Apple size={27} fill="currentColor"/> : <Play size={23} fill="currentColor"/>}
    <span><small>{store === 'Apple' ? 'Download on the' : 'GET IT ON'}</small><b>{store === 'Apple' ? 'App Store' : 'Google Play'}</b></span>
  </button>
}

function Hero({ onDemo }) {
  return <main id="top" className="hero">
    <div className="hero-glow one"/><div className="hero-glow two"/>
    <div className="container hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><span><Sparkles size={14}/></span> BUILT FOR BETTER TRAINING</div>
        <h1>Train smarter.<br/><em>Get stronger.</em></h1>
        <p>The beautifully simple workout tracker that helps you plan sessions, log every set, and see real progress.</p>
        <div className="hero-actions"><button className="btn btn-primary" onClick={onDemo}>Start a workout <ArrowRight size={18}/></button><a href="#features" className="text-link"><Play size={15} fill="currentColor"/> See how it works</a></div>
        <div className="rating-row"><div className="faces"><span>LM</span><span>AK</span><span>RS</span><span>+2m</span></div><div><div className="stars">★★★★★</div><small>Loved by 2 million+ athletes</small></div></div>
      </div>
      <div className="hero-visual">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="float-card progress-float"><span><Trophy size={19}/></span><div><small>NEW PERSONAL RECORD</small><b>Bench Press · 100 kg</b></div></div>
        <Phone />
        <div className="float-card volume-float"><BarChart3 size={21}/><div><small>WEEKLY VOLUME</small><b>18,420 kg <em>+12%</em></b></div></div>
      </div>
    </div>
    <div className="container trust-bar"><span>Trusted by athletes training at</span><div><b>GOLD'S GYM</b><b>ANYTIME FITNESS</b><b>GYMSHARK</b><b>UFC GYM</b><b>FITNESS FIRST</b></div></div>
  </main>
}

function FeatureCard({ icon:Icon, title, text, accent }) {
  return <article className="feature-card"><span className="feature-icon" style={{'--accent':accent}}><Icon size={22}/></span><h3>{title}</h3><p>{text}</p><a href="#demo">Learn more <ArrowRight size={15}/></a></article>
}

function DemoModal({ close }) {
  const [sets, setSets] = useState([{kg:80,reps:8,done:true},{kg:85,reps:8,done:false},{kg:85,reps:6,done:false}])
  const [seconds, setSeconds] = useState(90)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  useEffect(() => { if (!running || seconds<=0) return; const id=setInterval(() => setSeconds(s=>s-1),1000); return ()=>clearInterval(id) }, [running, seconds])
  const update=(i,k,v)=>setSets(s=>s.map((x,j)=>j===i?{...x,[k]:Math.max(0,+v)}:x))
  return <div className="modal-backdrop" onMouseDown={e => e.target===e.currentTarget && close()}>
    <div className="modal" role="dialog" aria-modal="true">
      <button className="modal-x" onClick={close}><X/></button>
      {finished ? <div className="finish-state"><span><Trophy size={42}/></span><div className="eyebrow">WORKOUT COMPLETE</div><h2>Strong work!</h2><p>You moved <b>{sets.reduce((n,s)=>n+s.kg*s.reps,0).toLocaleString()} kg</b> across {sets.length} sets.</p><div className="finish-stats"><div><b>18:24</b><span>Duration</span></div><div><b>{sets.reduce((n,s)=>n+s.reps,0)}</b><span>Total reps</span></div><div><b>+1</b><span>PR</span></div></div><button className="btn btn-primary" onClick={close}>Save workout <Check size={18}/></button></div> : <>
        <div className="modal-head"><div className="eyebrow">LIVE WORKOUT</div><h2>Push Day</h2><p><Clock3 size={15}/> 18:24 &nbsp;·&nbsp; 3 exercises</p></div>
        <div className="timer-box"><div><TimerReset size={21}/><span><small>REST TIMER</small><b>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</b></span></div><button onClick={()=>setRunning(!running)}>{running?'Pause':'Start'}</button><button className="icon-btn" onClick={()=>setSeconds(s=>s+30)}><Plus size={16}/></button></div>
        <div className="exercise-head"><div className="exercise-pic"><Dumbbell/></div><div><h3>Bench Press</h3><span>Barbell · Chest</span></div><button>•••</button></div>
        <div className="sets-table"><div className="set-row labels"><span>SET</span><span>KG</span><span>REPS</span><span></span></div>{sets.map((s,i)=><div className={'set-row '+(s.done?'set-done':'')} key={i}><b>{i+1}</b><input aria-label={`Set ${i+1} weight`} type="number" value={s.kg} onChange={e=>update(i,'kg',e.target.value)}/><input aria-label={`Set ${i+1} reps`} type="number" value={s.reps} onChange={e=>update(i,'reps',e.target.value)}/><button onClick={()=>update(i,'done',!s.done)}><Check size={18}/></button></div>)}</div>
        <button className="add-set" onClick={()=>setSets(s=>[...s,{kg:s.at(-1).kg,reps:s.at(-1).reps,done:false}])}><Plus size={17}/> Add set</button>
        <button className="btn finish-btn" onClick={()=>setFinished(true)}>Finish workout</button>
      </>}
    </div>
  </div>
}

const testimonials = [
  {quote:'The cleanest workout tracker I’ve ever used. I’m more consistent because logging never gets in my way.',name:'Maya Chen',role:'Powerlifter · 3 years',initial:'MC'},
  {quote:'Seeing my progress laid out this clearly changed how I train. The little PR notification is addictive.',name:'Tom Gallagher',role:'Hybrid athlete · 2 years',initial:'TG'},
  {quote:'My coach and I finally have one place for routines, notes, and feedback. Forge is now part of every session.',name:'Jordan Lewis',role:'Strength athlete · 4 years',initial:'JL'},
]

function FAQ() {
  const [open,setOpen]=useState(0)
  const items=[['Is Forge free to use?','Yes. The core workout logger, routines, history, and progress charts are free. Forge Pro adds advanced analytics and unlimited custom templates.'],['Can I import existing workout data?','You can import workouts from a CSV file or connect supported health platforms from your profile settings.'],['Does it work without internet?','Absolutely. Log your full workout offline and Forge will sync safely when you reconnect.'],['Can my coach see my workouts?','Yes. Invite a coach to view your history, assign routines, and leave private feedback on individual sessions.']]
  return <div className="faq-list">{items.map(([q,a],i)=><button className={'faq-item '+(open===i?'open':'')} key={q} onClick={()=>setOpen(open===i?-1:i)}><div><b>{q}</b><ChevronDown size={20}/></div><p>{a}</p></button>)}</div>
}

export default function App() {
  const [demo,setDemo]=useState(false)
  useEffect(()=>{document.body.style.overflow=demo?'hidden':''; return()=>{document.body.style.overflow=''}},[demo])
  return <>
    <Header onDemo={()=>setDemo(true)}/><Hero onDemo={()=>setDemo(true)}/>

    <section id="features" className="section features-section"><div className="container">
      <div className="section-heading centered"><div className="eyebrow">EVERYTHING YOU NEED</div><h2>Built to make every rep count.</h2><p>No clutter. No guesswork. Just powerful tools that stay out of your way.</p></div>
      <div className="feature-grid"><FeatureCard icon={Zap} accent="#315cff" title="Effortless logging" text="Log sets, reps, RPE, and notes in seconds. Your last weights are always ready."/><FeatureCard icon={Activity} accent="#ff6b35" title="Progress that’s clear" text="Beautiful charts reveal strength trends, volume, consistency, and personal records."/><FeatureCard icon={Users} accent="#8e5eff" title="Stronger together" text="Share sessions, swap routines, and celebrate the people who keep showing up."/></div>
    </div></section>

    <section className="section showcase"><div className="container showcase-grid"><div className="showcase-art log-art"><div className="mini-workout"><div className="mw-top"><span>Push Day</span><b>Finish</b></div><small>Bench Press (Barbell)</small>{[[1,80,8,true],[2,85,8,true],[3,85,6,false]].map(x=><div className="mw-row" key={x[0]}><b>{x[0]}</b><span>{x[1]} kg</span><span>{x[2]} reps</span><i className={x[3]?'checked':''}><Check size={14}/></i></div>)}<button>+ Add set</button></div><div className="rest-chip"><TimerReset size={18}/><span>Rest timer</span><b>01:24</b></div></div><div className="showcase-copy"><div className="number">01</div><div className="eyebrow">LOG WORKOUTS</div><h2>Fast enough for your hardest set.</h2><p>Built around the way you actually train. Add sets, adjust weight, mark warmups, and track RPE without breaking focus.</p><ul><li><Check/> Smart previous-set suggestions</li><li><Check/> Automatic rest timers</li><li><Check/> Supersets, dropsets & warmups</li></ul><button className="link-button" onClick={()=>setDemo(true)}>Try the workout logger <ArrowRight/></button></div></div></section>

    <section className="section progress-section"><div className="container showcase-grid reverse"><div className="showcase-copy"><div className="number">02</div><div className="eyebrow">TRACK PROGRESS</div><h2>Proof that the work is working.</h2><p>Watch your numbers climb. Forge turns every workout into clear, motivating insights so you always know what to do next.</p><div className="stats-row"><div><b>+24%</b><span>Strength</span></div><div><b>36</b><span>Workouts</span></div><div><b>12</b><span>New PRs</span></div></div><a className="link-button" href="#pricing">Explore analytics <ArrowRight/></a></div><div className="chart-card"><div className="chart-top"><div><small>BENCH PRESS</small><h3>Estimated 1RM</h3></div><select aria-label="chart time period"><option>6 months</option><option>1 year</option></select></div><div className="chart-value"><b>104.5</b><span>kg</span><em>↗ 12.4%</em></div><div className="chart"><div className="chart-grid"/><svg viewBox="0 0 500 180" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315cff" stopOpacity=".35"/><stop offset="1" stopColor="#315cff" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 155 C45 150 50 127 92 132 S145 108 180 115 S232 86 270 94 S330 73 360 74 S410 40 500 27 L500 180 L0 180 Z"/><path className="line" d="M0 155 C45 150 50 127 92 132 S145 108 180 115 S232 86 270 94 S330 73 360 74 S410 40 500 27"/></svg><span className="chart-dot"/></div><div className="chart-months"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div></div></div></section>

    <section id="community" className="community section"><div className="container community-grid"><div className="community-copy"><div className="eyebrow light">COMMUNITY POWERED</div><h2>Showing up is easier together.</h2><p>Follow friends, discover routines, and celebrate every win with a community that understands the work.</p><div className="member-row"><div className="faces"><span>AR</span><span>LM</span><span>JC</span><span>+2m</span></div><b>athletes already training</b></div></div><div className="social-card"><div className="social-user"><span className="social-avatar">AR</span><div><b>Alex Rivera</b><small>12 min ago · Upper Body</small></div><button><Share2 size={17}/></button></div><p>Hit a new bench PR today. Small steps, every week. ⚡</p><div className="social-stats"><div><small>DURATION</small><b>58 min</b></div><div><small>VOLUME</small><b>9,840 kg</b></div><div><small>PRs</small><b className="blue">2</b></div></div><div className="social-actions"><button><Heart size={18}/> 146</button><button><MessageCircle size={18}/> 18</button></div></div></div></section>

    <section id="coaches" className="athlete-banner"><img src="/gym-athlete.jpg" alt="Athlete training with a barbell"/><div className="athlete-overlay"/><div className="container athlete-copy"><div className="eyebrow light">FOR EVERY BODY</div><h2>Your training.<br/>Your pace. <em>Your win.</em></h2><p>Whether it’s your first session or your five-hundredth, Forge meets you where you are.</p><button className="btn btn-light" onClick={()=>setDemo(true)}>Start training free <ArrowRight/></button></div></section>

    <section className="section testimonials"><div className="container"><div className="section-heading"><div className="eyebrow">REAL PEOPLE. REAL PROGRESS.</div><h2>Made for people who show up.</h2></div><div className="testimonial-grid">{testimonials.map(t=><article key={t.name}><div className="stars">★★★★★</div><blockquote>“{t.quote}”</blockquote><div className="testimonial-user"><span>{t.initial}</span><div><b>{t.name}</b><small>{t.role}</small></div></div></article>)}</div></div></section>

    <section id="pricing" className="section faq-section"><div className="container faq-grid"><div><div className="eyebrow">GOOD TO KNOW</div><h2>Questions,<br/>meet answers.</h2><p>Still curious? We’re here to help.</p><a href="mailto:hello@forge.fit">Talk to our team <ArrowRight size={16}/></a></div><FAQ/></div></section>

    <section className="cta-section"><div className="cta-noise"/><div className="container cta-inner"><span className="cta-mark"><Dumbbell/></span><h2>Your strongest self<br/>starts with one set.</h2><p>Plan it. Log it. See the proof. Start training with Forge today.</p><div className="badge-row"><AppBadge store="Apple"/><AppBadge store="Google"/></div><small><ShieldCheck size={15}/> Free forever plan &nbsp;·&nbsp; No credit card needed</small></div></section>

    <footer><div className="container"><div className="footer-top"><div><Brand/><p>Built for the work nobody sees.</p></div><div><b>PRODUCT</b><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#">Forge Pro</a></div><div><b>COMPANY</b><a href="#">About</a><a href="#">Careers</a><a href="#">Contact</a></div><div><b>RESOURCES</b><a href="#">Help center</a><a href="#">Training guide</a><a href="#">Community</a></div></div><div className="footer-bottom"><span>© 2026 Forge Fitness. All rights reserved.</span><div><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div><div className="status"><i/> All systems operational</div></div></div></footer>
    {demo && <DemoModal close={()=>setDemo(false)}/>} 
  </>
}
