// src/hooks/useStudentSession.ts
import { useState, useEffect } from 'react';

interface StudentUser {
  id: string;
  studentId: string;
  name: string;
  email: string;
}

const STORAGE_KEY = 'student-session';

export function useStudentSession() {
  const [student, setStudent] = useState<StudentUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (student) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [student]);

  const login = (studentData: StudentUser) => {
    setStudent(studentData);
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { student, login, logout, isAuthenticated: !!student };
}