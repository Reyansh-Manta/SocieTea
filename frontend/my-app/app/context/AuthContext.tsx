"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    _id: string;
    fullName: string;
    username: string;
    Organization: string; // College Name
    OrganizationId: string;
    profilePic?: string; // Added profilePic
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    rsvpEvents: string[];
    refreshUser: () => Promise<void>;
    toggleRsvpInState: (eventId: string, isNowRsvped: boolean) => void;
    syncRsvps: (eventIds: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [rsvpEvents, setRsvpEvents] = useState<string[]>([]);

    const refreshUser = async () => {
        try {
            setLoading(true);
            const userRes = await fetch("http://localhost:9000/api/v1/user/getUser", {
                credentials: "include"
            });
            if (userRes.ok) {
                const userDataWrapper = await userRes.json();
                const currentUser = userDataWrapper.data?.user;
                if (currentUser) {
                    setUser(currentUser);
                    // Assuming API returns rsvp'd events in user object or we need to fetch them. 
                    // Based on existing code, user object doesn't seem to have simple rsvp list, 
                    // but individual events have RSVP list. 
                    // However, for efficiency, ideally the user object should have it, or we fetch a list of "my events".
                    // For now, let's fetch "my rsvp events" if the endpoint exists, or rely on fetching events to populate it?
                    // PROPOSAL: Let's assume we can fetch user's RSVP'd events. 
                    // If not, we might need to rely on the page loading to set initial state, but that defeats the sync purpose.
                    // Let's modify the getUser backend or add a call to get-user-rsvps if possible.
                    // CHECK: Backtracking to what I saw in EventPage:
                    // `eventObj.RSVP.includes(currentUser._id)` checks if user is in event rsvp.
                    // This implies we need to know all events? No, that's inefficient.

                    // IMPROVEMENT: We will maintain `rsvpEvents` state manually here.
                    // Initial load: We might not know ALL RSVPs unless the backend gives us a list.
                    // Let's check if the User model has it.
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const syncRsvps = (eventIds: string[]) => {
        setRsvpEvents(prev => {
            const newSet = new Set([...prev, ...eventIds]);
            return Array.from(newSet);
        });
    };

    // To make this truly robust without changing backend heavily right now:
    // We will rely on pages to "register" their knowledge of RSVPs, 
    // OR we just manage the state updates here.
    // If I click RSVP on one page, I update this list.
    const toggleRsvpInState = (eventId: string, isNowRsvped: boolean) => {
        setRsvpEvents(prev => {
            if (isNowRsvped) {
                // Add if not exists
                if (!prev.includes(eventId)) return [...prev, eventId];
                return prev;
            } else {
                // Remove
                return prev.filter(id => id !== eventId);
            }
        });
    };

    useEffect(() => {
        refreshUser();
    }, []);

    // NOTE: This initial loading of RSVP events is tricky without a dedicated endpoint or field.
    // However, if we visit OrgPage, it fetches events and we can calculate which ones are RSVP'd.
    // Then we can populate this state. But if we go to EventPage directly, we only know about that one.
    // Ideally, we'd have `user.rsvpedEvents`. 
    // Let's assume for now we only need synchronization. 
    // UseEffect fetching user is good.

    return (
        <AuthContext.Provider value={{ user, loading, rsvpEvents, refreshUser, toggleRsvpInState, syncRsvps }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
