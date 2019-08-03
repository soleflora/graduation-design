<template>
    <div class="home">
        <el-container>
            <el-header>
                <header-app :userImage="userImage" :show="true"></header-app>
            </el-header>
            <el-main>
                <rotation-chart/>
                <main-content/>
            </el-main>
            <el-footer>
                <div class="footer">
                    <p>愿你所见，皆是美好</p>
                    <p>Watching is funny</p>
                    <p>--by todo</p>
                </div>
            </el-footer>
        </el-container>
    </div>
</template>

<script>
    // @ is an alias to /src
    import headerApp from "@/components/header/header.vue";
    import rotationChart from "@/components/contents/rotation-chart.vue";
    import mainContent from "@/components/contents/main-content.vue";

    export default {
        name: "home",
        data() {
            return {
                userImage: '',
            }
        },
        components: {
            headerApp,
            rotationChart,
            mainContent
        },
        mounted: function () {
            // 从session中取出用户的token和头像url
            const token = sessionStorage.getItem("token");
            const userImage = 'http://localhost:3000/images/' +  sessionStorage.getItem("userImage");
            if (token) {
                const params = {
                    Authorization: token
                };
                this.axios.post("/checkUser", params).then(res => {
                    if (res.data.status === 'loginIn') {
                        this.userImage = userImage ? userImage : require('../assets/default.jpg');
                    }
                });
            }
        }
    };
</script>

<style lang="scss" scoped>
    .home {
        .el-footer {
            height: auto!important;
            .footer {
                padding: 1rem 0;
                background: #dcdfe6;
            }
        }
    }
</style>

