let model;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        model = await mobilenet.load();
        document.getElementById('startTest').addEventListener('click', runTests);
        console.log('模型加载成功');
    } catch (error) {
        console.error('模型加载失败:', error);
    }
});

// 运行测试
async function runTests() {
    await testImage('image1', 'canvas1', 'result1');
    await testImage('image2', 'canvas2', 'result2');
}

// 测试单张图片
async function testImage(imageId, canvasId, resultId) {
    const image = document.getElementById(imageId);
    const canvas = document.getElementById(canvasId);
    const result = document.getElementById(resultId);

    // 设置canvas尺寸
    canvas.width = image.width;
    canvas.height = image.height;

    // 绘制图片到canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // 进行检测
    const predictions = await model.detect(canvas);
    const phonePrediction = predictions.find(p => 
        ['phone', 'mobile', 'cellphone', 'smartphone'].some(keyword => 
            p.className.toLowerCase().includes(keyword)
        )
    );

    if (phonePrediction) {
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
        
        // 显示结果
        result.textContent = `检测到手机 (${(phonePrediction.probability * 100).toFixed(1)}%)`;
        result.style.color = 'green';
    } else {
        result.textContent = '未检测到手机';
        result.style.color = 'red';
    }
}
