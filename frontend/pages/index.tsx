// filepath: frontend/pages/index.tsx
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>FlipDule - Welcome</title>
        <meta name="description" content="FlipDule Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.brand}>FlipDule</span>
        </h1>

        <p className={styles.subtitle}>
          Your scheduling companion
        </p>

        <div className={styles.cardGrid}>
          <div className={styles.featureCard}>
            <h3>📅 Schedule</h3>
            <p>Manage your time effectively</p>
          </div>

          <div className={styles.featureCard}>
            <h3>🔄 Flip</h3>
            <p>Switch between tasks seamlessly</p>
          </div>

          <div className={styles.featureCard}>
            <h3>✨ Organize</h3>
            <p>Keep everything in one place</p>
          </div>
        </div>
      </main>
    </div>
  )
}