<template>
    <div id="my-video">
        <el-row class="tac">
            <el-col :span="4">
                <el-menu
                        default-active="1"
                        class="el-menu-vertical-demo">
                    <router-link to="/ownvideo">      <el-menu-item index="1">
                        <i class="el-icon-menu"></i><span slot="title">我的视频</span>
                        </el-menu-item></router-link>
                    <router-link to="/uploadvideo">    <el-menu-item index="2">
                        <i class="el-icon-upload"></i>
                        <span slot="title">视频上传</span>
                    </el-menu-item></router-link>
                </el-menu>
            </el-col>
            <el-col :span="20">
                <router-view/>
            </el-col>
        </el-row>
    </div>

</template>
<script>
    export default {
        data () {
            return {
            }
        },
        created(){
        },
        methods: {
            handleOpen(key, keyPath) {
                window.console.log(key, keyPath);
            },
            handleClose(key, keyPath) {
                window.console.log(key, keyPath);
            }
        }
    }
</script>
<style lang="scss" scoped>
#my-video {
    min-height: 800px;
    .tac {
        height: 100%;
    }
}
</style>