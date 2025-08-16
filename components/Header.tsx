
import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  appName: string;
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ appName, onAddTask }) => {
  return (
    <header className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center max-w-7xl px-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{appName}</h1>
        <button
          onClick={onAddTask}
          className="flex items-center bg-white text-sky-700 hover:bg-sky-50 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:ring-opacity-75"
          aria-label="Add new task"
        >
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Add Task
        </button>
      </div>
    </header>
  );
};

export default Header;
