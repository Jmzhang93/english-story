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
  app.use(express.static(distPath));

  // SPA 路由支持 - 处理所有未匹配的路由
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
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
