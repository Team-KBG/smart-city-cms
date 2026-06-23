import { useEffect, useState } from 'react';
import API from '../api/axios';

const LEVEL_CONFIG = {
  'Bronze Citizen': {
    emoji: '🥉',
    color: 'from-amber-700 to-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-amber-200',
  },
  'Silver Citizen': {
    emoji: '🥈',
    color: 'from-slate-500 to-slate-400',
    badge: 'bg-slate-100 text-slate-700',
    border: 'border-slate-300',
  },
  'Gold Citizen': {
    emoji: '🥇',
    color: 'from-yellow-500 to-amber-400',
    badge: 'bg-yellow-100 text-yellow-800',
    border: 'border-yellow-200',
  },
  'Platinum Citizen': {
    emoji: '💎',
    color: 'from-cyan-600 to-blue-500',
    badge: 'bg-cyan-100 text-cyan-800',
    border: 'border-cyan-200',
  },
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/citizens/leaderboard')
      .then(({ data }) => setCitizens(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">🏆 Citizen Leaderboard</h1>
        <p className="mt-2 text-slate-500">Top contributors to Smart City improvement</p>
      </div>

      {/* Level legend */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
          <span key={level} className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}>
            {cfg.emoji} {level}
          </span>
        ))}
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-3">
        {citizens.map((citizen, index) => {
          const cfg = LEVEL_CONFIG[citizen.level] || LEVEL_CONFIG['Bronze Citizen'];
          const medal = RANK_MEDALS[index] || `#${index + 1}`;
          return (
            <div
              key={citizen._id}
              className={`flex items-center gap-4 rounded-2xl border ${cfg.border} bg-white p-4 shadow-sm transition hover:shadow-md`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold">
                {medal}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.color} text-xl text-white shadow`}
              >
                {cfg.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {citizen.name || 'Anonymous Citizen'}
                </p>
                <p className="text-xs text-slate-500">
                  {citizen.complaintsSubmitted} complaints &bull; {citizen.complaintsResolved} resolved &bull;{' '}
                  {citizen.upvotesGiven} upvotes
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-slate-900">{citizen.points}</p>
                <p className="text-xs text-slate-500">points</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                  {citizen.level}
                </span>
              </div>
            </div>
          );
        })}

        {citizens.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-5xl">🏙️</p>
            <p className="mt-4 text-slate-500">
              No citizens on the leaderboard yet.
              <br />
              Register a complaint to earn your first points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
