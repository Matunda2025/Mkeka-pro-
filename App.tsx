import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './components/HomePage';
import BetslipsPage from './components/BetslipsPage';
import AccountPage from './components/AccountPage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import BetslipDetailsPage from './components/BetslipDetailsPage';
import MyBetslipsPage from './components/MyBetslipsPage';
import type { Betslip, Tipster } from './types';
import { db, storage, auth, rtdb } from './lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp as firestoreServerTimestamp, query, orderBy, where } from 'firebase/firestore';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref as databaseRef, set, onValue, onDisconnect, serverTimestamp as databaseServerTimestamp } from 'firebase/database';


const gradients = [
    { from: "from-red-900", via: "via-red-700/70" }, { from: "from-purple-900", via: "via-purple-700/70" },
    { from: "from-blue-900", via: "via-blue-700/70" }, { from: "from-indigo-900", via: "via-indigo-700/70" },
    { from: "from-teal-900", via: "via-teal-700/70" }, { from: "from-orange-900", via: "via-orange-700/70" },
    { from: "from-green-900", via: "via-green-700/70" }, { from: "from-pink-900", via: "via-pink-700/70" },
];

const LoadingScreen: React.FC = () => (
    <div className="bg-[#121212] min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#20C56A]"></div>
    </div>
);

// SVG Icon Components
const HomeIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#20C56A' : 'currentColor'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BetslipsIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" style={{ stroke: isActive ? '#20C56A' : 'currentColor' }} /></svg>;
const AccountIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#20C56A' : 'currentColor'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AdminIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#20C56A' : 'currentColor'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ShieldIconHeader = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#20C56A]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

type Tab = 'home' | 'betslips' | 'admin' | 'account';
type View = 'tabs' | 'betslip-details' | 'my-betslips';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('betslips');
    const [view, setView] = useState<View>('tabs');
    const [selectedBetslip, setSelectedBetslip] = useState<Betslip | null>(null);
    const [betslips, setBetslips] = useState<Betslip[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [tipsters, setTipsters] = useState<Tipster[]>([]);
    const [purchasedBetslipIds, setPurchasedBetslipIds] = useState<Set<string>>(new Set());

    const fetchPurchases = useCallback(async (user: User) => {
        const purchasesQuery = query(collection(db, "user_purchases"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(purchasesQuery);
        const ids = new Set(querySnapshot.docs.map(doc => doc.data().betslipId as string));
        setPurchasedBetslipIds(ids);
    }, []);
    
    // Authentication and Presence Management
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setIsAuthLoading(false);
            if (user) {
                manageUserPresence(user.uid);
                fetchPurchases(user);
            } else {
                setPurchasedBetslipIds(new Set());
            }
        });
        return () => unsubscribe();
    }, [fetchPurchases]);
    
    const manageUserPresence = (uid: string) => {
        const userStatusDatabaseRef = databaseRef(rtdb, '/status/' + uid);
        const isOfflineForDatabase = { isOnline: false, lastSeen: databaseServerTimestamp() };
        const isOnlineForDatabase = { isOnline: true, lastSeen: databaseServerTimestamp() };
    
        const connectedRef = databaseRef(rtdb, '.info/connected');
        onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === false) { return; }
            onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                set(userStatusDatabaseRef, isOnlineForDatabase);
            });
        });
    };

    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const tipstersQuery = query(collection(db, "tipsters"), orderBy("accuracy", "desc"));
            const tipstersSnapshot = await getDocs(tipstersQuery);
            const tipstersList = tipstersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tipster));
            setTipsters(tipstersList);

            const betslipsQuery = query(collection(db, "betslips"), orderBy("createdAt", "desc"));
            const betslipsSnapshot = await getDocs(betslipsQuery);
            const betslipsList = betslipsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Betslip));
            setBetslips(betslipsList);
        } catch (error) {
            console.error("Error fetching data from Firestore:", error);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    const handleLogout = async () => {
        const uid = auth.currentUser?.uid;
        if(uid) {
            const userStatusDatabaseRef = databaseRef(rtdb, '/status/' + uid);
            await set(userStatusDatabaseRef, { isOnline: false, lastSeen: databaseServerTimestamp() });
        }
        await signOut(auth);
        setView('tabs');
        setActiveTab('betslips');
    };

    const handleSelectBetslip = (betslip: Betslip) => {
        setSelectedBetslip(betslip);
        setView('betslip-details');
    };

    const handlePurchaseSuccess = async (betslip: Betslip) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "user_purchases"), {
                userId: currentUser.uid,
                betslipId: betslip.id,
                purchasedAt: firestoreServerTimestamp(),
            });
            setPurchasedBetslipIds(prev => new Set(prev).add(betslip.id));
        } catch (error) {
            console.error("Error recording purchase:", error);
        }
    };
    
    const handleGoBack = () => {
        setView('tabs');
        setSelectedBetslip(null);
    };

    const handleNavigateMyBetslips = () => setView('my-betslips');

    const uploadImage = async (imageFile: string, path: string): Promise<string> => {
        if (!imageFile.startsWith('data:image')) return imageFile;
        const storageReference = storageRef(storage, `${path}/${Date.now()}`);
        const snapshot = await uploadString(storageReference, imageFile, 'data_url');
        return await getDownloadURL(snapshot.ref);
    };

    const addBetslip = async (betslip: Omit<Betslip, 'id'>) => {
        const imageUrl = await uploadImage(betslip.betslipImageUrl || '', 'betslip-images');
        await addDoc(collection(db, "betslips"), {
            ...betslip,
            betslipImageUrl: imageUrl,
            createdAt: firestoreServerTimestamp()
        });
        await fetchData();
        setActiveTab('betslips');
    };
    
    const addTipster = async (tipster: Omit<Tipster, 'id' | 'gradientFrom' | 'gradientVia'>) => {
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        const imageUrl = await uploadImage(tipster.imageUrl, 'tipster-avatars');

        await addDoc(collection(db, "tipsters"), {
            ...tipster,
            imageUrl: imageUrl,
            gradientFrom: randomGradient.from,
            gradientVia: randomGradient.via,
            createdAt: firestoreServerTimestamp(),
        });
        await fetchData();
        setActiveTab('home');
    };

    const renderContent = () => {
        if (view === 'betslip-details' && selectedBetslip) {
            return <BetslipDetailsPage 
                betslip={selectedBetslip} 
                user={currentUser}
                isPurchased={purchasedBetslipIds.has(selectedBetslip.id)}
                onPurchase={handlePurchaseSuccess}
            />;
        }
        if (view === 'my-betslips') {
             return <MyBetslipsPage 
                allBetslips={betslips} 
                purchasedBetslipIds={purchasedBetslipIds}
                onSelectBetslip={handleSelectBetslip}
            />;
        }

        switch (activeTab) {
            case 'home': return <HomePage tipsters={tipsters} />;
            case 'betslips': return <BetslipsPage betslips={betslips} isLoading={isLoadingData} onSelectBetslip={handleSelectBetslip} purchasedBetslipIds={purchasedBetslipIds}/>;
            case 'admin': return <AdminPage onAddBetslip={addBetslip} onAddTipster={addTipster} betslips={betslips} tipsters={tipsters} />;
            case 'account': return <AccountPage user={currentUser} onLogout={handleLogout} onNavigateToMyBetslips={handleNavigateMyBetslips} />;
            default: return <BetslipsPage betslips={betslips} isLoading={isLoadingData} onSelectBetslip={handleSelectBetslip} purchasedBetslipIds={purchasedBetslipIds}/>;
        }
    };

    const getHeaderText = () => {
        if (view === 'betslip-details') return "Betslip details";
        if (view === 'my-betslips') return "My Betslips";
        
        switch (activeTab) {
            case 'home': return "Kaka App";
            case 'betslips': return "Betslips";
            case 'admin': return "Admin Panel";
            case 'account': return "My Account";
            default: return "Kaka App";
        }
    };
    
    if (isAuthLoading) {
        return <LoadingScreen />;
    }
    
    if (!currentUser) {
        return <LoginPage />;
    }

    return (
        <div className="bg-[#121212] min-h-screen font-sans">
            <div className="max-w-md mx-auto bg-[#121212] text-white relative">
                <header className="p-4 pt-8 flex items-center">
                    {view !== 'tabs' ? (
                         <button onClick={handleGoBack} className="text-[#20C56A] mr-3 p-1 rounded-full hover:bg-gray-800 transition-colors" aria-label="Go back">
                           <BackArrowIcon />
                        </button>
                    ) : activeTab === 'home' && <div className="mr-3"><ShieldIconHeader /></div>}
                    <h1 className={`font-bold ${activeTab === 'betslips' && view === 'tabs' ? 'text-4xl font-black' : 'text-2xl'}`}>{getHeaderText()}</h1>
                </header>
                
                <div className="pb-24">
                    {renderContent()}
                </div>

                {view === 'tabs' && (
                    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1a1a1a] border-t border-gray-700/50 flex justify-around">
                        {[
                            { name: 'home', icon: HomeIcon, label: 'Home' },
                            { name: 'betslips', icon: BetslipsIcon, label: 'Betslips' },
                            { name: 'admin', icon: AdminIcon, label: 'Admin' },
                            { name: 'account', icon: AccountIcon, label: 'Account' },
                        ].map(item => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name as Tab)}
                                className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-medium transition-colors ${activeTab === item.name ? 'text-[#20C56A]' : 'text-gray-400 hover:text-white'}`}
                            >
                                <item.icon isActive={activeTab === item.name} />
                                <span className="mt-1">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </div>
    );
}

export default App;