import React from 'react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-500 mb-6">Platform Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-emerald-400">Live Auction</h2>
            <p className="text-slate-400">Participate in a persistent, real-time auction with dynamic bids and locking.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-emerald-400">AI Coach</h2>
            <p className="text-slate-400">Get data-driven recommendations on who to buy based on your squad's current chemistry and gaps.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="text-amber-500 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
