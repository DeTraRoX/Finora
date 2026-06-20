import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Add notification to top of the list
      state.list.unshift({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        read: false,
        ...action.payload,
      });
      state.unreadCount += 1;
      
      // Limit list size to 50 items
      if (state.list.length > 50) {
        state.list.pop();
      }
    },
    markAllAsRead: (state) => {
      state.list.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
