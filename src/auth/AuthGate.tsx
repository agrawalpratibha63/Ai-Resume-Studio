import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { auth, firebaseConfigured, missingFirebaseVariables } from '../lib/firebase';
import './AuthGate.css';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthGate');
  return context;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  const handleGoogleSignIn = async () => {
    if (!firebaseConfigured) {
      setError(`Firebase configuration missing: ${missingFirebaseVariables.join(', ')}`);
      return false;
    }

    setSigningIn(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return true;
    } catch (caught) {
      const code = typeof caught === 'object' && caught && 'code' in caught ? String(caught.code) : '';
      setError(code === 'auth/popup-closed-by-user' ? 'Sign-in was cancelled. Please try again.' : 'Google sign-in failed. Please check the authorized domain and try again.');
      return false;
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn: handleGoogleSignIn }}>
      <div className="auth-nav">
        {loading ? (
          <span className="auth-status">CHECKING SESSION...</span>
        ) : user ? (
          <div className="user-session">
            {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
            <span>{user.displayName || user.email}</span>
            <button onClick={() => signOut(auth)} title="Sign out" aria-label="Sign out"><LogOut size={14} /></button>
          </div>
        ) : (
          <button className="signup-button" onClick={handleGoogleSignIn} disabled={signingIn}>
            {signingIn ? 'CONNECTING...' : 'SIGN UP'}
          </button>
        )}
      </div>
      {error && <div className="auth-error-toast" role="alert">{error}</div>}
      {children}
    </AuthContext.Provider>
  );
}
