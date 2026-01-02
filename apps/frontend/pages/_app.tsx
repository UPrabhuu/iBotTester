import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AlertProvider } from '../contexts/AlertContext'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AlertProvider>
        <Component {...pageProps} />
      </AlertProvider>
    </ThemeProvider>
  )
}
