// pages/essay/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../../styles/EssayPage.module.css';
import Link from 'next/link';
type Essay = {
  theme: string;
  pro: string;
    con: string;
    pro_args: string;
    con_args: string;
    title: string;
    content: string;
};

const EssayPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryNeeded, setRetryNeeded] = useState(false); // New state variable
  const fetchData = () => {
    setLoading(true);
    if (id) {
      fetch(`/api/essay/${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          } else {
            setEssay(data);
            // Check if retry is needed
            if (!data.pro || !data.con || !data.title) {
              setRetryNeeded(true);
            } else {
              setRetryNeeded(false); // No retry needed if all fields are not empty
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch essay:', error);
          setLoading(false);
        });
    }
  }

  useEffect(() => {
    fetchData();

    // Check for empty fields and refetch data if needed
    const interval = setInterval(() => {
      if (retryNeeded) {
        fetchData();
      }
    }, 15000); // Change the interval time as needed

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [id, retryNeeded]);

  if (loading) {
    return <div>
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
  </div>;
  }

  if (!essay) {
    return <div>
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
        <div className={styles.essaySection}>
          <h1 className={styles.theme}>前面的区域以后再来探索吧</h1>
        </div>
      </main>
  </div>;
  }

  const renderArguments = (args: string) => {
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(args);
    } catch (error) {
      console.error(`Failed to parse arguments: ${args}`);
    }

    return Object.entries(parsedArgs).map(([key, value]) => (
      <div key={key} className={styles.argument}>
        <strong>{key}</strong> <br/>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{value as any}
      </div>
    ));
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((str, index) => (
      <span key={index}>
        {index > 0 && <><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>}
        {str}
      </span>
    ));
  };
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
        <div className={styles.essaySection}>
          <h1 className={styles.theme}>{essay.theme}</h1>
          <hr className={styles.separator} />
          <div className={styles.views}>
          <div className={styles.proView}>
              <h3 className={styles.proTitle}>有人说...</h3>
                          {essay.pro && <p>{essay.pro}</p>}
                          {essay.pro && <div className={styles.argumentsSection}>
                                {renderArguments(essay.pro_args)}
                          </div>}
                          {!essay.pro && <Image src="/writing.gif" alt="Loading..." width={64} height={64} />}
                          {!essay.pro && <p>为你写作中...</p>}
            </div>
            <div className={styles.conView}>
              <h3 className={styles.conTitle}>但有人认为...</h3>
                          {essay.con && <p>{essay.con}</p>}
                          {essay.con && <div className={styles.argumentsSection}>
                              {renderArguments(essay.con_args)}
                          </div>}
                          {!essay.con && <Image src="/writing.gif" alt="Loading..." width={64} height={64} />}
                          {!essay.con && <p>为你写作中...</p>}
                      </div>
                  </div>
                                        {/* 新的标题和正文区域 */}
          <hr className={styles.separator} />
          <div className={styles.articleSection}>
                {essay.title && <h2 className={styles.articleTitle}>{essay.title}</h2>}
                      {essay.title && <p className={styles.articleContent}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formatContent(essay.content)}</p>}
                      {!essay.title && <Image src="/writing.gif" alt="Loading..." width={64} height={64} />}
                          {!essay.title && <p className={styles.articleContent}>为你写作中...</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EssayPage;