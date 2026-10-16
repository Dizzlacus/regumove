import { HONEYPOT_FIELD, enquiryFields, enquiryMessages } from "../data/enquiry";
import { validateEnquiry } from "../lib/validate-enquiry";

(function () {
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");
  if (!toggle || !panel) return;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  function focusable() {
    return [toggle, ...panel.querySelectorAll(focusableSelector)];
  }

  function openMenu() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    const firstLink = panel.querySelector("a");
    firstLink?.focus();
  }

  function closeMenu(restoreFocus) {
    toggle.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    isOpen() ? closeMenu(false) : openMenu();
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isOpen()) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (toggle.contains(target) || panel.contains(target)) return;
    closeMenu(false);
  });

  const desktopNav = window.matchMedia("(min-width: 768px)");
  desktopNav.addEventListener("change", (event) => {
    if (event.matches && isOpen()) closeMenu(false);
  });
})();

(function () {
  const header = document.getElementById("site-header");
  if (!header) return;

  let ticking = false;

  function updateChrome() {
    header.classList.toggle("is-sticky", window.scrollY > 8);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateChrome);
  }

  updateChrome();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

(function () {
  // One-time fade-up for Why and Our story (.reveal), and the pencil draw-in of the product connectors.
  // Product rows and Contact have no entry animation.
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.remove("reveal"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  reveals.forEach((el) => observer.observe(el));
})();

(function () {
  // Enhances the plain POST form: validates inline, sends JSON and reports the real outcome.
  const form = document.getElementById("enquiry-form");
  const status = document.getElementById("form-status");
  if (!(form instanceof HTMLFormElement) || !status) return;

  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit?.querySelector(".btn-label");
  const idleLabel = submitLabel?.textContent ?? "";
  const fieldNames = /** @type {(keyof typeof enquiryFields)[]} */ (Object.keys(enquiryFields));

  form.noValidate = true; // our messages replace the browser's bubbles

  function control(name) {
    return /** @type {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} */ (form.elements.namedItem(name));
  }

  function setStatus(state, message) {
    status.dataset.state = state;
    status.textContent = message;
  }

  function setFieldError(name, message) {
    const input = control(name);
    const error = document.getElementById(`${name}-error`);
    if (!input || !error) return;
    error.textContent = message || "";
    error.hidden = !message;
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", error.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }

  /** Shows each field's error (or clears it) and returns the first invalid control. */
  function showErrors(errors) {
    fieldNames.forEach((name) => setFieldError(name, errors[name]));
    const first = fieldNames.find((name) => errors[name]);
    return first ? control(first) : null;
  }

  function readValues() {
    return Object.fromEntries(fieldNames.map((name) => [name, control(name).value.trim()]));
  }

  // Clear a field's error as soon as it is corrected.
  function clearIfCorrected(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement)) return;
    if (input.getAttribute("aria-invalid") !== "true") return;
    if (!validateEnquiry(readValues())[input.name]) setFieldError(input.name, "");
  }
  form.addEventListener("input", clearIfCorrected);
  form.addEventListener("change", clearIfCorrected); // selects

  function setPending(pending) {
    form.setAttribute("aria-busy", String(pending));
    if (submit instanceof HTMLButtonElement) submit.disabled = pending;
    if (submitLabel) submitLabel.textContent = pending ? "Sending…" : idleLabel;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.getAttribute("aria-busy") === "true") return;

    const values = readValues();
    const errors = validateEnquiry(values);
    const firstInvalid = showErrors(errors);
    if (firstInvalid) {
      setStatus("error", enquiryMessages.invalid);
      firstInvalid.focus();
      return;
    }

    setPending(true);
    setStatus("pending", enquiryMessages.pending);

    let data = null;
    let ok = false;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: control(HONEYPOT_FIELD)?.value ?? "" }),
      });
      data = await response.json().catch(() => null);
      // Success only on a confirmed OK from the backend.
      ok = response.ok && data?.ok === true;
    } catch {
      ok = false;
    }
    setPending(false);

    if (ok) {
      form.hidden = true;
      setStatus("success", data?.message || enquiryMessages.success);
      status.focus();
      return;
    }

    if (data?.errors) {
      const first = showErrors(data.errors);
      setStatus("error", data.message || enquiryMessages.invalid);
      first?.focus();
      return;
    }

    setStatus("error", typeof data?.message === "string" ? data.message : enquiryMessages.failure);
    status.focus();
  });
})();
