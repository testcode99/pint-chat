// The main page of the application that displays the dashboard.
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { analyzeChat } from '../lib/parser';
import { chatText } from '../lib/chatData';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import LeaderboardList from '../components/LeaderboardList';
import PostsByDayChart from '../components/PostsByDayChart';
import PostsByHourChart from '../components/PostsByHourChart';
import Footer from '../components/Footer';

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
              <p className="text-lg text-beer-foam/80 mt-2">
                As of: {analysis.latestTimestamp}
              </p>
            </header>
            
            <div className="border-2 border-white/20 rounded-xl p-4">
                <NearestPlaces />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfographicCard title="Top Poster (Today)" name={analysis.topPosterToday.name} count={analysis.topPosterToday.count} />
              <InfographicCard title="Top Poster (This Week)" name={analysis.topPosterThisWeek.name} count={analysis.topPosterThisWeek.count} />
              <StatCard title="Most Prolific Day" value={analysis.recordDayCount} subtitle={`posts on ${analysis.recordDayDate}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Longest Overall Streak" value={analysis.longestOverallStreak.count} subtitle={analysis.longestOverallStreak.dates} />
                <StatCard title="Current Group Streak" value={analysis.currentStreak} subtitle={analysis.currentStreak === 1 ? 'day' : 'consecutive days'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 sm:p-6 rounded-xl border-2 border-white/20">
                    <h2 className="text-2xl font-display text-center mb-4 text-beer-amber">Leaderboard</h2>
                    <LeaderboardList data={analysis.leaderboardData} />
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
