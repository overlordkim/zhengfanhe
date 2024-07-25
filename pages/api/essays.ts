// pages/api/essays.ts
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
  const { page = 1, limit = 20 } = req.query;

  try {
    const data = await readData();
    const offset = (Number(page) - 1) * Number(limit);

    const essays = data.slice(offset, offset + Number(limit));
    const totalEssays = data.length;

    res.status(200).json({
      essays,
      total: totalEssays,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}