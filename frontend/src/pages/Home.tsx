import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-amber-500 mb-4">AI Automated IPL Auction Dashboard</h1>
      <p className="text-lg text-slate-400 mb-8 max-w-2xl text-center">
        Welcome to the next generation of franchise management. Build your squad manually or with an AI auction coach, run simulations, and participate in persistent live auctions.
      </p>
      <div className="flex gap-4">
        <Link to="/features" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">
          Explore Features
        </Link>
        <Link to="/login" className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold rounded-md transition-colors">
          Log In to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Home;
