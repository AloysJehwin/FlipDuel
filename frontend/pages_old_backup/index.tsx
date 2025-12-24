import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [activeCard, setActiveCard] = useState<number | null>(null)

  const features = [
    {
      icon: '📅',
      title: 'Smart Scheduling1',
      description: 'AI-powered scheduling that learns your preferences and optimizes your day',
      details: ['Auto-prioritization', 'Time blocking', 'Smart suggestions']
    },
    {
      icon: '🔄',
      title: 'Instant Flip',
      description: 'Switch between tasks seamlessly with one-click context switching',
      details: ['Quick transitions', 'Save progress', 'Resume anywhere']
    },
    {
      icon: '✨',
      title: 'Stay Organized',
      description: 'Keep all your schedules, tasks, and reminders in perfect harmony',
      details: ['Custom categories', 'Color coding', 'Tags & filters']
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set and achieve your goals with visual progress tracking',
      details: ['Progress bars', 'Milestones', 'Achievement badges']
    },
    {
      icon: '🤝',
      title: 'Collaborate',
      description: 'Share schedules and coordinate with teams effortlessly',
      details: ['Team calendars', 'Real-time sync', 'Shared tasks']
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Get insights into how you spend your time and improve productivity',
      details: ['Time reports', 'Productivity graphs', 'Weekly insights']
    }
  ]

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '1M+', label: 'Tasks Completed' },
    { value: '99%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' }
  ]

  return (
    <div className={styles.container}>
      <Head>
        <title>FlipDule - Smart Scheduling Made Simple</title>
        <meta name="description" content="FlipDule - Your intelligent scheduling companion that helps you master time management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
        <div className={styles.shape4}></div>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🔄</span>
            <span className={styles.logoText}>FlipDule</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#pricing">Pricing</a>
            <button className={styles.navButton}>Sign In</button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>✨</span>
            <span>New: AI-Powered Smart Suggestions</span>
          </div>
          
          <h1 className={styles.title}>
            <span className={styles.titleWord}>Flip</span>
            <span className={styles.titleWord}>Your</span>
            <span className={styles.titleWordBrand}>Schedule</span>
          </h1>

          <p className={styles.subtitle}>
            Master your time with intelligent scheduling that adapts to you.
            <br />
            Boost productivity, reduce stress, and achieve more every day.
          </p>

          <div className={styles.ctaGroup}>
            <button className={styles.ctaButton}>
              Get Started Free →
            </button>
            <button className={styles.ctaButtonSecondary}>
              Watch Demo
            </button>
          </div>

          <div className={styles.trustBadges}>
            <span>⭐⭐⭐⭐⭐ 4.9/5 rating</span>
            <span>•</span>
            <span>Trusted by 50,000+ users</span>
          </div>
        </div>

        <div className={styles.statsSection}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <section id="features" className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Powerful Features</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to take control of your schedule
            </p>
          </div>

          <div className={styles.cardGrid}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`${styles.featureCard} ${activeCard === index ? styles.active : ''}`}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                
                <ul className={styles.featureDetails}>
                  {feature.details.map((detail, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}>✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Transform Your Productivity?</h2>
            <p>Join thousands of users who have already improved their time management</p>
            <button className={styles.ctaButtonLarge}>
              Start Your Free Trial
            </button>
            <p className={styles.ctaNote}>No credit card required • 14-day free trial</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>FlipDule</h4>
            <p>Smart scheduling made simple</p>
          </div>
          <div className={styles.footerSection}>
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#updates">Updates</a>
          </div>
          <div className={styles.footerSection}>
            <h5>Company</h5>
            <a href="#about">About</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </div>
          <div className={styles.footerSection}>
            <h5>Resources</h5>
            <a href="#docs">Documentation</a>
            <a href="#blog">Blog</a>
            <a href="#support">Support</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 FlipDule. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}