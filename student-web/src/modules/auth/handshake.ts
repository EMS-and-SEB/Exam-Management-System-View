/** The native SEB host obtains and injects this short-lived token after handshake. */
export function getHandshakeToken(): string {
  return (window as Window & { __EMS_SEB_HANDSHAKE_TOKEN?: string })
    .__EMS_SEB_HANDSHAKE_TOKEN ?? "";
}
