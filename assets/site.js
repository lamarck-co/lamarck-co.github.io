// ラマルク サイト共通の動き（カーソルの光・スクロールで現れる・数字が数え上がる・画面ツアーのタブ）
(() => {
  // 新しいページは一番上から（埋め込み表示で外側のスクロールが残る時にも）
  if (!location.hash) { try { history.scrollRestoration = 'manual'; } catch (e) {} addEventListener('load', () => { const t = document.body.firstElementChild; if (t && scrollY === 0) t.scrollIntoView({ block: 'start' }); }); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // カーソルの位置に合わせて、カードの中に淡い光
  if (fine) {
    document.addEventListener('pointermove', e => {
      const el = e.target.closest('.spot');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // 見出しの領域の背景の光がカーソルについてくる
  const glowHost = document.querySelector('.page-head');
  if (glowHost && fine && !reduce) {
    glowHost.addEventListener('pointermove', e => {
      const r = glowHost.getBoundingClientRect();
      glowHost.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      glowHost.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  // スクロールで現れる（少しずつずらして）
  const targets = document.querySelectorAll('.sec h2, .sec .intro, .sec .kick, .grid > *, .nums > *, .steps > li, .price > *, .split > *, .tour, .faq > *, .cta-band, .timeline > li');
  targets.forEach(el => {
    el.classList.add('reveal');
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.transitionDelay = (Math.min(sib, 6) * 70) + 'ms';
  });
  const count = el => {
    const to = parseFloat(el.dataset.to), dec = (el.dataset.to.split('.')[1] || '').length, t0 = performance.now(), dur = 1300;
    const step = n => { const k = Math.min(1, (n - t0) / dur), v = to * (1 - Math.pow(1 - k, 3)); el.firstChild.nodeValue = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll('[data-to]').forEach(count);
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(el => el.classList.add('in'));

  // 画面ツアー：タブで切り替え・自動で次へ（触っている間は止める）
  document.querySelectorAll('.tour').forEach(tour => {
    const tabs = [...tour.querySelectorAll('.tabs button')], panes = [...tour.querySelectorAll('.pane')], bar = tour.querySelector('.tabs .ink');
    let cur = 0, timer = null, hold = false;
    const show = i => {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => t.setAttribute('aria-selected', k === cur));
      panes.forEach((p, k) => p.classList.toggle('on', k === cur));
      const t = tabs[cur]; bar.style.width = t.offsetWidth + 'px'; bar.style.transform = `translateX(${t.offsetLeft}px)`;
      const w = t.parentElement; w.scrollTo({ left: t.offsetLeft - (w.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    };
    const loop = () => { clearTimeout(timer); if (!reduce) timer = setTimeout(() => { if (!hold) show(cur + 1); loop(); }, 6000); };
    tabs.forEach((t, k) => t.addEventListener('click', () => { show(k); loop(); }));
    tour.addEventListener('pointerenter', () => hold = true);
    tour.addEventListener('pointerleave', () => hold = false);
    addEventListener('resize', () => show(cur));
    show(0); loop();
  });
})();
