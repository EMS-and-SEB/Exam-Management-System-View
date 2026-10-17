export const mockCourses = {
  courses: [
    {
      id: "902d1d07-2856-4c48-8df0-7d6f51cb3e1c",
      name: "Database Systems",
      status: "ACTIVE",
      instructor: {
        id: "a1b2c3d4-1111-4df6-9818-b0a70198031d",
        name: "Dr. Alan Turing",
        email: "alan.turing@university.edu"
      }
    },
    {
      id: "course-uuid-202",
      name: "Data Structures",
      status: "ACTIVE",
      instructor: {
        id: "instructor-uuid-202",
        name: "Prof. Grace Hopper",
        email: "grace.hopper@university.edu"
      }
    }
  ],
  cohorts: [
    {
      id: "45f9e2b1-2222-4c48-8df0-7d6f51cb3e1c",
      name: "Class of 2026 Exit Exam Cohort",
      status: "ACTIVE",
      coordinator: {
        id: "e5f6a7b8-3333-4df6-9818-b0a70198031d",
        name: "Prof. Ada Lovelace",
        email: "ada.lovelace@university.edu"
      }
    }
  ]
};

export const mockExams = [
  {
    id: "exam-uuid-101",
    title: "Database Systems Final Exam",
    examType: "FINAL",
    courseOrCohortName: "Database Systems",
    scheduledStart: "2026-10-15T09:00:00.000Z",
    durationMinutes: 120,
    status: "RELEASED",
    isOnRoster: true,
    owner: {
      name: "Dr. Alan Turing",
      email: "alan.turing@university.edu",
      role: "INSTRUCTOR"
    }
  },
  {
    id: "exam-uuid-202",
    title: "National Exit Exam Mock",
    examType: "MOCK_EXIT",
    courseOrCohortName: "Class of 2026 Exit Exam Cohort",
    scheduledStart: "2026-10-20T13:00:00.000Z",
    durationMinutes: 180,
    status: "RELEASED",
    isOnRoster: false,
    owner: {
      name: "Prof. Ada Lovelace",
      email: "ada.lovelace@university.edu",
      role: "EXIT_EXAM_COORDINATOR"
    }
  }
];

export const mockResults = [
  {
    examId: "exam-uuid-101",
    examTitle: "Database Systems Midterm",
    courseOrCohortName: "Database Systems",
    submittedAt: "2026-09-20T11:00:00.000Z",
    status: "GRADED",
    score: 45.5,
    maxScore: 50,
    percentage: 91.0
  },
  {
    examId: "exam-uuid-303",
    examTitle: "Data Structures Comprehensive",
    courseOrCohortName: "Data Structures",
    submittedAt: "2026-09-30T16:00:00.000Z",
    status: "PENDING_GRADING",
    score: null,
    maxScore: 100,
    percentage: null,
    notice: "Workout questions are currently being graded by your instructor."
  }
];