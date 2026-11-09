// Doriax LuaDocs — interactions: theme, drawer, search, filters, copy buttons
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  // Theme
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  const saved = localStorage.getItem('doriax-theme');
  if(saved) root.setAttribute('data-theme', saved);
  function toggleTheme(){
    const cur = root.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : cur === 'light' ? 'auto' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('doriax-theme', next);
    if(themeBtn) themeBtn.setAttribute('data-state', next);
    updateThemeIcon();
  }
  function updateThemeIcon(){
    if(!themeBtn) return;
    const cur = root.getAttribute('data-theme') || 'auto';
    themeBtn.title = `Theme: ${cur} (click to cycle)`;
    themeBtn.innerHTML = cur === 'light' ? '☀️' : cur === 'dark' ? '🌙' : '◐';
  }
  themeBtn && themeBtn.addEventListener('click', toggleTheme);
  updateThemeIcon();

  // Drawer (mobile)
  const burger = $('#burgerBtn');
  const sidebar = $('#sidebar');
  const backdrop = $('#backdrop');
  function setDrawer(open){
    if(!sidebar) return;
    sidebar.classList.toggle('open', open);
    backdrop && backdrop.classList.toggle('show', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger && burger.addEventListener('click', () => setDrawer(!sidebar.classList.contains('open')));
  backdrop && backdrop.addEventListener('click', () => setDrawer(false));
  // close drawer when navigating
  $$('.side-link', sidebar||document).forEach(a=> a.addEventListener('click', ()=> setDrawer(false)));

  // Collapsible sidebar groups
  $$('.side-title').forEach(title=>{
    title.addEventListener('click', ()=>{
      const group = title.closest('.side-group');
      if(group) group.classList.toggle('collapsed');
    });
  });

  // Search & filters
  const searchInputs = $$('[data-search]');
  const cards = $$('[data-api-card]');
  const chips = $$('.chip');
  let activeFilter = 'all';
  function normalize(s){ return (s||'').toLowerCase(); }
  function applyFilter(){
    const q = normalize(searchInputs[0] ? searchInputs[0].value : '');
    const q2 = normalize(searchInputs[1] ? searchInputs[1].value : '');
    const query = (q || q2).trim();
    cards.forEach(card=>{
      const text = normalize(card.getAttribute('data-search-text') || card.textContent);
      const cat = card.getAttribute('data-category') || 'all';
      const matchQ = !query || text.includes(query);
      const matchCat = activeFilter === 'all' || cat === activeFilter;
      card.classList.toggle('hidden', !(matchQ && matchCat));
    });
    // also filter side links
    const sideLinks = $$('.side-link');
    sideLinks.forEach(link=>{
      const txt = normalize(link.textContent);
      if(query){
        link.style.display = txt.includes(query) ? '' : 'none';
      } else {
        link.style.display = '';
      }
    });
    // update counts
    const visible = cards.filter(c=> !c.classList.contains('hidden')).length;
    const countEl = $('#resultCount');
    if(countEl) countEl.textContent = query || activeFilter !== 'all' ? `${visible} results` : `${cards.length} APIs`;
  }
  searchInputs.forEach(inp=>{
    inp.addEventListener('input', applyFilter);
    inp.addEventListener('keydown', e=>{
      if(e.key==='/' && e.ctrlKey) e.preventDefault();
    });
  });
  // keyboard shortcut "/"
  document.addEventListener('keydown', e=>{
    if(e.key==='/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT'){
      e.preventDefault();
      if(searchInputs[0]) { searchInputs[0].focus(); searchInputs[0].select(); }
    }
  });
  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chips.forEach(c=> c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });
  applyFilter();

  // Copy buttons
  $$('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const target = btn.getAttribute('data-copy');
      let text = '';
      if(target){
        const el = document.querySelector(target);
        if(el) text = el.textContent;
      } else {
        // nearest <pre>
        const pre = btn.closest('.code-window')?.querySelector('pre') || btn.closest('.example')?.querySelector('pre');
        if(pre) text = pre.textContent;
      }
      if(!text) return;
      try{
        await navigator.clipboard.writeText(text.trim());
        const orig = btn.textContent;
        btn.textContent = 'Copied ✓';
        setTimeout(()=> btn.textContent = orig, 1400);
      }catch(e){}
    });
  });

  // Smooth anchor offset for sticky header
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      if(id.length>1){
        const el = document.querySelector(id);
        if(el){
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY - 78;
          window.scrollTo({top, behavior:'smooth'});
          history.pushState(null,'',id);
        }
      }
    });
  });

  // Table of contents active state on scroll
  const tocLinks = $$('.side-link[href^="#"]');
  if(tocLinks.length){
    const sections = tocLinks.map(a=> document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id = '#'+entry.target.id;
          tocLinks.forEach(l=> l.classList.toggle('active', l.getAttribute('href')===id));
        }
      });
    }, {rootMargin: '-30% 0px -60% 0px', threshold:0});
    sections.forEach(s=> observer.observe(s));
  }
})();
