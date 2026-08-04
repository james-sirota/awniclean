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

  // "Choose {Package}" buttons: preselect the package on the in-page contact form
  var packageSelect = document.getElementById('packageSelect');
  if (packageSelect) {
    document.querySelectorAll('[data-package]').forEach(function (el) {
      el.addEventListener('click', function () {
        var pkg = el.getAttribute('data-package');
        var optionExists = Array.from(packageSelect.options).some(function (o) { return o.value === pkg; });
        if (optionExists) packageSelect.value = pkg;
      });
    });
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
