// AwniClean — shared front-end behavior

document.addEventListener('DOMContentLoaded', function () {
  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var header = document.getElementById('siteHeader');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Care Guides dropdowns
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(function (dropdown) {
    var btn = dropdown.querySelector('.nav-dropdown-toggle');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var willOpen = !dropdown.classList.contains('open');
      dropdowns.forEach(function (other) {
        other.classList.remove('open');
        var otherBtn = other.querySelector('.nav-dropdown-toggle');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', function () {
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('open');
      var btn = dropdown.querySelector('.nav-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('open');
      var btn = dropdown.querySelector('.nav-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Section scroll-spy — terracotta underline on matching nav link
  var spyIds = ['packages', 'services', 'contact'];
  var spyLinks = spyIds
    .map(function (id) {
      return document.querySelector('.site-nav a[href="#' + id + '"]');
    })
    .filter(Boolean);
  var spySections = spyIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (spyLinks.length && spySections.length === spyIds.length) {
    var setSpyActive = function (id) {
      spyLinks.forEach(function (link) {
        var match = !!id && link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', match);
      });
    };

    var updateSpy = function () {
      var offset = (header ? header.offsetHeight : 72) + 48;
      var marker = window.scrollY + offset;
      var current = null;
      spySections.forEach(function (section) {
        if (section.offsetTop <= marker) current = section.id;
      });
      setSpyActive(current);
    };

    window.addEventListener('scroll', updateSpy, { passive: true });
    window.addEventListener('resize', updateSpy);
    updateSpy();

    spyLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setSpyActive(link.getAttribute('href').slice(1));
        if (header && header.classList.contains('nav-open')) {
          header.classList.remove('nav-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // "How It Works" interactive journey stepper
  var journeySteps = document.querySelectorAll('.journey-step');
  var journeyPanels = document.querySelectorAll('.journey-panel');
  var journeyLineFill = document.getElementById('journeyLineFill');
  if (journeySteps.length) {
    var setActiveStep = function (index) {
      journeySteps.forEach(function (step, i) {
        var isActive = i === index;
        step.classList.toggle('active', isActive);
        step.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      journeyPanels.forEach(function (panel, i) {
        panel.classList.toggle('active', i === index);
      });
      if (journeyLineFill) {
        var pct = (index / (journeySteps.length - 1)) * 100;
        journeyLineFill.style.width = pct + '%';
      }
    };
    journeySteps.forEach(function (step, i) {
      step.addEventListener('click', function () { setActiveStep(i); });
    });
    setActiveStep(0);
  }

  // Billing toggle (Packages page): quarterly vs annual pricing
  var billingRadios = document.querySelectorAll('input[name="billing"]');
  if (billingRadios.length) {
    var applyBilling = function (cycle) {
      document.querySelectorAll('[data-quarterly]').forEach(function (el) {
        var amount = el.querySelector('.price-amount');
        var period = el.querySelector('.price-period');
        var note = el.parentElement.querySelector('.package-billing-note');
        if (cycle === 'annual') {
          amount.textContent = el.getAttribute('data-annual');
          period.textContent = '/year';
          if (note) note.textContent = 'Billed once, save ' + el.getAttribute('data-save');
        } else {
          amount.textContent = el.getAttribute('data-quarterly');
          period.textContent = '/quarter';
          if (note) note.textContent = 'Billed each visit, cancel anytime';
        }
      });
    };
    billingRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) applyBilling(radio.value);
      });
    });
    var checked = document.querySelector('input[name="billing"]:checked');
    applyBilling(checked ? checked.value : 'quarterly');
  }

  // Contact form (Netlify Forms AJAX submit)
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('input[name="bot-field"]');
      if (honeypot && honeypot.value) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      status.textContent = '';
      status.className = 'form-status';

      var formData = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
        .then(function (response) {
          if (response.ok) {
            status.textContent = "Thanks! Your message has been sent — we'll get back to you shortly.";
            status.className = 'form-status success';
            form.reset();
          } else {
            throw new Error('Something went wrong. Please call us instead.');
          }
        })
        .catch(function (err) {
          status.textContent = err.message || 'Something went wrong. Please call us instead.';
          status.className = 'form-status error';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }
});
