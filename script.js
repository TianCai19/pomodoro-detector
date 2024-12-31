import { PomodoroTimer } from './js/PomodoroTimer.js';
import { PhoneDetector } from './js/PhoneDetector.js';

class App {
    constructor() {
        this.timer = new PomodoroTimer();
        this.detector = new PhoneDetector(
            document.getElementById('video'),
            document.getElementById('canvas')
        );
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Timer events
        this.timer.on('tick', time => this.updateTimerDisplay(time));
        this.timer.on('complete', () => this.handleTimerComplete());
        
        // Detector events
        this.detector.on('phoneDetected', data => this.handlePhoneDetection(data));
        this.detector.on('error', error => this.handleError(error));
        
        // UI events
        document.getElementById('start').addEventListener('click', 
            () => this.timer.start());
        document.getElementById('reset').addEventListener('click', 
            () => this.handleReset());
    }

    updateTimerDisplay(time) {
        document.getElementById('timer').textContent = time;
    }

    handleTimerComplete() {
        alert('Time is up!');
        this.detector.stop();
    }

    handlePhoneDetection(data) {
        const status = document.getElementById('status');
        status.textContent = `Phone detected! (Count: ${data.count})`;
        status.classList.add('detected');
        this.timer.stop();
    }

    handleReset() {
        this.timer.reset();
        this.detector.reset();
        const status = document.getElementById('status');
        status.textContent = 'Monitoring...';
        status.classList.remove('detected');
    }

    handleError(error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = `Error: ${error.message}`;
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
