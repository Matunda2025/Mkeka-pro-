import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsU4aS5R1DVxdt5fdBzemCWbjClK9ZV3E",
  authDomain: "mkeka-data.firebaseapp.com",
  projectId: "mkeka-data",
  storageBucket: "mkeka-data.appspot.com",
  messagingSenderId: "917618931971",
  appId: "1:917618931971:web:2c72dc8b66f66d96ded136",
  measurementId: "G-NZTN8RYDVT",
  databaseURL: "https://mkeka-data-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service and storage service
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Enable offline persistence for Firestore.
// This allows the app to work offline and helps with flaky connections.
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // This can happen if you have multiple tabs open.
      console.warn("Firestore persistence failed, likely due to multiple tabs being open.");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("This browser does not support Firestore offline persistence.");
    }
  });