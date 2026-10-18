// src/modules/portal/api.ts
import { http } from '@/lib/axios'; // <-- CORRECT IMPORT matching your axios.ts
import { mockCourses, mockExams, mockResults } from './mockData';

const USE_MOCK = true;

export const portalApi = {
  getCourses: async () => {
    if (USE_MOCK) return mockCourses;
    const { data } = await http.get('/portal/courses');
    return data;
  },

  getIncomingExams: async () => {
    if (USE_MOCK) return mockExams;
    const { data } = await http.get('/portal/exams/incoming');
    return data;
  },

  getResults: async () => {
    if (USE_MOCK) return mockResults;
    const { data } = await http.get('/portal/exams/results');
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
    const { data } = await http.post(`/portal/exams/${examId}/inquiry`, { subject, message });
    return data;
  }
};