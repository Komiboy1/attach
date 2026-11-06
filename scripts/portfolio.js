const PROJECTS = [
  { icon: "📱", category: "Mobile access", title: "USSD Service Simulator",
    text: "A phone-style simulator for USSD menus: dial a code, send money, buy airtime. Built as a small state machine with a live step tracker.",
    href: "ussd.html" },
  { icon: "📞", category: "Telecom", title: "Phone Number Lookup",
    text: "Paste a number to see its country, calling code and format, with clear validation and a copy button. Runs fully in the browser.",
    href: "lookup.html" },
  { icon: "📚", category: "Frontend", title: "The Accessibility Library",
    text: "The app that holds the projects: searchable cards, skip link, keyboard-first navigation and a contact form with accessible errors.",
    href: "../index.html" }
];

const grid = document.getElementById("grid");
PROJECTS.forEach(p => {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.className = "card"; a.href = p.href;
  const icon = Object.assign(document.createElement("span"), { className: "icon", textContent: p.icon });
  icon.setAttribute("aria-hidden", "true");
  const cat = Object.assign(document.createElement("span"), { className: "cat", textContent: p.category });
  const h3 = Object.assign(document.createElement("h3"), { textContent: p.title });
  const body = Object.assign(document.createElement("span"), { textContent: p.text });
  const tag = Object.assign(document.createElement("span"), { className: "tag", textContent: "View project" });
  a.append(icon, cat, h3, body, tag);
  li.append(a); grid.append(li);
});

document.getElementById("yr").textContent = new Date().getFullYear();