/**
 * This module contains the logic to parse the chat data.
 * Supports multiple WhatsApp export formats.
 */

// Phone number to name mapping (extracted from original chat export)
const phoneToNameMap = {
    "+353 83 816 3800": "James Castle",
    "+353 85 231 4105": "Conor",
    "+353 86 368 5404": "Liam Dunne",
    "+44 7305 124955": "Alfie",
    "+44 7305 794579": "Kalum Doohan",
    "+44 7307 020100": "Noah",
    "+44 7340 255626": "Tom Mulholland",
    "+44 7341 927225": "Oliver",
    "+44 7359 783807": "Brad",
    "+44 7368 901465": "James",
    "+44 7376 523733": "Martina",
    "+44 7376 944482": "Will",
    "+44 7377 999645": "Jake Rooney",
    "+44 7378 350684": "Tadhg",
    "+44 7384 980366": "Poppy Jones",
    "+44 7387 080331": "Jack",
    "+44 7387 228125": "Ellie",
    "+44 7400 542560": "Immie",
    "+44 7401 059535": "Frank",
    "+44 7402 796848": "Noah W",
    "+44 7412 242586": "Imo",
    "+44 7435 868726": "Will Anderson",
    "+44 7443 563919": "Floss Adcock",
    "+44 7443 568991": "Archie Richards",
    "+44 7444 114753": "Owen",
    "+44 7446 173517": "Justin Lewis",
    "+44 7446 532268": "Claire",
    "+44 7456 459297": "Jordan Newman",
    "+44 7462 563147": "Oscar Foot",
    "+44 7467 223098": "Georgie Doyle",
    "+44 7469 191224": "Charles Atkinson-Forber",
    "+44 7470 344146": "JP",
    "+44 7470 600918": "Benjy",
    "+44 7473 275286": "Matteo",
    "+44 7480 285349": "Milan",
    "+44 7482 227737": "Paul Heller",
    "+44 7482 698189": "William Burton",
    "+44 7483 246461": "Gareth Tainton",
    "+44 7484 548781": "Nick",
    "+44 7501 062670": "Isabelle",
    "+44 7502 353030": "Henry Stalder",
    "+44 7505 930963": "Ossian Warren",
    "+44 7506 586087": "Jack Brady",
    "+44 7511 056564": "Bertie Banham",
    "+44 7522 091612": "Rory Gee",
    "+44 7522 240701": "Thomas Hamilton",
    "+44 7523 724039": "Maeve",
    "+44 7530 856137": "Will H",
    "+44 7535 948117": "Arran",
    "+44 7540 352925": "Hannah S",
    "+44 7544 013739": "Noah P",
    "+44 7554 884263": "Ben K",
    "+44 7557 029599": "Ellis P",
    "+44 7557 048707": "Tom",
    "+44 7557 195497": "Theo Rodgers",
    "+44 7562 547756": "Jakey Breen",
    "+44 7572 124159": "Joe Allen",
    "+44 7583 378227": "Seann",
    "+44 7585 427636": "Will Sanderson",
    "+44 7590 619544": "Andrew Matthews",
    "+44 7591 038211": "Hannah D",
    "+44 7593 708903": "Gimesh R",
    "+44 7702 221437": "Rory Oakes",
    "+44 7703 471922": "Oli Pollock",
    "+44 7709 244161": "Conor H",
    "+44 7710 989122": "Clementine",
    "+44 7711 203160": "Ivo Pope",
    "+44 7712 243058": "Ted Purcell",
    "+44 7713 267849": "Toby Dalrymple",
    "+44 7713 819146": "Alice",
    "+44 7715 272410": "Mark Wiszk",
    "+44 7730 338505": "Max Evans",
    "+44 7730 772688": "Joe Daniels",
    "+44 7735 009015": "George",
    "+44 7736 800692": "Jonathan Mason-Gordon",
    "+44 7745 295664": "Tomm",
    "+44 7751 209040": "Luke",
    "+44 7757 700696": "Lauren",
    "+44 7758 752267": "Sam Ross",
    "+44 7759 366738": "Hadley",
    "+44 7760 307935": "Harry",
    "+44 7762 967976": "Oliver Wiszk",
    "+44 7767 745032": "Hannah P",
    "+44 7768 392467": "Sean",
    "+44 7769 276798": "Tegan Galbraith",
    "+44 7773 407979": "Scott",
    "+44 7788 253660": "Brett",
    "+44 7788 297492": "Mollie B",
    "+44 7794 088735": "Charlotte",
    "+44 7794 389019": "Erin Corless",
    "+44 7807 877084": "Dan",
    "+44 7809 230722": "Aidan Dike-Lawlor",
    "+44 7815 596631": "Dan D",
    "+44 7827 014791": "Rowena",
    "+44 7827 670149": "Anna",
    "+44 7827 777638": "Mia",
    "+44 7837 987321": "Ross Hurley",
    "+44 7841 958283": "Jas Slater",
    "+44 7850 295911": "James Ennis",
    "+44 7850 317298": "Toby Peach",
    "+44 7850 543224": "Sean M",
    "+44 7866 450159": "Evie Carrington",
    "+44 7867 474577": "Jay",
    "+44 7875 966948": "Sam Delaney",
    "+44 7888 607778": "James B",
    "+44 7896 980606": "Ben",
    "+44 7903 989126": "P",
    "+44 7907 752528": "Alice M",
    "+44 7908 057646": "Hannah Dike-Lawlor",
    "+44 7908 466091": "Jordan",
    "+44 7921 584225": "Natasha",
    "+44 7925 669407": "Edward Brackenbury",
    "+44 7936 059701": "David Dyer",
    "+44 7944 486824": "Matt Wane",
    "+44 7949 724818": "James L",
    "+44 7950 193119": "Henry S",
    "+44 7950 665167": "Vinnie",
    "+44 7954 114133": "James Kinch",
    "+44 7957 323896": "Iestyn Bates",
    "+44 7957 780129": "Maddie",
    "+44 7958 496126": "Lauren M",
    "+44 7960 499622": "Jess Westwood",
    "+44 7972 469774": "Bobby Burnand",
    "+44 7977 238993": "Charlie Hanson",
    "+56 9 8168 8180": "Floss A",
    "+64 210 820 1677": "Ollie",
};

function resolveUserName(rawUser) {
    // Clean the user string
    let user = rawUser.replace(/^~ /, '').trim();
    let phoneNumber = null;

    // Check if it's a phone number that we can map
    if (user.match(/^\+?\d[\d\s]+$/)) {
        const normalized = '+' + user.replace(/^\+/, '').trim();
        phoneNumber = normalized;
        if (phoneToNameMap[normalized]) {
            return { name: phoneToNameMap[normalized], phoneNumber };
        }
        // Return the phone number as the name if no mapping exists
        return { name: user, phoneNumber };
    }

    return { name: user, phoneNumber: null };
}

function parseLine(line) {
    // Format 1: [DD/MM/YYYY, HH:MM:SS] User: message (iOS export with brackets)
    const regex1 = /\[(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)/;
    // Format 2: DD/MM/YYYY, HH:MM - User: message (Android/newer export)
    const regex2 = /(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}) - ([^:]+): (.*)/;

    let match = line.match(regex1);
    let timeFormat = 'full';

    if (!match) {
        match = line.match(regex2);
        timeFormat = 'short';
    }

    if (match) {
        const [_, date, time, user, message] = match;

        // Check for media/image posts - support multiple formats
        const hasImage = message.includes('image omitted') ||
                        message.includes('<Media omitted>') ||
                        message.includes('<attached:');

        const isJustNumber = /^\d+$/.test(message.trim());

        if (hasImage && !isJustNumber) {
            const [day, month, year] = date.split('/');
            const timeStr = timeFormat === 'full' ? time : `${time}:00`;
            const timestamp = new Date(`${year}-${month}-${day}T${timeStr}`);
            const { name: resolvedUser, phoneNumber } = resolveUserName(user);
            const imageMatch = message.match(/<attached: (.*?)>/);
            const imageFile = imageMatch ? imageMatch[1] : null;

            return { timestamp, user: resolvedUser, phoneNumber, imageFile };
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
    const userPhoneNumbers = {};  // Track phone numbers per user
    const dayCounts = Array(7).fill(0);
    const hourCounts = Array(24).fill(0);
    let imageFiles = [];
    const postsByDate = {};
    const postsByUser = {};
    const userHourCounts = {};
    const userDayCounts = {};

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const postsByUserToday = {};
    const postsByUserThisWeek = {};
    const postsByUserThisMonth = {};

    messages.forEach(msg => {
        const msgDateStr = msg.timestamp.toISOString().slice(0, 10);
        const hour = msg.timestamp.getHours();
        const day = msg.timestamp.getDay();

        userCounts[msg.user] = (userCounts[msg.user] || 0) + 1;

        // Track phone number for this user (keep first one seen)
        if (msg.phoneNumber && !userPhoneNumbers[msg.user]) {
            userPhoneNumbers[msg.user] = msg.phoneNumber;
        }

        dayCounts[day]++;
        hourCounts[hour]++;
        if (msg.imageFile) imageFiles.push(msg.imageFile);
        postsByDate[msgDateStr] = (postsByDate[msgDateStr] || 0) + 1;

        if (!postsByUser[msg.user]) postsByUser[msg.user] = [];
        postsByUser[msg.user].push(msgDateStr);

        // Track per-user hour and day distributions
        if (!userHourCounts[msg.user]) userHourCounts[msg.user] = Array(24).fill(0);
        if (!userDayCounts[msg.user]) userDayCounts[msg.user] = Array(7).fill(0);
        userHourCounts[msg.user][hour]++;
        userDayCounts[msg.user][day]++;

        if (msgDateStr === todayStr) postsByUserToday[msg.user] = (postsByUserToday[msg.user] || 0) + 1;
        if (msg.timestamp >= startOfWeek) postsByUserThisWeek[msg.user] = (postsByUserThisWeek[msg.user] || 0) + 1;
        if (msg.timestamp >= startOfMonth) postsByUserThisMonth[msg.user] = (postsByUserThisMonth[msg.user] || 0) + 1;
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

    const allPostDates = Object.keys(postsByDate).sort();
    const overallStreakInfo = getStreakInfo(allPostDates);

    const userStreaks = {};
    Object.keys(postsByUser).forEach(user => {
        userStreaks[user] = getStreakInfo(postsByUser[user]).longest;
    });

    let currentStreak = 0;
    const sortedPostDates = allPostDates.sort();
    const lastPostDate = new Date(sortedPostDates[sortedPostDates.length - 1]);
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
    const topPosterThisMonth = getTopPoster(postsByUserThisMonth);

    imageFiles = [...new Set(imageFiles)];
    const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
    const reorderedDayCounts = [...dayCounts.slice(1), dayCounts[0]];

    // Calculate additional stats
    const totalUsers = Object.keys(userCounts).length;
    const activeUsers = Object.values(userCounts).filter(count => count >= 1).length;
    const totalDays = allPostDates.length;
    const avgPostsPerDay = totalDays > 0 ? (messages.length / totalDays).toFixed(1) : 0;
    const firstPostDate = allPostDates[0];
    const lastPostDateStr = allPostDates[allPostDates.length - 1];

    // Build detailed user profiles
    const userProfiles = {};

    sortedUsers.forEach(([name, count], index) => {
        const userDates = postsByUser[name].sort();
        const uniqueDates = [...new Set(userDates)];
        const streakInfo = getStreakInfo(userDates);

        // Calculate current streak for this user
        let userCurrentStreak = 0;
        if (uniqueDates.length > 0) {
            const lastUserPostDate = new Date(uniqueDates[uniqueDates.length - 1]);
            const userDiffDays = Math.floor((new Date(todayStr).getTime() - lastUserPostDate.getTime()) / (1000 * 60 * 60 * 24));
            if (userDiffDays <= 1) {
                let streakDate = new Date(lastUserPostDate);
                const userDateSet = new Set(uniqueDates);
                while (userDateSet.has(streakDate.toISOString().slice(0, 10))) {
                    userCurrentStreak++;
                    streakDate.setDate(streakDate.getDate() - 1);
                }
            }
        }

        // Get per-user distributions (reorder days to start with Monday)
        const userDayData = userDayCounts[name] || Array(7).fill(0);
        const reorderedUserDays = [...userDayData.slice(1), userDayData[0]];
        const userHourData = userHourCounts[name] || Array(24).fill(0);

        // Find busiest hour and day
        const busiestHour = userHourData.indexOf(Math.max(...userHourData));
        const busiestDayIndex = reorderedUserDays.indexOf(Math.max(...reorderedUserDays));
        const busiestDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][busiestDayIndex];

        // Average posts per active day
        const avgPostsPerActiveDay = uniqueDates.length > 0 ? (count / uniqueDates.length).toFixed(1) : 0;

        userProfiles[name] = {
            rank: index + 1,
            totalPosts: count,
            phoneNumber: userPhoneNumbers[name] || null,
            percentageOfTotal: ((count / messages.length) * 100).toFixed(1),
            firstPostDate: uniqueDates[0],
            lastPostDate: uniqueDates[uniqueDates.length - 1],
            uniqueDaysPosted: uniqueDates.length,
            avgPostsPerActiveDay,
            longestStreak: {
                length: streakInfo.longest,
                startDate: streakInfo.longestStartDate ? formatDate(streakInfo.longestStartDate) : null,
                endDate: streakInfo.longestEndDate ? formatDate(streakInfo.longestEndDate) : null,
            },
            currentStreak: userCurrentStreak,
            postsToday: postsByUserToday[name] || 0,
            postsThisWeek: postsByUserThisWeek[name] || 0,
            postsThisMonth: postsByUserThisMonth[name] || 0,
            hourDistribution: userHourData,
            dayOfWeekDistribution: reorderedUserDays,
            busiestHour,
            busiestDay,
        };
    });

    return {
        totalPosts: messages.length,
        totalUsers,
        activeUsers,
        totalDays,
        avgPostsPerDay,
        firstPostDate,
        lastPostDate: lastPostDateStr,
        latestTimestamp: latestTimestampStr,
        leaderboardData: sortedUsers.map(([name, count]) => ({ name, count, streak: userStreaks[name] || 0, phoneNumber: userPhoneNumbers[name] || null })),
        postsByDayData: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: reorderedDayCounts },
        postsByHourData: { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data: hourCounts },
        imageFiles,
        recordDayCount,
        recordDayDate,
        topPosterAllTime,
        topPosterToday,
        topPosterThisWeek,
        topPosterThisMonth,
        longestOverallStreak: {
            count: overallStreakInfo.longest,
            dates: overallStreakInfo.longestStartDate ? `${formatDate(overallStreakInfo.longestStartDate)} - ${formatDate(overallStreakInfo.longestEndDate)}` : 'N/A'
        },
        currentStreak,
        userProfiles,
    };
}
