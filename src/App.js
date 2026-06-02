import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

// Bilingual text helper
const T = ({ en, uz }) => (
  <span>
    {en}
    <span style={{ display: 'block', fontSize: '11px', color: '#aaa', fontWeight: 400, lineHeight: 1.2, marginTop: 1 }}>{uz}</span>
  </span>
)

const FOOD_ITEMS = [
  { name: 'Banana', nameUz: 'Banan', emoji: '🍌', unit: 'pcs', unitUz: 'ta', cal_per_unit: 90 },
  { name: 'Egg', nameUz: 'Tuxum', emoji: '🥚', unit: 'pcs', unitUz: 'ta', cal_per_unit: 70 },
  { name: 'Chicken breast', nameUz: 'Tovuq koʻkragi', emoji: '🍗', unit: 'g', unitUz: 'g', cal_per_unit: 1.65, step: 50, max: 300 },
  { name: 'Rice (cooked)', nameUz: 'Guruch (pishgan)', emoji: '🍚', unit: 'g', unitUz: 'g', cal_per_unit: 1.3, step: 50, max: 400 },
  { name: 'Milk', nameUz: 'Sut', emoji: '🥛', unit: 'glass', unitUz: 'stakan', cal_per_unit: 60 },
  { name: 'Nuts', nameUz: 'Yongʻoq', emoji: '🥜', unit: 'g', unitUz: 'g', cal_per_unit: 6, step: 10, max: 60 },
  { name: 'Whole grain bread', nameUz: 'Toʻliq donli non', emoji: '🍞', unit: 'slice', unitUz: 'boʻlak', cal_per_unit: 80 },
  { name: 'Cottage cheese', nameUz: 'Tvorog/Suzma', emoji: '🧀', unit: 'g', unitUz: 'g', cal_per_unit: 1.0, step: 50, max: 300 },
  { name: 'Peanut butter', nameUz: 'Arahis pastasi', emoji: '🫙', unit: 'g', unitUz: 'g', cal_per_unit: 5.9, step: 10, max: 60 },
  { name: 'Apple', nameUz: 'Olma', emoji: '🍎', unit: 'pcs', unitUz: 'ta', cal_per_unit: 80 },
]

const DAILY_CALORIE_GOAL = 2800
const WORKOUT_DAYS = {
  1: { name: 'Monday', nameUz: 'Dushanba', label: 'Chest & Arms', labelUz: 'Ko\'krak va Qo\'llar', calories: 350, exercises: [
    { name: 'Warm-up (jumping jacks)', nameUz: 'Isitish (sakrash)', sets: 1, reps: '3 min' },
    { name: 'Push-up (wide grip)', nameUz: 'Keng qo\'lli push-up', sets: 4, reps: 12 },
    { name: 'Diamond push-up', nameUz: 'Olmos push-up', sets: 3, reps: 10 },
    { name: 'Incline push-up', nameUz: 'Qiya push-up', sets: 3, reps: 10 },
    { name: 'Resistance band chest fly', nameUz: 'Rezina bilan ko\'krak', sets: 3, reps: 12 },
    { name: 'Pull-up (chin-up grip)', nameUz: 'Turnik (kaft yuqori)', sets: 3, reps: 'max' },
    { name: 'Resistance band curl', nameUz: 'Rezina bilan curl', sets: 4, reps: 12 },
    { name: 'Hammer curl (band)', nameUz: 'Bolg\'a curl (rezina)', sets: 3, reps: 12 },
    { name: 'Narrow push-up (tricep)', nameUz: 'Tor push-up (tricep)', sets: 3, reps: 12 },
    { name: 'Band overhead extension', nameUz: 'Rezina bilan tricep', sets: 3, reps: 12 },
    { name: 'Cool-down stretch', nameUz: 'Cho\'zish', sets: 1, reps: '5 min' },
  ]},
  3: { name: 'Wednesday', nameUz: 'Chorshanba', label: 'Back & Core', labelUz: 'Orqa va Bel', calories: 400, exercises: [
    { name: 'Warm-up', nameUz: 'Isitish', sets: 1, reps: '3 min' },
    { name: 'Pull-up (wide grip)', nameUz: 'Keng ushlab tortish', sets: 4, reps: 'max' },
    { name: 'Pull-up (narrow grip)', nameUz: 'Tor ushlab tortish', sets: 3, reps: 'max' },
    { name: 'Band bent-over row', nameUz: 'Rezina bilan qator', sets: 4, reps: 12 },
    { name: 'Band straight arm pulldown', nameUz: 'Rezina bilan pulldown', sets: 3, reps: 12 },
    { name: 'Band shrug', nameUz: 'Rezina bilan shrag', sets: 4, reps: 15 },
    { name: 'Band upright row', nameUz: 'Rezina bilan tik qator', sets: 3, reps: 12 },
    { name: 'Superman', nameUz: 'Superman', sets: 4, reps: 15 },
    { name: 'Bird-dog', nameUz: 'Bird-dog', sets: 3, reps: 12 },
    { name: 'Band deadlift', nameUz: 'Rezina bilan deadlift', sets: 4, reps: 12 },
    { name: 'Cool-down stretch', nameUz: 'Cho\'zish', sets: 1, reps: '5 min' },
  ]},
  5: { name: 'Friday', nameUz: 'Juma', label: 'Shoulders & Legs', labelUz: 'Yelka va Oyoq', calories: 450, exercises: [
    { name: 'Warm-up', nameUz: 'Isitish', sets: 1, reps: '3 min' },
    { name: 'Band shoulder press', nameUz: 'Rezina bilan yelka press', sets: 4, reps: 12 },
    { name: 'Band lateral raise', nameUz: 'Rezina bilan lateral', sets: 4, reps: 12 },
    { name: 'Band front raise', nameUz: 'Rezina bilan old ko\'tarish', sets: 3, reps: 12 },
    { name: 'Band face pull', nameUz: 'Rezina bilan face pull', sets: 3, reps: 15 },
    { name: 'Squat', nameUz: 'Squat', sets: 4, reps: 15 },
    { name: 'Band squat', nameUz: 'Rezina bilan squat', sets: 3, reps: 15 },
    { name: 'Lunge', nameUz: 'Lunge', sets: 3, reps: '12 each' },
    { name: 'Band glute bridge', nameUz: 'Rezina bilan glute bridge', sets: 4, reps: 15 },
    { name: 'Calf raise', nameUz: 'Boldir ko\'tarish', sets: 4, reps: 20 },
    { name: 'Cool-down stretch', nameUz: 'Cho\'zish', sets: 1, reps: '5 min' },
  ]},
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', labelUz: 'Bosh sahifa', icon: '⌂' },
  { id: 'todo', label: 'Tasks', labelUz: 'Vazifalar', icon: '✓' },
  { id: 'food', label: 'Nutrition', labelUz: 'Ovqatlanish', icon: '◉' },
  { id: 'workout', label: 'Workout', labelUz: 'Sport', icon: '◈' },
  { id: 'skills', label: 'Skills', labelUz: 'Ko\'nikmalar', icon: '◆' },
  { id: 'notes', label: 'Notes', labelUz: 'Eslatmalar', icon: '◻' },
  { id: 'expenses', label: 'Expenses', labelUz: 'Xarajatlar', icon: '◎' },
  { id: 'progress', label: 'Progress', labelUz: 'Taraqqiyot', icon: '▣' },
  { id: 'chat', label: 'AI Chat', labelUz: 'AI Yordamchi', icon: '◐' },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [todos, setTodos] = useState([])
  const [foodLog, setFoodLog] = useState([])
  const [expenses, setExpenses] = useState([])
  const [notes, setNotes] = useState([])
  const [dailyProgress, setDailyProgress] = useState(null)
  const [workoutLog, setWorkoutLog] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]
  const todayDay = new Date().getDay()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [t, f, e, n, dp, wl] = await Promise.all([
        supabase.from('todos').select('*').order('created_at', { ascending: false }),
        supabase.from('food_log').select('*').eq('log_date', today).order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('daily_progress').select('*').eq('progress_date', today).single(),
        supabase.from('workout_log').select('*').eq('workout_date', today),
      ])
      if (t.data) setTodos(t.data)
      if (f.data) setFoodLog(f.data)
      if (e.data) setExpenses(e.data)
      if (n.data) setNotes(n.data)
      if (dp.data) setDailyProgress(dp.data)
      if (wl.data) setWorkoutLog(wl.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const totalCaloriesConsumed = foodLog.reduce((s, f) => s + Number(f.total_calories), 0)
  const caloriesBurned = dailyProgress?.calories_burned || 0
  const caloriesNet = totalCaloriesConsumed - caloriesBurned

  const pages = {
    home: <HomePage setPage={setPage} todos={todos} totalCaloriesConsumed={totalCaloriesConsumed} caloriesBurned={caloriesBurned} caloriesNet={caloriesNet} dailyProgress={dailyProgress} todayDay={todayDay} />,
    todo: <TodoPage todos={todos} setTodos={setTodos} supabase={supabase} />,
    food: <FoodPage foodLog={foodLog} setFoodLog={setFoodLog} totalCaloriesConsumed={totalCaloriesConsumed} caloriesBurned={caloriesBurned} caloriesNet={caloriesNet} today={today} supabase={supabase} />,
    workout: <WorkoutPage workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} dailyProgress={dailyProgress} setDailyProgress={setDailyProgress} todayDay={todayDay} today={today} supabase={supabase} />,
    skills: <SkillsPage dailyProgress={dailyProgress} setDailyProgress={setDailyProgress} today={today} supabase={supabase} />,
    notes: <NotesPage notes={notes} setNotes={setNotes} supabase={supabase} />,
    expenses: <ExpensesPage expenses={expenses} setExpenses={setExpenses} supabase={supabase} />,
    progress: <ProgressPage supabase={supabase} />,
    chat: <ChatPage todos={todos} setTodos={setTodos} foodLog={foodLog} dailyProgress={dailyProgress} setDailyProgress={setDailyProgress} setPage={setPage} supabase={supabase} loadAll={loadAll} />,
  }

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingDot} />
      <p style={{ color: '#888', fontFamily: 'DM Sans', fontSize: 14 }}>Loading...</p>
    </div>
  )

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>S</div>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ ...styles.navBtn, ...(page === n.id ? styles.navActive : {}) }} title={n.label}>
            <span style={styles.navIcon}>{n.icon}</span>
            <span style={styles.navLabel}>
              {n.label}
              <span style={styles.navLabelUz}>{n.labelUz}</span>
            </span>
          </button>
        ))}
      </aside>
      <main style={styles.main}>
        {pages[page]}
      </main>
    </div>
  )
}

function HomePage({ setPage, todos, totalCaloriesConsumed, caloriesBurned, caloriesNet, dailyProgress, todayDay }) {
  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const isWorkoutDay = [1, 3, 5].includes(todayDay)
  const workoutToday = WORKOUT_DAYS[todayDay]
  const pendingTodos = todos.filter(t => !t.completed).length
  const calPercent = Math.min(100, Math.round((totalCaloriesConsumed / 2800) * 100))
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const greetingUz = now.getHours() < 12 ? 'Xayrli tong' : now.getHours() < 17 ? 'Xayrli kun' : 'Xayrli kech'

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.h1}>{greeting}, Sardor <span style={styles.uzText}>({greetingUz})</span></h1>
          <p style={styles.subtitle}>{dayName}, {dateStr}</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Calories consumed" labelUz="Iste'mol qilingan" value={`${Math.round(totalCaloriesConsumed)}`} unit="kcal" color="#000" onClick={() => setPage('food')} />
        <StatCard label="Burned" labelUz="Yoqilgan" value={`${Math.round(caloriesBurned)}`} unit="kcal" color="#555" onClick={() => setPage('workout')} />
        <StatCard label="Net balance" labelUz="Balans" value={`${Math.round(caloriesNet)}`} unit="kcal" color={caloriesNet >= 2000 ? '#000' : '#888'} onClick={() => setPage('food')} />
        <StatCard label="Tasks pending" labelUz="Bajarilmagan" value={`${pendingTodos}`} unit="tasks" color="#000" onClick={() => setPage('todo')} />
      </div>

      <div style={styles.progressBarWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={styles.labelSm}>Daily calorie goal <span style={styles.uzText}>/ Kunlik kaloriya maqsadi</span></span>
          <span style={styles.labelSm}>{Math.round(totalCaloriesConsumed)} / 2800 kcal</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${calPercent}%` }} />
        </div>
      </div>

      {isWorkoutDay && (
        <div style={styles.workoutBanner} onClick={() => setPage('workout')}>
          <span style={{ fontSize: 20 }}>◈</span>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Today: {workoutToday?.label} <span style={styles.uzText}>/ {workoutToday?.labelUz}</span></p>
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{workoutToday?.exercises.length} exercises · ~{workoutToday?.calories} kcal burned</p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18 }}>→</span>
        </div>
      )}

      <div style={styles.skillsRow}>
        {[
          { label: 'English', labelUz: 'Ingliz tili', stars: dailyProgress?.english_stars || 0, page: 'skills' },
          { label: 'Python / C++', labelUz: 'Dasturlash', stars: dailyProgress?.python_stars || 0, page: 'skills' },
          { label: 'Sport', labelUz: 'Mashq', stars: dailyProgress?.sport_stars || 0, page: 'workout' },
        ].map(s => (
          <div key={s.label} style={styles.skillCard} onClick={() => setPage(s.page)}>
            <p style={styles.labelSm}>{s.label} <span style={styles.uzText}>/ {s.labelUz}</span></p>
            <div>{[1,2,3].map(i => <span key={i} style={{ color: i <= s.stars ? '#000' : '#ddd', fontSize: 16 }}>★</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, labelUz, value, unit, color, onClick }) {
  return (
    <div style={{ ...styles.statCard, cursor: 'pointer' }} onClick={onClick}>
      <p style={styles.statLabel}>{label}<br/><span style={styles.uzText}>{labelUz}</span></p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
      <p style={styles.statUnit}>{unit}</p>
    </div>
  )
}

function TodoPage({ todos, setTodos, supabase }) {
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [filter, setFilter] = useState('all')

  async function addTodo() {
    if (!input.trim()) return
    const { data } = await supabase.from('todos').insert({ title: input, priority, category }).select().single()
    if (data) setTodos(prev => [data, ...prev])
    setInput('')
  }

  async function toggleTodo(id, completed) {
    await supabase.from('todos').update({ completed: !completed }).eq('id', id)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
  }

  async function deleteTodo(id) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed)
  const priorityColor = { high: '#000', medium: '#555', low: '#aaa' }

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Tasks <span style={styles.uzText}>/ Vazifalar</span></h1>
      <div style={styles.inputRow}>
        <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="Add a task... / Vazifa qo'sh..." />
        <select style={styles.select} value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High / Yuqori</option>
          <option value="medium">Medium / O'rta</option>
          <option value="low">Low / Past</option>
        </select>
        <input style={{ ...styles.input, maxWidth: 120 }} value={category} onChange={e => setCategory(e.target.value)} placeholder="Category / Kategoriya" />
        <button style={styles.btnPrimary} onClick={addTodo}>Add / Qo'sh</button>
      </div>
      <div style={styles.filterRow}>
        {[['all','Hammasi'],['active','Faol'],['done','Bajarilgan']].map(([f, uz]) => (
          <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'} <span style={{ fontSize: 10, opacity: 0.7 }}>/ {uz}</span>
          </button>
        ))}
      </div>
      <div style={styles.list}>
        {filtered.map(t => (
          <div key={t.id} style={{ ...styles.listItem, opacity: t.completed ? 0.5 : 1 }}>
            <button style={styles.checkBtn} onClick={() => toggleTodo(t.id, t.completed)}>
              {t.completed ? '✓' : '○'}
            </button>
            <div style={{ flex: 1 }}>
              <span style={{ textDecoration: t.completed ? 'line-through' : 'none', fontSize: 15 }}>{t.title}</span>
              {t.category && <span style={styles.tag}>{t.category}</span>}
            </div>
            <span style={{ fontSize: 12, color: priorityColor[t.priority], fontWeight: 500, marginRight: 12 }}>{t.priority}</span>
            <button style={styles.deleteBtn} onClick={() => deleteTodo(t.id)}>×</button>
          </div>
        ))}
        {filtered.length === 0 && <p style={styles.empty}>No tasks / Vazifa yo'q</p>}
      </div>
    </div>
  )
}

function FoodPage({ foodLog, setFoodLog, totalCaloriesConsumed, caloriesBurned, caloriesNet, today, supabase }) {
  async function logFood(item, qty) {
    if (qty <= 0) return
    const total = Math.round(item.cal_per_unit * qty)
    const { data } = await supabase.from('food_log').insert({
      food_name: item.name, quantity: qty, unit: item.unit,
      calories_per_unit: item.cal_per_unit, total_calories: total, log_date: today
    }).select().single()
    if (data) setFoodLog(prev => [data, ...prev])
  }

  async function removeFood(id) {
    await supabase.from('food_log').delete().eq('id', id)
    setFoodLog(prev => prev.filter(f => f.id !== id))
  }

  const calPercent = Math.min(100, Math.round((totalCaloriesConsumed / DAILY_CALORIE_GOAL) * 100))

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Nutrition <span style={styles.uzText}>/ Ovqatlanish</span></h1>

      <div style={styles.calPanel}>
        <div style={styles.calStat}>
          <p style={styles.calLabel}>Consumed<br/><span style={styles.uzText}>Iste'mol</span></p>
          <p style={styles.calValue}>+{Math.round(totalCaloriesConsumed)}</p>
        </div>
        <div style={styles.calDivider} />
        <div style={styles.calStat}>
          <p style={styles.calLabel}>Burned<br/><span style={styles.uzText}>Yoqilgan</span></p>
          <p style={styles.calValue}>-{Math.round(caloriesBurned)}</p>
        </div>
        <div style={styles.calDivider} />
        <div style={styles.calStat}>
          <p style={styles.calLabel}>Net<br/><span style={styles.uzText}>Balans</span></p>
          <p style={styles.calValue}>{Math.round(caloriesNet)}</p>
        </div>
        <div style={styles.calDivider} />
        <div style={styles.calStat}>
          <p style={styles.calLabel}>Goal<br/><span style={styles.uzText}>Maqsad</span></p>
          <p style={styles.calValue}>2800</p>
        </div>
      </div>

      <div style={styles.progressBarWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={styles.labelSm}>Progress / Taraqqiyot</span>
          <span style={styles.labelSm}>{calPercent}%</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${calPercent}%` }} />
        </div>
      </div>

      <h2 style={styles.h2}>Daily food goals <span style={styles.uzText}>/ Kunlik oziq-ovqat maqsadlari</span></h2>
      <div style={styles.foodGrid}>
        {FOOD_ITEMS.map(item => {
          const logged = foodLog.filter(f => f.food_name === item.name).reduce((s, f) => s + Number(f.quantity), 0)
          const isGram = item.unit === 'g'
          const max = item.max || 5
          const step = item.step || 1
          return <FoodCard key={item.name} item={item} logged={logged} isGram={isGram} max={max} step={step} onLog={logFood} />
        })}
      </div>

      <h2 style={styles.h2}>Today's log <span style={styles.uzText}>/ Bugungi yozuv</span></h2>
      <div style={styles.list}>
        {foodLog.map(f => (
          <div key={f.id} style={styles.listItem}>
            <span style={{ flex: 1, fontSize: 14 }}>{f.food_name} — {f.quantity} {f.unit}</span>
            <span style={{ fontSize: 14, fontWeight: 500, marginRight: 12 }}>{Math.round(f.total_calories)} kcal</span>
            <button style={styles.deleteBtn} onClick={() => removeFood(f.id)}>×</button>
          </div>
        ))}
        {foodLog.length === 0 && <p style={styles.empty}>No food logged today / Bugun hech narsa yozilmagan</p>}
      </div>
    </div>
  )
}

function FoodCard({ item, logged, isGram, max, step, onLog }) {
  const [qty, setQty] = useState(step)
  return (
    <div style={styles.foodCard}>
      <span style={{ fontSize: 24 }}>{item.emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 1px', fontSize: 14, fontWeight: 500 }}>{item.name}</p>
        <p style={{ margin: '0 0 1px', fontSize: 11, color: '#aaa' }}>{item.nameUz}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{Math.round(item.cal_per_unit * (isGram ? 100 : 1))} kcal/{isGram ? '100g' : item.unit}</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#555' }}>Today / Bugun: {logged} {item.unit}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(step, q - step))}>−</button>
        <span style={{ fontSize: 14, minWidth: 32, textAlign: 'center' }}>{qty}</span>
        <button style={styles.qtyBtn} onClick={() => setQty(q => Math.min(max, q + step))}>+</button>
        <button style={styles.btnSmall} onClick={() => onLog(item, qty)}>✓</button>
      </div>
    </div>
  )
}

function WorkoutPage({ workoutLog, setWorkoutLog, dailyProgress, setDailyProgress, todayDay, today, supabase }) {
  const [stars, setStars] = useState(dailyProgress?.sport_stars || 0)
  const workout = WORKOUT_DAYS[todayDay]

  async function toggleExercise(exName, done) {
    const existing = workoutLog.find(w => w.exercise_name === exName)
    if (existing) {
      await supabase.from('workout_log').update({ completed: !done }).eq('id', existing.id)
      setWorkoutLog(prev => prev.map(w => w.exercise_name === exName ? { ...w, completed: !done } : w))
    } else {
      const dayType = workout?.label || 'Rest'
      const { data } = await supabase.from('workout_log').insert({ workout_date: today, day_type: dayType, exercise_name: exName, completed: true }).select().single()
      if (data) setWorkoutLog(prev => [...prev, data])
    }
  }

  async function saveStars(s) {
    setStars(s)
    const burned = workout?.calories || 0
    if (dailyProgress) {
      await supabase.from('daily_progress').update({ sport_stars: s, sport_done: s > 0, calories_burned: s > 0 ? burned : 0 }).eq('id', dailyProgress.id)
      setDailyProgress(prev => ({ ...prev, sport_stars: s, calories_burned: s > 0 ? burned : 0 }))
    } else {
      const { data } = await supabase.from('daily_progress').insert({ progress_date: today, sport_stars: s, sport_done: s > 0, calories_burned: s > 0 ? burned : 0 }).select().single()
      if (data) setDailyProgress(data)
    }
  }

  const isWorkoutDay = [1, 3, 5].includes(todayDay)

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Workout <span style={styles.uzText}>/ Sport</span></h1>
      {!isWorkoutDay ? (
        <div style={styles.restDay}>
          <p style={{ fontSize: 48, margin: 0 }}>◇</p>
          <p style={{ fontSize: 18, fontWeight: 500 }}>Rest day / Dam olish kuni</p>
          <p style={{ color: '#888', fontSize: 14 }}>Next workout: {todayDay < 1 ? 'Monday' : todayDay < 3 ? 'Wednesday' : todayDay < 5 ? 'Friday' : 'Monday'}</p>
        </div>
      ) : (
        <>
          <div style={styles.workoutHeader}>
            <div>
              <h2 style={{ ...styles.h2, margin: 0 }}>{workout.label}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{workout.labelUz}</p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>~{workout.calories} kcal if completed</p>
          </div>

          <div style={styles.list}>
            {workout.exercises.map(ex => {
              const done = workoutLog.find(w => w.exercise_name === ex.name)?.completed || false
              return (
                <div key={ex.name} style={{ ...styles.listItem, opacity: done ? 0.5 : 1 }}>
                  <button style={styles.checkBtn} onClick={() => toggleExercise(ex.name, done)}>
                    {done ? '✓' : '○'}
                  </button>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 15, textDecoration: done ? 'line-through' : 'none' }}>{ex.name}</span>
                    <span style={{ display: 'block', fontSize: 11, color: '#aaa' }}>{ex.nameUz}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{ex.sets} × {ex.reps}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={styles.starsSection}>
            <p style={styles.labelSm}>Rate today's workout / Bugungi mashqni baholang</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(s => (
                <button key={s} style={{ ...styles.starBtn, color: s <= stars ? '#000' : '#ddd' }} onClick={() => saveStars(s)}>★</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SkillsPage({ dailyProgress, setDailyProgress, today, supabase }) {
  const [engStars, setEngStars] = useState(dailyProgress?.english_stars || 0)
  const [pyStars, setPyStars] = useState(dailyProgress?.python_stars || 0)

  async function saveStars(field, val, setter) {
    setter(val)
    if (dailyProgress) {
      await supabase.from('daily_progress').update({ [field]: val }).eq('id', dailyProgress.id)
      setDailyProgress(prev => ({ ...prev, [field]: val }))
    } else {
      const { data } = await supabase.from('daily_progress').insert({ progress_date: today, [field]: val }).select().single()
      if (data) setDailyProgress(data)
    }
  }

  const skillSections = [
    {
      title: 'English', titleUz: 'Ingliz tili', field: 'english_stars', stars: engStars, setter: setEngStars,
      levels: [
        { level: 1, label: 'Beginner', labelUz: 'Boshlang\'ich', items: ['Learn 10 new words / 10 ta yangi so\'z', 'Practice alphabet / Alifbo mashq', 'Watch a short video / Qisqa video'] },
        { level: 2, label: 'Intermediate', labelUz: 'O\'rta', items: ['Read a short text / Qisqa matn', 'Write 5 sentences / 5 ta gap', 'Listen 15 min / 15 daqiqa tinglash'] },
        { level: 3, label: 'Advanced', labelUz: 'Yuqori', items: ['10-min conversation / 10 daqiqa suhbat', 'Write a paragraph / Paragraf yozish', 'Movie without subs / Subtitrsiז kino'] },
      ]
    },
    {
      title: 'Python / C++', titleUz: 'Dasturlash', field: 'python_stars', stars: pyStars, setter: setPyStars,
      levels: [
        { level: 1, label: 'Basics', labelUz: 'Asoslar', items: ['Variables / O\'zgaruvchilar', 'Print & input / Chiqarish va kiritish', 'Arithmetic / Arifmetika'] },
        { level: 2, label: 'Control flow', labelUz: 'Boshqaruv', items: ['If/else conditions / Shartlar', 'For & while loops / Sikllar', 'Simple functions / Oddiy funksiyalar'] },
        { level: 3, label: 'Intermediate', labelUz: 'O\'rta daraja', items: ['Lists & dicts / Ro\'yxat va lug\'at', 'File operations / Fayl ishlash', 'OOP basics / OOP asoslari'] },
      ]
    }
  ]

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Skills <span style={styles.uzText}>/ Ko'nikmalar</span></h1>
      {skillSections.map(s => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ ...styles.h2, margin: 0 }}>{s.title}</h2>
              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{s.titleUz}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3].map(n => (
                <button key={n} style={{ ...styles.starBtn, color: n <= s.stars ? '#000' : '#ddd' }} onClick={() => saveStars(s.field, n, s.setter)}>★</button>
              ))}
            </div>
          </div>
          {s.levels.map(lv => (
            <div key={lv.level} style={{ ...styles.skillLevel, borderLeft: `2px solid ${lv.level <= s.stars ? '#000' : '#eee'}` }}>
              <p style={{ margin: '0 0 2px', fontWeight: 500, fontSize: 14 }}>Level {lv.level} — {lv.label} <span style={styles.uzText}>/ {lv.labelUz}</span></p>
              {lv.items.map(item => (
                <p key={item} style={{ margin: '2px 0', fontSize: 13, color: '#555' }}>· {item}</p>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function NotesPage({ notes, setNotes, supabase }) {
  const [active, setActive] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function saveNote() {
    if (!content.trim()) return
    if (active) {
      await supabase.from('notes').update({ title, content, updated_at: new Date().toISOString() }).eq('id', active)
      setNotes(prev => prev.map(n => n.id === active ? { ...n, title, content } : n))
    } else {
      const { data } = await supabase.from('notes').insert({ title, content }).select().single()
      if (data) setNotes(prev => [data, ...prev])
    }
    setActive(null); setTitle(''); setContent('')
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (active === id) { setActive(null); setTitle(''); setContent('') }
  }

  function openNote(n) { setActive(n.id); setTitle(n.title || ''); setContent(n.content || '') }
  function newNote() { setActive(null); setTitle(''); setContent('') }

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ ...styles.h1, margin: 0 }}>Notes <span style={styles.uzText}>/ Eslatmalar</span></h1>
        <button style={styles.btnPrimary} onClick={newNote}>+ New / Yangi</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, height: 500 }}>
        <div style={{ borderRight: '1px solid #eee', paddingRight: 12, overflowY: 'auto' }}>
          {notes.map(n => (
            <div key={n.id} style={{ ...styles.noteItem, background: active === n.id ? '#f5f5f5' : 'transparent' }} onClick={() => openNote(n)}>
              <p style={{ margin: '0 0 2px', fontWeight: 500, fontSize: 14 }}>{n.title || 'Untitled'}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>{n.content?.substring(0, 40)}...</p>
              <button style={{ ...styles.deleteBtn, marginTop: 4 }} onClick={e => { e.stopPropagation(); deleteNote(n.id) }}>×</button>
            </div>
          ))}
          {notes.length === 0 && <p style={styles.empty}>No notes / Eslatma yo'q</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Title / Sarlavha" />
          <textarea style={{ ...styles.input, flex: 1, resize: 'none', fontFamily: 'DM Sans', lineHeight: 1.6 }} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note... / Eslatmangizni yozing..." />
          <button style={styles.btnPrimary} onClick={saveNote}>Save / Saqlash</button>
        </div>
      </div>
    </div>
  )
}

function ExpensesPage({ expenses, setExpenses, supabase }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('UZS')
  const [category, setCategory] = useState('')

  async function addExpense() {
    if (!title || !amount) return
    const { data } = await supabase.from('expenses').insert({ title, amount: Number(amount), currency, category, expense_date: new Date().toISOString().split('T')[0] }).select().single()
    if (data) setExpenses(prev => [data, ...prev])
    setTitle(''); setAmount(''); setCategory('')
  }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const totalUZS = expenses.filter(e => e.currency === 'UZS').reduce((s, e) => s + Number(e.amount), 0)
  const totalUSD = expenses.filter(e => e.currency === 'USD').reduce((s, e) => s + Number(e.amount), 0)

  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other'
    acc[cat] = (acc[cat] || 0) + Number(e.amount)
    return acc
  }, {})

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Expenses <span style={styles.uzText}>/ Xarajatlar</span></h1>
      <div style={styles.statsGrid}>
        <StatCard label="Total UZS" labelUz="Jami so'm" value={totalUZS.toLocaleString()} unit="so'm" color="#000" />
        <StatCard label="Total USD" labelUz="Jami dollar" value={`$${totalUSD.toFixed(2)}`} unit="dollar" color="#000" />
      </div>

      <div style={styles.inputRow}>
        <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Description / Tavsif" />
        <input style={{ ...styles.input, maxWidth: 120 }} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount / Summa" />
        <select style={styles.select} value={currency} onChange={e => setCurrency(e.target.value)}>
          <option value="UZS">UZS</option>
          <option value="USD">USD</option>
        </select>
        <input style={{ ...styles.input, maxWidth: 120 }} value={category} onChange={e => setCategory(e.target.value)} placeholder="Category / Kategoriya" />
        <button style={styles.btnPrimary} onClick={addExpense}>Add / Qo'sh</button>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={styles.h2}>By category <span style={styles.uzText}>/ Kategoriya bo'yicha</span></h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(byCategory).map(([cat, total]) => (
              <div key={cat} style={styles.catBadge}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{cat}</span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>{total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.list}>
        {expenses.map(e => (
          <div key={e.id} style={styles.listItem}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 15 }}>{e.title}</span>
              {e.category && <span style={styles.tag}>{e.category}</span>}
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>{e.expense_date}</span>
            </div>
            <span style={{ fontWeight: 500, marginRight: 12 }}>{e.amount.toLocaleString()} {e.currency}</span>
            <button style={styles.deleteBtn} onClick={() => deleteExpense(e.id)}>×</button>
          </div>
        ))}
        {expenses.length === 0 && <p style={styles.empty}>No expenses yet / Hali xarajat yo'q</p>}
      </div>
    </div>
  )
}

function ProgressPage({ supabase }) {
  const [history, setHistory] = useState([])
  const [workoutHistory, setWorkoutHistory] = useState([])

  useEffect(() => {
    supabase.from('daily_progress').select('*').order('progress_date', { ascending: false }).limit(30).then(({ data }) => { if (data) setHistory(data) })
    supabase.from('workout_log').select('*').order('workout_date', { ascending: false }).limit(60).then(({ data }) => { if (data) setWorkoutHistory(data) })
  }, [])

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Progress <span style={styles.uzText}>/ Taraqqiyot</span></h1>
      <div style={styles.list}>
        {history.map(d => (
          <div key={d.id} style={styles.progressItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{d.progress_date}</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13 }}>Sport {'★'.repeat(d.sport_stars || 0)}{'☆'.repeat(3 - (d.sport_stars || 0))}</span>
                <span style={{ fontSize: 13 }}>English {'★'.repeat(d.english_stars || 0)}{'☆'.repeat(3 - (d.english_stars || 0))}</span>
                <span style={{ fontSize: 13 }}>Python {'★'.repeat(d.python_stars || 0)}{'☆'.repeat(3 - (d.python_stars || 0))}</span>
              </div>
              {d.calories_burned > 0 && <span style={{ fontSize: 12, color: '#888' }}>-{d.calories_burned} kcal</span>}
            </div>
            {workoutHistory.filter(w => w.workout_date === d.progress_date).length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {workoutHistory.filter(w => w.workout_date === d.progress_date).map(w => (
                  <span key={w.id} style={{ ...styles.tag, background: w.completed ? '#000' : '#eee', color: w.completed ? '#fff' : '#aaa' }}>
                    {w.exercise_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {history.length === 0 && <p style={styles.empty}>No progress data yet / Hali ma'lumot yo'q. Start tracking!</p>}
      </div>
    </div>
  )
}

function ChatPage({ todos, setTodos, foodLog, dailyProgress, setDailyProgress, setPage, supabase, loadAll }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Salom Sardor! Men sizning shaxsiy AI assistantingizman. Dasturni boshqarish, sport, ovqat, ingliz tili yoki Python haqida savol bering.\n\nMasalan:\n• \"Vazifa qo'sh: kitob o'qi\"\n• \"Bugungi kaloriyam qancha?\"\n• \"Sport bo'limiga o't\"\n• \"Push-up texnikasini tushuntir\"" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const context = `
You are a personal AI assistant embedded in Sardor's life dashboard app. You speak Uzbek primarily.
Current data:
- Todos: ${JSON.stringify(todos.slice(0, 10))}
- Today's food log: ${JSON.stringify(foodLog.slice(0, 10))}
- Daily progress: ${JSON.stringify(dailyProgress)}
- Today's calories consumed: ${foodLog.reduce((s, f) => s + Number(f.total_calories), 0)} kcal
- Calorie goal: 2800 kcal

You can help Sardor with:
1. App management: add/remove tasks, navigate to sections
2. Workout advice (pull-up bar + resistance bands, 62kg, 176cm, 19 years old, goal: muscle building like physique in reference photo - 183cm, 85-90kg, 8-10% body fat, narrow waist, wide shoulders, 6-pack)
3. Nutrition advice (gaining weight/muscle, calorie goal 2800 kcal/day, foods: banana 90kcal, egg 70kcal, chicken 165kcal/100g, rice 130kcal/100g, milk 60kcal/glass, nuts 600kcal/100g, bread 80kcal/slice, cottage cheese 100kcal/100g, peanut butter 590kcal/100g, apple 80kcal)
4. English learning (beginner/elementary level)
5. Python/C++ learning (beginner level)
6. General motivation, advice, and life coaching

ALWAYS respond in Uzbek language unless user writes in English.
Be concise, friendly, and motivating.
If asked to add a task, say you added it and output: [ACTION:ADD_TODO:task_title]
If asked to navigate to a section, output: [ACTION:NAVIGATE:section_name] where section_name is: home, todo, food, workout, skills, notes, expenses, progress
      `
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: context,
          messages: [
            ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      })
      const data = await response.json()
      let reply = data.content?.[0]?.text || 'Xatolik yuz berdi'

      if (reply.includes('[ACTION:ADD_TODO:')) {
        const match = reply.match(/\[ACTION:ADD_TODO:(.+?)\]/)
        if (match) {
          const taskTitle = match[1]
          const { data: td } = await supabase.from('todos').insert({ title: taskTitle, priority: 'medium' }).select().single()
          if (td) setTodos(prev => [td, ...prev])
          reply = reply.replace(/\[ACTION:ADD_TODO:.+?\]/, '').trim()
        }
      }
      if (reply.includes('[ACTION:NAVIGATE:')) {
        const match = reply.match(/\[ACTION:NAVIGATE:(.+?)\]/)
        if (match) {
          setTimeout(() => setPage(match[1]), 1000)
          reply = reply.replace(/\[ACTION:NAVIGATE:.+?\]/, '').trim()
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xatolik yuz berdi. Qayta urinib ko\'ring.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ ...styles.page, display: 'flex', flexDirection: 'column', height: '90vh' }}>
      <h1 style={styles.h1}>AI Assistant <span style={styles.uzText}>/ AI Yordamchi</span></h1>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.chatMsg, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#000' : '#f5f5f5', color: m.role === 'user' ? '#fff' : '#000' }}>
            {m.content}
          </div>
        ))}
        {loading && <div style={{ ...styles.chatMsg, alignSelf: 'flex-start', background: '#f5f5f5', color: '#aaa' }}>Yozmoqda...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={styles.chatInputRow}>
        <input style={{ ...styles.input, flex: 1 }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Savol bering yoki buyruq bering... / Ask or command..." />
        <button style={styles.btnPrimary} onClick={sendMessage} disabled={loading}>Yuborish / Send</button>
      </div>
    </div>
  )
}

const styles = {
  app: { display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#fafaf8', color: '#111' },
  sidebar: { width: 200, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, overflowY: 'auto' },
  logo: { fontSize: 24, fontWeight: 600, textAlign: 'center', marginBottom: 24, letterSpacing: -1 },
  navBtn: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', textAlign: 'left', transition: 'all 0.15s' },
  navActive: { color: '#000', background: '#f5f5f5', fontWeight: 500 },
  navIcon: { fontSize: 14, width: 16, flexShrink: 0 },
  navLabel: { display: 'flex', flexDirection: 'column' },
  navLabelUz: { fontSize: 10, color: '#bbb', fontWeight: 400 },
  main: { marginLeft: 200, flex: 1, padding: '0 0 40px' },
  page: { maxWidth: 800, margin: '0 auto', padding: '40px 32px' },
  pageHeader: { marginBottom: 32 },
  h1: { fontSize: 28, fontWeight: 500, margin: '0 0 4px', letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: 500, margin: '24px 0 12px', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#888', margin: 0 },
  uzText: { fontSize: '0.75em', color: '#bbb', fontWeight: 400 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '16px' },
  statLabel: { fontSize: 11, color: '#aaa', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.4 },
  statValue: { fontSize: 26, fontWeight: 500, margin: '0 0 2px', letterSpacing: -1 },
  statUnit: { fontSize: 12, color: '#aaa', margin: 0 },
  progressBarWrap: { marginBottom: 24 },
  progressTrack: { height: 4, background: '#eee', borderRadius: 2 },
  progressFill: { height: '100%', background: '#000', borderRadius: 2, transition: 'width 0.4s ease' },
  labelSm: { fontSize: 13, color: '#888', margin: 0 },
  workoutBanner: { display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '16px 20px', marginBottom: 24, cursor: 'pointer' },
  skillsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  skillCard: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 16, cursor: 'pointer' },
  inputRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  input: { padding: '9px 12px', border: '1px solid #eee', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans', outline: 'none', flex: 1, background: '#fff', color: '#111' },
  select: { padding: '9px 12px', border: '1px solid #eee', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans', background: '#fff', color: '#111', cursor: 'pointer' },
  btnPrimary: { padding: '9px 18px', background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500, whiteSpace: 'nowrap' },
  btnSmall: { padding: '4px 10px', background: '#000', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  filterRow: { display: 'flex', gap: 6, marginBottom: 16 },
  filterBtn: { padding: '6px 14px', border: '1px solid #eee', borderRadius: 20, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#888' },
  filterActive: { background: '#000', color: '#fff', borderColor: '#000' },
  list: { display: 'flex', flexDirection: 'column', gap: 2 },
  listItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, transition: 'opacity 0.2s' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#000', padding: '0 4px', minWidth: 24 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ccc', padding: '0 4px', lineHeight: 1 },
  tag: { display: 'inline-block', background: '#f5f5f5', borderRadius: 4, padding: '1px 6px', fontSize: 12, color: '#888', marginLeft: 6 },
  empty: { color: '#bbb', fontSize: 14, textAlign: 'center', padding: '32px 0', margin: 0 },
  calPanel: { display: 'flex', background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '20px', marginBottom: 20, gap: 0 },
  calStat: { flex: 1, textAlign: 'center' },
  calLabel: { fontSize: 11, color: '#aaa', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.4 },
  calValue: { fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: -0.5 },
  calDivider: { width: 1, background: '#eee', margin: '0 8px' },
  foodGrid: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 },
  foodCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8 },
  qtyBtn: { width: 28, height: 28, border: '1px solid #eee', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  starsSection: { marginTop: 24, padding: '16px', background: '#fff', border: '1px solid #eee', borderRadius: 10 },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, padding: '0 2px', transition: 'color 0.15s' },
  restDay: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 8, color: '#888' },
  workoutHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '16px', background: '#fff', border: '1px solid #eee', borderRadius: 10 },
  skillLevel: { padding: '10px 16px', marginBottom: 8 },
  noteItem: { padding: '10px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, position: 'relative' },
  progressItem: { padding: '12px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 4 },
  chatBox: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '16px', background: '#fff', border: '1px solid #eee', borderRadius: 12, marginBottom: 12 },
  chatMsg: { maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  chatInputRow: { display: 'flex', gap: 8 },
  catBadge: { padding: '4px 10px', background: '#f5f5f5', borderRadius: 6, display: 'flex', gap: 4, alignItems: 'center' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 },
  loadingDot: { width: 8, height: 8, background: '#000', borderRadius: '50%' },
}
