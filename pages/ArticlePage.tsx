import React, { useState, useEffect } from 'react';
import { ConfigProvider,Pagination } from 'antd';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/ArticlePage.module.css';
import Link from 'next/link';
interface Essay {
  id: number;
  title: string;
  theme: string;
}

const ArticlePage: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();
  useEffect(() => {
    fetchEssays(currentPage);
  }, [currentPage]);

  const fetchEssays = async (page: number) => {
    try {
      const response = await axios.get(`/api/essays?page=${page}`);
      setEssays(response.data.essays);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch essays:', error);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNavigate = (id: number) => {
    router.push(`/essay/${id}`);
  };
  return (
    <div>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Logo" width="250" height="100" />
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
        <div className={styles.articlesContainer}>
          {essays.map((essay) => (
            <div key={essay.id} className={styles.articleBox} onClick={() => handleNavigate(essay.id)}>
              <strong className={styles.title}>{essay.title}</strong>
              <p>{essay.theme}</p>
            </div>
          ))}
              </div>
              <div className={styles.paginationContainer}>
        <ConfigProvider
          theme={{
            components: {
              Pagination: {
                    colorPrimary: '#eee', // 白色字体
                    colorPrimaryHover: '#fff', // 悬停时白色字体
                    colorText: '#ddd',
                    colorBgContainer: '#000',
              },
            },
          }}
        >
        <Pagination
          current={currentPage}
          pageSize={20}
          total={total}
          onChange={handlePageChange}
          className={styles.pagination}
                  />
                  </ConfigProvider></div>
      </main>
    </div>
  );
};

export default ArticlePage;