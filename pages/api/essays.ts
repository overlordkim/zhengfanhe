// pages/api/essays.ts
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function openDb() {
  return open({
    filename: './public/example.db',
    driver: sqlite3.Database,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 20 } = req.query;

  try {
    const db = await openDb();
    const offset = (Number(page) - 1) * Number(limit);
    const essays = await db.all('SELECT * FROM debate LIMIT ? OFFSET ?', [Number(limit), offset]);
    const totalEssays = await db.get('SELECT COUNT(*) as count FROM debate');

    res.status(200).json({
      essays,
      total: totalEssays.count,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}