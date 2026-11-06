const PROJECTS = [
  {icon:"📱", category:"Mobile access",  title:"USSD Service Simulator", href:"pages/ussd.html",     external:false},
  {icon:"📞", category:"Telecom",        title:"Phone Number Lookup",    href:"pages/lookup.html", external:false},
];

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const q = document.getElementById("q");

function cardHTML(p){
  const ext = p.external ? ' target="_blank" rel="noopener noreferrer"' : "";
  const label = p.external ? "External ↗" : "In-app";
  const hint = p.external ? '<span class="sr-only"> (opens in a new tab)</span>' : "";
  return `<li><a class="card" href="${p.href}"${ext}>
    <span class="icon" aria-hidden="true">${p.icon}</span>
    <span class="cat">${p.category}</span>
    <h3>${p.title}${hint}</h3>
    <span class="tag">${label}</span></a></li>`;
}

function render(){
  const term = q.value.trim().toLowerCase();
  const list = PROJECTS.filter(p => p.title.toLowerCase().includes(term));
  grid.innerHTML = list.map(cardHTML).join("");
  empty.hidden = list.length > 0;
  count.textContent = term
    ? `${list.length} ${list.length === 1 ? "project" : "projects"} found`
    : `Showing all ${PROJECTS.length} projects`;
}
q.addEventListener("input", render);
render();

/* ---------- Hero: amber "active step" cycles, paused for reduced motion ---------- */
const steps = [...document.querySelectorAll("#steps li")];
let i = 0;
function mark(){ steps.forEach((s,n)=> n===i ? s.setAttribute("aria-current","step") : s.removeAttribute("aria-current")); }
mark();
if (!matchMedia("(prefers-reduced-motion: reduce)").matches){
  setInterval(()=>{ i=(i+1)%steps.length; mark(); }, 2200);
}

/* ---------- Contact form validation ---------- */
const form = document.getElementById("form");
const rules = {
  name:  v => v.trim() ? "" : "Enter your name.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter an email address like name@example.com.",
  msg:   v => v.trim().length >= 10 ? "" : "Write at least 10 characters."
};
function check(id){
  const el = document.getElementById(id);
  const msg = rules[id](el.value);
  document.getElementById(id + "-err").textContent = msg;
  el.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
Object.keys(rules).forEach(id => document.getElementById(id).addEventListener("blur", () => check(id)));
form.addEventListener("submit", e => {
  e.preventDefault();
  const results = Object.keys(rules).map(check);
  if (results.includes(false)){
    document.getElementById(Object.keys(rules)[results.indexOf(false)]).focus();
    return;
  }
 
  form.hidden = true;
  const ok = document.getElementById("ok");
  ok.hidden = false; ok.focus();
});

document.getElementById("yr").textContent = new Date().getFullYear();