import GlassCard from '../ui/GlassCard';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    markedDates: string[];
    fullHeight?: boolean;
}

export default function CalendarWidget({ selectedDate, onSelectDate, markedDates, fullHeight }: CalendarWidgetProps) {
    const today = new Date();
    const currentMonth = format(selectedDate, 'MMMM yyyy');

    const start = startOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const days = Array.from({ length: 35 }).map((_, i) => addDays(start, i));

    return (
        <GlassCard fullHeight={fullHeight}>
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{currentMonth}</h3>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/5"><ChevronLeft size={18} /></button>
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/5"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} className="text-[10px] text-gray-500 font-black uppercase tracking-widest py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
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
                                aspect-square rounded-2xl text-[11px] font-black flex items-center justify-center relative transition-all duration-300
                                ${isSelected ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-110 z-10' : ''}
                                ${!isSelected && isTodayDate ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
                                ${!isSelected && !isTodayDate && isCurrentMonth ? 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5' : ''}
                                ${!isCurrentMonth ? 'text-gray-700 opacity-30 px-2' : ''}
                            `}
                        >
                            {format(day, 'd')}
                            {isMarked && !isSelected && (
                                <div className="absolute bottom-2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </GlassCard>
    );
}
