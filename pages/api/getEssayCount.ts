import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open SQLite database
async function openDb() {
  return open({
    filename: './public/example.db',
    driver: sqlite3.Database,
  });
}

// Define API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const db = await openDb();
      const result = await db.get('SELECT COUNT(*) as count FROM debate');

      res.status(200).json(result);
    } catch (error) {
      console.error('Database error: ', error);
      res.status(500).json({ message: '查询作文数量时出错' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}