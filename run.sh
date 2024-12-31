#!/bin/bash

# 启动本地服务器
echo "启动本地服务器..."
python3 -m http.server 8000 &

# 获取服务器进程ID
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 打开测试页面
echo "打开测试页面..."
open http://localhost:8000/test-images.html

# 显示控制命令
echo ""
echo "控制命令："
echo "  Ctrl+C 停止服务器"
echo "  ./run.sh restart 重启服务"
echo "  ./run.sh stop 停止服务"

# 处理命令行参数
case $1 in
    restart)
        kill $SERVER_PID
        exec $0
        ;;
    stop)
        kill $SERVER_PID
        exit 0
        ;;
esac

# 等待服务器进程
wait $SERVER_PID
