<template>
    <div id="videoCheck">
        <ul class="checkvideoList">
            <li v-for="(item,index) in videoList" :key="index">
                <div class="video-box">
                    <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                        <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                    </el-tooltip>
                    <img @click="toPlay(item)" :src="item.poster ? 'http://localhost:3000/images/' + item.poster : defaultPoster" alt="">
                </div>

                <p><span @click="checkVideo(item._id,'pass')">通过</span> | <span @click="checkVideo(item._id,'back')">打回</span> </p>
            </li>
        </ul>
        <div class="footer">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[10, 20, 30, 50]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalRecords">
            </el-pagination>
        </div>
    </div>

</template>
<script>
    export default {
        data(){
            return {
                totalRecords: 0, // 总记录数
                currentPage: 1, // 当前页码
                pageSize: 10, // 每一页大小
                pageNum: 1, // 页码
                defaultPoster: '',
                videoList: [] // 视频数组
            }
        },
        created(){
            this.getCheckVideoList()
        },
        methods: {
            // 分页
            handleSizeChange(val) {
                this.pageSize = val
                this.pageNum = 1
                this.getCheckVideoList()
            },
            handleCurrentChange(val) {
                this.pageNum = val
                this.getCheckVideoList()
            },
            // 打开播放页面
            toPlay(item) {
                let routeUrl = this.$router.resolve({
                    path: "/videoPlay",
                    query: {
                        title: item.title,
                        poster: item.poster,
                        videoUrl: item.videoUrl,
                        videoId: item._id,
                        tags : item.tags
                    }
                })
                window.open(routeUrl.href, '_blank');
            },
            // 审核视频
            async checkVideo(id, type) {
                const params = {
                    videoId: id,
                    motion: type
                }
              let res = await this.axios.post('/video/checkVideo', params)
                if(res.data.code === 1) {
                    this.getCheckVideoList()
                    this.$message.success('审核成功')
                } else {
                    this.$message.error('审核失败')
                }
            },
            // 获取需审核的视频列表
            async getCheckVideoList(){
                const params ={
                    params: {
                        pageSize: this.pageSize,
                        pageNum: this.pageNum
                    }
                }
                let res =await this.axios.get('/video/checkVideoList',params)
                if(res.data.code === 1){
                    this.videoList = [...res.data.data]
                    this.totalRecords = res.data.totalRecords
                    this.currentPage = res.data.pageNum
                    this.defaultPoster = require('../../assets/default.jpg')
                } else {
                    this.$message.error('请求审核视频列表失败')
                }
            },
        }
    }
</script>
<style lang="scss" scoped>
    #videoCheck {
        .checkvideoList {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            flex-wrap: wrap;
            .video-box {
                position: relative;
                .title-info {
                    background-color: rgba(255,255,255,0.75);
                    position: absolute;
                    bottom: 10px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: 100%;
                    z-index: 2;
                    cursor: pointer;
                }
            }
            li {
                list-style: none;
                width: 20%;
                padding: 20px;
                img {
                    width: 100%;
                    height: 146px;
                    border-radius: 5px;
                    &:hover {
                        cursor: pointer;
                        transform: scale(1.05);
                        box-shadow: 0 0 10px #2c3e50;
                    }
                }
                p {
                    margin: 0px;
                    span {
                        cursor: pointer;
                        &:hover {
                            color: #409EFF;
                        }
                    }
                }
            }
        }
        .footer {
            padding: 20px 0;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
        }
    }
</style>