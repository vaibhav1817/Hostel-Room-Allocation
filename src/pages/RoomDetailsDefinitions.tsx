
import React from 'react';
import { Airplay, Fan, Bath, BookOpen, Refrigerator } from 'lucide-react';

// Types
type RoomStatus = 'available' | 'occupied' | 'partially_occupied' | 'maintenance';

interface Occupant {
    id: string;
    name: string;
    rollNumber: string;
    course: string;
    year: string;
    contact: string;
}

interface Room {
    id: string;
    number: string;
    type: string;
    block: string;
    floor: string;
    capacity: number;
    occupied: number;
    rent: number;
    facilities: string[];
    status: RoomStatus;
    occupants: Occupant[];
    gender?: 'Male' | 'Female';
}

// Status colors and labels for consistent display
const statusColors: Record<RoomStatus, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    partially_occupied: 'bg-amber-100 text-amber-800',
    maintenance: 'bg-blue-100 text-blue-800'
};

const statusLabels: Record<RoomStatus, string> = {
    available: 'Available',
    occupied: 'Fully Occupied',
    partially_occupied: 'Partially Occupied',
    maintenance: 'Under Maintenance'
};

// Map facility names to icons
const facilityIcons: Record<string, React.ElementType> = {
    'AC': Airplay, // Using Airplay as AC icon
    'Ceiling Fan': Fan,
    'Attached Bathroom': Bath,
    'Shared Bathroom': Bath,
    'Study Table': BookOpen,
    'Mini Fridge': Refrigerator,
};

const getYearFromUSN = (usn: string): string => {
    if (!usn) return 'N/A';
    const match = usn.match(/U(\d{2})/i);
    if (match) {
        const batch = parseInt(match[1]);
        const currentYear = 26; // Based on 2026 context
        const diff = currentYear - batch;
        if (diff <= 1) return '1st';
        if (diff === 2) return '2nd';
        if (diff === 3) return '3rd';
        if (diff >= 4) return '4th';
    }
    return 'N/A';
};

export type { RoomStatus, Occupant, Room };
export { statusColors, statusLabels, facilityIcons, getYearFromUSN };
