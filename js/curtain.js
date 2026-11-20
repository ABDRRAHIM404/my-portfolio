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
    const delta = (touchY - y) * 2;
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
  if(returnLink) returnLink.addEventListener('click', event=>{
    event.preventDefault();
    if(returning) return;
    if(reduce.matches){window.scrollTo({top:0,behavior:'instant'});return;}
    returning=true;
    // Force deterministic per-frame scrolling even when the page uses smooth CSS scrolling.
    const previousScrollBehavior=root.style.scrollBehavior;
    root.style.scrollBehavior='auto';
    const fromY=window.scrollY;
    const scrollDuration=fromY>1?3000:0;
    const ease=x=> x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
    const afterScroll=()=>{
      window.scrollTo(0,0);
      root.style.scrollBehavior=previousScrollBehavior;
      // Lock only at page top. The page never moves during closing.
      target=displayed=1;
      paint(1);
      lock();
      let started=null;
      const closeDuration=2350;
      function closeFrame(now){
        if(!returning)return;
        if(started===null)started=now;
        const p=clamp((now-started)/closeDuration);
        target=displayed=1-ease(p);
        paint(displayed);
        if(p<1) requestAnimationFrame(closeFrame);
        else { target=displayed=0;paint(0);returning=false; }
      }
      requestAnimationFrame(closeFrame);
    };
    if(!scrollDuration){afterScroll();return;}
    let start=null;
    function scrollFrame(now){
      if(!returning)return;
      if(start===null)start=now;
      const p=clamp((now-start)/scrollDuration);
      window.scrollTo(0,Math.round(fromY*(1-ease(p))));
      if(p<1)requestAnimationFrame(scrollFrame);
      else afterScroll();
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
