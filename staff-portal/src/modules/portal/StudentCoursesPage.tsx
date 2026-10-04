// src/modules/portal/StudentCoursesPage.tsx
import { useEffect, useState } from 'react';
import { portalApi } from './api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { BookOpen, Users } from 'lucide-react';

// Strict TypeScript Interfaces to replace 'any'
interface Instructor {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  instructor: Instructor;
}

interface Coordinator {
  id: string;
  name: string;
  email: string;
}

interface Cohort {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  coordinator: Coordinator;
}

interface PortalData {
  courses: Course[];
  cohorts: Cohort[];
}

export function StudentCoursesPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await portalApi.getCourses();
        setData(response);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingState />;

  const courseCount = data?.courses?.length || 0;
  const cohortCount = data?.cohorts?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseCount}</div>
            <p className="text-xs text-muted-foreground">Active academic courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cohort Programs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohortCount}</div>
            <p className="text-xs text-muted-foreground">Enrolled programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Courses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Academic Courses</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.courses?.map((course: Course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{course.name}</CardTitle>
                  <Badge variant={course.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
                <CardDescription>
                  Instructor: <a href={`mailto:${course.instructor.email}`} className="text-primary hover:underline">{course.instructor.name}</a>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Cohort Programs */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold">Cohort Programs</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.cohorts?.map((cohort: Cohort) => (
            <Card key={cohort.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cohort.name}</CardTitle>
                  <Badge variant={cohort.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {cohort.status}
                  </Badge>
                </div>
                <CardDescription>
                  Coordinator: <a href={`mailto:${cohort.coordinator.email}`} className="text-primary hover:underline">{cohort.coordinator.name}</a>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}