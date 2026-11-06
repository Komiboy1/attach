const COUNTRIES = {
  "1":["United States / Canada",10,10],"7":["Russia / Kazakhstan",10,10],"20":["Egypt",9,10],
  "27":["South Africa",9,9],"30":["Greece",10,10],"31":["Netherlands",9,9],"32":["Belgium",8,9],
  "33":["France",9,9],"34":["Spain",9,9],"39":["Italy",9,11],"41":["Switzerland",9,9],
  "44":["United Kingdom",9,10],"45":["Denmark",8,8],"46":["Sweden",7,10],"47":["Norway",8,8],
  "48":["Poland",9,9],"49":["Germany",10,11],"51":["Peru",9,9],"52":["Mexico",10,10],
  "54":["Argentina",10,10],"55":["Brazil",10,11],"56":["Chile",9,9],"57":["Colombia",10,10],
  "58":["Venezuela",10,10],"60":["Malaysia",9,10],"61":["Australia",9,9],"62":["Indonesia",9,12],
  "63":["Philippines",10,10],"64":["New Zealand",8,10],"65":["Singapore",8,8],"66":["Thailand",9,9],
  "81":["Japan",9,10],"82":["South Korea",9,10],"84":["Vietnam",9,10],"86":["China",11,11],
  "90":["Türkiye",10,10],"91":["India",10,10],"92":["Pakistan",10,10],"94":["Sri Lanka",9,9],
  "98":["Iran",10,10],"212":["Morocco",9,9],"213":["Algeria",9,9],"221":["Senegal",9,9],
  "225":["Côte d’Ivoire",8,10],"233":["Ghana",9,9],"234":["Nigeria",8,10],"237":["Cameroon",8,9],
  "243":["DR Congo",9,9],"244":["Angola",9,9],"249":["Sudan",9,9],"250":["Rwanda",9,9],
  "251":["Ethiopia",9,9],"254":["Kenya",9,9],"255":["Tanzania",9,9],"256":["Uganda",9,9],
  "260":["Zambia",9,9],"263":["Zimbabwe",9,9],"351":["Portugal",9,9],"353":["Ireland",7,9],
  "380":["Ukraine",9,9],"420":["Czechia",9,9],"880":["Bangladesh",10,10],"966":["Saudi Arabia",9,9],
  "971":["United Arab Emirates",8,9],"972":["Israel",8,9]
};
const EXAMPLES = ["+44 20 7946 0958", "+1 (415) 555-0132", "+254 712 345 678", "+91 98765 43210"];

const form = document.getElementById("lk-form");
const input = document.getElementById("num");
const errEl = document.getElementById("num-err");
const result = document.getElementById("result");
const rows = document.getElementById("rows");
const copyBtn = document.getElementById("copy");
const copied = document.getElementById("copied");
let lastIntl = "";

/* Pure function: raw text in, { error } or { digits, ... } out */
function parse(raw) {
  let s = raw.trim().replace(/\(0\)/g, "");
  if (!s) return { error: "Enter a phone number." };
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (!s.startsWith("+")) return { error: "Start with + and the country code, for example +44." };
  if (/[^\d\s\-().+]/.test(s)) return { error: "Use digits, spaces, dashes or brackets only." };
  const digits = s.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15)
    return { error: "A phone number has 7 to 15 digits including the country code." };

  let cc = "";
  for (let n = 1; n <= 3; n++) if (COUNTRIES[digits.slice(0, n)]) { cc = digits.slice(0, n); break; }
  if (!cc) return { digits, cc: null };

  const [country, min, max] = COUNTRIES[cc];
  const national = digits.slice(cc.length);
  return { digits, cc, country, national, lengthOk: national.length >= min && national.length <= max,
           expected: min === max ? String(min) : `${min} to ${max}` };
}

const group = str => str.replace(/(\d{3})(?=\d)/g, "$1 ");

function row(label, value, cls) {
  const dt = document.createElement("dt"), dd = document.createElement("dd");
  dt.textContent = label; dd.textContent = value;
  if (cls) dd.className = cls;
  rows.append(dt, dd);
}

function run(raw) {
  const r = parse(raw);
  copied.textContent = "";
  if (r.error) {
    errEl.textContent = r.error;
    input.setAttribute("aria-invalid", "true");
    result.hidden = true;
    input.focus();
    return;
  }
  errEl.textContent = "";
  input.removeAttribute("aria-invalid");
  rows.replaceChildren();

  if (!r.cc) {
    lastIntl = "+" + group(r.digits);
    row("Country", "Not in this lookup’s sample table", "warn");
    row("International", lastIntl);
  } else {
    lastIntl = `+${r.cc} ${group(r.national)}`;
    row("Country", r.country);
    row("Calling code", "+" + r.cc);
    row("International", lastIntl);
    row("E.164 (no spaces)", "+" + r.digits);
    row("Length check", r.lengthOk
      ? `Looks right (${r.national.length} digits after the code)`
      : `Unusual: ${r.national.length} digits after the code, usually ${r.expected}`,
      r.lengthOk ? "ok" : "warn");
  }
  result.hidden = false;
  result.focus();
}

form.addEventListener("submit", e => { e.preventDefault(); run(input.value); });

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(lastIntl);
    copied.textContent = "Copied " + lastIntl;
  } catch {
    copied.textContent = "Copy was blocked. Select the number above and copy it manually.";
  }
});

/* Example buttons */
const list = document.getElementById("examples");
EXAMPLES.forEach(ex => {
  const li = document.createElement("li"), b = document.createElement("button");
  b.type = "button"; b.textContent = ex;
  b.addEventListener("click", () => { input.value = ex; run(ex); });
  li.append(b); list.append(li);
});

document.getElementById("yr").textContent = new Date().getFullYear();