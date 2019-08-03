const express = require('express')
const app = express()
// 设置静态资源目录
app.use(express.static('public'))
const api = require('./api')
// 跨域设置
const cors = require('cors')
// 引入session，用于支持验证码的存储
const session = require('express-session')
app.use(session({
    secret :  'zhd', 
    resave : true,
    saveUninitialized: false, 
    cookie : {
        maxAge : 1000 * 60 * 2, 
    },
}))
//加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser')
//bodyParser配置
app.use(bodyParser.json({limit : "2100000kb"}));
app.use( bodyParser.urlencoded({
    extended: false
}) )

// 文件上传
const multer = require('multer')

var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
       destination: function (req, file, cb) {
           cb(null, './public/images')
      }, 
    //给上传文件重命名，获取添加后缀名
     filename: function (req, file, cb) {
         cb(null, Date.now() + file.originalname);
     }
    });

app.use(multer({ storage: storage}).fields([{name: 'image', maxCount: 1}, {name: 'video',maxCount:1}]))

app.use(cors({ origin: 'http://localhost:8080' ,credentials:true}))
app.use(api)

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
