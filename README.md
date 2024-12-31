# 番茄钟手机检测器

一个基于TensorFlow.js的番茄钟应用，能够检测手机使用并记录使用次数。

## 功能特性

- 25分钟番茄钟计时
- 实时手机检测
- 手机使用次数统计
- 检测到手机时自动暂停计时
- 响应式界面设计

## 使用方法

1. 克隆本仓库
2. 打开终端，进入项目目录
3. 运行本地服务器：
   ```bash
   python3 -m http.server 8000
   ```
4. 在浏览器中访问 `http://localhost:8000`
5. 允许访问摄像头
6. 点击"开始"按钮启动番茄钟
7. 当检测到手机使用时，计时器会自动暂停并记录使用次数

## 技术栈

- TensorFlow.js
- COCO-SSD模型
- HTML5/CSS3/JavaScript

## 项目结构

```
pomodoro-detector/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 主逻辑
├── README.md           # 项目说明
└── assets/             # 静态资源
    ├── phone1.jpg
    └── phone2.jpeg
```

## 许可证

MIT License
