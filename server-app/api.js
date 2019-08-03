const Models = require('./db')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const svgCaptcha = require('svg-captcha');
const co = require('co')
const mongoose = require('mongoose')

// 获取随机数
function getRand(min,max) {
    let Range = max - min
    let Rand = Math.random()
    return min + Math.round(Rand * Range)
}

// 每一周清除热度
setInterval(()=>{
    let date = new Date()
    if(date.getDay() === 1){
        Models.Video.updateMany({},{hot:0}).then(()=>{
            console.log('已完成每周热度清理')
        }).catch((err)=>{
            console.log(err)
        })
    }
},86400000)

/* 更多页面接口 */
// 获取列表
router.get('/more/moreList', function (req, res) {
    const params = {
        type: req.query.type,
        keyWord: req.query.keyWord,
        pageSize: parseInt(req.query.pageSize),
        pageNum: parseInt(req.query.pageNum)
    }
    if (params.type === 'search') {
        let keyWord = new RegExp(params.keyWord, 'i')
        Models.Video.countDocuments({ 'title': keyWord, pass: true }).then((data) => {
            Models.Video.find({ 'title': keyWord, pass: true }).skip(params.pageSize * (params.pageNum - 1)).limit(params.pageSize).sort({ '_id': -1 }).then((docs) => {
                let total = data
                let pageNum = params.pageNum
                let pageSize = params.pageSize
                res.send({ code: 1, data: docs, msg: '查询成功', totalRecords: total, pageSize: pageSize, pageNum: pageNum })
            }).catch((err) => {
                res.send(err)
            })
        })
    } else if (params.type === 'more') {
        Models.Video.find({ pass: true }).then((docs) => {
            let result = docs.filter((item) => {
                if (item.tags.indexOf(params.keyWord) !== -1) {
                    return true
                }
            })
            let total = result.length
            let pageNum = params.pageNum
            let pageSize = params.pageSize
            let start = pageSize*(pageNum-1)
            let end = start + params.pageSize
            result = result.slice(start, end)
            res.send({ code: 1, data: result, msg: '查询成功', totalRecords: total, pageSize: pageSize, pageNum: pageNum })
        }).catch((err) => {
            res.send(err)
        })
    } else {
        res.send({ code: -3, msg: '参数出错，查询失败' })
    }
})

/* 播放页面接口 */
// 热度统计
router.post('/special/hot',function(req,res){
    const params = {
        videoId: mongoose.Types.ObjectId(req.body.videoId)
    }
    const query = {
        _id: params.videoId
    }
    Models.Video.findOne(query).then((doc)=>{
        if(doc.hot){
            doc.hot++ 
        } else {
            doc.hot = 0
            doc.hot++
        }
        doc.save().then(()=>{
            res.send({code:1, msg:'成功'})
        }).catch((err)=>{
            res.send(err)
        })
    }).catch((err)=>{
        res.send(err)
    })
})

// 用户行为数据统计
router.post('/special/statisticalData', function (req, res) {
    const name = req.body.username
    const info = req.body.info.split(',')
    if (name && info) {
        Models.Login.findOne({ username: name }).then((doc) => {
            info.map((item) => {
                if (doc.hobby.indexOf(item) === -1) {
                    doc.hobby.push(item)
                }
            })
            doc.save().then((data) => {
                res.send({ code: 1, msg: '成功' })
            }).catch((err) => {
                res.send(err)
            })
        }).catch((err) => {
            res.send(err)
        })
    } else {
        res.send({ code: -1, msg: '失败' })
    }
})


// 获取作者信息
router.get('/videoPlay/authorInfo', function (req, res) {
    const params = {
        videoId: mongoose.Types.ObjectId(req.query.videoId)
    }
    const query = {
        _id: params.videoId
    }
    Models.Video.findOne(query).then((doc) => {
        if (doc) {
            const username = doc.username
            Models.Login.findOne({ username: username }, 'username imageUrl').then((data) => {
                res.send({ code: 1, data: data, msg: '查询成功' })
            }).catch((err) => {
                res.send(err)
            })
        } else {
            res.send({ code: -1, msg: '找不到该视频' })
        }
    }).catch((err) => {
        res.send(err)
    })
})

// 获取评论列表
router.get('/videoPlay/commentsList', function (req, res) {
    const params = {
        videoId: mongoose.Types.ObjectId(req.query.videoId)
    }
    const query = {
        _id: params.videoId
    }
    Models.Video.findOne(query).then((doc) => {
        if (doc) {
            let result = [...doc.comments]
            result.reverse()
            res.send({ code: 1, data: result, msg: '查询成功' })
        } else {
            res.send({ code: -1, msg: '找不到该视频' })
        }
    }).catch((err) => {
        res.send(err)
    })
})

// 添加评论
router.post('/videoPlay/addComments', function (req, res) {
    const params = {
        videoId: mongoose.Types.ObjectId(req.body.videoId),
        username: req.body.username,
        userImage: req.body.userImage,
        content: req.body.content
    }
    const query = {
        _id: params.videoId
    }
    const nowTime = new Date();
    const createdTime = nowTime.toLocaleString()
    Models.Video.findOne(query).then((doc) => {
        if (doc) {
            doc.comments.push({
                username: params.username,
                userImage: params.userImage,
                content: params.content,
                createdTime: createdTime
            })
            doc.save().then(() => {
                res.send({ code: 1, msg: '评论成功' })
            }).catch((err) => {
                res.send(err)
            })
        } else {
            res.send({ code: -1, msg: '找不到该视频' })
        }
    }).catch((err) => {
        res.send(err)
    })
})

/* 首页接口 */
// 获取热门榜单
router.get('/index/hotList', function(req,res){
    Models.Video.find({pass:true}).limit(5).sort({ 'hot': -1 }).then((docs)=>{
        res.send({code:1, data:docs, msg: '查询成功'})
    }).catch((err)=>{
        res.send(err)
    })
})

// 获取各类别的视频列表
router.get('/index/familyVideoList', function (req, res) {
    const query = {
        pass: true,
        tags: { $elemMatch: { $eq: req.query.tag } }
    }
    Models.Video.find(query).then((docs) => {
        res.send({ code: 1, data: docs, msg: '查询成功' })
    }).catch((err) => {
        res.send(err)
    })
})

// 获取轮播视频列表
router.get('/index/carouselMaplist', function (req, res) {
    Models.Video.find({ pass: true }).limit(6).then((docs) => {
        res.send({ code: 1, data: docs, msg: '查询成功' })
    }).catch((err) => {
        res.send(err)
    })
})

// 获取推荐视频列表
router.get('/index/indexVideoList', function (req, res) {
    const params = {
        username: req.query.username
    }
    if (params.username) {
        Models.Login.findOne(params).then((doc) => {
            let tags = [...doc.hobby]
            Models.Video.find({ pass: true }).then((docs) => {
                let result = docs.filter((item) => {
                    let flag = false
                    for (let i in item.tags) {
                        if (tags.indexOf(item.tags[i]) !== -1) {
                            flag = true
                            break
                        }
                    }
                    return flag
                })
                if (result.length > 0) {
                    result = result.slice(0, 4)
                    res.send({ code: 1, data: result, msg: '查询成功' })
                } else {
                    let data = docs.slice(0, 4)
                    res.send({ code: 1, data: data, msg: '查询成功' })
                }
            }).catch((err) => {
                res.send(err)
            })
        }).catch((err) => {
            res.send(err)
        })
    } else {
        Models.Video.find({ pass: true }).then((docs) => {
            let result = []
            let max = docs.length-1
            let min = 0
            let times = max > 4 ? 4 : max
            for(let i = 0;i< times;i++){
                let index = getRand(min,max)
                result.push(docs[index])    
            }
            res.send({ code: 1, data: result, msg: '查询成功' })
        }).catch((err) => {
            res.send(err)
        })
    }
})

/* 登录及后台接口 */
// 更改公告的阅读状态
router.post('/notices/changeStatus', function (req, res) {
    if (req.body.username) {
        const query = {
            username: req.body.username
        }
        Models.NoticeStatus.updateMany(query, { readStatus: true }).then((doc) => {
            res.send({ code: 1, msg: '公告已阅读' })
        }).catch((err) => {
            res.send(err)
        })
    } else {
        res.send({ code: -1, msg: '未获取到用户信息' })
    }

})

// 查询是否有未读公告
router.get('/notices/checkStatus', function (req, res) {
    let result = []
    co(function* () {
        const cursor = Models.Notice.find().cursor();
        // 查询消息表
        for (let doc = yield cursor.next(); doc != null; doc = yield cursor.next()) {
            // 查询消息用户表，判断是否消息表中的数据是否有对应用户数据存在，存在则压栈，不存在则先往数据库添加数据再压栈
            // 目的：只添加活跃用户的数据，减轻数据库压力
            yield Models.NoticeStatus.find({ username: req.query.username, noticeId: doc._id }).then(async (data) => {
                if (data.length > 0) {
                    // 数据已存在，直接压栈
                    result.push(data[0])
                    flag = true
                } else {
                    // 数据不存在，向数据库添加该条数据，再压栈
                    let newNotice = new Models.NoticeStatus({
                        noticeId: doc._id,
                        username: req.query.username,
                        content: doc.content,
                        createdTime: doc.createdTime,
                        readStatus: false
                    })
                    await newNotice.save().then((doc) => {
                        result.push(doc)
                    }).catch(() => {
                        console.log('NoticeStatus save Error')
                    })
                }
            }).catch(() => {
                console.log('NoticeStatus find Error')
            })
        }
    }).then(() => {
        result.reverse()
        let total = result.length
        let pageSize = parseInt(req.query.pageSize)
        let pageNum = parseInt(req.query.pageNum)
        let start = pageSize*(pageNum-1)
        let end = start + pageSize
        result = result.slice(start, end)
        res.send({ code: 1, data: result, msg: '查询成功', totalRecords: total, pageSize: pageSize, pageNum: pageNum})
    }).catch((err) => {
        res.send(err)
    })
})

// 发布公告
router.post('/notices/pushNotices', function (req, res) {
    const nowTime = new Date();
    let notices = new Models.Notice({
        content: req.body.content,
        createdTime: nowTime.toLocaleString(),
        toTarget: req.body.target || 'common'
    })
    if (!notices.content) {
        res.send({ code: -1, msg: '发布失败，发布内容为空！' })
    } else {
        notices.save((err, docs) => {
            if (err) {
                res.send({ code: -2, msg: '发布失败，服务器错误' })
            } else {
                res.send({ code: 1, msg: '发布成功' })
            }
        })
    }

})

// 审核视频
router.post('/video/checkVideo', function (req, res) {
    const query = {
        _id: mongoose.Types.ObjectId(req.body.videoId),
    }
    const motion = {
        pass: req.body.motion === 'pass' ? true : false
    }
    Models.Video.findOneAndUpdate(query, motion).then(() => {
        res.send({ code: 1, msg: '审核已通过' })
    }).catch((err) => {
        res.send(err)
    })
})

// 获取审核视频列表
router.get('/video/checkVideoList', function (req, res) {
    const params = {
        pageSize: parseInt(req.query.pageSize),
        pageNum: parseInt(req.query.pageNum)
    }
    Models.Video.countDocuments({ 'pass': false }).then((data) => {
        Models.Video.find({ 'pass': false }).skip(params.pageSize * (params.pageNum - 1)).limit(params.pageSize).sort({ '_id': -1 }).then((docs) => {
            let total = data
            let pageNum = params.pageNum
            let pageSize = params.pageSize
            res.send({ code: 1, data: docs, msg: '查询成功', totalRecords: total, pageSize: pageSize, pageNum: pageNum })
        }).catch((err) => {
            res.send(err)
        })
    })
})

// 删除用户
router.post('/manager/deleteUser', function (req, res) {
    Models.Login.remove({ username: req.body.username }, function (err, docs) {
        if (err) {
            res.send(err);
        } else {
            res.send({ code: 1, msg: '删除成功' })
        }
    })
})

// 修改用户列表资料
router.post('/manager/userList/updateUser', function (req, res) {
    Models.Login.findOneAndUpdate({ 'username': req.body.username }, { 'authorization': req.body.power }).then(() => {
        res.send({ code: 1, msg: '修改成功' })
    }).catch((err) => {
        res.send(err)
    })
})

// 获取用户列表
router.get('/manager/userList', function (req, res) {
    const params = {
        keyWord: new RegExp(req.query.username, 'i'),
        pageSize: parseInt(req.query.pageSize),
        pageNum: parseInt(req.query.pageNum)
    }
    Models.Login.countDocuments({ 'username': params.keyWord }).then((data) => {
        Models.Login.find({ 'username': params.keyWord }, 'username authorization').skip(params.pageSize * (params.pageNum - 1)).limit(params.pageSize).sort({ '_id': -1 }).then((docs) => {
            let total = data
            let pageNum = params.pageNum
            let pageSize = params.pageSize
            res.send({ code: 1, data: docs, msg: '查询成功', totalRecords: total, pageSize: pageSize, pageNum: pageNum })
        }).catch((err) => {
            res.send(err)
        })
    })

})

// 注册接口
router.post('/register', function (req, res) {
    if (!req.session.captcha) {
        res.json({ code: -3, msg: '验证码过期' });
        return;
    }
    if (req.session.captcha !== req.body.captcha) {
        res.json({ code: -1, msg: '验证码错误' });
        return;
    }
    let userAccount = new Models.Login({
        username: req.body.username,
        pwd: req.body.password,
        imageUrl: '',
        authorization: 'common'
    });
    Models.Login.countDocuments({ "username": userAccount.username }, (err, docs) => {
        if (err) {
            res.send(err)
        } else {
            if (docs >= 1) {
                res.send({ code: 2, msg: '账号已经存在了，不能再次注册' })
            } else {
                userAccount.save((err, data) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.send({ code: 1, msg: '恭喜您，账号创建成功了' })
                    }
                })
            }
        }
    })
})
// 登录接口
router.post('/login', (req, res) => {
    let userAccount = new Models.Login({
        username: req.body.username,
        pwd: req.body.password
    });

    if (!req.session.captcha) {
        res.json({ code: -3, msg: '验证码过期' });
        return;

    }
    if (req.session.captcha !== req.body.captcha) {
        res.json({ code: -1, msg: '验证码错误' });
        return;
    }


    Models.Login.findOne({ "username": userAccount.username }, (err, docs) => {
        if (err) {
            res.send(err)
        } else {
            if (!docs) {
                res.send({ code: -2, msg: '账号不存在，请先注册账号' })
            } else {
                if (docs.username === userAccount.username && docs.pwd === userAccount.pwd) {
                    let content = { name: userAccount.username };  // 要生成token的主题信息
                    let secretOrPrivateKey = "zhd";      // 这是加密的key（密钥）
                    let access_token = jwt.sign(content, secretOrPrivateKey, {
                        expiresIn: 60 * 60 * 2              // 1小时过期
                    });
                    res.send({ code: 1, msg: '恭喜你，登录成功了', token: access_token, power: docs.authorization, username: userAccount.username, imageUrl: docs.imageUrl });
                } else {
                    res.send({ code: 2, msg: '账号或密码错误' })
                }
            }
        }
    })
})

// 登录验证
router.post('/checkUser', (req, res) => {
    let token = req.body.Authorization; // 从Authorization中获取token
    let secretOrPrivateKey = "zhd"; // 这是加密的key（密钥）
    jwt.verify(token, secretOrPrivateKey, (err, decode) => {
        if (err) {  //  时间失效的时候 || 伪造的token
            res.send({ 'status': 'loginOut' });
        } else {
            res.send({ 'status': 'loginIn' });
        }
    })
});

// 图片上传
router.post('/imageUpload', (req, res) => {
    if (req.files.image) {
        res.send({ "imageUrl": req.files.image[0].filename });
    } else if (req.files.video) {
        res.send({ "videoUrl": req.files.video[0].filename });
    }

})

// 视频保存
router.post('/videoSave', (req, res) => {
    if (!req.body.username) {
        res.send({ code: -1, msg: '获取用户信息失败，请重新登录' })
    }
    if (!req.body.videoUrl) {
        res.send({ code: -2, msg: '获取视频信息失败，请重新上传' })
    } else {
        let videoInfo = new Models.Video({
            username: req.body.username,
            title: req.body.title,
            videoUrl: req.body.videoUrl,
            poster: req.body.poster,
            pass: false,
            tags: [...req.body.tags]
        })
        videoInfo.save((err, data) => {
            if (err) {
                res.send({ code: -3, msg: '上传失败' })
            } else {
                res.send({ code: 1, msg: '上传成功' })
            }
        })
    }
})

// 删除我的视频
router.post('/video/deleteMyvideo',(req,res) => {
    const params = {
        videoId: mongoose.Types.ObjectId(req.body.videoId)
    }
    const query = {
        _id: params.videoId
    }
    Models.Video.deleteOne(query).then(()=>{
        res.send({code:1, msg:'删除成功'})
    }).catch((err)=>{
        res.send(err)
    })
})

// 获取我的视频列表
router.get('/video/getMyvideoList', (req, res) => {
    const params = {
        username: req.query.username,
        pageSize: parseInt(req.query.pageSize),
        pageNum: parseInt(req.query.pageNum)
    }
    Models.Video.countDocuments({ 'username': params.username }).then((data) => {
        Models.Video.find({ 'username': params.username }).skip(params.pageSize * (params.pageNum - 1)).limit(params.pageSize).sort({ '_id': -1 }).then((docs) => {
            let total = data
            let pageNum = params.pageNum
            let pageSize = params.pageSize
            res.send({ code: 1, data: docs, msg: '查询成功', totalRecords: total, pageSize: pageSize, pageNum: pageNum })
        }).catch((err) => {
            res.send(err)
        })
    })
})

// 个人资料修改
router.post('/infoUpdate', (req, res) => {
    const username = req.body.username;
    const userImage = req.body.userImage;
    const updatedPwd = req.body.pwd;
    Models.Login.findOne({ "username": username }, (err, docs) => {
        if (err) {
            res.send(err)
        } else {
            if (userImage) {
                docs.imageUrl = userImage;
            } else if (updatedPwd) {
                docs.pwd = updatedPwd;
            }
            docs.save(function (err, updatedDocs) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ success: true, msg: "修改成功", imageUrl: docs.imageUrl });
                }
            })
        }
    })

})

//  图片验证码
router.get('/getCaptcha', (req, res) => {
    // 生成验证码，并且将验证码文本保存在session中
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text.toLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
})

module.exports = router
