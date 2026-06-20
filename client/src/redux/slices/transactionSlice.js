import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { updateLocalBalance } from './walletSlice';

// Thunks
export const transferMoney = createAsyncThunk(
  'transaction/transfer',
  async (transferData, thunkAPI) => {
    try {
      const res = await api.post('/transactions/transfer', transferData);
      // Update local wallet balance with new balance returned
      if (res.data.data && res.data.data.senderBalance !== undefined) {
        thunkAPI.dispatch(updateLocalBalance(res.data.data.senderBalance));
      }
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTransactionHistory = createAsyncThunk(
  'transaction/getHistory',
  async (filters, thunkAPI) => {
    try {
      const { type = '', category = '', page = 1, limit = 10 } = filters || {};
      const res = await api.get(
        `/transactions/history?type=${type}&category=${category}&page=${page}&limit=${limit}`
      );
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTransactionDetails = createAsyncThunk(
  'transaction/getDetails',
  async (txnId, thunkAPI) => {
    try {
      const res = await api.get(`/transactions/${txnId}`);
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const payMobileRecharge = createAsyncThunk(
  'transaction/recharge',
  async (rechargeData, thunkAPI) => {
    try {
      const res = await api.post('/payment/recharge', rechargeData);
      if (res.data.data && res.data.data.newBalance !== undefined) {
        thunkAPI.dispatch(updateLocalBalance(res.data.data.newBalance));
      }
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const payUtilityBill = createAsyncThunk(
  'transaction/payBill',
  async (billData, thunkAPI) => {
    try {
      const res = await api.post('/payment/bill', billData);
      if (res.data.data && res.data.data.newBalance !== undefined) {
        thunkAPI.dispatch(updateLocalBalance(res.data.data.newBalance));
      }
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  history: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  currentTransaction: null,
  loading: false,
  transferSuccess: false,
  paymentSuccess: false,
  error: null,
  successData: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    resetTransactionStatus: (state) => {
      state.transferSuccess = false;
      state.paymentSuccess = false;
      state.successData = null;
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Peer Transfer
      .addCase(transferMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.transferSuccess = false;
      })
      .addCase(transferMoney.fulfilled, (state, action) => {
        state.loading = false;
        state.transferSuccess = true;
        state.successData = action.payload.data;
        state.error = null;
      })
      .addCase(transferMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // History List
      .addCase(getTransactionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Details
      .addCase(getTransactionDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.error = null;
      })
      .addCase(getTransactionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Recharges & Utility Bills
      .addMatcher(
        (action) =>
          [payMobileRecharge.pending, payUtilityBill.pending].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
          state.paymentSuccess = false;
        }
      )
      .addMatcher(
        (action) =>
          [payMobileRecharge.fulfilled, payUtilityBill.fulfilled].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.paymentSuccess = true;
          state.successData = action.payload.data;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [payMobileRecharge.rejected, payUtilityBill.rejected].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearTransactionError, resetTransactionStatus } = transactionSlice.actions;
export default transactionSlice.reducer;
