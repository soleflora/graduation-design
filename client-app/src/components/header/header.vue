<template>
    <div id="header">
        <div class="logo-pic">
            <img class="logo" src="../../assets/mylogo.png">
        </div>
        <el-input v-if="show" placeholder="搜点有趣的..." v-model="searchKey" class="input-with-select" @keydown.enter.native="toMore">
            <el-button slot="append" icon="el-icon-search" @click="toMore"></el-button>
        </el-input>
        <div v-if="!userImage" class="head-pic" @click="login">
            <el-button type="text">登录/注册</el-button>
        </div>
        <div class="image-box" v-if="userImage">
            <img class="userphoto" v-bind:src="userImage" alt="头像走丢了..." @click.stop="toManage">
        </div>

    </div>
</template>

<script>
    export default {
        props: {
            userImage: String,
            show: Boolean
        },
        data() {
            return {
                searchKey: ''
            };
        },

        computed: {},

        methods: {
            // 打开更多页面
            toMore() {
                let routeUrl = this.$router.resolve({
                    path: "/more",
                    query: {
                        type: 'search',
                        info: this.searchKey,
                    }
                })
                window.open(routeUrl.href, '_blank');
            },
            login() {
                this.$router.push("/login");
            },
            toManage() {
                this.$router.push("/ownvideo");
            },
            inImage() {
                window.console.log('进入')
            },
            outImage() {
                window.console.log('离开')
            }
        }
    };
</script>
<style lang="scss" scoped>
    #header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .logo-pic {
            width: 6%;
            height: 6%;
            margin: auto 0;
            .logo {
                width: 100%;
                height: 100%;
            }
        }
        .input-with-select {
            width: 30%;
            background-color: #fff;
            margin: auto 0;
        }
        .head-pic {
            width: 4rem;
            height: 4rem;
            border-radius: 2rem;
            border: 1px solid #409eff;
            line-height: 4rem;
            /*overflow: hidden;*/
        }
        .image-box {
            position: relative;
            .manager-menus {
                position: absolute;
                width: 80%;
                left: 10%;
                top: 70%;
                z-index: 2;
                background: #475669;
                opacity: 0.8;
                color: #fff;
            }
        }
        .userphoto {
            cursor: pointer;
            max-width: 4rem;
            max-height: 4rem;
            width: 4rem;
            height: 4rem;
            border-radius: 2rem;
            line-height: 4rem;
            overflow: hidden;
        }
    }
</style>