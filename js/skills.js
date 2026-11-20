// Hover/focus to explore, tap-to-open on mobile. The floating panel never changes grid height.
(() => {
  const cards = [...document.querySelectorAll('#skills .skill-card[data-skill]')];
  const pane = document.getElementById('skillPreview');
  if (!cards.length || !pane) return;
  const code = document.getElementById('skillPreviewCode');
  const heading = document.getElementById('skillPreviewHeading');
  const fileName = document.getElementById('skillFilename');
  const status = document.getElementById('skillPreviewStatus');
  const tabs = document.getElementById('skillPreviewTabs');
  const close = document.getElementById('skillPreviewClose');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = window.matchMedia('(hover:hover) and (pointer:fine)');
  const data = {
    frontend: [
      {label:'HTML',file:'index.html',type:'html',text:'<section class="hero">\n  <h1>Hello, world!</h1>\n  <p>Let’s build something.</p>\n</section>'},
      {label:'CSS',file:'style.css',type:'css',text:'.hero {\n  display: flex;\n  color: #b99aff;\n  transition: .3s ease;\n}'},
      {label:'JS',file:'main.js',type:'js',text:'const developer = {\n  name: "Abderrahim",\n  passion: "Creating"\n};'}
    ],
    app: [{label:'React',file:'Profile.tsx',type:'js',text:'type Props = { name: string };\n\nexport default function Profile({ name }: Props) {\n  return <h1>Hi, {name}!</h1>;\n}'}],
    data: [{label:'SQL',file:'projects.sql',type:'sql',text:'SELECT name, status\nFROM projects\nWHERE status = \'active\'\nORDER BY created_at DESC;'},
           {label:'API',file:'api.ts',type:'js',text:'const res = await fetch("/api/projects");\nconst projects = await res.json();\nconsole.log(projects);'}],
    workflow: [{label:'Git',file:'terminal',type:'terminal',text:'$ git status\nOn branch main\n$ git add .\n$ git commit -m "Build something"\n✓ Working tree clean'},
               {label:'Deploy',file:'terminal',type:'terminal',text:'$ npm run build\n✓ Build successful\n$ vercel --prod\n✓ Deployment ready'}],
    professional: [{label:'Mindset',file:'values.txt',type:'plain',text:'✓ Communication\n✓ Teamwork\n✓ Problem solving\n✓ Organization\n✓ Continuous learning'}]
  };
  const titles = {
    en:{frontend:'Frontend playground',app:'React component',data:'Data & integrations',workflow:'Developer workflow',professional:'How I work',ready:'Ready'},
    fr:{frontend:'Atelier frontend',app:'Composant React',data:'Données & intégrations',workflow:'Méthodes de développement',professional:'Mes qualités',ready:'Prêt'}
  };
  let active = null;
  let frame = null;
  let typingFrom = 0;
  let closeDelay = null;
  const clamp = (n,lo,hi) => Math.max(lo,Math.min(hi,n));
  const currentLang = () => document.documentElement.lang === 'fr' ? 'fr' : 'en';
  function highlight(text,type) {
    code.replaceChildren();
    // Conservative tokenizer: no innerHTML from code, all text is inserted as text nodes.
    const pattern = type === 'html' ? /(<\/?[\w-]+|>|\bclass(?==)|"[^"]*")/g :
      type === 'css' ? /(#[0-9a-fA-F]{3,8}|\b(?:display|color|transition|flex|ease)\b|\d+(?:\.\d+)?(?:s|px|rem)?)/g :
      type === 'sql' ? /(\b(?:SELECT|FROM|WHERE|ORDER BY|DESC)\b|'[^']*')/g :
      type === 'terminal' ? /(^\$[^\n]*|✓[^\n]*)/gm :
      type === 'plain' ? /(✓)/g :
      /(\b(?:const|let|await|export|default|function|return|type|console|log|string)\b|"[^"]*"|\b\d+\b)/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      const start = match.index;
      if (start > last) code.append(document.createTextNode(text.slice(last,start)));
      const span = document.createElement('span');
      span.className = match[0].startsWith('"') || match[0].startsWith("'") ? 'skill-token-string' :
        match[0].startsWith('<') ? 'skill-token-tag' :
        /^\d|^#/.test(match[0]) ? 'skill-token-number' : 'skill-token-keyword';
      span.textContent = match[0];code.append(span);last=start+match[0].length;
    }
    if(last<text.length)code.append(document.createTextNode(text.slice(last)));
  }
  function showSnippet(snippet){
    if (frame) cancelAnimationFrame(frame);
    fileName.textContent = snippet.file;
    const all = snippet.text;
    if (reduce.matches) {highlight(all,snippet.type);return;}
    typingFrom = performance.now();
    const run = now => {
      const chars = Math.min(all.length,Math.max(1,Math.floor((now-typingFrom)/19)));
      highlight(all.slice(0,chars),snippet.type);
      if(chars<all.length)frame=requestAnimationFrame(run);
      else frame=null;
    };
    frame=requestAnimationFrame(run);
  }
  function position(){
    if(!active || window.innerWidth <= 640) return;
    const rect=active.getBoundingClientRect();
    const pw=Math.min(390,window.innerWidth-28);
    const ph=pane.offsetHeight || 300;
    const gap=15;
    let x;
    if(window.innerWidth-rect.right >= pw+gap+14) x=rect.right+gap;
    else if(rect.left >= pw+gap+14) x=rect.left-pw-gap;
    else x=rect.left+(rect.width-pw)/2;
    const y=clamp(rect.top-8,14,window.innerHeight-ph-14);
    pane.style.left=`${clamp(x,14,window.innerWidth-pw-14)}px`;
    pane.style.top=`${Math.max(14,y)}px`;
    pane.style.bottom='auto';
  }
  function open(card){
    clearTimeout(closeDelay);
    if(active === card && pane.classList.contains('is-open')) return;
    active=card;
    cards.forEach(el=>{const chosen=el===card;el.classList.toggle('skill-active',chosen);el.setAttribute('aria-expanded',String(chosen));});
    pane.classList.add('is-open');pane.setAttribute('aria-hidden','false');pane.inert=false;
    const lang=currentLang();
    heading.textContent=titles[lang][card.dataset.skill];
    status.textContent=titles[lang].ready;
    const entries=data[card.dataset.skill];
    tabs.replaceChildren();
    entries.forEach((snippet,i)=>{
      const button=document.createElement('button');button.type='button';button.textContent=snippet.label;
      button.setAttribute('aria-pressed',String(i===0));
      button.addEventListener('click',()=>{
        tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        showSnippet(snippet);
      });tabs.append(button);
    });
    showSnippet(entries[0]);
    requestAnimationFrame(position);
  }
  function hide(){
    clearTimeout(closeDelay);
    if(frame) cancelAnimationFrame(frame);
    frame=null;
    pane.classList.remove('is-open');pane.setAttribute('aria-hidden','true');pane.inert=true;
    cards.forEach(el=>{el.classList.remove('skill-active');el.setAttribute('aria-expanded','false');});
    active=null;
  }
  function deferHide(){clearTimeout(closeDelay);closeDelay=setTimeout(()=>{
    if(!pane.matches(':hover') && !cards.some(el=>el.matches(':hover')))hide();
  },180);}
  cards.forEach(card=>{
    card.addEventListener('pointerenter',()=>{if(hover.matches)open(card)});
    card.addEventListener('pointerleave',()=>{if(hover.matches)deferHide()});
    card.addEventListener('click',()=>{if(active===card && pane.classList.contains('is-open') && !hover.matches)hide();else open(card)});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(card)} });
    card.addEventListener('focus',()=>{if(hover.matches)open(card)});
  });
  pane.addEventListener('pointerenter',()=>clearTimeout(closeDelay));
  pane.addEventListener('pointerleave',()=>{if(hover.matches)deferHide()});
  close.addEventListener('click',hide);
  document.addEventListener('pointerdown',e=>{
    if(active && !pane.contains(e.target) && !cards.some(c=>c.contains(e.target)))hide();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  window.addEventListener('scroll',()=>{if(active)position()},{passive:true});
  window.addEventListener('resize',()=>{if(active)position()},{passive:true});
  const langs=document.querySelectorAll('.lang-btn');
  const updateHints=()=>{cards.forEach(c=>{const hint=c.querySelector('.skill-hint');if(hint)hint.textContent=currentLang()==='fr'?'↗ Survoler / toucher':'↗ Hover / tap';});};
  langs.forEach(btn=>btn.addEventListener('click',()=>{updateHints();if(active){heading.textContent=titles[currentLang()][active.dataset.skill];status.textContent=titles[currentLang()].ready;}}));
  pane.inert=true;
  updateHints();
})();
