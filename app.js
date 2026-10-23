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
