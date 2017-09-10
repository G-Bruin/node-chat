/**
 * Created by Administrator on 2017/9/4.
 */
var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
var users = {};

var avatar = [
    'images/hetu.jpg',
    'images/53f44283a4347.jpg',
    'images/53f442834079a.jpg'
];

app.get('/',function(req, res){
    if(req.cookies.user_info) {
        res.sendFile( __dirname +'/views/index.html');
    } else {
        res.sendFile( __dirname +'/views/signin.html');
    }
});

app.post('/', urlencodedParser, function (req, res) {
    if (users[req.body.first_name]) {
        //存在，则不允许登陆
        res.redirect('/signin');
    } else {
        var user_info = {
            'name' : req.body.first_name,
            'avatar' : avatar[Math.floor(0 + Math.random() * 3)]
        }
        res.cookie("user_info", user_info, {maxAge: 1000*60*60*24*30});
        res.redirect('/');
    }
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

    //上线提醒
    socket.on('online', function (data){
        socket.name = data.user_info.name;
        if (!users[data.user_info.name]) {
            users[data.user_info.name] = data.user_info;
        }
        io.sockets.emit('online', {user_list: users, user: data.user_info});
    })


    //有人发话
    socket.on('say', function (data) {
        if (data.chat == 'all') {
            //向其他所有用户广播该用户发话信息
            socket.broadcast.emit('say', data);
        } else {
            socket.broadcast.emit(data.chat, data);
        }
    });

    socket.on('disconnect', function () {
        console.log('user disconnect')

        if (users[socket.name]) {
            var user_info = users[socket.name];
            //从 users 对象中删除该用户名
            delete users[socket.name];
            //向其他所有用户广播该用户下线信息
            socket.broadcast.emit('offline', {user_list: users, user: user_info});
        }
    })
})


server.listen(3000, function(){
    console.log('Express server listening on port 3000 ');
});