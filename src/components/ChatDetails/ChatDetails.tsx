import { Loading, Notify } from 'notiflix'
import { auth } from '../../lib/firebase'
import styles from './styles.module.scss'
import { onBlockUser, onShowConfirm } from '../../common/helpers/helpers'
import { useChatStore } from '../../store/chatStore'
import { useUserStore } from '../../store/userStore'
import { Action } from '../../common/enum/enum'

export default function ChatDetails() {
  const {
    chatId,
    setChatData,
    chatData,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    setBlock,
  } = useChatStore()
  const { currentUser } = useUserStore()
  console.log('isCurrentUserBlocked: ', isCurrentUserBlocked)
  console.log('isReceiverBlocked: ', isReceiverBlocked)
  
  function handleSignOut(): void {
    onShowConfirm(
      `You are about to log out.`,
      `Are you sure to log out?`,
      `Logged out successfully!`,
      async () => await auth.signOut()
    )
  }

  function handleBlock() {
    if (!user) return
    try {
      onShowConfirm(
        `You are about to block this user.`,
        `Proceed?`,
        `This user has been blocked!`,
        async () => await onBlockUser(currentUser, user, Action.Block, setBlock)
      )
    } catch (error) {
      console.error(error)
    }
  }

  function handleUnBlock() {
    if (!user) return
    onShowConfirm(
      `You are about to un-block this user.`,
      `Proceed?`,
      `This user has been un-blocked!`,
      async () => await onBlockUser(currentUser, user, Action.Unblock, setBlock)
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <img
          src={!isCurrentUserBlocked && !isReceiverBlocked ? user?.avatar : './avatar.png'}
          alt='avatar'
        />
        <h2>{!isCurrentUserBlocked && !isReceiverBlocked ? user?.username : 'User'}</h2>
        <p>{!isCurrentUserBlocked && !isReceiverBlocked ? user?.email : 'Unavailable'}</p>
      </div>
      <div className={styles.information}>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Chat Settings</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Privacy & Help</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Shared Photos</span>
            <img src='./arrowDown.png' alt='' />
          </div>
          <div className={styles.photos}>
            <div className={styles.photoItem}>
              <div className={styles.photoDetails}>
                <img
                  src='https://images.pexels.com/photos/3064714/pexels-photo-3064714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                  alt=''
                />
                <span>photo_2024_2.png</span>
              </div>
              <img
                className={styles.downloadIcon}
                src='./download.png'
                alt=''
              />
            </div>
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Chat Settings</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Shared Files</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <button onClick={!isCurrentUserBlocked ? handleBlock : handleUnBlock}>
          {isReceiverBlocked
            ? 'Unblock this user'
            : isCurrentUserBlocked
            ? 'You have been blocked by this user.'
            : 'Block this user'}
        </button>
        <button className={styles.logoutBtn} onClick={handleSignOut}>
          Log out
        </button>
      </div>
    </div>
  )
}
