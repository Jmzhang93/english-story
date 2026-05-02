const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// 代理转发到 MiniMax API
app.post('/api/proxy', async (req, res) => {
  const { apiKey, body } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing API key' });
  }

  try {
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 生产环境：托管前端静态文件
if (IS_PROD) {
  const distPath = path.join(__dirname, 'dist');

  // 先检查是否是已知的 API 或静态文件路径
  app.use((req, res, next) => {
    // 跳过 API 路由
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // 静态文件
    if (req.path.includes('.')) {
      return express.static(distPath)(req, res, next);
    }
    // SPA 路由 - 返回 index.html
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (IS_PROD) {
    console.log('Production mode: serving static files from dist/');
  } else {
    console.log('Development mode: API proxy only');
  }
});