<!-- 视频播放页面 -->
<template>
    <div id="video-play">
        <header-app :userImage="userImage" :show="false"></header-app>
        <el-container>
            <el-header><h1 style="width: 80%">{{videoInfo.title ? videoInfo.title : '名字走丢了...'}}</h1></el-header>
            <el-container>
                <el-main style="border: 1px solid #f7f7f7">
                    <video id="video" :src="videoInfo.videoUrl" controls width="100%" height="480px"
                           :poster="videoInfo.poster ? videoInfo.poster : ''"></video>
                </el-main>
                <el-aside width="20%">
                    <p style="color: #409EFF;text-align: left">相关信息：</p>
                    <el-tag v-for="item in videoInfo.tags" :key="item">{{item}}</el-tag>
                    <p style="color: #409EFF;text-align: left">分享者：</p>
                    <div class="author-info">
                        <img :src="authorImage" alt="加载失败">
                        <span>{{authorName}}</span>
                    </div>
                    <p style="color: #409EFF;text-align: left">描述：</p>
                    <p style="text-align: left">暂无相关描述</p>
                </el-aside>
            </el-container>
            <div class="comment-area"><h2>评论区</h2>
                <div class="comment-content">
                    <div class="face-box">
                        <img :src="userImage ? userImage : defaultImage" alt="">
                    </div>
                    <el-input
                            style="flex:1"
                            type="textarea"
                            :autosize="{ minRows: 2, maxRows: 5}"
                            placeholder="请输入内容"
                            v-model="textareaValue">
                    </el-input>
                </div>
                <div class="comment-btn">
                    <el-button type="primary" @click="reset">清空</el-button>
                    <el-button type="primary" @click="submit">发表</el-button>
                </div>
                <div class="comment-list">
                    <ul>
                        <li v-for="(item,index) in commentList" :key="index">
                            <div class="list-box">
                                <div class="face-box">
                                    <img :src="item.userImage ? item.userImage : defaultImage" alt="">
                                </div>
                                <div>
                                    <p style="text-align: left"><span style="margin-right: 25px;color: #409EFF">{{item.username}}</span>
                                        <span>{{item.createdTime}}</span></p>
                                    <p style="white-space: pre-wrap;text-align: left">{{item.content}}</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </el-container>
    </div>
</template>

<script>
    import headerApp from "@/components/header/header.vue";

    export default {
        components: {
            headerApp
        },
        data() {
            return {
                filterWordTree: [], // 生成的过滤词汇树
                defaultPoster: '', // 默认封面
                defaultImage: '', // 默认头像
                userImage: '', // 登录用户头像
                videoInfo: {
                    title: '',
                    poster: '',
                    videoUrl: '',
                    tags: [] // 标签
                },
                textareaValue: '', // 评论
                commentList: [], // 评论列表
                authorName: '', // 分享者名字
                authorImage: '', // 分享者头像
                playTime: '', // 视频已播放时长
                hotFlag: false // 是否已记录热度
            }
        },
        created() {
            this.defaultImage = require('../../assets/default.jpg')
            this.defaultPoster = require('../../assets/defaultPoster.png')
            this.initData()
            this.getCommentsList()
            this.getAuthorInfo()
            this.filterWordTree = this.filterTree()
        },
        mounted() {
            this.initMedia()
            let that = this
            window.onbeforeunload = () => {
                let user = sessionStorage.getItem('userInfo')
                // 如果用户关闭页面时已观看视频时长超过总时长的一半且该视频有标签，且用户已登录，则统计该数据
                if(that.playTime > 0.5 && that.videoInfo.tags.length > 0 && user) {
                    var xmlhttp = new XMLHttpRequest(); // 创建异步请求
                    let data = new FormData();
                    data.append('username',user)
                    data.append("info", that.videoInfo.tags)
                    xmlhttp.open("POST", "http://localhost:3000/special/statisticalData", false);
                    xmlhttp.send(data); // 发送同步请求
                }
            };

        },
        methods: {
            // 生成DFA树
            filterTree(){
                const arr = ['shit','fuck','他妈的','傻逼','大笨蛋']
                const result = new Map()
                for(let i =0; i < arr.length; i++){
                    let map = result
                    for(let j = 0 ;j< arr[i].length;j++) {
                        // 如果map里已经存在这个字，就到下一节点去
                        if(map.get(arr[i][j])){
                            map = map.get(arr[i][j])
                        } else {
                            if(map.get('last') === true) {
                                map.set('last',false)
                            }
                            const item = new Map()
                            item.set('last',true)
                            map.set(arr[i][j],item)
                            map = map.get(arr[i][j])
                        }
                    }
                }
                return result
            },
            // 敏感词过滤 DFA算法
            commentsFilter(val){
                let result = this.filterWordTree
                let testArr = []
                let flag = true
                testArr.push(val)
                testArr.map((item)=>{
                    let current = result
                    for(let i=0;i<item.length;i++) {
                        if(item[i] === ' ') {
                            continue
                        }
                        if(current.get(item[i]) && !current.get(item[i]).get('last')){
                            current = current.get(item[i])
                        } else if(current.get(item[i]) && current.get(item[i]).get('last')) {
                            flag = false
                            break
                        }
                    }
                })
                return flag
            },
            // // 评论敏感词过滤,正则
            // commentsFilter(){
            //     const wordList = ['shit','fuck','他妈的','傻逼']
            //     for(let i in wordList){
            //         let tmp = this.textareaValue.replace(/\s*/g,'') // 去掉字符串中的空格
            //         let reg = new RegExp(wordList[i],'ig')
            //         if(reg.test(tmp)) {
            //             this.textareaValue = tmp.replace(reg, '**')
            //         }
            //     }
            // },
            // 初始化video的各类事件
            initMedia() {
                let media = document.getElementById('video')
                // 监听视频的播放时间更新
                media.addEventListener('timeupdate',()=>{
                    let result = media.currentTime/media.duration
                    this.playTime = result
                    if(this.playTime > 0.3 && !this.hotFlag){
                        const params = {
                            videoId: this.$route.query.videoId
                        }
                        this.axios.post('/special/hot',params).then(()=>{
                            this.hotFlag = true
                        })
                    }
                })
            },
            // 获取作者信息
            async getAuthorInfo() {
                const params = {
                    params: {
                        videoId: this.$route.query.videoId
                    }
                }
                let res = await this.axios.get('/videoPlay/authorInfo', params)
                if (res.data.code === 1) {
                    this.authorName = res.data.data.username
                    this.authorImage = res.data.data.imageUrl ? 'http://localhost:3000/images/' + res.data.data.imageUrl : this.defaultImage
                }
            },
            // 获取评论列表
            async getCommentsList() {
                const params = {
                    params: {
                        videoId: this.$route.query.videoId
                    }
                }
                let res = await this.axios.get('/videoPlay/commentsList', params)
                if (res.data.code === 1) {
                    this.commentList = [...res.data.data]
                }
            },
            // 发表评论
            async submit() {
                let flag = false
                if (!sessionStorage.getItem('userInfo')) {
                    this.$message.error('请先登录')
                    return
                }
                if (this.textareaValue === '') {
                    this.$message.error('评论为空，请输入')
                    return
                }
                await this.$confirm('该评论发表之后不可删除，确认是否发表?', '提示', {
                    confirmButtonText: '当然',
                    cancelButtonText: '我再想想'
                }).then(() => {
                    flag = true
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
                if (!flag) {
                    return
                }
                let filterResult = this.commentsFilter(this.textareaValue)
                if(!filterResult) {
                    this.$message.error('评论中含非法字符，请修改')
                    return
                }
                const params = {
                    videoId: this.$route.query.videoId,
                    username: sessionStorage.getItem('userInfo'),
                    userImage: this.userImage,
                    content: this.textareaValue
                }
                let res = await this.axios.post('/videoPlay/addComments', params)
                if (res.data.code === 1) {
                    this.textareaValue = ''
                    this.$message.success('发表成功')
                    this.getCommentsList()
                } else {
                    this.$message.error('发表失败')
                }
            },
            // 清空评论
            reset() {
                this.textareaValue = ''
            },
            // 初始化数据
            initData() {
                if (sessionStorage.getItem("userImage")) {
                    this.userImage = 'http://localhost:3000/images/' + sessionStorage.getItem("userImage");
                }
                this.videoInfo.title = this.$route.query.title
                this.videoInfo.poster = this.$route.query.poster ? 'http://localhost:3000/images/' + this.$route.query.poster : this.defaultPoster
                this.videoInfo.videoUrl = 'http://localhost:3000/images/' + this.$route.query.videoUrl
                if (typeof this.$route.query.tags === 'string') {
                    this.videoInfo.tags.push(this.$route.query.tags)
                } else {
                    this.videoInfo.tags = this.$route.query.tags
                }
            }
        }
    };
</script>
<style lang="scss" scoped>
    #video-play {
        .author-info {
            width: 70%;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            img {
                width: 50px;
                height: 50px;
                border-radius: 50%;
            }
            span {
                line-height: 50px;
            }
        }
        .comment-area {
            width: 80%;
            height: 1200px;
            .comment-content {
                display: flex;
                flex-direction: row;
                .face-box {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    overflow: hidden;
                    margin-right: 10px;
                    img {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
            .comment-btn {
                padding: 10px 0;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .comment-list {
                ul {
                    list-style: none;
                    padding: 0;
                    li {
                        border-bottom: 1px solid #f0f0f0;
                        border-top: 1px solid #f0f0f0;
                        .list-box {
                            display: flex;
                            flex-direction: row;
                            .face-box {
                                width: 50px;
                                height: 50px;
                                border-radius: 50%;
                                overflow: hidden;
                                margin-right: 20px;
                                margin-top: 15px;
                                img {
                                    width: 100%;
                                    height: 100%;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>