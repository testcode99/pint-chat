// A component to display a detailed list-based leaderboard with animated bars.
import React from 'react';

const AnimatedBar = ({ percentage }) => {
    const bubbles = Array.from({ length: 15 });

    return (
        <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-beer-gold to-beer-amber overflow-hidden rounded-lg transition-all duration-1000"
            style={{ width: `${percentage}%` }} // <-- Changed from height to width
        >
            <div className="absolute inset-0">
                {bubbles.map((_, i) => (
                    <span 
                        key={i}
                        className="absolute block w-2 h-2 bg-beer-foam/50 rounded-full"
                        style={{
                            '--translateX': `${Math.random() * 20 - 10}px`, // Custom property for varied horizontal movement
                            left: `${Math.random() * 100}%`,
                            animation: `rise ${2 + Math.random() * 4}s linear ${Math.random() * 4}s infinite`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const LeaderboardList = ({ data, onUserClick }) => {
    if (!data || data.length === 0) {
        return <p className="text-center">No data to display.</p>;
    }

    const topPostCount = data[0].count;

    return (
        <div className="space-y-3">
            {data.map((user, index) => {
                const percentage = topPostCount > 0 ? (user.count / topPostCount) * 100 : 0;

                return (
                    <div
                        key={user.name}
                        className="relative flex items-center text-white p-2 rounded-lg bg-white/5 overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => onUserClick && onUserClick(user.name)}
                    >
                        <AnimatedBar percentage={percentage} />
                        <div className="relative z-10 flex items-center w-full">
                             <div className="text-lg font-black text-white/50 w-8 text-center flex-shrink-0">{index + 1}</div>
                             <div className="flex-grow pl-3">
                                 <p className="font-bold truncate">{user.name}</p>
                                 <p className="text-sm text-beer-foam/70">
                                     {user.phoneNumber && <span className="text-beer-foam/50">{user.phoneNumber} • </span>}
                                     Longest Streak: {user.streak} days
                                 </p>
                             </div>
                             <div className="flex-shrink-0 text-right">
                                 <p className="text-xl font-bold">{user.count}</p>
                                 <p className="text-xs uppercase text-beer-amber/80">Posts</p>
                             </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default LeaderboardList;
