import { useUserStore } from '../../../store/userStore'
import styles from './styles.module.scss'

export default function UserInfo() {
  const { currentUser } = useUserStore()

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <img src={currentUser.avatar || './avatar.png'} alt='avatar' />
        <h2>{currentUser.username}</h2>
      </div>
      <div className={styles.icons}>
        <img src='./more.png' alt='' />
        <img src='./video.png' alt='' />
        <img src='./edit.png' alt='' />
      </div>
    </div>
  )
}
