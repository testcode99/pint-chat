import React, { useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const UserStatsModal = ({ user, userProfile, onClose, onCompare }) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!user || !userProfile) return null;

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    const dayChartData = {
        labels: dayLabels,
        datasets: [{
            label: 'Posts',
            data: userProfile.dayOfWeekDistribution,
            backgroundColor: 'rgba(255, 191, 0, 0.7)',
            borderColor: 'rgba(255, 215, 0, 1)',
            borderWidth: 1,
            borderRadius: 5,
        }],
    };

    const hourChartData = {
        labels: hourLabels,
        datasets: [{
            label: 'Posts',
            data: userProfile.hourDistribution,
            fill: true,
            backgroundColor: 'rgba(255, 191, 0, 0.3)',
            borderColor: 'rgba(255, 215, 0, 1)',
            tension: 0.4,
        }],
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
            legend: { display: false },
            tooltip: {
                backgroundColor: '#281E15',
                titleColor: '#FFBF00',
                bodyColor: '#F5F5DC',
                borderColor: '#FFBF00',
                borderWidth: 1,
            },
        },
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-beer-dark border-2 border-beer-amber/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-beer-dark border-b border-beer-amber/30 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-display text-beer-gold">{user}</h2>
                        <p className="text-beer-foam/70">Rank #{userProfile.rank} • {userProfile.totalPosts} posts ({userProfile.percentageOfTotal}%)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onCompare && (
                            <button
                                onClick={() => onCompare(user)}
                                className="px-4 py-2 bg-beer-amber/20 hover:bg-beer-amber/40 text-beer-gold rounded-lg transition-colors text-sm font-medium"
                            >
                                Compare
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-beer-foam/70 hover:text-beer-gold text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border border-beer-amber/30 rounded-lg p-3 text-center">
                            <p className="text-xs uppercase text-beer-amber/80 tracking-widest">Longest Streak</p>
                            <p className="text-2xl font-bold text-white">{userProfile.longestStreak.length} days</p>
                            {userProfile.longestStreak.startDate && (
                                <p className="text-xs text-beer-foam/60">{userProfile.longestStreak.startDate} - {userProfile.longestStreak.endDate}</p>
                            )}
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3 text-center">
                            <p className="text-xs uppercase text-beer-amber/80 tracking-widest">Days Active</p>
                            <p className="text-2xl font-bold text-white">{userProfile.uniqueDaysPosted}</p>
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3 text-center">
                            <p className="text-xs uppercase text-beer-amber/80 tracking-widest">Current Streak</p>
                            <p className="text-2xl font-bold text-white">{userProfile.currentStreak} days</p>
                        </div>
                    </div>

                    {/* Weekly Posting Rhythm */}
                    <div className="border border-beer-amber/30 rounded-lg p-4">
                        <h3 className="text-lg uppercase text-beer-amber tracking-widest mb-3 text-center">Weekly Posting Rhythm</h3>
                        <div className="h-48">
                            <Bar data={dayChartData} options={chartOptions} />
                        </div>
                        <p className="text-center text-sm text-beer-foam/60 mt-2">Busiest day: {userProfile.busiestDay}</p>
                    </div>

                    {/* Most Popular Hours */}
                    <div className="border border-beer-amber/30 rounded-lg p-4">
                        <h3 className="text-lg uppercase text-beer-amber tracking-widest mb-3 text-center">Most Popular Hours</h3>
                        <div className="h-48">
                            <Line data={hourChartData} options={chartOptions} />
                        </div>
                        <p className="text-center text-sm text-beer-foam/60 mt-2">Peak hour: {userProfile.busiestHour}:00</p>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="border border-beer-amber/30 rounded-lg p-3">
                            <p className="text-beer-amber/80">First Post</p>
                            <p className="text-white font-bold">{formatDisplayDate(userProfile.firstPostDate)}</p>
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3">
                            <p className="text-beer-amber/80">Last Post</p>
                            <p className="text-white font-bold">{formatDisplayDate(userProfile.lastPostDate)}</p>
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3">
                            <p className="text-beer-amber/80">Avg/Active Day</p>
                            <p className="text-white font-bold">{userProfile.avgPostsPerActiveDay}</p>
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3">
                            <p className="text-beer-amber/80">Posts Today</p>
                            <p className="text-white font-bold">{userProfile.postsToday}</p>
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3">
                            <p className="text-beer-amber/80">Posts This Week</p>
                            <p className="text-white font-bold">{userProfile.postsThisWeek}</p>
                        </div>
                        <div className="border border-beer-amber/30 rounded-lg p-3">
                            <p className="text-beer-amber/80">Posts This Month</p>
                            <p className="text-white font-bold">{userProfile.postsThisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatsModal;
