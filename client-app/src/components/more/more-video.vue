<template>
    <div id="more-video">
        <h1 v-if="type === 'search'">搜索结果如下...</h1>
        <h1 v-else>{{keyword}}类</h1>
        <ul class="moreVideoList">
            <li v-for="(item,index) in dataList" :key="index">
                <div class="video-box">
                    <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                        <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                    </el-tooltip>
                    <img @click="toPlay(item)" :src="item.poster ? 'http://localhost:3000/images/' + item.poster : defaultPoster" alt="">
                </div>
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
                type: '',
                keyword: '',
                dataList: []
            }
        },
        created(){
            this.type = this.$route.query.type
            this.keyword = this.$route.query.info
            this.getMoreList()
        },
        methods: {
            // 分页
            handleSizeChange(val) {
                this.pageSize = val
                this.pageNum = 1
                this.getMoreList()
            },
            handleCurrentChange(val) {
                this.pageNum = val
                this.getMoreList()
            },
            // 获取列表
            async getMoreList(){
                const params = {
                    params: {
                        type: this.type,
                        keyWord: this.keyword,
                        pageSize: this.pageSize,
                        pageNum: this.pageNum
                    }
                }
                let res = await this.axios.get('/more/moreList', params)
                if(res.data.code === 1) {
                    this.dataList = [...res.data.data]
                    this.totalRecords = res.data.totalRecords
                    this.currentPage = res.data.pageNum
                } else {
                    this.$message.error('请求数据失败')
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
#more-video {
    background-color: #f7f7f7;
    border-radius: 3%;
    .moreVideoList {
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