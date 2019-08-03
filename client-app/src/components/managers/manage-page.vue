<!-- 后台管理页面 -->
<template>
    <div>
        <el-container>
            <el-header>
                <div class="header-box">
                    <div class="logo-pic">
                        <router-link to="/"><img class="logo" src="../../assets/mylogo.png"></router-link>
                    </div>
                    <div class="user-image">
                        <img class="user" :src="userImage">
                    </div>
                    <el-dropdown trigger="click" @command="changeSettig">
      <span class="el-dropdown-link">
        账号管理<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item icon="el-icon-plus" command="changeAccount">切换账号</el-dropdown-item>
                            <el-dropdown-item icon="el-icon-circle-plus" command="exitAccount">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </el-header>
            <el-main>
                <el-tabs type="border-card" @tab-click="switchTabs" ref="parentNode">
                    <el-tab-pane>
                        <span slot="label">我的视频</span>
                        <my-video/>
                    </el-tab-pane>
                    <el-tab-pane>
            <span slot="label" >消息中心
              <el-badge :value="msg" :max="10" ></el-badge>
            </span>
                        <message-center :msgData="msgData" :childPagination="childPagination" @changeSize="sizeChanged" @changeNum="numChanged"></message-center>
                    </el-tab-pane>
                    <el-tab-pane label="个人中心">
                        <el-switch v-model="addImage" active-text="添加头像"></el-switch>
                        <div class="imageBox" v-if="addImage">
                            <el-upload
                                    class="avatar-uploader"
                                    action="http://localhost:3000/imageUpload"
                                    :show-file-list="false"
                                    :on-success="handleAvatarSuccess"
                                    :before-upload="beforeAvatarUpload"
                                    name="image"
                            >
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                            <el-button :loading="loadImage" class="saveBtn" @click="saveImage">保存头像</el-button>
                        </div>
                        <div class="infoBox">
                            <el-form ref="updatedForm" :model="updatedForm" :rules="rules" label-width="80px">
                                <el-form-item label="新密码" prop="pwd">
                                    <el-input v-model="updatedForm.pwd" size="small" type="password"></el-input>
                                </el-form-item>
                                <el-form-item label="确认密码" prop="conPwd">
                                    <el-input v-model="updatedForm.conPwd" size="small" type="password"></el-input>
                                </el-form-item>
                                <el-button type="primary" class="btnRange" @click="submitForm('updatedForm')">提交</el-button>
                                <el-button type="primary" class="btnRange" @click="resetForm('updatedForm')">重置</el-button>
                            </el-form>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane v-if="showPower">
                        <span slot="label">视频审核</span>
                        <video-check/>
                    </el-tab-pane>
                    <el-tab-pane>
                        <span slot="label" v-if="showPower">用户管理</span>
                        <h1>用户列表</h1>
                        <user-manage/>
                    </el-tab-pane>
                    <el-tab-pane>
                        <span slot="label" v-if="showPower">发布公告</span>
                        <notice-center></notice-center>
                    </el-tab-pane>
                </el-tabs>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import myVideo from "@/components/managers/my-video.vue";
    import userManage from "@/components/managers/userManage.vue";
    import videoCheck from "@/components/managers/video-check.vue";
    import noticeCenter from "@/components/managers/noticeCenter.vue";
    import messageCenter from "@/components/managers/message-center.vue";
    export default {
        components: {
            myVideo,
            userManage,
            videoCheck,
            noticeCenter,
            messageCenter
        },
        data() {
            let validatePwd = (rule, value, callback) => {
                if (this.updatedForm.conPwd !== "") {
                    this.$refs.updatedForm.validateField("conPwd");
                }
                callback();
            };
            let confirmPwd = (rule, value, callback) => {
                if (value !== this.updatedForm.pwd) {
                    callback(new Error("两次输入密码不一致!"));
                } else {
                    callback();
                }
            };
            return {
                totalRecords: 0, // 总记录数
                currentPage: 1, // 当前页码
                pageSize: 10, // 每一页大小
                pageNum: 1, // 页码
                msgData:{}, // 传给子组件的数据
                childPagination: {}, // 传给子组件的页码信息
                // 根据权限是否显示菜单
                showPower:false,
                userImage: '',
                msg: "",
                imageUrl: "", //  用作选择图片后显示
                imageName: '', // 保存时提交这个字段
                addImage: false,
                loadImage: false,
                updatedForm: {
                    pwd: '',
                    conPwd: ''
                },
                rules: {
                    pwd: [
                        {required: true, message: "请输入新密码", trigger: "blur"},
                        {min: 4, message: "4个字符或以上", trigger: ["change", "blur"]},
                        {validator: validatePwd, trigger: "blur"}
                    ],
                    conPwd: [
                        {required: true, message: "请再次输入密码", trigger: "blur"},
                        {min: 4, message: "4个字符或以上", trigger: ["change", "blur"]},
                        {validator: confirmPwd, trigger: "blur"}
                    ]
                }
            };
        },
        created(){
          this.showMenus()
        },
        mounted() {
            this.showMenus()
            const userImageUrl = 'http://localhost:3000/images/' + sessionStorage.getItem('userImage');
            this.userImage = userImageUrl ? userImageUrl : require("../../assets/default.jpg");
            this.queryMessage()
        },
        watch: {
            addImage(newVal) {
                if (newVal) {
                    this.imageUrl = '';
                    this.loadImage = false;
                }
            }
        },
        methods: {
            // 消息中心改变分页大小
            sizeChanged(val){
                this.pageSize = val
                this.pageNum = 1
                this.queryMessage()
            },
            // 消息中心改变了页码
            numChanged(val){
                this.pageNum = val
                this.queryMessage()
            },
            // 查询未读消息
            async queryMessage() {
                const params = {
                    params:{
                        username: sessionStorage.getItem('userInfo'),
                        pageSize: this.pageSize,
                        pageNum: this.pageNum
                    }
                }
                let res = await this.axios.get('/notices/checkStatus',params)
                if (res.data.code === 1) {
                    let data = [...res.data.data]
                    this.totalRecords = res.data.totalRecords
                    this.currentPage = res.data.pageNum
                    let count = 0;
                    // 获取未读消息的数量
                    data.map((item)=>{
                        if(!item.readStatus){
                            count++
                        }
                    })
                    this.msg = count === 0 ? '' : count
                    this.msgData = {...res.data.data}
                    this.childPagination.totalRecords = this.totalRecords
                    this.childPagination.currentPage = this.currentPage
                    // this.$children[0].$children[1].$children[0].$children[0].$forceUpdate()
                    this.$refs.parentNode.$children[0].$forceUpdate()
                } else {
                    this.$message.error(res.msg)
                }
            },
            // 根据权限是否显示菜单
            showMenus(){
                let flag = sessionStorage.getItem('power')
                this.showPower = flag === 'system' ? true : false
            },
            //  账号管理处理
            changeSettig(command){
              if(command === 'changeAccount'){
                  sessionStorage.clear();
                  this.$router.replace("/login");
              } else  if(command === 'exitAccount'){
                  sessionStorage.clear();
                  this.$router.replace("/");
              }
            },

            // 修改个人资料--密码
            submitForm(formName) {
                const params = {
                    username: sessionStorage.getItem('userInfo'),
                    pwd: this.updatedForm.pwd
                };
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        this.axios.post('/infoUpdate', params).then(res => {
                            if (res.data.success) {
                                this.$message({
                                    showClose: true,
                                    message: res.data.msg,
                                    type: "success"
                                });
                                [this.updatedForm.pwd, this.updatedForm.conPwd] = ['', ''];
                            } else {
                                this.$message({
                                    showClose: true,
                                    message: "修改失败",
                                    type: "error"
                                })
                            }
                        }).catch(err => {
                            window.console.log(err);
                        })
                    }
                })
            },
            // 重置表单
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            // 修改用户头像
            saveImage() {
                if (!this.imageUrl) {
                    this.$message({
                        showClose: true,
                        message: "请上传头像",
                        type: "error"
                    })
                    return;
                }
                const params = {
                    username: sessionStorage.getItem('userInfo'),
                    userImage: this.imageName
                };
                this.loadImage = true;
                this.axios.post('/infoUpdate', params).then(res => {
                    sessionStorage.setItem('userImage', res.data.imageUrl);
                    setTimeout(() => {
                        this.loadImage = false;
                        this.userImage = 'http://localhost:3000/images/' + res.data.imageUrl;
                        this.addImage = false;
                    }, 1000)
                }).catch(err => {
                    window.console.log(err);
                })
            },
            // 切换tabs的钩子
            async switchTabs(e) {
                this.addImage = false;
                if (e.index === "1" && this.msg !== '') {
                    const params = {
                        username: sessionStorage.getItem('userInfo')
                    }
                    let res = await this.axios.post('/notices/changeStatus', params)
                    if(res.data.code === 1){
                        this.msg = "";
                        this.$refs.parentNode.$children[0].$forceUpdate()
                    }
                }
            },
            // 上传成功后的回调
            handleAvatarSuccess(res, file) {
                window.console.log(file);
                // this.imageUrl = URL.createObjectURL(file.raw)
                this.imageUrl = "http://localhost:3000/images/" + res.imageUrl
                this.imageName = res.imageUrl
            },
            // 上传前的回调
            beforeAvatarUpload(file) {
                const isJPG = file.type === "image/jpeg";
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isJPG) {
                    this.$message.error("上传头像图片只能是 JPG 格式!");
                }
                if (!isLt2M) {
                    this.$message.error("上传头像图片大小不能超过 2MB!");
                }
                return isJPG && isLt2M;
            }
        }
    };
</script>
<style lang="scss" scoped>
    .el-dropdown-link {
        cursor: pointer;
        color: #409EFF;
        line-height: 5;
    }

    .el-icon-arrow-down {
        font-size: 12px;
    }

    .header-box {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1px solid #2c3e50;
    }

    .logo-pic {
        width: 6%;
        height: 6%;
        margin: auto 0;
        .logo {
            width: 100%;
            height: 100%;
        }
    }

    .user-image {
        .user {
            max-width: 4rem;
            max-height: 4rem;
            width: 4rem;
            height: 4rem;
            border-radius: 2rem;
        }
    }

    .infoBox {
        width: 25%;
        margin: 0 auto;
        .btnRange {
            margin: 0 1.5rem;
        }
    }

    .imageBox {
        margin: 0 auto;
        width: 178px;
        padding: 1rem 0;
        .saveBtn {
            margin-top: 1rem;
        }
        .avatar-uploader {
            width: 176px;
            height: 176px;
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        .avatar-uploader:hover {
            border-color: #409eff;
        }
        .avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            line-height: 178px;
            text-align: center;
        }
        .avatar {
            max-width: 178px;
            max-height: 178px;
            width: 178px;
            height: 178px;
            display: block;
            overflow: hidden;
            border-radius: 6px;
        }
    }
</style>