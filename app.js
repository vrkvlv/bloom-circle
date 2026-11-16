// Bloom Circle — clickable prototype (plain JS, no build step)

// ---------- data ----------
const ACTIVITIES = [
  { name: 'Running', color: '#E8A07E' },
  { name: 'Yoga',    color: '#B8B58F' },
  { name: 'Gym',     color: '#E3D5C7' },
  { name: 'Walks',   color: '#CFC9B0' },
  { name: 'Cycling', color: '#F0C4A8' },
  { name: 'Dance',   color: '#D6D3B5' },
];

// the six on the onboarding grid; anything the user types in is appended to ACTIVITIES
const BASE_ACTIVITIES = ACTIVITIES.slice();

const PEOPLE = [
  { name: 'Sofia', age: 21, act: 'Running', dist: '1.2 km', when: 'Tomorrow · 7:00 AM', vibe: 94, mutual: true,
    tags: ['Morning run', '5 km', 'Easy pace'], bio: 'Training for my first 10K and need someone to keep me honest. Coffee after?',
    plan: 'Morning run · 5 km', planWhen: 'Tomorrow, 7:00 · Park entrance', bg: '#B8B58F', blob: '#6E6B4A',
    hello: 'Hiii! Finally someone who runs before 8 😅 what pace are you usually?' },
  { name: 'Max', age: 23, act: 'Running', dist: '800 m', when: 'Today · 6:30 PM', vibe: 88, mutual: false,
    tags: ['Park run', 'Podcasts', 'Chill'], bio: 'Evening runs along the river. I talk a lot, you can just nod.',
    plan: 'Evening run · 4 km', planWhen: 'Today, 18:30 · River bank', bg: '#8C8A68', blob: '#F5F2EC',
    hello: 'Hey! River run tonight?' },
  { name: 'Olha', age: 20, act: 'Yoga', dist: '2.4 km', when: 'Sat · 9:00 AM', vibe: 91, mutual: true,
    tags: ['Outdoor yoga', 'Beginner', 'Mats ready'], bio: 'Yoga in the park on weekends. Bring a mat, I bring good vibes.',
    plan: 'Park yoga · 1 h', planWhen: 'Saturday, 9:00 · Botanical garden', bg: '#D9774B', blob: '#F5F2EC',
    hello: 'Hi! Have you done yoga outdoors before? 🌿' },
  { name: 'Dmytro', age: 22, act: 'Gym', dist: '1.8 km', when: 'Mon · 8:00 PM', vibe: 79, mutual: false,
    tags: ['Leg day', 'Spotter', 'Consistent'], bio: 'Looking for a gym buddy who will not skip leg day.',
    plan: 'Gym session', planWhen: 'Monday, 20:00 · SportLife', bg: '#CFC9B0', blob: '#D9774B',
    hello: 'Yo! Ready for leg day?' },
  { name: 'Anna', age: 24, act: 'Walks', dist: '600 m', when: 'Sun · 11:00 AM', vibe: 96, mutual: true,
    tags: ['City walks', 'Coffee', '10k steps'], bio: 'Long walks around Podil, coffee stops are mandatory.',
    plan: 'City walk · 2 h', planWhen: 'Sunday, 11:00 · Kontraktova sq.', bg: '#E8A07E', blob: '#6E6B4A',
    hello: 'Hello! I know the best coffee spots on the route ☕' },
  { name: 'Ira', age: 19, act: 'Dance', dist: '3.1 km', when: 'Wed · 7:00 PM', vibe: 85, mutual: true,
    tags: ['K-pop', 'Studio', 'Fun > perfect'], bio: 'Dance classes are more fun with a friend. Zero experience is fine!',
    plan: 'Dance class', planWhen: 'Wednesday, 19:00 · Studio 5', bg: '#D6D3B5', blob: '#D9774B',
    hello: 'Heyy, are you ready to embarrass ourselves together? 💃' },
  { name: 'Taras', age: 21, act: 'Cycling', dist: '2.0 km', when: 'Sat · 10:00 AM', vibe: 82, mutual: false,
    tags: ['Trukhaniv', '20 km', 'Chill pace'], bio: 'Weekend rides to Trukhaniv island. I always bring snacks.',
    plan: 'Bike ride · 20 km', planWhen: 'Saturday, 10:00 · Pishokhidnyi bridge', bg: '#F0C4A8', blob: '#6E6B4A',
    hello: 'Hey! Got a bike or need a rental?' },
];

// "Change time" rewrites planWhen, so keep the originals for Reset demo
const ORIGINAL_PLAN = PEOPLE.map((p) => p.planWhen);

const REPLIES = [
  'Sounds perfect!', 'Haha yes 😄', 'Deal, see you there 🌼', 'Great, I\'ll text you when I leave',
  'Ooh nice, can\'t wait', 'Totally agree',
];
const TIMES = ['7:00', '7:30', '8:00', '18:30', '19:00'];

// ---------- state ----------
const state = {
  selected: new Set(['Running', 'Yoga', 'Walks']),
  filter: 'All',
  queue: [],
  match: null,
  chats: {},          // name -> [{from, text}]
  confirmed: {},      // name -> bool
  timeIdx: 0,
  when: 'Mornings',   // onboarding segment + profile availability grid
  slots: new Set(),   // "day-part" cells picked in the profile grid
  dist: 3,            // km, shared by every distance slider
  unread: {},         // name -> bool, drives the tabbar dot
  mode: 'view',       // profile: view | edit | preview
};

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ---------- navigation ----------
function go(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.go === id));
  if (id === 'discover') renderDeck();
  if (id === 'chat') renderChat();
  if (id === 'chats') renderChatList();
  if (id === 'liveness') resetLiveness();
  if (id === 'profile') { state.mode = 'view'; renderProfile(); }
}
function chatDot() {
  const any = Object.keys(state.unread).some((n) => state.unread[n]);
  document.querySelectorAll('.chatdot').forEach((d) => { d.hidden = !any; });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b && !b.disabled) go(b.dataset.go);
});

let toastTimer;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

// ---------- onboarding ----------
function renderActivities() {
  const grid = $('#actGrid');
  grid.innerHTML = '';
  ACTIVITIES.forEach((a) => {
    const on = state.selected.has(a.name);
    const b = el('button', 'act' + (on ? ' on' : ''), `<span class="dot"></span><span>${a.name}</span>`);
    b.style.background = on ? a.color : '#fff';
    b.setAttribute('aria-pressed', on);
    b.onclick = () => {
      if (on && state.selected.size === 1) { toast('Pick at least one activity'); return; }
      on ? state.selected.delete(a.name) : state.selected.add(a.name);
      syncActivities();
    };
    grid.appendChild(b);
  });
}

document.querySelectorAll('#timeSeg button').forEach((b) => {
  b.onclick = () => setWhen(b.textContent);
});

$('#dist').oninput = (e) => setDist(e.target.value);

// ---------- discover ----------
function buildQueue() {
  state.queue = PEOPLE.filter((p) => {
    let distKm = 0;
    if (p.dist.includes('km')) {
      distKm = parseFloat(p.dist);
    } else if (p.dist.includes('m')) {
      distKm = parseFloat(p.dist) / 1000;
    }

    const matchesActivity = state.selected.has(p.act);
    const matchesFilter = (state.filter === 'All' || p.act === state.filter);
    const matchesDistance = distKm <= state.dist;

    return matchesActivity && matchesFilter && matchesDistance;
  });

  renderChips();
  renderDeck();
}

function renderChips() {
  const box = $('#chips');
  box.innerHTML = '';
  ['All', ...ACTIVITIES.map((a) => a.name).filter((n) => state.selected.has(n))].forEach((name) => {
    const c = el('button', 'chip' + (state.filter === name ? ' on' : ''), name);
    c.onclick = () => { state.filter = name; buildQueue(); };
    box.appendChild(c);
  });
}

function cardHTML(p) {
  return `
    <div class="photo" style="background:${p.bg}">
      <div class="blob" style="background:${p.blob}"></div>
      <svg class="flower" viewBox="0 0 100 100" aria-hidden="true"><use href="#flower6"/><circle cx="50" cy="50" r="15" fill="#D9774B"/></svg>
      <span class="ph-label">[PROFILE PHOTO]</span>
      <span class="vibe"><svg viewBox="0 0 24 24"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/></svg>${p.vibe}% vibe</span>
      <span class="stamp yes">BLOOM</span><span class="stamp no">NOPE</span>
    </div>
    <div class="info">
      <div class="row-between"><span class="name">${p.name}, ${p.age}</span><span class="distance">${p.dist} away</span></div>
      <div class="when"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${p.when}</div>
      <div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
      <p class="bio">${p.bio}</p>
    </div>`;
}

function renderDeck() {
  const deck = $('#deck');
  deck.querySelectorAll('.card').forEach((c) => c.remove());
  $('#empty').classList.toggle('show', state.queue.length === 0);
  // render up to 2 cards, the second sits underneath
  state.queue.slice(0, 2).reverse().forEach((p, i, arr) => {
    const c = el('div', 'card', cardHTML(p));
    const isTop = i === arr.length - 1;
    if (!isTop) c.classList.add('under');
    else attachDrag(c);
    deck.appendChild(c);
  });
}

function topCard() { return $('#deck .card:not(.under)'); }

function attachDrag(card) {
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
  const yes = card.querySelector('.stamp.yes');
  const no = card.querySelector('.stamp.no');

  card.addEventListener('pointerdown', (e) => {
    dragging = true; startX = e.clientX; startY = e.clientY; dx = dy = 0;
    card.setPointerCapture(e.pointerId);
    card.classList.add('dragging');
  });
  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX; dy = e.clientY - startY;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`;
    yes.style.opacity = Math.max(0, Math.min(1, dx / 90));
    no.style.opacity = Math.max(0, Math.min(1, -dx / 90));
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    if (dx > 100) swipe('right');
    else if (dx < -100) swipe('left');
    else { card.style.transform = ''; yes.style.opacity = 0; no.style.opacity = 0; }
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

function swipe(dir, superLike = false) {
  const card = topCard();
  if (!card || !state.queue.length) return;
  const person = state.queue[0];
  card.querySelector(dir === 'right' ? '.stamp.yes' : '.stamp.no').style.opacity = 1;
  card.style.transform = `translate(${dir === 'right' ? 520 : -520}px, -40px) rotate(${dir === 'right' ? 28 : -28}deg)`;
  card.style.opacity = 0;

  state.queue.shift();
  const under = $('#deck .card.under');
  if (under) under.classList.remove('under');

  setTimeout(() => {
    renderDeck();
    if (dir === 'right') {
      if (person.mutual || superLike) openMatch(person);
      else toast(superLike ? 'Invite sent ⚡' : `Liked ${person.name} — waiting for a bloom 🌱`);
    }
  }, 320);
}

$('#btnSkip').onclick = () => swipe('left');
$('#btnLike').onclick = () => swipe('right');
$('#btnInvite').onclick = () => { if (state.queue.length) { toast('Invite sent ⚡'); swipe('right', true); } };
$('#restart').onclick = () => { state.filter = 'All'; buildQueue(); };

// ---------- match ----------
function openMatch(p) {
  state.match = p;
  if (!state.chats[p.name]) state.chats[p.name] = [{ from: 'them', text: p.hello }];
  const verb = { Running: 'a run', Yoga: 'some yoga', Gym: 'a gym session', Walks: 'a long walk', Cycling: 'a bike ride', Dance: 'a dance class' }[p.act];
  $('#matchText').textContent = `You and ${p.name} both want ${verb} — ${p.when.split(' · ')[0].toLowerCase()}.`;
  $('#matchAv').textContent = p.name[0];
  $('#matchPlan').textContent = p.plan;
  $('#matchWhen').textContent = p.planWhen;
  $('#sayHi').textContent = `Say hi to ${p.name}`;
  state.unread[p.name] = true;
  chatDot();
  go('match');
}
$('#sayHi').onclick = () => openChat(state.match.name);

// ---------- chat list ----------
function openChat(name) {
  state.match = PEOPLE.find((p) => p.name === name);
  state.unread[name] = false;
  chatDot();
  go('chat');
}

function renderChatList() {
  const box = $('#chatList');
  box.innerHTML = '';
  const names = Object.keys(state.chats);
  $('#chatsEmpty').hidden = names.length > 0;
  names.forEach((name) => {
    const p = PEOPLE.find((x) => x.name === name);
    const msgs = state.chats[name];
    const last = msgs[msgs.length - 1];
    const unread = !!state.unread[name];
    const row = el('button', 'chat-row' + (unread ? ' unread' : ''), `
      <span class="av sm" style="background:${p.bg}">${p.name[0]}</span>
      <span class="cr-text">
        <span class="cr-top"><b>${p.name}, ${p.age}</b><span class="cr-when">${p.act}</span></span>
        <span class="cr-last">${last.from === 'me' ? 'You: ' : ''}${esc(last.text)}</span>
      </span>
      ${unread ? '<span class="cr-dot"></span>' : ''}`);
    row.onclick = () => openChat(name);
    box.appendChild(row);
  });
}

// ---------- chat ----------
function renderChat() {
  const p = state.match || PEOPLE[0];
  if (!state.match) { state.match = p; state.chats[p.name] = state.chats[p.name] || [{ from: 'them', text: p.hello }]; }
  $('#chatAv').textContent = p.name[0];
  $('#chatName').textContent = `${p.name}, ${p.age}`;
  $('#planTitle').textContent = p.plan;
  $('#planWhen').textContent = p.planWhen;
  const ok = !!state.confirmed[p.name];
  $('#planBadge').textContent = ok ? 'Confirmed' : 'Pending';
  $('#planBadge').classList.toggle('ok', ok);
  $('#btnIn').textContent = ok ? 'You\'re in ✓' : 'I\'m in';

  const box = $('#msgs');
  box.innerHTML = '<span class="time">Today</span>';
  state.chats[p.name].forEach((m) => box.appendChild(el('div', 'msg ' + m.from, m.text)));
  box.scrollTop = box.scrollHeight;
}

// is this person's conversation the one on screen right now?
function isOpen(p) { return state.match === p && $('#chat').classList.contains('active'); }

function addMsg(from, text, person) {
  const p = person || state.match;
  state.chats[p.name].push({ from, text });
  if (isOpen(p)) {
    const m = el('div', 'msg ' + from);
    m.textContent = text;
    $('#msgs').appendChild(m);
    $('#msgs').scrollTop = $('#msgs').scrollHeight;
  } else if (from === 'them') {
    state.unread[p.name] = true;
    chatDot();
  }
}

function fakeReply() {
  const p = state.match;
  const box = $('#msgs');
  const typing = el('div', 'msg them typing', 'typing…');
  setTimeout(() => {
    if (!isOpen(p)) return;
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;
    $('#chatStatus').textContent = '● typing…';
  }, 400);
  setTimeout(() => {
    typing.remove();
    if (isOpen(p)) $('#chatStatus').textContent = '● online';
    addMsg('them', REPLIES[Math.floor(Math.random() * REPLIES.length)], p);
  }, 1600);
}

$('#composer').onsubmit = (e) => {
  e.preventDefault();
  const input = $('#msgInput');
  const text = input.value.trim();
  if (!text) return;
  addMsg('me', text);
  input.value = '';
  fakeReply();
};

$('#quick').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.textContent === 'Safety tips') {
    addMsg('them', '🛡️ Bloom tip: meet in a public place, tell a friend where you\'re going, and share your live location.');
    return;
  }
  const text = b.textContent === 'Share location' ? '📍 Shared my live location' : 'Running 10 min late, sorry! 🙈';
  addMsg('me', text);
  fakeReply();
});

$('#btnIn').onclick = () => {
  const p = state.match;
  state.confirmed[p.name] = !state.confirmed[p.name];
  renderChat();
  if (state.confirmed[p.name]) toast('Plan confirmed 🌼');
};

$('#btnTime').onclick = () => {
  const p = state.match;
  state.timeIdx = (state.timeIdx + 1) % TIMES.length;
  p.planWhen = p.planWhen.replace(/\d{1,2}:\d{2}/, TIMES[state.timeIdx]);
  state.confirmed[p.name] = false;
  renderChat();
  toast(`Suggested ${TIMES[state.timeIdx]} instead`);
};

// ---------- keyboard shortcuts on discover (arrows) ----------
document.addEventListener('keydown', (e) => {
  if (!$('#discover').classList.contains('active')) return;
  if (e.key === 'ArrowRight') swipe('right');
  if (e.key === 'ArrowLeft') swipe('left');
});

// ---------- profile: data ----------
const LEVELS = ['Beginner', 'Regular', 'Pro'];
// typing "ten" should offer Tennis — the six on the grid are just the common ones
const SUGGESTIONS = [
  'Tennis', 'Table tennis', 'Badminton', 'Padel', 'Swimming', 'Climbing', 'Bouldering',
  'Boxing', 'Martial arts', 'Pilates', 'Stretching', 'Crossfit', 'Calisthenics',
  'Hiking', 'Trail running', 'Skating', 'Roller skating', 'Skiing', 'Snowboarding',
  'Surfing', 'Kayaking', 'Rowing', 'Basketball', 'Football', 'Volleyball',
  'Golf', 'Horse riding', 'Jump rope', 'Frisbee', 'Zumba',
];
const TINTS = ['#E8A07E', '#B8B58F', '#E3D5C7', '#CFC9B0', '#F0C4A8', '#D6D3B5'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const PARTS = ['Morning', 'Afternoon', 'Evening'];
const LOOKING = ['Training partner', 'Casual company', 'Motivation buddy', 'New friends'];
const VIBES = ['Chatty', 'Quiet focus', 'Early bird', 'Night owl'];

// the onboarding time options, written as "day-part" cells of the profile grid
const PRESETS = {
  Mornings: DAYS.map((d, i) => i + '-0'),
  Evenings: DAYS.map((d, i) => i + '-2'),
  Weekends: [5, 6].map((d) => PARTS.map((p, j) => d + '-' + j)).flat(),
};

const DEFAULT_PROFILE = {
  name: 'Alex',
  age: 22,
  city: 'Kyiv · Podil',
  bio: 'Trail runs before work, long walks after. Looking for someone who shows up even when it rains.',
  photos: [null, null, null],
  levels: { Running: 'Regular', Yoga: 'Beginner', Walks: 'Pro' },
  looking: [],
  vibes: [],
  meetups: 3,
  streak: 2,
  visible: true,
  ageMin: 18,
  ageMax: 35,
  notif: { matches: true, messages: true, reminders: true },
};

const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/></svg>';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>';

const BADGES = [
  { name: 'First bloom', how: 'Get your first match', has: () => Object.keys(state.chats).length > 0 },
  { name: 'Early bird', how: 'Pick a morning slot in Availability', has: () => DAYS.some((d, i) => state.slots.has(i + '-0')) },
  { name: 'Chatty', how: 'Send a message in a chat', has: () => Object.keys(state.chats).some((n) => state.chats[n].some((m) => m.from === 'me')) },
  { name: '5 meetups', how: 'Meet five buddies in real life', has: () => myProfile.meetups >= 5 },
  { name: 'All set', how: 'Fill your profile to 100%', has: () => completeness() === 100 },
];

let myProfile = clone(DEFAULT_PROFILE);
let ageBad = false;

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ---------- profile: shared with onboarding and discover ----------
function setWhen(name) {
  state.when = name;
  state.slots = new Set(PRESETS[name] || []);
  syncWhen();
  renderAvail();
  refreshMeta();
}

// editing the grid can land back on one of the onboarding presets
function deriveWhen() {
  const picked = [...state.slots].sort().join();
  state.when = Object.keys(PRESETS).find((n) => PRESETS[n].slice().sort().join() === picked) || 'Custom';
  syncWhen();
}

function syncWhen() {
  document.querySelectorAll('#timeSeg button').forEach((b) => b.classList.toggle('on', b.textContent === state.when));
}

function setDist(v) {
  state.dist = Number(v);
  ['#dist', '#profDist', '#setDist'].forEach((sel) => {
    const r = $(sel);
    r.value = state.dist;
    r.style.setProperty('--p', ((state.dist - 1) / 9 * 100) + '%');
  });
  const text = `up to ${state.dist} km`;
  ['#distVal', '#profDistVal', '#setDistVal'].forEach((sel) => { $(sel).textContent = text; });
  renderPreview();
}

function syncActivities() {
  state.selected.forEach((n) => { myProfile.levels[n] = myProfile.levels[n] || LEVELS[0]; });
  state.filter = 'All';
  renderActivities();
  buildQueue();
  renderActs();
  renderActPicker();
  refreshMeta();
}

// ---------- profile: completeness ----------
function completeness() {
  const filled = [
    myProfile.name.trim() !== '',
    !ageBad && myProfile.age >= 18,
    myProfile.bio.trim() !== '',
    state.selected.size > 0,
    state.slots.size > 0,
    myProfile.looking.length > 0,
    myProfile.vibes.length > 0,
  ];
  return Math.round(filled.filter(Boolean).length / filled.length * 100);
}

// everything that only reads the data — safe to call while a field has focus
function refreshMeta() {
  const pct = completeness();
  $('#profPct').textContent = pct + '%';
  $('#profComplete').textContent = `Profile ${pct}% complete`;
  $('#profRing').style.setProperty('--p', pct + '%');
  $('#statMeetups').textContent = myProfile.meetups;
  $('#statBuddies').textContent = Object.keys(state.chats).length;
  $('#statStreak').textContent = myProfile.streak;
  renderBadges();
  renderPreview();
}

// ---------- profile: render ----------
function renderProfile() {
  loadFields();
  renderActPicker();
  setMode(state.mode);
  refreshMeta();
}

function loadFields() {
  $('#profName').value = myProfile.name;
  sizeName();
  $('#profAge').value = myProfile.age;
  $('#profBio').value = myProfile.bio;
  $('#bioCount').textContent = myProfile.bio.length + '/150';
  ageBad = false;
  $('#profAge').classList.remove('bad');
  $('#ageHint').hidden = true;
}

// let the name input shrink to its text, so the age sits right after it
// reading mode: let the bio take exactly the height its text needs
function fitBio() {
  const bio = $('#profBio');
  bio.style.height = '';
  if (state.mode !== 'edit') bio.style.height = bio.scrollHeight + 'px';
}

function sizeName() {
  const i = $('#profName');
  const m = $('#nameMeasure');
  m.textContent = i.value || 'Name';
  i.style.width = (m.offsetWidth + 2) + 'px';
}

function renderPhotoSlots() {
  const box = $('#photoSlots');
  box.hidden = state.mode !== 'edit';
  box.innerHTML = '';
  myProfile.photos.forEach(() => {
    const b = el('button', 'p-slot', '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>');
    b.setAttribute('aria-label', 'Add photo');
    b.onclick = () => toast('Photo upload coming soon');
    box.appendChild(b);
  });
}

function renderActs() {
  const box = $('#profActs');
  box.innerHTML = '';
  ACTIVITIES.filter((a) => state.selected.has(a.name)).forEach((a) => {
    const lvl = myProfile.levels[a.name] || LEVELS[0];
    const b = el('button', 'p-chip on', `${a.name} <span class="lvl">· ${lvl}</span>`);
    b.style.background = a.color;
    b.disabled = state.mode !== 'edit';
    b.setAttribute('aria-label', `${a.name}, level ${lvl}` + (b.disabled ? '' : ', tap to change'));
    b.onclick = () => {
      myProfile.levels[a.name] = LEVELS[(LEVELS.indexOf(lvl) + 1) % LEVELS.length];
      renderActs();
      refreshMeta();
    };
    box.appendChild(b);
  });
}

function renderActPicker() {
  const box = $('#actPickGrid');
  box.innerHTML = '';
  ACTIVITIES.forEach((a) => {
    const on = state.selected.has(a.name);
    const b = el('button', 'p-pick' + (on ? ' on' : ''), `<span class="box"></span><span>${a.name}</span>`);
    b.style.background = on ? a.color : '#fff';
    b.setAttribute('aria-pressed', on);
    b.onclick = () => {
      if (on && state.selected.size === 1) { toast('Pick at least one activity'); return; }
      on ? state.selected.delete(a.name) : state.selected.add(a.name);
      syncActivities();
    };
    box.appendChild(b);
  });
}

// add an activity of your own; it joins the grid, the filters and onboarding
function addActivity(raw) {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (!name) return;
  const nice = name[0].toUpperCase() + name.slice(1);
  const known = ACTIVITIES.find((a) => a.name.toLowerCase() === nice.toLowerCase());
  if (known) {
    if (state.selected.has(known.name)) { toast(`${known.name} is already on your list`); return; }
    state.selected.add(known.name);
  } else {
    ACTIVITIES.push({ name: nice, color: TINTS[ACTIVITIES.length % TINTS.length] });
    state.selected.add(nice);
  }
  $('#actInput').value = '';
  renderSuggest();
  syncActivities();
  toast(`${known ? known.name : nice} added`);
}

function renderSuggest() {
  const box = $('#actSuggest');
  const q = $('#actInput').value.trim().toLowerCase();
  box.innerHTML = '';
  if (!q) return;
  const pool = SUGGESTIONS.concat(ACTIVITIES.map((a) => a.name));
  const hits = [...new Set(pool)]
    .filter((n) => n.toLowerCase().includes(q) && !state.selected.has(n))
    .sort((a, b) => a.toLowerCase().indexOf(q) - b.toLowerCase().indexOf(q))
    .slice(0, 4);
  hits.forEach((n) => {
    const b = el('button', 'p-sug', n);
    b.onclick = () => addActivity(n);
    box.appendChild(b);
  });
}

function renderAvail() {
  const box = $('#profAvail');
  box.innerHTML = '';
  PARTS.forEach((part, pi) => {
    const row = el('div', 'p-arow', `<span class="p-alabel">${part}</span>`);
    const days = el('div', 'p-days');
    DAYS.forEach((d, di) => {
      const key = di + '-' + pi;
      const on = state.slots.has(key);
      const b = el('button', 'p-cell' + (on ? ' on' : ''), d);
      b.disabled = state.mode !== 'edit';
      b.setAttribute('aria-label', `${part}, ${d}`);
      b.setAttribute('aria-pressed', on);
      b.onclick = () => {
        const was = state.slots.has(key);
        was ? state.slots.delete(key) : state.slots.add(key);
        b.classList.toggle('on', !was);
        b.setAttribute('aria-pressed', !was);
        deriveWhen();
        refreshMeta();
      };
      days.appendChild(b);
    });
    row.appendChild(days);
    box.appendChild(row);
  });
}

function renderTagChips() {
  chipList($('#profLooking'), LOOKING, myProfile.looking);
  chipList($('#profVibes'), VIBES, myProfile.vibes);
}

function chipList(box, all, picked) {
  box.innerHTML = '';
  // outside edit mode only the chosen ones are worth showing
  const show = state.mode === 'edit' ? all : picked;
  if (!show.length) { box.appendChild(el('span', 'p-count', 'Not set yet')); return; }
  show.forEach((name) => {
    const on = picked.indexOf(name) > -1;
    const b = el('button', 'p-chip' + (on ? ' on' : ''), name);
    b.disabled = state.mode !== 'edit';
    b.setAttribute('aria-pressed', on);
    if (on) b.style.background = 'var(--terra-light)';
    b.onclick = () => {
      on ? picked.splice(picked.indexOf(name), 1) : picked.push(name);
      renderTagChips();
      refreshMeta();
    };
    box.appendChild(b);
  });
}

function renderBadges() {
  const box = $('#profBadges');
  box.innerHTML = '';
  BADGES.forEach((bd) => {
    const got = bd.has();
    const b = el('button', 'p-badge' + (got ? '' : ' locked'), (got ? SPARK : LOCK) + `<span>${bd.name}</span>`);
    b.onclick = () => toast(got ? `Earned: ${bd.name}` : bd.how);
    box.appendChild(b);
  });
}

// the same card people see on Discover, without the vibe score
function renderPreview() {
  const acts = ACTIVITIES.filter((a) => state.selected.has(a.name))
    .map((a) => `${a.name} · ${myProfile.levels[a.name] || LEVELS[0]}`);
  const when = state.when === 'Custom' ? 'Flexible hours' : state.when;
  $('#profPreview').innerHTML = `
    <div class="card">
      <div class="photo" style="background:#B8B58F">
        <div class="blob" style="background:#6E6B4A"></div>
        <svg class="flower" viewBox="0 0 100 100" aria-hidden="true"><use href="#flower6"/><circle cx="50" cy="50" r="15" fill="#D9774B"/></svg>
        <span class="ph-label">[MAIN PHOTO]</span>
      </div>
      <div class="info">
        <div class="row-between"><span class="name">${esc(myProfile.name)}, ${myProfile.age}</span><span class="distance">${esc(myProfile.city)}</span></div>
        <div class="when"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${when} · up to ${state.dist} km</div>
        <div class="tags">${acts.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <p class="bio">${esc(myProfile.bio)}</p>
      </div>
    </div>`;
}

// ---------- profile: modes, settings, dialog ----------
function setMode(mode) {
  state.mode = mode;
  const screen = $('#profile');
  ['view', 'edit', 'preview'].forEach((m) => screen.classList.toggle('mode-' + m, m === mode));
  document.querySelectorAll('#modeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));

  const editing = mode === 'edit';
  $('#profName').readOnly = !editing;
  $('#profAge').readOnly = !editing;
  $('#profBio').readOnly = !editing;
  if (!editing) { $('#actPicker').hidden = true; $('#actInput').value = ''; renderSuggest(); }
  fitBio();

  renderPhotoSlots();
  renderActs();
  renderAvail();
  renderTagChips();
  renderPreview();
}

function showSettings(on) {
  $('#profMain').hidden = on;
  $('#profSettings').hidden = !on;
}

function setAgeRange() {
  const lo = $('#ageMin'), hi = $('#ageMax');
  myProfile.ageMin = +lo.value;
  myProfile.ageMax = +hi.value;
  $('#ageRangeVal').textContent = `${lo.value} – ${hi.value}`;
  [lo, hi].forEach((r) => r.style.setProperty('--p', ((r.value - 18) / 42 * 100) + '%'));
}

function confirmBox(title, text, okLabel, onOk) {
  $('#modalTitle').textContent = title;
  $('#modalText').textContent = text;
  $('#modalYes').textContent = okLabel;
  $('#modal').hidden = false;
  $('#modalYes').onclick = () => { $('#modal').hidden = true; onOk(); };
}

function resetDemo() {
  myProfile = clone(DEFAULT_PROFILE);
  ageBad = false;
  state.selected = new Set(['Running', 'Yoga', 'Walks']);
  state.filter = 'All';
  state.match = null;
  state.chats = {};
  state.confirmed = {};
  state.unread = {};
  state.timeIdx = 0;
  PEOPLE.forEach((p, i) => { p.planWhen = ORIGINAL_PLAN[i]; });
  ACTIVITIES.length = 0;
  BASE_ACTIVITIES.forEach((a) => ACTIVITIES.push(a));

  document.querySelectorAll('.p-switch').forEach((sw) => { sw.classList.add('on'); sw.setAttribute('aria-checked', 'true'); });
  $('#ageMin').value = myProfile.ageMin;
  $('#ageMax').value = myProfile.ageMax;
  setAgeRange();
  $('#actPicker').hidden = true;

  chatDot();
  showSettings(false);
  setMode('view');
  setWhen('Mornings');
  setDist(3);
  renderActivities();
  buildQueue();
  renderProfile();
  toast('Demo reset');
}

function initProfile() {
  $('#profName').oninput = (e) => { myProfile.name = e.target.value; sizeName(); refreshMeta(); };

  $('#profAge').oninput = (e) => {
    const v = parseInt(e.target.value, 10);
    ageBad = !(v >= 18);
    e.target.classList.toggle('bad', ageBad);
    $('#ageHint').hidden = !ageBad;
    if (!ageBad) myProfile.age = v;
    refreshMeta();
  };

  $('#profBio').oninput = (e) => {
    myProfile.bio = e.target.value;
    $('#bioCount').textContent = myProfile.bio.length + '/150';
    refreshMeta();
  };

  $('#btnAddAct').onclick = () => { $('#actPicker').hidden = !$('#actPicker').hidden; };
  $('#actInput').oninput = renderSuggest;
  $('#actInput').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addActivity($('#actInput').value); } };
  $('#actAdd').onclick = () => addActivity($('#actInput').value);
  $('#profDist').oninput = (e) => setDist(e.target.value);
  $('#setDist').oninput = (e) => setDist(e.target.value);
  // buildQueue() filters by distance, so re-run it once the slider is released
  ['#dist', '#profDist', '#setDist'].forEach((sel) => { $(sel).onchange = () => buildQueue(); });

  document.querySelectorAll('#modeSeg button').forEach((b) => { b.onclick = () => setMode(b.dataset.mode); });
  $('#btnSettings').onclick = () => showSettings(true);
  $('#btnSetBack').onclick = () => showSettings(false);

  const lo = $('#ageMin'), hi = $('#ageMax');
  lo.oninput = () => { if (+lo.value > +hi.value) lo.value = hi.value; setAgeRange(); };
  hi.oninput = () => { if (+hi.value < +lo.value) hi.value = lo.value; setAgeRange(); };

  document.querySelectorAll('.p-switch').forEach((sw) => {
    sw.onclick = () => {
      const on = sw.classList.toggle('on');
      sw.setAttribute('aria-checked', on);
      if (sw.dataset.key === 'visible') myProfile.visible = on;
      else myProfile.notif[sw.dataset.key] = on;
      toast(`${sw.dataset.label}: ${on ? 'On' : 'Off'}`);
    };
  });

  document.querySelectorAll('[data-toast]').forEach((b) => { b.onclick = () => toast(b.dataset.toast); });

  $('#btnReset').onclick = () => confirmBox('Reset demo?', 'This clears your matches, chats and profile edits.', 'Reset', resetDemo);
  $('#btnLogout').onclick = () => { showSettings(false); setMode('view'); go('splash'); };
  $('#modalNo').onclick = () => { $('#modal').hidden = true; };
}

// ---------- Premium Paywall ----------
$('#btnLikesPaywall').onclick = () => {
  $('#premiumModal').hidden = false;
};

$('#btnPremiumCancel').onclick = () => {
  $('#premiumModal').hidden = true;
};

$('#btnBuyPremium').onclick = () => {
  $('#premiumModal').hidden = true;
  // Імітація успішної покупки
  toast('Premium features unlocked! (Demo)');
  // В реальному житті тут відкрились би фотографії
};

// ---------- sign up / sign in ----------
// Nothing is stored or sent anywhere — this is a clickable flow, not an account system.
const account = { first: '', last: '', email: '', phone: '' };

// each rule returns true, or the message to show under the field
const RULES = {
  '#rFirst': (v) => v.length >= 2 || 'Tell us your first name',
  '#rLast': (v) => v.length >= 2 || 'Tell us your last name',
  '#rEmail': (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v) || 'Enter a valid email',
  '#rPhone': (v) => (v.replace(/\D/g, '').length >= 9) || 'Enter your phone number',
  '#rPass': (v) => v.length >= 6 || 'At least 6 characters',
  '#sEmail': (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v) || 'Enter a valid email',
  '#sPass': (v) => v.length >= 1 || 'Enter your password',
};

function checkField(sel) {
  const input = $(sel);
  const verdict = RULES[sel](input.value.trim());
  const field = input.closest('.field');
  field.classList.toggle('bad', verdict !== true);
  field.querySelector('.f-err').textContent = verdict === true ? '' : verdict;
  return verdict === true;
}

function checkForm(sels) {
  // check them all so every empty field is flagged at once, then focus the first bad one
  const results = sels.map(checkField);
  const firstBad = sels[results.indexOf(false)];
  if (firstBad) $(firstBad).focus();
  return results.every(Boolean);
}

// re-check a field the moment it stops being wrong, never before
function liveCheck(sel) {
  $(sel).oninput = () => { if ($(sel).closest('.field').classList.contains('bad')) checkField(sel); };
}

const REG_FIELDS = ['#rFirst', '#rLast', '#rEmail', '#rPhone', '#rPass'];
const SIGN_FIELDS = ['#sEmail', '#sPass'];
REG_FIELDS.concat(SIGN_FIELDS).forEach(liveCheck);

$('#regForm').onsubmit = (e) => {
  e.preventDefault();
  if (!checkForm(REG_FIELDS)) return;
  account.first = $('#rFirst').value.trim();
  account.last = $('#rLast').value.trim();
  account.email = $('#rEmail').value.trim();
  account.phone = $('#rPhone').value.trim();
  myProfile.name = account.first;
  sizeName();
  $('#vPhone').textContent = account.phone;
  clearCode();
  go('verify');
};

$('#signForm').onsubmit = (e) => {
  e.preventDefault();
  if (!checkForm(SIGN_FIELDS)) return;
  go('discover');
};

// ---------- phone code: any four digits pass ----------
const codeInputs = [...document.querySelectorAll('#codeBox input')];

function codeFilled() { return codeInputs.every((i) => /^\d$/.test(i.value)); }

function clearCode() {
  codeInputs.forEach((i) => { i.value = ''; });
  $('#btnVerify').disabled = true;
  $('#codeErr').textContent = '';
}

codeInputs.forEach((input, i) => {
  input.oninput = () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 1);
    if (input.value && codeInputs[i + 1]) codeInputs[i + 1].focus();
    $('#btnVerify').disabled = !codeFilled();
    $('#codeErr').textContent = '';
  };
  input.onkeydown = (e) => {
    if (e.key === 'Backspace' && !input.value && codeInputs[i - 1]) codeInputs[i - 1].focus();
  };
});

$('#btnVerify').onclick = () => {
  if (!codeFilled()) { $('#codeErr').textContent = 'Enter all four digits'; return; }
  go('liveness');
};

$('#resend').onclick = () => toast('A new code is on its way');

// ---------- liveness check (stub — no camera) ----------
let liveDone = false;

function resetLiveness() {
  liveDone = false;
  $('#liveness').classList.remove('scanning', 'done');
  $('#liveTitle').textContent = 'Quick face check';
  $('#liveText').textContent = 'Center your face in the circle and hold still for a moment.';
  $('#btnLive').textContent = 'Start check';
  $('#btnLive').disabled = false;
}

$('#btnLive').onclick = () => {
  if (liveDone) { go('onboarding'); return; }
  const screen = $('#liveness');
  screen.classList.add('scanning');
  $('#liveTitle').textContent = 'Checking…';
  $('#liveText').textContent = 'Hold still, this takes a second.';
  $('#btnLive').disabled = true;
  setTimeout(() => {
    if (!$('#liveness').classList.contains('scanning')) return;   // the user walked away
    screen.classList.remove('scanning');
    screen.classList.add('done');
    liveDone = true;
    $('#liveTitle').textContent = 'You\'re verified';
    $('#liveText').textContent = 'That\'s it — let\'s set up what you\'re into.';
    $('#btnLive').textContent = 'Continue';
    $('#btnLive').disabled = false;
  }, 1800);
};

// ---------- init ----------
renderActivities();
initProfile();
setAgeRange();
setWhen(state.when);
setDist(state.dist);
setMode('view');
renderProfile();
buildQueue();

// Shrikhand lands after first paint, so measure the name again once it is there
if (document.fonts) document.fonts.ready.then(() => { sizeName(); fitBio(); });
