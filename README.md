# Life1980 · 华人生活服务信用平台

## 📁 项目结构
```
life1980/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.jsx        ← 主程序（把 life1980.jsx 重命名放这里）
├── package.json
├── vercel.json
└── .gitignore
```

---

## 🚀 部署步骤

### 第一步：准备文件
1. 把下载的 `life1980.jsx` 放入 `src/` 文件夹
2. 重命名为 `App.jsx`

### 第二步：上传到 GitHub
```bash
# 在项目文件夹里运行
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/你的用户名/life1980.git
git push -u origin main
```

### 第三步：Vercel 一键部署
1. 打开 https://vercel.com
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库 `life1980`
4. Framework: **Create React App**
5. 点击 Deploy ✅
6. 完成后获得域名如 `life1980.vercel.app`

### 第四步：绑定自己的域名
1. 在 Vercel 项目设置 → Domains
2. 添加你的域名，如 `www.life1980.com`
3. 按提示在域名注册商处添加 DNS 记录

---

## 🗄️ Supabase 数据库连接（进阶）

用于存储真实商家数据、用户账号、评价。

### 安装
```bash
npm install @supabase/supabase-js
```

### 在 App.jsx 顶部加入
```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://你的项目ID.supabase.co',
  '你的 anon public key'
)
```

### 推荐建的数据表
| 表名 | 用途 |
|------|------|
| `merchants` | 服务商资料 |
| `reviews` | 用户评价 |
| `users` | 会员账号 |
| `applications` | 入驻申请 |
| `documents` | 上传的审核文件 |

---

## 🔑 Anthropic API Key 设置

旅游模块需要 API Key（在 Vercel 环境变量里设置）：

1. Vercel → Settings → Environment Variables
2. 添加：`REACT_APP_ANTHROPIC_KEY` = `sk-ant-...你的key`

---

## 📞 技术支持
通过 K1980 平台联系开发团队
