window.KS = window.KS || {};

KS.getUser = function () {
  try { return JSON.parse(localStorage.getItem('ks_user') || 'null'); } catch { return null; }
};

KS.isGuest = function () {
  return localStorage.getItem('ks_guest') === '1';
};

KS.isAuthed = function () {
  return !!(KS.getUser() || KS.isGuest());
};

KS.setUser = function (user) {
  localStorage.setItem('ks_user', JSON.stringify(user));
  localStorage.removeItem('ks_guest');
};

KS.continueAsGuest = function () {
  localStorage.setItem('ks_guest', '1');
  localStorage.removeItem('ks_user');
};

KS.logout = function () {
  localStorage.removeItem('ks_user');
  localStorage.removeItem('ks_guest');
  window.location.href = '/welcome';
};

KS.requireAuth = function () {
  if (!KS.isAuthed()) {
    window.location.href = '/welcome';
    return false;
  }
  return true;
};

KS.toast = function (message, type = 'success') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
};

KS.toggleTheme = function () {
  const dark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('ks_theme', dark ? 'dark' : 'light');
};

KS.setLanguage = function (code) {
  localStorage.setItem('ks_lang', code);
  KS.applyI18n();
};

KS.initTheme = function () {
  const theme = localStorage.getItem('ks_theme') || 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

KS.initShell = function () {
  KS.initTheme();
  KS.applyI18n();

  const langSel = document.getElementById('lang-select');
  if (langSel) {
    langSel.value = localStorage.getItem('ks_lang') || 'en';
    langSel.addEventListener('change', (e) => KS.setLanguage(e.target.value));
  }

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', KS.toggleTheme);
  });

  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.remove('hidden');
    });
  }
  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }
  document.querySelectorAll('[data-close-sidebar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sidebar && sidebar.classList.remove('open');
      overlay && overlay.classList.add('hidden');
    });
  });

  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', KS.logout);
  });

  // Wire up PWA Install buttons
  document.querySelectorAll('#pwa-install-btn, #pwa-install-btn-welcome, [data-pwa-install]').forEach((btn) => {
    btn.addEventListener('click', KS.triggerInstall);
  });

  const user = KS.getUser();
  const avatar = document.getElementById('nav-avatar');
  const nameEl = document.getElementById('nav-name');
  if (avatar) {
    const label = user?.name || (KS.isGuest() ? 'G' : 'F');
    avatar.textContent = String(label).charAt(0).toUpperCase();
  }
  if (nameEl) {
    nameEl.textContent = user?.name || (KS.isGuest() ? 'Guest' : 'Farmer');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  KS.initShell();
  const page = document.body.dataset.page;
  if (page && KS.pages && typeof KS.pages[page] === 'function') {
    KS.pages[page]();
  }
});

// PWA Installation handling
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installBtns = document.querySelectorAll('#pwa-install-btn, #pwa-install-btn-welcome, [data-pwa-install]');
  installBtns.forEach((btn) => btn.classList.remove('hidden'));
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const installBtns = document.querySelectorAll('#pwa-install-btn, #pwa-install-btn-welcome, [data-pwa-install]');
  installBtns.forEach((btn) => btn.classList.add('hidden'));
  KS.toast('KrishiSahay installed as an app!', 'success');
});

KS.triggerInstall = async function () {
  if (!deferredInstallPrompt) {
    KS.toast('App can be installed from your browser menu (Add to Home screen / Install app)', 'info');
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice && choice.outcome === 'accepted') {
    KS.toast('Installing KrishiSahay...', 'success');
  }
  deferredInstallPrompt = null;
};

