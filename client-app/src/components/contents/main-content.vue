<!-- 主要内容 -->
<template>
  <div id="main-content">
    <el-container>
      <el-main>
        <h1>猜你喜欢</h1>
        <el-row :gutter="20">
          <el-col :span="6" v-for="(item,index) in recommendLList" :key="index">
            <div class="video-box">
                <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                    <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                </el-tooltip>
                <img @click="toPlay(item)" :src="item.posterStr" alt="加载失败">
            </div>
          </el-col>
        </el-row>
      </el-main>
      <el-aside width="200px">
          <h2 style="text-align: left">本周热门天梯</h2>
        <p style="text-align: left"  v-for="(item,index) in hotList" :key="index" >
         <span class="hot-list" @click="toPlay(item)">{{index + 1}}.{{item.title ? item.title : '未命名'}}</span>
        </p>
      </el-aside>
    </el-container>
    <el-container>
      <el-header>
        <h1 class="title-left" @click="toMore('more','生活')">生活</h1>
      </el-header>
      <el-main>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(item,index) in lifeList" :key="index">
                    <div class="video-box">
                        <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                            <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                        </el-tooltip>
                        <img @click="toPlay(item)" :src="'http://localhost:3000/images/' + item.poster" alt="加载失败">
                    </div>
                </el-col>
        </el-row>
      </el-main>
    </el-container>

     <el-container>
      <el-header>
        <h1 class="title-left" @click="toMore('more','科技')">科技</h1>
      </el-header>
      <el-main>
            <el-row :gutter="20">
                <el-col  :span="6" v-for="(item,index) in scienceList" :key="index">
                    <div class="video-box">
                        <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                            <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                        </el-tooltip>
                        <img @click="toPlay(item)" :src="'http://localhost:3000/images/' + item.poster" alt="加载失败">
                    </div>
                </el-col>
        </el-row>
      </el-main>
    </el-container>

     <el-container>
      <el-header>
        <h1 class="title-left" @click="toMore('more','风景')">风景</h1>
      </el-header>
      <el-main>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(item,index) in sceneryList" :key="index">
                    <div class="video-box">
                        <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                            <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                        </el-tooltip>
                        <img @click="toPlay(item)" :src="'http://localhost:3000/images/' + item.poster" alt="加载失败">
                    </div>
                </el-col>
        </el-row>
      </el-main>
    </el-container>
     <el-container>
      <el-header>
        <h1 class="title-left" @click="toMore('more','娱乐')">娱乐</h1>
      </el-header>
      <el-main>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(item,index) in entertainmentLList" :key="index">
                    <div class="video-box">
                        <el-tooltip class="item" effect="dark" :content="item.title ? item.title : '未命名'" placement="bottom">
                            <div class="title-info"> <span>{{item.title ? item.title : '未命名'}}</span></div>
                        </el-tooltip>
                        <img @click="toPlay(item)" :src="'http://localhost:3000/images/' + item.poster" alt="加载失败">
                    </div>
                </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
        hotList: [], // 热门榜单
        recommendLList: [], // 推荐列表
        lifeList: [], // 生活列表
        scienceList: [], // 科技列表
        sceneryList: [], // 风景列表
        entertainmentLList: [] //娱乐列表
    }
  },
    created() {
      this.getrecommendList()
        this.getHotList()
        this.initfamilyVideoList()
    },
  methods: {
      // 获取热门榜单列表
      async getHotList(){
          let res = await this.axios.get('/index/hotList')
          if(res.data.code === 1){
              this.hotList = [...res.data.data]
          }
      },
      // 打开更多页面
      toMore(type, info) {
          let routeUrl = this.$router.resolve({
              path: "/more",
              query: {
                  type: type,
                  info: info
              }
          })
          window.open(routeUrl.href, '_blank');
      },
      // 初始化不同标签的视频列表
      initfamilyVideoList () {
          let tags = [
              {name: '生活', value: 'lifeList'},
              {name: '科技', value: 'scienceList'},
              {name: '风景', value: 'sceneryList'},
              {name: '娱乐', value: 'entertainmentLList'}
          ]
          tags.forEach(async (item)=>{
              switch (item.name){
                  case tags[0].name: this.lifeList = await this.getfamilyVideoList(item.name)
                      break
                  case tags[1].name: this.scienceList = await this.getfamilyVideoList(item.name)
                      break
                  case tags[2].name: this.sceneryList = await this.getfamilyVideoList(item.name)
                      break
                  case tags[3].name: this.entertainmentLList = await this.getfamilyVideoList(item.name)
                      break
                  default: break
              }
          })

      },
      // 获取不同标签的视频列表
      async getfamilyVideoList(tag) {
          const params = {
              params: {
                  tag: tag
              }
          }
          let res = await this.axios.get('/index/familyVideoList', params)
          return res.data.data
      },
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
      // 获取猜你喜欢视频列表
      async getrecommendList() {
          const params = {
              params:{
                  username: sessionStorage.getItem('userInfo')
              }
          }
          let res = await this.axios.get('/index/indexVideoList',params)
          if(res.data.code === 1) {
              this.recommendLList = [...res.data.data]
              this.recommendLList.forEach((item)=>{
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
    #main-content {
        .hot-list {
            cursor: pointer;
            &:hover {
                color: #409EFF;
            }
        }
        .title-left {
            text-align: left;
            cursor: pointer;
            &:hover {
                color: #409EFF;
            }
        }
        .video-box {
            position: relative;
            .title-info {
                background-color: rgba(255,255,255,0);
                position: absolute;
                bottom: 10px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                width: 100%;
                z-index: 2;
                cursor: pointer;
            }
            img {
                height: 200px;
                border-radius: 4px;
                width: 100%;
                cursor: pointer;
                &:hover {
                    cursor: pointer;
                    transform: scale(1.05);
                    box-shadow: 0 0 10px #2c3e50;
                }
            }
        }
    }
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
      color: lightgreen;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>