<template>
    <div id="upload-video">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="50px" class="demo-ruleForm">
            <el-form-item label="标题" prop="title">
                <el-input v-model="ruleForm.title"  clearable placeholder="给视频起个名吧"></el-input>
            </el-form-item>
            <el-form-item prop="tagSelected">
                <div class="tag-box">
                    <div class="tag-list">
                        <p>添加标签</p>
                        <ul>
                            <li v-for="item in tagList" :key="item"><el-tag style="cursor: pointer" @click="addTag(item)">+{{item}}</el-tag></li>
                        </ul>
                    </div>
                    <div class="tag-selected">
                        <p>已有标签</p>
                        <ul>
                            <li v-for="item in ruleForm.tagSelected" :key="item"><el-tag closable  @close="removeTag(item)">{{item}}</el-tag></li>
                        </ul>
                    </div>
                </div>

            </el-form-item>
        </el-form>
        <el-progress class="progress" :text-inside="true" :stroke-width="18" :percentage="percent"></el-progress>
        <el-upload
                :file-list="videoFileList"
                ref="upload"
                name="video"
                class="upload-demo"
                drag
                action="http://localhost:3000/imageUpload"
                :on-progress="onLoading"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">不能超过200M</div>
        </el-upload>
        <el-upload
                webkitdirectory
                name="image"
                :before-upload="beforePoster"
                :on-exceed="overLimit"
                :limit="limitNum"
                class="upload-demo"
                action="http://localhost:3000/imageUpload"
                :on-remove="handleRemove"
                :on-success="posterSucess"
                :file-list="posterList"
                list-type="picture">
            <el-button size="small" type="primary" >点击上传封面</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
        </el-upload>
        <el-button v-if="isLoading" type="primary" @click="loadVideo">上传视频</el-button>
        <el-button v-else type="danger" @click="stopVideo">取消上传</el-button>
        <div>
            <video id="videos" :src="capVideoUrl" v-show="false"></video>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
          return {
              tagList: ['生活', '科技', '风景', '娱乐'],
              ruleForm: {
                  title: '',
                  tagSelected: [],
              },
              rules: {
                title: [{ max: 50, message: '长度请保持在 50 个字符以内', trigger: 'blur' }],
                tagSelected: []
              },
              limitNum: 1, // 允许上传的封面数量
              videoFileList: [], // 视频文件列表
              posterList: [], // 封面文件列表
              posterUrl: '', // 封面地址
              videoUrl: '', // 视频地址
              capVideoUrl: '', // 截图视频地址
              isLoading: true, // 上传状态
              percent: 0 // 上传进度
          }
        },
        methods: {
            // 移除标签
            removeTag (item) {
                this.ruleForm.tagSelected.splice(this.ruleForm.tagSelected.indexOf(item),1)
                this.tagList.push(item)
            },
            // 添加标签
            addTag (item) {
              this.tagList.splice(this.tagList.indexOf(item),1)
              this.ruleForm.tagSelected.push(item)
            },
            // base64 转化file
            dataURLtoFile(dataurl, filename) {
                let arr = dataurl.split(',');
                let mime = arr[0].match(/:(.*?);/)[1];
                let bstr = atob(arr[1]), n = bstr.length;
                let u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, {type: mime});
            },
            // 截取视频帧用于封面
            async screenShot () {
                let scale = 0.3;
                let video = document.getElementById("videos");

                let canvas = document.createElement("canvas");
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                // 将绘制的base64赋给封面
                let base64Str = canvas.toDataURL("image/png");
                // 将截图生成的封面上传
                const file = this.dataURLtoFile(base64Str, 'poster.png')
                const formData = new FormData();
                formData.append('image', file);
                let res = await this.axios.post('/imageUpload', formData)
                this.posterUrl = res.data.imageUrl
            },
            // 封面上传成功
            posterSucess (response) {
                this.posterUrl = response.imageUrl
            },
            // 封面上传前
            beforePoster (file) {
                const isJPG = file.type === "image/jpeg" || file.type === "image/png" ;
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isJPG) {
                    this.$message.error("封面图片只能是 JPG/PNG 格式!");
                } else if (!isLt2M) {
                    this.$message.error("封面图片大小不能超过 2MB!");
                }
                return isJPG && isLt2M;
            },
            // 超出允许上传数量时钩子
            overLimit () {
                this.$message.error('最多上传一张封面，请先删除已上传封面')
            },
            // 移除文件时的钩子
            handleRemove() {
                this.posterUrl = ''
            },
            // 保存视频上传信息
            loadVideo(){
                this.$refs.ruleForm.validate(async (valid)=>{
                    if(valid) {
                        if(!this.ruleForm.title) {
                            this.$message.error('请为视频起个名吧')
                            return
                        }
                        if(this.ruleForm.tagSelected.length === 0){
                            this.$message.error('请至少选择一个标签')
                            return
                        }
                        if(!this.videoUrl) {
                            this.$message.error('请先选择视频文件')
                            return
                        }
                        if (!this.posterUrl) {
                            await this.screenShot()
                        }
                        const params = {
                            username: sessionStorage.getItem('userInfo'),
                            title: this.ruleForm.title,
                            videoUrl: this.videoUrl,
                            poster: this.posterUrl,
                            tags: this.ruleForm.tagSelected
                        }
                        await this.axios.post('/videoSave', params).then(res => {
                            if (res.data.code !== 1) {
                                this.$message.error(res.data.msg)
                            } else {
                                this.$message.success(res.data.msg)
                                this.videoUrl = ''
                                this.percent = 0
                                this.videoFileList = []
                                this.posterList = []
                                this.tagList = ['生活', '科技', '风景', '娱乐']
                                this.$refs.ruleForm.resetFields()
                            }
                        })
                    }
                })

            },
            // 取消上传
            stopVideo() {
                this.$refs.upload.abort()
                this.isLoading = true
                this.percent = 0
            },
            // 上传进度
            onLoading(event) {
                this.percent = parseInt(event.percent)
                this.isLoading = false
            },
            // 上传成功后的回调
            handleAvatarSuccess(res,file) {
                this.videoUrl = res.videoUrl;
                // 得到绘制截图的视频源
                this.capVideoUrl = URL.createObjectURL(file.raw);
                this.isLoading = true
            },
            // 上传前的回调
            beforeAvatarUpload(file) {
                const arr = [
                    "video/mp4",
                    "video/ogg",
                    "video/flv",
                    "video/avi",
                    "video/wmv",
                    "video/rmvb"
                ]
                if (arr.indexOf(file.type) === -1) {
                    this.$message.error("请上传正确的视频格式");
                    return false;
                }
                const rightSize = file.size / 1024 / 1024 < 200;
                if(!rightSize) {
                    this.$message.error('上传视频不能超过200M')
                }
                return rightSize
            }
        }
    }
</script>
<style lang="scss" scoped>
#upload-video {
    ul{
        padding: 0;
        list-style: none;
    }
    .tag-box {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        .tag-list {
            width: 60px;
        }
        .tag-selected {
            width: 60px;
        }
    }
    .demo-ruleForm {
        width: 80%;
        margin: 0 auto;
    }
    .progress {
        width: 70%;
        margin: 10px auto;
    }
    .upload-demo {
        margin: 20px;
    }
}
</style>