import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './components/HomePage';
import BetslipsPage from './components/BetslipsPage';
import AccountPage from './components/AccountPage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import BetslipDetailsPage from './components/BetslipDetailsPage';
import MyBetslipsPage from './components/MyBetslipsPage';
import SubscribePage from './components/SubscribePage';
import BetHistoryPage from './components/BetHistoryPage';
import PaymentHistoryPage from './components/PaymentHistoryPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import type { Betslip, Tipster, Banner, Purchase, UserProfile, UserRole } from './types';
import { db, storage, auth, rtdb } from './lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp as firestoreServerTimestamp, query, orderBy, where, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadString, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signOut, User, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
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
const BetslipsIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#20C56A' : 'currentColor'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" /></svg>;
const SubscribeIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#20C56A' : 'currentColor'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const AccountIcon = ({ isActive }: { isActive: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#20C56A' : 'currentColor'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-full transition-colors ${isActive ? 'text-[#20C56A]' : 'text-gray-400 hover:text-white'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);

type View = 'home' | 'betslips' | 'my-betslips' | 'subscribe' | 'account' | 'admin' | 'betslip-details' | 'bet-history' | 'payment-history' | 'profile-settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [betslips, setBetslips] = useState<Betslip[]>([]);
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedBetslip, setSelectedBetslip] = useState<Betslip | null>(null);
  const [purchasedBetslipIds, setPurchasedBetslipIds] = useState<Set<string>>(new Set());
  const [subscribedTipsterIds, setSubscribedTipsterIds] = useState<Set<string>>(new Set());
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);

  const fetchAdminData = useCallback(async () => {
    try {
      const [betslipsSnapshot, tipstersSnapshot, bannersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "betslips"), orderBy("expiresAt", "desc"))),
        getDocs(query(collection(db, "tipsters"), orderBy("accuracy", "desc"))),
        getDocs(query(collection(db, "banners"), orderBy("createdAt", "desc")))
      ]);
      const betslipsData = betslipsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Betslip));
      const tipstersData = tipstersSnapshot.docs.map((doc, index) => ({
        id: doc.id, ...doc.data(), ...gradients[index % gradients.length]
      } as Tipster));
      const bannersData = bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      setBetslips(betslipsData);
      setTipsters(tipstersData);
      setBanners(bannersData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserPurchases = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      // FIX: Removed orderBy from query to avoid composite index error.
      // Sorting will be done on the client side after fetching.
      const purchasesQuery = query(
        collection(db, "user_purchases"),
        where("userId", "==", uid)
      );
      const querySnapshot = await getDocs(purchasesQuery);
      const purchases = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
      
      // Sort purchases by date descending on the client.
      purchases.sort((a, b) => b.purchasedAt.seconds - a.purchasedAt.seconds);
      
      setPurchaseHistory(purchases);
      const ids = new Set(purchases.map(p => p.betslipId));
      setPurchasedBetslipIds(ids);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
    }
  }, []);

  const fetchUserSubscriptions = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
        const subsQuery = query(collection(db, "user_subscriptions"), where("userId", "==", uid));
        const querySnapshot = await getDocs(subsQuery);
        const ids = new Set(querySnapshot.docs.map(doc => doc.data().tipsterId as string));
        setSubscribedTipsterIds(ids);
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
    }
  }, []);
  
  const fetchUserProfile = useCallback(async (uid: string) => {
      if (!uid) return;
      try {
          const userDocRef = doc(db, "users", uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
              setUserProfile(userDocSnap.data() as UserProfile);
          }
      } catch (error) {
          console.error("Error fetching user profile:", error);
      }
  }, []);


  useEffect(() => {
    fetchAdminData();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (user) {
            fetchUserPurchases(user.uid);
            fetchUserSubscriptions(user.uid);
            fetchUserProfile(user.uid);
            // Realtime Database presence
            const userStatusDatabaseRef = databaseRef(rtdb, '/status/' + user.uid);
            const isOfflineForDatabase = { isOnline: false, last_changed: databaseServerTimestamp() };
            const isOnlineForDatabase = { isOnline: true, last_changed: databaseServerTimestamp() };
            onValue(databaseRef(rtdb, '.info/connected'), (snapshot) => {
                if (snapshot.val() === false) { return; }
                onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                    set(userStatusDatabaseRef, isOnlineForDatabase);
                });
            });
        } else {
            setPurchasedBetslipIds(new Set());
            setSubscribedTipsterIds(new Set());
            setPurchaseHistory([]);
            setUserProfile(null);
        }
    });
    return () => unsubscribe();
  }, [fetchAdminData, fetchUserPurchases, fetchUserSubscriptions, fetchUserProfile]);


  const handleLogout = async () => {
    if (auth.currentUser) {
        const userStatusDatabaseRef = databaseRef(rtdb, '/status/' + auth.currentUser.uid);
        await set(userStatusDatabaseRef, { isOnline: false, last_changed: databaseServerTimestamp() });
    }
    await signOut(auth);
    setCurrentView('home');
  };

  const handleSelectBetslip = (betslip: Betslip) => {
    setSelectedBetslip(betslip);
    setCurrentView('betslip-details');
  };

  const handlePurchase = async (betslip: Betslip) => {
    if (!user) { alert("Please log in to purchase."); return; }
    await addDoc(collection(db, "user_purchases"), {
        userId: user.uid,
        betslipId: betslip.id,
        purchasedAt: firestoreServerTimestamp(),
    });
    setPurchasedBetslipIds(prev => new Set(prev).add(betslip.id));
    await fetchUserPurchases(user.uid); // Re-fetch to get the latest purchase in history
  };

  const handleToggleSubscription = async (tipsterId: string) => {
    if (!user) { alert("Please log in to subscribe."); return; }
    const isSubscribed = subscribedTipsterIds.has(tipsterId);
    const subsCollection = collection(db, "user_subscriptions");
    
    if (isSubscribed) {
        const q = query(subsCollection, where("userId", "==", user.uid), where("tipsterId", "==", tipsterId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref);
        });
        setSubscribedTipsterIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(tipsterId);
            return newSet;
        });
    } else {
        await addDoc(subsCollection, {
            userId: user.uid,
            tipsterId: tipsterId,
            subscribedAt: firestoreServerTimestamp(),
        });
         setSubscribedTipsterIds(prev => new Set(prev).add(tipsterId));
    }
  };

  const handleAddOrUpdate = async (
    action: 'add' | 'update' | 'delete',
    collectionName: string,
    data: any,
    docId?: string
) => {
    try {
        if (action === 'add') {
            await addDoc(collection(db, collectionName), { ...data, createdAt: firestoreServerTimestamp() });
        } else if (action === 'update' && docId) {
            await updateDoc(doc(db, collectionName, docId), data);
        } else if (action === 'delete' && docId) {
            await deleteDoc(doc(db, collectionName, docId));
        }
        await fetchAdminData();
    } catch (error) {
        console.error(`Error ${action}ing document in ${collectionName}:`, error);
        throw error;
    }
};

const uploadImage = async (base64OrUrl: string, path: string): Promise<string> => {
    if (!base64OrUrl.startsWith('data:image')) {
        return base64OrUrl; // It's already a URL
    }
    const sRef = storageRef(storage, path);
    await uploadString(sRef, base64OrUrl, 'data_url');
    return await getDownloadURL(sRef);
};


const handleAddBetslip = async (data: Omit<Betslip, 'id'>) => {
    let finalData = { ...data };
    if (data.betslipImageUrl) {
      finalData.betslipImageUrl = await uploadImage(data.betslipImageUrl, `betslips/${Date.now()}`);
    }
    await handleAddOrUpdate('add', 'betslips', finalData);
};

const handleUpdateBetslip = async (id: string, data: Omit<Betslip, 'id'>) => {
    let finalData = { ...data };
    if (data.betslipImageUrl && data.betslipImageUrl.startsWith('data:image')) {
      finalData.betslipImageUrl = await uploadImage(data.betslipImageUrl, `betslips/${id}_${Date.now()}`);
    }
    await handleAddOrUpdate('update', 'betslips', finalData, id);
};

const handleDeleteBetslip = async (id: string) => await handleAddOrUpdate('delete', 'betslips', {}, id);

const handleAddTipster = async (data: Omit<Tipster, 'id' | 'gradientFrom' | 'gradientVia'>) => {
    let finalData = { ...data };
     if (data.imageUrl) {
        finalData.imageUrl = await uploadImage(data.imageUrl, `tipsters/${Date.now()}`);
    }
    await handleAddOrUpdate('add', 'tipsters', finalData);
};

const handleUpdateTipster = async (id: string, data: Omit<Tipster, 'id'| 'gradientFrom' | 'gradientVia'>) => {
    let finalData = { ...data };
    if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
       finalData.imageUrl = await uploadImage(data.imageUrl, `tipsters/${id}_${Date.now()}`);
    }
    await handleAddOrUpdate('update', 'tipsters', finalData, id);
};

const handleDeleteTipster = async (id: string) => await handleAddOrUpdate('delete', 'tipsters', {}, id);

const handleAddBanner = async (data: { imageUrl: string }) => {
    const finalImageUrl = await uploadImage(data.imageUrl, `banners/${Date.now()}`);
    await handleAddOrUpdate('add', 'banners', { imageUrl: finalImageUrl });
};

const handleUpdateBanner = async (id: string, data: { imageUrl: string }) => {
    let finalImageUrl = data.imageUrl;
    if (data.imageUrl.startsWith('data:image')) {
       finalImageUrl = await uploadImage(data.imageUrl, `banners/${id}_${Date.now()}`);
    }
    await handleAddOrUpdate('update', 'banners', { imageUrl: finalImageUrl }, id);
};

const handleDeleteBanner = async (id: string) => {
    const bannerDoc = await getDoc(doc(db, 'banners', id));
    const bannerData = bannerDoc.data();
    if(bannerData && bannerData.imageUrl) {
        try {
            const imageRef = storageRef(storage, bannerData.imageUrl);
            await deleteObject(imageRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting banner image from storage:", error);
            }
        }
    }
    await handleAddOrUpdate('delete', 'banners', {}, id);
};

const handleUpdateProfile = async (displayName: string, photoFile: string, phoneNumber?: string) => {
    if (!user) throw new Error("User not authenticated");
    let photoURL = user.photoURL;
    if (photoFile) {
        const sRef = storageRef(storage, `avatars/${user.uid}`);
        const snapshot = await uploadString(sRef, photoFile, 'data_url');
        photoURL = await getDownloadURL(snapshot.ref);
    }
    await updateProfile(user, { displayName, photoURL });

    const userDocRef = doc(db, "users", user.uid);
    const updatedProfileData: Partial<UserProfile> = {
        displayName,
    };
    if (phoneNumber !== undefined) {
        updatedProfileData.phoneNumber = phoneNumber;
    }
    await setDoc(userDocRef, updatedProfileData, { merge: true });
   
    // The onAuthStateChanged listener will handle user state updates automatically.
    // Re-fetching the profile document to ensure our DB is in sync.
    await fetchUserProfile(user.uid);
};

const handlePasswordReset = async () => {
    if (user?.email) {
        await sendPasswordResetEmail(auth, user.email);
    } else {
        throw new Error("User does not have an email associated.");
    }
};

const handleSetUserRole = async (uid: string, role: UserRole) => {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, { role }, { merge: true });
};


  if (!user) {
      return <LoginPage />;
  }
  if (isLoading) {
    return <LoadingScreen />;
  }

  const pageTitles: { [key in View]: string } = {
    home: 'Home',
    betslips: 'Betslips',
    'my-betslips': 'My Betslips',
    subscribe: 'Subscriptions',
    account: 'My Account',
    admin: 'Admin Panel',
    'betslip-details': 'Betslip Details',
    'bet-history': 'Bet History',
    'payment-history': 'Payment History',
    'profile-settings': 'Profile Settings',
  };
  const isDetailsOrAdmin = currentView === 'betslip-details' || currentView === 'admin' || currentView === 'bet-history' || currentView === 'payment-history' || currentView === 'profile-settings' || currentView === 'my-betslips';
  
  const goBack = () => {
    if (currentView === 'betslip-details') {
      setCurrentView('betslips');
    } else if (
      currentView === 'bet-history' ||
      currentView === 'payment-history' ||
      currentView === 'profile-settings' ||
      currentView === 'my-betslips' ||
      currentView === 'admin'
    ) {
      setCurrentView('account');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen font-sans text-white max-w-md mx-auto flex flex-col">
       {/* Header */}
      <header className="sticky top-0 z-30 bg-[#121212]/80 backdrop-blur-sm px-4 py-4 flex items-center">
        {isDetailsOrAdmin ? (
          <button onClick={goBack} className="mr-4 p-2 -ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        ) : <div className="w-10"></div>}
        <h1 className="text-xl font-bold text-center flex-grow">{pageTitles[currentView]}</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-y-auto pb-28">
          {currentView === 'home' && <HomePage tipsters={tipsters} banners={banners} subscribedTipsterIds={subscribedTipsterIds} onToggleSubscription={handleToggleSubscription} />}
          {currentView === 'betslips' && <BetslipsPage betslips={betslips} isLoading={isLoading} onSelectBetslip={handleSelectBetslip} purchasedBetslipIds={purchasedBetslipIds} />}
          {currentView === 'betslip-details' && selectedBetslip && <BetslipDetailsPage betslip={selectedBetslip} user={user} userProfile={userProfile} isPurchased={purchasedBetslipIds.has(selectedBetslip.id)} onPurchase={handlePurchase} />}
          {currentView === 'my-betslips' && <MyBetslipsPage allBetslips={betslips} purchasedBetslipIds={purchasedBetslipIds} onSelectBetslip={handleSelectBetslip} />}
          {currentView === 'subscribe' && <SubscribePage allTipsters={tipsters} subscribedTipsterIds={subscribedTipsterIds} onToggleSubscription={handleToggleSubscription} />}
          {currentView === 'account' && <AccountPage 
              user={user} 
              onLogout={handleLogout} 
              onNavigateToMyBetslips={() => setCurrentView('my-betslips')}
              onNavigateToAdmin={() => setCurrentView('admin')}
              onNavigateToBetHistory={() => setCurrentView('bet-history')}
              onNavigateToPaymentHistory={() => setCurrentView('payment-history')}
              onNavigateToProfileSettings={() => setCurrentView('profile-settings')}
              userProfile={userProfile}
          />}
          {currentView === 'admin' && <AdminPage 
            userProfile={userProfile}
            onAddBetslip={handleAddBetslip} onUpdateBetslip={handleUpdateBetslip} onDeleteBetslip={handleDeleteBetslip} betslips={betslips}
            onAddTipster={handleAddTipster} onUpdateTipster={handleUpdateTipster} onDeleteTipster={handleDeleteTipster} tipsters={tipsters}
            onAddBanner={handleAddBanner} onUpdateBanner={handleUpdateBanner} onDeleteBanner={handleDeleteBanner} banners={banners}
            onSetUserRole={handleSetUserRole}
          />}
          {currentView === 'bet-history' && <BetHistoryPage allBetslips={betslips} purchasedBetslipIds={purchasedBetslipIds} onSelectBetslip={handleSelectBetslip} />}
          {currentView === 'payment-history' && <PaymentHistoryPage allBetslips={betslips} purchaseHistory={purchaseHistory} />}
          {currentView === 'profile-settings' && <ProfileSettingsPage user={user} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onChangePassword={handlePasswordReset} />}

      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1a1a1a] h-20 flex items-center justify-around border-t border-gray-800 rounded-t-2xl">
        <NavItem icon={<HomeIcon isActive={currentView === 'home'} />} label="Home" isActive={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavItem icon={<BetslipsIcon isActive={currentView === 'betslips'} />} label="Betslips" isActive={currentView === 'betslips'} onClick={() => setCurrentView('betslips')} />
        <NavItem icon={<SubscribeIcon isActive={currentView === 'subscribe'} />} label="Subscribe" isActive={currentView === 'subscribe'} onClick={() => setCurrentView('subscribe')} />
        <NavItem icon={<AccountIcon isActive={currentView === 'account'} />} label="Account" isActive={currentView === 'account'} onClick={() => setCurrentView('account')} />
      </nav>
    </div>
  );
};

export default App;