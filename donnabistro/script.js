/**
 * DONNA BISTRÔ - EDITORIAL EXPERIENCE SCRIPT
 * Carrossel de pratos, reserva de mesa, hidratação de conteúdo (CMS)
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Telefone ativo (pode ser sobrescrito pelo CMS) + helper de link do WhatsApp
  let currentPhone = '+5546991066023';

  function applyWhatsappLink(el, message) {
    if (!el) return;
    const phone = currentPhone.replace(/[^\d]/g, '');
    el.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  // 2. Sua Mesa — mensagem do WhatsApp construída a partir da escolha real
  // do cliente (data, horário e número de pessoas via stepper).
  function getSuggestedReservationDate() {
    const now = new Date();
    const isPastDinnerWindow = now.getHours() >= 21;
    const targetDate = new Date(now);
    if (isPastDinnerWindow) targetDate.setDate(targetDate.getDate() + 1);
    if (targetDate.getDay() === 0) targetDate.setDate(targetDate.getDate() + 1); // pula domingo (fechado)
    return targetDate;
  }

  function toDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const reservaDataInput = document.getElementById('reservaData');
  const reservaHorarioInput = document.getElementById('reservaHorario');
  const reservaWhatsappBtn = document.getElementById('reservaWhatsappBtn');
  const pessoasValueEl = document.getElementById('pessoasValue');
  const pessoasMinusBtn = document.getElementById('pessoasMinus');
  const pessoasPlusBtn = document.getElementById('pessoasPlus');
  const PESSOAS_MIN = 1;
  const PESSOAS_MAX = 8;

  function updateReservaLink() {
    if (!reservaDataInput || !reservaHorarioInput || !reservaWhatsappBtn || !pessoasValueEl) return;
    const [y, m, d] = reservaDataInput.value.split('-');
    const dateLabel = (y && m && d) ? `${d}/${m}/${y}` : '';
    const horario = reservaHorarioInput.value;
    const pessoas = Number(pessoasValueEl.textContent);
    const pessoasLabel = pessoas === 1 ? '1 pessoa' : `${pessoas} pessoas`;
    const message = dateLabel
      ? `Olá! Gostaria de confirmar uma mesa no Donna Bistrô para o dia ${dateLabel}, às ${horario}, para ${pessoasLabel}. Poderiam confirmar a disponibilidade?`
      : `Olá! Gostaria de confirmar uma mesa no Donna Bistrô às ${horario}, para ${pessoasLabel}. Poderiam confirmar a disponibilidade?`;
    applyWhatsappLink(reservaWhatsappBtn, message);
  }

  if (reservaDataInput && reservaHorarioInput && reservaWhatsappBtn) {
    const suggested = getSuggestedReservationDate();
    reservaDataInput.min = toDateInputValue(new Date());
    reservaDataInput.value = toDateInputValue(suggested);
    [reservaDataInput, reservaHorarioInput].forEach(el => {
      el.addEventListener('change', updateReservaLink);
    });
    updateReservaLink();
  }

  if (pessoasValueEl && pessoasMinusBtn && pessoasPlusBtn) {
    const setPessoas = (value) => {
      const clamped = Math.min(PESSOAS_MAX, Math.max(PESSOAS_MIN, value));
      pessoasValueEl.textContent = String(clamped);
      pessoasMinusBtn.disabled = clamped === PESSOAS_MIN;
      pessoasPlusBtn.disabled = clamped === PESSOAS_MAX;
      updateReservaLink();
    };

    pessoasMinusBtn.addEventListener('click', () => setPessoas(Number(pessoasValueEl.textContent) - 1));
    pessoasPlusBtn.addEventListener('click', () => setPessoas(Number(pessoasValueEl.textContent) + 1));
    setPessoas(Number(pessoasValueEl.textContent));
  }

  // 3. Carrossel Editorial de Pratos (Auto-glide suave + Arraste livre por Touch e Mouse)
  function buildDishCardsHtml(dishes) {
    return dishes.map(dish => `
      <article class="carousel-slide">
        <div class="carousel-slide-media">
          <img src="${dish.image}" alt="${dish.title}" loading="lazy" decoding="async">
        </div>
        <h3 class="carousel-slide-title">${dish.title}</h3>
        <p class="carousel-slide-desc">${dish.description}</p>
      </article>
    `).join('');
  }

  // 3 cópias (não 2): o loop depende de rolar uma largura inteira de cópia
  // antes de resetar, mas o navegador limita scrollLeft a "scrollWidth -
  // clientWidth" — em telas largas, com só 2 cópias, esse limite fica ABAIXO
  // do ponto de reset e o carrossel trava no fim. Com 3 cópias sobra scroll
  // de sobra para o reset sempre ser alcançável, não importa a largura.
  function renderDishSlides(dishes) {
    const track = document.getElementById('carouselTrack');
    if (!track || !Array.isArray(dishes) || !dishes.length) return;
    const cardsHtml = buildDishCardsHtml(dishes);
    track.innerHTML = `
      <div class="carousel-track-group">${cardsHtml}</div>
      <div class="carousel-track-group" aria-hidden="true">${cardsHtml}</div>
      <div class="carousel-track-group" aria-hidden="true">${cardsHtml}</div>
    `;
  }

  function initInteractiveCarousel() {
    const viewport = document.getElementById('carouselViewport');
    const track = document.getElementById('carouselTrack');
    if (!viewport || !track) return;

    let isDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let isInteracting = false;
    let resumeTimer = null;
    const speed = 0.4; // pixels por frame

    // Posição "real" com precisão fracionária, mantida à parte do scrollLeft do
    // navegador. Alguns navegadores arredondam scrollLeft para o pixel inteiro
    // mais próximo a cada leitura/escrita — com um passo por frame menor que
    // 0.5px isso trava o carrossel em 0 para sempre (0 + 0.4 arredonda de volta
    // para 0). Acumulando em uma variável JS comum, o progresso fracionário
    // nunca se perde entre frames, então qualquer velocidade, por menor que
    // seja, sempre avança suavemente.
    let currentPos = viewport.scrollLeft;

    function pauseGlide() {
      isInteracting = true;
      clearTimeout(resumeTimer);
    }

    function resumeGlide(delay = 1800) {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        isInteracting = false;
      }, delay);
    }

    // Auto-glide contínuo e infinito via requestAnimationFrame. O track tem
    // 3 cópias idênticas; uma "unidade" de reset é a largura de UMA cópia
    // (scrollWidth / 3), não da faixa inteira.
    function autoGlide() {
      if (!isInteracting && !prefersReducedMotion) {
        currentPos += speed;
        const unitWidth = track.scrollWidth / 3;
        if (unitWidth > 0) {
          if (currentPos >= unitWidth) {
            currentPos -= unitWidth;
          } else if (currentPos <= 0) {
            currentPos += unitWidth;
          }
        }
        viewport.scrollLeft = currentPos;
      } else {
        // Ressincroniza com a posição real enquanto o usuário arrasta/toca,
        // para retomar o glide exatamente de onde a interação parou.
        currentPos = viewport.scrollLeft;
      }
      requestAnimationFrame(autoGlide);
    }

    // Desktop: Arrastar com o mouse (click & drag)
    viewport.addEventListener('mousedown', (e) => {
      isDown = true;
      pauseGlide();
      viewport.classList.add('is-dragging');
      startX = e.pageX - viewport.offsetLeft;
      initialScrollLeft = viewport.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        viewport.classList.remove('is-dragging');
        resumeGlide();
      }
    });

    viewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      const walk = (x - startX) * 1.3;
      viewport.scrollLeft = initialScrollLeft - walk;
    });

    // Pausa suave no hover simples do mouse
    viewport.addEventListener('mouseenter', () => {
      if (!isDown) pauseGlide();
    });

    viewport.addEventListener('mouseleave', () => {
      if (!isDown) resumeGlide(800);
    });

    // Mobile: Touch swipe & scroll com inércia nativa do celular
    viewport.addEventListener('touchstart', () => {
      pauseGlide();
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      resumeGlide(2200);
    }, { passive: true });

    viewport.addEventListener('touchcancel', () => {
      resumeGlide(1000);
    }, { passive: true });

    // Scroll com a roda do mouse (trackpad / mouse wheel)
    viewport.addEventListener('wheel', () => {
      pauseGlide();
      resumeGlide(1500);
    }, { passive: true });

    requestAnimationFrame(autoGlide);
  }

  initInteractiveCarousel();

  // 4. Hero — Título com Reveal Escalonado por Frase (stagger 0.12s, delay
  // inicial 0.4s, on-mount). O texto estático já garante SEO/no-JS; aqui só
  // reconstruímos em <span> por frase (separadas por ponto) para animar cada
  // uma via CSS (@keyframes heroWordReveal), incluindo quando o CMS
  // sobrescreve hero.title.
  function renderHeroTitleWords(text) {
    const el = document.getElementById('heroTitleWords');
    if (!el || !text) return;
    const sentences = text.split('.').map(s => s.trim()).filter(Boolean);
    el.setAttribute('aria-label', text);
    el.innerHTML = sentences.map((sentence, i) => {
      const delay = (0.4 + i * 0.12).toFixed(2);
      return `<span class="hero-word" aria-hidden="true" style="animation-delay:${delay}s">${sentence}.</span>`;
    }).join(' ');
  }

  renderHeroTitleWords(document.getElementById('heroTitleWords')?.textContent || '');

  // 5. Parallax Scrolling no Hero (rAF-throttled, hardware-accelerated via
  // transform) — 0.2x de velocidade, limitado a -50px, desativado no mobile
  // e sob prefers-reduced-motion (ver TERMOS.md).
  const heroBg = document.getElementById('heroBg');
  const heroSection = document.getElementById('hero');
  const isMobileViewport = window.matchMedia('(max-width: 699px)').matches;

  if (heroBg && heroSection && !prefersReducedMotion && !isMobileViewport) {
    let parallaxTicking = false;

    function applyParallax() {
      parallaxTicking = false;
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = Math.min(window.scrollY * 0.2, 50);
      heroBg.style.setProperty('--parallax-y', `${-offset}px`);
    }

    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(applyParallax);
      }
    }, { passive: true });

    applyParallax();
  }

  // 6. Scroll Reveal Orquestrado (Stagger via IntersectionObserver)
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('js-anim');

    const groups = new Map();
    revealEls.forEach(el => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach(siblings => {
      siblings.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i, 5) * 100}ms`;
      });
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // 7. Seção "Sua Mesa" — reveal com threshold próprio (30% do viewport,
  // dispara uma única vez), independente do sistema .reveal genérico acima:
  // cada filho tem seu próprio timing (título/subtítulo/campos/CTA), não o
  // stagger uniforme de 100ms por irmão.
  const reservasContainer = document.querySelector('.reservas-container');

  if (reservasContainer && !prefersReducedMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('js-anim');

    const reservasObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    reservasObserver.observe(reservasContainer);
  }

  // 8. Seção Quote (pré-rodapé) — reveal com threshold próprio (30% do
  // viewport, dispara uma única vez), independente do sistema .reveal
  // genérico acima para não herdar o threshold de 0.15 dele.
  const manifestoSection = document.querySelector('.manifesto-section');

  if (manifestoSection && !prefersReducedMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('js-anim');

    const manifestoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    manifestoObserver.observe(manifestoSection);
  }

  // 9. Rodapé — fade único ao entrar na viewport (sem stagger, sem
  // translateY), independente do sistema .reveal genérico.
  const siteFooterEl = document.querySelector('.site-footer');

  if (siteFooterEl && !prefersReducedMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('js-anim');

    const footerObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    footerObserver.observe(siteFooterEl);
  }

  // 10. Rolagem Suave com Easing para Links do Cabeçalho e Âncoras
  // Compensa a altura do header fixo/sticky para a seção de destino não
  // ficar escondida atrás dele ao final da rolagem.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        const siteHeader = document.querySelector('.site-header');
        const headerOffset = siteHeader ? siteHeader.offsetHeight : 80; // Altura real do cabeçalho fixo (84px mobile / 76px desktop)
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 11. Hidratação de Conteúdo via CMS (data/content.json)
  // O HTML já vem pré-renderizado estaticamente para SEO instantâneo;
  // esta camada apenas sobrescreve os textos quando o conteúdo editorial mudar.
  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function hydrateFromContent(data) {
    document.querySelectorAll('[data-cms]').forEach(el => {
      if (el.id === 'heroTitleWords') return; // reconstruído via renderHeroTitleWords (stagger por palavra)
      const value = getByPath(data, el.getAttribute('data-cms'));
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value;
      }
    });

    const heroTitle = data && data.hero && data.hero.title;
    if (typeof heroTitle === 'string' && heroTitle.trim()) {
      renderHeroTitleWords(heroTitle);
    }

    const phone = data && data.contact && data.contact.phoneE164;
    const phoneLink = document.getElementById('footerPhoneLink');
    if (phone && phoneLink) phoneLink.href = `tel:${phone}`;
    if (phone) currentPhone = phone;

    const mapsUrl = data && data.contact && data.contact.mapsUrl;
    const routeLink = document.getElementById('footerRouteLink');
    if (mapsUrl && routeLink) routeLink.href = mapsUrl;

    updateReservaLink();

    if (data && Array.isArray(data.dishes) && data.dishes.length) {
      renderDishSlides(data.dishes);
    }
  }

  fetch('./data/content.json')
    .then(res => (res.ok ? res.json() : null))
    .then(data => { if (data) hydrateFromContent(data); })
    .catch(() => { /* mantém o conteúdo estático já renderizado */ });
});
