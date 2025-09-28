/**
 * Accessible UI utilities for theme, navigation, and contact form.
 * - Single source of truth for theme via [data-theme] on <html>
 * - Any element with [data-theme-toggle] acts as a theme toggle
 * - Mobile menu uses native [hidden] for semantics and ESC/resize handling
 */

const STORAGE_KEY = "theme";

/** Determine the user's OS-level preference. */
const getPreferredScheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/** Apply theme to the document, update toggles and any light/dark-swappable images. */
function applyTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);

  // Update any toggle buttons
  document.querySelectorAll("[data-theme-toggle]").forEach(toggle => {
    const isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.textContent = isDark ? "Light mode" : "Dark mode";
  });

  // Swap images using data-light and data-dark attributes (for example the logo)
  document.querySelectorAll("[data-light][data-dark]").forEach(img => {
    const target = theme === "dark" ? img.getAttribute("data-dark") : img.getAttribute("data-light");
    if (target && img.getAttribute("src") !== target) img.setAttribute("src", target);
  });
}

/** Initialise theme from localStorage or OS preference. */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved === "light" || saved === "dark" ? saved : getPreferredScheme();
  applyTheme(initial);
}

/** Toggle and persist the theme. */
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || getPreferredScheme();
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
}

/** Accessible, responsive primary menu. */
function initMenu() {
  const nav = document.getElementById("primaryNav");
  const toggles = document.querySelectorAll("[data-menu-toggle]");
  if (!nav || toggles.length === 0) return;

  const isDesktop = () => window.matchMedia && window.matchMedia("(min-width: 48em)").matches;

  const setHidden = hidden => {
    if (hidden) nav.setAttribute("hidden", "");
    else nav.removeAttribute("hidden");
    nav.classList.toggle("open", !hidden);
    toggles.forEach(t => t.setAttribute("aria-expanded", String(!hidden)));
  };

  const updateForViewport = () => {
    if (isDesktop()) {
      nav.removeAttribute("hidden");
      nav.classList.remove("open");
      toggles.forEach(t => t.setAttribute("aria-expanded", "false"));
    } else {
      nav.setAttribute("hidden", "");
      nav.classList.remove("open");
      toggles.forEach(t => t.setAttribute("aria-expanded", "false"));
    }
  };

  updateForViewport();

  toggles.forEach(btn => {
    btn.addEventListener("click", () => {
      if (isDesktop()) return;
      setHidden(nav.hasAttribute("hidden"));
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !isDesktop() && !nav.hasAttribute("hidden")) setHidden(true);
  });

  document.addEventListener("click", e => {
    if (isDesktop()) return;
    const clickedToggle = [...toggles].some(t => t.contains(e.target));
    if (!clickedToggle && !nav.contains(e.target) && !nav.hasAttribute("hidden")) setHidden(true);
  });

  window.addEventListener("resize", updateForViewport);
}

/** Simple client-side mailto contact with basic validation feedback. */
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

    const rawBody = `From: ${name} (${email})\n\n${message}`;
    const mailto = `mailto:inanoktech@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(rawBody)}`;

    window.location.href = mailto;
    status.textContent = "Your email app should now open. If not, email me at inanoktech@gmail.com.";
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initContactForm();

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => btn.addEventListener("click", toggleTheme));

  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = e => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) applyTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener ? mq.addEventListener("change", listener) : mq.addListener(listener);
  }
});
