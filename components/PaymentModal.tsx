import React, { useState } from 'react';
import type { Betslip } from '../types';
import { User } from 'firebase/auth';

// Icons
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-[#20C56A]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const LoadingSpinner = () => <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>;
const SuccessTickIcon = () => <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

const SONIC_PESA_API_KEY = 'pk_7fd82b60f1916797516321ebc311bcb1';
const CREATE_ORDER_URL = 'https://sonicpesa.com/api/payment/create';
const ORDER_STATUS_URL = 'https://sonicpesa.com/api/payment/status';

const PaymentModal: React.FC<{ betslip: Betslip; user: User | null; onClose: () => void; onPurchaseSuccess: () => void; }> = ({ betslip, user, onClose, onPurchaseSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('0753466356');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const priceAmount = betslip.price.replace(/[^0-9]/g, '');

    const formatPhoneNumber = (phone: string): string => {
        if (phone.startsWith('0')) {
            return `255${phone.substring(1)}`;
        }
        if (phone.startsWith('+255')) {
            return phone.substring(1);
        }
        return phone;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("Tafadhali ingia kwanza ili uweze kufanya malipo.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formattedPhone = formatPhoneNumber(phoneNumber);
        const amount = parseInt(priceAmount, 10);

        let pollingTimeout: number | null = null;
        let pollInterval: number | null = null;

        const cleanup = () => {
            if (pollInterval) clearInterval(pollInterval);
            if (pollingTimeout) clearTimeout(pollingTimeout);
        };

        try {
            const createResponse = await fetch(CREATE_ORDER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SONIC_PESA_API_KEY}` },
                body: JSON.stringify({
                    phone: formattedPhone,
                    amount: amount,
                    name: user.displayName || 'Kaka User',
                    email: user.email || 'user@example.com'
                })
            });
            const createData = await createResponse.json();
            if (!createResponse.ok || !createData.success) {
                throw new Error(createData.message || 'Imeshindwa kuanzisha malipo.');
            }
            const { order_id } = createData.data;

            pollInterval = window.setInterval(async () => {
                try {
                    const statusResponse = await fetch(ORDER_STATUS_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SONIC_PESA_API_KEY}` },
                        body: JSON.stringify({ order_id })
                    });
                    const statusData = await statusResponse.json();

                    // Using "completed" as the assumed success status based on common practice
                    if (statusData.success && statusData.data.status.toLowerCase() === 'completed') {
                        cleanup();
                        setIsLoading(false);
                        setIsSuccess(true);
                        setTimeout(() => {
                            onPurchaseSuccess();
                            onClose();
                        }, 1500);
                    } else if (statusData.success && (statusData.data.status.toLowerCase() === 'failed' || statusData.data.status.toLowerCase() === 'cancelled')) {
                        cleanup();
                        setError('Malipo yameshindikana au yamesitishwa.');
                        setIsLoading(false);
                    }
                } catch (pollError) {
                    cleanup();
                    setError(pollError instanceof Error ? pollError.message : 'Kuna tatizo la kuangalia hali ya malipo.');
                    setIsLoading(false);
                }
            }, 3000);

            pollingTimeout = window.setTimeout(() => {
                cleanup();
                if (!isSuccess) {
                    setError('Uthibitisho wa malipo unachukua muda mrefu. Tafadhali angalia simu yako na ujaribu tena ikibidi.');
                    setIsLoading(false);
                }
            }, 120000); // 2 minute timeout

        } catch (err) {
            cleanup();
            setError(err instanceof Error ? err.message : 'Kuna tatizo lisilojulikana limetokea.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-sm text-white shadow-xl relative animate-fade-in-up">
                
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 h-80 bg-gradient-to-br from-[#20C56A] to-[#2DD4BF] rounded-2xl">
                        <SuccessTickIcon />
                        <h2 className="text-2xl font-bold">Malipo Yamefanikiwa!</h2>
                        <p className="text-center">Sasa unaweza kuangalia mkeka wako.</p>
                    </div>
                ) : (
                    <>
                        <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                            <CloseIcon />
                        </button>

                        <form onSubmit={handlePayment} className="p-6 space-y-5">
                            <div className="text-center space-y-2">
                                <ShieldCheckIcon />
                                <h2 className="text-xl font-bold">Thibitisha Malipo</h2>
                                <p className="text-sm text-gray-400">Nunua mkeka kutoka kwa {betslip.provider.name}</p>
                            </div>

                            <div className="bg-black/40 rounded-lg p-4 text-center">
                                <p className="text-sm text-gray-300">Kiasi cha kulipa</p>
                                <p className="text-4xl font-extrabold text-[#20C56A] tracking-tighter">{priceAmount}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Namba ya Simu (M-Pesa, Tigo Pesa, n.k.)</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A] text-center text-lg"
                                    placeholder="07XX XXX XXX"
                                    required
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-center text-gray-500 mt-2">Utapokea ujumbe wa USSD kwenye simu yako kuthibitisha malipo.</p>
                            </div>
                            
                            {error && <p className="text-red-400 text-sm text-center -mt-3 mb-2">{error}</p>}
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-4 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isLoading ? <LoadingSpinner /> : `Lipa Sasa (${priceAmount})`}
                            </button>
                        </form>
                    </>
                )}
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
export default PaymentModal;