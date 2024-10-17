import { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import {
  FileState,
  SignUpForm,
} from '../../common/types/forms/types'
import { Notify } from 'notiflix'
import {
  useForm,
  SubmitHandler,
  FieldErrors,
  SubmitErrorHandler,
} from 'react-hook-form'
import { FieldName } from '../../common/enum/enum'
import { login, submit } from '../../common/helpers/helpers'
import { PulseLoader } from 'react-spinners'
import { validateRegisterFields } from '../../common/consts/consts'
import { useUserStore } from '../../store/userStore'

export default function Login() {
  const [isSignIn, setIsSignIn] = useState<boolean>(false)
  const [isSubmit, setIsSubmit] = useState<boolean>(false)
  const [switchTab, setSwitchTab] = useState<boolean>(false)
  const [avatar, setAvatar] = useState<FileState>({
    file: null,
    url: '',
  })
  const { fetchUserInfo } = useUserStore()
  const {
    register: signUpRegister,
    handleSubmit: handleSignUp,
    getValues: getValueSignUp,
  } = useForm<SignUpForm>()

  const onSubmit: SubmitHandler<SignUpForm> = async (): Promise<void> => {
    const values = getValueSignUp()
    setIsSubmit(true)
    await submit(avatar, values)
    setIsSubmit(false)
  }

  const onLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault()
    setIsSignIn(true)
    const form = event.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      ?.value
    if (email.length && password.length) {
      const res = await login({ email, password })
      fetchUserInfo(res)
      console.log(res)
      setIsSignIn(false)
    }
  }

  const onErrorSignUp: SubmitErrorHandler<SignUpForm> = (
    errors: FieldErrors<SignUpForm>
  ): void => {
    if (errors) {
      Object.values(errors).forEach((error) => {
        Notify.warning(error.message || 'Unknown error')
      })
    }
  }

  function handleChangeAvatar(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    const acceptedFiles = ['.jpg', '.jpeg', '.png']
    if (file) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase()
      if (acceptedFiles.includes(fileExtension)) {
        setAvatar({
          url: URL.createObjectURL(file),
          file,
        })
      } else {
        Notify.warning('Only images files can be accepted')
      }
    }
  }

  // Cleanup URL object whenever avatar changes
  useEffect(() => {
    return () => {
      if (avatar.url) {
        URL.revokeObjectURL(avatar.url) // Cleanup previous URL object
      }
    }
  }, [avatar])

  return (
    <div className={styles.container}>
      <div
        className={`${styles.item} ${
          switchTab ? styles.signIn : styles.createAccount
        }`}
      >
        <h2>Create a new Account</h2>
        <form action='' onSubmit={handleSignUp(onSubmit, onErrorSignUp)}>
          <label htmlFor='file'>
            <img src={avatar.url || './avatar.png'} alt='' />
            Upload an Image
          </label>
          <input
            type='file'
            accept='.jpg,.jpeg,.png'
            id='file'
            style={{ display: 'none' }}
            onChange={handleChangeAvatar}
          />
          <input
            type='text'
            {...signUpRegister(
              FieldName.Email,
              validateRegisterFields('Email', FieldName.Email)
            )}
            placeholder='Type your email'
          />
          <input
            type='text'
            {...signUpRegister(
              FieldName.Username,
              validateRegisterFields('Username', FieldName.Username)
            )}
            placeholder='Type your username'
          />
          <input
            type='password'
            {...signUpRegister(
              FieldName.Password,
              validateRegisterFields('Password', FieldName.Password)
            )}
            placeholder='Password must be 8 to 16 characters'
          />
          {isSubmit ? (
            <PulseLoader
              color={'#1a73e8'}
              size={10}
              aria-label='Loading Spinner'
              data-testid='loader'
            />
          ) : (
            <input type='submit' className={styles.submitBtn} />
          )}

          <button type='button' onClick={() => setSwitchTab(true)}>
            Sign In
          </button>
        </form>
      </div>
      <div
        className={`${styles.item} ${
          switchTab ? styles.createAccount : styles.signIn
        }`}
      >
        <h2>Sign In</h2>
        <form action='' onSubmit={onLogin}>
          <label>Welcome back,</label>
          <input type='text' name='email' placeholder='Email' />
          <input type='password' name='password' placeholder='Password' />
          {isSignIn ? (
            <PulseLoader
              color={'#1a73e8'}
              size={10}
              aria-label='Loading Spinner'
              data-testid='loader'
            />
          ) : (
            <button type='submit'>Sign In</button>
          )}

          <button type='button' onClick={() => setSwitchTab(false)}>
            Create a new Account
          </button>
        </form>
      </div>
    </div>
  )
}
