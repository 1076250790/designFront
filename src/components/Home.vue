<template>
    <el-container class="home_container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <span>餐厅点餐后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#ffd04b"
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router :default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" 
                    v-for="(item, index) in MenuList" 
                    :key="index">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="item.el_class"></i>
                            <!-- 文本 -->
                            <span>{{item.autoName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + item2.path" 
                        v-for="(item2, index) in item.children" 
                        :key="index" @click="saveNavState('/' + item2.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i :class="item2.el_class"></i>
                                <!-- 文本 -->
                                <span>{{item2.autoName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
      </el-container>
</template>

<script>
export default {
    data() {
        return {
            MenuList: '',
            // 是否折叠
            isCollapse: false,
            // 被激活的链接地址
            activePath: '',
        }
    },
    created() {
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods: {
        logout() {
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        // 点击按钮切换菜单的折叠与展开
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        // 获取所有的菜单
        async getMenuList() {
            const { data: res } = await this.$http.get('getMenu')
            this.MenuList = JSON.parse(JSON.stringify(res));
        },
        // 保存链接的激活状态
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath);
            this.activePath = activePath;
        }
    }
}
</script>

<style lang="less" scoped>
.home_container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 22px;
}

.el-aside {
    background-color: #333744;
}

.el-main {
    background-color: #eaedf1;
}

.toggle-button {
    background-color: #4a5064;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>