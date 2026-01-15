import React from 'react';

interface RoomVisualizerProps {
    roomType: string;
    roomNumber: string;
    roommates?: { name: string }[];
}

const RoomVisualizer: React.FC<RoomVisualizerProps> = ({ roomType, roomNumber, roommates = [] }) => {
    const isSingle = roomType.toLowerCase().includes('single');
    const isTriple = roomType.toLowerCase().includes('triple');
    const isDouble = !isSingle && !isTriple;

    // Helper to get short name
    const getName = (index: number, fallback: string) => {
        if (roommates && roommates[index]) {
            return roommates[index].name.split(' ')[0].toUpperCase();
        }
        return fallback;
    };

    // SVG Layouts for different room types
    const renderContent = () => {
        if (isSingle) {
            return (
                <g>
                    {/* Bed */}
                    <rect x="200" y="50" width="80" height="150" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                    <text x="240" y="130" fontSize="12" textAnchor="middle" fill="#15803d" fontWeight="bold">BED</text>

                    {/* Desk */}
                    <rect x="20" y="200" width="100" height="50" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                    <text x="70" y="230" fontSize="12" textAnchor="middle" fill="#b45309">DESK</text>
                    <circle cx="70" cy="180" r="15" fill="#fde68a" stroke="#d97706" />

                    {/* Wardrobe */}
                    <rect x="20" y="20" width="60" height="100" fill="#f5f5f4" stroke="#78716c" strokeWidth="2" />
                    <line x1="20" y1="20" x2="80" y2="120" stroke="#78716c" strokeWidth="1" opacity="0.5" />
                    <line x1="80" y1="20" x2="20" y2="120" stroke="#78716c" strokeWidth="1" opacity="0.5" />
                    <text x="50" y="75" fontSize="10" textAnchor="middle" fill="#57534e">WR</text>
                </g>
            );
        }
        if (isDouble) {
            return (
                <g>
                    {/* Bed 1 */}
                    <rect x="200" y="30" width="80" height="120" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                    <text x="240" y="95" fontSize="10" textAnchor="middle" fill="#15803d" fontWeight="bold">YOU</text>

                    {/* Bed 2 */}
                    <rect x="200" y="170" width="80" height="120" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
                    <text x="240" y="235" fontSize="10" textAnchor="middle" fill="#6b7280">{getName(0, 'PEER')}</text>

                    {/* Desks */}
                    <rect x="20" y="220" width="80" height="40" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                    <text x="60" y="245" fontSize="8" textAnchor="middle" fill="#b45309">DESK 1</text>

                    <rect x="20" y="160" width="80" height="40" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                    <text x="60" y="185" fontSize="8" textAnchor="middle" fill="#b45309">DESK 2</text>

                    {/* Wardrobes */}
                    <rect x="20" y="20" width="50" height="60" fill="#f5f5f4" stroke="#78716c" strokeWidth="2" />
                    <text x="45" y="55" fontSize="8" textAnchor="middle" fill="#57534e">WR</text>
                    <rect x="80" y="20" width="50" height="60" fill="#f5f5f4" stroke="#78716c" strokeWidth="2" />
                    <text x="105" y="55" fontSize="8" textAnchor="middle" fill="#57534e">WR</text>
                </g>
            );
        }
        // Triple
        return (
            <g>
                {/* Bed 1 */}
                <rect x="200" y="20" width="80" height="90" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                <text x="240" y="70" fontSize="10" textAnchor="middle" fill="#15803d" fontWeight="bold">YOU</text>

                {/* Bed 2 */}
                <rect x="200" y="210" width="80" height="90" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
                <text x="240" y="260" fontSize="10" textAnchor="middle" fill="#6b7280">{getName(0, 'PEER 1')}</text>

                {/* Bed 3 (Rotated) */}
                <rect x="20" y="120" width="90" height="80" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
                <text x="65" y="165" fontSize="10" textAnchor="middle" fill="#6b7280">{getName(1, 'PEER 2')}</text>

                {/* Shared Table */}
                <circle cx="160" cy="160" r="30" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                <text x="160" y="165" fontSize="8" textAnchor="middle" fill="#b45309">SHARED</text>
            </g>
        );
    };

    return (
        <div className="w-full flex flex-col items-center select-none">
            {/* Legend */}
            <div className="flex gap-4 mb-4 text-xs text-slate-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-500 rounded-[1px]"></div> You</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-400 rounded-[1px]"></div> Other</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-100 border border-amber-600 rounded-[1px]"></div> Furniture</div>
            </div>

            {/* SVG Container */}
            <div className="relative p-2 bg-white border border-slate-200 shadow-sm rounded-xl">
                <svg width="320" height="320" viewBox="0 0 320 320" className="bg-slate-50">
                    {/* Grid Pattern */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="320" height="320" fill="url(#grid)" />

                    {/* Walls (Thick Border) */}
                    <rect x="5" y="5" width="310" height="310" fill="none" stroke="#334155" strokeWidth="4" />

                    {/* Door Area (Top Left) */}
                    <path d="M 5 40 L 45 40 A 40 40 0 0 1 5 80" fill="#cbd5e1" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                    <line x1="5" y1="40" x2="5" y2="80" stroke="#f8fafc" strokeWidth="6" /> {/* Opening */}
                    <line x1="5" y1="40" x2="45" y2="80" stroke="#334155" strokeWidth="2" /> {/* Door Leaf */}
                    <text x="15" y="30" fontSize="8" fill="#64748b" fontWeight="bold">ENTRY</text>

                    {/* Window Area (Bottom Right) */}
                    <rect x="220" y="310" width="80" height="6" fill="#bfdbfe" />
                    <text x="260" y="305" fontSize="8" textAnchor="middle" fill="#60a5fa">WINDOW</text>

                    {/* Layout Content */}
                    {renderContent()}
                </svg>
            </div>

            <div className="mt-3 font-mono text-xs text-slate-400">PLAN: {roomNumber}</div>
        </div>
    );
};

export default RoomVisualizer;
