import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  Send,
  Zap,
  Shield,
  QrCode,
  LineChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const features = [
    {
      icon: Send,
      title: 'Peer-to-Peer Transfers',
      desc: 'Instantly send money to anyone registered on the platform by searching name, email, or mobile number.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Wallet,
      title: 'Digital Wallet System',
      desc: 'Add funds securely using integrated checkouts, monitor your balance, and track transactions.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: QrCode,
      title: 'QR Code Payments',
      desc: 'Scan receiver QR codes or display your personal QR code to initiate frictionless transfers.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Utility & Recharges',
      desc: 'Pay electricity, gas, water, DTH, and mobile recharges with instantaneous wallet deductions.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Shield,
      title: 'Fintech Security',
      desc: 'Equipped with bcrypt credentials hashing, 4-digit transaction PIN gates, and JWT authorization.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: LineChart,
      title: 'Analytics Dashboard',
      desc: 'Gain clarity over your spending patterns with income vs expense breakdowns and category graphs.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      
      {/* Header Bar */}
      <nav className="glass-panel border-b border-dark-900 bg-dark-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-violet-500 flex items-center justify-center">
              <span className="text-white font-extrabold text-sm font-sans">F</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight font-sans text-white">
              Finora
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Block */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400 mb-6"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Modern Wallet Solution</span>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-sans leading-none"
              >
                Your Smart <br />
                <span className="text-gradient">Digital Wallet</span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-6 text-base sm:text-lg text-dark-300 leading-relaxed max-w-xl"
              >
                Experience the next generation of digital payments. Finora allows you to instantly transfer money, make simulated utility payments, load cash, scan QR codes, and examine metrics, all under security controls.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-10 flex flex-wrap gap-4 sm:justify-center lg:justify-start"
              >
                <Link to="/register">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Open Free Wallet
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Access Account
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Block - Visual Showcase */}
            <div className="mt-16 sm:mt-20 lg:mt-0 lg:col-span-6 flex justify-center">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
                className="relative w-full max-w-sm"
              >
                {/* Background glow behind wallet mockup card */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary-500 to-violet-500 opacity-20 blur-xl animate-pulse" />
                
                {/* Main Card */}
                <div className="relative glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col justify-between aspect-[1.6/1] bg-dark-900/90 w-full overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-primary-500/10 blur-xl" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-dark-400 uppercase tracking-widest">Finora Classic</span>
                      <h4 className="text-lg font-bold text-white mt-1">Ayush Sharma</h4>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary-400" />
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <span className="text-xs text-dark-400">Total Balance</span>
                    <h3 className="text-3xl font-extrabold text-white font-sans mt-0.5">₹5,000.00</h3>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-mono tracking-widest text-dark-400">**** **** 3210</span>
                    <span className="text-[10px] font-bold text-primary-400 tracking-wider">ACTIVE WALLET</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-dark-900/40 border-t border-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
              All-In-One Smart Features
            </h2>
            <p className="mt-4 text-sm sm:text-base text-dark-400 leading-relaxed">
              Explore the core components designed to satisfy digital transaction necessities in a production-level workspace.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card hoverable className="h-full flex flex-col justify-between">
                    <div>
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center shadow-lg shadow-black/30 mb-6`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-dark-300 leading-relaxed">{feature.desc}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="border-t border-dark-900 py-8 bg-dark-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-dark-500 font-medium">
            &copy; {new Date().getFullYear()} Finora. Prepared as a high-fidelity portfolio application.
          </span>
          <div className="flex gap-6">
            <span className="text-xs text-dark-500 font-medium hover:text-dark-300 cursor-pointer">
              MERN Stack
            </span>
            <span className="text-xs text-dark-500 font-medium hover:text-dark-300 cursor-pointer">
              Socket.io
            </span>
            <span className="text-xs text-dark-500 font-medium hover:text-dark-300 cursor-pointer">
              Tailwind CSS
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
