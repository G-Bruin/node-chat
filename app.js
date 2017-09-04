/**
 * Created by Administrator on 2017/9/4.
 */
var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
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

app.post('/', function (req, res) {
    console.log(req.body.first_name);
    if (users[req.body.first_name]) {
        //存在，则不允许登陆
        res.redirect('/signin');
    } else {
        //不存在，把用户名存入 localStorage 并跳转到主页
        localStorage.setItem('user', req.body.first_name);
        res.redirect('/');
    }
});



var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})