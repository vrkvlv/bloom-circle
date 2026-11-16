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
};

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ---------- navigation ----------
function go(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.go === id));
  if (id === 'discover') renderDeck();
  if (id === 'chat') { renderChat(); $('#chatDot').hidden = true; }
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
      state.filter = 'All';
      renderActivities();
      buildQueue();
    };
    grid.appendChild(b);
  });
}

document.querySelectorAll('#timeSeg button').forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll('#timeSeg button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
  };
});

const dist = $('#dist');
function updateDist() {
  $('#distVal').textContent = `up to ${dist.value} km`;
  dist.style.setProperty('--p', ((dist.value - 1) / 9 * 100) + '%');
}
dist.oninput = updateDist;

// ---------- discover ----------
function buildQueue() {
  state.queue = PEOPLE.filter((p) => state.selected.has(p.act) && (state.filter === 'All' || p.act === state.filter));
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
  $('#chatDot').hidden = false;
  go('match');
}
$('#sayHi').onclick = () => go('chat');

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

function addMsg(from, text) {
  const p = state.match;
  state.chats[p.name].push({ from, text });
  const m = el('div', 'msg ' + from);
  m.textContent = text;
  $('#msgs').appendChild(m);
  $('#msgs').scrollTop = $('#msgs').scrollHeight;
}

function fakeReply() {
  const box = $('#msgs');
  const typing = el('div', 'msg them typing', 'typing…');
  setTimeout(() => { box.appendChild(typing); box.scrollTop = box.scrollHeight; $('#chatStatus').textContent = '● typing…'; }, 400);
  setTimeout(() => {
    typing.remove();
    $('#chatStatus').textContent = '● online';
    addMsg('them', REPLIES[Math.floor(Math.random() * REPLIES.length)]);
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

// ---------- init ----------
renderActivities();
updateDist();
buildQueue();
