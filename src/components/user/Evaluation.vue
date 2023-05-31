<template>
  	<div class="evaluation-container">
		<!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>用户评论</el-breadcrumb-item>
        </el-breadcrumb>

		<!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加区域 -->
			<el-row :gutter="30">
				<el-col :span="12">
					<el-input placeholder="请输入搜索内容" clearable v-model="queryInfo.query" @clear="getEvaluationList">
						<el-select v-model="queryInfo.select" slot="prepend" placeholder="请选择">
							<el-option label="用户id" value="user"></el-option>
							<el-option label="菜品id" value="food"></el-option>
						</el-select>
						<el-button slot="append" icon="el-icon-search" @click="getEvaluationList"></el-button>
					</el-input>
				</el-col>
			</el-row>

			<!-- 表单区域 -->
			<el-table :data="evaluationList" border stripe fit row-key>
				<el-table-column label="#" type="index" width="50" align="center"></el-table-column>
				<el-table-column label="用户id" prop="user_id" align="center"></el-table-column>
				<el-table-column label="菜品id" prop="food_id" width="150" align="center"></el-table-column>
				<el-table-column label="内容" prop="content" width="400" align="center"></el-table-column>
				<el-table-column label="评论时间" prop="place_date" width="250" align="center"></el-table-column>
				<el-table-column label="点赞数" prop="likes" width="80" align="center"></el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<!-- 回复按钮 -->
						<el-button type="primary" icon="el-icon-s-promotion" size="mini" @click="showReplyDialog(scope.row)">回复</el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteEvaluationDialog(scope.row)">删除</el-button>
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

		<!-- 回复评论的对话框 -->
		<el-dialog title="回复用户评论" :visible.sync="replyDialogVisible" width="40%"
			@close="replyDialogClosed">
			<!-- 内容主体 -->
			<el-form :model="replyForm" :rules="replyFormRules" ref="replyFormRef" label-width="100px">
				<el-form-item label="管理员名称">
					<el-input v-model="replyForm.admin_name" disabled></el-input>
				</el-form-item>
				<el-form-item label="用户账号">
					<el-input v-model="replyForm.user_id" disabled></el-input>
				</el-form-item>
				<el-form-item label="菜品编号">
					<el-input v-model="replyForm.food_id" disabled></el-input>
				</el-form-item>
				<el-form-item label="回复内容">
					<el-input type="textarea" v-model="replyForm.content"></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="replyDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addEvaluation">确 定</el-button>
			</span>
		</el-dialog>
 	</div>
</template>

<script>
export default {
	data() {
		return {
			// 请求条件
			queryInfo: {
				query: '',
				select: 'user',
				pageNum: 1,
				pageSize: 5
			},
			// 评论数据
			evaluationList: [],
			// 总数
			total: 0,
			// 控制回复对话框的显示与隐藏
			replyDialogVisible: false,
			// 回复表单
			replyForm: {
				admin_name: window.sessionStorage.getItem("admin_name"),
				food_id: 1,
				user_id: '',
				place_time: '',
				content: ''
			},
			// 回复表单的校验规则
			replyFormRules: {}
		}
	},
	created() {
		this.getEvaluationList()
	},
	methods: {
		// 获取评论数据
		async getEvaluationList() {
			const {data: res} = await this.$http.get('getAllEvaluation', {
				params: this.queryInfo
			})
			console.log(res);
			if (res.meta.status != 200) {
				return this.$message.error('请求评论失败')
			}
			this.$message.success('请求评论成功');
			this.evaluationList = res.evaluationList
			this.total = res.total
		},
		// 监听 pagesize改变的事件
        handleSizeChange(newSize) {
			this.queryInfo.pageSize = newSize;
			this.getEvaluationList();
        },
        // 监听 页码值 改变的事件 
        handleCurrentChange(newPage) {
          	this.queryInfo.pageNum = newPage;
          	this.getEvaluationList();
        },
		// 监听修改管理员对话框的关闭事件
		replyDialogClosed() {
			this.$refs.replyFormRef.resetFields();
		},
		// 点击回复按钮显示回复对话框
		showReplyDialog(row) {
			this.replyDialogVisible = true
			this.replyForm.user_id = row.user_id
			this.replyForm.food_id = row.food_id
			this.replyForm.place_time = row.place_date
			this.replyForm.admin_name = window.sessionStorage.getItem("admin_name");
		},
		// 回复评论添加
		async addEvaluation() {
			const {data: res} = await this.$http.post('addEvaluation', this.replyForm)
			console.log(res);
			if (res.meta.status !== 200) {
				return this.$message.error('评论添加失败')
			}
			this.$message.success('回复成功')
			this.replyDialogVisible = false
		},
		// 删除用户评论
		async showDeleteEvaluationDialog(row) {
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
			console.log(row);
			const {data: res} = await this.$http.get('deleteEvaluation', {
				params: {
					"user_id": row.user_id,
					"place_time": row.place_date
				}
			})
			console.log(res);
		}
	},
}
</script>

<style lang="less" scoped>
.el-select .el-input {
    width: 130px;
}

.el-select {
	width: 100px;
}
</style>