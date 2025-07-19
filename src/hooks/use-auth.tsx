// src/hooks/use-auth.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleUser = async (rawUser: User | null) => {
    if (rawUser) {
      const userRef = doc(db, 'users', rawUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document in Firestore
        await setDoc(userRef, {
          email: rawUser.email,
          displayName: rawUser.displayName,
          createdAt: serverTimestamp(),
        });
        
        // Create an initial resume for the new user
        const resumesColRef = collection(db, 'users', rawUser.uid, 'resumes');
        await addDoc(resumesColRef, {
            name: 'My First Resume',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // You can add default content here if you want
        });
      }
      
      setUser(rawUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await handleUser(userCredential.user); // Ensure Firestore doc is created
    return userCredential;
  };

  const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await handleUser(result.user);
    return result;
  }
  
  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await handleUser(result.user);
    return result;
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  const value = {
    user,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
