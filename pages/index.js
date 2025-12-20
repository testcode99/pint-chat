// The main page of the application that displays the dashboard.
import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { analyzeChat } from '../lib/parser';
import { chatText } from '../lib/chatData';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import LeaderboardList from '../components/LeaderboardList';
import PostsByDayChart from '../components/PostsByDayChart';
import PostsByHourChart from '../components/PostsByHourChart';
import Footer from '../components/Footer';
import UserStatsModal from '../components/UserStatsModal';
import UserCompareModal from '../components/UserCompareModal';

const NearestPlaces = dynamic(() => import('../components/NearestPlaces'), {
  ssr: false,
  loading: () => <p className="text-center text-beer-amber">Loading location services...</p>
});

const InfographicCard = ({ title, name, count }) => (
    <div className="border-2 border-beer-amber/50 rounded-lg p-4 text-center h-full flex flex-col justify-center">
        <p className="text-sm uppercase text-beer-amber/80 tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-white truncate my-1">{name}</p>
        <p className="text-xl text-beer-foam/80">{count} Posts</p>
    </div>
);

const StatCard = ({ title, value, subtitle }) => (
     <div className="border-2 border-beer-amber/50 rounded-lg p-4 text-center h-full flex flex-col justify-center">
        <p className="text-sm uppercase text-beer-amber/80 tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-white my-1">{value}</p>
        <p className="text-sm text-beer-foam/80">{subtitle}</p>
    </div>
);


export default function Home({ analysis }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareInitialUser, setCompareInitialUser] = useState(null);

  const handleCompareFromStats = (user) => {
    setSelectedUser(null);
    setCompareInitialUser(user);
    setShowCompareModal(true);
  };

  if (!analysis) {
    return <div>Error loading analysis. Please check your chat data.</div>;
  }

  return (
    <div>
      <Head>
        <title>1,000,000 Pints: Analysis</title>
        <meta name="description" content="WhatsApp Chat Analysis Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BackgroundSlideshow images={analysis.imageFiles} />

      <div className="relative z-10">
        <main className="p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center">
          <div className="w-full max-w-7xl mx-auto border-2 border-white/20 rounded-2xl shadow-2xl shadow-black/50 p-4 sm:p-6 md:p-8 space-y-6 mt-12 mb-12">
            
            <header className="text-center">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-beer-gold drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                1,000,000 Pints
              </h1>
              <p className="text-5xl md:text-7xl font-bold text-white mt-4 mb-2">
                {analysis.totalPosts.toLocaleString()}
              </p>
              <p className="text-lg text-beer-foam/80">
                posts tracked as of {analysis.latestTimestamp}
              </p>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-beer-gold">{analysis.totalUsers}</p>
                <p className="text-sm text-beer-foam/70">Total Users</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-beer-gold">{analysis.totalDays}</p>
                <p className="text-sm text-beer-foam/70">Days Tracked</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-beer-gold">{analysis.avgPostsPerDay}</p>
                <p className="text-sm text-beer-foam/70">Avg Posts/Day</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-beer-gold">{analysis.currentStreak}</p>
                <p className="text-sm text-beer-foam/70">Day Streak</p>
              </div>
            </div>
            
            <div className="border-2 border-white/20 rounded-xl p-4">
                <NearestPlaces />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfographicCard title="Top Poster (Today)" name={analysis.topPosterToday.name} count={analysis.topPosterToday.count} />
              <InfographicCard title="Top Poster (This Week)" name={analysis.topPosterThisWeek.name} count={analysis.topPosterThisWeek.count} />
              <InfographicCard title="Top Poster (This Month)" name={analysis.topPosterThisMonth.name} count={analysis.topPosterThisMonth.count} />
              <InfographicCard title="Top Poster (All Time)" name={analysis.topPosterAllTime.name} count={analysis.topPosterAllTime.count} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Most Prolific Day" value={analysis.recordDayCount} subtitle={`posts on ${analysis.recordDayDate}`} />
                <StatCard title="Longest Streak" value={`${analysis.longestOverallStreak.count} days`} subtitle={analysis.longestOverallStreak.dates} />
                <StatCard title="Active Since" value={new Date(analysis.firstPostDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} subtitle={`${analysis.totalDays} days of posting`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 sm:p-6 rounded-xl border-2 border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-display text-beer-amber">Leaderboard</h2>
                        <button
                            onClick={() => setShowCompareModal(true)}
                            className="bg-beer-amber text-beer-dark font-bold py-2 px-4 rounded-lg hover:bg-beer-gold transition-colors text-sm"
                        >
                            Compare Users
                        </button>
                    </div>
                    <p className="text-center text-beer-foam/50 text-sm mb-3">Click a user to view their stats</p>
                    <LeaderboardList data={analysis.leaderboardData} onUserClick={setSelectedUser} />
                </div>

                <div className="space-y-6">
                    <div className="p-4 sm:p-6 rounded-xl border-2 border-white/20">
                        <h2 className="text-2xl font-display text-center mb-4 text-beer-amber">Peak Times</h2>
                        <div className="h-80">
                            <PostsByHourChart data={analysis.postsByHourData} />
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 rounded-xl border-2 border-white/20">
                        <h2 className="text-2xl font-display text-center mb-4 text-beer-amber">Weekly Posting Rhythm</h2>
                        <div className="h-80">
                            <PostsByDayChart data={analysis.postsByDayData} />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* User Stats Modal */}
      {selectedUser && (
        <UserStatsModal
          user={selectedUser}
          userProfile={analysis.userProfiles[selectedUser]}
          onClose={() => setSelectedUser(null)}
          onCompare={handleCompareFromStats}
        />
      )}

      {/* User Compare Modal */}
      {showCompareModal && (
        <UserCompareModal
          userProfiles={analysis.userProfiles}
          leaderboardData={analysis.leaderboardData}
          onClose={() => {
            setShowCompareModal(false);
            setCompareInitialUser(null);
          }}
          initialUser={compareInitialUser}
        />
      )}
    </div>
  );
}

export async function getStaticProps() {
  const analysis = analyzeChat(chatText);
  return {
    props: {
      analysis,
    },
  };
}
