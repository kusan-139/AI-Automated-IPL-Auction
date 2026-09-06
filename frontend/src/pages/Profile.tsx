import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import QRCode from 'react-qr-code';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const Profile: React.FC = () => {
  const { session, mfaStatus } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // MFA State
  const [enrollmentFactorId, setEnrollmentFactorId] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaSetupVisible, setMfaSetupVisible] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setDisplayName(data.display_name || '');
        setCustomTeamName(data.custom_team_name || '');
        setPhone(data.phone || '');
      }
    } catch (err: any) {
      console.error("Error fetching profile", err);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setLoading(true);
    setMessage('');
    try {
      const updates = {
        user_id: session.user.id,
        display_name: displayName,
        custom_team_name: customTeamName,
        phone: phone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'user_id' });

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startMfaEnroll = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;
      
      if (data.type === 'totp') {
        setEnrollmentFactorId(data.id);
        setTotpUri(data.totp.uri);
        setTotpSecret(data.totp.secret);
        setMfaSetupVisible(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const verifyMfaEnroll = async () => {
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: enrollmentFactorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: enrollmentFactorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      alert('MFA Enabled successfully! Please sign out and sign in again to reflect changes.');
      setMfaSetupVisible(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const disableMfa = async () => {
    try {
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.totp[0];
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
        if (error) throw error;
        alert('MFA disabled successfully.');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your executive profile, security, and 2FA settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Profile Details</h2>
          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email (Read Only)</label>
              <input 
                type="text" 
                disabled 
                value={session?.user?.email || ''}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-md px-3 py-2 text-slate-500 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Custom Team Name</label>
              <input 
                type="text" 
                value={customTeamName}
                onChange={e => setCustomTeamName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-md transition-colors hover:bg-primary/90"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            {message && <p className="mt-2 text-sm text-green-400">{message}</p>}
          </form>
        </div>

        {/* Security Settings */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Security & Authentication
          </h2>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-md p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              {mfaStatus === 'verified' ? (
                <ShieldCheck className="h-6 w-6 text-green-500" />
              ) : mfaStatus === 'pending' ? (
                <ShieldAlert className="h-6 w-6 text-amber-500" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-coral-500" />
              )}
              <h3 className="text-lg font-semibold text-slate-100">Two-Factor Authentication</h3>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">
              {mfaStatus === 'verified' 
                ? 'Your account is secured with 2FA.'
                : mfaStatus === 'pending'
                ? 'You have enrolled in 2FA, but it is not verified for this session.'
                : 'Protect your account by enabling Two-Factor Authentication.'}
            </p>

            {mfaStatus === 'verified' || mfaStatus === 'pending' ? (
              <button 
                onClick={disableMfa}
                className="bg-coral-600 hover:bg-coral-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
              >
                Disable 2FA
              </button>
            ) : (
              !mfaSetupVisible && (
                <button 
                  onClick={startMfaEnroll}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Enable 2FA
                </button>
              )
            )}
          </div>

          {mfaSetupVisible && (
            <div className="bg-slate-800/80 border border-slate-600 rounded-md p-6">
              <h3 className="text-md font-bold text-slate-100 mb-4">Scan QR Code</h3>
              <p className="text-sm text-slate-400 mb-4">
                Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
              </p>
              
              <div className="bg-white p-4 inline-block rounded-md mb-4">
                <QRCode value={totpUri} size={150} />
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-1">Or enter this secret manually:</p>
                <code className="text-xs bg-slate-900 p-2 rounded text-amber-500 block break-all">
                  {totpSecret}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Verification Code</label>
                <input 
                  type="text" 
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 mb-3" 
                  placeholder="000000"
                  maxLength={6}
                />
                <button 
                  onClick={verifyMfaEnroll}
                  disabled={verifyCode.length < 6}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Verify and Enable
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
