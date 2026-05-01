// Minimax API 调用
// 开发环境用 localhost:3001，生产环境用同域 /api/proxy

const IS_PROD = import.meta.env.PROD;
const PROXY_URL = IS_PROD ? '/api/proxy' : 'http://localhost:3001/api/proxy';

export const generateStory = async (topic, phrases, apiKey) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  if (!topic || !topic.trim()) {
    throw new Error('请输入话题');
  }

  if (phrases.length === 0) {
    throw new Error('短语库为空，请先添加一些短语');
  }

  const phraseList = phrases.map(p => `${p.phrase} (${p.meaning})`).join('\n');

  const prompt = `Generate a short English story of about 200 words based on this topic: "${topic}"

Please try to naturally incorporate these phrases from the user's phrase library:
${phraseList}

The story should be engaging, use simple but vivid language, and naturally include as many of the phrases above as possible. After the story, list the phrases that were used in the story.

Format your response exactly as follows:
[STORY]
your story here
[/STORY]
[USED_PHRASES]
phrase 1
phrase 2
[/USED_PHRASES]`;

  const requestBody = {
    apiKey,
    body: {
      model: 'MiniMax-M2.7',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    },
  };

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);
    throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();

  // 从 content 数组中提取 text 类型的内容（跳过 thinking）
  let content = '';
  if (data.content && Array.isArray(data.content)) {
    content = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
  } else if (data.content && typeof data.content === 'string') {
    content = data.content;
  } else if (data.text) {
    content = data.text;
  }

  if (!content) {
    console.error('Unexpected API response:', data);
    throw new Error('API 返回数据格式错误');
  }

  return parseStoryResponse(content);
};

const parseStoryResponse = (content) => {
  const storyMatch = content.match(/\[STORY\]([\s\S]*?)\[\/STORY\]/);
  const usedMatch = content.match(/\[USED_PHRASES\]([\s\S]*?)\[\/USED_PHRASES\]/);

  if (storyMatch) {
    return {
      story: storyMatch[1].trim(),
      usedPhrases: usedMatch
        ? usedMatch[1].trim().split('\n').map(p => p.trim()).filter(Boolean)
        : [],
    };
  }

  return {
    story: content.trim(),
    usedPhrases: [],
  };
};
