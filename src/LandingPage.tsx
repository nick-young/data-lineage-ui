import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEnterClick = () => {
    navigate('/data-lineage');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 text-gray-800 p-8 pt-16">
      {/* Logo */}
      <img src="/assets/logo.png" alt="Logo" className="w-16 h-16 mb-6" />

      {/* Header */}
      <header className="text-center max-w-4xl mx-auto mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-indigo-900">
          Data Lineage Visualiser
        </h1>
        <p className="text-xl text-gray-700">
          Explore, map, and understand the flow of your data with an interactive graph interface.
        </p>
      </header>

      {/* Call to Action */}
      <div className="mb-12">
        <button
          onClick={handleEnterClick}
          className="px-10 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Enter Visualiser
        </button>
      </div>

      {/* Screenshot Section */}
      <div className="w-full max-w-5xl p-2 bg-white rounded-lg shadow-xl border border-gray-200 mb-12">
         <img src="/assets/screen.png" alt="Application Screenshot" className="rounded-md w-full" />
      </div>

      {/* Footer */}
      <footer className="text-center text-indigo-700 text-sm mt-auto pb-8">
        <p>&copy; 2024 Nick Young.</p>
      </footer>
    </div>
  );
};

export default LandingPage; 