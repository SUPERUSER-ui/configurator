import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <img src="/src/assets/images/logobmw.svg" alt="BMW Logo" className="h-8" />
          </Link>
          <nav className="hidden md:flex space-x-6 text-sm">
            <Link to="/" className="hover:text-blue-600">Models</Link>
            <Link to="/" className="hover:text-blue-600">Build Your Own</Link>
            <Link to="/" className="hover:text-blue-600">Shopping</Link>
            <Link to="/" className="hover:text-blue-600">BMW Experience</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm hover:text-blue-600">Sign In</button>
          <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Shop BMW
          </button>
        </div>
      </div>
    </header>
  );
}