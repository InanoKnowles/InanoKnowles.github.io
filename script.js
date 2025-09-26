/* Utilities */
const typingText = 'Software Engineer';
const typingSpeed = 90;
if (typingTarget) {
const type = (i = 0) => {
if (i <= typingText.length) {
typingTarget.textContent = typingText.slice(0, i);
setTimeout(() => type(i + 1), typingSpeed);
}
};
type();
}


/* Theme toggle + hero image swap */
const heroImg = document.getElementById('heroImg');
const themeBtn = document.getElementById('themeToggle');
function applyTheme(theme) {
const isLight = theme === 'light';
root.classList.toggle('light', isLight);
if (heroImg) heroImg.src = isLight ? 'img/lightmode.png' : 'img/darkmode.png';
localStorage.setItem('theme', theme);
// update matrix colours
setMatrixColours(getComputedStyle(root).getPropertyValue('--code').trim(),
getComputedStyle(root).getPropertyValue('--fade').trim());
}
function getInitialTheme() {
const saved = localStorage.getItem('theme');
if (saved) return saved;
return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
applyTheme(getInitialTheme());
if (themeBtn) themeBtn.addEventListener('click', () => {
const next = root.classList.contains('light') ? 'dark' : 'light';
applyTheme(next);
});


/* Matrix background — respects reduced motion */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('matrix');
if (canvas && !reduceMotion) {
const ctx = canvas.getContext('2d', { alpha: true });
let glyphColour = getComputedStyle(root).getPropertyValue('--code').trim();
let fadeColour = getComputedStyle(root).getPropertyValue('--fade').trim();
function setMatrixColours(glyph, fade) { glyphColour = glyph; fadeColour = fade; }
window.setMatrixColours = setMatrixColours; // expose for theme updates


const glyphs = '01<>[]{}/*+=-^;:æλΣπΩ¥£$#';
const fontSize = 16;
let columns = 0;
let drops = [];


function resizeCanvas() {
const ratio = Math.max(window.devicePixelRatio || 1, 1);
const { clientWidth: w, clientHeight: h } = canvas;
canvas.width = Math.floor(w * ratio);
canvas.height = Math.floor(h * ratio);
ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
columns = Math.ceil(w / fontSize);
drops = new Array(columns).fill(1);
}
const onResize = () => { resizeCanvas(); };
window.addEventListener('resize', onResize);
resizeCanvas();


function draw() {
ctx.fillStyle = fadeColour;
ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
ctx.fillStyle = glyphColour;
ctx.font = `${fontSize}px monospace`;
for (let i = 0; i < drops.length; i++) {
const char = glyphs.charAt(Math.floor(Math.random() * glyphs.length));
const x = i * fontSize;
const y = drops[i] * fontSize;
ctx.fillText(char, x, y);
if (y > canvas.clientHeight && Math.random() > 0.975) drops[i] = 0;
drops[i]++;
}
requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
}