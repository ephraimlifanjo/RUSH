document.getElementById('year').textContent = new Date().getFullYear();
const reveal = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('revealed');
    reveal.unobserve(entry.target);
  }
}, { threshold: 0.08 });
document.querySelectorAll('.feature-panel,.showcase-frame,.privacy-cards article,.platform-grid article,.template-row article').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
  el.style.transition = 'opacity .45s ease,transform .45s ease';
  reveal.observe(el);
});
const style = document.createElement('style');
style.textContent = '.revealed{opacity:1!important;transform:none!important}';
document.head.appendChild(style);
