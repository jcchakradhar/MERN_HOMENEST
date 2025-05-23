import React from 'react';
import { Link } from 'react-router-dom';
export default function Header() {
  return (
    <header className="bg-blue-200 shadow-xl">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        <Link to='/'>
        <h1 className="font-extrabold text-2xl">
          <span className="text-cyan-800">Home</span>
          <span className="text-gold">Nest</span>
        </h1>
        </Link>
        <form className="bg-gray-800 px-4 py-2 rounded-lg flex items-center shadow-md">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-32 sm:w-64 text-white placeholder-gray-400"
          />
        </form>
        <ul className='flex gap-4'>
        <Link to='/'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              Home
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              About
            </li>
          </Link> 
          <Link to='/profile'>
          <li className=' text-slate-700 hover:underline'> Sign in</li>
          </Link>
        </ul>
      </div>
    </header>
  );
}
