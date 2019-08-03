<template>
    <div id="notice-center">
        <h1>公告编辑及发布</h1>
        <mavon-editor v-model="value"  @change="changeData" />
        <div class="footer">
            <el-button type="primary" @click="pushNotice">发布公告</el-button>
        </div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                value: '',
                htmlValue: ''
            }
        },
        methods: {
            // 编辑内容改变时
            changeData (value, render) {
                this.htmlValue = render
            },
            pushNotice () {
                this.$confirm('请问是否要发布公告?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(async () => {
                    const params = {
                        content: this.htmlValue,
                        target: 'common'
                    }
                    let res = await this.axios.post('/notices/pushNotices',params)
                    if (res.data.code === 1) {
                        this.value = ''
                        this.htmlValue = ''
                        this.$message({
                            type: 'success',
                            message: '发布成功!'
                        })
                    } else {
                        this.$message({
                            type: 'error',
                            message: res.data.msg
                        })
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消发布'
                    });
                });
            }
        }
    }
</script>
<style lang="scss" scoped>
#notice-center{
    .footer {
        padding: 10px;
    }
}
</style>