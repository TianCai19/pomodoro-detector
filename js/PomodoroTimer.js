import { EventEmitter } from './EventEmitter.js';
import { CONFIG } from './config.js';

export class PomodoroTimer extends EventEmitter {
    constructor() {
        super();
        this.timeLeft = CONFIG.timer.defaultDuration;
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this._startInterval();
        this.emit('start');
    }

    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        clearInterval(this.interval);
        this.isPaused = true;
        this.emit('pause');
    }

    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this._startInterval();
        this.emit('resume');
    }

    _startInterval() {
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.emit('tick', this.getTimeString());
            
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }

    complete() {
        this.stop();
        this.emit('complete');
    }

    stop() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.isPaused = false;
        this.emit('stop');
    }

    reset() {
        this.stop();
        this.timeLeft = CONFIG.timer.defaultDuration;
        this.emit('reset', this.getTimeString());
    }

    getTimeString() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}
