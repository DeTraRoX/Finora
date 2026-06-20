import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { disconnectSocket } from '../../services/socketService';

// Thunks
export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const res = await api.post('/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpData, thunkAPI) => {
  try {
    const res = await api.post('/auth/verify-otp', otpData);
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const res = await api.put('/users/profile', profileData);
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfileImage = createAsyncThunk('auth/updateProfileImage', async (imageData, thunkAPI) => {
  try {
    const res = await api.post('/users/profile-image', { image: imageData });
    return res.data.profileImage;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const setPin = createAsyncThunk('auth/setPin', async (pin, thunkAPI) => {
  try {
    const res = await api.post('/users/set-pin', { pin });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const changePin = createAsyncThunk('auth/changePin', async (pinData, thunkAPI) => {
  try {
    const res = await api.put('/users/change-pin', pinData);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
  otpSent: false,
  otpEmail: '',
  devOtp: '', // Convenience for testing signup
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      disconnectSocket();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.otpEmail = '';
      state.devOtp = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpEmail = '';
      state.devOtp = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.otpEmail = action.payload.data.email;
        state.devOtp = action.payload.data.devOtp; // display on screen for easy verification
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.otpSent = false;
        state.devOtp = '';
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update Profile Image
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.user) {
          state.user.profileImage = action.payload;
        }
        state.error = null;
      })
      // Set Pin
      .addCase(setPin.fulfilled, (state) => {
        if (state.user) {
          state.user.hasPin = true;
        }
        state.error = null;
      })
      .addCase(setPin.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Change Pin
      .addCase(changePin.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
