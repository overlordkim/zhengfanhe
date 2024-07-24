// pages/api/essay/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function openDb() {
  return open({
    filename: './public/example.db',
    driver: sqlite3.Database
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Missing ID parameter' });
    return;
  }

  try {
    const db = await openDb();
    const essay = await db.get('SELECT * FROM debate WHERE id = ?', id);
    
    if (essay) {
      res.status(200).json(essay);
    } else {
      res.status(404).json({ error: 'Essay not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}