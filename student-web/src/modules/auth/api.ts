import { http } from "../../lib/axios";
import { getHandshakeToken } from "./handshake";
import type { StudentLoginRequest, StudentLoginResponse } from "./types";

export const authApi = {
  login: ({
    studentId,
    otp,
  }: Omit<StudentLoginRequest, "handshakeToken">): Promise<StudentLoginResponse> =>
    http
      .post("/students/login", {
        studentId,
        otp,
        handshakeToken: getHandshakeToken(),
      })
      .then((r) => r.data),
};