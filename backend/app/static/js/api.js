window.KS = window.KS || {};

KS.api = async function (path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const user = KS.getUser();
  if (user && user.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${user.token}`;
  }
  if (options.json) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.json);
    delete options.json;
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('ks_user');
  }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (data && data.detail) ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : 'Request failed';
    throw new Error(msg);
  }
  return data;
};

KS.authAPI = {
  login: (body) => KS.api('/auth/login', { method: 'POST', json: body }),
  register: (body) => KS.api('/auth/register', { method: 'POST', json: body }),
  sendOtp: (email) => KS.api('/auth/send-otp', { method: 'POST', json: { email } }),
  verifyOtp: (email, otp) => KS.api('/auth/verify-otp', { method: 'POST', json: { email, otp } }),
  resetPassword: (body) => KS.api('/auth/reset-password', { method: 'POST', json: body }),
};

KS.chatAPI = {
  ask: (message, language) => KS.api('/chat/ask', { method: 'POST', json: { message, language: language || localStorage.getItem('ks_lang') || 'en' } }),
  suggestions: (lang) => KS.api('/chat/suggestions?lang=' + (lang || localStorage.getItem('ks_lang') || 'en')),
  popPdf: '/chat/pop-pdf',
};

KS.diseaseAPI = {
  analyze: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const user = KS.getUser();
    const headers = {};
    if (user && user.token) headers.Authorization = `Bearer ${user.token}`;
    const res = await fetch('/disease/analyze', { method: 'POST', body: fd, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Analysis failed');
    return data;
  },
};

KS.cropAPI = {
  recommend: (body) => KS.api('/crop/recommend', { method: 'POST', json: body }),
};

KS.weatherAPI = {
  current: () => KS.api('/weather/current'),
  hourly: () => KS.api('/weather/hourly'),
  weekly: () => KS.api('/weather/weekly'),
  alerts: () => KS.api('/weather/alerts'),
  sendAlerts: (body) => KS.api('/weather/send-alerts', { method: 'POST', json: body }),
  irrigation: (body) => KS.api('/weather/irrigation-predict', { method: 'POST', json: body }),
};

KS.marketAPI = {
  prices: () => KS.api('/market/prices'),
  nearby: () => KS.api('/market/nearby'),
  trend: () => KS.api('/market/trend'),
};

KS.newsAPI = {
  list: (q = '') => KS.api('/news' + (q ? `?q=${encodeURIComponent(q)}` : '')),
};

KS.schemeAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return KS.api('/schemes' + (qs ? `?${qs}` : ''));
  },
  categories: () => KS.api('/schemes/categories'),
};

KS.reportAPI = {
  list: () => KS.api('/reports'),
  generate: (body = {}) => KS.api('/reports/generate', { method: 'POST', json: body }),
  pdfUrl: (id) => `/reports/${id}/pdf`,
};
