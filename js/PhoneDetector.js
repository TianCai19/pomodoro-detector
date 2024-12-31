import { EventEmitter } from './EventEmitter.js';
import { CONFIG } from './config.js';

export class PhoneDetector extends EventEmitter {
    constructor(videoElement, canvasElement) {
        super();
        this.video = videoElement;
        this.canvas = canvasElement;
        this.model = null;
        this.isDetecting = false;
        this.detectionCount = 0;
        this.lastDetectionTime = 0;
        this.detectionCooldown = 3000; // 3秒冷却时间
    }

    async init() {
        try {
            await this.initCamera();
            await this.loadModel();
            this.emit('ready');
        } catch (error) {
            this.emit('error', error);
        }
    }

    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: CONFIG.camera
            });
            this.video.srcObject = stream;
            await new Promise(resolve => this.video.onloadedmetadata = resolve);
            this.emit('cameraReady');
        } catch (error) {
            throw new Error(`Camera initialization failed: ${error.message}`);
        }
    }

    async loadModel() {
        try {
            this.model = await cocoSsd.load();
            this.emit('modelReady');
        } catch (error) {
            throw new Error(`Model loading failed: ${error.message}`);
        }
    }

    async startDetection() {
        if (!this.model || this.isDetecting) return;
        
        this.isDetecting = true;
        this.detect();
    }

    async detect() {
        if (!this.isDetecting) return;

        try {
            const now = Date.now();
            if (now - this.lastDetectionTime < this.detectionCooldown) {
                requestAnimationFrame(() => this.detect());
                return;
            }

            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            const ctx = this.canvas.getContext('2d');
            ctx.drawImage(this.video, 0, 0);

            const predictions = await this.model.detect(this.canvas);
            const phoneDetected = predictions.some(p => 
                CONFIG.detection.targetObjects.includes(p.class) &&
                p.score >= CONFIG.detection.confidence
            );

            if (phoneDetected) {
                this.lastDetectionTime = now;
                this.detectionCount++;
                this.emit('phoneDetected', {
                    count: this.detectionCount,
                    predictions
                });
            }

            requestAnimationFrame(() => this.detect());
        } catch (error) {
            this.emit('error', error);
            this.stop();
        }
    }

    stop() {
        this.isDetecting = false;
    }

    reset() {
        this.stop();
        this.detectionCount = 0;
        this.emit('reset');
    }
}
