import React from 'react';
import Image from 'next/image';
import styles from '../styles/AboutPage.module.css';
import Link from 'next/link';
const AboutPage = () => {
  return (
    <div>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Logo" width={250} height={100} />
        </div>
        <div className={styles.buttonGroup}>
        <Link href="/" passHref>
            <button className={styles.button}>写作</button>
          </Link>
          <Link href="/ArticlePage" passHref>
            <button className={styles.button}>浏览</button>
          </Link>
          <Link href="/about" passHref>
            <button className={styles.button}>关于</button>
          </Link>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.aboutSection}>
          <div className={styles.profilePicture}>
            <Image src="/avatar.png" alt="头像" width={150} height={150} className={styles.roundedImage} />
          </div>
          <div className={styles.introduction}>
            <p>你好，我是Polynomial Matrix，现在在清华大学计算机系读大三，曾经是上海高考第三名。</p>
            <h2>&nbsp;</h2>
            <p>我很喜欢写议论文，希望这个网站能帮到你。</p>
            <h2>&nbsp;</h2>
            <p>小红书: Polynomial Matrix</p>
            <p>Email: 3501049660@qq.com</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AboutPage;