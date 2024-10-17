import { create } from 'zustand'
import { UserStore } from '../common/types/forms/types'


export const useUserStore = create<UserStore>()((set) => ({
  currentUser: {
    avatar: '',
    blocked: [],
    email: '',
    id: '',
    password: '',
    username: '',
  },
  isLogin: false,
  isLoading: true,
  chatList: [],
  searchUserList: [],
  fetchUserInfo: (res): void => {
    if (res) {
      set({
        currentUser: {
          avatar: res.avatar,
          blocked: res.blocked,
          email: res.email,
          id: res.id,
          password: res.password,
          username: res.username,
        },
        isLogin: true,
        isLoading: false,
      })
    } else {
      set({
        currentUser: {
          avatar: '',
          blocked: [],
          email: '',
          id: '',
          password: '',
          username: '',
        },
        isLogin: false,
        isLoading: false,
      })
    }
  },
  fetchChatData: (res) => {
    if (res) {
      set({ chatList: res })
    } else {
      set({ chatList: [] })
    }
  },
  fetchSearchUser: (res) => {
    if (res) {
      set({ searchUserList: res })
    } else {
      set({ searchUserList: [] })
    }
  },
}))
