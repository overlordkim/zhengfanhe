// pages/api/essays.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv'; // 确认已安装 Vercel KV 客户端库

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '20' } = req.query;

  try {
    // 获取总作文数量，如果不存在则初始化为0
    const countKey = 'essayCount';
    let totalEssays = await kv.get(countKey) as number | null;
    if (totalEssays === null) {
      totalEssays = 0;
    }

    // 计算分页偏移量
    const offset = (Number(page) - 1) * Number(limit);

    // 确定作文的键范围，假设键以 'essay:<id>' 形式存储
    const essays = [];
    for (let i = offset + 1; i <= offset + Number(limit) && i <= totalEssays; i++) {
      const essay = await kv.get(`essay:${i}`);
      if (essay) {
        essays.push(essay);
      }
    }

    res.status(200).json({
      essays,
      total: totalEssays,
    });
  } catch (error) {
    console.error('Vercel KV error: ', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}