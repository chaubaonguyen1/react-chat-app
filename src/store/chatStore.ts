import { create } from 'zustand'
import { ChatStore, User } from '../common/types/forms/types'
import { useUserStore } from './userStore'
import { Loading } from 'notiflix'

export const useChatStore = create<ChatStore>()((set, get) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  chatData: null,
  getChatData: (chatId, selectedUser: User) => {
    Loading.circle()
    set({ user: selectedUser })
    const currentUser = useUserStore.getState().currentUser
    const currentChatId = useChatStore.getState().chatId
    console.log('currentUser: ', currentUser)
    console.log('currentChatId: ', currentChatId)
    console.log('selectedUser: ', selectedUser)
    if (currentUser?.blocked?.includes(selectedUser?.email)) {
      set({
        chatId,
        user: selectedUser,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      })
    } else if (selectedUser?.blocked?.includes(currentUser?.email)) {
      set({
        chatId,
        user: selectedUser,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      })
    } else {
      set({
        chatId,
        user: selectedUser,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      })
    }
    Loading.remove()
  },
  setChatData: (chatData) => {
    set((state) => ({
      ...state,
      chatData,
    }))
  },
  setBlock: () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }))
  },
}))
