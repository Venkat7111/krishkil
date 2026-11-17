window.KS = window.KS || {};
KS.pages = KS.pages || {};

KS.pages.splash = function () {
  setTimeout(() => { window.location.href = '/welcome'; }, 2400);
};

KS.pages.welcome = function () {
  document.getElementById('guest-btn')?.addEventListener('click', () => {
    KS.continueAsGuest();
    window.location.href = '/app';
  });
};

KS.pages.login = function () {
  const form = document.getElementById('login-form');
  const err = document.getElementById('login-error');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const fd = new FormData(form);
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      const res = await KS.authAPI.login({ email: fd.get('email'), password: fd.get('password') });
      KS.setUser(res.user);
      KS.toast('Welcome back!', 'success');
      window.location.href = '/app';
    } catch (ex) {
      err.textContent = ex.message || 'Login failed';
    } finally {
      btn.disabled = false;
    }
  });
  document.getElementById('guest-btn')?.addEventListener('click', () => {
    KS.continueAsGuest();
    window.location.href = '/app';
  });
};

KS.pages.register = function () {
  const form = document.getElementById('register-form');
  const pwd = document.getElementById('password');
  const bars = document.getElementById('strength-bars');
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  pwd?.addEventListener('input', () => {
    const v = pwd.value;
    let s = 0;
    if (v.length >= 6) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    if (v.length >= 10) s++;
    s = Math.min(4, Math.max(0, s - (v.length ? 0 : 5)));
    if (!v) s = -1;
    bars?.querySelectorAll('span').forEach((el, i) => el.classList.toggle('on', i <= s && s >= 0));
    const lab = document.getElementById('strength-label');
    if (lab) lab.textContent = s >= 0 ? labels[s] : '';
  });
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('password') !== fd.get('confirmPassword')) {
      KS.toast('Passwords do not match', 'error');
      return;
    }
    if (!form.querySelector('[name=terms]').checked) {
      KS.toast('Please accept terms', 'error');
      return;
    }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      const body = Object.fromEntries(fd.entries());
      delete body.confirmPassword;
      delete body.terms;
      const res = await KS.authAPI.register(body);
      KS.setUser(res.user);
      KS.toast('Account created successfully!', 'success');
      window.location.href = '/app';
    } catch (ex) {
      KS.toast(ex.message || 'Registration failed', 'error');
    } finally {
      btn.disabled = false;
    }
  });
};

KS.pages.forgot = function () {
  document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get('email');
    try {
      await KS.authAPI.sendOtp(email);
      KS.toast('OTP sent to your email', 'success');
      sessionStorage.setItem('ks_reset_email', email);
      window.location.href = '/otp-verification';
    } catch (ex) {
      KS.toast(ex.message, 'error');
    }
  });
};

KS.pages.otp = function () {
  const email = (sessionStorage.getItem('ks_reset_email') || '').trim();
  const emailEl = document.getElementById('otp-email');
  if (emailEl) emailEl.textContent = email || 'your email';

  if (!email) {
    KS.toast('No email found. Please request an OTP from Forgot Password first.', 'error');
  }

  const inputs = [...document.querySelectorAll('.otp-digit')];
  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Backspace' && !input.value && i > 0) inputs[i - 1].focus();
    });
  });

  document.getElementById('otp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = inputs.map((i) => i.value).join('').trim();
    if (!email) {
      KS.toast('Email missing. Please go back to Forgot Password.', 'error');
      return;
    }
    if (otp.length < 6) {
      KS.toast('Please enter all 6 digits of the OTP code', 'error');
      return;
    }
    try {
      await KS.authAPI.verifyOtp(email, otp);
      sessionStorage.setItem('ks_reset_otp', otp);
      KS.toast('OTP verified successfully', 'success');
      window.location.href = '/reset-password';
    } catch (ex) {
      KS.toast(ex.message, 'error');
    }
  });

  document.getElementById('resend-otp')?.addEventListener('click', async () => {
    if (!email) {
      KS.toast('Please request an OTP from Forgot Password first.', 'error');
      return;
    }
    try {
      await KS.authAPI.sendOtp(email);
      KS.toast('New OTP sent to ' + email, 'success');
    } catch (ex) {
      KS.toast(ex.message, 'error');
    }
  });
};

KS.pages.reset = function () {
  document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get('newPassword') !== fd.get('confirmPassword')) {
      KS.toast('Passwords do not match', 'error');
      return;
    }
    try {
      await KS.authAPI.resetPassword({
        email: sessionStorage.getItem('ks_reset_email'),
        otp: sessionStorage.getItem('ks_reset_otp'),
        newPassword: fd.get('newPassword'),
      });
      KS.toast('Password updated!', 'success');
      sessionStorage.removeItem('ks_reset_email');
      sessionStorage.removeItem('ks_reset_otp');
      window.location.href = '/login';
    } catch (ex) {
      KS.toast(ex.message, 'error');
    }
  });
};

KS.pages.dashboard = function () {
  const user = KS.getUser();
  const greet = document.getElementById('dash-greeting');
  if (greet) {
    greet.textContent = KS.isGuest()
      ? KS.t('dashboard.greetingGuest')
      : `${KS.t('dashboard.greetingUser')}, ${(user?.name || 'Farmer').split(' ')[0]}`;
  }
  KS.weatherAPI.current().then((w) => {
    const el = document.getElementById('weather-card');
    if (!el || !w) return;
      el.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <span class="text-primary">☁</span>
        <h3 class="font-display font-semibold">Weather</h3>
      </div>
      <p class="text-3xl font-display font-bold">${Math.round(w.tempC ?? w.temperature ?? w.temp ?? 28)}°C</p>
      <p class="text-sm muted mt-1">${w.condition || w.weather || 'Partly cloudy'} · ${w.humidity ?? '--'}% humidity</p>
      <p class="text-xs muted mt-2">${w.location || w.place || 'Your area'}</p>`;
  }).catch(() => {});
  KS.marketAPI.prices().then((prices) => {
    const el = document.getElementById('market-mini');
    if (!el) return;
    const list = (prices.prices || prices || []).slice(0, 3);
    el.innerHTML = list.map((p) => `
      <div class="flex justify-between text-sm">
        <span class="muted">${p.crop}</span>
        <span class="font-mono-data font-medium">₹${Number(p.price).toLocaleString('en-IN')}</span>
      </div>`).join('') || '<p class="text-sm muted">No prices yet</p>';
  }).catch(() => {});
};

KS.pages.chat = function () {
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const form = document.getElementById('chat-form');
  const suggestionsEl = document.getElementById('chat-suggestions');
  const langSelect = document.getElementById('chat-lang-select');
  let typing = false;

  // Language → BCP-47 locale map for both Speech Recognition & TTS
  const LANG_LOCALE = {
    te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN',
    kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN', en: 'en-IN'
  };

  function getLang() {
    return (langSelect && langSelect.value) || localStorage.getItem('ks_lang') || 'en';
  }

  function setGreeting(lang) {
    localStorage.setItem('ks_lang', lang);
    const first = messagesEl.querySelector('.bubble.assistant[data-i18n]');
    if (first) first.textContent = KS.t('chat.greeting');
    if (input) input.placeholder = KS.t('chat.placeholder');
  }

  function loadSuggestions(lang) {
    KS.chatAPI.suggestions(lang).then((s) => {
      const list = s.suggestions || s || [];
      if (!suggestionsEl) return;
      suggestionsEl.innerHTML = list.map((q) =>
        `<button type="button" class="suggestion-chip" data-q="${String(q).replace(/"/g, '&quot;')}">${q}</button>`
      ).join('');
      suggestionsEl.querySelectorAll('[data-q]').forEach((btn) => {
        btn.addEventListener('click', () => send(btn.dataset.q));
      });
    }).catch(() => {});
  }

  // ── Text-to-Speech ──────────────────────────────────────────────────────
  const synth = window.speechSynthesis;
  let currentUtterance = null;

  function speak(text, lang) {
    if (!synth) return;
    synth.cancel(); // stop any ongoing speech
    const locale = LANG_LOCALE[lang] || 'en-IN';
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale;
    utter.rate = 0.9;
    utter.pitch = 1;

    // Pick a voice that matches the locale
    const voices = synth.getVoices();
    const match = voices.find(v => v.lang === locale)
      || voices.find(v => v.lang.startsWith(locale.split('-')[0]))
      || null;
    if (match) utter.voice = match;

    currentUtterance = utter;
    synth.speak(utter);
  }

  function addBubble(role, content) {
    const div = document.createElement('div');
    div.className = `bubble ${role}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = content;
    div.appendChild(textSpan);

    // Add speaker button to assistant bubbles
    if (role === 'assistant' && synth) {
      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'speak-btn';
      speakBtn.title = 'Read aloud';
      speakBtn.textContent = '🔊';
      speakBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:0.85rem;margin-left:6px;opacity:0.6;vertical-align:middle;';
      speakBtn.addEventListener('click', () => {
        if (synth.speaking && currentUtterance) {
          synth.cancel();
        } else {
          speak(content, getLang());
        }
      });
      div.appendChild(speakBtn);
    }

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping(show) {
    let tip = document.getElementById('typing');
    if (show) {
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'typing';
        tip.className = 'bubble assistant';
        tip.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
        messagesEl.appendChild(tip);
      }
    } else if (tip) tip.remove();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function send(text) {
    const content = (text ?? input.value || '').trim();
    if (!content || typing) return;
    const lang = getLang();
    addBubble('user', content);
    input.value = '';
    typing = true;
    showTyping(true);
    try {
      const res = await KS.chatAPI.ask(content, lang);
      showTyping(false);
      const reply = res.reply || res.answer || res.content || KS.t('chat.greeting');
      addBubble('assistant', reply);
      // Auto-speak the reply in the selected language
      speak(reply, lang);
    } catch (ex) {
      showTyping(false);
      addBubble('assistant', 'Sorry, I could not reach the assistant. ' + ex.message);
    }
    typing = false;
  }

  // Init language selector from localStorage
  const initLang = localStorage.getItem('ks_lang') || 'en';
  if (langSelect) langSelect.value = initLang;
  setGreeting(initLang);
  loadSuggestions(initLang);

  // Language change handler
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      const lang = langSelect.value;
      localStorage.setItem('ks_lang', lang);
      setGreeting(lang);
      loadSuggestions(lang);
      synth && synth.cancel(); // stop speaking when language changes
    });
  }

  form?.addEventListener('submit', (e) => { e.preventDefault(); send(); });

  const params = new URLSearchParams(window.location.search);
  if (params.get('query')) send(params.get('query'));

  // ── Microphone (Speech-to-Text) ─────────────────────────────────────────
  const micBtn = document.getElementById('mic-btn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (micBtn && SpeechRecognition) {
    let rec = null;
    micBtn.addEventListener('click', () => {
      if (rec) {
        rec.stop();
        rec = null;
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤';
        return;
      }
      rec = new SpeechRecognition();
      rec.lang = LANG_LOCALE[getLang()] || 'en-IN'; // ← uses correct locale
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        micBtn.classList.add('recording');
        micBtn.textContent = '⏹';
      };
      rec.onresult = (ev) => {
        const transcript = ev.results[0][0].transcript;
        input.value = transcript;
        // Auto-submit after voice input
        setTimeout(() => send(), 300);
      };
      rec.onerror = (ev) => {
        console.warn('Speech error:', ev.error);
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤';
        rec = null;
      };
      rec.onend = () => {
        rec = null;
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤';
      };
      rec.start();
    });
  } else if (micBtn) {
    micBtn.style.display = 'none'; // hide if browser doesn't support
  }
};

KS.pages.disease = function () {
  const drop = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const cameraInput = document.getElementById('camera-input');
  const preview = document.getElementById('preview');
  const resultEl = document.getElementById('result');
  const loader = document.getElementById('analysis-loader');
  let file = null;

  function setFile(f) {
    file = f;
    if (!f) return;
    const url = URL.createObjectURL(f);
    preview.innerHTML = `<img src="${url}" alt="leaf" style="max-height:220px;margin:0 auto;border-radius:12px;">
      <p class="text-sm muted mt-2">${f.name}</p>`;
    preview.classList.remove('hidden');
  }

  drop?.addEventListener('click', () => fileInput.click());
  drop?.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop?.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('dragover');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  fileInput?.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });
  cameraInput?.addEventListener('change', () => { if (cameraInput.files[0]) setFile(cameraInput.files[0]); });
  document.getElementById('camera-btn')?.addEventListener('click', () => cameraInput.click());

  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const src = btn.dataset.sample;
      const name = btn.dataset.name || 'sample.jpg';
      const res = await fetch(src);
      const blob = await res.blob();
      setFile(new File([blob], name, { type: blob.type || 'image/svg+xml' }));
    });
  });

  async function analyze() {
    if (!file) { KS.toast('Please upload a leaf image', 'error'); return; }
    resultEl.classList.add('hidden');
    loader.classList.remove('hidden');
    const steps = loader.querySelectorAll('[data-step]');
    let step = 0;
    const timer = setInterval(() => {
      step = Math.min(step + 1, steps.length - 1);
      steps.forEach((el, i) => {
        el.classList.toggle('text-emerald', i <= step);
        el.classList.toggle('font-semibold', i === step);
      });
    }, 900);
    try {
      const res = await KS.diseaseAPI.analyze(file);
      clearInterval(timer);
      loader.classList.add('hidden');
      resultEl.classList.remove('hidden');
      const disease = res.disease || res.label || 'Unknown';
      const conf = res.confidence != null ? Math.round(res.confidence * (res.confidence <= 1 ? 100 : 1)) : '--';
      const treatment = Array.isArray(res.treatment) ? res.treatment.join(' · ') : (res.treatment || res.recommendation || res.description || '');
      resultEl.innerHTML = `
        <div class="card leaf">
          <p class="text-xs uppercase muted">Prediction</p>
          <h2 class="font-display text-2xl font-bold text-primary mt-1">${disease}</h2>
          <p class="mt-2 text-sm">Confidence: <strong class="font-mono-data">${conf}%</strong></p>
          <p class="mt-3 text-sm muted">${treatment}</p>
          ${res.crop ? `<p class="mt-2 text-sm">Crop: <strong>${res.crop}</strong></p>` : ''}
          <div class="flex gap-2 mt-4 flex-wrap">
            <a class="btn btn-outline" href="/app/chat?query=${encodeURIComponent('How do I treat ' + disease + '?')}">Ask AI for treatment</a>
            <button type="button" class="btn btn-ghost" id="reanalyze">Analyze another</button>
          </div>
        </div>`;
      document.getElementById('reanalyze')?.addEventListener('click', () => {
        resultEl.classList.add('hidden');
        preview.classList.add('hidden');
        file = null;
      });
    } catch (ex) {
      clearInterval(timer);
      loader.classList.add('hidden');
      KS.toast(ex.message, 'error');
    }
  }

  document.getElementById('analyze-btn')?.addEventListener('click', analyze);
};

KS.pages.crop = function () {
  const form = document.getElementById('crop-form');
  const out = document.getElementById('crop-result');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const body = {};
    fd.forEach((v, k) => {
      body[k] = ['nitrogen','phosphorus','potassium','temperature','humidity','rainfall','ph'].includes(k)
        ? Number(v || 0) : v;
    });
    out.innerHTML = '<p class="muted">Matching your soil profile...</p>';
    try {
      const res = await KS.cropAPI.recommend(body);
      const npk = res.npkChart || [];
      const max = Math.max(...npk.map((n) => n.value || 0), 1);
      out.innerHTML = `
        <div class="card leaf text-center mb-3">
          <p class="text-xs uppercase muted">Best Match</p>
          <p class="font-display text-3xl font-bold text-primary mt-1">${res.crop}</p>
          <div class="flex justify-center gap-6 mt-4 text-sm">
            <div><p class="muted">Confidence</p><p class="font-mono-data font-semibold text-lg">${res.confidence}%</p></div>
            <div><p class="muted">Yield</p><p class="font-mono-data font-semibold text-lg">${res.expectedYield || '--'}</p></div>
            <div><p class="muted">Profit</p><p class="font-mono-data font-semibold text-lg">${res.estimatedProfit || '--'}</p></div>
          </div>
        </div>
        <div class="card">
          <h3 class="font-display font-semibold mb-3">Nutrient Profile</h3>
          <div class="npk-bars">
            ${npk.map((n) => `<div class="bar-col"><div class="bar" style="height:${Math.round((n.value / max) * 100)}%"></div><span class="text-xs">${n.name}</span></div>`).join('')}
          </div>
        </div>
        ${(res.alternatives || []).length ? `<div class="card mt-3"><h3 class="font-display font-semibold mb-2">Alternatives</h3>
          ${(res.alternatives || []).map((a) => `<div class="flex justify-between text-sm py-1"><span>${a.crop}</span><span class="font-mono-data">${a.confidence}%</span></div>`).join('')}
        </div>` : ''}`;
    } catch (ex) {
      out.innerHTML = `<p class="text-red text-sm">${ex.message}</p>`;
    }
  });
};

KS.pages.weather = function () {
  Promise.all([
    KS.weatherAPI.current(),
    KS.weatherAPI.weekly(),
    KS.weatherAPI.alerts(),
  ]).then(([cur, weekly, alerts]) => {
    const c = document.getElementById('weather-current');
    if (c) {
      c.innerHTML = `
        <p class="text-4xl font-display font-bold">${Math.round(cur.tempC ?? cur.temperature ?? cur.temp ?? 28)}°C</p>
        <p class="muted mt-1">${cur.condition || cur.weather || 'Clear'} · Humidity ${cur.humidity ?? '--'}%</p>
        <p class="text-sm muted mt-2">Wind ${cur.windKph ?? cur.windspeed ?? cur.wind ?? '--'} km/h</p>`;
    }
    const w = document.getElementById('weather-week');
    const days = weekly.days || weekly.forecast || weekly || [];
    if (w && Array.isArray(days)) {
      w.innerHTML = days.slice(0, 7).map((d) => `
        <div class="card text-center">
          <p class="text-xs muted">${d.day || d.date || ''}</p>
          <p class="font-display font-bold mt-1">${Math.round(d.high ?? d.max ?? d.temp_max ?? d.temperature ?? 0)}°</p>
          <p class="text-xs muted">Rain ${d.rain ?? 0}%</p>
        </div>`).join('');
    }
    const a = document.getElementById('weather-alerts');
    const list = alerts.alerts || alerts || [];
    if (a) {
      a.innerHTML = (Array.isArray(list) && list.length)
        ? list.map((x) => `<div class="card mb-2"><strong>${x.title || 'Alert'}</strong><p class="text-sm muted mt-1">${x.message || x.description || ''}</p></div>`).join('')
        : '<p class="muted text-sm">No active weather alerts.</p>';
    }
  }).catch((ex) => KS.toast(ex.message, 'error'));

  document.getElementById('alert-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await KS.weatherAPI.sendAlerts({
        recipient_email: fd.get('email'),
        location: fd.get('location') || 'Warangal',
      });
      KS.toast('Rain alert request sent', 'success');
    } catch (ex) {
      KS.toast(ex.message, 'error');
    }
  });
};

KS.pages.irrigation = function () {
  const form = document.getElementById('irrigation-form');
  const out = document.getElementById('irrigation-result');
  async function run() {
    const fd = new FormData(form);
    const body = {
      crop: fd.get('crop'),
      growth_stage: fd.get('stage'),
      soil_type: fd.get('soilType'),
    };
    out.innerHTML = '<p class="muted">Calculating schedule...</p>';
    try {
      const res = await KS.weatherAPI.irrigation(body);
      const interval = res.irrigation_interval_days || 4;
      out.innerHTML = `
        <div class="card leaf mb-3">
          <h3 class="font-display font-semibold">Recommendation</h3>
          <p class="mt-2 text-sm">${res.advice || 'Irrigate based on soil moisture and forecast.'}</p>
          <p class="mt-2 text-sm muted">Water need: <strong>${res.water_requirement_mm ?? '--'} mm</strong> every <strong>${interval}</strong> days</p>
        </div>
        <div class="grid-3">
          ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => `
            <div class="card text-center">
              <p class="text-xs muted">${day}</p>
              <p class="font-semibold mt-1">${i % Math.max(1, Math.round(interval)) === 0 ? 'Irrigate' : 'Skip'}</p>
              <p class="text-xs muted">${i % Math.max(1, Math.round(interval)) === 0 ? (res.water_requirement_mm || '') + ' mm' : ''}</p>
            </div>`).join('')}
        </div>`;
    } catch (ex) {
      out.innerHTML = `<p class="text-red text-sm">${ex.message}</p>`;
    }
  }
  form?.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  form?.addEventListener('change', run);
  if (form) run();
};

KS.pages.fertilizer = function () {
  const search = document.getElementById('pop-search');
  const out = document.getElementById('pop-results');
  async function load(q = '') {
    try {
      const url = q ? `/chat/rag-search` : `/chat/package-of-practices`;
      const data = q
        ? await KS.api(url, { method: 'POST', json: { query: q } })
        : await KS.api(url);
      const docs = data.results || data.documents || data.items || data || [];
      const list = Array.isArray(docs) ? docs : [];
      out.innerHTML = list.length
        ? list.slice(0, 12).map((d) => `
          <div class="card mb-2">
            <h3 class="font-display font-semibold">${d.title || d.crop || 'Package of Practice'}</h3>
            <p class="text-sm muted mt-1">${d.snippet || d.content || d.text || ''}</p>
          </div>`).join('')
        : '<p class="muted text-sm">No PoP documents found.</p>';
    } catch (ex) {
      out.innerHTML = `<p class="text-red text-sm">${ex.message}</p>`;
    }
  }
  let t;
  search?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => load(search.value.trim()), 350);
  });
  document.querySelectorAll('[data-crop-chip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (search) search.value = btn.dataset.cropChip;
      load(btn.dataset.cropChip);
    });
  });
  load();
};

KS.pages.market = function () {
  Promise.all([KS.marketAPI.prices(), KS.marketAPI.nearby(), KS.marketAPI.trend()]).then(([prices, nearby, trend]) => {
    const list = prices.prices || prices || [];
    const pe = document.getElementById('market-prices');
    if (pe) {
      pe.innerHTML = (Array.isArray(list) ? list : []).map((p) => `
        <div class="card leaf">
          <div class="flex justify-between items-center">
            <h3 class="font-display font-semibold">${p.crop}</h3>
            <span class="font-mono-data font-bold text-primary">₹${Number(p.price).toLocaleString('en-IN')}</span>
          </div>
          <p class="text-xs muted mt-1">${p.market || p.mandi || ''} · ${p.unit || 'quintal'}</p>
        </div>`).join('');
    }
    const ne = document.getElementById('nearby-mandis');
    const nlist = nearby.markets || nearby || [];
    if (ne) {
      ne.innerHTML = (Array.isArray(nlist) ? nlist : []).map((m) => `
        <div class="flex justify-between text-sm py-2 border-t">
          <span>${m.name || m.market}</span>
          <span class="muted">${m.distanceKm != null ? m.distanceKm + ' km' : (m.distance || m.location || '')}</span>
        </div>`).join('');
    }
    const te = document.getElementById('market-trend');
    const points = trend.points || trend.data || trend || [];
    if (te && Array.isArray(points) && points.length) {
      const max = Math.max(...points.map((p) => p.price || p.value || 0), 1);
      te.innerHTML = `<div class="npk-bars" style="height:120px">${points.map((p) => `
        <div class="bar-col"><div class="bar" style="height:${Math.round(((p.price || p.value) / max) * 100)}%"></div>
        <span class="text-xs">${p.month || p.label || ''}</span></div>`).join('')}</div>`;
    }
  }).catch((ex) => KS.toast(ex.message, 'error'));
};

KS.pages.news = function () {
  const out = document.getElementById('news-list');
  const search = document.getElementById('news-search');
  async function load(q = '') {
    out.innerHTML = '<div class="grid-3">' + Array.from({ length: 6 }).map(() => '<div class="skeleton-shimmer" style="height:120px"></div>').join('') + '</div>';
    try {
      const data = await KS.newsAPI.list(q);
      const items = data.articles || data.items || data || [];
      out.innerHTML = `<div class="grid lg:grid-3" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">
        ${(Array.isArray(items) ? items : []).map((a) => `
          <a class="card" href="${a.link || a.url || '#'}" target="_blank" rel="noopener">
            <p class="text-xs muted">${a.source || a.publisher || 'Agriculture News'}</p>
            <h3 class="font-display font-semibold mt-1">${a.title}</h3>
            <p class="text-sm muted mt-2">${a.summary || a.description || ''}</p>
          </a>`).join('')}
      </div>`;
    } catch (ex) {
      out.innerHTML = `<p class="text-red text-sm">${ex.message}</p>`;
    }
  }
  let t;
  search?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => load(search.value.trim()), 400);
  });
  document.getElementById('news-refresh')?.addEventListener('click', () => load(search?.value || ''));
  load();
};

KS.pages.schemes = function () {
  const out = document.getElementById('schemes-list');
  const search = document.getElementById('scheme-search');
  const cats = document.getElementById('scheme-cats');
  let category = '';
  async function load() {
    try {
      const params = {};
      if (search?.value) params.q = search.value;
      if (category) params.category = category;
      const data = await KS.schemeAPI.list(params);
      const list = data.schemes || data || [];
      out.innerHTML = (Array.isArray(list) ? list : []).map((s) => `
        <div class="card mb-3">
          <div class="flex justify-between items-start gap-3">
            <div>
              <h3 class="font-display font-semibold">${s.name || s.title}</h3>
              <p class="text-xs muted mt-1">${s.category || ''}</p>
            </div>
            <button type="button" class="icon-btn" data-bookmark="${s.id || s.name}">☆</button>
          </div>
          <p class="text-sm muted mt-2">${s.description || s.summary || ''}</p>
          ${s.eligibility ? `<p class="text-sm mt-2"><strong>Eligibility:</strong> ${s.eligibility}</p>` : ''}
        </div>`).join('') || '<p class="muted text-sm">No schemes found.</p>';
    } catch (ex) {
      out.innerHTML = `<p class="text-red text-sm">${ex.message}</p>`;
    }
  }
  KS.schemeAPI.categories().then((c) => {
    const list = c.categories || c || [];
    if (!cats) return;
    cats.innerHTML = `<button type="button" class="suggestion-chip ${!category ? 'text-primary' : ''}" data-cat="">All</button>` +
      (Array.isArray(list) ? list : []).map((x) => `<button type="button" class="suggestion-chip" data-cat="${x}">${x}</button>`).join('');
    cats.querySelectorAll('[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => { category = btn.dataset.cat; load(); });
    });
  }).catch(() => {});
  let t;
  search?.addEventListener('input', () => { clearTimeout(t); t = setTimeout(load, 350); });
  load();
};

KS.pages.reports = function () {
  const out = document.getElementById('reports-list');
  async function load() {
    try {
      const data = await KS.reportAPI.list();
      const list = data.reports || data || [];
      out.innerHTML = (Array.isArray(list) ? list : []).map((r) => `
        <div class="card mb-2 flex justify-between items-center gap-3">
          <div>
            <h3 class="font-display font-semibold">${r.title || 'Farm Report'}</h3>
            <p class="text-xs muted">${r.created_at || r.date || ''}</p>
          </div>
          <a class="btn btn-outline" href="${KS.reportAPI.pdfUrl(r.id)}" target="_blank">PDF</a>
        </div>`).join('') || '<p class="muted text-sm">No reports yet. Generate one below.</p>';
    } catch (ex) {
      out.innerHTML = `<p class="text-red text-sm">${ex.message}</p>`;
    }
  }
  document.getElementById('generate-report')?.addEventListener('click', async () => {
    try {
      const res = await KS.reportAPI.generate({});
      KS.toast('Report generated', 'success');
      if (res.id) window.open(KS.reportAPI.pdfUrl(res.id), '_blank');
      load();
    } catch (ex) {
      KS.toast(ex.message, 'error');
    }
  });
  load();
};

KS.pages.profile = function () {
  const user = KS.getUser() || {};
  const form = document.getElementById('profile-form');
  if (form) {
    Object.entries({
      name: user.name || '',
      email: user.email || '',
      village: user.village || '',
    }).forEach(([k, v]) => {
      const el = form.querySelector(`[name=${k}]`);
      if (el) el.value = v;
    });
  }
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const next = { ...user, name: fd.get('name'), email: fd.get('email'), village: fd.get('village') };
    if (user.token) next.token = user.token;
    if (!KS.isGuest()) KS.setUser(next);
    KS.toast('Profile saved locally', 'success');
    KS.initShell();
  });
  document.getElementById('delete-account')?.addEventListener('click', () => {
    if (confirm('Clear local session and return to welcome?')) KS.logout();
  });
};

KS.pages.settings = function () {
  const dark = document.getElementById('dark-toggle');
  if (dark) {
    dark.checked = document.documentElement.classList.contains('dark');
    dark.addEventListener('change', () => KS.toggleTheme());
  }
  const lang = document.getElementById('settings-lang');
  if (lang) {
    lang.value = localStorage.getItem('ks_lang') || 'en';
    lang.addEventListener('change', () => KS.setLanguage(lang.value));
  }
};
