let socket = io();
// 监听与服务端的链接
socket.on('connect', () => {
    console.log('链接成功');
    // 向服务器发getHistory来拿消息
    socket.emit('getHistory');
})

// 获取列表list，输入框content,按钮sendBtn元素
let list = document.getElementById('list'),
    input = document.getElementById('input');
    sendBtn = document.getElementById('sendBtn');

// 发送信息
function send() {
    let value = input.value;
    if (value) {
        socket.emit('message', value);
        input.value = '';
    } else {
        alert('输入内容不能为空!');
    }
}
sendBtn.onclick = send;    

// 回车发送信息
function enterSend(event) {
    let code = event.keyCode;
    if (code === 13) send();
}

input.onkeydown = function (event) {
    enterSend(event);
}

// 监听message事件来接收服务端发过来的消息
socket.on('message', data => {
    // 创建新的li元素，最终将其添加到list列表
    let li = document.createElement('li');
    li.className = 'list-group-name';
    li.innerHTML = '<p style="color: #ccc;"><span class="user" style="color:'+ data.color 
      + ';">' + data.user + '</span>' + data.createAt + '</p><p class="content" style="background:' + data.color +';">' + data.content + '</p>';
    list.appendChild(li);
    // 讲聊天区的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight;
})

// 实现私聊的方法
function privateChat (event) {
    let target = event.target;
    // 拿到对应的用户名
    let user = target.innerHTML;
    if (target.className === 'user') {
        input.value = '@' + user;
    }
}
list.onclick = function(event) {
    privateChat(event);
}

// 进入房间的方法
function join(room) {
    socket.emit('join', room);
}

// 监听是否进入房间，如果进入房间，就显示离开房间的按钮
socket.on('joined', room => {
    document.getElementById('join-' + room).style.display = 'none';
    document.getElementById('leave-' + room).style.display = 'inline-block';
})

// 离开房间的方法
function leave(room) {
    socket.emit('leave', room);
}

// 监听是否已离开房间，如果离开房间，就显示进入房间的按钮
socket.on('leave', room => {
    document.getElementById('leave-' + room).style.display = 'none';
    document.getElementById('join-' + room).style.display = 'inline-block';
})
// 接收历史消息
socket.on('history', history => {
    let html = history.map(data => {
        return '<li class="list-group-item">' +
        '<p style="color: #ccc;"><span class="user" style="color:' + data.color + '">' + data.user + '</span>' + data.createAt + '</p>' +
        '<p class="content" style="background-color: ' + data.color + '">' + data.content + '</p>'
    }).join('');
    list.innerHTML = html + '<li style="margin: 16px 0;text-align: center">以上是历史消息</li>';
    // 将聊天区域的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight;
})