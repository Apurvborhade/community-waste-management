import { Heart } from 'lucide-react';

export function FooterCTA() {
  return (
    <div className="mt-16 bg-gradient-to-r from-green-50 via-green-100/50 to-green-50 border-t border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <Heart className="w-5 h-5 text-[#0F7A20]" />
          <p className="text-gray-700 text-lg">
            Keep your city clean — every report matters.
          </p>
        </div>
      </div>
    </div>
  );
}
