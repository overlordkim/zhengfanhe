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

// Define API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await readData();
      const count = data.length;

      res.status(200).json({ count });
    } catch (error) {
      console.error('JSON file error: ', error);
      res.status(500).json({ message: '查询作文数量时出错' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}