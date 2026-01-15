import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    date: string; // ISO string
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => void;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock initial data
    useEffect(() => {
        // Simulate fetching from API
        setTimeout(() => {
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    title: 'Room Allocated!',
                    message: 'You have been allocated Room 101.',
                    type: 'success',
                    read: false,
                    date: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Maintenance Update',
                    message: 'Ticket #45 (Leaky tap) has been resolved.',
                    type: 'info',
                    read: false,
                    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                },
                {
                    id: '3',
                    title: 'Rent Reminder',
                    message: 'Friendly reminder: Rent is due in 2 days.',
                    type: 'warning',
                    read: true,
                    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                },
            ];
            setNotifications(mockNotifications);
            setIsLoading(false);
        }, 1000);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'date'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            read: false,
            date: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                addNotification,
                isLoading,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
