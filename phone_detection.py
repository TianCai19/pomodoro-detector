import tensorflow as tf
import cv2
import numpy as np

# 加载预训练的MobileNetV2模型
model = tf.keras.applications.MobileNetV2(weights='imagenet')

# 类别标签中包含手机相关的类别
phone_labels = ['cellphone', 'mobile phone', 'smartphone', 'phone']

# 检测阈值
DETECTION_THRESHOLD = 0.3

# 模型warmup
dummy_input = np.zeros((1, 224, 224, 3))
model.predict(dummy_input)

def detect_phone(image_path):
    # 读取图像
    img = cv2.imread(image_path)
    if img is None:
        print(f"警告：无法读取图片 {image_path}")
        return False, None, 0.0
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 预处理图像
    img_resized = cv2.resize(img, (224, 224))
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    
    # 进行预测
    predictions = model.predict(img_array)
    decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=5)[0]
    
    # 检查预测结果中是否包含手机
    for _, label, prob in decoded_predictions:
        if any(phone_label in label.lower() for phone_label in phone_labels) and prob >= DETECTION_THRESHOLD:
            return True, label, float(prob)
    
    return False, None, 0.0

def test_images(image_paths):
    results = []
    for image_path in image_paths:
        detected, label, prob = detect_phone(image_path)
        result = {
            'image': image_path,
            'detected': detected,
            'label': label,
            'probability': prob
        }
        results.append(result)
        print(f"{image_path}: {'检测到手机' if detected else '未检测到手机'} ({label if label else '无'}, {prob:.2%})")
    return results

if __name__ == "__main__":
    # 测试图片列表
    image_paths = ['pomodoro-detector/phone1.jpg', 'pomodoro-detector/phone2.jpeg']
    
    # 运行测试
    results = test_images(image_paths)
    
    # 保存结果
    with open('detection_results.txt', 'w') as f:
        for result in results:
            f.write(f"{result['image']}: {'检测到手机' if result['detected'] else '未检测到手机'} ({result['label'] if result['label'] else '无'}, {result['probability']:.2%})\n")
