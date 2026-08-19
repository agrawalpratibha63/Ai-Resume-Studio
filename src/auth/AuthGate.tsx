import { useEffect, useState, type ReactNode } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { auth, firebaseConfigured } from '../lib/firebase';
import './AuthGate.css';

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
    setSigningIn(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (caught) {
      const code = typeof caught === 'object' && caught && 'code' in caught ? String(caught.code) : '';
      setError(code === 'auth/popup-closed-by-user' ? 'Sign-in was cancelled. Please try again.' : 'Google sign-in failed. Please check the authorized domain and try again.');
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) return <div className="auth-loading">RESTORING SECURE SESSION...</div>;

  if (!firebaseConfigured) {
    return <div className="auth-loading">FIREBASE CONFIGURATION IS MISSING.</div>;
  }

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-grid" />
        <section className="auth-card">
          <div className="auth-kicker"><ShieldCheck size={14} /> SECURE IDENTITY GATE</div>
          <div className="auth-mark"><Sparkles size={32} /></div>
          <h1>Build your digital<br />identity.</h1>
          <p>Sign in before importing your resume, choosing a template, and generating your portfolio.</p>
          <button className="google-button" onClick={handleGoogleSignIn} disabled={signingIn}>
            <span className="google-g">G</span>
            {signingIn ? 'Connecting...' : 'Continue with Google'}
          </button>
          {error && <div className="auth-error">{error}</div>}
          <small>By continuing, you agree to use the service responsibly.</small>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="user-session">
        {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
        <span>{user.displayName || user.email}</span>
        <button onClick={() => signOut(auth)} title="Sign out"><LogOut size={14} /></button>
      </div>
      {children}
    </>
  );
}
