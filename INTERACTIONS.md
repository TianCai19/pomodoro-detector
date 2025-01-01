# 应用交互接口文档

本文档描述了 `PomodoroApp` 和 `DetectionApp` 之间的交互接口，以及如何实现解耦。

## 应用概述

### PomodoroApp

`PomodoroApp` 负责管理番茄钟计时器的逻辑，包括启动、暂停、重置计时器等功能。

### DetectionApp

`DetectionApp` 负责管理手机检测的逻辑，包括摄像头初始化、模型加载、实时检测等功能。

## 交互接口

### PomodoroApp

#### 方法

- `constructor()`: 初始化番茄钟应用。
- `updateState(state: string)`: 更新应用状态。
- `initializeEventListeners()`: 初始化事件监听器。
- `handleMainButtonClick()`: 处理主按钮点击事件。
- `resetTimer()`: 重置计时器。
- `updateTimerDisplay(time: string)`: 更新计时器显示。
- `handleTimerComplete()`: 处理计时器完成事件。
- `showNotification(message: string)`: 显示通知。

#### 事件

- `tick`: 每秒触发一次，用于更新计时器显示。
- `complete`: 计时器完成时触发。

### DetectionApp

#### 方法

- `constructor()`: 初始化检测应用。
- `initializeEventListeners()`: 初始化事件监听器。
- `initCamera()`: 初始化摄像头。
- `startCamera(deviceId: string)`: 启动指定摄像头。
- `start()`: 启动检测。
- `handlePhoneDetection(data: object)`: 处理手机检测事件。
- `handleError(error: Error)`: 处理错误事件。

#### 事件

- `phoneDetected`: 检测到手机时触发。
- `error`: 发生错误时触发。

## 解耦实现

为了实现应用的解耦，我们将 `PomodoroApp` 和 `DetectionApp` 分别放在独立的文件中，并通过事件系统进行交互。这样可以使代码更模块化，便于维护和扩展。

### 事件系统

我们使用事件系统来实现应用之间的通信。例如，当 `DetectionApp` 检测到手机时，会触发 `phoneDetected` 事件，`PomodoroApp` 可以监听该事件并暂停计时器。

### 独立文件

将 `PomodoroApp` 和 `DetectionApp` 分别放在独立的文件中，使它们的逻辑更加清晰，便于维护和扩展。

### 初始化

在 `script.js` 中初始化 `PomodoroApp` 和 `DetectionApp`，并启动检测应用。

```javascript
// filepath: /Users/zz/codes/adhd_study_ai_checker/pomodoro-detector/script.js
import { PomodoroApp } from './js/PomodoroApp.js';
import { DetectionApp } from './js/DetectionApp.js';

document.addEventListener('DOMContentLoaded', () => {
    const pomodoroApp = new PomodoroApp();
    const detectionApp = new DetectionApp();
    detectionApp.start();
});
```

通过这种方式，我们实现了 `PomodoroApp` 和 `DetectionApp` 的解耦，使代码更加模块化，便于未来增加其他功能（例如正向计时）。
