<!-- 轮播图 -->
<template>
  <div id="rotation">
    <el-carousel :interval="3000" type="card" height="300px">
      <el-carousel-item v-for="(item,index) in videoList" :key="index">
          <div class="video-box">
          <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
              <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
          </el-tooltip>
        <img :src="item.posterStr" alt="加载失败" @click="toPlay(item)">
          </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
export default {
  data() {
    return {
        videoList: []
    };
  },
    created(){
      this.getVideoList()
    },
  methods: {
      // 打开播放页面
      toPlay(item) {
          let routeUrl = this.$router.resolve({
              path: "/videoPlay",
              query: {
                  title: item.title,
                  poster: item.poster,
                  videoUrl: item.videoUrl,
                  videoId: item._id,
                  tags : item.tags
              }
          })
          window.open(routeUrl.href, '_blank');
      },
      // 获取视频列表
      async getVideoList() {
          let res = await this.axios.get('/index/carouselMaplist')
          if(res.data.code === 1){
              this.videoList = [...res.data.data]
              this.videoList.forEach((item)=>{
                  if (item.poster) {
                      item.posterStr = 'http://localhost:3000/images/' + item.poster
                  } else {
                      item.posterStr = require('../../assets/defaultPoster.png')
                  }
              })
          } else {
              this.$message.error('请求数据失败')
          }
      }
  }
};
</script>
<style lang="scss" scoped>
  #rotation {
    img {
        width: 100%;
    }
      .video-box {
          position: relative;
          .title-info {
              position: absolute;
              top: 0;
              margin: 0 auto;
              background-color: rgba(255,255,255,0.01);
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              width: 100%;
              z-index: 2;
              cursor: pointer;
          }
      }
  }
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>