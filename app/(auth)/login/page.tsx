'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login network request
    setTimeout(() => {
      setLoading(false);
      if (role === 'seller') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.04), 0 2px 10px rgba(0,0,0,0.02)',
        border: '1px solid rgba(28,17,7,0.06)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Sign in to your Squad Credit account
        </p>
      </div>

      {/* Role Switcher */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f3f4f6',
        borderRadius: '999px',
        padding: '5px',
        marginBottom: '32px',
        position: 'relative'
      }}>
        {['buyer', 'seller'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r as 'buyer' | 'seller')}
            style={{
              flex: 1,
              position: 'relative',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: 500,
              color: role === r ? '#fff' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '999px',
              zIndex: 1,
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            {role === r && (
              <motion.div
                layoutId="activeRole"
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: '#FF6B00',
                  borderRadius: '999px',
                  zIndex: -1,
                  boxShadow: '0 4px 12px rgba(255,107,0,0.25)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            {r === 'buyer' ? 'I want to Buy' : 'I am a Seller'}
          </button>
        ))}
      </div>

      <motion.div
        key={role}
        initial={{ opacity: 0, x: role === 'buyer' ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p style={{ fontSize: '13.5px', color: '#4b5563', marginBottom: '28px', textAlign: 'center', backgroundColor: '#fff4eb', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,107,0,0.15)' }}>
          {role === 'buyer' 
            ? "Buyers browse storefronts, checkout items, and make purchases securely through Squad." 
            : "Sellers access their dashboard, manage loans, and improve their trust score."}
        </p>
      </motion.div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Phone number</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px',
              padding: '0 16px', fontSize: '15px', color: '#4b5563', fontWeight: 500
            }}>
              +234
            </div>
            <input 
              type="tel" 
              required
              placeholder="801 234 5678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 16px',
                fontSize: '15px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
                fontFamily: 'inherit'
              }}
              onFocus={e => e.target.style.borderColor = '#FF6B00'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            marginTop: '12px',
            backgroundColor: '#FF6B00',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(255,107,0,0.25)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }}
            />
          ) : (
            `Continue as ${role === 'buyer' ? 'Buyer' : 'Seller'}`
          )}
        </button>
      </form>
      
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: '#6b7280' }}>
        Don&apos;t have an account? <span onClick={() => router.push('/onboard')} style={{ color: '#FF6B00', fontWeight: 500, cursor: 'pointer' }}>Create one</span>
      </div>
    </motion.div>
  );
}
