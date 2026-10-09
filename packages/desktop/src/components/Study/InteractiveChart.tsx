import React, { useRef, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InteractiveChartProps {
    config: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ config }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const downloadPng = () => {
        if (!ref.current) return;
        const svgElement = ref.current.querySelector('.recharts-surface') as SVGSVGElement | null;
        if (!svgElement) return;
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width * 3; // high res
        canvas.height = svgSize.height * 3;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            if (ctx) {
                // Background color matches the theme
                ctx.fillStyle = '#050505'; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pngData = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.download = 'chart.png';
                a.href = pngData;
                a.click();
            }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const containerClasses = isFullscreen 
        ? "fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300"
        : "w-full flex flex-col items-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden my-4 relative group h-full";

    return (
        <div className={containerClasses}>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ opacity: isFullscreen ? 1 : undefined }}>
                <button 
                    onClick={downloadPng}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold backdrop-blur-md"
                    title="Download PNG"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    {isFullscreen && "Download"}
                </button>
                <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold backdrop-blur-md"
                    title={isFullscreen ? "Close Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    )}
                </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 text-center tracking-tight">{config.title}</h3>
            
            <div ref={ref} className={`w-full ${isFullscreen ? 'h-3/4' : 'h-[300px]'}`}>
                <ResponsiveContainer width="100%" height="100%">
                    {config.type === 'bar' ? (
                        <BarChart data={config.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey={config.xAxis} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                            <Legend />
                            {config.series.map((key: string, idx: number) => (
                                <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    ) : config.type === 'pie' ? (
                        <PieChart>
                            <Pie data={config.data} dataKey={config.series[0]} nameKey={config.xAxis} cx="50%" cy="50%" outerRadius={isFullscreen ? 200 : 80} label>
                                {config.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                            <Legend />
                        </PieChart>
                    ) : (
                        <LineChart data={config.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey={config.xAxis} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                            <Legend />
                            {config.series.map((key: string, idx: number) => (
                                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
