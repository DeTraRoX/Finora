import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { login, clearError } from '../redux/slices/authSlice';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, loading, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Clean error messages on mount/unmount
  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Reset field error
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
  };

  const handleValidation = () => {
    const errors = {};
    if (!formData.emailOrPhone.trim()) {
      errors.emailOrPhone = 'Email or phone number is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-3">
            <span className="text-white font-extrabold text-xl font-sans">F</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans text-white">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-dark-400 mt-1">
            Access your secure digital wallet.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border border-dark-850">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Global API Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            <Input
              label="Email or Mobile"
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              placeholder="e.g. ayush@finora.com or 9876543210"
              icon={Mail}
              error={formErrors.emailOrPhone}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={Lock}
              error={formErrors.password}
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
              Sign In to Wallet
            </Button>
          </form>

          {/* Direct link to sign up */}
          <div className="mt-6 text-center text-xs">
            <span className="text-dark-400">New to Finora? </span>
            <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
              Create an account
            </Link>
          </div>

        </Card>

        {/* Demo Credentials Info Box */}
        <div className="mt-6 glass-panel rounded-2xl p-4 border border-dark-900 bg-dark-950/40 text-left">
          <span className="text-[10px] font-bold text-accent-warning uppercase tracking-wider block mb-2">
            Quick Demo Accounts (Seeded PIN: 1234)
          </span>
          <div className="grid grid-cols-2 gap-2.5 text-[11px] text-dark-300">
            <div>
              <span className="font-semibold text-white block">Verified User</span>
              ayush@finora.com<br />password: user123
            </div>
            <div>
              <span className="font-semibold text-white block">System Admin</span>
              admin@finora.com<br />password: admin123
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
