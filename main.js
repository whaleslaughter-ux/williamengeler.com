/* main.js — William Engeler, COMS */

// ── Auto-updating copyright year ──────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Fix about grid when no headshot ───────────────────────────────
const headshot = document.querySelector('.headshot');
if (headshot) {
  headshot.addEventListener('error', () => {
    const photoDiv = headshot.closest('.about-photo');
    if (photoDiv) photoDiv.style.display = 'none';
    const grid = document.querySelector('.about-grid');
    if (grid) grid.style.gridTemplateColumns = '1fr';
  });
  if (!headshot.complete || headshot.naturalWidth === 0) {
    headshot.dispatchEvent(new Event('error'));
  }
}

// ── Vision Profiles ────────────────────────────────────────────────
const visionBtns = document.querySelectorAll('.vision-btn');
const savedProfile = localStorage.getItem('visionProfile') || 'standard';

function setProfile(profile) {
  document.documentElement.setAttribute('data-vision', profile);
  visionBtns.forEach(btn => {
    const isActive = btn.dataset.profile === profile;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  localStorage.setItem('visionProfile', profile);
}

setProfile(savedProfile);

visionBtns.forEach(btn => {
  btn.addEventListener('click', () => setProfile(btn.dataset.profile));
});

// ── Read Aloud ─────────────────────────────────────────────────────
const readBtn = document.getElementById('readAloudBtn');
let speaking = false;
let utterance = null;

function getReadableText() {
  const main = document.getElementById('main-content');
  if (!main) return document.body.innerText;

  const walker = document.createTreeWalker(
    main,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        const tag = el.tagName.toLowerCase();
        if (['script', 'style'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (el.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT;
        if (node.textContent.trim() === '') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let text = '';
  let node;
  while ((node = walker.nextNode())) {
    text += node.textContent + ' ';
  }
  return text.replace(/\s+/g, ' ').trim();
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  speaking = false;
  readBtn.classList.remove('speaking');
  readBtn.innerHTML = `
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
    Read Aloud`;
}

function startSpeaking() {
  const text = getReadableText();
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.lang = 'en-US';

  utterance.onend = stopSpeaking;
  utterance.onerror = stopSpeaking;

  window.speechSynthesis.speak(utterance);
  speaking = true;
  readBtn.classList.add('speaking');
  readBtn.innerHTML = `
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
    Stop`;
}

if (readBtn) {
  if (!('speechSynthesis' in window)) {
    readBtn.style.display = 'none';
  } else {
    readBtn.addEventListener('click', () => {
      if (speaking) {
        stopSpeaking();
      } else {
        startSpeaking();
      }
    });
  }
}

window.addEventListener('beforeunload', () => {
  if (speaking) window.speechSynthesis.cancel();
});
