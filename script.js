(() => {
  // Simple client-side match updater stored in localStorage
  const defaultState = {
    homeTeam: 'Home',
    awayTeam: 'Away',
    homeScore: 0,
    awayScore: 0,
    time: '00:00',
    events: []
  }

  const STORAGE_KEY = 'football-match-state-v1'

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if(!raw) return {...defaultState}
      return {...defaultState, ...JSON.parse(raw)}
    }catch(e){
      console.error('Failed to load state', e)
      return {...defaultState}
    }
  }

  function saveState(s){
    try{localStorage.setItem(STORAGE_KEY, JSON.stringify(s))}catch(e){console.error('Failed to save', e)}
  }

  let state = loadState()

  // Elements
  const homeTeamEl = document.getElementById('home-team')
  const awayTeamEl = document.getElementById('away-team')
  const homeScoreEl = document.getElementById('home-score')
  const awayScoreEl = document.getElementById('away-score')
  const matchTimeEl = document.getElementById('match-time')
  const eventsList = document.getElementById('events-list')

  const form = document.getElementById('update-form')
  const eventType = document.getElementById('event-type')
  const eventTeam = document.getElementById('event-team')
  const eventPlayer = document.getElementById('event-player')
  const eventMinute = document.getElementById('event-minute')
  const resetBtn = document.getElementById('reset-btn')
  const swapBtn = document.getElementById('swap-btn')

  function render(){
    homeTeamEl.textContent = state.homeTeam
    awayTeamEl.textContent = state.awayTeam
    homeScoreEl.textContent = state.homeScore
    awayScoreEl.textContent = state.awayScore
    matchTimeEl.textContent = state.time

    eventsList.innerHTML = ''
    state.events.slice().reverse().forEach((ev) => {
      const li = document.createElement('li')
      li.className = 'event'
      const left = document.createElement('div')
      left.className = 'left'
      const label = document.createElement('div')
      label.className = 'label'
      label.textContent = ev.type.toUpperCase()
      const desc = document.createElement('div')
      desc.innerHTML = `<strong>${ev.team === 'home' ? state.homeTeam : state.awayTeam}</strong> — ${escapeHtml(ev.player || ev.desc || '')}`
      const minute = document.createElement('div')
      minute.className = 'small'
      minute.textContent = ev.minute ? `${ev.minute}'` : ''
      left.appendChild(label)
      left.appendChild(desc)
      li.appendChild(left)
      li.appendChild(minute)
      eventsList.appendChild(li)
    })
  }

  function escapeHtml(s){
    if(!s) return ''
    return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const type = eventType.value
    const team = eventTeam.value
    const player = eventPlayer.value.trim()
    const minute = eventMinute.value ? eventMinute.value.trim() : ''

    const ev = { type, team, player, minute, createdAt: Date.now() }
    state.events.push(ev)

    if(type === 'goal'){
      if(team === 'home') state.homeScore++
      else state.awayScore++
    }

    saveState(state)
    render()

    // clear inputs
    eventPlayer.value = ''
    eventMinute.value = ''
  })

  resetBtn.addEventListener('click', () => {
    if(!confirm('Reset match and clear events?')) return
    state = {...defaultState}
    saveState(state)
    render()
  })

  swapBtn.addEventListener('click', () => {
    const tmpName = state.homeTeam
    state.homeTeam = state.awayTeam
    state.awayTeam = tmpName

    const tmpScore = state.homeScore
    state.homeScore = state.awayScore
    state.awayScore = tmpScore

    // adjust existing event labels by swapping team keys
    state.events = state.events.map(ev => ({...ev, team: ev.team === 'home' ? 'away' : 'home'}))

    saveState(state)
    render()
  })

  // initial render
  render()

  // allow editing match title/time by double-clicking header
  document.querySelector('header').addEventListener('dblclick', () => {
    const home = prompt('Home team name', state.homeTeam)
    if(home !== null) state.homeTeam = home
    const away = prompt('Away team name', state.awayTeam)
    if(away !== null) state.awayTeam = away
    const time = prompt('Match time text', state.time)
    if(time !== null) state.time = time
    saveState(state)
    render()
  })

})();
