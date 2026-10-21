import { http } from "@/lib/axios";
import type { WaitingPollResponse, StartSessionResponse } from "./types";

export async function getSession(sessionId: string): Promise<WaitingPollResponse> {
  return http.get(`/sessions/${sessionId}`).then((r) => r.data);
}

export async function startSession(sessionId: string): Promise<StartSessionResponse> {
  return http.post(`/sessions/${sessionId}/start`).then((r) => r.data);
}