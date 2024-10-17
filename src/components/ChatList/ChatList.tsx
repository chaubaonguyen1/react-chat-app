import ChatListItem from "../../common/components/ChatListItem/ChatListItem"
import UserInfo from "../../common/components/UserInfo/UserInfo"
import styles from "./styles.module.scss"

export default function ChatList() {
  return (
    <div className={styles.container}>
      <UserInfo />
      <ChatListItem />
    </div>
  )
}
