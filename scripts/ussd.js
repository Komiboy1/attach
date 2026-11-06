const BALANCE = 12500, PIN = "1234", CODE = "*123#";

const screen = document.getElementById("screen");
const form = document.getElementById("ussd-form");
const entry = document.getElementById("entry");
const entryLabel = document.getElementById("entry-label");
const sendBtn = document.getElementById("send");
const cancelBtn = document.getElementById("cancel");
const sms = document.getElementById("sms");
const restart = document.getElementById("restart");
const steps = [...document.querySelectorAll("#steps li")];

let node = "idle";
let data = {};
const money = n => "$" + Number(n).toLocaleString("en-US");

const NODES = {
  idle: { step: 0, label: "Dial a code", btn: "Call" },
  main: { step: 1, label: "Your reply",
    prompt: () => "Mobile Money\n1. Check balance\n2. Send money\n3. Buy airtime\n0. Exit",
    handle: v => ({ "1": "pin", "2": "sendTo", "3": "airtime", "0": "end" })[v] ? setNext(v) : "Invalid choice. Enter 1, 2, 3 or 0." },
  sendTo: { step: 2, label: "Phone number",
    prompt: () => "Send money\nEnter the recipient's phone number:",
    handle: v => /^\d{10,11}$/.test(v) ? (data.to = v, "sendAmt") : "Enter a 10 or 11 digit number." },
  sendAmt: { step: 2, label: "Amount",
    prompt: () => "Enter the amount to send:",
    handle: v => {
      const n = Number(v);
      if (!/^\d+$/.test(v) || n < 1) return "Enter a whole number, 1 or more.";
      if (n > BALANCE) return "Insufficient funds. Balance is " + money(BALANCE) + ".";
      data.amount = n; return "confirm";
    } },
  airtime: { step: 2, label: "Amount",
    prompt: () => "Buy airtime\nEnter the amount (1 to 500):",
    handle: v => /^\d+$/.test(v) && v >= 1 && v <= 500 ? (data.amount = Number(v), "pin") : "Enter a number from 1 to 500." },
  confirm: { step: 3, label: "Your reply",
    prompt: () => `Send ${money(data.amount)} to ${data.to}?\n1. Confirm\n2. Cancel`,
    handle: v => v === "1" ? "pin" : v === "2" ? "end" : "Enter 1 to confirm or 2 to cancel." },
  pin: { step: 3, label: "PIN", secret: true,
    prompt: () => "Enter your 4-digit PIN:",
    handle: v => v === PIN ? finish() : "Wrong PIN. Try again (demo PIN is 1234)." },
};

function setNext(v) {
  data.action = v;
  return { "1": "pin", "2": "sendTo", "3": "airtime", "0": "end" }[v];
}


function finish() {
  let text, msg;
  if (data.action === "1") { text = "Your balance is " + money(BALANCE) + "."; msg = "Balance enquiry: " + money(BALANCE) + "."; }
  else if (data.action === "2") { text = "Sent " + money(data.amount) + " to " + data.to + "."; msg = text + " New balance " + money(BALANCE - data.amount) + "."; }
  else { text = "Airtime of " + money(data.amount) + " purchased."; msg = text + " Thank you."; }
  data.result = text; data.sms = msg;
  return "done";
}

function setStep(i) {
  steps.forEach((s, n) => n === i ? s.setAttribute("aria-current", "step") : s.removeAttribute("aria-current"));
}

function show(next, error) {
  node = next;
  if (node === "end") return endSession("Session ended.");
  if (node === "done") {
    screen.textContent = data.result + "\nYou will receive an SMS.";
    setStep(3);
    return endSession(null, data.sms);
  }
  const n = NODES[node];
  screen.textContent = (error ? error + "\n\n" : "") + n.prompt();
  entryLabel.textContent = n.label;
  entry.type = n.secret ? "password" : "text";
  entry.inputMode = "numeric";
  entry.value = "";
  sendBtn.textContent = "Send";
  setStep(n.step);
  entry.focus();
}

function endSession(message, smsText) {
  if (message) { screen.textContent = message; setStep(0); }
  entry.disabled = sendBtn.disabled = cancelBtn.disabled = true;
  if (smsText) {
    sms.innerHTML = "<strong>SMS received</strong>";
    sms.append(smsText);
    sms.hidden = false;
  }
  restart.hidden = false;
  restart.focus();
}

function reset() {
  node = "idle"; data = {};
  screen.textContent = "Dial " + CODE + " to begin.";
  entryLabel.textContent = NODES.idle.label;
  entry.type = "text"; entry.inputMode = "text"; entry.value = CODE;
  entry.disabled = sendBtn.disabled = cancelBtn.disabled = false;
  sendBtn.textContent = "Call";
  sms.hidden = true; restart.hidden = true;
  setStep(0);
  entry.focus();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const v = entry.value.trim();
  if (node === "idle") {
    return v === CODE ? show("main") : (screen.textContent = "Connection problem or invalid MMI code.\nTry " + CODE);
  }
  const result = NODES[node].handle(v);
  /* A node name moves on; anything else is an error message to re-show */
  if (result in NODES || result === "end" || result === "done") show(result);
  else show(node, result);
});

cancelBtn.addEventListener("click", () => endSession("Session cancelled."));
restart.addEventListener("click", reset);
document.getElementById("yr").textContent = new Date().getFullYear();
setStep(0);