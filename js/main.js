/* Store Stop Go — shared interactions */
document.addEventListener('DOMContentLoaded', () => {
  const head = document.querySelector('.site-head');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* sticky header shadow */
  const onScroll = () => head && head.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile nav */
  const burger = document.querySelector('.nav-burger');
  if (burger && head) {
    burger.addEventListener('click', () => {
      const open = head.classList.toggle('nav--open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(a =>
      a.addEventListener('click', () => {
        head.classList.remove('nav--open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* footer year */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* scroll reveals */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* animated counters */
  const fmt = (n, d) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const runCounter = el => {
    const end = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const suf = el.dataset.suffix || '';
    const pre = el.dataset.prefix || '';
    if (reduce) { el.textContent = pre + fmt(end, dec) + suf; return; }
    const t0 = performance.now(), dur = 1500;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(end * e, dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { runCounter(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => io2.observe(el));
  }

  /* contact form → Web3Forms */
  const form = document.getElementById('site-form');
  if (form) {
    const btn = form.querySelector('button[type="submit"]');
    const errBox = document.getElementById('form-error');
    const btnHTML = btn ? btn.innerHTML : '';

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!form.reportValidity()) return;

      if (errBox) errBox.hidden = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      const data = new FormData(form);
      const criteria = data.getAll('crit');
      data.delete('crit');
      data.set('Site criteria', criteria.length ? criteria.join(', ') : '—');
      data.set('replyto', data.get('email') || '');
      data.set('subject', 'Site brief — ' + (data.get('company') || 'new enquiry'));

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      })
        .then(res => res.json().then(body => ({ ok: res.ok, body })))
        .then(({ ok, body }) => {
          if (!ok || !body.success) throw new Error(body.message || 'Submission failed');
          const wrap = document.getElementById('form-wrap');
          const done = document.getElementById('form-success');
          if (wrap && done) {
            wrap.hidden = true;
            done.hidden = false;
            done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
          }
        })
        .catch(() => {
          if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
          if (errBox) {
            errBox.textContent = 'Sorry — your brief didn’t send. Please try again, or reach us at hello@storestopgo.com or (888) 509-4001.';
            errBox.hidden = false;
          }
        });
    });
  }
});
