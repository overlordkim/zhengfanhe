// pages/api/essay/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

// JSON file path
const jsonDataPath = path.resolve('./essay_data.json');

// Function to read data from the JSON file
async function readData() {
  try {
    const data = await fs.readFile(jsonDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File not found, return empty array
      return [];
    } else {
      throw error;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Missing ID parameter' });
    return;
  }

  try {
    const data = await readData();
    const index = Number(id) - 1; // Convert id to number and adjust for zero-based index

    if (index >= 0 && index < data.length) {
      const essay = data[index];
      res.status(200).json(essay);
    } else {
      res.status(404).json({ error: 'Essay not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}