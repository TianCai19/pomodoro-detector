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

### 使用 ngrok 进行外网访问

1. 安装 ngrok：
     - macOS:
        ```bash
        brew install ngrok
        ```
     - Windows:
        下载并安装 ngrok 客户端，详见 [ngrok 官方网站](https://ngrok.com/download)
2. 启动 ngrok：
     ```bash
     ngrok http 8000
     ```
3. 复制生成的外网访问地址，在浏览器中访问


## 技术栈

- TensorFlow.js
- COCO-SSD模型
- HTML5/CSS3/JavaScript

## 项目结构

```
pomodoro-detector/
├── index.html               # 主页面，包含应用的UI
├── style.css                # 样式表，负责应用的视觉设计
├── script.js                # 主逻辑，控制番茄钟功能和检测流程
├── README.md                # 项目说明
├── js/
│   ├── config.js            # 配置文件，用于存储应用配置
│   ├── EventEmitter.js      # 事件系统，用于触发和监听应用事件
│   ├── PhoneDetector.js     # 手机检测逻辑，调用ML模型进行实时检测
│   └── PomodoroTimer.js     # 番茄钟定时器，管理计时与状态切换
```

## 许可证

MIT License
