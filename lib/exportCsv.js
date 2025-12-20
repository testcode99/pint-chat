/**
 * CSV Export Script
 * Generates CSV files containing all raw source data from the chat analysis
 *
 * Run with: node lib/exportCsv.js
 */

import { chatText } from './chatData.js';
import { analyzeChat } from './parser.js';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './data';

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

function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('Analyzing chat data...\n');

    const analysis = analyzeChat(chatText);

    if (!analysis) {
        console.error('Failed to analyze chat data');
        return;
    }

    console.log(`Total posts: ${analysis.totalPosts}`);
    console.log(`Total users: ${analysis.totalUsers}\n`);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const reorderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // 1. User Stats CSV
    console.log('Generating CSV files...\n');
    const userProfiles = Object.entries(analysis.userProfiles);
    writeCsv('user_stats.csv',
        ['rank', 'user', 'total_posts', 'percentage_of_total', 'longest_streak', 'streak_start', 'streak_end', 'current_streak', 'posts_today', 'posts_this_week', 'posts_this_month', 'first_post_date', 'last_post_date', 'unique_days_posted', 'busiest_hour', 'busiest_day'],
        userProfiles.map(([user, profile]) => [
            profile.rank,
            user,
            profile.totalPosts,
            profile.percentageOfTotal,
            profile.longestStreak.length,
            profile.longestStreak.startDate || '',
            profile.longestStreak.endDate || '',
            profile.currentStreak,
            profile.postsToday,
            profile.postsThisWeek,
            profile.postsThisMonth,
            profile.firstPostDate,
            profile.lastPostDate,
            profile.uniqueDaysPosted,
            profile.busiestHour,
            profile.busiestDay
        ]).sort((a, b) => a[0] - b[0])
    );

    // 2. Posts by Day of Week CSV
    writeCsv('posts_by_day.csv',
        ['day_of_week', 'day_number', 'post_count', 'percentage'],
        reorderedDays.map((day, idx) => [
            day,
            idx + 1,
            analysis.postsByDayData.data[idx],
            ((analysis.postsByDayData.data[idx] / analysis.totalPosts) * 100).toFixed(2) + '%'
        ])
    );

    // 3. Posts by Hour CSV
    writeCsv('posts_by_hour.csv',
        ['hour', 'hour_label', 'post_count', 'percentage'],
        analysis.postsByHourData.data.map((count, hour) => [
            hour,
            `${hour.toString().padStart(2, '0')}:00`,
            count,
            ((count / analysis.totalPosts) * 100).toFixed(2) + '%'
        ])
    );

    // 4. Summary Stats CSV
    writeCsv('summary.csv',
        ['metric', 'value'],
        [
            ['total_posts', analysis.totalPosts],
            ['total_users', analysis.totalUsers],
            ['active_users', analysis.activeUsers],
            ['total_days_with_posts', analysis.totalDays],
            ['avg_posts_per_day', analysis.avgPostsPerDay],
            ['first_post_date', analysis.firstPostDate],
            ['last_post_date', analysis.lastPostDate],
            ['latest_timestamp', analysis.latestTimestamp],
            ['record_day_date', analysis.recordDayDate],
            ['record_day_count', analysis.recordDayCount],
            ['current_streak', analysis.currentStreak],
            ['longest_overall_streak', analysis.longestStreak],
            ['top_poster_all_time', analysis.topPosterAllTime.name],
            ['top_poster_all_time_count', analysis.topPosterAllTime.count],
            ['top_poster_today', analysis.topPosterToday.name],
            ['top_poster_today_count', analysis.topPosterToday.count],
            ['top_poster_this_week', analysis.topPosterThisWeek.name],
            ['top_poster_this_week_count', analysis.topPosterThisWeek.count],
            ['top_poster_this_month', analysis.topPosterThisMonth.name],
            ['top_poster_this_month_count', analysis.topPosterThisMonth.count]
        ]
    );

    // 5. Leaderboard CSV (simplified user ranking)
    writeCsv('leaderboard.csv',
        ['rank', 'user', 'posts', 'streak'],
        analysis.leaderboardData.map((user, idx) => [
            idx + 1,
            user.name,
            user.count,
            user.streak
        ])
    );

    // 6. User Hour Distribution CSV
    const userHourRows = [];
    Object.entries(analysis.userProfiles).forEach(([user, profile]) => {
        profile.hourDistribution.forEach((count, hour) => {
            if (count > 0) {
                userHourRows.push([user, hour, `${hour.toString().padStart(2, '0')}:00`, count]);
            }
        });
    });
    writeCsv('user_hour_distribution.csv',
        ['user', 'hour', 'hour_label', 'post_count'],
        userHourRows.sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1])
    );

    // 7. User Day Distribution CSV
    const userDayRows = [];
    Object.entries(analysis.userProfiles).forEach(([user, profile]) => {
        profile.dayOfWeekDistribution.forEach((count, dayIdx) => {
            if (count > 0) {
                userDayRows.push([user, reorderedDays[dayIdx], dayIdx + 1, count]);
            }
        });
    });
    writeCsv('user_day_distribution.csv',
        ['user', 'day_of_week', 'day_number', 'post_count'],
        userDayRows.sort((a, b) => a[0].localeCompare(b[0]) || a[2] - b[2])
    );

    console.log('\nAll CSV files have been created in the ./data directory!');
}

main();
