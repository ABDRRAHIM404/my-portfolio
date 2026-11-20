
// Project journey. The SVG curve connects the physical centers of the four cards.
(() => {
  const journey=document.getElementById('projectJourney');
  if(!journey)return;
  const cards=[...journey.querySelectorAll('.journey-card')];
  const svg=journey.querySelector('.project-path');
  const track=svg.querySelector('.path-track');
  const progress=svg.querySelector('.path-progress');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  let length=0,stops=[],lastLayoutWidth=-1;
  let raf=0;
  function layout(){
    const bounds=journey.getBoundingClientRect();
    const width=journey.clientWidth,height=journey.scrollHeight;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    svg.setAttribute('width',width);
    svg.setAttribute('height',height);
    const mobile=window.matchMedia('(max-width: 700px)').matches;
    const nodes=cards.map(c=>{
      const r=c.getBoundingClientRect();
      return {x:r.left-bounds.left+(r.width/2),y:r.top-bounds.top+r.height/2};
    });
    if(nodes.length<2)return;
    let d=`M ${nodes[0].x.toFixed(2)} ${nodes[0].y.toFixed(2)}`;
    for(let i=1;i<nodes.length;i++){
      const a=nodes[i-1],b=nodes[i];
      const spread=(b.y-a.y)*.47;
      if(mobile){d+=` C ${a.x} ${(a.y+spread).toFixed(2)},${b.x} ${(b.y-spread).toFixed(2)},${b.x} ${b.y.toFixed(2)}`}
      else {d+=` C ${a.x.toFixed(2)} ${(a.y+spread).toFixed(2)},${b.x.toFixed(2)} ${(b.y-spread).toFixed(2)},${b.x.toFixed(2)} ${b.y.toFixed(2)}`}
    }
    track.setAttribute('d',d);progress.setAttribute('d',d);
    length=progress.getTotalLength();
    progress.style.strokeDasharray=String(length);
    stops=nodes;
    update();
  }
  function update(){
    if(!length||!stops.length)return;
    const bounds=journey.getBoundingClientRect();
    const viewY=window.innerHeight*.67;
    const markerY=viewY-bounds.top;
    const first=stops[0].y,last=stops[stops.length-1].y;
    const total=Math.max(1,last-first);
    const fraction=Math.max(0,Math.min(1,(markerY-first)/total));
    // Map vertical progress to arc length so the glowing tip travels exactly along the path.
    let lo=0,hi=length;
    for(let i=0;i<16;i++){
      const mid=(lo+hi)*.5;
      const y=progress.getPointAtLength(mid).y;
      if(y<markerY)lo=mid;else hi=mid;
    }
    const visible=markerY<=first?0:markerY>=last?length:(lo+hi)*.5;
    progress.style.strokeDashoffset=String(Math.max(0,length-visible));
    cards.forEach((c,i)=>c.classList.toggle('journey-reached',markerY>=stops[i].y));
  }
  function onScroll(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update()})}
  let observer;
  if('ResizeObserver' in window){observer=new ResizeObserver(()=>requestAnimationFrame(layout));observer.observe(journey);cards.forEach(c=>observer.observe(c))}
  window.addEventListener('resize',()=>requestAnimationFrame(layout),{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  // Constrain 3D tilt to a few degrees. Touch and reduced-motion users get static cards.
  cards.forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(reduce.matches||!fine.matches)return;
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--card-pointer-x',`${(x*100).toFixed(1)}%`);
      card.style.setProperty('--card-pointer-y',`${(y*100).toFixed(1)}%`);
      card.style.setProperty('--card-rotate-y',`${((x-.5)*3.5).toFixed(2)}deg`);
      card.style.setProperty('--card-rotate-x',`${((.5-y)*3).toFixed(2)}deg`);
      card.style.setProperty('--card-rise','-4px');
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--card-rotate-y','0deg');card.style.setProperty('--card-rotate-x','0deg');card.style.setProperty('--card-rise','0px');
    });
  });
  // Wait for browser font/layout stabilization, otherwise the curve can misalign.
  if(document.fonts?.ready)document.fonts.ready.then(layout);
  requestAnimationFrame(()=>requestAnimationFrame(layout));
})();
