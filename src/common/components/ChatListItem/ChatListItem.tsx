import { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import AddUser from '../../../components/ChatList/AddUser/AddUser'
import { useUserStore } from '../../../store/userStore'
import { getChatData, getCurrentChatData } from '../../helpers/helpers'
import { Unsubscribe } from 'firebase/auth'
import { useChatStore } from '../../../store/chatStore'
import { ChatItem, User } from '../../types/forms/types'

export default function ChatListItem() {
  const [isAddUser, setIsAddUser] = useState<boolean>(false)
  const { currentUser, fetchChatData, chatList } = useUserStore()
  const { getChatData: getChat } = useChatStore()
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined
    async function getData() {
      unsubscribe = await getChatData(currentUser.email, fetchChatData)
    }
    getData()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser])

  async function handleChangeChatWindow(chat: ChatItem): Promise<void> {
    const res = await getCurrentChatData(chat.receiver)
    if (res) {
      getChat(chat.chatId, res as User)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <div className={styles.searchBar}>
          <img className={styles.icon} src='./search.png' alt='' />
          <input type='text' placeholder='Search' />
        </div>
        <img
          className={`${styles.icon}`}
          src={isAddUser ? './minus.png' : './plus.png'}
          alt=''
          onClick={() => {
            setIsAddUser((prev) => !prev)
          }}
        />
      </div>
      {chatList.length
        ? chatList.map((item) => {
            return (
              <div
                className={styles.item}
                key={item.chatId}
                onClick={() => handleChangeChatWindow(item)}
                style={{
                  backgroundColor: item?.isSeen ? 'transparent' : '#5183fe',
                }}
              >
                <img
                  className={styles.image}
                  src={item.user.avatar || './avatar.png'}
                  alt='avatar'
                />
                <div className={styles.texts}>
                  <span className={styles.name}>{item.user.username}</span>
                  <span className={styles.message}>
                    {item.lastMessage || 'No messages yet.'}
                  </span>
                </div>
              </div>
            )
          })
        : null}

      {isAddUser ? <AddUser /> : null}
    </div>
  )
}
