<template>
    <div id="my-video">
        <h1 v-if="noVideo">没有发现视频，快去上传吧</h1>
        <ul class="myvideoList">
            <li  v-for="(item,index) in videoList" :key="index">
                <div class="video-box">
                    <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                    <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                    </el-tooltip>
                    <img @click="toPlay(item)" :src="item.poster ? 'http://localhost:3000/images/' + item.poster : defaultPoster" alt="">
                </div>
                <p style="text-align: left"><span v-if="item.pass" style="color: #67C23A;">已通过审核</span>
                    <span v-else style="color: #F56C6C;">暂未审核</span>
                    <span style="float: right;" @click="deleteVideo(item)">删除</span>
                </p>
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
        data () {
            return {
                totalRecords: 0, // 总记录数
                currentPage: 1, // 当前页码
                pageSize: 10, // 每一页大小
                pageNum: 1, // 页码
                noVideo: false, // 是否有已上传视频
                defaultPoster: '', // 封面地址为空时的默认封面
                videoList: [] // 视频列表
            }
        },
        created(){
            this.getMyvideo()
        },
        methods: {
            // 分页
            handleSizeChange(val) {
                this.pageSize = val
                this.pageNum = 1
                this.getMyvideo()
            },
            handleCurrentChange(val) {
                this.pageNum = val
                this.getMyvideo()
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
            // 删除视频
            async deleteVideo (item) {
                const params = {
                    videoId: item._id
                }
                this.$confirm('此操作将永久删除该视频, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let res = await this.axios.post('/video/deleteMyvideo',params)
                    if(res.data.code === 1) {
                        this.$message.success('删除成功')
                        this.getMyvideo()
                    } else {
                        this.$message.error('删除失败')
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 获取我的视频列表
            async getMyvideo () {
                const params = {
                    params: {
                        username: sessionStorage.getItem('userInfo'),
                        pageSize: this.pageSize,
                        pageNum: this.pageNum
                    }
                }
                let res = await this.axios.get('/video/getMyvideoList',params)
                if(res.data.code === 1) {
                    if (res.data.data.length > 0){
                        this.videoList = [...res.data.data]
                        this.totalRecords = res.data.totalRecords
                        this.currentPage = res.data.pageNum
                        this.defaultPoster = require('../../assets/defaultPoster.png')
                    } else {
                        this.noVideo = true
                    }

                }else {
                    this.$message.error('获取我的视频列表失败')
                }
            },
        }
    }
</script>
<style lang="scss" scoped>
#my-video {
    .myvideoList {
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