import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { pauseTimer, resumeTimer, stopTimer } from '../../features/timer/timerSlice';

export function TimerSync() {
    const { isActive, isPaused, timeLeft, plannedMinutes, currentSessionId } = useSelector((state: RootState) => state.timer);
    const dispatch = useDispatch();

    const isStopwatch = plannedMinutes === 0;
    const progress = isStopwatch ? (timeLeft % 60) / 0.6 : 100 - (timeLeft / (plannedMinutes * 60)) * 100;

    // Electron integration
    useEffect(() => {
        // Only open widget if timer actually starts
        if (window.electronAPI && isActive && !isPaused && timeLeft === plannedMinutes * 60) {
            window.electronAPI.openWidget();
        }
    }, [isActive, isPaused, timeLeft, plannedMinutes]);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.syncTimer({
                isActive,
                isPaused,
                timeLeft,
                plannedMinutes,
                progress
            });
        }
    }, [isActive, isPaused, timeLeft, plannedMinutes, progress]);

    useEffect(() => {
        if (window.electronAPI && window.electronAPI.onWidgetCommand) {
            const cleanup = window.electronAPI.onWidgetCommand((event: any, command: string) => {
                if (command === 'toggle') {
                    isPaused ? dispatch(resumeTimer()) : dispatch(pauseTimer());
                } else if (command === 'stop') {
                    dispatch(stopTimer());
                    if (window.electronAPI) window.electronAPI.closeWidget();
                }
            });
            return cleanup;
        }
    }, [isPaused, currentSessionId, timeLeft, plannedMinutes, dispatch]);

    // This component renders nothing, it just syncs Redux with the Electron widget
    return null;
}
