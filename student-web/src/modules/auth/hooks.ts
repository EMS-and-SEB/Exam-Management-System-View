import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "./api";
import { useSessionStore, EXAM_STORAGE_KEY } from "../../store/session.store";
import { useExamSessionStore } from "../exam/store";
import { getLoginErrorMessage, type ApiError } from "./errors";
import type { LoginFormValues } from "./validation/login.schema";
import type { StudentLoginResponse } from "./types";

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  const setStudentId = useSessionStore((s) => s.setStudentId);
  const setHasHydrated = useSessionStore((s) => s.setHasHydrated);
  const navigate = useNavigate();

  return useMutation<StudentLoginResponse, ApiError, LoginFormValues>({
    mutationFn: (values) => authApi.login(values),
    onSuccess: (session, values) => {
      // Every successful login is the start of a fresh attempt. Reset the exam
      // store (in-memory AND its sessionStorage blob) so a previous student's
      // answers/summary never leak into this session — the store is a tab-scoped
      // singleton otherwise cleared only via clearSession().
      useExamSessionStore.getState().reset();
      sessionStorage.removeItem(EXAM_STORAGE_KEY);
      setSession(session);
      setStudentId(values.studentId);
      setHasHydrated(true);
      navigate("/exam");
    },
  });
}

export function toLoginMessage(error: ApiError | null): string {
  return getLoginErrorMessage({
    status: error?.response?.status,
    message: error?.message,
  });
}