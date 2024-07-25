// pages/api/essay/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv'; // 确认已安装 Vercel KV 客户端库

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // 检查是否缺少 ID 参数
  if (!id) {
    res.status(400).json({ error: 'Missing ID parameter' });
    return;
  }

  try {
    // 从 Vercel KV 中获取指定 ID 的作文
    const essay = await kv.get(`essay:${id}`);

    // 如果作文存在，返回其内容，否则返回404
    if (essay) {
      res.status(200).json(essay);
    } else {
      res.status(404).json({ error: 'Essay not found' });
    }
  } catch (error) {
    console.error('Vercel KV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}