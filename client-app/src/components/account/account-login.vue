<!-- 登录页面 -->
<template>
    <div id="login-box">
        <h1>Welcome to login...</h1>
        <div class="form-box">
            <el-form ref="userform" :model="userform" :rules="rules" label-width="80px">
                <el-form-item label="用户名" prop="uname">
                    <el-input v-model="userform.uname" size="small"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="pwd">
                    <el-input v-model="userform.pwd" size="small" type="password"></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="captcha">
                    <div class="mix">
                        <el-input v-model="userform.captcha" size="small" @keydown.enter.native="toLogin"></el-input>
                        <img src="http://localhost:3000/getCaptcha" alt="" @click="getCaptcha" ref="imgCaptcha">
                    </div>

                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm('userform')">登录</el-button>
                    <el-button type="primary" @click="register">注册</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                userform: {
                    uname: "",
                    pwd: "",
                    captcha: ''
                },
                rules: {
                    uname: [
                        {required: true, message: "请输入用户名", trigger: "blur"},
                        {
                            min: 3,
                            max: 10,
                            message: "长度在 3 到 10 个字符",
                            trigger: ["change", "blur"]
                        }
                    ],
                    pwd: [
                        {required: true, message: "请输入密码", trigger: "blur"},
                        {min: 4, message: "4个字符或以上", trigger: ["change", "blur"]}
                    ]
                }
            };
        },
        mounted(){
          this.getCaptcha();
        },
        methods: {
            // 回车登录
            toLogin() {
              this.submitForm('userform')
            },
            // 点击获取验证码
            getCaptcha() {
                this.$refs.imgCaptcha.src = "http://localhost:3000/getCaptcha?d=" + Math.random();
            },
            // 点击登录
            submitForm(formName) {
                const params = {
                    username: this.userform.uname,
                    password: this.userform.pwd,
                    captcha: this.userform.captcha
                };
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        this.axios.post("/login", params).then(res => {
                            if (res.data.code === 1) {
                                sessionStorage.setItem('userInfo', res.data.username);
                                sessionStorage.setItem('token', res.data.token);
                                sessionStorage.setItem('userImage', res.data.imageUrl);
                                sessionStorage.setItem('power', res.data.power);
                                this.$router.replace("/");
                            } else if (res.data.code === 2) {
                                this.$message({
                                    showClose: true,
                                    message: "用户名或密码错误",
                                    type: "error"
                                });
                            } else if (res.data.code === -2) {
                                this.$message({
                                    showClose: true,
                                    message: "该账户不存在",
                                    type: "error"
                                });

                            } else if (res.data.code === -1) {
                                this.$message({
                                    showClose: true,
                                    message: "验证码错误",
                                    type: "error"
                                });
                                this.getCaptcha();
                            } else {
                                this.$message.error(res.data.msg)
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },
            register() {
                this.$router.push("/register");
            }
        }
    };
</script>
<style lang="scss" scoped>
    #login-box {
        width: 25%;
        margin: 0 auto;
        .form-box {
            .mix {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                img {
                    height: 32px;
                }
            }
        }
    }

    #login-box h1 {
        color: #409eff;
    }
</style>