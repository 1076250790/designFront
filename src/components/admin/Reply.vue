<template>
    <div class="reply-container">
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>管理员评论</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="30">
                <el-col :span="7">
                    <el-input placeholder="请输入搜索内容" clearable v-model="queryInfo.query" @clear="getReplyList">
                        <el-button slot="append" icon="el-icon-search" @click="getReplyList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 表单区域 -->
            <el-table :data="replyList" border stripe fit row-key>
                <el-table-column label="#" type="index" width="50" align="center"></el-table-column>
                <el-table-column label="管理员名称" prop="admin_name" align="center" min-width="120"></el-table-column>
                <el-table-column label="用户id" prop="user_id" align="center" min-width="100"></el-table-column>
                <el-table-column label="用户评论时间" prop="place_time" align="center" min-width="250"></el-table-column>
                <el-table-column label="回复时间" prop="complete_time" align="center" min-width="250"></el-table-column>
                <el-table-column label="回复内容" prop="content" align="center" min-width="150"></el-table-column>
                <el-table-column label="操作" align="center" min-width="100">
                    <template slot-scope="scope">
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteReply(scope.row)">删除</el-button>
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
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                query: '',
                pageNum: 1,
                pageSize: 5
            },
            // 回复评论数组
            replyList: [],
            // 总数
			total: 0,
        }
    },
    created() {
        this.getReplyList()
    },
    methods: {
        // 获取回复
        async getReplyList() {
            const {data: res} = await this.$http.get('getAllReply', {
                params: this.queryInfo
            })
            if (res.meta.status != 200) {
                return this.$message.error('获取失败')
            }
            this.$message.success('获取成功')
            this.replyList = res.replyList
            this.total = res.total
            console.log(res);
        },
        // 监听 pagesize改变的事件
        handleSizeChange(newSize) {
			this.queryInfo.pageSize = newSize;
			this.getReplyList();
        },
        // 监听 页码值 改变的事件 
        handleCurrentChange(newPage) {
          	this.queryInfo.pageNum = newPage;
          	this.getReplyList();
        },
        // 删除
        async deleteReply(row) {
            const confirmResult = await this.$confirm('此操作将永久删除该回复, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)

			// 如果用户确认删除，则返回值为字符串 confirm
			// 如果用户取消了删除，则返回值为字符串 cancel
			if (confirmResult !== 'confirm') {
				return this.$message.info('已取消删除');
			}
            const {data: res} = await this.$http.get('deleteReply', {
                params: {
                    "admin_name": row.admin_name,
                    "complete_time": row.complete_time
                }
            })
            if (res.meta.status != 200) {
                return this.$message.error('删除失败')
            }
            this.$message.success('删除成功')
            this.getReplyList()
            console.log(res);
        }
    },
}
</script>

<style>

</style>