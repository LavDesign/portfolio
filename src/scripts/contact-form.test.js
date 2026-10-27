import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  initContactForm,
  isSpam,
  STATUS,
  typeFromSearch,
  validateContact,
} from "./contact-form.js";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  type: "project",
  message: "A message that is long enough.",
};

describe("validateContact", () => {
  it("accepts a complete form", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("flags every empty field", () => {
    const errors = validateContact({
      name: " ",
      email: "",
      type: "",
      message: "",
    });
    expect(Object.keys(errors).sort()).toEqual([
      "email",
      "message",
      "name",
      "type",
    ]);
  });

  it.each(["ada", "ada@", "ada@example", "a da@example.com"])(
    "rejects the invalid email %s",
    (email) => {
      expect(validateContact({ ...valid, email }).email).toMatch(/valid email/);
    },
  );

  it("rejects messages under 20 characters", () => {
    expect(
      validateContact({ ...valid, message: "Too short." }).message,
    ).toMatch(/at least 20/);
  });

  it("rejects unknown types", () => {
    expect(validateContact({ ...valid, type: "other" }).type).toBeDefined();
  });
});

describe("isSpam", () => {
  it("treats a filled honeypot as spam", () => {
    expect(isSpam({ honeypot: "http://spam.example" })).toBe(true);
    expect(isSpam({ honeypot: "" })).toBe(false);
  });
});

describe("typeFromSearch", () => {
  it("reads known types from the query string", () => {
    expect(typeFromSearch("?type=hire")).toBe("hire");
    expect(typeFromSearch("?type=project")).toBe("project");
  });

  it("ignores missing or unknown types", () => {
    expect(typeFromSearch("")).toBeNull();
    expect(typeFromSearch("?type=other")).toBeNull();
  });
});

describe("initContactForm", () => {
  const render = (endpoint = "") => {
    document.body.innerHTML = `
      <form data-contact-form data-endpoint="${endpoint}">
        <input name="name" />
        <p data-error-for="name" hidden></p>
        <input name="email" />
        <p data-error-for="email" hidden></p>
        <input type="radio" name="type" value="hire" />
        <input type="radio" name="type" value="project" />
        <p data-error-for="type" hidden></p>
        <textarea name="message"></textarea>
        <p data-error-for="message" hidden></p>
        <input name="_gotcha" />
        <button type="submit">Send message</button>
        <p data-form-status></p>
      </form>
    `;
    return document.querySelector("form");
  };

  const fill = (form, values) => {
    form.elements.name.value = values.name;
    form.elements.email.value = values.email;
    form.querySelector(`[value="${values.type}"]`).checked = true;
    form.elements.message.value = values.message;
  };

  const submit = async (form) => {
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    await Promise.resolve();
  };

  const status = () => document.querySelector("[data-form-status]").textContent;

  let fetchImpl;
  beforeEach(() => {
    fetchImpl = vi.fn(() => Promise.resolve({ ok: true }));
  });

  it("preselects the radio from ?type=", () => {
    const form = render();
    initContactForm(form, { fetchImpl, search: "?type=hire" });
    expect(form.querySelector('[value="hire"]').checked).toBe(true);
    expect(form.querySelector('[value="project"]').checked).toBe(false);
  });

  it("shows errors, marks fields invalid and focuses the first one", async () => {
    const form = render();
    initContactForm(form, { fetchImpl, search: "" });
    form.elements.name.value = "Ada";
    await submit(form);

    const email = form.elements.email;
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(form.elements.name.hasAttribute("aria-invalid")).toBe(false);
    expect(form.querySelector('[data-error-for="email"]').hidden).toBe(false);
    expect(document.activeElement).toBe(email);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("runs in demo mode without an endpoint and never calls fetch", async () => {
    const form = render();
    initContactForm(form, { fetchImpl, search: "" });
    fill(form, valid);
    await submit(form);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(status()).toBe(STATUS.demo);
  });

  it("doesn't send when the honeypot is filled", async () => {
    const form = render("https://formspree.io/f/test");
    initContactForm(form, { fetchImpl, search: "" });
    fill(form, valid);
    form.elements._gotcha.value = "spam";
    await submit(form);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(status()).toBe("");
  });

  it("posts to the endpoint and reports success", async () => {
    const form = render("https://formspree.io/f/test");
    initContactForm(form, { fetchImpl, search: "" });
    fill(form, valid);
    await submit(form);
    await Promise.resolve();

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://formspree.io/f/test",
      expect.objectContaining({ method: "POST" }),
    );
    expect(status()).toBe(STATUS.success);
  });
});
