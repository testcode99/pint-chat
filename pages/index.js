// The main page of the application that displays the dashboard.
import Head from 'next/head';
import { analyzeChat } from '../lib/parser';
import { chatText } from '../lib/chatData';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import LeaderboardChart from '../components/LeaderboardChart';
import PostsByDayChart from '../components/PostsByDayChart';
import PostsByHourChart from '../components/PostsByHourChart';
import Footer from '../components/Footer';

// A simple component for the infographic cards
const InfographicCard = ({ title, name, count }) => (
    <div className="border-2 border-beer-amber/50 rounded-lg p-4 text-center h-full flex flex-col justify-center">
        <p className="text-sm uppercase text-beer-amber/80 tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-white truncate my-1">{name}</p>
        <p className="text-xl text-beer-foam/80">{count} Posts</p>
    </div>
);


export default function Home({ analysis }) {
  if (!analysis) {
    return <div>Error loading analysis. Please check your chat data.</div>;
  }
  
  // Dynamic height for the leaderboard to show all names
  const leaderboardHeight = analysis.leaderboardData.labels.length * 35 + 50; // 35px per user + padding

  return (
    <div>
      <Head>
        <title>Pint Chat: Analysis</title>
        <meta name="description" content="WhatsApp Chat Analysis Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BackgroundSlideshow images={analysis.imageFiles} />

      {/* The main content is now separate from the background and controls its own scrolling */}
      <div className="relative z-10">
        <main className="p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center">
          {/* Main transparent container with borders */}
          <div className="w-full max-w-7xl mx-auto border-2 border-white/20 rounded-2xl shadow-2xl shadow-black/50 p-4 sm:p-6 md:p-8 space-y-6">
            
            <header className="text-center">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-beer-gold drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                Pint Chat
              </h1>
              <p className="text-lg text-beer-foam/80 mt-2">
                As of: {analysis.latestTimestamp}
              </p>
            </header>

            {/* Infographics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfographicCard title="Top Poster (Today)" name={analysis.topPosterToday.name} count={analysis.topPosterToday.count} />
              <InfographicCard title="Top Poster (This Week)" name={analysis.topPosterThisWeek.name} count={analysis.topPosterThisWeek.count} />
              <InfographicCard title="Top Poster (All Time)" name={analysis.topPosterAllTime.name} count={analysis.topPosterAllTime.count} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 p-4 sm:p-6 rounded-xl border-2 border-white/20">
                <h2 className="text-2xl font-display text-center mb-4 text-beer-amber">Leaderboard</h2>
                <div style={{ height: `${leaderboardHeight}px`, minHeight: '300px' }}>
                  <LeaderboardChart data={analysis.leaderboardData} />
                </div>
              </div>
              <div className="lg:col-span-3 p-4 sm:p-6 rounded-xl border-2 border-white/20">
                  <h2 className="text-2xl font-display text-center mb-4 text-beer-amber">Peak Times</h2>
                  <div className="h-96">
                      <PostsByHourChart data={analysis.postsByHourData} />
                  </div>
              </div>
               <div className="lg:col-span-5 p-4 sm:p-6 rounded-xl border-2 border-white/20">
                  <h2 className="text-2xl font-display text-center mb-4 text-beer-amber">Weekly Posting Rhythm</h2>
                   <div className="h-80">
                     <PostsByDayChart data={analysis.postsByDayData} />
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
