import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return <Toaster position="top-center" toastOptions={{
    style: {
      background: '#23272f',
      color: '#ececf1',
      border: '1px solid #353740',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      zIndex: 99999,
    },
    duration: 4000,
  }} />
} 