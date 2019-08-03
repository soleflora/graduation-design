<!-- 注册页面 -->
<template>
  <div id="register-box">
    <h1>Welcome to register...</h1>
    <div class="form-box">
      <el-form ref="registerForm" :model="registerForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="uname">
          <el-input v-model="registerForm.uname" size="small"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input v-model="registerForm.pwd" size="small" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="conPwd">
          <el-input v-model="registerForm.conPwd" size="small" type="password"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="captcha">
          <div class="mix">
            <el-input v-model="registerForm.captcha" size="small"></el-input>
            <img src="http://localhost:3000/getCaptcha" alt="" @click="getCaptcha" ref="imgCaptcha">
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('registerForm')">注册</el-button>
          <el-button type="primary" @click="resetForm('registerForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import router from "../../router";

export default {
  data() {
    let validatePwd = (rule, value, callback) => {
      if (this.registerForm.conPwd !== "") {
        this.$refs.registerForm.validateField("conPwd");
      }
      callback();
    };
    let confirmPwd = (rule, value, callback) => {
      if (value !== this.registerForm.pwd) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      registerForm: {
        uname: "",
        pwd: "",
        conPwd: "",
          captcha: ''
      },
      rules: {
        uname: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: ["change", "blur"]
          }
        ],
        pwd: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 4, message: "4个字符或以上", trigger: ["change", "blur"] },
          { validator: validatePwd, trigger: "blur" }
        ],
        conPwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { min: 4, message: "4个字符或以上", trigger: ["change", "blur"] },
          { validator: confirmPwd, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
      getCaptcha() {
          this.$refs.imgCaptcha.src = "http://localhost:3000/getCaptcha?d=" + Math.random();
      },
    submitForm(formName) {
      const params = {
        username: this.registerForm.uname,
        password: this.registerForm.pwd,
          captcha: this.registerForm.captcha
      };
      this.$refs[formName].validate(valid=> {
        if (valid) {
        this.axios.post("/register", params).then(res=>{
            if(res.data.code === 2 || res.data.code === -1 || res.data.code === -3){
                this.$message({
                    showClose: true,
                    message: res.data.msg,
                    type: "error"
                });
            } else {
                this.$message({
                    showClose: true,
                    message: res.data.msg,
                    type: "success"
                });
                setTimeout(function () {
                    router.push('/login');
                },2000)
            }
        });
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>
<style lang="scss" scoped>
#register-box {
  width: 30%;
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
#register-box h1 {
  color: #409eff;
}
</style>