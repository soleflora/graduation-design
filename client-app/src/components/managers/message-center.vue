<template>
    <div id="message--center">
        <h1>消息列表</h1>
        <ul>
            <li v-for="item in msgData">
                <p class="title"><span>系统公告</span><span>{{item.createdTime}}</span></p>
                <p class="content"><span v-html="item.content"></span></p>
            </li>
        </ul>
        <div class="footer">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="childPagination.currentPage"
                    :page-sizes="[10, 20, 30, 50]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="childPagination.totalRecords">
            </el-pagination>
        </div>
    </div>
</template>
<script>
    export default {
        props:['msgData','childPagination'],
        data () {
            return {
                totalRecords: 0, // 总记录数
                currentPage: 1, // 当前页码
                pageSize: 10, // 每一页大小
                pageNum: 1, // 页码
            }
        },
        methods: {
            // 分页
            handleSizeChange(val) {
                this.$emit('changeSize',val)
            },
            handleCurrentChange(val) {
                this.$emit('changeNum',val)
            }
        }
    }
</script>
<style lang="scss" scoped>
#message--center {
    ul{
        list-style: none;
        li {
            background-color: #DCDFE6;
            margin: 2rem 0;
            .title {
                text-align: left;
                span {
                    margin-right: 20px;
                }
            }
            .content {
                text-align: left;
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