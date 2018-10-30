const express = require('express');
const app = express();

// 默认用户名
const SYSTEM = '系统';

// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

//保存最近的20条消息记录
let msgHistory = [];

// 用来保存对应的socket,就是记录对方的socket实例
let socketObj = {};
// 设置一些颜色的数组，让每次进入聊天的用户颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

// 乱序排列方法
function shuffle(arr) {
    let len = arr.length;
    while(0 !== len) {
        // 右移位运算符向下取整
        random = (Math.random() * len--) >>> 0;
        // 解构赋值实现变量互换
        [arr[len], arr[random]] = [arr[random], arr[len]];
    }
    return arr;
}
// 记录一个socket.id用来查找对应的用户
let mySocket = {};
// websocket是依赖http协议进行握手的
const server = require('http').createServer(app);
const io = require('socket.io')(server);
// 监听与客户端的链接事件
io.on('connection', socket => {
    console.log('服务端链接成功');
    // 记录用户名，用来记录是不是第一次进入，默认为undefined
    let username;
    let color; //  用于存放颜色的变量
    let rooms = []; //记录进入了那些房间的数组
    // 所有连接到服务端的socket.id
    mySocket[socket.id] = socket;
    //监听客服端发过来的信息
    socket.on('message', msg => {
        // 服务端发送message事件，把msg消息再发送给客户端
        if (username) {
            // 正则判断消息是否为私聊专属
            let private = msg.match(/@([^] +)(.+)/);
            if (private) { // 私聊信息
                // 私聊用户，正则匹配的第一个分组
                let toUser = private[1];
                // 私聊的内容，正则匹配的第二个分组
                let content = private[2];
                // 从socketObj中获取私聊用户的socket
                let socket = socketObj[toUser];
                
                if (toSocket) {
                    // 向私聊的用户发消息
                    toSocket.send({
                        user: username,
                        color,
                        content,
                        createAt: new Date().toLocaleString()
                    })
                }
            } else { // 公聊信息
                // 如果rooms数组有值，就代表用户进入了房间
                if (rooms.length) {
                    // 用来存储进入房间内的对应的socket.id
                    let socketJson = {};

                    rooms.forEach(room => {
                        // 取得所有进入房间用户的socket.id
                        let roomSockets = io.sockets.adapter.rooms[room].sockets;
                        Object.keys(roomSockets).forEach(socketId => {
                            // 进行去重，在socketJson中只有对应唯一的socketId
                            if (!socketJson[socketId]) {
                                socketJson[socketId] = 1;
                            }
                        })
                    })
                    // 遍历所有socketJson,在mySocket里找到对应的id，然后发送消息
                    Object.keys(socketJson).forEach(socketId => {
                        mySocket[socketId].emit('message', {
                            user: username,
                            color,
                            content: msg,
                            createAt: new Date().toLocaleString()
                        })
                    })
                } else { // 如果不是群聊，向所有人发送信息
                  io.emit('message', {
                    user: username,
                    color,
                    content: msg,
                    createAt: new Date().toLocaleString()
                  })
                  // 把发送的消息push到msgHistory中
                  // 真实情况是存到数据库里
                  msgHistory.push({
                      user: username,
                      color,
                      content: msg,
                      createAt: new Date().toLocaleString()
                  })  
                }
            }
             
        } else {
            username = msg;
            socketObj[username] = socket;
            // 乱序后取出颜色数组中的第一个，分配给进入的用户
            color = shuffle(userColor)[0];
            // 向除了自己的所有人广播，
            socket.broadcast.emit('message', {
                user: SYSTEM,
                color,
                constent: username + '加入了聊天',
                createAt: new Date().toLocaleDateString()
            })
        }
        
    });
    // 监听进入房间事件
    socket.on('join', room => {
        // 判断用户是否进入房间，如果没有就让其进入房间
        if (username && rooms.indexOf(room) === -1) {
            // socket.join表示进入某个房间
            socket.join(room);
            rooms.push(room);
            // 这里发送个joined事件，让前端监听后，控制房间按钮显隐
            socket.emit('joined', room);
            // 通知一下自己
            socket.send({
                user: SYSTEM,
                color,
                content: '你已加入' + room + '战队',
                createAt: new Date().toLocaleString
            })
        }
    });
    // 监听离开房间事件
    socket.on('leave', room => {
        // index 当前房间rooms数组的索引
        let index = rooms.indexOf(room);
        if (index !== -1) {
            socket.leave(room); //离开改房间
            rooms.splice(index, 1); // 将用户从改房间里删除
            // 向前台发送一个leaved事件
            socket.emit('leaved', room);
            socket.send({
                user: SYSTEM,
                color,
                content: '你离开' + room + '战队',
                createAt: new Date().toLocaleString
            })
        }
    })
    // 监听获取历史消息的事件
    socket.on('getHistory', () => {
        // 通过数组的slice方法截取最新的20条信息
        if (msgHistory.length) {
            let history = msgHistory.slice(msgHistory.length - 20);
            // 发送history事件并返回history消息数组给客户端
            socket.emit('history', history);
        }
    })
})

server.listen(4000);