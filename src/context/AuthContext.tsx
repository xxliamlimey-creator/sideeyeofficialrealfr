import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { StaffModel, StaffRole } from '../types';

export const SUPER_ADMIN_EMAIL = 'xxliamlimey@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthorizedStaff: boolean;
  isSuperAdmin: boolean;
  staffRole: StaffRole | null;
  staffRecord: StaffModel | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAuthorizedStaff: false,
  isSuperAdmin: false,
  staffRole: null,
  staffRecord: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  authError: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthorizedStaff, setIsAuthorizedStaff] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const [staffRecord, setStaffRecord] = useState<StaffModel | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkStaffStatus = async (user: User | null) => {
    if (!user || !user.email) {
      setIsAuthorizedStaff(false);
      setIsSuperAdmin(false);
      setStaffRole(null);
      setStaffRecord(null);
      return;
    }

    const email = user.email.toLowerCase();
    const isOwner = email === SUPER_ADMIN_EMAIL.toLowerCase();

    if (isOwner) {
      // Owner is always super admin
      setIsSuperAdmin(true);
      setIsAuthorizedStaff(true);
      setStaffRole('owner');
      setStaffRecord({
        id: user.uid,
        email: user.email,
        role: 'owner',
        displayName: user.displayName || 'Owner',
        addedAt: new Date().toISOString(),
        addedBy: 'system',
        isSuperAdmin: true,
      });
      return;
    }

    // Check staff collection for other accounts
    try {
      // Try UID doc first, then check email-based query if permitted
      const staffDocRef = doc(db, 'staff', user.uid);
      const staffSnap = await getDoc(staffDocRef);

      if (staffSnap.exists()) {
        const data = staffSnap.data() as StaffModel;
        setIsAuthorizedStaff(true);
        setIsSuperAdmin(false);
        setStaffRole(data.role || 'developer');
        setStaffRecord(data);
      } else {
        // Not in staff list
        setIsAuthorizedStaff(false);
        setIsSuperAdmin(false);
        setStaffRole(null);
        setStaffRecord(null);
      }
    } catch {
      // Access denied or unlisted
      setIsAuthorizedStaff(false);
      setIsSuperAdmin(false);
      setStaffRole(null);
      setStaffRecord(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthError(null);
      try {
        await checkStaffStatus(user);
      } catch (err) {
        console.error('Error verifying staff status:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkStaffStatus(result.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      console.error('Sign-in error:', err);
      setAuthError(msg);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setIsAuthorizedStaff(false);
      setIsSuperAdmin(false);
      setStaffRole(null);
      setStaffRecord(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthorizedStaff,
        isSuperAdmin,
        staffRole,
        staffRecord,
        signInWithGoogle,
        signOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
