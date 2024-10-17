import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.scss'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { IEmoji } from '../../common/types/emoji/types'
import { useChatStore } from '../../store/chatStore'
import { Unsubscribe } from 'firebase/auth'
import { getChatDataWindow, updateChatData } from '../../common/helpers/helpers'
import { useUserStore } from '../../store/userStore'
import { Notify } from 'notiflix'
import uploadFile from '../../lib/uploadFiles'

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [text, setText] = useState<string>('')
  const [img, setImg] = useState<{ file: File | null; url: string }>({
    file: null,
    url: '',
  })
  const { chatId, setChatData, chatData, user } = useChatStore()
  const { currentUser } = useUserStore()

  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLImageElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleText(event: React.ChangeEvent<HTMLInputElement>): void {
    setText(event.target.value)
  }

  function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    const acceptedFiles = ['.jpg', '.jpeg', '.png']
    if (file) {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase()
      if (acceptedFiles.includes(fileExtension)) {
        setImg({
          url: URL.createObjectURL(file),
          file,
        })
      } else {
        Notify.warning('Only images files can be accepted')
      }
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      pickerRef.current &&
      !pickerRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  async function onSendText() {
    if (!text) return
    try {
      let imgUrl: string | undefined
      if (img.file) {
        imgUrl = await uploadFile(img.file)
      }
      await updateChatData(text, chatId || '', currentUser, user, imgUrl)
      setText('')
      setImg({ file: null, url: '' })
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    //auto scroll when the first time log in.
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    // Add event listener when the component is mounted
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined
    async function getData() {
      unsubscribe = await getChatDataWindow(chatId, setChatData)
    }
    getData()

    return () => {
      if (unsubscribe) {
        unsubscribe() // Gọi hàm unsubscribe trong cleanup để dừng lắng nghe
      }
    }
  }, [chatId])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        onSendText()
      }
    }
    // Add keydown event listener
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      // Clean up the event listener
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [text])

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.user}>
          <img className={styles.avatar} src='./avatar.png' alt='' />
          <div className={styles.name}>
            <span>Jane Doe</span>
            <p className={styles.description}>Lorem ipsum dolor sit amet</p>
          </div>
        </div>
        <div className={styles.icons}>
          <img src='./phone.png' alt='' />
          <img src='./video.png' alt='' />
          <img src='./info.png' alt='' />
        </div>
      </div>
      <div className={styles.center}>
        {chatData?.messages.length ? (
          chatData.messages.map((message) => {
            // console.log(message)
            return (
              <div
                className={
                  message.sender === currentUser.username
                    ? `${styles.message} ${styles.ownMessage}`
                    : styles.message
                }
                key={message?.createdAt}
              >
                <img src='./avatar.png' alt='' />
                <div className={styles.text}>
                  {message.img ? <img src={message.img} alt='' /> : null}
                  <p>{message.text}</p>
                  {/* <span>{message.createdAt}</span> */}
                </div>
              </div>
            )
          })
        ) : (
          <span>No messages yet.</span>
        )}
        {img.url ? (
          <div className={`${styles.message} ${styles.ownMessage}`}>
            <div className={styles.text} style={{ position: 'relative' }}>
              <img src={img.url} alt='image' />
              <img
                src='./remove-icon.png'
                className={styles.removeIcon}
                alt=''
                onClick={() => setImg({ file: null, url: '' })}
              />
            </div>
          </div>
        ) : null}
        <div ref={scrollRef}></div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.icons}>
          <label htmlFor='file'>
            <img src='./img.png' alt='' />
          </label>
          <input
            type='file'
            id='file'
            style={{ display: 'none' }}
            onChange={handleUploadImage}
          />
          <img src='./camera.png' alt='' />
          <img src='./mic.png' alt='' />
        </div>
        <input
          type='text'
          placeholder='Type a message...'
          onChange={handleText}
          value={text}
        />
        <div className={styles.emoji}>
          <img
            ref={buttonRef}
            onClick={() => setIsOpen((prev) => !prev)}
            src='./emoji.png'
            alt=''
          />
          <div className={styles.picker} ref={pickerRef}>
            {isOpen && (
              <Picker
                data={data}
                onEmojiSelect={(e: IEmoji) => {
                  setText((prev) => prev + e.native)
                  setIsOpen(false)
                }}
              />
            )}
          </div>
        </div>
        <button
          className={!text ? styles.sendBtnDisabled : styles.sendBtn}
          onClick={onSendText}
          disabled={!text}
        >
          Send
        </button>
      </div>
    </div>
  )
}
