const STORAGE_KEY = "theme";

const getPreferredScheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function applyTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  document.querySelectorAll("#themeToggle").forEach(toggle => {
    const isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  });
  document.querySelectorAll("[data-light][data-dark]").forEach(img => {
    const target = theme === "dark" ? img.getAttribute("data-dark") : img.getAttribute("data-light");
    if (target && img.getAttribute("src") !== target) img.setAttribute("src", target);
  });
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved === "light" || saved === "dark" ? saved : getPreferredScheme();
  applyTheme(initial);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || getPreferredScheme();
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
}

function initMenu() {
  const toggles = document.querySelectorAll("#menuToggle");
  const nav = document.getElementById("primaryNav");
  if (!nav || toggles.length === 0) return;
  const closeMenu = () => {
    nav.classList.remove("open");
    toggles.forEach(t => t.setAttribute("aria-expanded", "false"));
  };
  toggles.forEach(btn => {
    btn.addEventListener("click", () => {
      const expanded = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(expanded));
    });
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 48em)").matches) closeMenu();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim() || "Website enquiry";
    const message = document.getElementById("message").value.trim();
    if (!name || !email || !message) {
      status.textContent = "Please fill in your name, email and message.";
      return;
    }
    const body = `From: ${name} (${email})%0D%0A%0D%0A${message}`;
    const mailto = `mailto:inanoktech@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
    status.textContent = "Your email app should now open. If not, email me at inanoktech@gmail.com.";
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initContactForm();
  document.querySelectorAll("#themeToggle").forEach(btn => btn.addEventListener("click", toggleTheme));
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = e => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) applyTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", listener);
    else if (mq.addListener) mq.addListener(listener);
  }
});
