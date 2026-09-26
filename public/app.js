const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const messages = $("#messages");
const input = $("#input");
const composer = $("#composer");
const typing = $("#typing");
const charCount = $("#charCount");

let history = [];
let soundOn = true;
let memePool = [];
let audioCtx;

const memes = [
  ["SCHOOL", "📚", "Homework submitted successfully.", "Unfortunately, to the wrong universe."],
  ["MATH", "🧮", "Teacher: 2 + 2?", "Me: Depends. Is this an emotional calculation?"],
  ["EXAM", "😵", "Exam paper opened.", "Brain immediately switched to airplane mode."],
  ["WIFI", "📶", "WiFi: Connected", "Internet: I have other plans."],
  ["MONDAY", "☕", "Monday entered the chat.", "Everyone else: immediately left the chat."],
  ["BRAIN", "🧠", "Brain.exe is running.", "One unexpected thought caused a system restart."],
  ["TEACHER", "🧑‍🏫", "Teacher: Any questions?", "Class: 47 minutes of professional silence."],
  ["FRIEND", "🤝", "Friend: Bro trust me.", "History: absolutely not."],
  ["CONFIDENCE", "🗿", "Confidence level: 100%.", "Evidence level: loading..."],
  ["PHONE", "📱", "Just 5 minutes on phone.", "Three hours later: character development."],
  ["GROUP CHAT", "💬", "Group chat is active.", "Nobody knows why. Nobody will explain."],
  ["PROJECT", "💻", "Project deadline: tomorrow.", "Project: currently a concept in my imagination."],
  ["ATTENDANCE", "🏫", "Attendance: 74%.", "Motivation: 0.4% and falling."],
  ["SLEEP", "😴", "Tonight I will sleep early.", "Narrator: He did not."],
  ["GOOGLE", "🔎", "Searched one tiny question.", "Returned with 38 tabs and an identity crisis."],
  ["LOADING", "⏳", "Please wait...", "The brain is negotiating with the CPU."],
  ["NPC", "🗿", "Walking into class like an NPC.", "Dialogue options: 'yes sir' and 'yes sir'."],
  ["DEADLINE", "🚨", "Deadline is 10 minutes away.", "Suddenly I have the productivity of 14 people."],
  ["EXCUSE", "🎭", "Sir, homework kyun nahi kiya?", "Printer ne emotional damage kar diya."],
  ["SMART", "🤓", "I know exactly what I'm doing.", "This sentence has historically aged badly."]
];

function shuffleMemes() {
  memePool = [...memes].sort(() => Math.random() - 0.5);
}
shuffleMemes();

function renderMeme() {
  if (!memePool.length) shuffleMemes();
  const [tag, emoji, title, punch] = memePool.pop();
  const used = memes.findIndex(m => m[0] === tag);
  $("#memeTag").textContent = tag;
  $("#memeEmoji").textContent = emoji;
  $("#memeTitle").textContent = title;
  $("#memePunch").textContent = punch;
  $("#memeNumber").textContent = String((used + 1)).padStart(2, "0");
  if (soundOn) playSound("pop");
}

function playSound(type) {
  if (!soundOn) return;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const configs = {
    pop:  { a: 520, b: 160, d: .11, v: .08, wave: "sine" },
    boom: { a: 110, b: 48,  d: .35, v: .16, wave: "sawtooth" },
    bonk: { a: 180, b: 70,  d: .22, v: .12, wave: "triangle" },
    sus:  { a: 330, b: 500, d: .28, v: .08, wave: "square" }
  };
  const c = configs[type] || configs.pop;

  osc.type = c.wave;
  osc.frequency.setValueAtTime(c.a, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, c.b), now + c.d);
  gain.gain.setValueAtTime(c.v, now);
  gain.gain.exponentialRampToValueAtTime(.001, now + c.d);
  osc.start(now);
  osc.stop(now + c.d + .02);
}

function addMessage(text, role = "bot", isError = false) {
  const welcome = $(".welcome");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = `message ${role}${isError ? " error" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "🙂" : "🤡";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.append(avatar, bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function setTyping(on) {
  typing.classList.toggle("show", on);
  if (on) messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(text) {
  text = text.trim();
  if (!text) return;

  const oldHistory = [...history];
  addMessage(text, "user");
  history.push({ role: "user", text });
  input.value = "";
  updateCount();
  resizeInput();
  setTyping(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: oldHistory.slice(-12)
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    addMessage(data.reply, "bot");
    history.push({ role: "model", text: data.reply });
    if (soundOn) playSound("pop");
  } catch (err) {
    addMessage(err.message || "Rage engine offline 😭", "bot", true);
    history.pop();
  } finally {
    setTyping(false);
  }
}

function updateCount() {
  charCount.textContent = `${input.value.length}/1200`;
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", () => {
  updateCount();
  resizeInput();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

$$("[data-prompt]").forEach(btn => {
  btn.addEventListener("click", () => {
    sendMessage(btn.dataset.prompt);
  });
});

$("#newChat").addEventListener("click", () => {
  history = [];
  messages.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">🤡</div>
      <h1>Fresh chat. Fresh problems.</h1>
      <p>Ab phir se koi innocent question pooch ke dekho.</p>
      <div class="starter-grid">
        <button class="starter" data-prompt="2+2 kitna hota hai?">🧮 <span>2+2?</span></button>
        <button class="starter" data-prompt="Who are you?">🤖 <span>Who are you?</span></button>
        <button class="starter" data-prompt="Mujhe kal exam hai kya karun?">😵 <span>Exam panic</span></button>
        <button class="starter" data-prompt="Mere liye ek funny excuse banao.">🎭 <span>Funny excuse</span></button>
      </div>
    </div>`;
  $$(".starter").forEach(btn => btn.addEventListener("click", () => sendMessage(btn.dataset.prompt)));
  if (soundOn) playSound("pop");
});

$("#memeBtn").addEventListener("click", renderMeme);
$$("[data-sound]").forEach(btn => {
  btn.addEventListener("click", () => playSound(btn.dataset.sound));
});

$("#soundToggle").addEventListener("click", () => {
  soundOn = !soundOn;
  $("#soundToggle").textContent = soundOn ? "🔊" : "🔇";
});

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  $("#themeToggle").textContent = document.body.classList.contains("light") ? "☀" : "☾";
});

updateCount();
resizeInput();
