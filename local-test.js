const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function run() {
    try {
        // 加载模型
        const model = await mobilenet.load();
        console.log('模型加载成功');

        // 创建结果文件
        const resultsFile = path.join(__dirname, 'results.txt');
        fs.writeFileSync(resultsFile, '测试结果:\n\n');

        // 测试图片列表
        const testImages = [
            'phone1.jpg',
            'phone2.jpg'
        ];

        // 遍历测试图片
        for (const imageFile of testImages) {
            const imagePath = path.join(__dirname, imageFile);
            
            // 加载图片
            const image = await loadImage(imagePath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            // 进行检测
            const predictions = await model.classify(canvas);
            const phonePrediction = predictions.find(p => 
                ['phone', 'mobile', 'cellphone', 'smartphone'].some(keyword => 
                    p.className.toLowerCase().includes(keyword)
                )
            );

            // 记录结果
            const result = phonePrediction ?
                `检测到手机 (${(phonePrediction.probability * 100).toFixed(1)}%)` :
                '未检测到手机';
            
            fs.appendFileSync(resultsFile, `${imageFile}: ${result}\n`);
            console.log(`${imageFile}: ${result}`);
        }

        console.log('测试完成，结果已保存到 results.txt');
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
run();
