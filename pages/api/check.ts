// pages/api/check.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const getAccessToken = async () => {
  const url = "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=XZ3E6KL7dUDBvboegDr3Udqe&client_secret=8J22zJSEuWrPqogNyzsZV8uTb2ss7aEl";
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  });

  const data = await response.json();
  return data.access_token;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { text } = req.body;

    const accessToken = await getAccessToken();
    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${accessToken}`;

    const payload = JSON.stringify({
      "messages": [
        {
          "role": "user",
          "content": `${text}以上文字是一个合适的思辨类高考作文题，并且没有携带任何敏感词汇，并且语句完整、意义明确吗？如果是，输出True，否则输出False，不要任何多余的文字或符号。`
        }
      ]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const data = await response.json();

    res.status(200).json({ result: data.result });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};

export default handler;