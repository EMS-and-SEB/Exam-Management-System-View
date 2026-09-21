import { describe, expect, it } from "vitest";
import { getLoginErrorMessage, LOGIN_FAILURE_COPY } from "./errors";

describe("getLoginErrorMessage", () => {
  it("maps every documented backend failure to distinct student-facing copy", () => {
    const documented = [
      "Invalid or expired OTP.",
      "Exam is not available for login.",
      "Exam has not started yet.",
      "Login window has expired.",
      "Student not found.",
      "You are not on this exam roster.",
      "A session already exists for this student on this exam.",
    ];

    for (const backendMessage of documented) {
      const copy = getLoginErrorMessage({ status: 401, message: backendMessage });
      expect(copy).toBe(LOGIN_FAILURE_COPY[backendMessage]);
      expect(copy).not.toBe(backendMessage);
      expect(copy.length).toBeGreaterThan(0);
    }
  });

  it("distinguishes the session-already-exists conflict (409) case", () => {
    const copy = getLoginErrorMessage({
      status: 409,
      message: "A session already exists for this student on this exam.",
    });
    expect(copy).toContain("active session");
  });

  it("falls back to the raw backend message for undocumented cases", () => {
    const copy = getLoginErrorMessage({
      status: 401,
      message: "Exam is not fully configured.",
    });
    expect(copy).toBe("Exam is not fully configured.");
  });

  it("returns a generic message when no backend message is present", () => {
    const copy = getLoginErrorMessage({ status: 500 });
    expect(copy).toBe("Sign in failed. Check your details and try again.");
  });

  it("returns a generic message when the error is empty", () => {
    expect(getLoginErrorMessage({})).toBe(
      "Sign in failed. Check your details and try again."
    );
  });
});