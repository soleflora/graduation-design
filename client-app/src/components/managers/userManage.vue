<template>
    <div id="userManage">
        <el-table
                :data="tableData"
                stripe
                style="width: 100%">
            <el-table-column
                    type="index"
                    :index="firstIndex"
                    label="序号">
            </el-table-column>
            <el-table-column
                    align="center"
                    prop="username"
                    label="用户名"
                    width="180">
            </el-table-column>
            <el-table-column
                    align="center"
                    prop="authorization"
                    label="权限">
            </el-table-column>
            <el-table-column
                    label="操作"
                    align="right">
                <template slot="header" slot-scope="scope">
                    <el-input
                            clearable
                            @keydown.enter.native="searchUser"
                            style="width: 250px"
                            v-model="search"
                            size="mini"
                            placeholder="输入关键字搜索"/>
                </template>
                <template slot-scope="scope">
                    <el-button
                            size="mini"
                            @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="修改" :visible.sync="dialogFormVisible">
            <el-form :model="form" ref="form">
                <el-form-item label="权限配置" label-width="100px">
                    <el-select v-model="form.power" placeholder="请选择需要配置的权限">
                        <el-option label="普通用户" value="common"></el-option>
                        <el-option label="系统管理员" value="system"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelSubmit">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
        </el-dialog>
        <div class="footer">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[1, 2, 5, 30]"
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
                pageSize: 5, // 每一页大小
                pageNum: 1, // 页码
                form: {
                    name: '',
                    power:''
                },
                dialogFormVisible:false,
                // 搜索词
                search: '',
                // 序号索引
                firstIndex: 1,
                // 表格数据
                tableData: []
            }
        },
        created(){
          this.getUserList()
        },
        methods: {
            // 分页
            handleSizeChange(val) {
                console.log('页面大小');
                this.pageSize = val
                this.pageNum = 1
                this.getUserList()
            },
            handleCurrentChange(val) {
                console.log('页码');
                this.pageNum = val
                this.getUserList()
            },
            // 提交编辑
            async submitForm () {
                if (!this.form.power) {
                    this.$message.error('请选择配置项')
                    return false
                }
                const params = {
                    username: this.form.name,
                    power: this.form.power
                }
                let res = await this.axios.post('/manager/userList/updateUser', params)
                if(res.data.code === 1){
                    this.dialogFormVisible = false
                    this.getUserList()
                    this.$message.success('修改成功')
                } else {
                    this.dialogFormVisible = false
                    this.$message.error('修改失败')
                }
            },
            // 取消编辑
            cancelSubmit (){
                this.dialogFormVisible = false
                this.$refs.form.resetFields()
            },
            // 搜索
            searchUser() {
              this.getUserList(this.search,1)
            },
            // 获取用户列表
            async getUserList(name,page){
                const params = {
                    params:{
                        username: name,
                        pageSize: this.pageSize,
                        pageNum: page ? page : this.pageNum
                    }
                }
                let res =await this.axios.get('/manager/userList', params)
                if(res.data.code === 1){
                    this.tableData = [...res.data.data]
                    this.totalRecords = res.data.totalRecords
                    this.currentPage = res.data.pageNum
                } else {
                    this.$message.error('请求用户列表失败')
                }
            },
            // 编辑
            handleEdit(index, row) {
                this.form.power = ''
                this.form.name = row.username
                this.dialogFormVisible = true
            },
            // 删除
            async handleDelete(index, row) {
                this.$confirm('此操作将永久删除用户：' + row.username+ '，是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let res = await this.axios.post('/manager/deleteUser',row)
                    if(res.data.code === 1){
                        this.$message.success('删除成功')
                        this.getUserList()
                    } else {
                        this.$message.error('删除失败')
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });

            }
        }
    }
</script>
<style lang="scss" scoped>
    #userManage {
            .el-table th div {
                padding: 0px;
            }
        .footer {
            padding: 20px 0;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
        }
    }
</style>