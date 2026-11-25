(function () {
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Título do hero: separa em palavras e faz entrarem em sequência
  var split = document.querySelector('.split');
  if (split) {
    var i = 0;
    var wrap = function (node) {
      var s = document.createElement('span');
      s.className = 'w';
      s.style.transitionDelay = (0.15 + i++ * 0.07) + 's';
      return s;
    };
    Array.prototype.slice.call(split.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = wrap();
          s.textContent = part;
          frag.appendChild(s);
        });
        split.replaceChild(frag, node);
      } else {
        var s = wrap();
        split.replaceChild(s, node);
        s.appendChild(node);
      }
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { split.classList.add('is-in'); });
    });
  }

  // Cabeçalho muda ao rolar + barra de leitura
  var header = document.querySelector('.header');
  var progress = document.querySelector('.progress');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 30);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // Revelação suave das seções
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });

    var line = document.querySelector('.timeline');
    if (line) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          line.classList.add('is-drawn');
          obs.disconnect();
        }
      }, { threshold: 0.3 }).observe(line);
    }
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    var tl = document.querySelector('.timeline');
    if (tl) tl.classList.add('is-drawn');
  }

  // Parallax leve na foto principal
  var px = document.querySelector('.parallax');
  if (px && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 700);
        px.style.transform = 'translateY(' + (-y * 0.06) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  // Uma pergunta aberta por vez
  var details = document.querySelectorAll('.accordion details');
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      details.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // O embed do Instagram informa a própria altura; ajusta o iframe para não cortar
  var ig = document.getElementById('igVideo');
  if (ig) {
    window.addEventListener('message', function (e) {
      if (!/instagram\.com$/.test(new URL(e.origin).hostname)) return;
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'MEASURE' && data.details && data.details.height) {
          ig.style.height = data.details.height + 'px';
        }
      } catch (err) {}
    });
  }

  /* ---------- Formulario -> WhatsApp com os dados ---------- */
  var leadForm = document.getElementById('lead-form');
  if (leadForm) {
    var WHATS = '5561998272019';
    var rules = {
      nome: function (v) { return v.trim().length >= 2; },
      whats: function (v) { return v.replace(/\D/g, '').length >= 10; },
      interesse: function (v) { return v !== ''; }
    };
    var check = function (el) {
      var ok = rules[el.name] ? rules[el.name](el.value) : true;
      el.closest('.afield').classList.toggle('is-invalid', !ok);
      return ok;
    };
    Object.keys(rules).forEach(function (n) {
      var el = leadForm.elements[n];
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.afield').classList.contains('is-invalid')) check(el); });
    });
    leadForm.elements.whats.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '').slice(0, 11), o = d;
      if (d.length > 2) o = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + (d.length > (d.length > 10 ? 7 : 6) ? '-' + d.slice(d.length > 10 ? 7 : 6) : '');
      e.target.value = o;
    });
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).map(function (n) { return leadForm.elements[n]; }).filter(function (el) { return !check(el); });
      if (bad.length) { bad[0].focus(); return; }
      var f = leadForm.elements;
      var msg = [
        'Olá, Dra. Stephanny! Vim pelo site e gostaria de agendar uma avaliação.',
        '',
        '*Nome:* ' + f.nome.value.trim(),
        '*WhatsApp:* ' + f.whats.value,
        '*Interesse:* ' + f.interesse.value,
        '*Melhor período:* ' + f.periodo.value
      ].join('
');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'generate_lead', lead_interest: f.interesse.value });
      var url = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg);
      var w = window.open(url, '_blank');
      if (w) { w.opener = null; } else { location.href = url; }
    });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
