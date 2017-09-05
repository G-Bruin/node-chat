/**
 * Created by Administrator on 2017/9/4.
 */
var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'public')));

var users = {};

app.get('/',function(req, res){
    if(localStorage.getItem('user')) {
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
        //不存在，把用户名存入 localStorage 并跳转到主页
        localStorage.setItem('user', req.body.first_name);
        res.redirect('/');
    }
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log('aaaa');
    socket.on('disconnect', function () {
        console.log('user disconnect')
    })
})


server.listen(3000, function(){
    console.log('Express server listening on port 3000 ');
});