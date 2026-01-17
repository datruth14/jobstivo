"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ICV {
    _id?: string;
    name: string;
    content: string;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface WalletContextType {
    coins: number;
    jobsApplied: number;
    userCVs: ICV[];
    userCV: string | null; // This will be the content of the default CV
    loading: boolean;
    deductCoins: (amount: number) => boolean;
    incrementJobsApplied: () => void;
    updateCV: (cvContent: string, cvId?: string) => Promise<void>;
    addCoins: (amount: number) => void;
    createCV: (name: string, content: string) => Promise<void>;
    removeCV: (cvId: string) => Promise<void>;
    setDefaultCV: (cvId: string) => Promise<void>;
    renameCV: (cvId: string, newName: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session, status } = useSession();
    const [coins, setCoins] = useState(500);
    const [jobsApplied, setJobsApplied] = useState(0);
    const [userCVs, setUserCVs] = useState<ICV[]>([]);
    const [loading, setLoading] = useState(true);

    // Derived active CV content
    const userCV = userCVs.find(cv => cv.isDefault)?.content || (userCVs.length > 0 ? userCVs[0].content : null);

    // Fetch initial state from MongoDB
    useEffect(() => {
        const fetchUserData = async () => {
            if (status === "unauthenticated") {
                setCoins(500);
                setJobsApplied(0);
                setUserCVs([]);
                setLoading(false);
                return;
            }

            if (status === "authenticated") {
                try {
                    const response = await fetch('/api/user');
                    const data = await response.json();

                    if (data.success && data.user) {
                        setCoins(data.user.walletBalance);
                        setJobsApplied(data.user.jobsApplied);

                        let cvs = data.user.cvs || [];

                        // Migration logic: If no CVs in array but old cvContent exists
                        if (cvs.length === 0 && data.user.cvContent) {
                            cvs = [{
                                _id: 'temp-master',
                                name: "Master CV",
                                content: data.user.cvContent,
                                isDefault: true
                            }];
                            // Sync migration back to DB
                            await fetch('/api/user', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ cvs }),
                            });
                        }

                        setUserCVs(cvs);
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [session, status]);

    const syncWalletToDB = async (newBalance: number, newJobsApplied: number, coinsSpent?: number) => {
        if (status !== "authenticated") return;
        try {
            await fetch('/api/user/wallet', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    balance: newBalance,
                    jobsApplied: newJobsApplied,
                    ...(coinsSpent && { coinsSpent }),
                }),
            });
        } catch (error) {
            console.error('Failed to sync wallet to DB:', error);
        }
    };

    const deductCoins = (amount: number) => {
        if (coins >= amount) {
            const newBalance = coins - amount;
            setCoins(newBalance);
            syncWalletToDB(newBalance, jobsApplied, amount);
            return true;
        }
        return false;
    };

    const incrementJobsApplied = () => {
        const newJobsApplied = jobsApplied + 1;
        setJobsApplied(newJobsApplied);
        syncWalletToDB(coins, newJobsApplied);
    };

    const updateCV = async (cvContent: string, cvId?: string) => {
        if (status !== "authenticated") return;

        const updatedCVs = userCVs.map(cv => {
            if (cvId) {
                return cv._id === cvId ? { ...cv, content: cvContent } : cv;
            }
            // If no ID, update the default one
            return cv.isDefault ? { ...cv, content: cvContent } : cv;
        });

        setUserCVs(updatedCVs);

        try {
            await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvs: updatedCVs }),
            });
        } catch (error) {
            console.error('Failed to update CV:', error);
        }
    };

    const createCV = async (name: string, content: string) => {
        if (status !== "authenticated") return;

        // If it's the first CV, make it default
        const isDefault = userCVs.length === 0;
        const newCV: ICV = {
            _id: `temp-${Date.now()}`,
            name,
            content,
            isDefault
        };
        const updatedCVs = [...userCVs, newCV];

        setUserCVs(updatedCVs);

        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvs: updatedCVs }),
            });
            const data = await res.json();
            if (data.success) {
                setUserCVs(data.user.cvs);
            }
        } catch (error) {
            console.error('Failed to create CV:', error);
        }
    };

    const removeCV = async (cvId: string) => {
        const updatedCVs = userCVs.filter(cv => cv._id !== cvId);

        // If we removed the default, set another one as default
        if (userCVs.find(cv => cv._id === cvId)?.isDefault && updatedCVs.length > 0) {
            updatedCVs[0].isDefault = true;
        }

        setUserCVs(updatedCVs);

        try {
            await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvs: updatedCVs }),
            });
        } catch (error) {
            console.error('Failed to remove CV:', error);
        }
    };

    const setDefaultCV = async (cvId: string) => {
        const updatedCVs = userCVs.map(cv => ({
            ...cv,
            isDefault: cv._id === cvId
        }));

        setUserCVs(updatedCVs);

        try {
            await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvs: updatedCVs }),
            });
        } catch (error) {
            console.error('Failed to set default CV:', error);
        }
    };

    const renameCV = async (cvId: string, newName: string) => {
        const updatedCVs = userCVs.map(cv =>
            cv._id === cvId ? { ...cv, name: newName } : cv
        );

        setUserCVs(updatedCVs);

        try {
            await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvs: updatedCVs }),
            });
        } catch (error) {
            console.error('Failed to rename CV:', error);
        }
    };

    const addCoins = (amount: number) => {
        const newBalance = coins + amount;
        setCoins(newBalance);
        syncWalletToDB(newBalance, jobsApplied);
    };

    return (
        <WalletContext.Provider value={{
            coins,
            jobsApplied,
            userCVs,
            userCV,
            loading,
            deductCoins,
            incrementJobsApplied,
            updateCV,
            addCoins,
            createCV,
            removeCV,
            setDefaultCV,
            renameCV
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
