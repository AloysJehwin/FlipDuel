import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [activeCard, setActiveCard] = useState<number | null>(null)

  return (
    <div className={styles.container}>
      <Head>
        <title>FlipDule - Smart Scheduling</title>
        <meta name="description" content="FlipDule - Your intelligent scheduling companion" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.titleWord}>Flip</span>
            <span className={styles.titleWord}>Your</span>
            <span className={styles.titleWordBrand}>Schedule</span>
          </h1>

          <p className={styles.subtitle}>
            Master your time with intelligent scheduling that adapts to you
          </p>

          <button className={styles.ctaButton}>
            Get Started →
          </button>
        </div>

        <div className={styles.cardGrid}>
          <div 
            className={`${styles.featureCard} ${activeCard === 0 ? styles.active : ''}`}
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>📅</span>
            </div>
            <h3>Smart Scheduling</h3>
            <p>AI-powered scheduling that learns your preferences and optimizes your day</p>
          </div>

          <div 
            className={`${styles.featureCard} ${activeCard === 1 ? styles.active : ''}`}
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>🔄</span>
            </div>
            <h3>Instant Flip</h3>
            <p>Switch between tasks seamlessly with one-click context switching</p>
          </div>

          <div 
            className={`${styles.featureCard} ${activeCard === 2 ? styles.active : ''}`}
            onMouseEnter={() => setActiveCard(2)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>✨</span>
            </div>
            <h3>Stay Organized</h3>
            <p>Keep all your schedules, tasks, and reminders in perfect harmony</p>
          </div>

          <div 
            className={`${styles.featureCard} ${activeCard === 3 ? styles.active : ''}`}
            onMouseEnter={() => setActiveCard(3)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>🎯</span>
            </div>
            <h3>Goal Tracking</h3>
            <p>Set and achieve your goals with visual progress tracking</p>
          </div>

          <div 
            className={`${styles.featureCard} ${activeCard === 4 ? styles.active : ''}`}
            onMouseEnter={() => setActiveCard(4)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>🤝</span>
            </div>
            <h3>Collaborate</h3>
            <p>Share schedules and coordinate with teams effortlessly</p>
          </div>

          <div 
            className={`${styles.featureCard} ${activeCard === 5 ? styles.active : ''}`}
            onMouseEnter={() => setActiveCard(5)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>📊</span>
            </div>
            <h3>Analytics</h3>
            <p>Get insights into how you spend your time and improve productivity</p>
          </div>
        </div>
      </main>
    </div>
  )
}