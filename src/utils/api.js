// Minimax API 调用
// 开发环境用 localhost:3001，生产环境用同域 /api/proxy

const IS_PROD = import.meta.env.PROD;
const PROXY_URL = IS_PROD ? '/api/proxy' : 'http://localhost:3001/api/proxy';

const typeLabels = {
  adventure: 'an adventurous story',
  romance: 'a romantic story',
  daily: 'a story about daily life',
  fantasy: 'a fantasy story',
  mystery: 'a mystery story',
};

export const generateStory = async (topic, phrases, apiKey, wordCount = 200, storyType = 'daily') => {
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
  const typeText = typeLabels[storyType] || 'a story';

  const prompt = `Generate ${typeText} of about ${wordCount} words based on this topic: "${topic}"

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

export const explainWord = async (word, apiKey) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  const prompt = `Explain the English word "${word}" in Chinese. Provide:
1. Chinese meaning
2. Brief usage example (1 sentence in English with Chinese translation)

Format your response as:
[M]
Chinese meaning here
[/M]
[E]
English example sentence here
[/E]
[TE]
Chinese translation here
[/TE]`;

  const requestBody = {
    apiKey,
    body: {
      model: 'MiniMax-M2.7',
      max_tokens: 500,
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
    throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();

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
    throw new Error('API 返回数据格式错误');
  }

  return parseExplanation(content);
};

const parseExplanation = (content) => {
  const meaningMatch = content.match(/\[M\]([\s\S]*?)\[\/M\]/);
  const exampleMatch = content.match(/\[E\]([\s\S]*?)\[\/E\]/);
  const translationMatch = content.match(/\[TE\]([\s\S]*?)\[\/TE\]/);

  return {
    meaning: meaningMatch ? meaningMatch[1].trim() : '',
    example: exampleMatch ? exampleMatch[1].trim() : '',
    translation: translationMatch ? translationMatch[1].trim() : '',
  };
};

export const explainStory = async (story, apiKey) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  const prompt = `Please explain this English story in Chinese. Provide:
1. A brief summary of the story
2. Key vocabulary and phrases used
3. Grammar points or interesting sentence structures
4. Chinese translation

Format your response as:
[SUMMARY]
Brief summary in Chinese
[/SUMMARY]
[VOCABULARY]
Key words and phrases with Chinese explanations
[/VOCABULARY]
[GRAMMAR]
Grammar points or interesting structures
[/GRAMMAR]
[TRANSLATION]
Full Chinese translation
[/TRANSLATION]`;

  const requestBody = {
    apiKey,
    body: {
      model: 'MiniMax-M2.7',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nHere is the story:\n${story}`,
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
    throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();

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
    throw new Error('API 返回数据格式错误');
  }

  return parseStoryExplanation(content);
};

const parseStoryExplanation = (content) => {
  const summaryMatch = content.match(/\[SUMMARY\]([\s\S]*?)\[\/SUMMARY\]/);
  const vocabMatch = content.match(/\[VOCABULARY\]([\s\S]*?)\[\/VOCABULARY\]/);
  const grammarMatch = content.match(/\[GRAMMAR\]([\s\S]*?)\[\/GRAMMAR\]/);
  const translationMatch = content.match(/\[TRANSLATION\]([\s\S]*?)\[\/TRANSLATION\]/);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : '',
    vocabulary: vocabMatch ? vocabMatch[1].trim() : '',
    grammar: grammarMatch ? grammarMatch[1].trim() : '',
    translation: translationMatch ? translationMatch[1].trim() : '',
    raw: content,
  };
};