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
        
        this.initializeEventListeners();
        this.updateState('initial');
    }

    updateState(state) {
        const states = {
            initial: {
                mainButton: { text: '开始', class: 'primary', disabled: false },
                resetButton: { disabled: true },
                status: '准备开始...'
            },
            running: {
                mainButton: { text: '暂停', class: 'warning', disabled: false },
                resetButton: { disabled: false },
                status: '专注中...'
            },
            paused: {
                mainButton: { text: '继续', class: 'success', disabled: false },
                resetButton: { disabled: false },
                status: '已暂停'
            },
            completed: {
                mainButton: { text: '重新开始', class: 'primary', disabled: false },
                resetButton: { disabled: true },
                status: '已完成！'
            }
        };

        const currentState = states[state];
        if (!currentState) return;

        // 更新主按钮
        this.buttons.main.textContent = currentState.mainButton.text;
        this.buttons.main.className = currentState.mainButton.class;
        this.buttons.main.disabled = currentState.mainButton.disabled;

        // 更新重置按钮
        this.buttons.reset.disabled = currentState.resetButton.disabled;

        // 更新状态显示
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
        this.timer.reset();
        this.detector.reset();
        const status = document.getElementById('status');
        status.textContent = '正在检测手机使用...';
        status.classList.remove('detected');
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
        this.status.textContent = `检测到手机使用！(第 ${data.count} 次)`;
        this.status.classList.add('detected');
        
        if (this.timer.isRunning && !this.timer.isPaused) {
            this.timer.pause();
            this.updateState('paused');
        }
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

    async start() {
        try {
            await this.detector.init();
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
