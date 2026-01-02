import GlassCard from '../ui/GlassCard';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    markedDates: string[];
}

export default function CalendarWidget({ selectedDate, onSelectDate, markedDates }: CalendarWidgetProps) {
    const today = new Date();
    const currentMonth = format(selectedDate, 'MMMM yyyy');

    // Simple calendar logic: show current week + next 3 weeks approx
    // For MVP, just show a static grid or logic 
    // Let's implement a simple full month view

    const start = startOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const days = Array.from({ length: 35 }).map((_, i) => addDays(start, i));

    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">{currentMonth}</h3>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={16} /></button>
                    <button className="p-1 hover:bg-white/10 rounded"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-xs text-gray-500 font-medium py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const isTodayDate = isSameDay(day, today);
                    const isSelected = isSameDay(day, selectedDate);
                    const isMarked = markedDates.includes(format(day, 'yyyy-MM-dd'));
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();

                    return (
                        <button
                            key={i}
                            onClick={() => onSelectDate(day)}
                            className={`
                                h-8 w-8 rounded-lg text-xs flex items-center justify-center relative transition-all
                                ${isSelected ? 'bg-indigo-600 text-white font-bold' : ''}
                                ${!isSelected && isTodayDate ? 'bg-white/10 text-indigo-400 font-bold' : ''}
                                ${!isSelected && !isTodayDate && isCurrentMonth ? 'text-gray-300 hover:bg-white/5' : ''}
                                ${!isCurrentMonth ? 'text-gray-700' : ''}
                            `}
                        >
                            {format(day, 'd')}
                            {isMarked && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </GlassCard>
    );
}
