import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, User } from 'lucide-react';
import logoBMW from '../assets/images/logobmw.svg';

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <img src={logoBMW} alt="BMW Logo" className="h-12" />
          </Link>
          <nav className="hidden md:flex space-x-6 text-sm">
            <Link to="/" className="hover:text-black-900 hover:font-bold">Models</Link>
            <Link to="/" className="hover:text-black-600 hover:font-bold">Build Your Own</Link>
            <Link to="/" className="hover:text-black-600 hover:font-bold">Shopping</Link>
            <Link to="/" className="hover:text-black-600 hover:font-bold">BMW Eletric</Link>
            <Link to="/" className="hover:text-black-600 hover:font-bold">Owners</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <button className="flex items-center text-sm text-gray-700 hover:text-blue-600">
            <MapPin size={20} className="mr-2" />
            <span>Choose your local BMW Center</span>
          </button>
          <button className="text-gray-700 hover:text-blue-600">
            <User size={20} />
          </button>
          <button className="text-gray-700 hover:text-blue-600">
            <Search size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}