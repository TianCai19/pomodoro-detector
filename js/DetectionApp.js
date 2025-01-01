import { PhoneDetector } from './PhoneDetector.js';

export class DetectionApp {
    constructor() {
        this.detector = new PhoneDetector(
            document.getElementById('video'),
            document.getElementById('canvas')
        );
        this.status = document.getElementById('status');
        this.statusIndicator = document.getElementById('status-indicator');
        this.phoneDetectionTimeout = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Detector events
        this.detector.on('phoneDetected', data => this.handlePhoneDetection(data));
        this.detector.on('error', error => this.handleError(error));
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

    handlePhoneDetection(data) {
        // 清除之前的超时
        if (this.phoneDetectionTimeout) {
            clearTimeout(this.phoneDetectionTimeout);
        }

        this.status.textContent = `检测到手机使用！`;
        this.status.classList.add('detected');
        this.statusIndicator.classList.add('detected');

        // 3秒后恢复状态显示
        this.phoneDetectionTimeout = setTimeout(() => {
            this.status.classList.remove('detected');
            this.statusIndicator.classList.remove('detected');
            
            // 更新状态文本
            this.status.textContent = '检测中...';
        }, 3000);
    }

    handleError(error) {
        console.error('Error:', error);
        this.status.textContent = `Error: ${error.message}`;
    }
}
