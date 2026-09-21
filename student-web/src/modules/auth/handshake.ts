/**
 * Returns the SEB client-key handshake token that must accompany student login.
 *
 * TEMPORARY STUB — do not rely on the returned value. The backend's handshake
 * verification is currently commented out (see SessionsService.studentLogin), so
 * any non-empty value passes for now. The real implementation must obtain a JWT
 * signed with the SEB client key, which lives inside the LockDown Browser / native
 * shell and is not reachable from the browser. That integration will replace this
 * function with a call into the native bridge (e.g. messenger.postMessage) and the
 * returned token will be verified server-side against `seb.handshakeSecret`.
 */
export function getHandshakeToken(): string {
  return "seb-handshake-stub";
}