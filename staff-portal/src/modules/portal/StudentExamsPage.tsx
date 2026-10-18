import { useEffect, useState } from 'react';
import { portalApi } from './api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/shared/LoadingState';
import { AlertTriangle } from 'lucide-react';

interface ExamOwner {
  name: string;
  email: string;
  role: string;
}

interface Exam {
  id: string;
  title: string;
  examType: string;
  courseOrCohortName: string;
  scheduledStart: string;
  durationMinutes: number;
  status: string;
  isOnRoster: boolean;
  owner: ExamOwner;
}

export function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryExam, setInquiryExam] = useState<Exam | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await portalApi.getIncomingExams();
        setExams(response);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInquirySubmit = async () => {
    if (!inquiryExam || subject.length < 3 || message.length < 10) return;
    setSending(true);
    try {
      await portalApi.sendInquiry(inquiryExam.id, subject, message);
      alert(`Your inquiry was sent to ${inquiryExam.owner.name}.`);
      setInquiryExam(null);
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Failed to send inquiry:', err);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} className={exam.isOnRoster ? '' : 'border-red-200 bg-red-50/50 dark:bg-red-950/20'}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <Badge variant="outline">{exam.examType}</Badge>
                  </div>
                  <CardDescription>{exam.courseOrCohortName} • {exam.durationMinutes} minutes</CardDescription>
                  <CardDescription className="mt-1">
                    Scheduled: {new Date(exam.scheduledStart).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {exam.isOnRoster ? (
                    <Badge variant="default" className="bg-green-600">Eligible / On Roster</Badge>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="destructive">Missing from Exam Roster</Badge>
                      <Dialog>
                        <DialogTrigger>
                          <Button variant="destructive" size="sm" onClick={() => setInquiryExam(exam)}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Contact Instructor
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contact Instructor</DialogTitle>
                            <DialogDescription>
                              Report your missing roster status to {inquiryExam?.owner.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Subject</Label>
                              <Input 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)} 
                                placeholder="e.g., Missing from Final Exam Roster" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Message</Label>
                              <Textarea 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                placeholder="Explain your issue (min 10 characters)..." 
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleInquirySubmit} disabled={sending || subject.length < 3 || message.length < 10}>
                              {sending ? 'Sending...' : 'Send Inquiry'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            {!exam.isOnRoster && (
              <CardContent className="pt-0">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Roster Warning</AlertTitle>
                  <AlertDescription>
                    You are enrolled in this course, but have not been added to the exam roster.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))}
        {exams.length === 0 && <p className="text-muted-foreground">No upcoming exams found.</p>}
      </div>
    </div>
  );
}