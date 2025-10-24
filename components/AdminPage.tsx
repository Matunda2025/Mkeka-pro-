import React, { useState, useEffect, useRef } from 'react';
import type { Betslip, Tipster } from '../types';
import { rtdb, db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';


interface AdminPageProps {
  onAddBetslip: (betslip: Omit<Betslip, 'id'>) => Promise<void>;
  onUpdateBetslip: (betslipId: string, betslip: Omit<Betslip, 'id'>) => Promise<void>;
  onDeleteBetslip: (betslipId: string) => Promise<void>;
  onAddTipster: (tipster: Omit<Tipster, 'id' | 'gradientFrom' | 'gradientVia'>) => Promise<void>;
  onUpdateTipster: (tipsterId: string, tipster: Omit<Tipster, 'id' | 'gradientFrom' | 'gradientVia'>) => Promise<void>;
  onDeleteTipster: (tipsterId: string) => Promise<void>;
  betslips: Betslip[];
  tipsters: Tipster[];
}

// Icons for the new UI
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13H5.5z" /><path d="M9 13h2v5a1 1 0 11-2 0v-5z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const LoadingSpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// Icons for Stats Card
const TotalBetslipsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" /></svg>;
const TotalTipstersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AvgOddsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TotalSubscribersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;

// Icons for User Stats Card
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;

// Common Admin Page Styles
const inputClasses = "w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A] border border-transparent focus:border-[#20C56A] transition-all";
const labelClasses = "block text-sm font-semibold text-gray-300 mb-2";
const cardClasses = "bg-[#1a1a1a] p-5 rounded-2xl space-y-4";
const cardTitleClasses = "text-lg font-bold border-b border-gray-700 pb-3 mb-4 text-white";


const calculateTimeLeft = (expiryTimestamp: number) => {
    const difference = expiryTimestamp - new Date().getTime();
    let timeLeft = { hours: 0, minutes: 0, seconds: 0 };
  
    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
};
  
const Countdown: React.FC<{ expiryTimestamp: number }> = ({ expiryTimestamp }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryTimestamp));
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(expiryTimestamp));
      }, 1000);
      return () => clearTimeout(timer);
    });
  
    const { hours, minutes, seconds } = timeLeft;
    
    if (hours > 0 || minutes > 0 || seconds > 0) {
      return <span>{`${hours}h ${minutes}m ${seconds}s`}</span>
    }
    return <span className="text-red-500">Expired</span>;
};

// Stats Card Component
const StatsCard: React.FC<{ betslips: Betslip[]; tipsters: Tipster[]; onViewBetslips: () => void; onViewTipsters: () => void; }> = ({ betslips, tipsters, onViewBetslips, onViewTipsters }) => {
  const totalBetslips = betslips.length;
  const totalTipsters = tipsters.length;
  const averageOdds = totalBetslips > 0 ? (betslips.reduce((sum, b) => sum + b.odds, 0) / totalBetslips).toFixed(2) : '0.00';
  const totalSubscribers = betslips.reduce((sum, b) => sum + b.provider.subscribers, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000) { return `${(num / 1000).toFixed(1)}k`; }
    return num.toString();
  };
  
  return (
    <div className="bg-[#1a1a1a] p-5 rounded-2xl mb-6">
      <h2 className="text-xl font-bold text-white mb-4">App Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onViewBetslips} className="bg-[#1F2921] p-4 rounded-lg flex items-center text-left hover:bg-gray-700 transition-colors w-full">
            <div className="text-[#20C56A]"><TotalBetslipsIcon /></div>
            <div className="ml-3"><p className="font-bold text-2xl text-white">{totalBetslips}</p><p className="text-xs text-gray-400">Total Betslips</p></div>
        </button>
        <button onClick={onViewTipsters} className="bg-[#1F2921] p-4 rounded-lg flex items-center text-left hover:bg-gray-700 transition-colors w-full">
            <div className="text-purple-400"><TotalTipstersIcon /></div>
            <div className="ml-3"><p className="font-bold text-2xl text-white">{totalTipsters}</p><p className="text-xs text-gray-400">Total Tipsters</p></div>
        </button>
        <div className="bg-[#1F2921] p-4 rounded-lg flex items-center"><div className="text-blue-400"><AvgOddsIcon /></div><div className="ml-3"><p className="font-bold text-2xl text-white">{averageOdds}</p><p className="text-xs text-gray-400">Average Odds</p></div></div>
        <div className="bg-[#1F2921] p-4 rounded-lg flex items-center"><div className="text-red-400"><TotalSubscribersIcon /></div><div className="ml-3"><p className="font-bold text-2xl text-white">{formatNumber(totalSubscribers)}</p><p className="text-xs text-gray-400">Subscribers</p></div></div>
      </div>
    </div>
  );
};

// User Activity Stats Card (Now with real data)
type UserStatPeriod = 'siku' | 'wiki' | 'mwezi';

const UserStatsCard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<UserStatPeriod>('siku');
    const [liveUsers, setLiveUsers] = useState(0);
    const [liveChangeDirection, setLiveChangeDirection] = useState<'up' | 'down' | null>(null);
    const [stats, setStats] = useState({
        siku: { newUsers: 0, purchases: 0 },
        wiki: { users: 0, newUsers: 0, purchases: 0 },
        mwezi: { users: 0, newUsers: 0, purchases: 0 },
    });
    
    useEffect(() => {
        const statusRef = ref(rtdb, 'status');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const statuses = snapshot.val();
            const onlineUsers = statuses ? Object.values(statuses).filter((s: any) => s.isOnline).length : 0;
            
            setLiveUsers(currentLiveUsers => {
                if (onlineUsers > currentLiveUsers) {
                    setLiveChangeDirection('up');
                } else if (onlineUsers < currentLiveUsers) {
                    setLiveChangeDirection('down');
                } else {
                    setLiveChangeDirection(null);
                }
                return onlineUsers;
            });
        });
        
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            const now = Timestamp.now();
            const oneDayAgo = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
            const oneWeekAgo = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = Timestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000);

            try {
                const purchasesRef = collection(db, "user_purchases");
                const usersRef = collection(db, "users");

                const [
                    purchasesTodaySnap, purchasesWeekSnap, purchasesMonthSnap,
                    newUsersTodaySnap, newUsersWeekSnap, newUsersMonthSnap,
                    allUsersSnap
                ] = await Promise.all([
                    getDocs(query(purchasesRef, where("purchasedAt", ">=", oneDayAgo))),
                    getDocs(query(purchasesRef, where("purchasedAt", ">=", oneWeekAgo))),
                    getDocs(query(purchasesRef, where("purchasedAt", ">=", oneMonthAgo))),
                    getDocs(query(usersRef, where("createdAt", ">=", oneDayAgo))),
                    getDocs(query(usersRef, where("createdAt", ">=", oneWeekAgo))),
                    getDocs(query(usersRef, where("createdAt", ">=", oneMonthAgo))),
                    getDocs(query(usersRef))
                ]);

                setStats({
                    siku: { newUsers: newUsersTodaySnap.size, purchases: purchasesTodaySnap.size },
                    wiki: { users: allUsersSnap.size, newUsers: newUsersWeekSnap.size, purchases: purchasesWeekSnap.size },
                    mwezi: { users: allUsersSnap.size, newUsers: newUsersMonthSnap.size, purchases: purchasesMonthSnap.size }
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            }
        };
        fetchStats();
    }, []);


    const statsData = {
        siku: { users: liveUsers, ...stats.siku },
        wiki: stats.wiki,
        mwezi: stats.mwezi,
    };

    const data = statsData[activeTab];

    return (
        <div className="bg-[#1a1a1a] p-5 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">User Activity</h2>
                <div className="flex bg-[#1F2921] rounded-full p-1 text-xs">
                    {(['siku', 'wiki', 'mwezi'] as UserStatPeriod[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded-full transition-colors capitalize ${activeTab === tab ? 'bg-[#20C56A] text-white font-bold' : 'text-gray-400'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="font-bold text-2xl text-white flex justify-center items-center">
                      {data.users}
                      {activeTab === 'siku' && liveChangeDirection === 'up' && <ArrowUpIcon className="h-4 w-4 ml-1 text-green-500" />}
                      {activeTab === 'siku' && liveChangeDirection === 'down' && <ArrowDownIcon className="h-4 w-4 ml-1 text-red-500" />}
                    </p>
                    <p className="text-xs text-gray-400">{activeTab === 'siku' ? 'Live Users' : 'Total Users'}</p>
                </div>
                <div><p className="font-bold text-2xl text-white">{data.newUsers}</p><p className="text-xs text-gray-400">New Users</p></div>
                <div><p className="font-bold text-2xl text-white">{data.purchases}</p><p className="text-xs text-gray-400">Purchases</p></div>
            </div>
        </div>
    );
};

interface BetslipFormProps {
    onSave: (betslip: Omit<Betslip, 'id'>) => Promise<void>;
    onBack: () => void;
    tipsters: Tipster[];
    initialData?: Betslip | null;
}

const BetslipForm: React.FC<BetslipFormProps> = ({ onSave, onBack, tipsters, initialData = null }) => {
    const isEditMode = !!initialData;

    const [selectedTipsterId, setSelectedTipsterId] = useState<string>(
        isEditMode ? (tipsters.find(t => t.name === initialData.provider.name)?.id || '') : (tipsters[0]?.id || '')
    );
    const [odds, setOdds] = useState(isEditMode ? initialData.odds.toString() : '');
    const [expiresInDays, setExpiresInDays] = useState(
        isEditMode ? Math.max(1, Math.ceil((initialData.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))).toString() : '1'
    );
    const [price, setPrice] = useState(isEditMode ? initialData.price.replace(/[^0-9]/g, '') : '');
    const [sponsors, setSponsors] = useState<{ name: string; logoUrl: string }[]>(isEditMode ? initialData.sponsors : []);
    const [code, setCode] = useState(isEditMode ? initialData.code || '' : '');
    const [betslipImageFile, setBetslipImageFile] = useState<string>('');
    const [betslipImageUrl, setBetslipImageUrl] = useState<string>(isEditMode ? initialData.betslipImageUrl || '' : '');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileBetslipRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBetslipImageFile(reader.result as string);
                setBetslipImageUrl(''); // Prioritize file upload
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBetslipImageUrl(e.target.value);
        setBetslipImageFile(''); // Prioritize URL input
        if (fileBetslipRef.current) {
            fileBetslipRef.current.value = ''; // Clear file input
        }
    };

    const removeImage = () => {
        setBetslipImageFile('');
        setBetslipImageUrl('');
        if (fileBetslipRef.current) {
            fileBetslipRef.current.value = '';
        }
    };

    const addSponsor = () => {
        setSponsors([...sponsors, { name: '', logoUrl: '' }]);
    };
    const updateSponsor = (index: number, newName: string) => {
        const newSponsors = [...sponsors];
        newSponsors[index].name = newName;
        setSponsors(newSponsors);
    };
    const removeSponsor = (index: number) => {
        setSponsors(sponsors.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        const selectedTipster = tipsters.find(t => t.id === selectedTipsterId);

        if (!selectedTipster || !odds || !price) {
            setError('Tafadhali jaza sehemu zote zinazohitajika.');
            setIsLoading(false);
            return;
        }

        const betslipData: any = {
            provider: {
                name: selectedTipster.name,
                avatarUrl: selectedTipster.imageUrl,
                subscribers: isEditMode ? initialData.provider.subscribers : Math.floor(Math.random() * 5000) + 1000,
            },
            odds: parseFloat(odds),
            status: 'active',
            expiresAt: Date.now() + parseInt(expiresInDays, 10) * 24 * 60 * 60 * 1000,
            price: `Tzs ${parseInt(price, 10).toLocaleString()}/=`,
            sponsors: sponsors.filter(s => s.name),
        };
        
        if (code) betslipData.code = code;
        
        const finalImageUrl = betslipImageFile || betslipImageUrl;
        if (finalImageUrl) betslipData.betslipImageUrl = finalImageUrl;

        try {
            await onSave(betslipData);
            onBack();
        } catch (err) {
            setError(`Failed to ${isEditMode ? 'update' : 'add'} betslip. Please try again.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const previewImageUrl = betslipImageFile || betslipImageUrl;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <button type="button" onClick={onBack} className="flex items-center text-sm font-semibold text-[#20C56A] hover:text-green-300"><BackIcon /> Back to Panel</button>
                 <h2 className="text-xl font-bold text-white text-center">{isEditMode ? 'Edit Betslip' : 'Add New Betslip'}</h2>
                 <div className="w-28"></div>
            </div>
           
            <div className={cardClasses}>
                <h3 className={cardTitleClasses}>Betslip Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Provider</label>
                        <select value={selectedTipsterId} onChange={e => setSelectedTipsterId(e.target.value)} className={inputClasses} required>
                            <option value="" disabled>Select a tipster</option>
                            {tipsters.map(tipster => (
                                <option key={tipster.id} value={tipster.id}>{tipster.name}</option>
                            ))}
                        </select>
                    </div>
                    <div><label className={labelClasses}>Odds</label><input type="number" step="0.01" value={odds} onChange={(e) => setOdds(e.target.value)} className={inputClasses} placeholder="e.g., 2.54" required /></div>
                    <div><label className={labelClasses}>Price (Tzs)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClasses} placeholder="e.g., 1000" required /></div>
                    <div><label className={labelClasses}>Expires in (Days)</label><input type="number" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} className={inputClasses} required /></div>
                    <div className="col-span-2"><label className={labelClasses}>Betslip Code (Optional)</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputClasses} placeholder="e.g., ABC123" /></div>
                </div>

                <div className="pt-4">
                    <label className={labelClasses}>Betslip Image (Optional)</label>
                    <div className="space-y-3">
                        {previewImageUrl ? (
                            <div className="relative group">
                                <img src={previewImageUrl} alt="Betslip Preview" className="w-full h-auto rounded-lg object-cover max-h-48" />
                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                                    <TrashIcon />
                                </button>
                            </div>
                        ) : (
                             <div className="w-full h-32 rounded-lg bg-[#1F2921] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-600">
                                <ImageIcon />
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                             <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileBetslipRef} className="hidden" />
                            <button type="button" onClick={() => fileBetslipRef.current?.click()} className="flex-1 text-sm flex items-center justify-center bg-[#2a2a2a] py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"><UploadIcon /> Upload</button>
                            <span className="text-gray-500 text-xs">OR</span>
                             <input type="text" value={betslipImageUrl} onChange={handleImageUrlChange} className={`${inputClasses} flex-1`} placeholder="Paste URL" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClasses}>
                 <h3 className={cardTitleClasses}>Sponsors (Optional)</h3>
                 <div className="space-y-3">
                    {sponsors.map((sponsor, index) => (
                        <div key={index} className="flex items-center gap-2">
                           <input type="text" value={sponsor.name} onChange={(e) => updateSponsor(index, e.target.value)} className={inputClasses} placeholder="Sponsor Name" />
                           <button type="button" onClick={() => removeSponsor(index)} className="p-2 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/60"><TrashIcon /></button>
                        </div>
                    ))}
                 </div>
                 <button type="button" onClick={addSponsor} className="w-full text-sm font-semibold text-center text-[#20C56A] hover:text-green-300 py-2 rounded-lg border-2 border-dashed border-gray-600 hover:border-[#20C56A] transition-colors">+ Add Sponsor</button>
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? <LoadingSpinnerIcon /> : isEditMode ? 'Update Betslip' : 'Add Betslip'}
            </button>
        </form>
    );
};


const AddTipsterForm: React.FC<{ 
    onSave: (tipster: Omit<Tipster, 'id' | 'gradientFrom' | 'gradientVia'>) => Promise<void>; 
    onBack: () => void;
    initialData?: Tipster | null;
}> = ({ onSave, onBack, initialData = null }) => {
    const isEditMode = !!initialData;

    const [name, setName] = useState(isEditMode ? initialData.name : '');
    const [accuracy, setAccuracy] = useState(isEditMode ? initialData.accuracy.toString() : '');
    const [tipsterImageFile, setTipsterImageFile] = useState<string>('');
    const [tipsterImageUrl, setTipsterImageUrl] = useState<string>(isEditMode ? initialData.imageUrl : '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTipsterImageFile(reader.result as string);
                setTipsterImageUrl('');
            };
            reader.readAsDataURL(file);
        }
    };
    
     const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTipsterImageUrl(e.target.value);
        setTipsterImageFile('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setTipsterImageFile('');
        setTipsterImageUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const generateAvatarFromName = (name: string): string => {
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const context = canvas.getContext('2d');
        if (context) {
            const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
            const bgColor = colors[name.length % colors.length];
            context.fillStyle = bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = 'bold 40px sans-serif';
            context.fillStyle = '#FFF';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(initials, canvas.width / 2, canvas.height / 2);
        }
        return canvas.toDataURL();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!name || !accuracy) {
            setError('Please fill in all required fields.');
            setIsLoading(false);
            return;
        }
        
        const finalImageUrl = tipsterImageFile || tipsterImageUrl || (isEditMode ? initialData.imageUrl : generateAvatarFromName(name));

        try {
            await onSave({
                name,
                accuracy: parseFloat(accuracy),
                imageUrl: finalImageUrl,
            });
            onBack();
        } catch (err) {
            setError(`Failed to ${isEditMode ? 'update' : 'add'} tipster. Please try again.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const previewImageUrl = tipsterImageFile || tipsterImageUrl;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <div className="flex items-center justify-between">
                <button type="button" onClick={onBack} className="flex items-center text-sm font-semibold text-[#20C56A] hover:text-green-300"><BackIcon /> Back to Panel</button>
                 <h2 className="text-xl font-bold text-white text-center">{isEditMode ? 'Edit Tipster' : 'Add New Tipster'}</h2>
                 <div className="w-28"></div>
            </div>
            <div className={cardClasses}>
                <h3 className={cardTitleClasses}>Tipster Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Tipster Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="e.g., John Doe" required /></div>
                    <div><label className={labelClasses}>Accuracy (%)</label><input type="number" step="0.01" value={accuracy} onChange={(e) => setAccuracy(e.target.value)} className={inputClasses} placeholder="e.g., 85.50" required /></div>
                </div>
                
                <div className="pt-4">
                    <label className={labelClasses}>Tipster Image</label>
                    <div className="space-y-3">
                         {previewImageUrl ? (
                            <div className="relative group">
                                <img src={previewImageUrl} alt="Tipster Preview" className="w-full h-auto rounded-lg object-cover max-h-48" />
                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                                    <TrashIcon />
                                </button>
                            </div>
                        ) : (
                             <div className="w-full h-32 rounded-lg bg-[#1F2921] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-600">
                                <ImageIcon />
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                             <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 text-sm flex items-center justify-center bg-[#2a2a2a] py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"><UploadIcon /> Upload</button>
                            <span className="text-gray-500 text-xs">OR</span>
                             <input type="text" value={tipsterImageUrl} onChange={handleImageUrlChange} className={`${inputClasses} flex-1`} placeholder="Paste URL" />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-400 text-center">If no image is provided, an avatar will be generated from the name.</p>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? <LoadingSpinnerIcon /> : isEditMode ? 'Update Tipster' : 'Add Tipster'}
            </button>
        </form>
    );
};

const BetslipListItem: React.FC<{ betslip: Betslip, onEdit: () => void; onDelete: () => void; }> = ({ betslip, onEdit, onDelete }) => (
    <div className="bg-[#1F2921] p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <img src={betslip.provider.avatarUrl} alt={betslip.provider.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
                <p className="font-bold text-white">{betslip.provider.name}</p>
                <p className="text-xs text-gray-400">Odds: {betslip.odds.toFixed(2)}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="font-semibold text-white">{betslip.price}</p>
                <p className="text-xs text-gray-400"><Countdown expiryTimestamp={betslip.expiresAt} /></p>
            </div>
             <div className="flex items-center space-x-2">
                <button onClick={onEdit} className="p-2 bg-blue-900/40 text-blue-300 rounded-lg hover:bg-blue-900/60"><EditIcon /></button>
                <button onClick={onDelete} className="p-2 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/60"><TrashIcon /></button>
            </div>
        </div>
    </div>
);

const BetslipListView: React.FC<{ betslips: Betslip[]; onBack: () => void; onEdit: (b: Betslip) => void; onDelete: (id: string) => void; }> = ({ betslips, onBack, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={onBack} className="flex items-center text-sm font-semibold text-[#20C56A] hover:text-green-300"><BackIcon /> Back to Panel</button>
                 <h2 className="text-xl font-bold text-white text-center">All Betslips</h2>
                 <div className="w-28"></div>
            </div>
            {betslips.length > 0 ? (
                 <div className="space-y-3">
                    {betslips.map(betslip => <BetslipListItem key={betslip.id} betslip={betslip} onEdit={() => onEdit(betslip)} onDelete={() => onDelete(betslip.id)} />)}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-400">No betslips have been added yet.</p>
                </div>
            )}
        </div>
    );
};

const TipsterListItem: React.FC<{ tipster: Tipster, onEdit: () => void; onDelete: () => void; }> = ({ tipster, onEdit, onDelete }) => (
    <div className="bg-[#1F2921] p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <img src={tipster.imageUrl} alt={tipster.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
                <p className="font-bold text-white">{tipster.name}</p>
                <p className="text-xs text-gray-400">Accuracy: {tipster.accuracy.toFixed(2)}%</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={onEdit} className="p-2 bg-blue-900/40 text-blue-300 rounded-lg hover:bg-blue-900/60"><EditIcon /></button>
            <button onClick={onDelete} className="p-2 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/60"><TrashIcon /></button>
        </div>
    </div>
);

const TipsterListView: React.FC<{ tipsters: Tipster[]; onBack: () => void; onEdit: (t: Tipster) => void; onDelete: (id: string) => void; }> = ({ tipsters, onBack, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={onBack} className="flex items-center text-sm font-semibold text-[#20C56A] hover:text-green-300"><BackIcon /> Back to Panel</button>
                 <h2 className="text-xl font-bold text-white text-center">All Tipsters</h2>
                 <div className="w-28"></div>
            </div>
            {tipsters.length > 0 ? (
                 <div className="space-y-3">
                    {tipsters.map(tipster => <TipsterListItem key={tipster.id} tipster={tipster} onEdit={() => onEdit(tipster)} onDelete={() => onDelete(tipster.id)} />)}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-400">No tipsters have been added yet.</p>
                </div>
            )}
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ onAddBetslip, onUpdateBetslip, onDeleteBetslip, onAddTipster, onUpdateTipster, onDeleteTipster, betslips, tipsters }) => {
  type View = 'main' | 'add-betslip' | 'edit-betslip' | 'add-tipster' | 'edit-tipster' | 'view-betslips' | 'view-tipsters';
  const [currentView, setCurrentView] = useState<View>('main');
  const [betslipToEdit, setBetslipToEdit] = useState<Betslip | null>(null);
  const [tipsterToEdit, setTipsterToEdit] = useState<Tipster | null>(null);

  const handleStartEditBetslip = (betslip: Betslip) => {
    setBetslipToEdit(betslip);
    setCurrentView('edit-betslip');
  };
  
  const handleStartEditTipster = (tipster: Tipster) => {
    setTipsterToEdit(tipster);
    setCurrentView('edit-tipster');
  };

  const renderMainContent = () => (
    <>
      <StatsCard 
        betslips={betslips} 
        tipsters={tipsters} 
        onViewBetslips={() => setCurrentView('view-betslips')} 
        onViewTipsters={() => setCurrentView('view-tipsters')} 
      />
      <UserStatsCard />

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setCurrentView('add-betslip')} className="p-6 bg-[#1a1a1a] rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-800 transition-colors">
          <TotalBetslipsIcon />
          <span className="font-bold mt-2 text-white">Add Betslip</span>
        </button>
        <button onClick={() => setCurrentView('add-tipster')} className="p-6 bg-[#1a1a1a] rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-800 transition-colors">
          <TotalTipstersIcon />
          <span className="font-bold mt-2 text-white">Add Tipster</span>
        </button>
      </div>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'add-betslip':
        return <BetslipForm onSave={onAddBetslip} onBack={() => setCurrentView('main')} tipsters={tipsters} />;
      case 'edit-betslip':
        return <BetslipForm initialData={betslipToEdit} onSave={(data) => onUpdateBetslip(betslipToEdit!.id, data)} onBack={() => setCurrentView('view-betslips')} tipsters={tipsters} />;
      case 'add-tipster':
        return <AddTipsterForm onSave={onAddTipster} onBack={() => setCurrentView('main')} />;
      case 'edit-tipster':
        return <AddTipsterForm initialData={tipsterToEdit} onSave={(data) => onUpdateTipster(tipsterToEdit!.id, data)} onBack={() => setCurrentView('view-tipsters')} />;
      case 'view-betslips':
        return <BetslipListView betslips={betslips} onBack={() => setCurrentView('main')} onEdit={handleStartEditBetslip} onDelete={onDeleteBetslip} />;
      case 'view-tipsters':
        return <TipsterListView tipsters={tipsters} onBack={() => setCurrentView('main')} onEdit={handleStartEditTipster} onDelete={onDeleteTipster} />;
      case 'main':
      default:
        return renderMainContent();
    }
  };

  return (
    <main className="px-4 space-y-6">
      {renderContent()}
    </main>
  );
};

export default AdminPage;