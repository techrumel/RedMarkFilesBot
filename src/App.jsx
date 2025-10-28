/* eslint-disable no-undef */ 
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// --- Firebase Imports ---
import { initializeApp, setLogLevel } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, addDoc, collection, increment, serverTimestamp, query } from 'firebase/firestore';

// --- Icons ---
const HomeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> );
const TaskIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25v-8.25a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 11.25h.008v.008h-.008V11.25Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm-3-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm-3-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm-3-3h.008v.008h-.008v-.008Z" /></svg> );
const CommunityIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0-3.071-2.317M15.75 15.75V18.75m-3.75 0h.008v.008h-.008V18.75m-3.75 0h.008v.008h-.008V18.75m-3.75 0h.008v.008h-.008V18.75M3 3h18M3 6h18M3 9h18M3 12h18M3 15h18" /></svg> );
const ProfileIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> );
const AdminIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M3.75 12H7.5" /></svg> );
const LockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg> );
const TokenIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg> );
const VideoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg> );
const OfferIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg> );
const VisitIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.507 0 1.011-.017 1.511-.052M12 21c-.507 0-1.011-.017-1.511-.052M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3a9.004 9.004 0 0 1 8.716 6.747M12 3c.507 0 1.011.017 1.511.052M12 3c-.507 0-1.011-.017-1.511-.052M6.637 10.87a.75.75 0 0 1-.447-.145l-3.24-2.348a.75.75 0 0 1 0-1.212l3.24-2.348a.75.75 0 0 1 .998 1.363L4.893 8.39l2.292 1.652a.75.75 0 0 1-.548 1.328Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.363 10.87a.75.75 0 0 1-.548-1.328l2.292-1.652-2.744-1.98a.75.75 0 0 1 .55-1.363l3.24 2.348a.75.75 0 0 1 0 1.212l-3.24 2.348a.75.75 0 0 1-.447.145Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" /></svg> );

// --- বিশেষ দ্রষ্টব্য: অ্যাডমিন আইডি --- // টেলিগ্রামের @userinfobot থেকে আপনার আইডিটি নিন এবং নিচের স্ট্রিংটি পরিবর্তন করুন। // Example: const ADMIN_TELEGRAM_ID = "987654321"; const ADMIN_TELEGRAM_ID = "123456789"; // <<<--- আপনার সঠিক টেলিগ্রাম ইউজার আইডি এখানে বসান

// --- গ্লোবাল ভেরিয়েবল সেটআপ --- // Use process.env (standard for build tools) or fallback const appId = import.meta.env.VITE_APP_ID || (typeof __app_id !== 'undefined' ? __app_id : 'default-redmarkfiles-app');

// --- Firebase কনফিগারেশন লোডার --- let firebaseConfig; const userFirebaseConfig = { apiKey: "AIzaSyDBirFe0gejc1CkcPc0pdSUEufODrNYR78", // Warning: Keep API keys out of client-side code in production authDomain: "redmarkfiles.firebaseapp.com", projectId: "redmarkfiles", storageBucket: "https://www.google.com/search?q=redmarkfiles.appspot.com", messagingSenderId: "94920695515", appId: "1:94920695515:web:8142bf6289964ca381b6fe", measurementId: "G-BWG56DW2KZ" };

try { // Prefer Vercel/Vite environment variable const configJson = import.meta.env.VITE_FIREBASE_CONFIG;

if (configJson) {
    firebaseConfig = JSON.parse(configJson);
    console.log("এনভায়রনমেন্ট ভেরিয়েবল (VITE_FIREBASE_CONFIG) থেকে Firebase কনফিগারেশন লোড করা হয়েছে।");
// Fallback for environments where __firebase_config might be injected
} else if (typeof __firebase_config !== 'undefined' && __firebase_config) { 
     firebaseConfig = JSON.parse(__firebase_config);
     console.log("পরিবেশ (__firebase_config) থেকে Firebase কনফিগারেশন লোড করা হয়েছে।");
} else {
    firebaseConfig = userFirebaseConfig;
    console.warn("ব্যবহারকারীর হার্ডকোডেড Firebase কনফিগারেশন ব্যবহার করা হচ্ছে (শুধুমাত্র ডেভেলপমেন্টের জন্য উপযুক্ত)।");
}
} catch (e) { console.error("Firebase config পার্স করতে সমস্যা হয়েছে:", e); firebaseConfig = userFirebaseConfig; // Fallback console.warn("ফলব্যাক হিসেবে হার্ডকোডেড Firebase কনফিগারেশন ব্যবহার করা হচ্ছে।"); }

// Fallback for initialAuthToken if needed const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Task Button Component (Moved outside App) --- const SmallTaskButton = ({ onClick, disabled, isLoading, title, token, icon, gradient, isSdkReady }) => ( <button onClick={onClick} disabled={disabled || !isSdkReady} className={group relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-2xl text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed ${gradient} ${isLoading ? 'cursor-wait' : ''} ${!isSdkReady ? 'opacity-40 cursor-not-allowed' : ''}} role="button" > <div className="absolute top-0 left-[-75%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[50%] transition-all duration-700 ease-out"></div> <div className={z-10 mb-2 p-3 rounded-full ${isLoading ? 'bg-black/40' : 'bg-black/20'}}> {icon} </div> <span className="z-10 text-sm font-semibold">{title}</span> <span className="z-10 text-xs font-bold bg-white/25 px-2 py-0.5 rounded-full mt-1"> +{token} </span> {isLoading && ( <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm"> <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </div> )} </button> ); SmallTaskButton.propTypes = { onClick: PropTypes.func.isRequired, disabled: PropTypes.bool.isRequired, isLoading: PropTypes.bool, title: PropTypes.string.isRequired, token: PropTypes.number.isRequired, icon: PropTypes.node.isRequired, gradient: PropTypes.string.isRequired, isSdkReady: PropTypes.bool.isRequired };

// --- Main App Component --- function App() { const [currentTab, setCurrentTab] = useState('home'); const [db, setDb] = useState(null); const [auth, setAuth] = useState(null); const [userId, setUserId] = useState(null); const [telegramUser, setTelegramUser] = useState(null); const [isAuthReady, setIsAuthReady] = useState(false); const [isSdkReady, setIsSdkReady] = useState(false); const [userProfile, setUserProfile] = useState(null); const [premiumVideos, setPremiumVideos] = useState([]); const [communityVideos, setCommunityVideos] = useState([]); const [isLoading, setIsLoading] = useState(false); const [message, setMessage] = useState(null);

// Use useRef for timeout ID - Call must be at top level
const messageTimeoutRef = useRef(null); 
const userIdRef = useRef(null); // Ref for userId in listener

// Use useCallback for showMessage to stabilize its reference
const showMessage = useCallback((msg, duration = 3500) => {
    if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
    }
    setMessage(msg);
    messageTimeoutRef.current = setTimeout(() => {
         setMessage(null);
         messageTimeoutRef.current = null;
    }, duration);
}, []); // Empty dependency array means this function is created once

const isAdmin = useMemo(() => (telegramUser?.id?.toString() ?? '') === ADMIN_TELEGRAM_ID, [telegramUser]);

// --- 1. Initializations ---
useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const originalFetch = window.fetch;
    window.fetch = (url, options) => {
        let newUrl = url;
        if (typeof url === 'string' && url.startsWith('//')) { newUrl = `https:${url}`; }
        const context = typeof globalThis !== 'undefined' ? globalThis : window; 
        return originalFetch.call(context, newUrl, options);
    };
    
    let app;
    try {
        app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setLogLevel('debug'); 
        setAuth(authInstance);
        setDb(dbInstance);
        console.log("Firebase ইনিশিয়ালাইজ হয়েছে। Project:", firebaseConfig.projectId);
    } catch (e) { 
        console.error("Firebase ইনিশিয়ালাইজেশন মারাত্মক ব্যর্থ:", e);
        showMessage("গুরুত্বপূর্ণ সিস্টেম লোড হতে ব্যর্থ। অ্যাপ রিলোড করুন।");
        setIsAuthReady(false); 
        return; 
    }

     if (!document.querySelector('script[src="https://libtl.com/sdk.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://libtl.com/sdk.js';
        script.dataset.zone = '10092910'; 
        script.dataset.sdk = 'show_10092910'; 
        script.async = true;
        script.onload = () => { console.log("Monetag SDK লোড হয়েছে।"); setIsSdkReady(true); };
        script.onerror = () => { console.error("Monetag SDK লোড হতে ব্যর্থ।"); showMessage("অ্যাড সিস্টেম লোড হতে ব্যর্থ।"); setIsSdkReady(false); };
        document.head.appendChild(script);
    } else {
         console.log("Monetag SDK আগে থেকেই লোড করা আছে।");
         setTimeout(() => {
             const sdkFunc = typeof globalThis !== 'undefined' ? globalThis.show_10092910 : window.show_10092910;
             if (typeof sdkFunc === 'function') { setIsSdkReady(true); } 
             else { console.error("Monetag SDK ফাংশন লোড হয়নি।"); setIsSdkReady(false); }
         }, 500);
    }

     let resolvedTgUser = null; 
     const telegramWindow = typeof globalThis !== 'undefined' ? globalThis.Telegram : window.Telegram;
     if (telegramWindow && telegramWindow.WebApp) {
        try {
            telegramWindow.WebApp.ready(); 
             console.log("Telegram WebApp প্রস্তুত।");
             const getUserData = () => {
                 resolvedTgUser = telegramWindow.WebApp.initDataUnsafe?.user;
                 if (resolvedTgUser && resolvedTgUser.id) {
                     console.log("টেলিগ্রাম ইউজার:", resolvedTgUser);
                     setTelegramUser(resolvedTgUser);
                 } else {
                     console.log("initDataUnsafe ইউজার নেই, সিমুলেটেড ব্যবহার হচ্ছে।");
                     resolvedTgUser = { id: Number.parseInt(ADMIN_TELEGRAM_ID, 10), first_name: "Admin", username: "admin_sim_nodata" };
                     setTelegramUser(resolvedTgUser);
                 }
             }
             getUserData();
             if (!resolvedTgUser?.id) { setTimeout(getUserData, 300); }
        } catch (tgError) {
             console.error("টেলিগ্রাম WebApp.ready() ত্রুটি:", tgError);
             resolvedTgUser = { id: Number.parseInt(ADMIN_TELEGRAM_ID, 10), first_name: "Admin", username: "admin_sim_err" };
             setTelegramUser(resolvedTgUser);
        }
    } else {
        console.warn("টেলিগ্রাম SDK লোড হয়নি। সিমুলেশন মোড।");
        resolvedTgUser = { id: Number.parseInt(ADMIN_TELEGRAM_ID, 10), first_name: "Admin", username: "admin_sim_no_sdk" }; 
        setTelegramUser(resolvedTgUser);
    }

    const authInstance = getAuth(app); 
    const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
        const currentUserIdInListener = userIdRef.current; 
        if (user) {
            if(user.uid !== currentUserIdInListener) { 
                userIdRef.current = user.uid; 
                setUserId(user.uid);
                setTimeout(() => setIsAuthReady(true), 50); 
                console.log("Firebase Auth State: User Logged In:", user.uid, "Anon:", user.isAnonymous);
            } else if (!isAuthReady) {
                 setIsAuthReady(true);
                 console.log("Firebase Auth State: Auth marked ready for existing user:", user.uid);
            }
        } else {
            console.log("Firebase Auth State: No user, attempting sign-in...");
            setIsAuthReady(false); 
            userIdRef.current = null; 
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance);
                }
            } catch (authError) {
                console.error("Firebase সাইন ইন ব্যর্থ:", authError);
                 showMessage("অ্যাকাউন্ট লোড করতে সমস্যা হচ্ছে। অ্যাপ রিলোড করুন।");
            }
        }
    }, (error) => {
        console.error("Firebase Auth Listener Error:", error);
        setMessage("ব্যবহারকারীর অবস্থা যাচাই করতে সমস্যা হচ্ছে।");
        setIsAuthReady(false);
        userIdRef.current = null; 
    });
    
    return () => {
        console.log("অ্যাপ ক্লিনআপ: লিসেনার সরানো হচ্ছে...");
        unsubscribeAuth();
         if (fontLink?.parentNode === document.head) document.head.removeChild(fontLink);
        window.fetch = originalFetch; 
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current); 
    };
}, [showMessage]); // showMessage added as dependency (safe due to useCallback)

// --- 2. Database Listener ---
useEffect(() => {
    if (!isAuthReady || !db || !userId) {
         console.log("ডেটাবেস লিসেনার সেট করার জন্য প্রস্তুত নয়...", { isAuthReady, db: !!db, userId });
        return () => {}; 
    }
     console.log(`ডেটাবেস লিসেনার সেট করা হচ্ছে userId: ${userId}`);
     
     let unsubProfile = () => {};
     let unsubPremium = () => {};
     let unsubCommunity = () => {};

    try {
        // User Profile Listener
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, "data");
        unsubProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                 console.log("প্রোফাইল ডেটা আপডেট:", docSnap.data());
                setUserProfile(docSnap.data());
            } else {
                 console.log(`ব্যবহারকারীর (${userId}) প্রোফাইল নেই, তৈরি করা হচ্ছে...`);
                 if (telegramUser && telegramUser.id) {
                     setDoc(userProfileRef, { 
                         tokenBalance: 0, unlockedVideos: [], joinedAt: serverTimestamp(),
                         telegramId: telegramUser.id, firstName: telegramUser.first_name || '', username: telegramUser.username || ''
                     }).then(() => console.log(`নতুন প্রোফাইল (${userId}) তৈরি হয়েছে।`))
                       .catch(err => console.error(`প্রোফাইল (${userId}) তৈরি করতে Firestore সমস্যা:`, err));
                 } else { 
                     console.warn(`প্রোফাইল (${userId}) তৈরি করা যাচ্ছে না, টেলিগ্রাম ইউজার ডেটা নেই। 1 সেকেন্ড পর আবার চেষ্টা করা হবে...`); 
                     setTimeout(() => {
                        if (telegramUser && telegramUser.id) {
                            setDoc(userProfileRef, { 
                                tokenBalance: 0, unlockedVideos: [], joinedAt: serverTimestamp(),
                                telegramId: telegramUser.id, firstName: telegramUser.first_name || '', username: telegramUser.username || ''
                            }).catch(err => console.error(`প্রোফাইল (${userId}) তৈরি করতে Firestore Retry সমস্যা:`, err));
                        } else {
                            console.error(`প্রোফাইল (${userId}) তৈরি করা সম্ভব নয়, টেলিগ্রাম ইউজার ডেটা পাওয়া যায়নি।`);
                        }
                     }, 1000);
                 }
            }
        }, (error) => console.error("প্রোফাইল স্ন্যাপশট ত্রুটি:", error));

        // Premium Videos Listener
        const premiumVideosRef = collection(db, `artifacts/${appId}/public/data`, "premium_videos");
        const qPremium = query(premiumVideosRef); 
        unsubPremium = onSnapshot(qPremium, (querySnapshot) => {
             console.log(`প্রিমিয়াম ভিডিও আপডেট: ${querySnapshot.size}`);
            const videos = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); 
            setPremiumVideos(videos);
        }, (error) => console.error("প্রিমিয়াম ভিডিও স্ন্যাপশট ত্রুটি:", error));

        // Community Videos Listener
        const communityVideosRef = collection(db, `artifacts/${appId}/public/data`, "community_videos");
        const qCommunity = query(communityVideosRef);
        unsubCommunity = onSnapshot(qCommunity, (querySnapshot) => {
            console.log(`কমিউনিটি ভিডিও আপডেট: ${querySnapshot.size}`);
            const videos = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0)); 
            setCommunityVideos(videos);
        }, (error) => console.error("কমিউনিটি ভিডিও স্ন্যাপশট ত্রুটি:", error));
    } catch (dbError) {
         console.error("ডেটাবেস লিসেনার সেটআপ করতে ত্রুটি:", dbError);
         showMessage("ডেটা লোড করতে সমস্যা হচ্ছে।");
    }
    return () => {
         console.log("ডেটাবেস লিসেনারগুলো সরানো হচ্ছে...");
        unsubProfile(); unsubPremium(); unsubCommunity();
    };
}, [isAuthReady, db, userId, appId, telegramUser, showMessage]); 


// --- Content Rendering ---
const renderContent = () => {
    if (!isAuthReady || userProfile === null) { 
         return (
             <div className="flex flex-col items-center justify-center pt-20 text-center">
                 <svg className="animate-spin h-10 w-10 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                 <p className="text-lg font-medium text-slate-300">প্রোফাইল লোড হচ্ছে...</p>
             </div>
         );
    }
    
    switch (currentTab) {
        case 'home': return <PremiumFeed videos={premiumVideos} userProfile={userProfile} db={db} userId={userId} appId={appId} showMessage={showMessage} setIsLoading={setIsLoading} isLoading={isLoading} setCurrentTab={setCurrentTab} />;
        case 'tasks': return <TaskCenter db={db} userId={userId} appId={appId} showMessage={showMessage} isSdkReady={isSdkReady} />;
        case 'community': return <CommunityFeed videos={communityVideos} db={db} appId={appId} telegramUser={telegramUser} showMessage={showMessage} />;
        case 'profile': return <Profile userProfile={userProfile} telegramUser={telegramUser} />;
        case 'admin': return isAdmin ? <AdminDashboard db={db} appId={appId} showMessage={showMessage} /> : <PremiumFeed videos={premiumVideos} userProfile={userProfile} db={db} userId={userId} appId={appId} showMessage={showMessage} setIsLoading={setIsLoading} isLoading={isLoading} setCurrentTab={setCurrentTab} />; 
        default: return <PremiumFeed videos={premiumVideos} userProfile={userProfile} db={db} userId={userId} appId={appId} showMessage={showMessage} setIsLoading={setIsLoading} isLoading={isLoading} setCurrentTab={setCurrentTab} />;
    }
};

// Initial Loading Screen
if (!auth || !db) { 
    return ( <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-poppins"> <svg className="animate-spin h-10 w-10 text-indigo-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <span className="text-2xl font-semibold">অ্যাপ লোড হচ্ছে...</span> </div> );
}

return (
    <div className="h-screen flex flex-col font-poppins bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 max-w-lg mx-auto shadow-2xl overflow-hidden border border-slate-700 md:rounded-lg">
        {message && ( <div key={Date.now()} className="fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-xl z-50 text-center text-sm font-medium animate-fade-in-down"> {message} </div> )}
        <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700 p-4 shadow-md">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold text-slate-100"> RedMarkFilesBot </h1>
                <div className="flex items-center gap-2 bg-slate-700/60 px-3 py-1.5 rounded-full border border-slate-600 shadow-sm cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setCurrentTab('profile')}>
                    <TokenIcon className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-white text-sm">{userProfile?.tokenBalance ?? 0}</span>
                </div>
            </div>
        </header>
        <main key={currentTab} className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
            {renderContent()}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-800/90 backdrop-blur-lg border-t border-slate-700 grid grid-cols-5 gap-0.5 px-1 py-1.5 md:rounded-b-lg"> 
            <BottomNavItem label="Home" icon={<HomeIcon />} isActive={currentTab === 'home'} onClick={() => setCurrentTab('home')} />
            <BottomNavItem label="Tasks" icon={<TaskIcon />} isActive={currentTab === 'tasks'} onClick={() => setCurrentTab('tasks')} />
            <BottomNavItem label="Community" icon={<CommunityIcon />} isActive={currentTab === 'community'} onClick={() => setCurrentTab('community')} />
            <BottomNavItem label="Profile" icon={<ProfileIcon />} isActive={currentTab === 'profile'} onClick={() => setCurrentTab('profile')} />
            {isAdmin ? ( <BottomNavItem label="Admin" icon={<AdminIcon />} isActive={currentTab === 'admin'} onClick={() => setCurrentTab('admin')} /> ) : ( <div className="flex items-center justify-center p-2"></div> )}
        </nav>
    </div>
);
}

// --- Navigation Button Component --- const BottomNavItem = ({ label, icon, isActive, onClick }) => ( <button onClick={onClick} className={flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group w-full ${isActive ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md scale-100' : 'text-slate-400 hover:text-white hover:bg-slate-700/50 active:bg-slate-700'}} aria-label={label} role="tab" aria-selected={isActive}> {icon} <span className={text-[11px] font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}}>{label}</span> </button> ); BottomNavItem.propTypes = { label: PropTypes.string.isRequired, icon: PropTypes.node.isRequired, isActive: PropTypes.bool.isRequired, onClick: PropTypes.func.isRequired };

// --- Premium Feed Component --- function PremiumFeed({ videos, userProfile, db, userId, appId, showMessage, setIsLoading, isLoading, setCurrentTab }) { const [unlocked, setUnlocked] = useState({}); useEffect(() => { const unlockedIds = userProfile?.unlockedVideos; if (unlockedIds && Array.isArray(unlockedIds)) { const initialUnlocked = unlockedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}); setUnlocked(initialUnlocked); } else { setUnlocked({}); } }, [userProfile?.unlockedVideos]); const handleUnlock = async (video) => { const cost = video.tokenCost || 5; if ((userProfile?.tokenBalance ?? 0) < cost) { showMessage("অপর্যাপ্ত টোকেন! টাস্ক সম্পন্ন করে টোকেন আয় করুন।"); if(setCurrentTab) setCurrentTab('tasks'); return; } if (isLoading) return; setIsLoading(true); try { const userProfileRef = doc(db, artifacts/${appId}/users/${userId}/profile, "data"); const currentUnlocked = Array.isArray(userProfile?.unlockedVideos) ? userProfile.unlockedVideos : []; const updatedUnlocked = [...new Set([...currentUnlocked, video.id])]; await setDoc(userProfileRef, { tokenBalance: increment(-cost), unlockedVideos: updatedUnlocked }, { merge: true }); setUnlocked(prev => ({ ...prev, [video.id]: true })); } catch (error) { console.error("আনলক করার সময় Firestore ত্রুটি:", error); showMessage("ভিডিও আনলক করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"); } finally { setIsLoading(false); } }; const getPlaceholderUrl = (title = 'Video') => { const bgColor = '1e293b'; const textColor = '94a3b8'; const shortTitle = title.toLowerCase().replace(/[^a-z0-9\\s-]/g, '').replace(/\s+/g, '-').substring(0, 20); return https://placehold.co/600x338/${bgColor}/${textColor}?text=${encodeURIComponent(shortTitle+'...')}&font=poppins; } return ( <div> <h2 className="text-2xl font-semibold mb-5 text-slate-200 flex items-center"><HomeIcon className="w-6 h-6 mr-2 text-indigo-400"/> আজকের ভাইরাল 🔥</h2> {videos.length === 0 && ( <div className="text-center text-slate-400 mt-12 text-lg px-4 py-8 bg-slate-800 rounded-2xl border border-slate-700"> <p>আজকের জন্য কোনো প্রিমিয়াম ভিডিও নেই।</p> <p className="text-sm mt-2">অ্যাডমিন শীঘ্রই নতুন ভিডিও যোগ করবেন।</p> </div> )} <div className="space-y-6"> {videos.map(video => { const isUnlocked = unlocked[video.id]; const cost = video.tokenCost || 5; const effectiveThumbnailUrl = video.thumbnailUrl && video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : getPlaceholderUrl(video.title); return ( <div key={video.id} className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 transition-all duration-300 hover:shadow-lg hover:border-slate-600"> {isUnlocked ? ( <div className="aspect-video relative group bg-black"> <iframe className="w-full h-full border-0" src={${video.videoUrl.replaceAll("watch?v=", "embed/")}?autoplay=0&modestbranding=1&rel=0&iv_load_policy=3} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy"></iframe> <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"> <h3 className="text-white text-sm font-medium truncate">{video.title}</h3> </div> </div> ) : ( <div role="button" tabIndex={0} className="relative aspect-video bg-slate-700 group cursor-pointer" onClick={() => !isLoading && handleUnlock(video)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isLoading) handleUnlock(video); }} aria-label={Unlock ${video.title} for ${cost} tokens}> <img src={effectiveThumbnailUrl} alt={Locked: ${video.title}} onError={(e) => { e.target.onerror = null; e.target.src=getPlaceholderUrl(video.title); }} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur" loading="lazy" /> <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/80 to-black/40 p-4 transition-colors duration-300 group-hover:bg-black/60"> <div className="bg-slate-900/60 p-4 rounded-full mb-3 shadow-lg backdrop-blur-sm border border-slate-700"> <LockIcon className="w-10 h-10 text-indigo-300" /> </div> <h3 className="text-lg font-semibold text-white text-center drop-shadow-md">{video.title}</h3> <p className="text-sm text-slate-300 mt-1 flex items-center bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm"> <TokenIcon className="w-4 h-4 mr-1 text-yellow-300"/> {cost} টোকেন প্রয়োজন </p> </div> <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"> <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-4 shadow-xl backdrop-blur-sm border border-indigo-500/50"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white"> <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /> </svg> </div> </div> {isLoading && ( <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl z-10"> <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </div> )} </div> )} {!isUnlocked && (userProfile?.tokenBalance ?? 0) < cost && ( <div className="p-3 text-center bg-yellow-900/30 border-t border-yellow-700/50"> <p className="text-xs text-yellow-300"> টোকেন প্রয়োজন? <button onClick={() => setCurrentTab('tasks')} className="font-semibold underline hover:text-yellow-200 focus:outline-none">এখানে টাস্ক সম্পন্ন করুন!</button> </p> </div> )} </div> ); })} </div> </div> ); } PremiumFeed.propTypes = { videos: PropTypes.array.isRequired, userProfile: PropTypes.object, db: PropTypes.object, userId: PropTypes.string, appId: PropTypes.string.isRequired, showMessage: PropTypes.func.isRequired, setIsLoading: PropTypes.func.isRequired, isLoading: PropTypes.bool.isRequired, setCurrentTab: PropTypes.func.isRequired };

// --- Task Center Component --- function TaskCenter({ db, userId, appId, showMessage, isSdkReady }) { const [isLoading, setIsLoading] = useState(null); const handleTask = useCallback(async (taskType, tokenAmount) => { if (isLoading) return; if (!isSdkReady) { showMessage("⏳ অ্যাড সিস্টেম এখনো প্রস্তুত নয়।"); return; } setIsLoading(taskType); const sdkFunc = typeof globalThis !== 'undefined' ? globalThis.show_10092910 : window.show_10092910; if (typeof sdkFunc !== 'function') { showMessage("❌ অ্যাড লোড হতে সমস্যা। রিলোড করুন।"); setIsLoading(null); return; } console.log(${taskType} টাস্ক শুরু...); let adPromise; try { await new Promise(resolve => setTimeout(resolve, 500)); if (taskType === 'video') adPromise = sdkFunc(); else if (['offer', 'visit'].includes(taskType)) adPromise = sdkFunc('pop'); else { console.warn("Unknown task:", taskType); setIsLoading(null); return; } adPromise.then(async () => { console.log(${taskType} টাস্ক সফল! ${tokenAmount} টোকেন যোগ হচ্ছে...); try { const userProfileRef = doc(db, artifacts/${appId}/users/${userId}/profile, "data"); await setDoc(userProfileRef, { tokenBalance: increment(tokenAmount) }, { merge: true }); showMessage(✅ +${tokenAmount} টোকেন অর্জিত! 🎉); } catch (error) { console.error("Firebase টোকেন আপডেট ত্রুটি:", error); showMessage("⚠️ টোকেন যোগ করতে সমস্যা।"); } finally { setIsLoading(null); } }).catch(e => { console.error(Monetag ${taskType} অ্যাড ত্রুটি:, e); let msg = "❌ অ্যাড দেখাতে সমস্যা।"; if (e?.message?.includes("not ready")) msg = "⏳ অ্যাড প্রস্তুত নয়। আবার চেষ্টা করুন।"; else if (e?.message?.includes("verify")) msg = "🔒 অ্যাড ভেরিফাই করা যায়নি। নেটওয়ার্ক দেখুন।"; else if (e?.message?.includes("frequency")) msg = "⏱️ আপাতত আর অ্যাড সম্ভব নয়। পরে চেষ্টা করুন।"; showMessage(msg); setIsLoading(null); }); } catch (e) { console.error("Monetag কল ত্রুটি:", e); showMessage("❌ অ্যাড শুরু করতে সমস্যা।"); setIsLoading(null); } }, [isLoading, isSdkReady, showMessage, db, appId, userId]);

return ( <div className="group"> <h2 className="text-2xl font-semibold mb-3 text-slate-200 flex items-center"><TaskIcon className="w-6 h-6 mr-2 text-green-400"/> টাস্ক সেন্টার 💰</h2> <p className="mb-6 text-base text-slate-400">টোকেন আয় করতে নিচের টাস্কগুলো সম্পূর্ণ করুন।</p> <div className="grid grid-cols-3 gap-3 md:gap-4"> <SmallTaskButton onClick={() => handleTask('video', 1)} disabled={isLoading !== null} isLoading={isLoading === 'video'} title="ভিডিও দেখুন" token={1} icon={<VideoIcon className="w-5 h-5 md:w-6 md:h-6" />} gradient="bg-gradient-to-br from-green-500 to-emerald-600 hover:shadow-emerald-500/30 group" isSdkReady={isSdkReady} /> <SmallTaskButton onClick={() => handleTask('offer', 10)} disabled={isLoading !== null} isLoading={isLoading === 'offer'} title="অফার" token={10} icon={<OfferIcon className="w-5 h-5 md:w-6 md:h-6" />} gradient="bg-gradient-to-br from-purple-500 to-indigo-600 hover:shadow-indigo-500/30 group" isSdkReady={isSdkReady} /> <SmallTaskButton onClick={() => handleTask('visit', 2)} disabled={isLoading !== null} isLoading={isLoading === 'visit'} title="ভিজিট" token={2} icon={<VisitIcon className="w-5 h-5 md:w-6 md:h-6" />} gradient="bg-gradient-to-br from-sky-500 to-cyan-600 hover:shadow-cyan-500/30 group" isSdkReady={isSdkReady} /> </div> {!isSdkReady && ( <div className="text-center text-yellow-500 text-sm mt-5 px-4 py-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg animate-pulse"> ⏳ অ্যাড সিস্টেম প্রস্তুত হচ্ছে... </div> )} <div className="mt-10 p-4 bg-slate-800 rounded-2xl text-center text-slate-500 text-xs border border-slate-700"> (ব্যানার অ্যাড এখানে দেখানো হবে) </div> </div> ); }
TaskCenter.propTypes = { db: PropTypes.object, userId: PropTypes.string, appId: PropTypes.string.isRequired, showMessage: PropTypes.func.isRequired, isSdkReady: PropTypes.bool.isRequired };

// --- Community Feed Component --- function CommunityFeed({ videos, db, appId, telegramUser, showMessage }) { const [videoUrl, setVideoUrl] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false); const handleSubmit = async (e) => { e.preventDefault(); let isValidUrl = false; try { const url = new URL(videoUrl); isValidUrl = ['http:', 'https:'].includes(url.protocol); } catch { /* Ignore */ } if (!isValidUrl) { showMessage("⚠️ সঠিক URL দিন (http:// বা https://)।"); return; } if (isSubmitting) return; setIsSubmitting(true); try { const communityVideosRef = collection(db, artifacts/${appId}/public/data, "community_videos"); await addDoc(communityVideosRef, { url: videoUrl, submittedBy: telegramUser?.first_name || "Unknown", submittedById: telegramUser?.id || "unknown", submittedAt: serverTimestamp(), status: "pending" }); setVideoUrl(""); showMessage("✅ ভিডিও জমা হয়েছে!"); } catch (error) { console.error("কমিউনিটি ভিডিও সাবমিট ত্রুটি:", error); showMessage("❌ জমা দিতে সমস্যা হয়েছে।"); } finally { setIsSubmitting(false); } }; return ( <div> <h2 className="text-2xl font-semibold mb-3 text-slate-200 flex items-center"><CommunityIcon className="w-6 h-6 mr-2 text-yellow-400"/> কমিউনিটি ফিড 🌐</h2> <p className="mb-5 text-base text-slate-400">অন্যদের ভিডিও দেখুন বা আপনার লিঙ্ক জমা দিন।</p> <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-800 border border-slate-700 rounded-2xl space-y-4 shadow-lg"> <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube, Facebook, TikTok ভিডিও লিঙ্ক..." className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 text-sm" required /> <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg active:scale-95"> {isSubmitting ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle> <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path> </svg><span>জমা হচ্ছে...</span></> ) : ( "ভিডিও লিঙ্ক জমা দিন" )} </button> </form> <h3 className="text-xl font-semibold mb-4 text-slate-300">সাম্প্রতিক জমা</h3> <div className="space-y-4"> {videos.length === 0 && <p className="text-center text-slate-500 mt-8 px-4">এখনো কোনো ভিডিও জমা পড়েনি।</p>} {videos.map(video => ( <div key={video.id} className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700 hover:bg-slate-700/50 transition-colors duration-200"> <p className="text-xs text-slate-400 mb-1.5 flex items-center"> <ProfileIcon className="w-4 h-4 mr-1.5 inline text-slate-500"/> জমা: <span className="font-medium text-slate-300 ml-1">{video.submittedBy}</span> </p> <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline break-all text-sm leading-relaxed line-clamp-2">{video.url}</a> <p className="text-xs text-slate-500 mt-2 text-right"> {video.submittedAt ? new Date(video.submittedAt.seconds * 1000).toLocaleString('en-GB', { timeStyle: 'short', dateStyle: 'short'}) : ''} </p> </div> ))} </div> <div className="mt-10 p-4 bg-slate-800 rounded-2xl text-center text-slate-500 text-xs border border-slate-700"> (কমিউনিটি ফিড ব্যানার অ্যাড) </div> </div> ); } CommunityFeed.propTypes = { videos: PropTypes.array.isRequired, db: PropTypes.object, appId: PropTypes.string.isRequired, telegramUser: PropTypes.object, showMessage: PropTypes.func.isRequired };

// --- Profile Component --- function Profile({ userProfile, telegramUser }) { const joinedDate = userProfile?.joinedAt ? new Date(userProfile.joinedAt.seconds * 1000).toLocaleDateString('en-GB') : 'N/A'; return ( <div className="space-y-6 pb-6"> <h2 className="text-2xl font-semibold mb-0 text-slate-200 flex items-center"><ProfileIcon className="w-6 h-6 mr-2 text-blue-400"/> আমার প্রোফাইল</h2> <div className="flex flex-col items-center pt-4"> <div className="relative mb-4"> <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-5xl font-bold text-white shadow-xl border-4 border-slate-700 ring-4 ring-purple-500/30"> {(telegramUser?.first_name?.charAt(0) ?? 'U').toUpperCase()} </div> </div> <h2 className="text-2xl font-semibold text-white"> {telegramUser?.first_name || 'ব্যবহারকারী'} {telegramUser?.last_name || ''} </h2> {telegramUser?.username && (<p className="text-sm text-indigo-400">@{telegramUser.username}</p> )} <p className="text-xs text-slate-500 mt-1">Telegram ID: {telegramUser?.id || 'N/A'}</p> </div> <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-6 rounded-2xl shadow-xl text-white border border-indigo-500/50 relative overflow-hidden"> <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-lg opacity-40"></div> <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/5 rounded-full blur-xl opacity-40"></div> <p className="text-base font-medium opacity-80 mb-2 relative z-10">বর্তমান ব্যালেন্স</p> <div className="flex items-center gap-3 relative z-10"> <TokenIcon className="w-10 h-10 text-yellow-300 drop-shadow-lg" /> <p className="text-5xl font-extrabold tracking-tight"> {userProfile?.tokenBalance ?? 0} </p> <span className="text-2xl font-semibold opacity-90 mt-1.5">টোকেন</span> </div> </div> <div className="bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700"> <h3 className="text-lg font-semibold text-slate-200 mb-4">পরিসংখ্যান</h3> <div className="space-y-3 text-sm"> <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2"> <span className="flex items-center"><LockIcon className="w-4 h-4 mr-2 inline text-indigo-400"/> আনলকড ভিডিও:</span> <span className="font-semibold text-white text-base">{userProfile?.unlockedVideos?.length || 0}</span> </div> <div className="flex justify-between items-center text-slate-300 pt-1"> <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 inline text-green-400"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /></svg> যোগ দিয়েছেন:</span> <span className="font-semibold text-white">{joinedDate}</span> </div> </div> </div> <div className="p-4 bg-slate-800 rounded-2xl text-center text-slate-500 text-xs border border-slate-700"> (প্রোফাইল ব্যানার অ্যাড) </div> </div> ); } Profile.propTypes = { userProfile: PropTypes.object, telegramUser: PropTypes.object };

// --- Admin Dashboard Component --- function AdminDashboard({ db, appId, showMessage }) { const [title, setTitle] = useState(""); const [videoUrl, setVideoUrl] = useState(""); const [thumbnailUrl, setThumbnailUrl] = useState(""); const [tokenCost, setTokenCost] = useState(5); const [isSubmitting, setIsSubmitting] = useState(false); const handleAddVideo = async (e) => { e.preventDefault(); if (!title.trim() || !videoUrl.trim() || tokenCost < 0) { showMessage("⚠️ ভিডিও টাইটেল, URL এবং সঠিক টোকেন মূল্য দিন।"); return; } try { new URL(videoUrl.trim()); } catch { showMessage("⚠️ সঠিক ভিডিও URL দিন।"); return; } if (thumbnailUrl.trim()) { try { new URL(thumbnailUrl.trim()); } catch { showMessage("⚠️ থাম্বনেইল URL সঠিক নয়।"); return; } } setIsSubmitting(true); try { const premiumVideosRef = collection(db, artifacts/${appId}/public/data, "premium_videos"); const docData = { title: title.trim(), videoUrl: videoUrl.trim(), tokenCost: Number(tokenCost), createdAt: serverTimestamp() }; if (thumbnailUrl.trim()) { docData.thumbnailUrl = thumbnailUrl.trim(); } await addDoc(premiumVideosRef, docData); setTitle(""); setVideoUrl(""); setThumbnailUrl(""); setTokenCost(5); showMessage("✅ নতুন ভিডিও যোগ করা হয়েছে!"); } catch (error) { console.error("অ্যাডমিন: ভিডিও যোগ করতে Firestore ত্রুটি:", error); showMessage(❌ ভিডিও যোগ করতে সমস্যা: ${error.message}); } finally { setIsSubmitting(false); } }; return ( <div> <h2 className="text-2xl font-semibold mb-3 text-slate-200 flex items-center"><AdminIcon className="w-6 h-6 mr-2 text-red-400"/> অ্যাডমিন প্যানেল ⚙️</h2> <p className="mb-5 text-base text-slate-400">নতুন প্রিমিয়াম ভিডিও যোগ করুন।</p> <form onSubmit={handleAddVideo} className="space-y-4 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700"> <div> <label htmlFor="videoTitle" className="block text-sm font-medium text-slate-300 mb-1">ভিডিও টাইটেল <span className="text-red-400"></span></label> <input id="videoTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" required /> </div> <div> <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-300 mb-1">ভিডিও URL (Embed) <span className="text-red-400"></span></label> <input id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.google.com/search?q=https://www.youtube.com/embed/..." className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" required /> <p className="text-xs text-slate-500 mt-1">শুধুমাত্র embed URL ব্যবহার করুন।</p> </div> <div> <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-slate-300 mb-1">থাম্বনেইল URL (Optional)</label> <input id="thumbnailUrl" type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://...image.jpg (খালি রাখা যাবে)" className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" /> <p className="text-xs text-slate-500 mt-1">খালি রাখলে ডিফল্ট placeholder দেখানো হবে।</p> </div> <div> <label htmlFor="tokenCost" className="block text-sm font-medium text-slate-300 mb-1">টোকেন মূল্য <span className="text-red-400">*</span></label> <input id="tokenCost" type="number" min="0" value={tokenCost} onChange={(e) => setTokenCost(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" required /> </div> <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg active:scale-95"> {isSubmitting ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle> <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path> </svg><span>যোগ হচ্ছে...</span></> ) : ( "প্রিমিয়াম ভিডিও যোগ করুন" )} </button> </form> </div> ); } AdminDashboard.propTypes = { db: PropTypes.object, appId: PropTypes.string.isRequired, showMessage: PropTypes.func.isRequired };

export default App;