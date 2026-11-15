(function () {
  'use strict';

  var root = document.documentElement;
  var defaultTheme = root.getAttribute('data-default-theme') || 'light';
  var storageKey = 'na_theme_' + (root.getAttribute('data-site-id') || 'graphic');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      var label = toggleBtn.querySelector('.theme-label');
      if (label) {
        label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
      }
      toggleBtn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
    }
  }

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch (e) {}
  applyTheme(savedTheme || defaultTheme);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(root.getAttribute('data-theme') || defaultTheme);

    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
          localStorage.setItem(storageKey, next);
        } catch (e) {}
      });
    }

    // Mobile nav toggle
    var menuBtn = document.getElementById('mobile-menu-btn');
    var navMenu = document.getElementById('nav-menu');
    if (menuBtn && navMenu) {
      menuBtn.addEventListener('click', function () {
        var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', String(!expanded));
        navMenu.classList.toggle('is-open');
      });
      navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menuBtn.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('is-open');
        });
      });
    }

    // Category filter tabs with WAI-ARIA aria-selected
    var filterBtns = document.querySelectorAll('[data-filter-btn]');
    var filterItems = document.querySelectorAll('[data-filter-item]');
    if (filterBtns.length > 0 && filterItems.length > 0) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var category = btn.getAttribute('data-filter-btn');
          filterBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-selected', 'true');
          filterItems.forEach(function (item) {
            var cats = (item.getAttribute('data-filter-item') || '').split(' ');
            item.style.display = (category === 'all' || cats.indexOf(category) !== -1) ? '' : 'none';
          });
        });
      });
    }

    // Accessible Lightbox modal with focus management
    var lightbox = document.getElementById('portfolio-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxTitle = document.getElementById('lightbox-title');
    var lightboxDesc = document.getElementById('lightbox-desc');
    var lightboxClose = document.getElementById('lightbox-close');
    var lastFocusedEl = null;

    function openLightbox(src, title, desc, triggerEl) {
      if (!lightbox || !lightboxImg) return;
      lastFocusedEl = triggerEl || document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = title || 'Portfolio visual preview';
      if (lightboxTitle) lightboxTitle.textContent = title || '';
      if (lightboxDesc) lightboxDesc.textContent = desc || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
      if (!lightbox || !lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }

    document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(
          el.getAttribute('data-lightbox-src'),
          el.getAttribute('data-lightbox-title'),
          el.getAttribute('data-lightbox-desc'),
          el
        );
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });

    // FormSubmit AJAX handler with accessible status
    var contactForm = document.getElementById('contact-form');
    var formStatus = document.getElementById('form-status');
    var submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending Inquiry...';
        }
        if (formStatus) {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }

        var formData = new FormData(contactForm);
        fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        })
          .then(function (response) {
            if (response.ok) {
              contactForm.reset();
              if (formStatus) {
                formStatus.textContent = 'Thank you! Your brief has been sent directly to Noel Ayala (noeljedayala@gmail.com).';
                formStatus.className = 'form-status is-success';
              }
            } else {
              throw new Error('Submission failed');
            }
          })
          .catch(function () {
            if (formStatus) {
              formStatus.textContent = 'Could not send via form right now. Please email noeljedayala@gmail.com directly or book a call above.';
              formStatus.className = 'form-status is-error';
            }
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Direct Inquiry';
            }
          });
      });
    }
  });
})();
