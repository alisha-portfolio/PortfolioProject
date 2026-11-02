/* =========================================================
   Alisha — Portfolio
   Vanilla JavaScript only. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Editable settings ----------
     Replace this with your real email address.
     The contact form opens the visitor's email app addressed to it. */
  var CONFIG = {
    email: "shaa92903@gmail.com"
  };

  var root = document.documentElement;
  root.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function isPlaceholder(value) {
    return typeof value === "string" && value.indexOf("YOUR_") === 0;
  }

  /* ---------- Toast ---------- */
  var toast = $("#toast");
  var toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3800);
  }

  /* ---------- Placeholder links ----------
     Links that still point to YOUR_... placeholders explain themselves
     instead of silently going to a broken page. */
  $$("a[href]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      // Check the link's address at click time, so links updated later still work
      var target = (link.getAttribute("href") || "").replace(/^mailto:/, "");
      if (isPlaceholder(target)) {
        event.preventDefault();
        showToast("This link is a placeholder. Replace " + target + " in index.html with your real URL.");
      }
    });
  });

  /* ---------- Email shown on page ---------- */
  var emailLink = $("#emailLink");
  if (emailLink && !isPlaceholder(CONFIG.email)) {
    emailLink.href = "mailto:" + CONFIG.email;
    emailLink.textContent = CONFIG.email;
  }

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Portrait fallback ---------- */
  var portrait = $("#portrait");
  var portraitImg = $("#portraitImg");
  if (portrait && portraitImg) {
    var showFallback = function () { portrait.classList.add("no-photo"); };
    if (portraitImg.complete && portraitImg.naturalWidth === 0) showFallback();
    portraitImg.addEventListener("error", showFallback);
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = $("#navToggle");
  var navMenu = $("#navMenu");

  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
    // Close after choosing a link
    $$(".nav-link", navMenu).forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    // Close with Escape and return focus to the button
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("open")) {
        setMenu(false);
        navToggle.focus();
      }
    });
    // Reset when resizing up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) setMenu(false);
    });
  }

  /* ---------- Smooth scrolling ----------
     CSS handles smoothness (and reduced motion). This keeps the URL hash
     tidy and moves keyboard focus to the target section. */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = $(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      if (history.pushState) history.pushState(null, "", id);
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Header shadow + back-to-top ---------- */
  var header = $(".site-header");
  var toTop = $("#toTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Active nav link (scroll spy) ---------- */
  var navLinks = $$(".nav-link");
  var sections = navLinks
    .map(function (link) { return $(link.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Project filtering ---------- */
  var filterButtons = $$(".filter");
  var projects = $$(".project");
  var filterStatus = $("#filterStatus");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      var shown = 0;

      filterButtons.forEach(function (b) {
        var on = b === button;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });

      projects.forEach(function (card) {
        var categories = (card.getAttribute("data-category") || "").split(" ");
        var match = filter === "all" || categories.indexOf(filter) !== -1;
        card.hidden = !match;
        if (match) {
          card.classList.add("in"); // make sure revealed cards stay visible
          shown++;
        }
      });

      if (filterStatus) {
        filterStatus.textContent = "Showing " + shown + (shown === 1 ? " project" : " projects");
      }
    });
  });

  /* ---------- Contact form ----------
     There is no backend. On a valid submit the visitor's email app opens
     with the message prefilled (mailto). Nothing is sent automatically. */
  var form = $("#contactForm");
  var status = $("#formStatus");

  var rules = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address.";
    },
    subject: function (v) { return v.trim().length >= 3 ? "" : "Please add a short subject."; },
    message: function (v) { return v.trim().length >= 10 ? "" : "Please write a message of at least 10 characters."; }
  };

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var message = rule(input.value);
    var field = input.closest(".field");
    var errorEl = $("#" + input.id + "-error");
    if (field) field.classList.toggle("invalid", !!message);
    if (errorEl) errorEl.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  if (form) {
    var inputs = $$("input, textarea", form);

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("invalid")) validateField(input);
        if (status) status.textContent = "";
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (status) status.textContent = "";

      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (isPlaceholder(CONFIG.email)) {
        showToast("Set your email address in script.js (CONFIG.email) to enable this form.");
        return;
      }

      var values = {};
      inputs.forEach(function (input) { values[input.name] = input.value.trim(); });

      var body = values.message + "\n\n— " + values.name + " (" + values.email + ")";
      var url = "mailto:" + encodeURIComponent(CONFIG.email) +
        "?subject=" + encodeURIComponent(values.subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = url;
      if (status) status.textContent = "Your email app should now open with your message ready. Press send there to deliver it.";
    });
  }
})();
