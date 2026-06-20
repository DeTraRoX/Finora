import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const getWalletBalance = createAsyncThunk('wallet/getBalance', async (_, thunkAPI) => {
  try {
    const res = await api.get('/wallet/balance');
    return res.data.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const addMoney = createAsyncThunk('wallet/addMoney', async (amount, thunkAPI) => {
  try {
    const res = await api.post('/wallet/add-money', { amount });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const verifyPayment = createAsyncThunk('wallet/verifyPayment', async (paymentData, thunkAPI) => {
  try {
    const res = await api.post('/wallet/verify-payment', paymentData);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  balance: 0,
  currency: 'INR',
  loading: false,
  error: null,
  orderData: null,
  paymentSuccess: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    resetPaymentStatus: (state) => {
      state.paymentSuccess = false;
      state.orderData = null;
    },
    // Socket real-time balance update reducer
    updateLocalBalance: (state, action) => {
      state.balance = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Balance
      .addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.currency = action.payload.currency;
        state.loading = false;
        state.error = null;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Money (Order Creation)
      .addCase(addMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMoney.fulfilled, (state, action) => {
        state.loading = false;
        state.orderData = action.payload;
        state.error = null;
      })
      .addCase(addMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.data.newBalance;
        state.paymentSuccess = true;
        state.orderData = null;
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletError, resetPaymentStatus, updateLocalBalance } = walletSlice.actions;
export default walletSlice.reducer;
