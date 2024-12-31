import { PomodoroTimer } from './js/PomodoroTimer.js';
import { PhoneDetector } from './js/PhoneDetector.js';

class App {
    constructor() {
        this.timer = new PomodoroTimer();
        this.detector = new PhoneDetector(
            document.getElementById('video'),
            document.getElementById('canvas')
        );
        
        // 获取按钮元素
        this.buttons = {
            main: document.getElementById('mainButton'),
            reset: document.getElementById('resetButton')
        };
        this.status = document.getElementById('status');
        this.statusIndicator = document.getElementById('status-indicator');
        this.phoneDetectionTimeout = null;
        
        this.initializeEventListeners();
        this.updateState('initial');
    }

    updateState(state) {
        const states = {
            initial: {
                mainButton: { text: '开始专注', class: 'primary' },
                resetButton: { disabled: true },
                status: '准备开始...',
                indicator: ''
            },
            running: {
                mainButton: { text: '暂停', class: 'warning' },
                resetButton: { disabled: false },
                status: '专注中...',
                indicator: 'running'
            },
            paused: {
                mainButton: { text: '继续', class: 'primary' },
                resetButton: { disabled: false },
                status: '已暂停',
                indicator: 'paused'
            },
            completed: {
                mainButton: { text: '重新开始', class: 'primary' },
                resetButton: { disabled: true },
                status: '已完成！',
                indicator: ''
            }
        };

        const currentState = states[state];
        if (!currentState) return;

        // 更新按钮和状态
        this.buttons.main.textContent = currentState.mainButton.text;
        this.buttons.main.className = currentState.mainButton.class;
        this.buttons.reset.disabled = currentState.resetButton.disabled;
        
        // 更新状态指示器
        this.statusIndicator.className = currentState.indicator;
        
        // 只在非检测状态更新状态文本
        if (!this.status.classList.contains('detected')) {
            this.status.textContent = currentState.status;
        }
    }

    initializeEventListeners() {
        // Timer events
        this.timer.on('tick', time => this.updateTimerDisplay(time));
        this.timer.on('complete', () => this.handleTimerComplete());
        
        // Detector events
        this.detector.on('phoneDetected', data => this.handlePhoneDetection(data));
        this.detector.on('error', error => this.handleError(error));
        
        // Button events
        this.buttons.main.addEventListener('click', () => this.handleMainButtonClick());
        this.buttons.reset.addEventListener('click', () => this.resetTimer());
    }

    handleMainButtonClick() {
        if (this.timer.isRunning) {
            if (this.timer.isPaused) {
                this.timer.resume();
                this.updateState('running');
            } else {
                this.timer.pause();
                this.updateState('paused');
            }
        } else {
            this.timer.start();
            this.detector.startDetection();
            this.updateState('running');
        }
    }

    resetTimer() {
        if (this.phoneDetectionTimeout) {
            clearTimeout(this.phoneDetectionTimeout);
        }
        
        this.timer.reset();
        this.detector.reset();
        this.status.classList.remove('detected');
        this.statusIndicator.className = '';
        this.updateState('initial');
    }

    updateTimerDisplay(time) {
        document.getElementById('timer').textContent = time;
    }

    handleTimerComplete() {
        this.updateState('completed');
        this.detector.stop();
        this.showNotification('专注时间结束！');
    }

    handlePhoneDetection(data) {
        // 清除之前的超时
        if (this.phoneDetectionTimeout) {
            clearTimeout(this.phoneDetectionTimeout);
        }

        this.status.textContent = `检测到手机使用！`;
        this.status.classList.add('detected');
        this.statusIndicator.classList.add('detected');
        
        if (this.timer.isRunning && !this.timer.isPaused) {
            this.timer.pause();
            this.updateState('paused');
        }

        // 3秒后恢复状态显示
        this.phoneDetectionTimeout = setTimeout(() => {
            this.status.classList.remove('detected');
            this.statusIndicator.classList.remove('detected');
            
            // 更新状态文本
            if (this.timer.isRunning) {
                if (this.timer.isPaused) {
                    this.status.textContent = '已暂停';
                } else {
                    this.status.textContent = '专注中...';
                }
            }
        }, 3000);
    }

    handleError(error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = `Error: ${error.message}`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async initCamera() {
        try {
            // 检查是否支持媒体设备
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('浏览器不支持摄像头访问');
            }
            const cameraSelect = document.getElementById('cameraSelect');
            // 获取可用设备
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            if (videoDevices.length === 0) {
                throw new Error('未检测到摄像头设备');
            }
            // 填充摄像头选择下拉菜单
            cameraSelect.innerHTML = videoDevices.map((device, index) =>
                `<option value="${device.deviceId}">${device.label || `摄像头 ${index + 1}`}</option>`
            ).join('');
            // 启动默认摄像头
            await this.startCamera(videoDevices[0].deviceId);
            cameraSelect.addEventListener('change', async (event) => {
                // 切换时先停止检测，重新启动
                this.detector.stop();
                await this.startCamera(event.target.value);
                this.detector.startDetection();
            });
            this.status.textContent = '摄像头已启动';
        } catch (error) {
            this.status.textContent = `无法访问摄像头: ${error.message}`;
            this.status.style.color = 'red';
            console.error('摄像头访问错误:', error);
        }
    }

    async startCamera(deviceId) {
        const video = document.getElementById('video');
        const constraints = {
            video: {
                deviceId: deviceId,
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
    }

    async start() {
        try {
            await this.detector.init();
            // 初始化摄像头
            await this.initCamera();
            // 开始检测
            await this.detector.startDetection();
        } catch (error) {
            this.handleError(error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.start();
});
