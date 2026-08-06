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

  // Contact form (Formspree AJAX submit with inline success/error state)
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot spam check
      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      status.textContent = '';
      status.className = 'form-status';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            status.textContent = "Thanks! Your message has been sent — we'll get back to you shortly.";
            status.className = 'form-status success';
            form.reset();
          } else {
            return response.json().then(function (data) {
              var msg = data && data.errors
                ? data.errors.map(function (err) { return err.message; }).join(', ')
                : 'Something went wrong. Please call us instead.';
              throw new Error(msg);
            });
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
