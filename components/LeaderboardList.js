// A component to display a detailed list-based leaderboard.
import React from 'react';

const LeaderboardList = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center">No data to display.</p>;
    }

    return (
        <div className="space-y-3">
            {data.map((user, index) => (
                <div key={user.name} className="flex items-center text-white p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-beer-amber w-8 text-center">{index + 1}</div>
                    <div className="flex-grow pl-3">
                        <p className="font-bold truncate">{user.name}</p>
                        <p className="text-sm text-beer-foam/70">Longest Streak: {user.streak} days</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className="text-xl font-bold">{user.count}</p>
                        <p className="text-xs uppercase text-beer-amber/80">Posts</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LeaderboardList;
