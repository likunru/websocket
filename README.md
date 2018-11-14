# websocket
## 聊天室功能：  
1. 创建客户端与服务端的websocket通信连接  
2. 客户端与服务端相互发送信息  
3. 添加用户名  
4. 添加私聊  
5. 进入/离开房间聊天  
6. 历史消息

## websocket（一种协议）简介
主要特点：服务器可以主动向客户端推送消息，客户端也可以主动向服务端发送消息。  
其他特点：  
（1）建立在TCP协议之上，服务端的实现比较容易。  
（2）与http协议有着良好的兼容性。默认端口也是80和443，并且握手阶段采用http协议，因此握手时不容易屏蔽，能通过各种http代理服务器。  
（3）数据格式比较轻量，性能开销小，通信搞笑。  
（4）可以发送文本，也可以发送二进制数据局。  
（5）没有同源限制，客户端可以与任意服务器通信。  
（6）协议标识符是ws(如果加密，则为wss),服务器网址就是url。  

## websocket客户端API
1、WebSocket构造函数  var ws = new WabSocket('ws://localhost:8080'); 执行该语句之后 ，客户端与服务器进行连接。  
2、websocket.readyState:  
   readyState属性返回实例对象的当前状态，共有4中。  
3、websocket.onopen: 用于指定连接成功后的回调函数。  
4、websocket.onmessage: 用于指定收到服务器数据后的回调函数。  
5、websocket.send(),用于向服务器发送数据

## websocket服务端实现。
   常用Socket.io