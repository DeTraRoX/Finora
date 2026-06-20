import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const getAdminStats = createAsyncThunk('admin/getStats', async (_, thunkAPI) => {
  try {
    const res = await api.get('/admin/stats');
    return res.data.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getAdminUsers = createAsyncThunk('admin/getUsers', async (filters, thunkAPI) => {
  try {
    const { query = '', page = 1, limit = 10 } = filters || {};
    const res = await api.get(`/admin/users?query=${query}&page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getAdminTransactions = createAsyncThunk(
  'admin/getTransactions',
  async (filters, thunkAPI) => {
    try {
      const { type = '', page = 1, limit = 15 } = filters || {};
      const res = await api.get(`/admin/transactions?type=${type}&page=${page}&limit=${limit}`);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleBlockUser = createAsyncThunk('admin/toggleBlock', async (userId, thunkAPI) => {
  try {
    const res = await api.put(`/admin/users/${userId}/block`);
    return res.data.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  stats: null,
  users: [],
  transactions: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  loading: false,
  error: null,
  success: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    resetAdminStatus: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Users
      .addCase(getAdminUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Transactions
      .addCase(getAdminTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAdminTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Block
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const { userId, isBlocked } = action.payload;
        // Update user state inside the local admin users array
        const user = state.users.find((u) => u._id === userId);
        if (user) {
          user.isBlocked = isBlocked;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(toggleBlockUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAdminError, resetAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;
