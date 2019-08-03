const mongoose = require('mongoose')
// 连接的数据库地址
const dbUrl = "mongodb://localhost/test"
mongoose.connect(dbUrl,{useNewUrlParser: true })
const db = mongoose.connection

// 监听错误事件和打开事件
db.once('error', err => console.log("db connection error!"))
db.once('open', err => console.log("db connection successed!"))

// 定义账户schema
const loginSchema = {
    username: String,
    pwd: String,
    imageUrl: String,
    authorization: String,
    createdTime: String,
    hobby: [String]
}

// 评论schema
const commentSchema = {
    username: String,
    userImage: String,
    content: String,
    createdTime: String
}

// 视频Schema,存放视频地址
const videoSchema = {
    username: String,
    title: String,
    videoUrl: String,
    poster: String,
    pass: Boolean,
    comments: [commentSchema],
    tags: [String],
    hot: Number
}

// 公告schema
const noticeSchema = {
    content: String,
    createdTime: String,
    toTarget: String
}

// 公告状态schmea
const noticeStatusSchema = {
    noticeId: String,
    username: String,
    content: String,
    createdTime: String,
    readStatus: Boolean
}

// 定义Models
const Models = {
    Login: mongoose.model('Login', loginSchema),
    Video: mongoose.model('Video', videoSchema),
    Notice: mongoose.model('Notice', noticeSchema),
    NoticeStatus: mongoose.model('NoticeStatus', noticeStatusSchema),
    Comments: mongoose.model('Comment', commentSchema)
}

module.exports = Models
