/**
 * CSV Export Script
 * Generates CSV files containing all raw source data from the chat analysis
 *
 * Run with: node lib/exportCsv.js
 */

import { chatText } from './chatData.js';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './data';

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
            const cleanedUser = user.replace(/~ /g, '').trim();
            const imageMatch = message.match(/<attached: (.*?)>/);
            const imageFile = imageMatch ? imageMatch[1] : null;

            return { date, time, timestamp, user: cleanedUser, imageFile, rawMessage: message };
        }
    }
    return null;
}

function escapeCsvField(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function writeCsv(filename, headers, rows) {
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCsvField).join(','))
    ].join('\n');

    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, csvContent);
    console.log(`Created: ${filepath} (${rows.length} rows)`);
}

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

function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('Parsing chat data...\n');

    const lines = chatText.trim().split('\n');
    const messages = lines.map(parseLine).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);

    console.log(`Total messages parsed: ${messages.length}\n`);

    // Data structures for analysis
    const userCounts = {};
    const dayCounts = Array(7).fill(0);
    const hourCounts = Array(24).fill(0);
    const postsByDate = {};
    const postsByUser = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const postsByUserToday = {};
    const postsByUserThisWeek = {};

    // Process all messages
    messages.forEach(msg => {
        const msgDateStr = msg.timestamp.toISOString().slice(0, 10);

        userCounts[msg.user] = (userCounts[msg.user] || 0) + 1;
        dayCounts[msg.timestamp.getDay()]++;
        hourCounts[msg.timestamp.getHours()]++;
        postsByDate[msgDateStr] = (postsByDate[msgDateStr] || 0) + 1;

        if (!postsByUser[msg.user]) postsByUser[msg.user] = [];
        postsByUser[msg.user].push(msgDateStr);

        if (msgDateStr === todayStr) postsByUserToday[msg.user] = (postsByUserToday[msg.user] || 0) + 1;
        if (msg.timestamp >= startOfWeek) postsByUserThisWeek[msg.user] = (postsByUserThisWeek[msg.user] || 0) + 1;
    });

    // Calculate streaks
    const userStreaks = {};
    Object.keys(postsByUser).forEach(user => {
        const streakInfo = getStreakInfo(postsByUser[user]);
        userStreaks[user] = {
            longest: streakInfo.longest,
            startDate: streakInfo.longestStartDate,
            endDate: streakInfo.longestEndDate
        };
    });

    const allPostDates = Object.keys(postsByDate).sort();
    const overallStreakInfo = getStreakInfo(allPostDates);

    // Calculate current streak
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

    // 1. Raw Posts CSV
    console.log('Generating CSV files...\n');
    writeCsv('raw_posts.csv',
        ['post_id', 'date', 'time', 'datetime_iso', 'user', 'day_of_week', 'hour', 'image_file'],
        messages.map((msg, idx) => [
            idx + 1,
            msg.date,
            msg.time,
            msg.timestamp.toISOString(),
            msg.user,
            dayNames[msg.timestamp.getDay()],
            msg.timestamp.getHours(),
            msg.imageFile || ''
        ])
    );

    // 2. User Stats CSV
    const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
    writeCsv('user_stats.csv',
        ['rank', 'user', 'total_posts', 'longest_streak', 'streak_start', 'streak_end', 'posts_today', 'posts_this_week', 'first_post_date', 'last_post_date', 'unique_days_posted'],
        sortedUsers.map(([user, count], idx) => {
            const userDates = postsByUser[user].sort();
            const uniqueDays = new Set(userDates).size;
            return [
                idx + 1,
                user,
                count,
                userStreaks[user]?.longest || 0,
                userStreaks[user]?.startDate?.toISOString().slice(0, 10) || '',
                userStreaks[user]?.endDate?.toISOString().slice(0, 10) || '',
                postsByUserToday[user] || 0,
                postsByUserThisWeek[user] || 0,
                userDates[0],
                userDates[userDates.length - 1],
                uniqueDays
            ];
        })
    );

    // 3. Posts by Day of Week CSV
    const reorderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const reorderedCounts = [...dayCounts.slice(1), dayCounts[0]];
    writeCsv('posts_by_day.csv',
        ['day_of_week', 'day_number', 'post_count', 'percentage'],
        reorderedDays.map((day, idx) => [
            day,
            idx + 1,
            reorderedCounts[idx],
            ((reorderedCounts[idx] / messages.length) * 100).toFixed(2) + '%'
        ])
    );

    // 4. Posts by Hour CSV
    writeCsv('posts_by_hour.csv',
        ['hour', 'hour_label', 'post_count', 'percentage'],
        hourCounts.map((count, hour) => [
            hour,
            `${hour.toString().padStart(2, '0')}:00`,
            count,
            ((count / messages.length) * 100).toFixed(2) + '%'
        ])
    );

    // 5. Daily Posts CSV
    const sortedDates = Object.entries(postsByDate).sort((a, b) => a[0].localeCompare(b[0]));
    writeCsv('daily_posts.csv',
        ['date', 'day_of_week', 'post_count', 'cumulative_total'],
        sortedDates.map(([date, count], idx) => {
            const d = new Date(date);
            const cumulative = sortedDates.slice(0, idx + 1).reduce((sum, [_, c]) => sum + c, 0);
            return [
                date,
                dayNames[d.getDay()],
                count,
                cumulative
            ];
        })
    );

    // 6. Summary Stats CSV
    const recordDay = sortedDates.reduce((max, [date, count]) =>
        count > max.count ? { date, count } : max, { date: '', count: 0 });

    const topPosterAllTime = sortedUsers[0] || ['N/A', 0];
    const topPosterToday = Object.entries(postsByUserToday).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    const topPosterThisWeek = Object.entries(postsByUserThisWeek).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

    writeCsv('summary.csv',
        ['metric', 'value'],
        [
            ['total_posts', messages.length],
            ['total_users', Object.keys(userCounts).length],
            ['total_days_with_posts', allPostDates.length],
            ['first_post_date', allPostDates[0]],
            ['last_post_date', allPostDates[allPostDates.length - 1]],
            ['record_day_date', recordDay.date],
            ['record_day_count', recordDay.count],
            ['top_poster_all_time', topPosterAllTime[0]],
            ['top_poster_all_time_count', topPosterAllTime[1]],
            ['top_poster_today', topPosterToday[0]],
            ['top_poster_today_count', topPosterToday[1]],
            ['top_poster_this_week', topPosterThisWeek[0]],
            ['top_poster_this_week_count', topPosterThisWeek[1]],
            ['longest_overall_streak', overallStreakInfo.longest],
            ['longest_streak_start', overallStreakInfo.longestStartDate?.toISOString().slice(0, 10) || 'N/A'],
            ['longest_streak_end', overallStreakInfo.longestEndDate?.toISOString().slice(0, 10) || 'N/A'],
            ['current_streak', currentStreak],
            ['avg_posts_per_day', (messages.length / allPostDates.length).toFixed(2)],
            ['busiest_hour', hourCounts.indexOf(Math.max(...hourCounts))],
            ['busiest_day_of_week', reorderedDays[reorderedCounts.indexOf(Math.max(...reorderedCounts))]]
        ]
    );

    // 7. User Daily Activity CSV (which users posted on which days)
    const userDailyRows = [];
    Object.entries(postsByUser).forEach(([user, dates]) => {
        const dateCounts = {};
        dates.forEach(date => {
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        Object.entries(dateCounts).forEach(([date, count]) => {
            userDailyRows.push([user, date, count]);
        });
    });
    userDailyRows.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));

    writeCsv('user_daily_activity.csv',
        ['user', 'date', 'post_count'],
        userDailyRows
    );

    console.log('\nAll CSV files have been created in the ./data directory!');
}

main();
