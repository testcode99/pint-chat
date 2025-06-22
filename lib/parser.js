/**
 * This module contains the logic to parse the chat data.
 */

function parseLine(line) {
    const regex = /\[(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)/;
    const match = line.match(regex);

    if (match) {
        const [_, date, time, user, message] = match;
        const hasImage = message.includes('‎image omitted') || message.includes('<attached:');
        const isJustNumber = /^\d+$/.test(message.trim());

        if (hasImage && !isJustNumber) {
            const [day, month, year] = date.split('/');
            const timestamp = new Date(`${year}-${month}-${day}T${time}`);
            const cleanedUser = user.replace(/~ /g, '').trim();
            const imageMatch = message.match(/<attached: (.*?)>/);
            const imageFile = imageMatch ? imageMatch[1] : null;

            return { timestamp, user: cleanedUser, imageFile };
        }
    }
    return null;
}

function getTopPoster(counts) {
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) return { name: 'N/A', count: 0 };
    return { name: sorted[0][0], count: sorted[0][1] };
}

const formatDate = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function getStreakInfo(dates) {
    if (dates.length === 0) return { longest: 0, longestStartDate: null, longestEndDate: null };

    const sortedDates = [...new Set(dates)].map(d => new Date(d)).sort((a, b) => a - b);
    
    if (sortedDates.length === 1) return { longest: 1, longestStartDate: sortedDates[0], longestEndDate: sortedDates[0] };
    
    let longest = 1, current = 1;
    let longestStart = sortedDates[0], longestEnd = sortedDates[0];
    let currentStart = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
        const diff = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            current++;
        } else {
            if (current > longest) {
                longest = current;
                longestStart = currentStart;
                longestEnd = sortedDates[i-1];
            }
            current = 1;
            currentStart = sortedDates[i];
        }
    }
    
    if (current > longest) {
        longest = current;
        longestStart = currentStart;
        longestEnd = sortedDates[sortedDates.length - 1];
    }
    
    return { longest, longestStartDate: longestStart, longestEndDate: longestEnd };
}

export function analyzeChat(text) {
    const lines = text.trim().split('\n');
    const messages = lines.map(parseLine).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);

    if (messages.length === 0) return null;
    
    const userCounts = {};
    const dayCounts = Array(7).fill(0);
    const hourCounts = Array(24).fill(0);
    let imageFiles = [];
    const postsByDate = {};
    const postsByUser = {};

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const postsByUserToday = {};
    const postsByUserThisWeek = {};
    
    messages.forEach(msg => {
        const msgDateStr = msg.timestamp.toISOString().slice(0, 10);
        
        userCounts[msg.user] = (userCounts[msg.user] || 0) + 1;
        dayCounts[msg.timestamp.getDay()]++;
        hourCounts[msg.timestamp.getHours()]++;
        if (msg.imageFile) imageFiles.push(msg.imageFile);
        postsByDate[msgDateStr] = (postsByDate[msgDateStr] || 0) + 1;

        if (!postsByUser[msg.user]) postsByUser[msg.user] = [];
        postsByUser[msg.user].push(msgDateStr);

        if (msgDateStr === todayStr) postsByUserToday[msg.user] = (postsByUserToday[msg.user] || 0) + 1;
        if (msg.timestamp >= startOfWeek) postsByUserThisWeek[msg.user] = (postsByUserThisWeek[msg.user] || 0) + 1;
    });

    const latestTimestampStr = new Date(messages[messages.length - 1].timestamp).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    let recordDayCount = 0;
    let recordDayDate = 'N/A';
    Object.entries(postsByDate).forEach(([date, count]) => {
        if (count > recordDayCount) {
            recordDayCount = count;
            recordDayDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    });

    const allPostDates = Object.keys(postsByDate);
    const overallStreakInfo = getStreakInfo(allPostDates);
    
    const userStreaks = {};
    Object.keys(postsByUser).forEach(user => {
        userStreaks[user] = getStreakInfo(postsByUser[user]).longest;
    });
    
    let currentStreak = 0;
    const lastPostDate = new Date(allPostDates[allPostDates.length - 1]);
    const diffDays = Math.floor((new Date(todayStr).getTime() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
        let streakDate = new Date(lastPostDate);
        while (postsByDate[streakDate.toISOString().slice(0, 10)]) {
            currentStreak++;
            streakDate.setDate(streakDate.getDate() - 1);
        }
    }

    const topPosterAllTime = getTopPoster(userCounts);
    const topPosterToday = getTopPoster(postsByUserToday);
    const topPosterThisWeek = getTopPoster(postsByUserThisWeek);

    imageFiles = [...new Set(imageFiles)];
    const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
    const reorderedDayCounts = [...dayCounts.slice(1), dayCounts[0]];

    return {
        totalPosts: messages.length,
        latestTimestamp: latestTimestampStr,
        leaderboardData: sortedUsers.map(([name, count]) => ({ name, count, streak: userStreaks[name] || 0 })),
        postsByDayData: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: reorderedDayCounts },
        postsByHourData: { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data: hourCounts },
        imageFiles,
        recordDayCount,
        recordDayDate,
        topPosterAllTime,
        topPosterToday,
        topPosterThisWeek,
        longestOverallStreak: {
            count: overallStreakInfo.longest,
            dates: overallStreakInfo.longestStartDate ? `${formatDate(overallStreakInfo.longestStartDate)} - ${formatDate(overallStreakInfo.longestEndDate)}` : 'N/A'
        },
        currentStreak,
    };
}
