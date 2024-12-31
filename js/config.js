export const CONFIG = {
    timer: {
        defaultDuration: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    },
    detection: {
        targetObjects: ['cell phone', 'mobile phone'],
        confidence: 0.6,
        checkInterval: 1000,
    },
    camera: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
    }
};
