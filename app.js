// Lightbox for slide strips and figures marked data-zoom, plus copy buttons in the footer.
(function () {
  var items = [], idx = 0, box = null;

  function open(list, i) {
    items = list; idx = i;
    if (!box) {
      box = document.createElement('div');
      box.className = 'lb'; box.hidden = true;
      box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<img alt=""><div class="bar"><button type="button" data-a="x">닫기 ✕</button></div>' +
        '<button type="button" class="nav-l" data-a="p" aria-label="이전">‹</button>' +
        '<button type="button" class="nav-r" data-a="n" aria-label="다음">›</button>';
      box.addEventListener('click', function (e) {
        var a = e.target.getAttribute('data-a');
        if (a === 'p') step(-1); else if (a === 'n') step(1);
        else if (a === 'x' || e.target === box) close();
      });
      document.body.appendChild(box);
    }
    show(); box.hidden = false;
    box.querySelector('[data-a="x"]').focus();
  }
  function show() {
    var img = box.querySelector('img');
    img.src = items[idx].src; img.alt = items[idx].alt || '';
    var many = items.length > 1;
    box.querySelector('.nav-l').hidden = !many;
    box.querySelector('.nav-r').hidden = !many;
  }
  function step(d) { idx = (idx + d + items.length) % items.length; show(); }
  function close() { if (box) box.hidden = true; }

  document.addEventListener('keydown', function (e) {
    if (!box || box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  document.querySelectorAll('.slides').forEach(function (strip) {
    var btns = Array.prototype.slice.call(strip.querySelectorAll('button'));
    var list = btns.map(function (b) { return { src: b.getAttribute('data-full'), alt: b.querySelector('img').alt }; });
    btns.forEach(function (b, i) { b.addEventListener('click', function () { open(list, i); }); });
  });
  document.querySelectorAll('img[data-zoom]').forEach(function (img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () { open([{ src: img.currentSrc || img.src, alt: img.alt }], 0); });
  });

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () { btn.textContent = '복사됨'; setTimeout(function () { btn.textContent = '복사'; }, 1600); };
      try {
        navigator.clipboard.writeText(text).then(done, function () { select(btn); });
      } catch (e) { select(btn); }
    });
  });
  function select(btn) {
    var span = btn.previousElementSibling;
    var r = document.createRange(); r.selectNodeContents(span);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
})();

// Keep the cutscene banner still for viewers who ask for reduced motion.
(function () {
  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  document.querySelectorAll('video.hero-video').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
})();

// Project galleries: thumbnails swap the main image; the video thumb plays the muted clip.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var img = g.querySelector('.g-img'), vid = g.querySelector('.g-video');
    var thumbs = Array.prototype.slice.call(g.querySelectorAll('.g-thumb'));
    function playVideo() {
      if (!vid) return;
      if (!vid.src) vid.src = vid.getAttribute('data-src');
      vid.hidden = false; img.hidden = true;
      if (!reduce) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    }
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        thumbs.forEach(function (o) { o.setAttribute('aria-pressed', o === t ? 'true' : 'false'); });
        if (t.getAttribute('data-type') === 'video') { playVideo(); return; }
        if (vid) { vid.pause(); vid.hidden = true; }
        img.src = t.getAttribute('data-src'); img.alt = t.getAttribute('aria-label') || ''; img.hidden = false;
      });
    });
    if (vid && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (vid.hidden) return;
          if (e.isIntersecting) playVideo(); else vid.pause();
        });
      }, { threshold: .35 }).observe(g);
    } else if (vid) { playVideo(); }
  });
})();

// Banner caption follows whichever scene the mixed banner clip is showing.
(function () {
  var cap = document.querySelector('.banner-cap[data-caps]');
  var v = document.querySelector('.banner-sheet .hero-video');
  if (!cap || !v) return;
  var now = cap.querySelector('.cap-now');
  var caps = cap.getAttribute('data-caps').split('|').map(function (s) {
    var i = s.indexOf(':'); return { t: parseFloat(s.slice(0, i)), label: s.slice(i + 1) };
  });
  v.addEventListener('timeupdate', function () {
    var label = caps[0].label;
    caps.forEach(function (c) { if (v.currentTime >= c.t) label = c.label; });
    if (now.textContent !== label) now.textContent = label;
  });
})();
