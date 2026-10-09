import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    stream: MediaStream | null;
    isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream, isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        if (!isRecording || !stream) {
            cancelAnimationFrame(animationRef.current);
            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 64;
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const draw = () => {
            if (!isRecording) return;
            animationRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            const width = canvas.width;
            const height = canvas.height;

            canvasCtx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 1.5;
            let x = 0;

            // Create gradient ONCE outside the loop
            const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)'); // red-500
            gradient.addColorStop(1, 'rgba(239, 68, 68, 1)');   // red-500 solid
            canvasCtx.fillStyle = gradient;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height * 0.8;
                
                // Draw rounded bar
                canvasCtx.beginPath();
                canvasCtx.roundRect(x, height / 2 - barHeight / 2, barWidth - 2, Math.max(4, barHeight), 4);
                canvasCtx.fill();

                x += barWidth + 2;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [stream, isRecording]);

    return (
        <canvas 
            ref={canvasRef} 
            className="h-10 w-32"
            width={128} 
            height={40}
        />
    );
};
