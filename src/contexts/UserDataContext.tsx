import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface Roommate {
    name: string;
    rollNumber: string;
    course: string;
    contact: string;
}

interface RoomDetails {
    roomNumber: string;
    roomType: string;
    building: string;
    floor: string;
    facilities: string[];
    rentPerMonth: number;
    securityDeposit: number;
    allocationDate: string;
    nextPaymentDue: string;
    roommates: Roommate[];
    wasAllocatedWithPreference?: boolean;
}

interface UserData {
    status: 'Allocated' | 'Pending' | 'Not Allocated';
    roomDetails?: RoomDetails;
    id?: string; // Add optional ID if mistakenly used, or better, fix usage.
}

interface UserDataContextType {
    userData: UserData | null;
    updateUserData: (data: Partial<UserData>) => void;
    assignRoom: (applicationData: any) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);

    // Load user data from API when user changes
    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/student/me?studentId=${user?.id}`);
                    const data = await response.json();

                    if (data.status === 'Allocated' && data.roomDetails) {
                        setUserData({
                            status: 'Allocated',
                            roomDetails: data.roomDetails
                        });
                    } else if (data.status === 'Pending') {
                        setUserData({ status: 'Pending' });
                    } else {
                        setUserData({ status: 'Not Allocated' });
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    // Fallback to basic state
                    setUserData({ status: 'Not Allocated' });
                }
            } else {
                setUserData(null);
            }
        };

        fetchUserData();
    }, [user]);

    const updateUserData = (data: Partial<UserData>) => {
        setUserData(prev => prev ? { ...prev, ...data } : null);
    };

    const assignRoom = (_applicationData: any) => {
        // Just set pending state locally to reflect immediate change
        updateUserData({
            status: 'Pending'
        });
    };

    return (
        <UserDataContext.Provider value={{ userData, updateUserData, assignRoom }}>
            {children}
        </UserDataContext.Provider>
    );
};
