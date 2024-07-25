import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { kv } from '@vercel/kv'; // 确认已安装 Vercel KV 客户端库

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN');
}

// Function to get access token from Baidu AI
async function getAccessToken() {
  const url = "https://aip.baidubce.com/oauth/2.0/token";
  const params = {
    grant_type: 'client_credentials',
    client_id: 'XZ3E6KL7dUDBvboegDr3Udqe',
    client_secret: '8J22zJSEuWrPqogNyzsZV8uTb2ss7aEl'
  };

  const response = await axios.post(url, null, { params });
  return response.data.access_token;
}

// Function to get detailed content for the essay
async function getEssayDetails(theme: string) {
  const accessToken = await getAccessToken();
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-3.5-8k-0329?access_token=${accessToken}`;
  
  const payload = {
    messages: [
      {
        role: 'user',
        content: `${theme}\n以上是一篇高考作文题目，但我希望你模拟有关这个作文题的辩论两方。首先给出辩论两方的核心观点，必须要深刻，而且不能太过具体；并且，辩论两方应该是重点考察某个概念的积极意义和消极意义，比如即使这个概念明显带有负面色彩，正方也应该思考它的积极意义，即使这个概念明显是正面的，反方也应该思考它的消极意义；为了做到这一点，两方都应该积极拓宽概念的边界。然后，分别头脑风暴，从两方的角度给出由浅到深的论点，各自至少五个。各方论点必须思考角度多元、论点深刻；而且，论点一定得从宏大的角度思考，体现对人类世界、人类社会的深刻思考。\n由于高考作文的性质，请着眼于人类社会，体现人文关怀。\n附录：浅层的论点，你可以从以下这些角度思考，但不必涉及每个角度，也一定不要复制我给你的词语：\n外在：\n现代社会压力；虚荣、攀比；\n人际：\n包容、理解；共情；\n内在：\n自我审视、内省；\n返回的内容格式是一个json，请你包含如下键值对：\n“正方观点”：正方观点\n“反方观点”：反方观点\n“正方论点”：（一个dict）{论点1关键概念：论点1，论点2关键概念：论点2...}\n“反方论点”：（一个dict）{论点1关键概念：论点1，论点2关键概念：论点2...}顺序要求：正反方的各自最后一个论点一定要是最最有深度的论点，你可以着重从承担社会责任、探索世界奥秘、革除社会积弊、促进世界和平、反对战争、保卫国家安全、为崇高目标牺牲、坚持内心信仰、探索人生意义、保护自然环境、促进各国沟通、反抗世俗束缚、培育下一代儿童等宏大、深刻的角度切入。同时，还要注重切合题目、不跑题。只用输出dict就好，不要任何额外的文字、符号、注释、解释。` 
      }
    ]
  };

  const response = await axios.post(url, payload);
  return response.data;
}

// Function to get title and content given arguments
async function getTitleAndContent(args: { theme: string, shallowPositive: string, shallowNegative: string, deepPositive: string, deepNegative: string, positive: string, negative: string }) {
  const accessToken = await getAccessToken();
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k-latest?access_token=${accessToken}`;
  const angles = "承担社会责任、探索世界奥秘、革除社会积弊、促进世界和平、反对战争、保卫国家安全、为崇高目标牺牲、坚持内心信仰、探索人生意义、保护自然环境、促进各国沟通、反抗世俗束缚、培育下一代儿童";
  const { theme, shallowPositive, shallowNegative, deepPositive, deepNegative, positive, negative } = args;
  
  const payload = {
    messages: [
      {
        role: 'user',
        content: `${theme}\n以上是一篇高考作文题，对此，正面观点是：${positive}，反面观点是：${negative}。在此基础上，我给你提供四个论点，分别是浅层肯定、浅层否定、深层肯定、深层否定，你使用“诚然、然而、当然、更进一步”串联起来四个层次，逻辑要流畅严密；并且在首尾额外补充一段破题段和一段总结段（所以，总共有六段，而且诚然段是第二段哦！）。你必须充分拓展观点的深意，做到深刻、有价值，而且必须涵盖我给你的观点的所有内容，不要遗漏。有八个要求：1、文章总共有六段：破题、浅层肯定、浅层否定、深层肯定、深层否定、总结（我只是告诉你这六段的总体内容，请不要在段落任何地方出现“浅层肯定,浅层否定,深层肯定,深层否定”这种提示词，并且注意不要把破题段和浅层肯定段叠在一起了，诚然段（浅层肯定段）是要单独成段，而且是第二段哦~）。2、每一段都要使用举例论证、使论证更有力。强调，每一段都要有举例论证！要求：输出具体事例，输出相关的名人名言。具体事例一定要有确定的人名、时间、地点等，不要用“那些人、古代、历史上”等宽泛的指代去泛泛而谈。例子最好来源于我国古代的名人事迹，或是西方著名哲学家的思想名句，或是当今的社会热点、或是著名的历史事件；比如苏轼、欧阳修、白居易、鲁迅、屈原等文学大家的个人事迹、文学作品或者名言，或者红楼梦中的人物身世，又比如康德、柏拉图、亚里士多德、洛克等哲学家的思想，又比如俄乌冲突、种族歧视、环境保护、共克疫情等社会热点或者具体的某次历史事件。请你聚焦于人文社会、人类社会，充满人文关怀。举例之后，还得继续阐发举例和本段论点的关系，体现思维的深度。3、对于两个深层段落，或是深刻理性，或是感人肺腑、抒情至深，而且都要有合适恰当的举例论证，或者引用名言论证。怎么抒情呢？你可以妙用反问句，比如“如果没有谁/什么，...？”，你可以适当学习，但不要直接照搬。4、文风优美理性，避免重复无意义词语，不要那些虚词，不要副标题5、标题控制在十个字以内，不要使用冒号，尽量使用最好的修辞（对偶，比喻，用典等）6、如何避免“深层肯定”和“浅层否定”之间的转折引起的前后矛盾？一种合理的方法是，在深层肯定的那一段，首先给论点添加一定的前置条件，这个前置条件可以来源于浅层否定中聚焦的那种弊端。7、深层否定是整篇文章最精华、最有深度的一段，如何避免它和前面冲突？一种合理的方法是从一个更高的视角看待整个问题，从更宏大、更深邃、普世价值、全人类、全社会、${angles}等等的角度将整篇文章升华。而且，深层否定段，必须有翔实的举例例子，举例论证，具体事例（历史事件、人物事迹、社会热点，体现思维深度）。8、整篇文章要内容翔实，多多举例、多多引用，但不要说“正如古人所言”、“正如谁谁谁所言”，你直接引用就可以了。请你努力填充丰富的内容和论证逻辑，体现缜密的思路。你必须非常注重段落之间的承接关系，不要出现“各打五十大板”的雨露均沾，你必须深刻认识到哪方才是更加正确的，必须要有判断正负的能力。返回一个dict，格式为{“标题”：标题，“正文”：正文}\n浅层肯定：${shallowPositive}浅层否定：${shallowNegative}深层肯定：${deepPositive}深层否定：${deepNegative}\n最后强调：中间四段每一段都必须需要输出具体的事例（历史事件、人物事迹、社会热点）/引用名言，并且要对具体事例做详实流畅的论述分析，不要只是说“这个事例体现了本段论点”；语言风格要优美地像诗一样，要有对诗词的巧妙化用，不是直接引用诗词，而是化用诗词的一部分，比如某个词语、某句诗，不要用引号引用。给你一篇人类文章作为参考，你可以看看它是如何处理段落之间的“看似矛盾”的，并且学习它的文风：未必有结论的天问\n楚地河畔，披头散发的屈原面对天地亘古发问。他的问题，即使人类千秋万代，也难有确定的结论；但也许问出了这些问题，便已经有了意义。\n诚然，人们在长大后往往看重结论，这确实是一个值得担忧的社会问题。人们如同鲁迅笔下的冷漠看客们，只看重革命者被处死的结论，却不对背后原因发问。这是一种对现实的无条件接受与麻木，折射出人对社会的钝感心理。看重结论，反映出共情与好奇心的缺失。于人，人们只看重他的行为，对动机不闻不问，失去了共情；于物，人们只看重他的功能，对原理不闻不问，失去了好奇心。共情与好奇心的缺失，将让社会变得冷漠化、机械化，没有温情也没有理性，这并非一个健康社会应该有的氛围。\n然而，有人便因此呼吁回归幼时的发问，这又是矫枉过正。我们必须承认，小时候固然人们喜欢发问，但其问题往往脱离实际。诞生于世，我们以旁观者的身份面对世界，对一切都有着初见的惊异。将这种惊异脱口而出成为发问，刨根问底，往往无厘头且天马行空。随着人逐渐长大，从世界的旁观者升格为世界的参与者，真正需要解决实际问题，从而回想起幼时发问便觉得荒谬。这无可厚非，也是人成长之路上必然经历的过程。如果一个人成人后仍然不负责任地随意发问，问而不寻，则是极其幼稚的表现，并不可取。\n当然，当发问剔除脱离实际的部分，而是推动结论的探寻与完善，则是值得践行的。人应当将幼时的惊异沉淀，成为共情与好奇心，才达到了发问的意义。古往今来，无论是科学上还是哲学上，发问都起到了反思既有结论的作用：从亚里士多德的错误世界观到现代物理的大厦，从柏拉图的理型世界论到唯物主义的智慧光芒，无数科学家与哲学家在发问中让既有结论不断贴近真理，贴近现实。由此可见，发问与结论其实可以兼而有之：看重而不盲信结论，发问而不脱离实际，这便是人们在发问与结论之间能取到的平衡。\n更进一步，发问应当落实到对社会的反思，甚至不以得到结论为最终的目的。鲁迅先生在《狂人日记》中，面对传统社会吃人之结论，发出了“从来如此，便对么”之问。若人们只看重社会现状，当作结论，却不愿意质疑而发问，社会又何来进步的动力？屈原对宇宙人生发出深刻的质问，即使人类千秋万代，这些问题也并非能有确定的结论。究其本因，是人们在发问背后对社会、世界与人生的省思态度。人们固然要身为世界的参与者，着眼实际问题，却也不能就此受限于物之汶汶中，而是葆有清醒而反思的明晰眼光。从而，人们便能在质疑旧结论、探求自我结论中完成个人的价值。\n人们确然应当兼有发问与结论，看重而不盲信结论，发问而不脱离实际，而后反思社会问题，甚至问出未必有结论的天问。` 
      }
    ]
  };

  const response = await axios.post(url, payload);
  return response.data;
}

function parseResult(result: string) {
  const jsonStr = result.replace(/```json\s*/, '').replace(/\n```$/, '');
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    const correctedStr = jsonStr.replace(/\n/g, '\\n');
    return JSON.parse(correctedStr);
  }
}

// Define API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { text } = req.body;

    try {
      const countKey = 'essayCount';
      let count = await kv.get(countKey) as number | null;

      if (count === null) {
        count = 0;
      }

      const newId = count + 1;

      // Insert new record
      const newRecord = {
        id: newId,
        title: '',
        content: '',
        theme: text,
        pro: '',
        con: '',
        pro_args: '{}',
        con_args: '{}'
      };

      // 将新作文存储到 kv，键为 'essay:{newEssayId}'
      await kv.set(`essay:${newId}`, newRecord);

      // 更新计数器
      await kv.set(countKey, newId);

      // Call Baidu API to get detailed content
      const essayDetails = await getEssayDetails(text);
      const parsedResult = parseResult(essayDetails.result);

      // Update the new record with detailed content
      const updatedRecord = {
        ...newRecord,
        pro: parsedResult.正方观点,
        con: parsedResult.反方观点,
        pro_args: JSON.stringify(parsedResult.正方论点),
        con_args: JSON.stringify(parsedResult.反方论点)
      };

      await kv.set(`essay:${newId}`, updatedRecord);

      // Step 3: Prepare the arguments for the next API call
      const keys1 = Object.keys(parsedResult.正方论点);
      const keys2 = Object.keys(parsedResult.反方论点);
      const extra1 = (keys1.length > 4) ? "而且，" + parsedResult.正方论点[Object.keys(parsedResult.正方论点)[2]] : "";
      const extra2 = (keys2.length > 4) ? "同时，" + parsedResult.反方论点[Object.keys(parsedResult.反方论点)[2]] : "";

      const titleAndContentArgs = {
        theme: text,
        shallowPositive: `${parsedResult.正方论点[Object.keys(parsedResult.正方论点)[0]]}同时，${parsedResult.正方论点[Object.keys(parsedResult.正方论点)[1]]}` + extra1,
        shallowNegative: `${parsedResult.反方论点[Object.keys(parsedResult.正方论点)[0]]}而且，${parsedResult.反方论点[Object.keys(parsedResult.反方论点)[1]]}` + extra2,
        deepPositive: `${parsedResult.正方论点[Object.keys(parsedResult.正方论点)[keys1.length - 1]]}同时，${parsedResult.正方论点[Object.keys(parsedResult.正方论点)[keys1.length - 2]]}而且，${parsedResult.正方论点[Object.keys(parsedResult.正方论点)[keys1.length - 3]]}`,
        deepNegative: `${parsedResult.反方论点[Object.keys(parsedResult.反方论点)[keys2.length - 1]]}而且，${parsedResult.反方论点[Object.keys(parsedResult.反方论点)[keys2.length - 2]]}同时，${parsedResult.反方论点[Object.keys(parsedResult.正方论点)[keys2.length - 3]]}`,
        positive: parsedResult.正方观点,
        negative: parsedResult.反方观点
      };

      // Step 4: Call Baidu AI to get title and content
      const titleAndContentResponse = await getTitleAndContent(titleAndContentArgs);
      const completedEssay = parseResult(titleAndContentResponse.result);

      // Step 5: Update the record with title and content
      const finalRecord = {
        ...updatedRecord,
        title: completedEssay.标题,
        content: completedEssay.正文
      };

      await kv.set(`essay:${newId}`, finalRecord);

      res.status(200).json({ message: 'Successfully saved essay and updated content', id: newId });
    } catch (error) {
      console.error('Vercel KV error:', error);
      res.status(500).json({ message: 'Error saving essay' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}