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

/**
 * Finds the top poster from a counts object.
 * @param {object} counts - An object with users as keys and post counts as values.
 * @returns {{name: string, count: number}} - The top poster's name and their count.
 */
function getTopPoster(counts) {
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) {
        return { name: 'N/A', count: 0 };
    }
    return { name: sorted[0][0], count: sorted[0][1] };
}

export function analyzeChat(text) {
    const lines = text.trim().split('\n');
    const messages = lines.map(parseLine).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);

    if (messages.length === 0) return null;

    const userCounts = {};
    const dayCounts = Array(7).fill(0); // 0 = Sunday, 1 = Monday ...
    const hourCounts = Array(24).fill(0);
    let imageFiles = [];
    const postsByDate = {};

    // --- UPDATED LOGIC FOR MONDAY START ---
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    // Adjust day for Monday start: (0 for Sun becomes 7, so Monday is 1)
    const dayOfWeek = now.getDay() || 7; 
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0); // Set to the beginning of Monday

    const postsByUserToday = {};
    const postsByUserThisWeek = {};
    
    messages.forEach(msg => {
        const msgDateStr = msg.timestamp.toISOString().slice(0, 10);

        // All-time stats
        userCounts[msg.user] = (userCounts[msg.user] || 0) + 1;
        postsByDate[msgDateStr] = (postsByDate[msgDateStr] || 0) + 1;
        dayCounts[msg.timestamp.getDay()]++;
        hourCounts[msg.timestamp.getHours()]++;
        if (msg.imageFile) imageFiles.push(msg.imageFile);

        // Today's stats
        if (msgDateStr === todayStr) {
            postsByUserToday[msg.user] = (postsByUserToday[msg.user] || 0) + 1;
        }

        // This week's stats
        if (msg.timestamp >= startOfWeek) {
            postsByUserThisWeek[msg.user] = (postsByUserThisWeek[msg.user] || 0) + 1;
        }
    });
    
    const latestTimestamp = new Date(messages[messages.length - 1].timestamp).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });


    let recordDayCount = 0;
    let recordDayDate = 'N/A';
    Object.entries(postsByDate).forEach(([date, count]) => {
        if (count > recordDayCount) {
            recordDayCount = count;
            recordDayDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    });

    const topPosterAllTime = getTopPoster(userCounts);
    const topPosterToday = getTopPoster(postsByUserToday);
    const topPosterThisWeek = getTopPoster(postsByUserThisWeek);

    imageFiles = [...new Set(imageFiles)];
    const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
    
    // Reorder dayCounts array to start with Monday
    const reorderedDayCounts = [...dayCounts.slice(1), dayCounts[0]];

    return {
        totalPosts: messages.length,
        latestTimestamp,
        leaderboardData: {
            labels: sortedUsers.map(user => user[0]),
            data: sortedUsers.map(user => user[1]),
        },
        postsByDayData: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Labels updated
            data: reorderedDayCounts, // Data reordered to match labels
        },
        postsByHourData: {
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            data: hourCounts,
        },
        imageFiles,
        recordDayCount,
        recordDayDate,
        topPosterAllTime,
        topPosterToday,
        topPosterThisWeek,
    };
}
