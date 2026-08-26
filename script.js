/* ============================================================
   CONFIG — edit these to customize the experience
   ============================================================ */
const GIRLFRIEND_NAME = "Loreni";
const MAX_NO_ATTEMPTS = 7;
const STORAGE_KEY = "loreniLoveProgress";

const FINAL_MESSAGE = [
  "No matter how far we are from each other right now, I truly believe that someday we'll be together.",
  "And I'll work for that future too.",
  "I don't expect everything to be perfect. I don't expect anything impossible from you.",
  "The only things I really ask from you are to stay safe and stay loyal to me.",
  "Until the day we can finally be together and live the happy life we've imagined, I'll keep believing in us."
];

const COLOR_OPTIONS = [
  { name: "Rose",   hex: "#ff9db3" },
  { name: "Gold",   hex: "#f3c877" },
  { name: "Lilac",  hex: "#c6a8ff" },
  { name: "Mint",   hex: "#8fe3c0" },
  { name: "Sky",    hex: "#8fc7ff" },
  { name: "Peach",  hex: "#ffb08a" },
];

const DATE_OPTIONS = [
  { emoji: "🏖️", label: "Somewhere by the ocean, just us" },
  { emoji: "🏔️", label: "Somewhere in the mountains, cozy and quiet" },
  { emoji: "🌃", label: "A city we've never been to together" },
  { emoji: "🏠", label: "Honestly? Just your place, blankets and a movie" },
];

const NO_MESSAGES = [
  "Please say yes 🥺",
  "Pleaseeeee.",
  `${GIRLFRIEND_NAME} please 😭`,
  "I'm literally begging now.",
  "PLEASE ×1000 🥺",
  "Even the cat is disappointed.",
  "Okay... one more chance.",
];

const CHASE_MESSAGES = [
  "Nice try 😭",
  "The cat saw that.",
  "Too slow.",
  `${GIRLFRIEND_NAME} 😭`,
  "Why are you trying so hard?",
];

/* ============================================================
   STATE
   ============================================================ */
const state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    nickname: "",
    favoriteColor: null,
    favoriteFood: "",
    favoriteSong: "",
    loves: [],
    dislikes: "",
    birthDate: "",
    age: null,
    dateChoice: "",
    whoLovesMore: "",
    doYouLoveMe: "",
    noAttempts: 0,
    stayWithMe: "",
    petTaps: 0,
    memory: "",
    finalAnswer: "",
    sceneIndex: 0,
  };
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}
function setAccent(hex) {
  document.documentElement.style.setProperty("--accent", hex);
  document.documentElement.style.setProperty("--accent-soft", hex + "2e");
}
if (state.favoriteColor) setAccent(state.favoriteColor.hex);

/* ============================================================
   DOM HELPERS
   ============================================================ */
const app = document.getElementById("app");
const catTemplate = document.getElementById("catTemplate");

function makeCat(className) {
  const node = catTemplate.content.cloneNode(true);
  const svg = node.querySelector(".cat");
  if (className) svg.classList.add(...className.split(" "));
  return node;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === null || c === undefined) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

function typewriter(target, text, speed = 26) {
  return new Promise((resolve) => {
    target.textContent = "";
    const cursor = el("span", { class: "cursor" });
    let i = 0;
    function step() {
      if (i <= text.length) {
        target.textContent = text.slice(0, i);
        target.appendChild(cursor);
        i++;
        setTimeout(step, speed);
      } else {
        cursor.remove();
        resolve();
      }
    }
    step();
  });
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ============================================================
   HEARTS + CONFETTI
   ============================================================ */
const heartLayer = document.getElementById("heartLayer");
function spawnHearts(count = 14) {
  const emojis = ["❤️", "🩷", "✨"];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const h = el("div", { class: "floating-heart" }, emojis[Math.floor(Math.random() * emojis.length)]);
      h.style.left = Math.random() * 90 + 5 + "vw";
      h.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      h.style.fontSize = 16 + Math.random() * 18 + "px";
      heartLayer.appendChild(h);
      setTimeout(() => h.remove(), 2700);
    }, i * 70);
  }
}

const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function fireConfetti() {
  const colors = [
    getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff9db3",
    "#f3c877", "#f6efe4", "#c6a8ff",
  ];
  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * 200,
    r: 4 + Math.random() * 5,
    c: colors[Math.floor(Math.random() * colors.length)],
    vy: 2 + Math.random() * 3,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * 360,
    vr: -6 + Math.random() * 12,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    pieces.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    frame++;
    if (frame < 130) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  draw();
}

/* ============================================================
   SCENE ENGINE
   ============================================================ */
let sceneList = [];
let current = 0;

function registerScenes(list) { sceneList = list; }

async function goTo(index) {
  const outgoing = app.querySelector(".scene");
  if (outgoing) {
    outgoing.classList.add("leaving");
    await wait(320);
  }
  current = index;
  state.sceneIndex = index;
  saveState();
  app.innerHTML = "";
  const scene = el("div", { class: "scene" });
  app.appendChild(scene);
  await sceneList[index](scene);
}

function next() { goTo(Math.min(current + 1, sceneList.length - 1)); }

/* ============================================================
   SCENE BUILDERS
   ============================================================ */

// 1. Opening letter
async function sceneEnvelope(root) {
  root.appendChild(el("div", { class: "eyebrow" }, "a little something"));
  const catStage = el("div", { class: "cat-stage" });
  root.appendChild(catStage);
  const cat = makeCat("cat-walk-across");
  catStage.appendChild(cat);

  await wait(1600);

  const wrap = el("div", { class: "envelope-wrap" });
  const envelope = el("div", { class: "envelope" });
  envelope.appendChild(el("div", { class: "letter-paper" }));
  envelope.appendChild(el("div", { class: "envelope-label" }, `For ${GIRLFRIEND_NAME} ❤️`));
  wrap.appendChild(envelope);
  root.appendChild(wrap);

  const lineWrap = el("div", { class: "typewrap" });
  root.appendChild(el("p", { class: "line" }, lineWrap));
  const sub = el("p", { class: "line italic" });
  root.appendChild(sub);
  const sub2 = el("p", { class: "line italic" });
  root.appendChild(sub2);
  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);

  await wait(600);
  envelope.classList.add("open");
  await wait(900);

  await typewriter(lineWrap, `Dear ${GIRLFRIEND_NAME}...`, 32);
  await wait(500);
  await typewriter(sub, "I made something for you.", 26);
  await wait(500);
  await typewriter(sub2, "So... are you going to open it? 🥺", 26);
  await wait(300);

  const openBtn = el("button", { class: "btn", onclick: () => next() }, "Open ❤️");
  btnRow.appendChild(openBtn);
}

// 2. Intro
async function sceneIntro(root) {
  const catStage = el("div", { class: "cat-stage" });
  root.appendChild(catStage);
  catStage.appendChild(makeCat("cat-bob"));

  const l1 = el("p", { class: "line" });
  const l2 = el("p", { class: "line" });
  const l3 = el("p", { class: "line" });
  root.appendChild(l1); root.appendChild(l2); root.appendChild(l3);
  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);

  await typewriter(l1, `Hey ${GIRLFRIEND_NAME}...`, 28);
  await wait(400);
  await typewriter(l2, "Before we get into the important stuff...", 24);
  await wait(400);
  await typewriter(l3, "I want to know a few things about you.", 24);

  btnRow.appendChild(el("button", { class: "btn", onclick: () => next() }, "Okay 🐈"));
}

// 3. Nickname
async function sceneNickname(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "line" }, "What should I call you? 🐈"));

  const field = el("div", { class: "field" });
  const input = el("input", {
    class: "input",
    type: "text",
    placeholder: "Your nickname...",
    maxlength: "40",
  });
  input.value = state.nickname || "";
  field.appendChild(input);
  root.appendChild(field);

  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);
  const btn = el("button", { class: "btn", onclick: () => {
    state.nickname = input.value.trim() || "you";
    saveState();
    next();
  }}, "Continue ❤️");
  btnRow.appendChild(btn);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click(); });
}

// 4. Favorite color
async function sceneColor(root) {
  const catStage = el("div", { class: "cat-stage" });
  const cat = makeCat("cat-bob");
  catStage.appendChild(cat);
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "line" }, "Pick a color that feels like you. 🎨"));

  const grid = el("div", { class: "swatches" });
  root.appendChild(grid);
  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);

  COLOR_OPTIONS.forEach((c) => {
    const sw = el("button", {
      class: "swatch" + (state.favoriteColor && state.favoriteColor.hex === c.hex ? " selected" : ""),
      style: `background:${c.hex}`,
      onclick: () => {
        grid.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
        sw.classList.add("selected");
        state.favoriteColor = c;
        setAccent(c.hex);
        saveState();
        catStage.querySelector(".cat").classList.add("cat-jump");
        spawnHearts(6);
        setTimeout(() => btnRow.querySelector(".btn") && btnRow.querySelector(".btn").focus(), 10);
      },
    }, el("span", {}, c.name));
    grid.appendChild(sw);
  });

  btnRow.appendChild(el("button", { class: "btn", onclick: () => {
    if (!state.favoriteColor) { state.favoriteColor = COLOR_OPTIONS[0]; setAccent(COLOR_OPTIONS[0].hex); }
    saveState();
    next();
  }}, "Continue ❤️"));
}

// 5. Favorite food
async function sceneFood(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "line" }, "If I wanted to make you happy with food..."));
  root.appendChild(el("p", { class: "line italic" }, "What am I bringing? 🍜"));

  const field = el("div", { class: "field" });
  const input = el("input", { class: "input", type: "text", placeholder: "Your favorite food...", maxlength: "60" });
  input.value = state.favoriteFood || "";
  field.appendChild(input);
  root.appendChild(field);

  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);
  const btn = el("button", { class: "btn", onclick: () => {
    state.favoriteFood = input.value.trim();
    saveState();
    next();
  }}, "Continue ❤️");
  btnRow.appendChild(btn);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click(); });
}

// 6. Favorite song
async function sceneSong(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "line" }, "What's one song or artist you could"));
  root.appendChild(el("p", { class: "line" }, "listen to forever? 🎧"));

  const field = el("div", { class: "field" });
  const input = el("input", { class: "input", type: "text", placeholder: "Song or artist...", maxlength: "80" });
  input.value = state.favoriteSong || "";
  field.appendChild(input);
  root.appendChild(field);

  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);
  const btn = el("button", { class: "btn", onclick: () => {
    state.favoriteSong = input.value.trim();
    saveState();
    next();
  }}, "Continue ❤️");
  btnRow.appendChild(btn);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click(); });
}

// 7. Things she loves (multi)
async function sceneLoves(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "line" }, "Tell me a few things you really love. ❤️"));

  const row = el("div", { class: "chip-input-row" });
  const input = el("input", { class: "input", type: "text", placeholder: "Type one, then tap +" });
  const chips = el("div", { class: "chips" });

  function renderChips() {
    chips.innerHTML = "";
    state.loves.forEach((item, i) => {
      chips.appendChild(el("div", { class: "chip" }, [
        item,
        el("button", { onclick: () => { state.loves.splice(i, 1); saveState(); renderChips(); } }, "✕"),
      ]));
    });
  }
  renderChips();

  function addLove() {
    const v = input.value.trim();
    if (v) {
      state.loves.push(v);
      input.value = "";
      saveState();
      renderChips();
    }
    input.focus();
  }

  row.appendChild(input);
  row.appendChild(el("button", { class: "chip-add", onclick: addLove }, "+"));
  root.appendChild(row);
  root.appendChild(chips);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addLove(); } });

  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);
  btnRow.appendChild(el("button", { class: "btn", onclick: () => next() }, "Continue ❤️"));
}

// 8. Dislikes
async function sceneDislikes(root) {
  const catStage = el("div", { class: "cat-stage" });
  const cat = makeCat("cat-bob");
  catStage.appendChild(cat);
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "line" }, "And what should I absolutely NOT do? 😭"));

  const field = el("div", { class: "field" });
  const input = el("input", { class: "input", type: "text", placeholder: "Be honest..." });
  input.value = state.dislikes || "";
  field.appendChild(input);
  root.appendChild(field);

  const note = el("p", { class: "line italic", style: "display:none" }, "Very important information.");
  root.appendChild(note);

  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);
  btnRow.appendChild(el("button", { class: "btn", onclick: async () => {
    state.dislikes = input.value.trim();
    saveState();
    cat.classList.remove("cat-bob");
    cat.classList.add("cat-sad");
    note.style.display = "block";
    await wait(1100);
    next();
  }}, "Noted 🫡"));
}

// 9. Midpoint age teaser
async function sceneAgeTeaser(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-peek"));
  root.appendChild(catStage);
  const l1 = el("p", { class: "line" });
  const l2 = el("p", { class: "line" });
  root.appendChild(l1); root.appendChild(l2);
  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);

  await typewriter(l1, "Btw...", 30);
  await wait(500);
  await typewriter(l2, "Are you really 19? 👀", 28);

  btnRow.appendChild(el("button", { class: "btn", onclick: () => next() }, "I'm curious 👀"));
}

// 10. Age calculator
async function sceneAgeCalc(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  root.appendChild(el("p", { class: "eyebrow" }, "just a little investigation"));
  root.appendChild(el("p", { class: "line" }, "Okay, let's investigate... 🐈"));
  root.appendChild(el("p", { class: "subtext" }, "Enter your birthday and I'll tell you exactly how old you are."));

  const field = el("div", { class: "field" });
  const input = el("input", { class: "date-input", type: "date", max: new Date().toISOString().split("T")[0] });
  if (state.birthDate) input.value = state.birthDate;
  field.appendChild(input);
  root.appendChild(field);

  const resultBox = el("div", { style: "width:100%" });
  root.appendChild(resultBox);

  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);
  const btn = el("button", { class: "btn", onclick: () => {
    if (!input.value) { input.focus(); return; }
    state.birthDate = input.value;
    const { years, months, days, age } = calcAge(input.value);
    state.age = age;
    saveState();

    resultBox.innerHTML = "";
    const card = el("div", { class: "age-result" });
    card.appendChild(el("div", { class: "age-number" }, `${age}`));
    card.appendChild(el("div", { class: "age-sub" }, `That's ${years} years, ${months} months and ${days} days.`));
    card.appendChild(el("div", { class: "age-sub" }, `Born on: ${formatDate(input.value)}`));
    resultBox.appendChild(card);

    const cat = catStage.querySelector(".cat");
    cat.classList.remove("cat-bob");
    cat.classList.add("cat-jump");
    spawnHearts(8);

    const verdict = el("p", { class: "line italic" }, `Yep... you're ${age}. 😭❤️`);
    resultBox.appendChild(verdict);

    btn.textContent = "Continue ❤️";
    btn.onclick = () => next();
  }}, "Find out");
  btnRow.appendChild(btn);
}

function calcAge(dateStr) {
  const birth = new Date(dateStr + "T00:00:00");
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { months += 12; years -= 1; }
  return { years, months, days, age: years };
}
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// 11. Transition into love questions
async function sceneLoveIntro(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  const l1 = el("p", { class: "line" });
  const l2 = el("p", { class: "line" });
  root.appendChild(l1); root.appendChild(l2);
  const btnRow = el("div", { class: "btn-row" });
  root.appendChild(btnRow);

  await typewriter(l1, `Okay ${state.nickname || GIRLFRIEND_NAME}...`, 28);
  await wait(400);
  await typewriter(l2, "Now I have some VERY important questions.", 24);

  btnRow.appendChild(el("button", { class: "btn", onclick: () => next() }, "Go on 🐈"));
}

// 12. Date choice
async function sceneDateChoice(root) {
  const catStage = el("div", { class: "cat-stage" });
  catStage.appendChild(makeCat("cat-bob"));
  root.appendChild(catStage);
  root.appen
