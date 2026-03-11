import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';
import { User, AuthContextType } from '../types';
import { FirebaseDataManager } from '../services/firebaseDataManager';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mapFirebaseUser = (firebaseUser: FirebaseUser, photoURLOverride?: string | null): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: photoURLOverride === undefined ? firebaseUser.photoURL : photoURLOverride,
    emailVerified: firebaseUser.emailVerified,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasHandledInitialAuthRef = useRef(false);
  const lastAuthenticatedUserRef = useRef<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));

        try {
          const profile = await FirebaseDataManager.getUserProfile(firebaseUser.uid);
          const storedPhotoURL = profile?.photoURL;
          if (storedPhotoURL) {
            setUser(mapFirebaseUser(firebaseUser, storedPhotoURL));
          } else if (!storedPhotoURL && profile?.profilePictureBase64) {
            setUser(mapFirebaseUser(firebaseUser, profile.profilePictureBase64));
          }
        } catch {
          // Non-critical. Authentication still succeeds without an enriched profile.
        }

        if (hasHandledInitialAuthRef.current && lastAuthenticatedUserRef.current !== firebaseUser.uid) {
          setTimeout(() => {
            const displayName = firebaseUser.displayName || 
                               firebaseUser.email?.split('@')[0] || 'User';
            
            window.dispatchEvent(new CustomEvent('show-toast', { 
              detail: { message: `Welcome back, ${displayName}!`, type: 'success' }
            }));
          }, 500);
        }

        hasHandledInitialAuthRef.current = true;
        lastAuthenticatedUserRef.current = firebaseUser.uid;
      } else {
        setUser(null);
        hasHandledInitialAuthRef.current = true;
        lastAuthenticatedUserRef.current = null;
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        // Update local state with the new display name
        setUser(mapFirebaseUser(userCredential.user));
      }
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Don't perform any toast-related actions here
      // Just authenticate the user
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // No need to dispatch login success events here
      // We'll show a welcome toast in the main app through onAuthStateChanged
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      // Don't perform any toast-related actions here
      // Just authenticate the user
      await signInWithPopup(auth, googleProvider);
      
      // No need to dispatch login success events here
      // We'll show a welcome toast in the main app through onAuthStateChanged
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        await FirebaseDataManager.updateBudgetData(userId, { isIncomeHidden: true });
      }
      
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const clearUserData = async (): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in.');
      }

      const userId = auth.currentUser.uid;
      await FirebaseDataManager.clearUserData(userId);
    } catch (error: any) {
      throw new Error('Failed to clear user data. Please try again.');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string | null): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in.');
      }

      // Update Firebase profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      setUser((previousUser) => previousUser ? {
        ...previousUser,
        displayName,
        photoURL: photoURL === undefined ? previousUser.photoURL : photoURL,
      } : previousUser);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code) || 'Failed to update profile.');
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user is currently signed in.');
      }

      // Validate inputs
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new passwords are required.');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      // Log the actual error for debugging
      console.error('Password update error:', error);

      // Provide user-friendly error message
      if (error.code) {
        throw new Error(getAuthErrorMessage(error.code));
      } else {
        throw new Error(error.message || 'Failed to update password. Please try again.');
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoggingOut,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    clearUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to provide user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect current password. Please try again.';
    case 'auth/invalid-credential':
      return 'The current password you entered is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/requires-recent-login':
      return 'For security reasons, please sign out and sign back in before changing your password.';
    case 'auth/user-mismatch':
      return 'The credentials do not match the current user.';
    case 'auth/invalid-password':
      return 'The current password is incorrect.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};
