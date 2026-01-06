import { Leaf } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7A20] rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              EnvironmentTech
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-700 hover:text-[#0F7A20] transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-[#0F7A20] transition-colors"
            >
              Profile
            </a>
            <button className="px-5 py-2 bg-[#0F7A20] text-white rounded-full hover:bg-[#0d6a1c] transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
