import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updateProfileImage, setPin, changePin, clearError } from '../redux/slices/authSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import { User, Mail, Phone, Lock, Camera, Check, ShieldCheck, KeyRound, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, error, loading } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  const [pinData, setPinData] = useState({
    pin: '',
    oldPin: '',
    newPin: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone,
      });
      setAvatarPreview(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handlePinChange = (e) => {
    setPinData({
      ...pinData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  // Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.phone.trim()) {
      setFormErrors({ name: 'Profile details cannot be left blank' });
      return;
    }
    setFormErrors({});
    setSuccessMsg('');
    
    const result = await dispatch(updateProfile(profileData));
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Image Upload base64 Conversion
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors({ avatar: 'Please pick a valid image file.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormErrors({ avatar: 'Image file size must be less than 2MB.' });
      return;
    }

    setFormErrors({});
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result;
      setAvatarPreview(base64data);
      dispatch(updateProfileImage(base64data));
    };
  };

  // PIN Actions
  const handleSetPinSubmit = async (e) => {
    e.preventDefault();
    if (!pinData.pin || pinData.pin.length !== 4 || isNaN(pinData.pin)) {
      setFormErrors({ pin: 'PIN must be a 4-digit numeric code' });
      return;
    }
    setFormErrors({});
    setSuccessMsg('');

    const result = await dispatch(setPin(pinData.pin));
    if (setPin.fulfilled.match(result)) {
      setPinData({ ...pinData, pin: '' });
      setSuccessMsg('Transaction PIN set successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleChangePinSubmit = async (e) => {
    e.preventDefault();
    if (
      !pinData.oldPin ||
      !pinData.newPin ||
      pinData.newPin.length !== 4 ||
      isNaN(pinData.newPin)
    ) {
      setFormErrors({ newPin: 'PIN must be a 4-digit numeric code' });
      return;
    }
    setFormErrors({});
    setSuccessMsg('');

    const result = await dispatch(
      changePin({ oldPin: pinData.oldPin, newPin: pinData.newPin })
    );
    if (changePin.fulfilled.match(result)) {
      setPinData({ ...pinData, oldPin: '', newPin: '' });
      setSuccessMsg('Transaction PIN updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Generate QR code data representing the user
  const getQrValue = () => {
    if (!user) return '';
    return JSON.stringify({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
    });
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'FI';
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          My Profile & Security
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Configure profile fields and transaction PIN parameters.
        </p>
      </div>

      {/* Global alerts */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-xs font-semibold">
          <Check className="h-4.5 w-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Avatar, Profile form, QR code display */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Avatar and Info Card */}
          <Card>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* Profile Photo selector */}
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.name}
                    className="h-28 w-28 rounded-full object-cover border-2 border-primary-500/20 shadow-md"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center border-2 border-primary-500/20 shadow-md">
                    {getInitials(user?.name)}
                  </div>
                )}
                
                {/* Photo Selector trigger overlay */}
                <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                  <Camera className="h-6 w-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-extrabold text-white leading-normal">
                  {user?.name}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                  <Badge variant="primary">{user?.email}</Badge>
                  <Badge variant="dark">{user?.phone}</Badge>
                </div>
                {formErrors.avatar && (
                  <p className="text-xs text-accent-error font-medium mt-2">
                    {formErrors.avatar}
                  </p>
                )}
              </div>

            </div>
          </Card>

          {/* Profile details Update Form */}
          <Card>
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
              Edit Profile Details
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Name"
                icon={User}
                error={formErrors.name}
                required
              />

              <Input
                label="Mobile Phone"
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="Phone number"
                icon={Phone}
                error={formErrors.phone}
                required
              />

              <Button type="submit" variant="primary" loading={loading} className="w-fit">
                Save Changes
              </Button>
            </form>
          </Card>

        </div>

        {/* Right Side: Security transaction PIN setting & QR Code display */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Personal payment QR code */}
          <Card className="flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4 w-full text-left">
              My Wallet QR Code
            </h3>
            
            <div className="p-4 rounded-3xl bg-white border border-dark-800 shadow-xl inline-block">
              {user && (
                <QRCodeSVG
                  value={getQrValue()}
                  size={180}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%236366f1'/%3E%3Ccircle cx='40' cy='50' r='20' fill='white' opacity='0.3'/%3E%3Ccircle cx='60' cy='50' r='20' fill='white'/%3E%3C/svg%3E",
                    height: 36,
                    width: 36,
                    excavate: true,
                  }}
                />
              )}
            </div>
            
            <span className="text-[10px] font-bold text-primary-400 flex items-center gap-1.5 mt-5">
              <QrCode className="h-4 w-4" /> Present this QR to receive funds instantly
            </span>
          </Card>

          {/* Security PIN Box */}
          <Card>
            {!user?.hasPin ? (
              /* Set PIN Form */
              <form onSubmit={handleSetPinSubmit} className="space-y-4">
                <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">
                  Set Transaction PIN
                </h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Establish a secure 4-digit PIN to confirm transaction and wallet utility requests.
                </p>

                <Input
                  label="Enter New 4-digit PIN"
                  type="password"
                  maxLength={4}
                  name="pin"
                  value={pinData.pin}
                  onChange={handlePinChange}
                  placeholder="PIN"
                  icon={KeyRound}
                  error={formErrors.pin}
                  required
                  className="text-center font-mono tracking-widest text-lg"
                />

                <Button type="submit" variant="primary" loading={loading} fullWidth>
                  Set Transaction PIN
                </Button>
              </form>
            ) : (
              /* Change PIN Form */
              <form onSubmit={handleChangePinSubmit} className="space-y-4">
                <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">
                  Change Transaction PIN
                </h3>
                
                <Input
                  label="Current PIN"
                  type="password"
                  maxLength={4}
                  name="oldPin"
                  value={pinData.oldPin}
                  onChange={handlePinChange}
                  placeholder="Enter current PIN"
                  icon={Lock}
                  required
                  className="text-center font-mono tracking-widest text-lg"
                />

                <Input
                  label="New 4-digit PIN"
                  type="password"
                  maxLength={4}
                  name="newPin"
                  value={pinData.newPin}
                  onChange={handlePinChange}
                  placeholder="Enter new PIN"
                  icon={KeyRound}
                  error={formErrors.newPin}
                  required
                  className="text-center font-mono tracking-widest text-lg"
                />

                <Button type="submit" variant="secondary" loading={loading} fullWidth>
                  Change Transaction PIN
                </Button>
              </form>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Profile;
