import ChatList from './components/ChatList/ChatList'
import ChatWindow from './components/ChatWindow/ChatWindow'
import ChatDetails from './components/ChatDetails/ChatDetails'
import Login from './components/Login/Login'
import { useEffect } from 'react'
import './index.css'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from './lib/firebase'
import { useUserStore } from './store/userStore'
import { doc, getDoc } from 'firebase/firestore'
import { Loading } from 'notiflix'
import { ClockLoader } from 'react-spinners'
import { useChatStore } from './store/chatStore'

function App() {
  const { isLogin, isLoading, fetchUserInfo } = useUserStore()
  const { chatId } = useChatStore()
  console.log('chatId: ', chatId)

  useEffect(() => {
    const subscribeData = onAuthStateChanged(
      auth,
      async (user: User | null) => {
        try {
          Loading.circle('Loading...')
          const userId = user?.email || user?.uid
          if (userId) {
            const d = await getDoc(doc(db, 'users', userId))
            fetchUserInfo(d.data())
            Loading.remove()
          } else {
            fetchUserInfo(undefined)
            Loading.remove()
          }
        } catch (err) {
          Loading.remove()
        }
      }
    )
    return () => {
      subscribeData()
    }
  }, [fetchUserInfo])

  if (isLoading) return <ClockLoader size={60} color='#1a73e8' />

  return (
    <div className='container'>
      {isLogin ? (
        <>
          <ChatList />
          {chatId ? (
            <>
              <ChatWindow />
              <ChatDetails />
            </>
          ) : null}
        </>
      ) : (
        <>
          <Login />
        </>
      )}
    </div>
  )
}

export default App
