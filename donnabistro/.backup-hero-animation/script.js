/**
 * DONNA BISTRÔ - EDITORIAL EXPERIENCE SCRIPT
 * Carrossel de pratos, concierge de reservas, hidratação de conteúdo (CMS)
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

  // 2. Seletores Customizados (Horário / Pessoas) — substitui o <select> nativo
  // do sistema operacional (caixa branca com seleção azul) por um trigger +
  // listbox próprios, mantendo o valor atual em data-value e disparando um
  // evento "change" real no elemento raiz para se integrar ao restante do fluxo.
  function initCustomSelects() {
    const roots = document.querySelectorAll('.custom-select');

    function closeSelect(root) {
      root.classList.remove('is-open');
      root.querySelector('.custom-select-trigger').setAttribute('aria-expanded', 'false');
      root.querySelector('.custom-select-options').hidden = true;
    }

    function openSelect(root) {
      roots.forEach(other => { if (other !== root) closeSelect(other); });
      root.querySelector('.custom-select-options').hidden = false;
      requestAnimationFrame(() => root.classList.add('is-open'));
      root.querySelector('.custom-select-trigger').setAttribute('aria-expanded', 'true');
    }

    function selectOption(root, option) {
      root.dataset.value = option.dataset.value;
      root.querySelector('.custom-select-trigger-label').textContent = option.textContent.trim();
      root.querySelectorAll('.custom-option').forEach(opt => {
        const isSelected = opt === option;
        opt.classList.toggle('is-selected', isSelected);
        opt.setAttribute('aria-selected', String(isSelected));
      });
      closeSelect(root);
      root.dispatchEvent(new Event('change'));
    }

    roots.forEach(root => {
      const trigger = root.querySelector('.custom-select-trigger');
      const options = root.querySelectorAll('.custom-option');

      trigger.addEventListener('click', () => {
        root.classList.contains('is-open') ? closeSelect(root) : openSelect(root);
      });

      trigger.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!root.classList.contains('is-open')) openSelect(root);
          const current = root.querySelector('.custom-option.is-selected') || options[0];
          if (current) current.focus();
        } else if (e.key === 'Escape') {
          closeSelect(root);
        }
      });

      options.forEach(option => {
        option.addEventListener('click', () => selectOption(root, option));
        option.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectOption(root, option);
            trigger.focus();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = option.nextElementSibling;
            if (next) next.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = option.previousElementSibling;
            prev ? prev.focus() : trigger.focus();
          } else if (e.key === 'Escape') {
            closeSelect(root);
            trigger.focus();
          }
        });
      });
    });

    document.addEventListener('click', e => {
      roots.forEach(root => { if (!root.contains(e.target)) closeSelect(root); });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') roots.forEach(closeSelect);
    });
  }

  initCustomSelects();

  // 3. Concierge de Reservas — mensagem do WhatsApp construída a partir da
  // escolha real do cliente (data, horário e número de pessoas), eliminando
  // a barreira da mensagem em branco e do formulário genérico.
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
  const reservaHorarioSelect = document.getElementById('reservaHorario');
  const reservaPessoasSelect = document.getElementById('reservaPessoas');
  const reservaWhatsappBtn = document.getElementById('reservaWhatsappBtn');

  function updateReservaLink() {
    if (!reservaDataInput || !reservaHorarioSelect || !reservaPessoasSelect || !reservaWhatsappBtn) return;
    const [y, m, d] = reservaDataInput.value.split('-');
    const dateLabel = (y && m && d) ? `${d}/${m}/${y}` : '';
    const horario = reservaHorarioSelect.dataset.value;
    const pessoas = reservaPessoasSelect.dataset.value;
    const pessoasLabel = pessoas === '1' ? '1 pessoa' : `${pessoas} pessoas`;
    const message = dateLabel
      ? `Olá! Gostaria de confirmar uma mesa no Donna Bistrô para o dia ${dateLabel}, às ${horario}, para ${pessoasLabel}. Poderiam confirmar a disponibilidade?`
      : `Olá! Gostaria de confirmar uma mesa no Donna Bistrô às ${horario}, para ${pessoasLabel}. Poderiam confirmar a disponibilidade?`;
    applyWhatsappLink(reservaWhatsappBtn, message);
  }

  if (reservaDataInput && reservaHorarioSelect && reservaPessoasSelect && reservaWhatsappBtn) {
    const suggested = getSuggestedReservationDate();
    reservaDataInput.min = toDateInputValue(new Date());
    reservaDataInput.value = toDateInputValue(suggested);
    [reservaDataInput, reservaHorarioSelect, reservaPessoasSelect].forEach(el => {
      el.addEventListener('change', updateReservaLink);
    });
    updateReservaLink();
  }

  // Pílulas de Atalho de Data (Hoje / Amanhã / Fim de Semana) — preenchem o
  // campo de data com um toque, sem precisar abrir o calendário nativo.
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getUpcomingSaturday(date) {
    const result = new Date(date);
    const day = result.getDay(); // 0 = domingo ... 6 = sábado
    result.setDate(result.getDate() + ((6 - day + 7) % 7));
    return result;
  }

  const datePills = document.querySelectorAll('.date-pill');

  function syncActivePillFromInput() {
    if (!reservaDataInput.value) return;
    const [y, m, d] = reservaDataInput.value.split('-').map(Number);
    const selected = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((selected - today) / 86400000);
    const saturday = getUpcomingSaturday(today);

    datePills.forEach(pill => {
      const isMatch = pill.dataset.weekend === 'true'
        ? diffDays === Math.round((saturday - today) / 86400000)
        : Number(pill.dataset.days) === diffDays;
      pill.classList.toggle('active', isMatch);
    });
  }

  if (reservaDataInput && datePills.length) {
    datePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const today = new Date();
        const target = pill.dataset.weekend === 'true'
          ? getUpcomingSaturday(today)
          : addDays(today, Number(pill.dataset.days));
        reservaDataInput.value = toDateInputValue(target);
        reservaDataInput.dispatchEvent(new Event('change'));
      });
    });
    reservaDataInput.addEventListener('change', syncActivePillFromInput);
    syncActivePillFromInput();
  }

  // 4. Carrossel Editorial de Pratos (marquee CSS infinito, pausa suave ao toque)
  // A animação/loop vive inteiramente em CSS (@keyframes infiniteScroll); aqui só
  // alternamos a classe que pausa o glide ao toque (o :hover já cobre o desktop)
  // e reconstruímos as duas faixas duplicadas quando o conteúdo vem do CMS.
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

  function renderDishSlides(dishes) {
    const track = document.getElementById('carouselTrack');
    if (!track || !Array.isArray(dishes) || !dishes.length) return;
    const cardsHtml = buildDishCardsHtml(dishes);
    track.innerHTML = `
      <div class="carousel-track-group">${cardsHtml}</div>
      <div class="carousel-track-group" aria-hidden="true">${cardsHtml}</div>
    `;
  }

  function initCarouselMarquee() {
    const viewport = document.getElementById('carouselViewport');
    if (!viewport) return;
    const press = () => viewport.classList.add('is-touching');
    const release = () => viewport.classList.remove('is-touching');
    viewport.addEventListener('touchstart', press, { passive: true });
    viewport.addEventListener('touchend', release, { passive: true });
    viewport.addEventListener('touchcancel', release, { passive: true });
  }

  initCarouselMarquee();

  // 5. Parallax Scrolling no Hero (rAF-throttled, hardware-accelerated via transform)
  // A imagem de fundo se move em velocidade sutil (0.35x) em relação ao scroll,
  // somando-se ao "respiro" contínuo de zoom via a variável --parallax-y.
  const heroBg = document.getElementById('heroBg');
  const heroSection = document.getElementById('hero');

  if (heroBg && heroSection && !prefersReducedMotion) {
    let parallaxTicking = false;

    function applyParallax() {
      parallaxTicking = false;
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      heroBg.style.setProperty('--parallax-y', `${window.scrollY * 0.35}px`);
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

  // 7. Rolagem Suave com Easing para Links do Cabeçalho e Âncoras
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

  // 8. Hidratação de Conteúdo via CMS (data/content.json)
  // O HTML já vem pré-renderizado estaticamente para SEO instantâneo;
  // esta camada apenas sobrescreve os textos quando o conteúdo editorial mudar.
  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function hydrateFromContent(data) {
    document.querySelectorAll('[data-cms]').forEach(el => {
      const value = getByPath(data, el.getAttribute('data-cms'));
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value;
      }
    });

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
