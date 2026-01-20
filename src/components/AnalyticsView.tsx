import React, { useMemo } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { calculateMetrics } from '../utils/analytics';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Activity,
    Clock,
    Calendar,
    Award,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
    const { events, conflicts } = useCalendar();

    const metrics = useMemo(() => calculateMetrics(events, conflicts), [events, conflicts]);

    return (
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto custom-scrollbar h-full">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
                        <p className="text-slate-500">Weekly breakdown of your schedule performance</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-sm font-medium text-slate-600">Health Score:</span>
                        <div className={`text-xl font-bold ${metrics.calendarHealthScore >= 80 ? 'text-green-600' :
                                metrics.calendarHealthScore >= 60 ? 'text-amber-500' :
                                    'text-red-500'
                            }`}>
                            {metrics.calendarHealthScore}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Meetings</p>
                            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalMeetings}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <Clock className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Hours in Meetings</p>
                            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalHours}h</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Activity className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Focus Blocks</p>
                            <h3 className="text-2xl font-bold text-slate-900">{metrics.focusTimeBlocks}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Busiest Day</p>
                            <h3 className="text-xl font-bold text-slate-900">{metrics.busiestDay}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daily Load Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Daily Meeting Load</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.dailyLoad}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="hours" name="Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Time Breakdown</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.meetingDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {metrics.meetingDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            {metrics.meetingDistribution.map(item => (
                                <div key={item.name} className="flex items-center text-xs text-slate-600">
                                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award className="h-48 w-48 text-white transform rotate-12" />
                    </div>

                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        AI Productivity Insights
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {metrics.insights.map((insight, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex items-start">
                                {idx === 0 ? <AlertCircle className="h-5 w-5 text-yellow-300 mr-3 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5" />}
                                <p className="text-indigo-50 text-sm leading-relaxed">{insight}</p>
                            </div>
                        ))}

                        {metrics.insights.length < 2 && (
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5" />
                                <p className="text-indigo-50 text-sm leading-relaxed">
                                    Your schedule is well-optimized. Keep up the good work!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
