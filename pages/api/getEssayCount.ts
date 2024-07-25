import { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv'; // 确认已安装 Vercel KV 客户端库

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const countKey = 'essayCount';

  if (req.method === 'POST') {
    try {
      // 获取当前计数器值，如果不存在则初始化为0
      let count = (await kv.get(countKey)) as number | null;
      if (count === null) {
        count = 0;
      }

      const newEssayId = count + 1;
      const newEssayData = req.body; // 假设请求体中携带 JSON 格式的作文数据

      // 将新的作文存储到 kv，键为 'essay:{newEssayId}'
      await kv.set(`essay:${newEssayId}`, newEssayData);

      // 更新计数器
      await kv.set(countKey, newEssayId);

      // 返回新的作文ID
      res.status(200).json({ id: newEssayId });
    } catch (error) {
      console.error('Vercel KV error: ', error);
      res.status(500).json({ message: '存储作文时出错' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}