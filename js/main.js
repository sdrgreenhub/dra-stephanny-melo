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

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
