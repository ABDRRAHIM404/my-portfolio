// Smooth, scroll-controlled curtain with no document movement during the intro.
(() => {
  const curtain = document.getElementById('openingCurtain');
  if (!curtain) return;
  const left = curtain.querySelector('.wing-left');
  const right = curtain.querySelector('.wing-right');
  const center = curtain.querySelector('.curtain-center');
  const wingNames = [...curtain.querySelectorAll('.wing-name')];
  const bar = curtain.querySelector('.curtain-progress-bar');
  const suffixes = [...curtain.querySelectorAll('.curtain-suffix')];
  let suffixWidths = [];
  function measureNames() {
    // Font loading changes text widths. Measure with final font metrics, never at fallback-font sizes.
    suffixWidths = suffixes.map(el => {
      const oldWidth = el.style.width;
      el.style.width = 'max-content';
      const width = Math.ceil(el.scrollWidth || el.getBoundingClientRect().width) + 2;
      el.style.width = oldWidth;
      return width;
    });
  }
  measureNames();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const mobileScreen = window.matchMedia('(max-width: 640px)');
  let target = 0;
  let displayed = 0;
  let ticking = false;
  let opened = false;
  let touchY = null;
  let returning = false;
  const travel = () => Math.max(1000, window.innerHeight * 1.65);
  const site = document.getElementById('portfolioSite');
  // Dynamic browser chrome can change 100dvh while a return animation runs.
  // Pin the cover to the *largest* layout viewport height rather than a transient visual viewport.
  function syncCurtainViewport() {
    if (!mobileScreen.matches) { curtain.style.removeProperty('--mobile-curtain-height'); return; }
    const vp = Math.max(document.documentElement.clientHeight, window.innerHeight, window.visualViewport?.height || 0);
    curtain.style.setProperty('--mobile-curtain-height', `${Math.ceil(vp)}px`);
  }
  syncCurtainViewport();
  window.visualViewport?.addEventListener('resize', syncCurtainViewport);
  window.addEventListener('orientationchange', syncCurtainViewport);
  const clamp = n => Math.min(1, Math.max(0, n));

  function paint(progress) {
    // Ease the panels: no movement or scaling of the actual website.
    // Three distinct phases: reveal initials -> hold full name -> open doors.
    // Keeping the name fully expanded before movement avoids chopped-up words.
    const opening = clamp((progress - 0.57) / 0.43);
    const eased = opening * opening * (3 - 2 * opening);
    left.style.transform = `translate3d(${-105 * eased}%,0,0)`;
    right.style.transform = `translate3d(${105 * eased}%,0,0)`;
    // Unfold each initial into its full name during the first half of the opening.
    const nameProgress = clamp((progress - 0.045) / 0.24);
    const nameEase = 1 - Math.pow(1 - nameProgress, 3);
    suffixes.forEach((el, i) => {
      el.style.width = `${suffixWidths[i] * nameEase}px`;
      el.style.opacity = String(clamp(nameProgress * 5));
    });
    // Names now follow their respective panels instead of remaining at screen center.
    const nameOpacity = clamp((1 - opening) / 0.28);
    wingNames.forEach(el => { el.style.opacity = String(nameOpacity); });
    // Hide centered helper text BEFORE the doors open, preventing overlap with the website.
    center.style.opacity = String(1 - clamp((progress - 0.33) / 0.20));
    // Each bright edge travels with its wing and fades near the end.
    curtain.style.setProperty('--edge-opacity', String(1 - clamp((opening - 0.82) / 0.18)));
    bar.style.transform = `scaleX(${progress})`;
  }
  function lock() {
    syncCurtainViewport();
    if (mobileScreen.matches && window.scrollX !== 0) window.scrollTo(0, window.scrollY);
    root.classList.add('curtain-locked');
    curtain.style.visibility = 'visible';
    curtain.style.pointerEvents = 'auto';
    opened = false;
  }
  function unlock() {
    root.classList.remove('curtain-locked');
    curtain.style.visibility = 'hidden';
    curtain.style.pointerEvents = 'none';
    opened = true;
  }
  function frame() {
    ticking = false;
    displayed += (target - displayed) * 0.16;
    if (Math.abs(target - displayed) < 0.001) displayed = target;
    paint(displayed);
    if (displayed >= 1 && target === 1) { unlock(); return; }
    if (displayed !== target) schedule();
  }
  function schedule() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  function step(delta) {
    // Large mouse-wheel bursts should not skip the name reveal in a single event.
    const limited = Math.max(-145, Math.min(145, delta));
    target = clamp(target + limited / travel());
    if (!opened) schedule();
  }
  function onWheel(e) {
    if (returning) { e.preventDefault(); return; }
    if (reduce.matches || (e.ctrlKey && e.deltaY)) return;
    if (opened && window.scrollY <= 1 && e.deltaY < 0) {
      target = 1; displayed = 1; lock();
    }
    if (!opened) {
      e.preventDefault();
      step(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY);
    }
  }
  function onTouchStart(e) { touchY = e.touches[0]?.clientY ?? null; }
  function onTouchMove(e) {
    if (returning) { e.preventDefault(); return; }
    if (touchY === null || reduce.matches) return;
    const y = e.touches[0]?.clientY;
    if (y == null) return;
    const delta = (touchY - y) * (mobileScreen.matches ? 3.4 : 1.4);
    touchY = y;
    if (opened && window.scrollY <= 1 && delta < 0) { target = 1; displayed = 1; lock(); }
    if (!opened) { e.preventDefault(); step(delta); }
  }
  function onKey(e) {
    if (returning) { if (['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(e.key)) e.preventDefault(); return; }
    if (reduce.matches) return;
    const amount = ({ ArrowDown: 100, ArrowUp: -100, PageDown: 300, PageUp: -300, ' ': e.shiftKey ? -300 : 300 })[e.key];
    if (amount === undefined) return;
    if (opened && window.scrollY <= 1 && amount < 0) { target = 1; displayed = 1; lock(); }
    if (!opened) { e.preventDefault(); step(amount); }
  }
  function onMotionChange() {
    if (reduce.matches) { target = displayed = 1; paint(1); unlock(); }
    else if (window.scrollY <= 1) { target = displayed = 0; paint(0); lock(); }
  }
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKey);
  reduce.addEventListener?.('change', onMotionChange);
  document.fonts?.ready.then(() => { measureNames(); paint(displayed); });
  window.addEventListener('resize', () => { measureNames(); paint(displayed); });
  // Footer return: scroll the document upward smoothly, THEN reverse the existing curtain.
  // Keep the page still while the panels close so there is no layout jump.
  const returnLink=document.querySelector('[data-scroll-curtain="true"]');
  if (returnLink) returnLink.addEventListener('click', event => {
    event.preventDefault();
    if (returning) return;

    const jumpToTop = () => {
      window.scrollTo(0, 0);
      document.scrollingElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if (reduce.matches) {
      jumpToTop();
      target = displayed = 0;
      paint(0);
      return;
    }

    returning = true;
    // Do NOT restore smooth scrolling before the curtain finishes closing.
    // That was allowing the browser to resume a smooth scroll beneath the overlay.
    const previous = {
      rootValue: root.style.getPropertyValue('scroll-behavior'),
      rootPriority: root.style.getPropertyPriority('scroll-behavior'),
      bodyValue: document.body.style.getPropertyValue('scroll-behavior'),
      bodyPriority: document.body.style.getPropertyPriority('scroll-behavior')
    };
    root.style.setProperty('scroll-behavior', 'auto', 'important');
    document.body.style.setProperty('scroll-behavior', 'auto', 'important');

    const restoreBehavior = () => {
      if (previous.rootValue) root.style.setProperty('scroll-behavior', previous.rootValue, previous.rootPriority);
      else root.style.removeProperty('scroll-behavior');
      if (previous.bodyValue) document.body.style.setProperty('scroll-behavior', previous.bodyValue, previous.bodyPriority);
      else document.body.style.removeProperty('scroll-behavior');
      returning = false;
    };
    const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const fromY = Math.max(window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop);
    const scrollDuration = fromY > 1 ? 3000 : 0;
    const closeDuration = 2350;

    // Wait for the page to actually reach Y=0. On mobile, switching overflow
    // and browser toolbar resizing can otherwise leave the hero halfway scrolled.
    function finishScroll(attempt = 0) {
      jumpToTop();
      if (Math.abs(window.scrollY) > 1 && attempt < 12) {
        requestAnimationFrame(() => finishScroll(attempt + 1));
        return;
      }
      syncCurtainViewport();
      target = displayed = 1;
      paint(1);
      lock();
      jumpToTop();

      let closeStart = null;
      function closeFrame(now) {
        if (closeStart === null) closeStart = now;
        const p = clamp((now - closeStart) / closeDuration);
        target = displayed = 1 - ease(p);
        // Keep the document at the real top while the doors close.
        if (window.scrollY > 0 || document.scrollingElement.scrollTop > 0) jumpToTop();
        paint(displayed);
        if (p < 1) requestAnimationFrame(closeFrame);
        else {
          target = displayed = 0;
          paint(0);
          jumpToTop();
          restoreBehavior();
        }
      }
      requestAnimationFrame(closeFrame);
    }

    if (!scrollDuration) { finishScroll(); return; }
    let scrollStart = null;
    function scrollFrame(now) {
      if (scrollStart === null) scrollStart = now;
      const p = clamp((now - scrollStart) / scrollDuration);
      const nextY = Math.round(fromY * (1 - ease(p)));
      window.scrollTo(0, nextY);
      if (p < 1) requestAnimationFrame(scrollFrame);
      else finishScroll();
    }
    requestAnimationFrame(scrollFrame);
  });
  // Restore native navigation when following an internal section link.
  document.querySelectorAll('a[href^="#"]:not([data-scroll-curtain])').forEach(a => a.addEventListener('click', () => {
    target = displayed = 1; paint(1); unlock();
  }));
  if (reduce.matches || window.scrollY > 1 || window.location.hash) {
    target = displayed = 1; paint(1); unlock();
  } else {
    paint(0); lock();
  }
})();
