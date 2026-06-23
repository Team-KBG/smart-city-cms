import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LEVEL_CONFIG = {
  'Bronze Citizen': {
    emoji: '🥉',
    gradient: 'from-amber-700 to-amber-500',
    next: 'Silver Citizen',
    nextPoints: 100,
  },
  'Silver Citizen': {
    emoji: '🥈',
    gradient: 'from-slate-500 to-slate-400',
    next: 'Gold Citizen',
    nextPoints: 250,
  },
  'Gold Citizen': {
    emoji: '🥇',
    gradient: 'from-yellow-500 to-amber-400',
    next: 'Platinum Citizen',
    nextPoints: 500,
  },
  'Platinum Citizen': {
    emoji: '💎',
    gradient: 'from-cyan-600 to-blue-500',
    next: null,
    nextPoints: null,
  },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    API.get('/api/citizens/me')
      .then(({ data }) => setProfile(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center">
        <p>
          Profile not found.{' '}
          <Link to="/login" className="text-blue-600 underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  const cfg = LEVEL_CONFIG[profile.level] || LEVEL_CONFIG['Bronze Citizen'];
  const progressToNext = cfg.nextPoints
    ? Math.min(100, Math.round((profile.points / cfg.nextPoints) * 100))
    : 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile Header Card */}
      <div className={`rounded-3xl bg-gradient-to-br ${cfg.gradient} p-8 text-white shadow-xl`}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur">
            {cfg.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.name || 'Citizen'}</h1>
            <p className="text-white/80 text-sm truncate">{profile.email}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold backdrop-blur">
              {profile.level}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-4xl font-bold">{profile.points}</p>
            <p className="text-white/80 text-sm">points</p>
          </div>
        </div>

        {/* Progress to next level */}
        {cfg.next && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/80">
              <span>Progress to {cfg.next}</span>
              <span>
                {profile.points} / {cfg.nextPoints} pts
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white transition-all duration-700"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}
        {!cfg.next && (
          <div className="mt-4 rounded-xl bg-white/20 px-4 py-2 text-sm text-center backdrop-blur">
            🎉 Maximum level achieved! You&apos;re a Platinum Citizen.
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Complaints Filed', value: profile.complaintsSubmitted, icon: '📝' },
          { label: 'Complaints Resolved', value: profile.complaintsResolved, icon: '✅' },
          { label: 'Upvotes Given', value: profile.upvotesGiven, icon: '👍' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">{stat.icon}</div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/my-complaints"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          My Complaints
        </Link>
        <Link
          to="/leaderboard"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View Leaderboard
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Sign Out
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Member since {new Date(profile.createdAt).toLocaleDateString()}
        {profile.lastLogin &&
          ` • Last login: ${new Date(profile.lastLogin).toLocaleDateString()}`}
      </p>
    </div>
  );
}
