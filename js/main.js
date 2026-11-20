document.getElementById('year').textContent = new Date().getFullYear();
    const menuButton = document.getElementById('menuButton');
    const nav = document.getElementById('mainNav');
    menuButton.addEventListener('click', () => {const isOpen = nav.classList.toggle('open');menuButton.setAttribute('aria-expanded', String(isOpen));menuButton.setAttribute('aria-label',isOpen?'Close navigation':'Open navigation')});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));
    if ('IntersectionObserver' in window){const observer = new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'))}


// English / French language switcher, kept fully offline.
function setPortfolioLanguage(lang) {
  if (!['en', 'fr'].includes(lang)) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const values = portfolioTranslations[el.dataset.i18n];
    if (values && values[lang]) el.innerHTML = values[lang];
  });
  document.documentElement.lang = lang;
  document.title = lang === 'fr' ? 'Abderrahim Bounga — Portfolio développeur' : 'Abderrahim Bounga — Developer Portfolio';
  document.querySelector('meta[name="description"]').content = lang === 'fr' ? 'Portfolio de développeur d’Abderrahim Bounga : projets, compétences, expériences et contact.' : 'Abderrahim Bounga — developer portfolio. Explore selected web and app projects, skills, and ways to connect.';
  document.querySelectorAll('.lang-btn').forEach(button => {
    const selected = button.dataset.lang === lang;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  try {localStorage.setItem('portfolio-language', lang);} catch(e) {}
}
document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click', () => setPortfolioLanguage(button.dataset.lang)));
let savedLanguage = 'en';
try {savedLanguage = localStorage.getItem('portfolio-language') || 'en';} catch(e) {}
setPortfolioLanguage(savedLanguage);


// Hero magical effects: cursor spotlight + subtle 3D parallax.
(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const copy = hero.querySelector('.hero-copy-inner');
  const art = hero.querySelector('.hero-art-inner');
  const shell = hero.querySelector('.portrait-shell');
  const chips = hero.querySelectorAll('.portrait-chip');
  const orbits = hero.querySelectorAll('.portrait-orbit');

  function resetEffects() {
    hero.style.setProperty('--mx', '50%');
    hero.style.setProperty('--my', '42%');
    hero.style.setProperty('--copyX', '0px');
    hero.style.setProperty('--copyY', '0px');
    hero.style.setProperty('--artX', '0px');
    hero.style.setProperty('--artY', '0px');
    hero.style.setProperty('--tiltX', '0deg');
    hero.style.setProperty('--tiltY', '0deg');
    hero.style.setProperty('--chipX', '0px');
    hero.style.setProperty('--chipY', '0px');
    hero.style.setProperty('--orbitX', '0px');
    hero.style.setProperty('--orbitY', '0px');
  }

  function updateFromPointer(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const cx = px - 0.5;
    const cy = py - 0.5;
    hero.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
    hero.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
    hero.style.setProperty('--copyX', `${(-cx * 4).toFixed(2)}px`);
    hero.style.setProperty('--copyY', `${(-cy * 3).toFixed(2)}px`);
    hero.style.setProperty('--artX', `${(cx * 6).toFixed(2)}px`);
    hero.style.setProperty('--artY', `${(cy * 6).toFixed(2)}px`);
    hero.style.setProperty('--tiltX', `${(-cy * 3).toFixed(2)}deg`);
    hero.style.setProperty('--tiltY', `${(cx * 4).toFixed(2)}deg`);
    hero.style.setProperty('--chipX', `0px`);
    hero.style.setProperty('--chipY', `0px`);
    hero.style.setProperty('--orbitX', `${(cx * 10).toFixed(2)}px`);
    hero.style.setProperty('--orbitY', `${(cy * 10).toFixed(2)}px`);
  }

  if (!reduce.matches && finePointer.matches) {
    hero.addEventListener('mousemove', (e) => updateFromPointer(e.clientX, e.clientY));
    hero.addEventListener('mouseleave', resetEffects);
  } else {
    resetEffects();
  }

  const syncModes = () => {
    if (reduce.matches || !finePointer.matches) resetEffects();
  };
  reduce.addEventListener?.('change', syncModes);
  finePointer.addEventListener?.('change', syncModes);
  resetEffects();
})();


// About Me reveal and a restrained pointer tilt. Independent of the curtain and hero.
(() => {
  const section = document.querySelector('#about.about-magic');
  if (!section) return;
  const card = section.querySelector('.about-art');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          section.classList.add('in-view');
          observer.disconnect();
          break;
        }
      }
    }, {threshold: 0.15});
    observer.observe(section);
  } else section.classList.add('in-view');
  const reset = () => {
    card.style.setProperty('--about-rotate-x','0deg');
    card.style.setProperty('--about-rotate-y','0deg');
  };
  card.addEventListener('pointermove', e => {
    if (motion.matches || !finePointer.matches) return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.setProperty('--about-pointer-x',`${(x+.5)*100}%`);
    card.style.setProperty('--about-pointer-y',`${(y+.5)*100}%`);
    card.style.setProperty('--about-rotate-x',`${(-y*5).toFixed(2)}deg`);
    card.style.setProperty('--about-rotate-y',`${(x*6).toFixed(2)}deg`);
  });
  card.addEventListener('pointerleave',reset);
  motion.addEventListener?.('change',reset);
  finePointer.addEventListener?.('change',reset);
})();


// Career timelines: glowing progress follows the reader, no layout shifts.
(() => {
  const section = document.querySelector('#experience.experience-magic');
  if (!section) return;
  const tracks = Array.from(section.querySelectorAll('.experience-track'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  function update() {
    pending = false;
    const viewportLine = window.innerHeight * .72;
    tracks.forEach(track => {
      const rail = track.querySelector('.experience-rail');
      const rect = rail.getBoundingClientRect();
      const amount = reduce.matches ? 1 : Math.max(0,Math.min(1,(viewportLine - rect.top)/rect.height));
      track.style.setProperty('--timeline-progress',`${(amount*100).toFixed(2)}%`);
      const lineEnd = rect.top + rect.height*amount;
      track.querySelectorAll('.journey-entry').forEach(item => {
        const dot = item.querySelector('.journey-dot');
        const dotTop=dot.getBoundingClientRect().top + 6;
        item.classList.toggle('is-reached',reduce.matches || dotTop <= lineEnd + 2);
      });
    });
  }
  const request=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request,{passive:true});
  reduce.addEventListener?.('change',request);
  request();
})();

// Subtle pointer-following contact light; disabled for touch/reduced motion.
(() => {
 const stage=document.querySelector('.contact-stage');if(!stage)return;
 if(!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let frame=0;
 stage.addEventListener('pointermove',event=>{
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   const r=stage.getBoundingClientRect();
   stage.style.setProperty('--contact-x',`${((event.clientX-r.left)/r.width*100).toFixed(1)}%`);
   stage.style.setProperty('--contact-y',`${((event.clientY-r.top)/r.height*100).toFixed(1)}%`);
   frame=0;
  });
 });
 stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--contact-x','75%');stage.style.setProperty('--contact-y','15%')});
})();


// Header and footer: navigation tracking, reading progress and translated labels.
(() => {
  const header=document.querySelector('.header-polished');
  if (!header) return;
  const progressBar=document.querySelector('.header-progress');
  const links=[...header.querySelectorAll('[data-section-link]')];
  const sections=links.map(a=>({link:a,element:document.querySelector(a.getAttribute('href'))})).filter(o=>o.element);
  const setProgress=()=>{
    const scrollTop=window.scrollY;
    const available=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    progressBar?.style.setProperty('--header-progress',String(Math.min(1,Math.max(0,scrollTop/available))));
    header.classList.toggle('is-scrolled',scrollTop>22);
    let active=null;
    for (const item of sections) if(item.element.getBoundingClientRect().top<=window.innerHeight*.38) active=item;
    links.forEach(link=>{link.classList.toggle('is-active',active?.link===link);if(active?.link===link)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  };
  let scheduled=false;
  window.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;setProgress()})},{passive:true});
  window.addEventListener('resize',setProgress,{passive:true});
  setProgress();
  const syncCustomLabels=()=>{
    const lang=document.documentElement.lang==='fr'?'fr':'en';
    document.querySelectorAll('[data-ui-en][data-ui-fr]').forEach(el=>{el.textContent=el.getAttribute('data-ui-'+lang)})
  };
  document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',syncCustomLabels));
  syncCustomLabels();
  const menu=document.getElementById('menuButton'),nav=document.getElementById('mainNav');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.focus()}});
  document.addEventListener('pointerdown',e=>{if(!header.contains(e.target)&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});
})();


// Inline languages: translate the labels and animate the bars only once they enter the viewport.
(() => {
  const block=document.querySelector('.languages-block');
  if (!block) return;
  const names={
    en:{heading:'Languages',arabic:'Arabic',amazigh:'Amazigh',french:'French',english:'English'},
    fr:{heading:'Langues',arabic:'Arabe',amazigh:'Amazigh',french:'Français',english:'Anglais'}
  };
  const translate=()=>{
    const t=names[document.documentElement.lang==='fr'?'fr':'en'];
    block.querySelector('[data-lang-heading]').textContent=t.heading;
    block.querySelectorAll('[data-lang-key]').forEach(el=>{el.textContent=t[el.dataset.langKey]});
  };
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.addEventListener('click',translate));
  translate();
  if ('IntersectionObserver' in window) {
    const obs=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){block.classList.add('languages-visible');obs.disconnect()}
    },{threshold:.15});
    obs.observe(block);
  } else block.classList.add('languages-visible');
})();
