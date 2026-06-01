(function () {
  'use strict';

  /* ===== Slideshow ===== */
  var track = document.querySelector('.slides-track');
  var dotsContainer = document.querySelector('.slide-dots');
  var slides = Array.from(document.querySelectorAll('.slide'));
  var current = 0;
  var autoTimer = null;
  var touchStartX = 0;
  var isTransitioning = false;

  function goTo(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    var total = slides.length;
    current = ((index % total) + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    document.querySelectorAll('.dot').forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
    setTimeout(function () { isTransitioning = false; }, 750);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function buildDots() {
    slides.forEach(function (_, i) {
      var btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.addEventListener('click', function () { goTo(i); stopAuto(); startAuto(); });
      dotsContainer.appendChild(btn);
    });
  }

  function initSlideshow() {
    if (!track || slides.length === 0) return;
    buildDots();

    document.querySelector('.slide-btn.prev').addEventListener('click', function () { prev(); stopAuto(); startAuto(); });
    document.querySelector('.slide-btn.next').addEventListener('click', function () { next(); stopAuto(); startAuto(); });

    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); stopAuto(); startAuto(); }
    }, { passive: true });

    var hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); stopAuto(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
    });

    startAuto();
  }

  /* ===== Menu Overlay Toggle ===== */
  function initNav() {
    var btn = document.getElementById('menuBtn');
    var overlay = document.getElementById('menuOverlay');
    if (!btn || !overlay) return;

    function openMenu() {
      btn.classList.add('open');
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      btn.classList.remove('open');
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {
      overlay.classList.contains('open') ? closeMenu() : openMenu();
    });

    overlay.querySelectorAll('.menu-links a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ===== Lightbox ===== */
  function initLightbox() {
    var lightbox = document.querySelector('.lightbox');
    var lightboxImg = document.querySelector('.lightbox img');
    var closeBtn = document.querySelector('.lightbox-close');
    if (!lightbox) return;

    document.querySelectorAll('.price-card').forEach(function (card) {
      card.addEventListener('click', function () {
        lightboxImg.src = card.querySelector('img').src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ===== Scroll-reveal ===== */
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;

    var style = document.createElement('style');
    style.textContent =
      '.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}' +
      '.reveal.visible{opacity:1;transform:translateY(0)}';
    document.head.appendChild(style);

    var targets = document.querySelectorAll(
      '.about-image-wrap, .about-text, .review-card, .price-card, .contact-card-wrap, .contact-info'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ===== Chatbot ===== */
  var CHAT_RESPONSES = {
    order: {
      q: 'How do I order?',
      a: 'You can order by texting or calling <strong>240-389-0743</strong>, or emailing <strong>aumaidelights@gmail.com</strong>. We\'d love to create something special for you! 🌸'
    },
    deliver: {
      q: 'Do you deliver?',
      a: 'Yes! We offer delivery for a <strong>$10 fee</strong>. Pick-up is also available in <strong>Columbia, MD</strong>.'
    },
    advance: {
      q: 'How far in advance?',
      a: 'We recommend ordering at least <strong>3–5 days ahead</strong>, or <strong>1–2 weeks</strong> for large party packages to ensure the best experience.'
    },
    custom: {
      q: 'Custom orders?',
      a: 'Absolutely! We create custom treats for <strong>birthdays, baby showers, graduations, holidays</strong>, and any special occasion. Share your theme and we\'ll bring it to life!'
    },
    makes: {
      q: 'What do you make?',
      a: 'We make <strong>chocolate-covered strawberries, cake pops, cakesicles, dessert shooters, rice krispie treats, chocolate-covered Oreos, pretzel rods, cupcakes</strong>, and more!'
    },
    prices: {
      q: 'Pricing info',
      a: 'Treats start at <strong>$20</strong>. Party packages range from <strong>$125–$295</strong>. Scroll up to our <strong>Prices section</strong> to view the full menu!'
    }
  };

  function initChat() {
    var widget = document.getElementById('chatWidget');
    var window_ = document.getElementById('chatWindow');
    var toggle = document.getElementById('chatToggle');
    var closeBtn = document.getElementById('chatClose');
    var messages = document.getElementById('chatMessages');
    var replies = document.getElementById('chatReplies');
    var toggleIcon = toggle.querySelector('.chat-toggle-icon');
    var toggleClose = toggle.querySelector('.chat-toggle-close');

    if (!widget) return;

    function openChat() {
      window_.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggleIcon.hidden = true;
      toggleClose.hidden = false;
      messages.scrollTop = messages.scrollHeight;
    }

    function closeChat() {
      window_.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggleIcon.hidden = false;
      toggleClose.hidden = true;
    }

    toggle.addEventListener('click', function () {
      window_.hidden ? openChat() : closeChat();
    });

    closeBtn.addEventListener('click', closeChat);

    function addMsg(text, type) {
      var div = document.createElement('div');
      div.className = 'chat-msg ' + type;
      div.innerHTML = '<p>' + text + '</p>';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function showTyping() {
      var div = document.createElement('div');
      div.className = 'chat-msg bot chat-typing-wrap';
      div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function handleReply(key) {
      var resp = CHAT_RESPONSES[key];
      if (!resp) return;

      addMsg(resp.q, 'user');
      replies.style.pointerEvents = 'none';

      var typing = showTyping();
      setTimeout(function () {
        messages.removeChild(typing);
        addMsg(resp.a, 'bot');
        replies.style.pointerEvents = '';

        var follow = document.createElement('div');
        follow.className = 'chat-msg bot';
        follow.innerHTML = '<p>Is there anything else I can help you with? 😊</p>';
        setTimeout(function () {
          messages.appendChild(follow);
          messages.scrollTop = messages.scrollHeight;
        }, 500);
      }, 900);
    }

    replies.querySelectorAll('.chat-reply').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleReply(btn.getAttribute('data-key'));
      });
    });
  }

  /* ===== Init ===== */
  document.addEventListener('DOMContentLoaded', function () {
    initSlideshow();
    initNav();
    initLightbox();
    initReveal();
    initChat();
  });
}());
