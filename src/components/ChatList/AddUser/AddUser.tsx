import { Loading } from 'notiflix'
import { onAddUser, onSearchUser } from '../../../common/helpers/helpers'
import { useUserStore } from '../../../store/userStore'
import styles from './styles.module.scss'
export default function AddUser() {
  const { searchUserList, fetchSearchUser, currentUser } = useUserStore()

  const handleSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault()
    const form = event.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      ?.value
    try {
      await onSearchUser(username, fetchSearchUser)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddUser = async (email: string): Promise<void> => {
    try {
      await onAddUser(email, currentUser.email)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={styles.container}>
      <form action='' onSubmit={handleSearch}>
        <input type='text' placeholder='Username' name='username' />
        <button>Search</button>
      </form>
      {searchUserList.length
        ? searchUserList.map((item) => (
            <div className={styles.user} key={item.id}>
              <div className={styles.details}>
                <img src={item.avatar || './avatar.png'} alt='' />
                <div>
                  <p>{item.username}</p>
                  <p style={{ fontSize: 12, fontWeight: 300 }}>
                    {item.email}
                  </p>
                </div>
              </div>
              {/* {item.email === } */}
              <button onClick={() => handleAddUser(item.email)}>
                Add User
              </button>
            </div>
          ))
        : null}
    </div>
  )
}
