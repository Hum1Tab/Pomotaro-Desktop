import { useExamDates } from '@/hooks/useExamDates';
import { Calendar, Clock } from 'lucide-react';

export function ExamCountdown() {
    const { getUpcomingExams, getDaysUntil } = useExamDates();
    const upcomingExams = getUpcomingExams();

    if (upcomingExams.length === 0) {
        return null;
    }

    // Show the nearest exam
    const nearestExam = upcomingExams[0];
    const daysUntil = getDaysUntil(nearestExam.date);

    return (
        <div
            className="rounded-lg p-4 sm:p-6 mb-6 text-white shadow-warm animate-fade-in"
            style={{ backgroundColor: nearestExam.color }}
        >
            <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="text-lg sm:text-xl font-bold">{nearestExam.name}</h2>
            </div>

            <div className="flex items-baseline gap-2">
                <div className="text-4xl sm:text-5xl font-bold">
                    {daysUntil}
                </div>
                <div className="text-xl sm:text-2xl font-medium opacity-90">
                    日
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm sm:text-base opacity-90">
                <Clock className="w-4 h-4" />
                <span>{new Date(nearestExam.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                })}</span>
            </div>

            {upcomingExams.length > 1 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="text-sm opacity-90">
                        その他の予定:
                    </div>
                    <div className="mt-2 space-y-1">
                        {upcomingExams.slice(1, 3).map((exam) => (
                            <div key={exam.id} className="text-sm opacity-80 flex justify-between">
                                <span>{exam.name}</span>
                                <span>あと{getDaysUntil(exam.date)}日</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
