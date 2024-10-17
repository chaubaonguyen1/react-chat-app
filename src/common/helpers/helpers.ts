import bcrypt from 'bcryptjs'
import {
  createUserWithEmailAndPassword,
  UserCredential,
  signInWithEmailAndPassword,
  Unsubscribe,
} from 'firebase/auth'
import {
  ChatItem,
  ChatStore,
  CurrentUser,
  FileState,
  SignUpForm,
  User,
} from '../types/forms/types'
import { Confirm, Loading, Notify } from 'notiflix'
import { auth, db } from '../../lib/firebase'
import uploadFile from '../../lib/uploadFiles'
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  Query,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Action } from '../enum/enum'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function checkPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword)
    return match
  } catch (err) {
    console.error('Error comparing password:', err)
    throw err
  }
}

export async function submit(
  avatar: FileState,
  values: SignUpForm
): Promise<void> {
  let imgUrl: string | undefined
  try {
    Loading.circle('Loading...')
    const hashedPassword = await hashPassword(values.password)
    const res: UserCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    )
    if (avatar.file) {
      imgUrl = await uploadFile(avatar.file)
    }
    await setDoc(doc(db, 'users', res.user.email || res.user.uid), {
      username: values.username,
      email: values.email,
      id: res.user.uid,
      avatar: imgUrl || '',
      password: hashedPassword,
      blocked: [],
    }),
      await setDoc(doc(db, 'userchatlist', res.user.email || res.user.uid), {
        chats: [],
      })
    Notify.success('Successfully registered!, you can now login.')
    Loading.remove()
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === 'Firebase: Error (auth/email-already-in-use).'
    ) {
      Notify.warning('Email is already in use, please check again')
    }
  }
}

export async function login(data: {
  email: string
  password: string
}): Promise<DocumentData | undefined> {
  try {
    const d = await getDoc(doc(db, 'users', data.email))
    if (d.exists()) {
      const user: DocumentData = d.data()
      const check = await checkPassword(data.password, user.password)
      if (!check) {
        Notify.failure('Wrong password, please check again.')
        return undefined
      }
      await signInWithEmailAndPassword(auth, data.email, data.password)
      Notify.success(`Hello ${user.username}, Welcome back!`)
      return user
    } else {
      Notify.warning('Wrong username, please check again.')
      return undefined
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message)
      Notify.warning('Error')
      return undefined
    }
  }
}

export async function getChatDataWindow(
  chatId: string | null,
  setChatData: (data: ChatStore['chatData']) => void
): Promise<Unsubscribe | undefined> {
  try {
    if (chatId) {
      const unsub: Unsubscribe = onSnapshot(
        doc(db, 'chathistory', chatId),
        async (d) => {
          const res = await d.data()
          if (res) {
            setChatData({
              createAt: res.createAt, // Đảm bảo các trường tồn tại
              messages: res.messages || [], // Đặt mặc định nếu không có messages
            })
          } else {
            setChatData(null) // Nếu res là undefined, đặt là null
          }
        }
      )
      return unsub
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
      Notify.warning(error.message)
      return undefined
    }
  }
}

export async function getCurrentChatData(userEmail: string) {
  const receiverChatRef = doc(db, 'users', userEmail)
  const userChatsSnapshot = await getDoc(receiverChatRef)
  const res = userChatsSnapshot.data()
  return res
}

export async function updateChatData(
  text: string,
  chatId: string,
  currentUser: CurrentUser,
  selectedUser: User | null,
  image: string | undefined
) {
  try {
    const chatHistoryRef = doc(db, 'chathistory', chatId)
    let userIds
    if (selectedUser) {
      userIds = [currentUser.email, selectedUser?.email]
      userIds.forEach(async (email) => {
        const userChatRef = doc(db, 'userchatlist', email)
        const userChatsSnapshot = await getDoc(userChatRef)
        if (userChatsSnapshot.exists()) {
          const data = userChatsSnapshot.data()
          const chatIndex = data.chats.findIndex(
            (chat: any) => chat.chatId === chatId
          )
          data.chats[chatIndex].lastMessage = text
          data.chats[chatIndex].isSeen =
            email === currentUser.email ? true : false
          data.chats[chatIndex].updatedAt = Date.now()
          await updateDoc(userChatRef, {
            chats: data.chats,
          })
        }
      })
      const messageData: any = {
        sender: currentUser.username,
        text,
        createdAt: new Date(),
      }

      if (image !== undefined) {
        messageData.img = image
      }

      await updateDoc(chatHistoryRef, {
        messages: arrayUnion(messageData),
      })
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
      Notify.warning(error.message)
      return undefined
    }
  }
}

export async function getChatData(
  userEmail: string,
  fetchChatData: (data: any) => void
): Promise<Unsubscribe | undefined> {
  try {
    if (userEmail) {
      const unsub: Unsubscribe = onSnapshot(
        doc(db, 'userchatlist', userEmail),
        async (d) => {
          const res = d.data()?.chats
          const promises = res.map(async (item: any) => {
            const userDocRef = doc(db, 'users', item.receiver)
            const userDocSnap = await getDoc(userDocRef)
            const user = userDocSnap.data()

            return { ...item, user }
          })
          const chatData = await Promise.all(promises)
          const sorted = chatData.sort((a, b) => b.updatedAt - a.updatedAt)
          fetchChatData(sorted)
        }
      )
      return unsub
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
      Notify.warning(error.message)
      return undefined
    }
  }
}

export async function onSearchUser(
  username: string,
  fetchSearchUser: (data: DocumentData) => void
): Promise<void | undefined> {
  try {
    Loading.circle('Loading...')
    const userRef = collection(db, 'users')
    const q: Query<DocumentData> = query(
      userRef,
      where('username', '==', username)
    )
    const querySnapShot = await getDocs(q)
    if (!querySnapShot.empty) {
      const d: DocumentData = querySnapShot.docs.map((doc) => doc.data())
      fetchSearchUser(d)
      Loading.remove()
    } else {
      Notify.info('No users found')
      fetchSearchUser([])
      Loading.remove()
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
      Notify.warning(error.message)
      return undefined
    }
  }
}

export async function onAddUser(
  emailUserAdded: string,
  currentUserEmail: string
): Promise<void> {
  const chatRef = collection(db, 'chathistory')
  const userChatRef = collection(db, 'userchatlist')
  try {
    Loading.circle('Loading...')
    const newChatRef = doc(chatRef)
    await setDoc(newChatRef, {
      createAt: serverTimestamp(),
      messages: [],
    })
    if (emailUserAdded === currentUserEmail) {
      await updateDoc(doc(userChatRef, emailUserAdded), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiver: currentUserEmail,
          updatedAt: Date.now(),
        }),
      })
    } else {
      await updateDoc(doc(userChatRef, emailUserAdded), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiver: currentUserEmail,
          updatedAt: Date.now(),
        }),
      })
      await updateDoc(doc(userChatRef, currentUserEmail), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiver: emailUserAdded,
          updatedAt: Date.now(),
        }),
      })
    }
    Loading.remove()
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
      Notify.warning(error.message)
      return undefined
    }
  }
}

export function onShowConfirm(
  confirmMessage: string,
  message: string,
  successMessage: string,
  onConfirm: () => Promise<void> | void
): void {
  return Confirm.show(
    `${confirmMessage}`,
    `${message}`,
    'Yes',
    'No',
    async () => {
      Loading.circle()
      await onConfirm()
      Notify.info(`${successMessage}`)
      Loading.remove()
    },
    () => {
      Loading.remove()
    },
    {}
  )
}

export async function onBlockUser(
  currentUser: CurrentUser,
  selectedUser: User,
  type: string,
  setBlock: () => void
) {
  try {
    if (currentUser && type === Action.Block) {
      await updateDoc(doc(db, 'users', currentUser.email), {
        blocked: arrayUnion(selectedUser.email),
      })
      setBlock()
    } else if (currentUser && type === Action.Unblock) {
      await updateDoc(doc(db, 'users', currentUser.email), {
        blocked: arrayRemove(selectedUser.email),
      })
      setBlock()
    }
  } catch (error) {
    console.error(error)
  }
}
