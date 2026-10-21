import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";

const { mutate, clearSession } = vi.hoisted(() => ({ mutate: vi.fn(), clearSession: vi.fn() }));

vi.mock("./hooks", () => ({
  useLogin: () => ({ mutate, isPending: false, isError: false, error: null }),
  toLoginMessage: () => "",
}));

vi.mock("./handshake", () => ({ getHandshakeToken: () => "" }));

vi.mock("@/store/session.store", () => ({
  useSessionStore: (select: (state: { session: null; hasHydrated: boolean; clearSession: typeof clearSession }) => unknown) =>
    select({ session: null, hasHydrated: true, clearSession }),
}));

function CurrentSearch() {
  return <output data-testid="current-search">{useLocation().search}</output>;
}

describe("LoginPage SEB handshake requirement", () => {
  beforeEach(() => mutate.mockClear());

  it("explains direct browser access and does not submit login without a handshake token", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Student ID"), "UGR/1212/15");
    await user.type(screen.getByLabelText("OTP Code"), "118422");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Open this exam using EMS Safe Exam Browser to sign in.",
    );
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();

    fireEvent.submit(container.querySelector("form")!);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("clears the previous local session and removes the SEB return marker", async () => {
    clearSession.mockClear();
    render(
      <MemoryRouter initialEntries={["/login?sebReturnToLogin=1"]}>
        <LoginPage />
        <CurrentSearch />
      </MemoryRouter>,
    );

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("current-search")).toHaveTextContent("");
  });
});
