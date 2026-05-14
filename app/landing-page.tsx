'use client';

import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence, PanInfo } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import './landing.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const views = ['dashboard', 'store', 'kyc'];

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <div ref={ref} className="hero-stat-val">{prefix}{count}{suffix}</div>;
}

export default function LandingPage() {
  const router = useRouter();

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const heroOrbY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // 3D Phone Tilt Effect
  const phoneRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Hologram swipe state for main phone
  const [viewIndex, setViewIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Hologram swipe state for dashboard inner carousel
  const dashboardCards = ['balance', 'score', 'defaults'];
  const [dashIndex, setDashIndex] = useState(0);
  const [dashDirection, setDashDirection] = useState(0);

  const [showStoreAvatarImage, setShowStoreAvatarImage] = useState(false);

  useEffect(() => {
    const avatarTimer = setInterval(() => {
      setShowStoreAvatarImage(prev => !prev);
    }, 3500);
    return () => clearInterval(avatarTimer);
  }, []);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = offset.x;
    if (swipe < -50) {
      setDirection(1);
      setViewIndex((prev) => (prev + 1) % views.length);
    } else if (swipe > 50) {
      setDirection(-1);
      setViewIndex((prev) => (prev - 1 + views.length) % views.length);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setViewIndex((prev) => (prev + 1) % views.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const dashTimer = setInterval(() => {
      setDashDirection(1);
      setDashIndex((prev) => (prev + 1) % dashboardCards.length);
    }, 2500);
    return () => clearInterval(dashTimer);
  }, []);

  const handleDashDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = offset.x;
    if (swipe < -30) {
      setDashDirection(1);
      setDashIndex((prev) => (prev + 1) % dashboardCards.length);
    } else if (swipe > 30) {
      setDashDirection(-1);
      setDashIndex((prev) => (prev - 1 + dashboardCards.length) % dashboardCards.length);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      filter: 'brightness(1.5) blur(2px)',
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'brightness(1) blur(0px)',
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      filter: 'brightness(1.5) blur(2px)',
      scale: 0.95,
    })
  };

  return (
    <div className="landing-page-container">
      <h2 className="sr-only">Squad Credit homepage — working capital for Nigerian market traders, built on trust</h2>

      <motion.nav 
        className="nav"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="nav-logo" onClick={() => router.push('/')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="SquadCredit" width={34} height={34} style={{ flexShrink: 0 }} />
          <span className="logo-name">Squad <span>Credit</span></span>
        </div>
        <ul className="nav-links">
          <li><a href="#">How it works</a></li>
          <li><a href="#">Loan tiers</a></li>
          <li><a href="#">Associations</a></li>
          <li><a href="#">Trust score</a></li>
          <li><a href="#">About</a></li>
        </ul>
        <div className="nav-right">
          <button className="btn-ghost" onClick={() => router.push('/login')}>Sign in</button>
          <button className="btn-brand" onClick={() => router.push('/login')}>Open account ↗</button>
          <button className="mobile-menu-btn" onClick={() => router.push('/login')}><i className="ti ti-menu-2"></i></button>
        </div>
      </motion.nav>

      <section className="hero">
        <motion.div className="hero-orb" style={{ y: heroOrbY }}></motion.div>
        <motion.div className="hero-orb-2" style={{ y: heroOrbY, x: 50 }}></motion.div>
        
        <motion.div 
          className="hero-left"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-eyebrow" variants={fadeLeft}>
            <i className="ti ti-shield-check" aria-hidden="true"></i>
            Powered by Squad · FCCPC DEON 2025 compliant
          </motion.div>
          <motion.h1 variants={fadeUp}>
            Working capital<br />for <em>market traders,</em><br />built on trust.
          </motion.h1>
          <motion.p className="hero-sub" variants={fadeUp}>
            Your customers pay you through Squad. Every payment builds your trust score. When you need capital, we unlock it — repaid quietly as a slice of your daily sales. No paperwork. No harassment. No surprises.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <button className="btn-hero-primary" onClick={() => router.push('/login')}>
              <i className="ti ti-arrow-right" aria-hidden="true"></i>
              Get started free
            </button>
            <button className="btn-hero-secondary" onClick={() => router.push('/login')}>
              <i className="ti ti-player-play" aria-hidden="true" style={{ color: "var(--brand)" }}></i>
              See how it works
            </button>
          </motion.div>
        </motion.div>

        <div className="hero-right">
          <motion.div 
            className="phone-wrap"
            ref={phoneRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="hologram-glow"></div>
            <motion.div 
              className="phone"
            >
              <div className="phone-notch"></div>

              {/* Simulated touch cursor - lives outside the drag container */}
              <motion.div
                className="simulated-touch"
                animate={{
                  x: [100, 140, 140, 80, 80, 120, 120, 100],
                  y: [220, 280, 280, 320, 320, 180, 180, 220],
                  opacity: [0, 1, 1, 1, 0.6, 1, 0, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="touch-dot" />
                <motion.div 
                  className="touch-ripple"
                  animate={{ scale: [0.5, 2.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              </motion.div>

              <motion.div 
                className="phone-view-container"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
              >
                <AnimatePresence initial={false} custom={direction}>
                  {views[viewIndex] === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                      <div className="phone-header">
                        <div className="ph-greeting">GOOD MORNING</div>
                        <div className="ph-name">Sade Fashola</div>
                      </div>
                      <div className="phone-body">
                        <div style={{ position: 'relative', height: '140px', marginBottom: '16px', overflow: 'hidden' }}>
                          <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={handleDashDragEnd}
                            style={{ width: '100%', height: '100%', position: 'absolute' }}
                          >
                            <AnimatePresence initial={false} custom={dashDirection}>
                              {dashboardCards[dashIndex] === 'balance' && (
                                <motion.div
                                  key="balance"
                                  custom={dashDirection}
                                  variants={variants}
                                  initial="enter"
                                  animate="center"
                                  exit="exit"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                                >
                                  <div className="balance-card" style={{ height: '100%', marginBottom: 0 }}>
                                    <div className="bal-label">TODAY'S INFLOW</div>
                                    <div className="bal-amount">₦38,500</div>
                                    <div className="bal-change">
                                      <i className="ti ti-trending-up" aria-hidden="true"></i>
                                      12% above yesterday
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                              {dashboardCards[dashIndex] === 'score' && (
                                <motion.div
                                  key="score"
                                  custom={dashDirection}
                                  variants={variants}
                                  initial="enter"
                                  animate="center"
                                  exit="exit"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                                >
                                  <div className="balance-card" style={{ height: '100%', marginBottom: 0, background: 'linear-gradient(135deg, #fffaf7, #fff4ef)', border: '1px solid rgba(242, 92, 25, 0.2)' }}>
                                    <div className="bal-label" style={{ color: 'var(--ink-soft)' }}>TRUST SCORE</div>
                                    <div className="bal-amount" style={{ color: 'var(--brand)' }}>742</div>
                                    <div className="bal-change" style={{ color: 'var(--ink-mid)' }}>
                                      <i className="ti ti-shield-check" aria-hidden="true" style={{ color: 'var(--brand)' }}></i>
                                      Excellent standing
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                              {dashboardCards[dashIndex] === 'defaults' && (
                                <motion.div
                                  key="defaults"
                                  custom={dashDirection}
                                  variants={variants}
                                  initial="enter"
                                  animate="center"
                                  exit="exit"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                                >
                                  <div className="balance-card" style={{ height: '100%', marginBottom: 0, background: 'linear-gradient(135deg, var(--brand-mid), #9a3308)' }}>
                                    <div className="bal-label">LOAN ACCESS & DEFAULTS</div>
                                    <div className="bal-amount" style={{ fontSize: '24px', marginTop: '8px' }}>Tier 2</div>
                                    <div className="bal-change" style={{ marginTop: '8px' }}>
                                      <i className="ti ti-check" aria-hidden="true"></i>
                                      0 Defaults recorded
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                        <div className="dash-carousel-dots" style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
                          {dashboardCards.map((_, i) => (
                            <div key={i} style={{ width: i === dashIndex ? '12px' : '4px', height: '4px', borderRadius: '2px', background: i === dashIndex ? 'var(--brand)' : 'rgba(0,0,0,0.1)', transition: 'all 0.3s' }}></div>
                          ))}
                        </div>
                        <div className="p-section">RECENT TRANSACTIONS</div>
                        <div className="tx">
                          <div className="tx-ico"><i className="ti ti-shopping-bag" aria-hidden="true"></i></div>
                          <div><div className="tx-nm">Kemi Adeyemi</div><div className="tx-tm">10:34 AM</div></div>
                          <div className="tx-av in">+₦8,000</div>
                        </div>
                        <div className="tx">
                          <div className="tx-ico"><i className="ti ti-shopping-bag" aria-hidden="true"></i></div>
                          <div><div className="tx-nm">Tunde Bakare</div><div className="tx-tm">9:15 AM</div></div>
                          <div className="tx-av in">+₦12,500</div>
                        </div>
                        <div className="tx">
                          <div className="tx-ico neutral"><i className="ti ti-credit-card" aria-hidden="true"></i></div>
                          <div><div className="tx-nm">Auto repayment</div><div className="tx-tm">8:00 AM</div></div>
                          <div className="tx-av out">-₦1,800</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {views[viewIndex] === 'store' && (
                    <motion.div
                      key="store"
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#f9fafb' }}
                    >
                      <div className="store-header" style={{ paddingTop: '40px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div className="store-avatar-wrap">
                          <div className="store-avatar-ring">
                            <AnimatePresence mode="wait">
                              {showStoreAvatarImage ? (
                                <motion.div
                                  key="image"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.3 }}
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    backgroundImage: 'url(https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: 'white'
                                  }}
                                />
                              ) : (
                                <motion.div
                                  key="initials"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.3 }}
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: 'var(--brand)'
                                  }}
                                >
                                  SF
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="store-online-dot"></div>
                        </div>
                        <h3>Sade&apos;s Fabrics</h3>
                        <p>Balogun Market, Lagos</p>
                        <div className="store-rating">
                          <i className="ti ti-star-filled" style={{ color: '#f59e0b', fontSize: '12px' }}></i>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>4.9</span>
                          <span style={{ fontSize: '10px', color: '#9ca3af' }}>(128 reviews)</span>
                        </div>
                      </div>
                      <div className="product-grid">
                        <div className="product-card">
                          <div className="product-img" style={{ backgroundImage: 'url(/ankara.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                          <div className="product-name">Ankara Premium</div>
                          <div className="product-price">₦12,500</div>
                          <button className="btn-buy">Buy Now</button>
                        </div>
                        <div className="product-card">
                          <div className="product-img" style={{ backgroundImage: 'url(/silk_lace.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                          <div className="product-name">Silk Lace</div>
                          <div className="product-price">₦8,000</div>
                          <button className="btn-buy">Buy Now</button>
                        </div>
                        <div className="product-card">
                          <div className="product-img" style={{ backgroundImage: 'url(/ankara.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                          <div className="product-name">Cotton Blend</div>
                          <div className="product-price">₦5,500</div>
                          <button className="btn-buy">Buy Now</button>
                        </div>
                        <div className="product-card">
                          <div className="product-img" style={{ backgroundImage: 'url(/silk_lace.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                          <div className="product-name">George Fabric</div>
                          <div className="product-price">₦22,000</div>
                          <button className="btn-buy">Buy Now</button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {views[viewIndex] === 'kyc' && (
                    <motion.div
                      key="kyc"
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#fff' }}
                    >
                      <div className="kyc-view">
                        <div className="kyc-icon" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid var(--brand)' }}></div>
                        <h3>Sade Fashola</h3>
                        <p style={{ marginBottom: '16px' }}>Complete your KYC to access Tier 2 loan limits up to ₦150k.</p>
                        
                        <div className="kyc-step">
                          <div className="kyc-step-icon">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                          </div>
                          <div>
                            <div className="kyc-step-title">BVN Verification</div>
                            <div className="kyc-step-desc">Completed</div>
                          </div>
                        </div>
                        
                        <div className="kyc-step">
                          <div className="kyc-step-icon pending">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                          </div>
                          <div>
                            <div className="kyc-step-title">NIN Linked</div>
                            <div className="kyc-step-desc">Action required</div>
                          </div>
                        </div>
                        
                        <div className="kyc-step">
                          <div className="kyc-step-icon pending">
                            <i className="ti ti-lock"></i>
                          </div>
                          <div>
                            <div className="kyc-step-title">Store address</div>
                            <div className="kyc-step-desc">Pending verification</div>
                          </div>
                        </div>
                        
                        <button className="btn-kyc">Continue Verification</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
            <div className="swipe-indicator">
              Swipe to change view &gt;&gt;&gt;&gt;&gt;&gt;
            </div>
          </motion.div>
        </div>
      </section>

      <div className="trust-strip-container">
        <motion.div 
          className="trust-strip"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="trust-strip-content">
            <span className="ts-label">Built on</span>
            <span className="ts-pill"><i className="ti ti-building-bank" aria-hidden="true"></i> Squad by HabariPay</span>
            <span className="ts-pill"><i className="ti ti-shield-check" aria-hidden="true"></i> CBN licensed</span>
            <span className="ts-pill"><i className="ti ti-users" aria-hidden="true"></i> Balogun MTA</span>
            <span className="ts-pill"><i className="ti ti-certificate" aria-hidden="true"></i> FCCPC DEON 2025</span>
            <span className="ts-pill"><i className="ti ti-lock" aria-hidden="true"></i> NDPA 2023</span>
          </div>
          <div className="trust-strip-content" aria-hidden="true">
            <span className="ts-label">Built on</span>
            <span className="ts-pill"><i className="ti ti-building-bank" aria-hidden="true"></i> Squad by HabariPay</span>
            <span className="ts-pill"><i className="ti ti-shield-check" aria-hidden="true"></i> CBN licensed</span>
            <span className="ts-pill"><i className="ti ti-users" aria-hidden="true"></i> Balogun MTA</span>
            <span className="ts-pill"><i className="ti ti-certificate" aria-hidden="true"></i> FCCPC DEON 2025</span>
            <span className="ts-pill"><i className="ti ti-lock" aria-hidden="true"></i> NDPA 2023</span>
          </div>
        </motion.div>
      </div>

      <section className="section">
        <motion.div 
          className="sec-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="sec-eyebrow" variants={fadeUp}>How it works</motion.div>
          <motion.div className="sec-title" variants={fadeUp}>From stall to capital in three steps</motion.div>
          <motion.div className="sec-sub" variants={fadeUp}>No payslips. No paperwork. Your daily sales are your credit history.</motion.div>
        </motion.div>
        <motion.div 
          className="how-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="how-card" variants={fadeUp}>
            <div className="how-num">1</div>
            <div className="how-title">Get your Squad account</div>
            <div className="how-body">Open a free account through your market association or the app. Customers pay into your Squad virtual account. Every naira that flows through it builds your profile — automatically.</div>
          </motion.div>
          <motion.div className="how-card" variants={fadeUp}>
            <div className="how-num">2</div>
            <div className="how-title">Build your trust score</div>
            <div className="how-body">Our AI reads your inflow patterns — regularity, customer spread, growth trend, and your traders' network. Within three weeks you may already qualify for your first loan.</div>
          </motion.div>
          <motion.div className="how-card" variants={fadeUp}>
            <div className="how-num">3</div>
            <div className="how-title">Repay from daily sales</div>
            <div className="how-body">A small percentage of every incoming payment is quietly redirected to repay your loan. Busy day — faster repayment. Slow day — less taken. No calls. No threats. No drama.</div>
          </motion.div>
        </motion.div>
      </section>

      <section className="section alt">
        <motion.div 
          className="sec-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="sec-eyebrow" variants={fadeUp}>Why Squad Credit</motion.div>
          <motion.div className="sec-title" variants={fadeUp}>We own the rail — so you own the trust</motion.div>
          <motion.div className="sec-sub" variants={fadeUp}>We don't scrape your contacts. We don't call your family. Repayment happens before you even think about it.</motion.div>
        </motion.div>
        <motion.div 
          className="feat-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="feat-card" variants={fadeUp}>
            <div className="feat-icon-wrap"><i className="ti ti-brain" aria-hidden="true"></i></div>
            <div className="feat-text">
              <div className="feat-title">AI trust score, not phone scraping</div>
              <div className="feat-body">We score you on five signals from your real trade data: inflow regularity, customer diversity, revenue growth, weekday activity, and your network of trusted traders. No contact lists. No SMS history.</div>
            </div>
          </motion.div>
          <motion.div className="feat-card" variants={fadeUp}>
            <div className="feat-icon-wrap"><i className="ti ti-arrows-exchange" aria-hidden="true"></i></div>
            <div className="feat-text">
              <div className="feat-title">Automatic repayment on the rail</div>
              <div className="feat-body">Because payments flow through your Squad account, repayment is just a redirect — a small percentage of incoming funds before the rest reaches you. Default rates near zero. Nobody chases you.</div>
            </div>
          </motion.div>
          <motion.div className="feat-card" variants={fadeUp}>
            <div className="feat-icon-wrap"><i className="ti ti-network" aria-hidden="true"></i></div>
            <div className="feat-text">
              <div className="feat-title">Network of trust advantage</div>
              <div className="feat-body">When your customers are trustworthy traders on the same platform, their good standing reflects on yours — even before your first repayment. A moat no competitor can copy without the rail.</div>
            </div>
          </motion.div>
          <motion.div className="feat-card" variants={fadeUp}>
            <div className="feat-icon-wrap"><i className="ti ti-receipt-2" aria-hidden="true"></i></div>
            <div className="feat-text">
              <div className="feat-title">Flat fees, total transparency</div>
              <div className="feat-body">A ₦50,000 loan at 7% costs exactly ₦3,500 — total. No compounding interest, no fine print. We show the full cost before you tap confirm. Far below what loan apps charge.</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="section">
        <motion.div 
          className="sec-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="sec-eyebrow" variants={fadeUp}>Loan tiers</motion.div>
          <motion.div className="sec-title" variants={fadeUp}>Earn your way up, one cycle at a time</motion.div>
          <motion.div className="sec-sub" variants={fadeUp}>Every successful repayment unlocks a bigger limit — from ₦5k all the way to ₦25M on the same rails.</motion.div>
        </motion.div>
        <motion.div 
          className="tiers-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="tier-card" variants={fadeUp}>
            <div className="tier-level">Tier 0</div>
            <div className="tier-name">First loan</div>
            <div className="tier-range">₦5k – ₦15k</div>
            <div className="tier-days">7-day term</div>
            <div className="tier-divider"></div>
            <div className="tier-fee">5% flat fee &middot; Pay once, done</div>
          </motion.div>
          <motion.div className="tier-card" variants={fadeUp}>
            <div className="tier-level">Tier 1</div>
            <div className="tier-name">Building trust</div>
            <div className="tier-range">₦15k – ₦50k</div>
            <div className="tier-days">14-day term</div>
            <div className="tier-divider"></div>
            <div className="tier-fee">6% flat fee &middot; After 1 good cycle</div>
          </motion.div>
          <motion.div className="tier-card hero-tier" variants={fadeUp}>
            <div className="tier-badge">Most popular</div>
            <div className="tier-level">Tier 2</div>
            <div className="tier-name">Established trader</div>
            <div className="tier-range">₦50k – ₦150k</div>
            <div className="tier-days">21-day term</div>
            <div className="tier-divider"></div>
            <div className="tier-fee">7% flat fee &middot; After a few cycles</div>
          </motion.div>
          <motion.div className="tier-card" variants={fadeUp}>
            <div className="tier-level">Tier 3–6</div>
            <div className="tier-name">Trusted veteran</div>
            <div className="tier-range">Up to ₦25M</div>
            <div className="tier-days">Flexible terms</div>
            <div className="tier-divider"></div>
            <div className="tier-fee">Drops to ~4% at scale</div>
          </motion.div>
        </motion.div>
      </section>

      <section className="section alt">
        <motion.div 
          className="sec-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="sec-eyebrow" variants={fadeUp}>Trader stories</motion.div>
          <motion.div className="sec-title" variants={fadeUp}>Real traders, real results</motion.div>
        </motion.div>
        <motion.div 
          className="testi-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="testi-card" variants={fadeUp}>
            <div className="testi-stars">
              <i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i>
            </div>
            <div className="testi-quote">"Before Squad Credit, I bought half the stock I needed and watched customers walk to the next stall. Now I stock up on Monday and my loan is paid off by Friday."</div>
            <div className="testi-author">
              <div className="testi-avatar">SF</div>
              <div>
                <div className="testi-name">Sade Fashola</div>
                <div className="testi-role">Fabric trader · Balogun Market</div>
              </div>
            </div>
          </motion.div>
          <motion.div className="testi-card" variants={fadeUp}>
            <div className="testi-stars">
              <i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i>
            </div>
            <div className="testi-quote">"My trust score hit 800 after three months. They sent ₦150,000 straight to my account. Not one call to my contacts. Not one threatening message. This is how lending should work."</div>
            <div className="testi-author">
              <div className="testi-avatar">EO</div>
              <div>
                <div className="testi-name">Emeka Okafor</div>
                <div className="testi-role">Footwear · Computer Village</div>
              </div>
            </div>
          </motion.div>
          <motion.div className="testi-card" variants={fadeUp}>
            <div className="testi-stars">
              <i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i><i className="ti ti-star" aria-hidden="true"></i>
            </div>
            <div className="testi-quote">"As MTA chairman I see every member's activity on one dashboard. When someone falls behind, I step in early. The chairman bonus alone makes this worth promoting."</div>
            <div className="testi-author">
              <div className="testi-avatar">AO</div>
              <div>
                <div className="testi-name">Alhaji Owolabi</div>
                <div className="testi-role">Chairman · Balogun MTA</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <div style={{ padding: "0 0 120px" }}>
        <motion.div 
          className="assoc-banner"
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="assoc-left">
            <div className="assoc-eyebrow">For market associations</div>
            <div className="assoc-title">Your association is our distribution engine</div>
            <div className="assoc-body">Every major Nigerian market has a union. We plug into it. Your chairman gets a dashboard showing all members' activity, earns a 0.5% bonus on disbursements, and has the tools to mediate before anyone falls behind.</div>
            <button className="btn-assoc" onClick={() => router.push('/login')}>
              Partner with us
              <i className="ti ti-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
          <div className="assoc-right">
            <div className="assoc-stat-grid">
              <div className="assoc-stat-card">
                <div className="asc-val">2,847</div>
                <div className="asc-lbl">Active traders in Balogun MTA</div>
              </div>
              <div className="assoc-stat-card">
                <div className="asc-val">96.2%</div>
                <div className="asc-lbl">Repayment rate across association</div>
              </div>
              <div className="assoc-stat-card">
                <div className="asc-val">₦24.3k</div>
                <div className="asc-lbl">Chairman bonus this month</div>
              </div>
              <div className="assoc-stat-card">
                <div className="asc-val">7 days</div>
                <div className="asc-lbl">Avg. time to first loan</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
      >
        <div className="sec-eyebrow">Ready to grow?</div>
        <h2>Your market stall is your credit history.</h2>
        <p>Join thousands of traders building financial identity from their daily hustle — one sale at a time.</p>
        <div className="cta-actions">
          <button className="btn-cta-main" onClick={() => router.push('/login')}>Open a free account</button>
          <button className="btn-cta-outline" onClick={() => router.push('/login')}>Explore loan tiers</button>
        </div>
      </motion.section>

      <footer>
        <div className="footer-top">
          <div className="footer-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="SquadCredit" width={34} height={34} style={{ flexShrink: 0 }} />
            <span className="footer-logo-name">SquadCredit</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy policy</a>
            <a href="#">Terms of use</a>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
            <a href="#">Blog</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">&copy; 2026 Squad Credit. All rights reserved.</div>
          <div className="footer-compliance">FCCPC DEON 2025 &middot; NDPA 2023 &middot; CBN licensed</div>
          <div className="footer-squad">Powered by <span>Squad</span> · HabariPay Ltd</div>
        </div>
      </footer>
    </div>
  );
}
