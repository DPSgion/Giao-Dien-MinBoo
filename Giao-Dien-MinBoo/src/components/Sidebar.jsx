import React, { useState } from 'react';
import {
  Home,
  Film,
  MessageCircle,
  Search,
  Compass,
  Heart,
  PlusSquare,
  User,
} from 'lucide-react';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Home');

  const menuItems = [
    { name: 'Home', icon: Home },
    { name: 'Reels', icon: Film },
    { name: 'Messages', icon: MessageCircle },
    { name: 'Search', icon: Search },
    { name: 'Explore', icon: Compass },
    { name: 'Notifications', icon: Heart },
    { name: 'Create', icon: PlusSquare },
    { name: 'Profile', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo / Brand */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          SocialFlow
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`
                w-full flex items-center gap-4 px-3 py-3 rounded-xl
                transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 1.75 : 1.5}
                className="flex-shrink-0"
              />
              <span className="text-base font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Optional footer (user card) - keeps the sidebar grounded */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;