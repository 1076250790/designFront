<template>
  <div class="user-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="30">
        <el-col :span="9">
          <el-input clearable placeholder="请输入用户名" v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="user_list" border stripe fit row-key>
        <el-table-column label="#" type="index" width="50" align="center"></el-table-column>
        <el-table-column label="账号" prop="user_id" align="center"></el-table-column>
        <el-table-column label="密码" prop="password" align="center"></el-table-column>
        <el-table-column label="用户名" prop="username" align="center"></el-table-column>
        <el-table-column label="头像" align="center">
          <template slot-scope="scope">
            <el-image
              style="width: 50px; height: 50px"
              :src="require('../../assets/images/head/' + scope.row.head_portrait)" v-if="scope.row.head_portrait.slice(0, 5) != 'https'">
            </el-image>
            <el-image
              style="width: 50px; height: 50px"
              :src="scope.row.head_portrait" v-else>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="积分" prop="integral" align="center"></el-table-column>
        <el-table-column label="性别" prop="gender" align="center"
          :filters="[{ text: '女', value: '1' }, { text: '男', value: '2' }, { text: '保密', value: '0' }]"
          :filter-method="filterTag1"
          filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.gender === 0 ? 'primary' : scope.row.gender === 1 ? 'danger' : 'success'"
              disable-transitions>{{scope.row.gender === 0 ? '保密' : scope.row.gender === 1 ? '女' : '男'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="登录方式" prop="login_method" align="center"
          :filters="[{ text: '普通登录', value: 'putong' }, { text: '微信登录', value: 'weixin' }]"
          :filter-method="filterTag2"
          filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.login_method === 'weixin' ? 'success' : 'info'"
              disable-transitions>{{scope.row.login_method === 'weixin' ? '微信登录' : '普通登录'}}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <!-- layout：total：总共的数据；size：每页展示数量的菜单 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { log } from 'util';
export default {
    data() {
        return {
            // 获取用户列表的参数对象
            queryInfo: {
              query: '',
              // 当前的页数
              pageNum: 1,
              // 当前每页显示的数量
              pageSize: 5
            },
            // 用户列表
            user_list: [],
            total: 0,
        }
    },
    created() {
        this.getUserList();
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get('getUserList', { 
                params: this.queryInfo 
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取用户列表失败')
            }
            this.user_list = res.user;
            this.total = res.total;
        },
        // 筛选
        filterTag1(value, row) {
            return row.gender == value;
        },
        filterTag2(value, row) {
            return row.login_method == value;
        },
        // 监听 pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pageSize = newSize;
            this.getUserList();
        },
        // 监听 页码值 改变的事件 
        handleCurrentChange(newPage) {
            this.queryInfo.pageNum = newPage;
            this.getUserList();
        },
    },
}
</script>

<style>

</style>