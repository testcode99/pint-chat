import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const UserCompareModal = ({ userProfiles, leaderboardData, onClose, initialUser }) => {
    const [user1, setUser1] = useState(initialUser || '');
    const [user2, setUser2] = useState('');

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const userNames = leaderboardData.map(u => u.name);
    const profile1 = user1 ? userProfiles[user1] : null;
    const profile2 = user2 ? userProfiles[user2] : null;

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    // Colors for the two users
    const user1Color = 'rgba(255, 191, 0, 0.8)'; // Gold/Amber
    const user1ColorLight = 'rgba(255, 191, 0, 0.3)';
    const user2Color = 'rgba(59, 130, 246, 0.8)'; // Blue
    const user2ColorLight = 'rgba(59, 130, 246, 0.3)';

    const dayChartData = {
        labels: dayLabels,
        datasets: [
            ...(profile1 ? [{
                label: user1,
                data: profile1.dayOfWeekDistribution,
                backgroundColor: user1Color,
                borderColor: 'rgba(255, 215, 0, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }] : []),
            ...(profile2 ? [{
                label: user2,
                data: profile2.dayOfWeekDistribution,
                backgroundColor: user2Color,
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }] : []),
        ],
    };

    const hourChartData = {
        labels: hourLabels,
        datasets: [
            ...(profile1 ? [{
                label: user1,
                data: profile1.hourDistribution,
                fill: true,
                backgroundColor: user1ColorLight,
                borderColor: 'rgba(255, 215, 0, 1)',
                tension: 0.4,
            }] : []),
            ...(profile2 ? [{
                label: user2,
                data: profile2.hourDistribution,
                fill: true,
                backgroundColor: user2ColorLight,
                borderColor: 'rgba(59, 130, 246, 1)',
                tension: 0.4,
            }] : []),
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#F5F5DC', precision: 0 },
                grid: { color: 'rgba(245, 245, 220, 0.2)' },
            },
            x: {
                ticks: { color: '#F5F5DC', maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 12 },
                grid: { display: false },
            },
        },
        plugins: {
            legend: {
                display: true,
                labels: { color: '#F5F5DC' },
            },
            tooltip: {
                backgroundColor: '#281E15',
                titleColor: '#FFBF00',
                bodyColor: '#F5F5DC',
                borderColor: '#FFBF00',
                borderWidth: 1,
            },
        },
    };

    const CompareBar = ({ label, value1, value2, max, num1, num2 }) => {
        // Use num1/num2 if provided (for string display values), otherwise use value1/value2
        const calcVal1 = num1 !== undefined ? num1 : value1;
        const calcVal2 = num2 !== undefined ? num2 : value2;
        const pct1 = max > 0 ? (calcVal1 / max) * 100 : 0;
        const pct2 = max > 0 ? (calcVal2 / max) * 100 : 0;
        return (
            <div className="space-y-1">
                <div className="flex justify-between text-sm text-beer-foam/70">
                    <span>{value1}</span>
                    <span className="text-beer-amber">{label}</span>
                    <span>{value2}</span>
                </div>
                <div className="flex gap-1 h-3">
                    <div className="flex-1 flex justify-end">
                        <div
                            className="h-full bg-gradient-to-l from-beer-gold to-beer-amber rounded-l"
                            style={{ width: `${pct1}%` }}
                        />
                    </div>
                    <div className="flex-1">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-r"
                            style={{ width: `${pct2}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-beer-dark border-2 border-beer-amber/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-beer-dark border-b border-beer-amber/30 p-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-display text-beer-gold">Compare Users</h2>
                    <button
                        onClick={onClose}
                        className="text-beer-foam/70 hover:text-beer-gold text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* User Selectors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-beer-amber mb-2">Select First User</label>
                            <select
                                value={user1}
                                onChange={(e) => setUser1(e.target.value)}
                                className="w-full bg-beer-dark border-2 border-beer-amber/50 rounded-lg p-3 text-white focus:border-beer-gold focus:outline-none"
                            >
                                <option value="">Choose a user...</option>
                                {userNames.filter(n => n !== user2).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-beer-amber mb-2">Select Second User</label>
                            <select
                                value={user2}
                                onChange={(e) => setUser2(e.target.value)}
                                className="w-full bg-beer-dark border-2 border-beer-amber/50 rounded-lg p-3 text-white focus:border-beer-gold focus:outline-none"
                            >
                                <option value="">Choose a user...</option>
                                {userNames.filter(n => n !== user1).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Comparison Content */}
                    {profile1 && profile2 && (
                        <>
                            {/* User Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-beer-amber/50 rounded-xl p-4 text-center">
                                    <h3 className="text-xl font-bold text-beer-gold truncate">{user1}</h3>
                                    <p className="text-beer-foam/70">Rank #{profile1.rank}</p>
                                </div>
                                <div className="border-2 border-blue-400/50 rounded-xl p-4 text-center">
                                    <h3 className="text-xl font-bold text-blue-400 truncate">{user2}</h3>
                                    <p className="text-beer-foam/70">Rank #{profile2.rank}</p>
                                </div>
                            </div>

                            {/* Stats Comparison Bars */}
                            <div className="border border-beer-amber/30 rounded-lg p-4 space-y-4">
                                <CompareBar
                                    label="Total Posts"
                                    value1={profile1.totalPosts}
                                    value2={profile2.totalPosts}
                                    max={Math.max(profile1.totalPosts, profile2.totalPosts)}
                                />
                                <CompareBar
                                    label="Longest Streak"
                                    value1={`${profile1.longestStreak.length}d`}
                                    value2={`${profile2.longestStreak.length}d`}
                                    num1={profile1.longestStreak.length}
                                    num2={profile2.longestStreak.length}
                                    max={Math.max(profile1.longestStreak.length, profile2.longestStreak.length)}
                                />
                                <CompareBar
                                    label="Days Active"
                                    value1={profile1.uniqueDaysPosted}
                                    value2={profile2.uniqueDaysPosted}
                                    max={Math.max(profile1.uniqueDaysPosted, profile2.uniqueDaysPosted)}
                                />
                                <CompareBar
                                    label="Current Streak"
                                    value1={`${profile1.currentStreak}d`}
                                    value2={`${profile2.currentStreak}d`}
                                    num1={profile1.currentStreak}
                                    num2={profile2.currentStreak}
                                    max={Math.max(profile1.currentStreak, profile2.currentStreak)}
                                />
                                <CompareBar
                                    label="Posts This Month"
                                    value1={profile1.postsThisMonth}
                                    value2={profile2.postsThisMonth}
                                    max={Math.max(profile1.postsThisMonth, profile2.postsThisMonth)}
                                />
                            </div>

                            {/* Weekly Posting Rhythm - Overlaid */}
                            <div className="border border-beer-amber/30 rounded-lg p-4">
                                <h3 className="text-lg uppercase text-beer-amber tracking-widest mb-3 text-center">Weekly Posting Rhythm</h3>
                                <div className="h-56">
                                    <Bar data={dayChartData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Most Popular Hours - Overlaid */}
                            <div className="border border-beer-amber/30 rounded-lg p-4">
                                <h3 className="text-lg uppercase text-beer-amber tracking-widest mb-3 text-center">Most Popular Hours</h3>
                                <div className="h-56">
                                    <Line data={hourChartData} options={chartOptions} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {(!profile1 || !profile2) && (
                        <div className="text-center py-12 text-beer-foam/50">
                            <p className="text-lg">Select two users above to compare their stats</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCompareModal;
