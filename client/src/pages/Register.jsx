import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { register, verifyOtp, clearError, resetOtpState } from '../redux/slices/authSlice';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading, otpSent, otpEmail, devOtp, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [otpCode, setOtpCode] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Reset errors/state on mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(resetOtpState());
    return () => {
      dispatch(clearError());
      dispatch(resetOtpState());
    };
  }, [dispatch]);

  // Navigate to dashboard if verified & authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
  };

  const handleValidation = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Mobile phone number is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
    
    // Dispatch signup
    const { name, email, phone, password } = formData;
    dispatch(register({ name, email, phone, password }));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6 || isNaN(otpCode)) {
      setFormErrors({ otp: 'Please enter a valid 6-digit numeric OTP' });
      return;
    }
    dispatch(verifyOtp({ email: otpEmail, otp: otpCode }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-primary-500/20 mb-3 bg-dark-900 border border-dark-850">
            <img src="/logo.png" alt="Finora Logo" className="h-full w-full object-cover scale-[1.8] translate-y-[-15%]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans text-white">
            {otpSent ? 'OTP Verification' : 'Create Account'}
          </h2>
          <p className="text-xs sm:text-sm text-dark-400 mt-1">
            {otpSent ? 'Please input the code to verify your wallet.' : 'Start your smart digital wallet journey.'}
          </p>
        </div>

        {/* Auth form panel */}
        <Card className="border border-dark-850">
          
          {/* Global API Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold mb-5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {!otpSent ? (
            /* Signup Fields */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ayush Sharma"
                icon={User}
                error={formErrors.name}
                required
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. ayush@finora.com"
                icon={Mail}
                error={formErrors.email}
                required
                disabled={loading}
              />

              <Input
                label="Mobile Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                icon={Phone}
                error={formErrors.phone}
                required
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a strong password"
                icon={Lock}
                error={formErrors.password}
                required
                disabled={loading}
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                icon={Lock}
                error={formErrors.confirmPassword}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={ArrowRight}
                className="mt-6"
              >
                Create Free Wallet
              </Button>
            </form>
          ) : (
            /* OTP Verification Field */
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              
              {/* Simulated SMS Box Banner */}
              {devOtp && (
                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-primary-400">
                  <div className="flex gap-2 items-center font-bold mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>[SIMULATED SMS GATEWAY]</span>
                  </div>
                  <p className="leading-relaxed">
                    OTP sent to <span className="font-semibold text-white">{otpEmail}</span>. <br />
                    Use code <span className="font-mono font-bold text-white text-sm bg-primary-600/30 px-1.5 py-0.5 rounded ml-1">{devOtp}</span> to verify.
                  </p>
                </div>
              )}

              <Input
                label="Enter OTP Verification Code"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  if (formErrors.otp) setFormErrors({});
                }}
                placeholder="Enter 6-digit code"
                icon={KeyRound}
                error={formErrors.otp}
                required
                disabled={loading}
                className="text-center font-mono tracking-widest text-lg"
              />

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  disabled={loading}
                  onClick={() => dispatch(resetOtpState())}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  fullWidth
                  loading={loading}
                >
                  Verify Account
                </Button>
              </div>
            </form>
          )}

          {/* Login direct Link */}
          {!otpSent && (
            <div className="mt-6 text-center text-xs">
              <span className="text-dark-400">Already registered? </span>
              <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
                Sign In
              </Link>
            </div>
          )}

        </Card>

      </div>
    </div>
  );
};

export default Register;
