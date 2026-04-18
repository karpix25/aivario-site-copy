import React from 'react'
import NextLayout from '../src/components/NextLayout'
import '../src/styles/app.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <NextLayout>
      <Component {...pageProps} />
    </NextLayout>
  )
}
