/* ==========================================================
   Şenyüz Estate

   Film: kaydırma ilerlemesi doğrudan video.currentTime'a
   bağlanır. Ekranda hiçbir oynatıcı arayüzü yoktur; görüntü
   ilerlemenin %82'sine kadar tamamen çıplak kalır, sonra
   perde ve olta cümlesi belirir.

   Video her koşulda sessizdir: kaynak dosyada ses izi yok,
   muted açık ve volume sıfırda kilitli.
   ========================================================== */
(() => {
  'use strict';

  const az = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kis = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ara = (a, b, t) => a + (b - a) * t;

  /* ---------- film ---------- */
  const film = document.getElementById('film');
  const sahne = film.querySelector('.film__stage');
  const kap = document.getElementById('filmMedia');
  const video = document.getElementById('film-video');
  const perde = document.getElementById('filmScrim');
  const olta = document.getElementById('hook');

  // Görüntünün çıplak kaldığı bölüm: ilerlemenin %82'si.
  const FILM_SONU = 0.82;
  // Olta bu aralıkta belirir, kalan pay tutma süresidir.
  const OLTA_BAS = 0.80;
  const OLTA_BIT = 0.93;

  video.muted = true;
  video.volume = 0;
  video.defaultMuted = true;
  video.addEventListener('volumechange', () => {
    if (!video.muted || video.volume !== 0) { video.muted = true; video.volume = 0; }
  });

  let sure = 0;
  let hedef = 0;
  let gosterilen = 0;
  let sariyor = false;
  let sonSarma = 0;
  let bekleyen = false;

  function sureyiTazele() {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0 && d !== sure) { sure = d; guncelle(true); return true; }
    return false;
  }

  function baslat() {
    sureyiTazele();
    // İlk kareyi boyatmak için kısa, sessiz bir oynatma denemesi.
    const p = video.play();
    if (p && typeof p.then === 'function') p.then(() => video.pause()).catch(() => {});
    else video.pause();
    guncelle(true);
  }

  if (video.readyState >= 1) baslat();
  else video.addEventListener('loadedmetadata', baslat, { once: true });
  ['durationchange', 'canplay', 'loadeddata', 'progress'].forEach((e) =>
    video.addEventListener(e, sureyiTazele));
  video.addEventListener('seeked', () => { sariyor = false; });

  function ilerleme() {
    const r = film.getBoundingClientRect();
    const yol = film.offsetHeight - window.innerHeight;
    return yol > 0 ? kis(-r.top / yol) : 0;
  }

  function boya(p) {
    const o = kis((p - OLTA_BAS) / (OLTA_BIT - OLTA_BAS));
    // yumuşak giriş, son karelerde tam okunurluk
    const e = o * o * (3 - 2 * o);
    perde.style.opacity = e.toFixed(3);
    olta.style.opacity = e.toFixed(3);
    olta.style.transform = `translateY(${((1 - e) * 22).toFixed(1)}px)`;
  }

  function guncelle(hemen) {
    const p = ilerleme();
    boya(p);
    if (sure === 0 && video.readyState >= 1) sureyiTazele();
    if (sure > 0) {
      hedef = kis(p / FILM_SONU) * (sure - 0.05);
      if (hemen || az) { gosterilen = hedef; uygula(gosterilen); }
    }
  }

  function uygula(t) {
    if (sariyor && performance.now() - sonSarma > 600) sariyor = false;
    if (sariyor || video.readyState < 1) return;
    if (Math.abs(video.currentTime - t) < 0.015) return;
    sariyor = true;
    sonSarma = performance.now();
    try { video.currentTime = t; } catch (e) { sariyor = false; }
  }

  window.addEventListener('scroll', () => {
    if (bekleyen) return;
    bekleyen = true;
    requestAnimationFrame(() => { guncelle(az); bekleyen = false; });
  }, { passive: true });
  window.addEventListener('resize', () => guncelle(true));

  if (!az) {
    const dongu = () => {
      if (sure > 0) {
        gosterilen = ara(gosterilen, hedef, 0.14);
        if (Math.abs(gosterilen - hedef) < 0.004) gosterilen = hedef;
        uygula(gosterilen);
      }
      requestAnimationFrame(dongu);
    };
    requestAnimationFrame(dongu);
  }

  /* ---------- fareye duyarlı kayma ---------- */
  if (!az && window.matchMedia('(hover: hover)').matches) {
    let hx = 0, hy = 0, sx = 0, sy = 0;
    sahne.addEventListener('pointermove', (e) => {
      const r = sahne.getBoundingClientRect();
      hx = (e.clientX - r.left) / r.width - 0.5;
      hy = (e.clientY - r.top) / r.height - 0.5;
    });
    sahne.addEventListener('pointerleave', () => { hx = 0; hy = 0; });
    const kay = () => {
      sx = ara(sx, hx, 0.06); sy = ara(sy, hy, 0.06);
      kap.style.transform = `translate3d(${(-sx * 22).toFixed(2)}px,${(-sy * 16).toFixed(2)}px,0)`;
      requestAnimationFrame(kay);
    };
    requestAnimationFrame(kay);
  }

  /* ---------- üst künye ---------- */
  const kunye = document.getElementById('masthead');
  // Film ekranı terk edene kadar künye görüntünün üstünde açık renkte kalır.
  const gecis = () => kunye.classList.toggle('is-past', film.getBoundingClientRect().bottom <= 72);
  window.addEventListener('scroll', gecis, { passive: true });
  gecis();

  const burger = document.getElementById('burger');
  const cekmece = document.getElementById('drawer');
  burger.addEventListener('click', () => {
    const acik = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!acik));
    burger.setAttribute('aria-label', acik ? 'Menüyü aç' : 'Menüyü kapat');
    cekmece.hidden = acik;
    kunye.classList.toggle('is-open', !acik);
  });
  cekmece.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') return;
    cekmece.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    kunye.classList.remove('is-open');
  });

  /* ---------- görünüme girenler ---------- */
  const gorunecek = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !az) {
    const io = new IntersectionObserver((girisler) => {
      girisler.forEach((g) => {
        if (!g.isIntersecting) return;
        g.target.classList.add('in');
        io.unobserve(g.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    gorunecek.forEach((el) => io.observe(el));
    // Gözlemci bir nedenle çalışmazsa ekranda olan hiçbir şey gizli kalmasın.
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      });
    }, 1600);
  } else {
    gorunecek.forEach((el) => el.classList.add('in'));
  }

  /* ---------- menüde bulunulan bölüm ---------- */
  const bolumler = ['neden', 'ev', 'portfoy', 'iletisim']
    .map((id) => document.getElementById(id)).filter(Boolean);
  const baglar = Array.from(document.querySelectorAll('.masthead__nav a'));
  if ('IntersectionObserver' in window && bolumler.length) {
    const so = new IntersectionObserver((girisler) => {
      girisler.forEach((g) => {
        if (!g.isIntersecting) return;
        baglar.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + g.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    bolumler.forEach((b) => so.observe(b));
  }

  /* ---------- talep formu ---------- */
  const form = document.getElementById('form');
  const durum = document.getElementById('stat');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ad = form.ad, mail = form.mail;
    const mailUygun = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim());
    ad.classList.toggle('bad', !ad.value.trim());
    mail.classList.toggle('bad', !mailUygun);

    if (!ad.value.trim() || !mailUygun) {
      durum.textContent = !ad.value.trim()
        ? 'Adınızı yazın.'
        : 'E-posta adresi eksik ya da hatalı görünüyor.';
      durum.className = 'stat bad';
      (!ad.value.trim() ? ad : mail).focus();
      return;
    }
    durum.textContent = 'Aldık. ' + ad.value.trim().split(' ')[0] + ', bugün içinde dönüyoruz.';
    durum.className = 'stat ok';
    form.reset();
  });

  document.getElementById('yil').textContent = new Date().getFullYear();
})();
