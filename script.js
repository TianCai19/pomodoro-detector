import { PomodoroApp } from './js/PomodoroApp.js';
import { DetectionApp } from './js/DetectionApp.js';

document.addEventListener('DOMContentLoaded', () => {
    const pomodoroApp = new PomodoroApp();
    const detectionApp = new DetectionApp();
    detectionApp.start();
});
