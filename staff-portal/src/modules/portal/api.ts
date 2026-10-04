// src/modules/portal/api.ts
import { portalClient } from '../../api/portalClient';
import { mockCourses, mockExams, mockResults, mockStudentUser } from './mockData';

const USE_MOCK = true; // 👈 Keep this TRUE for testing

export const portalApi = {
  login: async (studentId: string, password: string) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      // Return student data with the actual entered studentId
      return { 
        jwt: "mock-jwt-token-student-12345", 
        student: { 
          ...mockStudentUser,
          studentId: studentId // Use the student ID entered at login
        } 
      };
    }
    const { data } = await portalClient.post('/portal/auth/login', { studentId, password });
    return data;
  },

  getCourses: async () => {
    if (USE_MOCK) return mockCourses;
    const { data } = await portalClient.get('/portal/courses');
    return data;
  },

  getIncomingExams: async () => {
    if (USE_MOCK) return mockExams;
    const { data } = await portalClient.get('/portal/exams/incoming');
    return data;
  },

  getResults: async () => {
    if (USE_MOCK) return mockResults;
    const { data } = await portalClient.get('/portal/exams/results');
    return data;
  },

  sendInquiry: async (examId: string, subject: string, message: string) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { 
        sent: true, 
        recipient: { name: "Dr. Alan Turing", email: "alan.turing@university.edu" }, 
        sentAt: new Date().toISOString() 
      };
    }
    const { data } = await portalClient.post(`/portal/exams/${examId}/inquiry`, { subject, message });
    return data;
  }
};