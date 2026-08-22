const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;entry.target.classList.add('revealed');reveal.unobserve(entry.target)}},{threshold:.08});
  document.querySelectorAll('.feature-strip article,.editor-showcase img,.security-cards article,.price-grid article,.store-row,.language-list span').forEach(el=>{el.classList.add('reveal-ready');reveal.observe(el)});
}else document.querySelectorAll('.reveal-ready').forEach(el=>el.classList.add('revealed'));
