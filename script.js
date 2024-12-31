// 番茄钟计时器
let timerInterval;
let timeLeft = 25 * 60; // 25分钟
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');

// 摄像头和检测相关
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const statusText = document.getElementById('status');
let model;
let isPhoneDetected = false;
let phoneDetectionCount = 0;

// 初始化番茄钟
function initPomodoro() {
    startButton.addEventListener('click', startTimer);
    resetButton.addEventListener('click', resetTimer);
    updateTimerDisplay();
}

// 更新计时器显示
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// 开始计时
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('时间到！');
        }
    }, 1000);
}

// 停止计时器
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 重置计时器
function resetTimer() {
    stopTimer();
    timeLeft = 25 * 60;
    updateTimerDisplay();
    phoneDetectionCount = 0;
    statusText.textContent = '未检测到手机';
    statusText.style.color = 'green';
    statusText.classList.remove('detected');
}

// 初始化摄像头
async function initCamera() {
    try {
        // 检查是否支持媒体设备
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('浏览器不支持摄像头访问');
        }

        // 获取可用设备
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
            throw new Error('未检测到摄像头设备');
        }

        // 获取摄像头权限
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user' // 优先使用前置摄像头
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        // 等待视频加载
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
        
        statusText.textContent = '摄像头已启动';
    } catch (error) {
        statusText.textContent = `无法访问摄像头: ${error.message}`;
        statusText.style.color = 'red';
        console.error('摄像头访问错误:', error);
        
        // 提供更多帮助信息
        if (error.name === 'NotAllowedError') {
            console.log('请确保已授予摄像头权限');
        } else if (error.name === 'NotFoundError') {
            console.log('未找到可用的摄像头设备');
        } else if (error.name === 'NotReadableError') {
            console.log('摄像头设备可能已被其他应用程序占用');
        }
    }
}

// 加载COCO-SSD模型
async function loadModel() {
    try {
        console.log('开始加载模型...');
        model = await cocoSsd.load();
        console.log('模型加载成功');
        statusText.textContent = '模型加载成功，开始检测...';
        detectPhone();
    } catch (error) {
        console.error('模型加载失败:', error);
        statusText.textContent = '模型加载失败';
    }
}

// 检测手机
async function detectPhone() {
    if (!model) {
        console.warn('模型未加载');
        return;
    }

    // 获取视频帧
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 进行检测
    console.log('开始检测...');
    const predictions = await model.detect(canvas);
    console.log('检测结果:', predictions);
    checkForPhone(predictions);

    // 持续检测
    requestAnimationFrame(detectPhone);
}

// 检查预测结果中是否包含手机并绘制边框
function checkForPhone(predictions) {
    const phoneKeywords = ['cell phone'];
    const phonePrediction = predictions.find(prediction => 
        phoneKeywords.includes(prediction.class)
    );

    const detected = !!phonePrediction;
    
    // 清除之前的绘制
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detected) {
        // 绘制检测框
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(
            phonePrediction.bbox[0], 
            phonePrediction.bbox[1],
            phonePrediction.bbox[2],
            phonePrediction.bbox[3]
        );
        ctx.stroke();
        
        // 绘制标签
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.fillText(
            `手机 (${(phonePrediction.score * 100).toFixed(1)}%)`,
            phonePrediction.bbox[0],
            phonePrediction.bbox[1] > 20 ? phonePrediction.bbox[1] - 5 : 20
        );
    }

    if (detected !== isPhoneDetected) {
        isPhoneDetected = detected;
        if (detected) {
            phoneDetectionCount++;
            stopTimer();
            statusText.textContent = `检测到手机使用！ (次数: ${phoneDetectionCount})`;
            statusText.style.color = 'red';
            statusText.classList.add('detected');
        } else {
            statusText.textContent = '未检测到手机';
            statusText.style.color = 'green';
            statusText.classList.remove('detected');
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initPomodoro();
        await initCamera();
        await loadModel();
        statusText.textContent = '系统已准备就绪';
    } catch (error) {
        console.error('初始化失败:', error);
        statusText.textContent = '初始化失败，请检查控制台';
        statusText.style.color = 'red';
    }
});

// 确保视频元素可以播放
video.addEventListener('play', () => {
    statusText.textContent = '摄像头已启动，开始检测...';
});
