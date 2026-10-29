export const MESSAGE_MIN_LENGTH = 20;
export const CONTACT_TYPES = ["hire", "project"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const STATUS = {
  sending: "Sending…",
  success: "Thanks, your message was sent.",
  error: "Something went wrong and your message wasn't sent. Please try again.",
  demo: "Demo mode: this form doesn't send messages yet.",
};

/** Field errors for the contact form. An empty object means it's valid. */
export function validateContact({ name, email, type, message }) {
  const errors = {};
  if (!name?.trim()) errors.name = "Enter your name.";

  if (!email?.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email, like name@example.com.";
  }

  if (!CONTACT_TYPES.includes(type)) {
    errors.type = "Choose what this is about.";
  }

  if (!message?.trim()) errors.message = "Write a message.";
  else if (message.trim().length < MESSAGE_MIN_LENGTH) {
    errors.message = `Your message needs at least ${MESSAGE_MIN_LENGTH} characters.`;
  }

  return errors;
}

/** A filled honeypot means a bot filled the form. */
export function isSpam({ honeypot }) {
  return Boolean(honeypot?.trim());
}

/** "?type=hire" -> "hire". Unknown or missing types return null. */
export function typeFromSearch(search) {
  const type = new URLSearchParams(search).get("type");
  return CONTACT_TYPES.includes(type) ? type : null;
}

function readValues(form) {
  const data = new FormData(form);
  const value = (key) => String(data.get(key) ?? "");
  return {
    name: value("name"),
    email: value("email"),
    type: value("type"),
    message: value("message"),
    honeypot: value("_gotcha"),
  };
}

/**
 * Validates and submits the contact form. Sends to Formspree when the form has
 * a data-endpoint; otherwise runs in demo mode and never claims it was sent.
 * `onSuccess` runs only after Formspree confirms the message was sent.
 */
export function initContactForm(
  form,
  {
    fetchImpl = globalThis.fetch,
    search = window.location.search,
    onSuccess = () => {},
  } = {},
) {
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('[type="submit"]');
  const endpoint = form.dataset.endpoint;

  // JS takes over validation so errors render next to each field.
  form.noValidate = true;

  const preset = typeFromSearch(search);
  if (preset) {
    const radio = form.querySelector(`input[name="type"][value="${preset}"]`);
    if (radio) radio.checked = true;
  }

  const setStatus = (text) => {
    status.textContent = text;
  };

  const showErrors = (errors) => {
    for (const field of ["name", "email", "type", "message"]) {
      const error = form.querySelector(`[data-error-for="${field}"]`);
      const inputs = form.querySelectorAll(`[name="${field}"]`);
      const message = errors[field] ?? "";

      error.textContent = message;
      error.hidden = !message;
      inputs.forEach((input) => {
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const values = readValues(form);
    const errors = validateContact(values);
    showErrors(errors);

    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      setStatus("");
      firstInvalid.focus();
      return;
    }

    // Quietly drop bot submissions.
    if (isSpam(values)) return;

    if (!endpoint) {
      setStatus(STATUS.demo);
      return;
    }

    setStatus(STATUS.sending);
    submit.disabled = true;
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Formspree: ${response.status}`);
      form.reset();
      setStatus(STATUS.success);
    } catch {
      setStatus(STATUS.error);
      return;
    } finally {
      submit.disabled = false;
    }
    onSuccess();
  };

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}
