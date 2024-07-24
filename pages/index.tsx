import React, { useState } from 'react';
import styles from '../styles/HomePage.module.css';
import Image from 'next/image';
import { message } from 'antd';
import { useRouter } from 'next/router';

const HomePage = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const router = useRouter(); // 使用 useRouter hook
  const handleSubmit = async () => {
    if (!inputText) return message.warning("你还没有输入作文题目呢...");
    if (inputText.length > 70) return message.error("作文题目太长了！");
    message.success("检测中...");
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputText }),
    });

    const data = await response.json();
    setResult(data.result);
    if (data.result == "True") {
      message.success("是一个不错的作文题！");
      // 获取当前作文数量
      const countResponse = await fetch('/api/getEssayCount');
      const countData = await countResponse.json();
      const newId = countData.count + 1;

      // 立即跳转到生成的 ID 页面
      router.push(`/essay/${newId}`);
      const saveResponse = await fetch('/api/saveTopic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const saveData = await saveResponse.json();
    } else {
      message.error("似乎不是一个合适的作文题呢...");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Logo" width={250} height={100} />
        </div>
        <div className={styles.buttonGroup}>
          <a href="/" className={styles.button}>写作</a>
          <a href="/ArticlePage" className={styles.button}>浏览</a>
          <a href="/about" className={styles.button}>关于</a>
        </div>
      </header>
      
      <main className={styles.content}>
        <h2>写作，是对生命的追问。</h2>
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyPress={handleKeyPress}
          />
          <button className={styles.button} onClick={handleSubmit}>写</button>
        </div>
      </main>
    </div>
  );
}

export default HomePage;