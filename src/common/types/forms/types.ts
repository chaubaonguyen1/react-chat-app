import { DocumentData } from "firebase/firestore"

export type FileState = {
  file: File | null
  url: string
}

export type SignUpForm = {
  email: string
  username: string
  password: string
}

export type ChatItem = {
  chatId: string
  lastMessage: string
  receiver: string
  updatedAt: number
  user: UserStore['currentUser']
  isSeen: boolean

}

export type CurrentUser = {
  avatar: string
  blocked: string[]
  email: string
  id: string
  password: string
  username: string
}

export type User = CurrentUser

export type UserStore = {
  currentUser: CurrentUser
  chatList: ChatItem[]
  searchUserList: any[]
  isLogin: boolean
  isLoading: boolean
  fetchUserInfo: (res: DocumentData | undefined) => void
  fetchChatData: (res: any) => void
  fetchSearchUser: (res: any) => void
}

export type ChatStore = {
  chatId: string | null
  user: User | null
  isCurrentUserBlocked: boolean
  isReceiverBlocked: boolean
  chatData: {
    createAt: number
    messages: any[]
  } | null
  getChatData: (chatId: string, selectedUser: User) => void
  setChatData: (chatData: ChatStore['chatData']) => void
  setBlock: () => void
}

export type CurrentUserType = Pick<UserStore, 'currentUser'>
