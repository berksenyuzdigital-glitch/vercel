/* ============================================================
   Şenyüz Estate — scroll ile sürülen video arka planı
   Video daima sessizdir: muted açık, ses hiçbir yerde açılmaz.
   ============================================================ */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- 1. Video scrub ---------- */
  const scrolly = document.getElementById('scrolly');
  const stage = document.getElementById('stage');
  const media = document.getElementById('stageMedia');
  const video = document.getElementById('heroVideo');
  const fill = document.getElementById('scrubFill');
  const pct = document.getElementById('scrubPct');
  const cue = document.getElementById('scrollCue');
  const glow = document.getElementById('stageGlow');
  const steps = Array.from(document.querySelectorAll('.step'));

  // Sessizliği kodla da garanti altına al (bazı tarayıcılar attribute'u geç uygular).
  video.muted = true;
  video.volume = 0;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.addEventListener('volumechange', () => {
    if (!video.muted || video.volume !== 0) { video.muted = true; video.volume = 0; }
  });

  let duration = 0;
  let targetTime = 0;
  let shownTime = 0;
  let seeking = false;
  let lastSeekAt = 0;
  let ticking = false;
  let progress = 0;

  // Süre bazı tarayıcılarda metadata anında Infinity gelebilir; her fırsatta tazele.
  function syncDuration() {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0 && d !== duration) {
      duration = d;
      update(true);
      return true;
    }
    return false;
  }

  const onMeta = () => {
    syncDuration();
    // İlk kareyi boyayabilmek için kısa bir sessiz oynatma denemesi yap.
    const kick = video.play();
    if (kick && typeof kick.then === 'function') {
      kick.then(() => video.pause()).catch(() => { /* otomatik oynatma engellendi: scrub yine çalışır */ });
    } else {
      video.pause();
    }
    update(true);
  };

  if (video.readyState >= 1) onMeta();
  else video.addEventListener('loadedmetadata', onMeta, { once: true });
  ['durationchange', 'canplay', 'loadeddata', 'progress'].forEach((ev) =>
    video.addEventListener(ev, syncDuration));

  video.addEventListener('seeked', () => { seeking = false; });
  video.addEventListener('error', () => {
    stage.classList.add('has-error');
    if (cue) cue.style.display = 'none';
  });

  function computeProgress() {
    const rect = scrolly.getBoundingClientRect();
    const travel = scrolly.offsetHeight - window.innerHeight;
    return travel > 0 ? clamp(-rect.top / travel) : 0;
  }

  function paintUI(p) {
    if (fill) fill.style.width = (p * 100).toFixed(2) + '%';
    if (pct) pct.textContent = '%' + Math.round(p * 100);
    if (cue) cue.classList.toggle('is-hidden', p > 0.04);

    const idx = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
  }

  function update(immediate) {
    progress = computeProgress();
    paintUI(progress);
    if (duration === 0 && video.readyState >= 1) syncDuration();
    if (duration > 0) {
      // Son kareye takılmamak için küçük bir pay bırak.
      targetTime = progress * (duration - 0.05);
      if (immediate || reduceMotion) {
        shownTime = targetTime;
        applyTime(shownTime);
      }
    }
  }

  function applyTime(t) {
    // 'seeked' olayı hiç gelmezse (ağ/codec aksaklığı) kilidi 600 ms sonra aç.
    if (seeking && performance.now() - lastSeekAt > 600) seeking = false;
    if (seeking || video.readyState < 1) return;
    if (Math.abs(video.currentTime - t) < 0.015) return;
    seeking = true;
    lastSeekAt = performance.now();
    try { video.currentTime = t; } catch (e) { seeking = false; }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(reduceMotion); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => update(true));

  // Yumuşatma döngüsü: hedef zamana kayarak yaklaş, böylece scroll sıçramaları akışkan görünür.
  if (!reduceMotion) {
    const loop = () => {
      if (duration > 0) {
        shownTime = lerp(shownTime, targetTime, 0.14);
        if (Math.abs(shownTime - targetTime) < 0.004) shownTime = targetTime;
        applyTime(shownTime);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- 2. Fareye duyarlı parallax ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0, pointerOn = false;

    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      pointerOn = true;
      if (glow) { glow.style.left = (e.clientX - r.left) + 'px'; glow.style.top = (e.clientY - r.top) + 'px'; }
    });
    stage.addEventListener('pointerleave', () => { mx = 0; my = 0; pointerOn = false; });

    const parallax = () => {
      cx = lerp(cx, mx, 0.07);
      cy = lerp(cy, my, 0.07);
      media.style.transform = `translate3d(${(-cx * 26).toFixed(2)}px, ${(-cy * 20).toFixed(2)}px, 0)`;
      requestAnimationFrame(parallax);
    };
    requestAnimationFrame(parallax);

    // Kartlarda hafif eğim
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-dy * 4).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 3. Navigasyon ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');

  const onNavScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Menüyü aç' : 'Menüyü kapat');
    mobile.hidden = open;
  });
  mobile.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mobile.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 4. Görünüme girince açılan bloklar + sayaçlar ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        const counter = entry.target.querySelector('[data-count]');
        if (counter) countUp(counter);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => {
      el.classList.add('is-in');
      const counter = el.querySelector('[data-count]');
      if (counter) counter.textContent = counter.dataset.count.replace('.', ',') + (counter.dataset.suffix || '');
    });
  }

  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const dur = 1400;
    const t0 = performance.now();
    const fmt = (n) => n.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const tick = (now) => {
      const p = clamp((now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 5. Menüde aktif bölüm ---------- */
  const sections = ['portfoy', 'yaklasim', 'rakamlar', 'iletisim']
    .map((id) => document.getElementById(id)).filter(Boolean);
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  if ('IntersectionObserver' in window && sections.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => so.observe(s));
  }

  /* ---------- 6. İletişim formu ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ad = form.ad, eposta = form.eposta;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta.value.trim());
    ad.classList.toggle('is-invalid', !ad.value.trim());
    eposta.classList.toggle('is-invalid', !emailOk);

    if (!ad.value.trim() || !emailOk) {
      status.textContent = 'Lütfen adınızı ve geçerli bir e-posta adresini girin.';
      status.className = 'form__status is-error';
      (!ad.value.trim() ? ad : eposta).focus();
      return;
    }
    status.textContent = 'Teşekkürler ' + ad.value.trim().split(' ')[0] + '. Talebiniz alındı, 24 saat içinde dönüş yapacağız.';
    status.className = 'form__status is-ok';
    form.reset();
  });

  document.getElementById('yil').textContent = new Date().getFullYear();
})();
