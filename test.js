// 测试相关变量
let testInterval;
let testCount = 0;
let phoneDetectedCount = 0;
let isTesting = false;

// DOM元素
const startTestButton = document.getElementById('startTest');
const resetTestButton = document.getElementById('resetTest');
const testCountDisplay = document.getElementById('testCount');
const phoneDetectedCountDisplay = document.getElementById('phoneDetectedCount');
const accuracyDisplay = document.getElementById('accuracy');
const statusText = document.getElementById('status');

// 摄像头和模型
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
let model;

// 初始化测试
function initTest() {
    startTestButton.addEventListener('click', toggleTest);
    resetTestButton.addEventListener('resetTest', resetTest);
}

// 切换测试状态
function toggleTest() {
    isTesting = !isTesting;
    if (isTesting) {
        startTestButton.textContent = '停止测试';
        statusText.textContent = '测试进行中...';
        testInterval = setInterval(runTest, 1000);
    } else {
        startTestButton.textContent = '开始测试';
        statusText.textContent = '测试已停止';
        clearInterval(testInterval);
    }
}

// 运行单次测试
async function runTest() {
    if (!model) return;

    // 获取视频帧
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 进行预测
    const predictions = await model.classify(canvas);
    const detected = checkForPhone(predictions);

    // 更新测试结果
    testCount++;
    if (detected) phoneDetectedCount++;
    updateTestResults();
}

// 检查预测结果中是否包含手机
function checkForPhone(predictions) {
    const phoneKeywords = ['phone', 'mobile', 'cellphone', 'smartphone'];
    return predictions.some(prediction => 
        phoneKeywords.some(keyword => 
            prediction.className.toLowerCase().includes(keyword)
        )
    );
}

// 更新测试结果显示
function updateTestResults() {
    testCountDisplay.textContent = testCount;
    phoneDetectedCountDisplay.textContent = phoneDetectedCount;
    const accuracy = testCount > 0 ? (phoneDetectedCount / testCount * 100).toFixed(2) : 0;
    accuracyDisplay.textContent = `${accuracy}%`;
}

// 重置测试
function resetTest() {
    testCount = 0;
    phoneDetectedCount = 0;
    updateTestResults();
    statusText.textContent = '测试已重置';
}

// 初始化摄像头
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        statusText.textContent = '无法访问摄像头';
        console.error('摄像头访问错误:', error);
    }
}

// 加载MobileNet模型
async function loadModel() {
    try {
        model = await mobilenet.load();
        statusText.textContent = '模型加载成功，准备测试';
    } catch (error) {
        statusText.textContent = '模型加载失败';
        console.error('模型加载错误:', error);
    }
}

// 初始化
(async function init() {
    initTest();
    await initCamera();
    await loadModel();
})();
