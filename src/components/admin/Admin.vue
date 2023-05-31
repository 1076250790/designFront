<template>
	<div class="admin-container">
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		<el-breadcrumb-item>权限管理</el-breadcrumb-item>
		<el-breadcrumb-item>管理员列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="30">
				<el-col :span="9">
					<el-input placeholder="请输入想搜索的角色" clearable v-model="queryInfo.query" @clear="getAdminList">
						<el-button slot="append" icon="el-icon-search" @click="getAdminList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addDialogVisible = true">添加管理员</el-button>
				</el-col>
			</el-row>

			<!-- 管理员列表区域 -->
			<el-table :data="admin_list" border stripe fit row-key>
				<el-table-column label="#" type="index" width="50" align="center"></el-table-column>
				<el-table-column label="账号" prop="admin_id" align="center"></el-table-column>
				<el-table-column label="管理员名称" prop="admin_name" align="center"></el-table-column>
				<el-table-column label="角色" prop="scope" align="center"></el-table-column>
				<el-table-column label="状态" align="center" width="100px">
					<!-- slot-scope属性可以通过 scope.row获取到这一行的所有数据 -->
					<template slot-scope="scope">
						<el-switch v-model="scope.row.state" 
						@change="adminStateChanged(scope.row)"
						v-if="scope.row.power > power" disabled></el-switch>
						<el-switch v-model="scope.row.state" 
						@change="adminStateChanged(scope.row)"
						v-else></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="权限" prop="power" align="center" width="350px">
					<template slot-scope="scope">
						<el-tag
						:type="scope.row.power === 0 ? 'primary' : scope.row.power === 1 ? 'warning' : 'success'"
						disable-transitions>{{ scope.row.power === 0 ? '部分权限(菜品列表, 权限管理, 用户管理)' : scope.row.power === 1 ? '大部分权限(菜品管理, 权限管理, 用户管理, 订单管理)' : '所有权限' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200" align="center">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" v-if="scope.row.admin_id == 1" disabled></el-button>
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)" v-else></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" v-if="scope.row.admin_id == 1" disabled></el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeAdminById(scope.row)" v-else></el-button>
						<!-- 分配角色按钮 -->
						<el-tooltip effect="dark" content="分配按钮" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini" v-if="scope.row.admin_id == 1" disabled></el-button>
							<el-button type="warning" icon="el-icon-setting" size="mini" v-else></el-button>
						</el-tooltip>
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

		<!-- 添加管理员的对话框 -->
		<el-dialog title="添加管理员" :visible.sync="addDialogVisible" width="40%"
			@close="addDialogClosed">
			<!-- 内容主体区域 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="管理员账号" prop="adminId">
					<el-input v-model="addForm.adminId"></el-input>
				</el-form-item>
				<el-form-item label="管理员名称" prop="adminName">
					<el-input v-model="addForm.adminName"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="adminPassword">
				<el-input v-model="addForm.adminPassword"></el-input>
				</el-form-item>
				<el-form-item label="角色" prop="scope">
					<el-select v-model="addForm.scope" placeholder="请选择角色">
						<el-option label="超级管理员" value="超级管理员"></el-option>
						<el-option label="管理员" value="管理员"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addAdmin">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改用户的对话框 -->
		<el-dialog title="修改管理员信息" :visible.sync="editDialogVisible" width="40%"
			@close="editDialogClosed">
			<!-- 内容主体 -->
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
				<el-form-item label="管理员账号">
					<el-input v-model="editForm.admin_id" disabled></el-input>
				</el-form-item>
				<el-form-item label="管理员名称" prop="admin_name">
					<el-input v-model="editForm.admin_name"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="admin_password">
					<el-input v-model="editForm.admin_password"></el-input>
				</el-form-item>
				<el-form-item label="角色" prop="scope">
					<el-select v-model="editForm.scope" placeholder="请选择角色">
						<el-option label="超级管理员" value="超级管理员"></el-option>
						<el-option label="管理员" value="管理员"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editAdmin">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data() {
		// 添加管理员名称校验规则
		var adminNameAddRule = (rule, value, cb) => {
			// 验证管理员名称的正则表达式
			if (this.addForm.scope === '管理员') {
				const regAdminName = /^admin/;
				// 用正则表达式验证管理员名称
				if(regAdminName.test(value)) {
					return cb();
				}
			} else if (this.addForm.scope === '超级管理员') {
				const regAdminName = /^super_admin/;
				// 用正则表达式验证管理员名称
				if(regAdminName.test(value)) {
					return cb();
				}
			}

			cb(new Error('角色是管理员,名称请以admin开头; 角色是超级管理员,名称请以super_admin开头'))
		}
		// 修改管理员名称校验规则
		var adminNameEditRule = (rule, value, cb) => {
			// 验证管理员名称的正则表达式
			if (this.editForm.scope === '管理员') {
				const regAdminName = /^admin/;
				// 用正则表达式验证管理员名称
				if(regAdminName.test(value)) {
					return cb();
				}
			} else if (this.editForm.scope === '超级管理员') {
				const regAdminName = /^super_admin/;
				// 用正则表达式验证管理员名称
				if(regAdminName.test(value)) {
					return cb();
				}
			}

			cb(new Error('角色是管理员,名称请以admin开头; 角色是超级管理员,名称请以super_admin开头'))
		}
		// 管理员账号校验规则
		var adminIdRule = (rule, value, cb) => {
			// 验证管理员账号的正则表达式
			const regAdminId = /^\d{3,6}$/;
			if (regAdminId.test(value)) {
				return cb();
			}
			// 校验失败的提示
			cb(new Error('请输入3~6位数字'));
		}
		return {
			// 登录的管理员的权限
			power: window.sessionStorage.getItem("power"),
			// 查询条件
			queryInfo: {
				query: '',
				pageNum: 1,
				pageSize: 5
			},
			// 管理员列表
			admin_list: [],
			total: 0,
			// 开关绑定
			switch: true,
			// 对话框隐藏
			addDialogVisible: false,
			// 添加管理员的表单数据
			addForm: {
				adminId: 102,
				adminName: '',
				adminPassword: '',
				scope: '管理员',
			},
			// 添加表单的验证规则对象
			addFormRules: {
				adminId: [
					// 必填项
					{ required: true, message: '请输入管理员账号', trigger: 'blur'},
					// 账号是否合法
					{ validator: adminIdRule, trigger: 'blur' }
				],
				adminName: [
					// 必填项
					{ required: true, message: '请输入管理员名称', trigger: 'blur'},
					// 名称是否合法
					{ validator: adminNameAddRule, trigger: 'blur' }
				],
				adminPassword: [
					// 必填项
					{ required: true, message: '请输入密码', trigger: 'blur'},
					// 长度规则
					{ min: 3, max: 10, message: '密码在3~10个字符之间', trigger: 'blur' }
				],
				scope: [
					// 必填项
					{ required: true, message: '请选择角色', trigger: 'blur'},
				]
			},
			// 控制修改管理员信息对话框的显示与隐藏
			editDialogVisible: false,
			// 查询到的管理员信息对象
			editForm: {},
			editFormRules: {
				admin_name: [
					// 必填项
					{ required: true, message: '请输入管理员名称', trigger: 'blur'},
					// 名称是否合法
					{ validator: adminNameEditRule, trigger: 'blur' }
				],
				adminPassword: [
					// 必填项
					{ required: true, message: '请输入密码', trigger: 'blur'},
					// 长度规则
					{ min: 3, max: 10, message: '密码在3~10个字符之间', trigger: 'blur' }
				],
				scope: [
					// 必填项
					{ required: true, message: '请选择角色', trigger: 'blur'},
				]
			},
		}
	},
	created() {
		this.getAdminList();
	},
  	methods: {
    	async getAdminList() {
			const {data: res} = await this.$http.get('getAdminList', {
				params: this.queryInfo
			});
			if (res.meta.status !== 200) {
                return this.$message.error('获取管理员列表失败');
            }
			this.$message.success('获取管理员列表成功');
            this.admin_list = res.admin;
			this.total = res.total;
    	},
		// 监听 pagesize改变的事件
        handleSizeChange(newSize) {
			this.queryInfo.pageSize = newSize;
			this.getAdminList();
        },
        // 监听 页码值 改变的事件 
        handleCurrentChange(newPage) {
          	this.queryInfo.pageNum = newPage;
          	this.getAdminList();
        },
		// 监听 switch 开关状态的改变
		async adminStateChanged(adminInfo) {
			const { data: res } = await this.$http.get('changeAdminState', {
				params: {
					"adminId": adminInfo.admin_id,
					"state": adminInfo.state
				}
			});
			if (res.meta.status != 200) {
				userInfo.state = !userInfo.state;
				return this.$message.error('更新管理员状态失败!');
			}
			this.$message.success('更新管理员状态成功!');
		},
		// 监听添加用户对话框的关闭事件
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
		// 点击按钮添加管理员
		addAdmin() {
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) return;
				// 可以发起添加用户的网络请求
				const { data: res } = await this.$http.post
				('addAdmin', this.addForm);
				// 判断添加管理员的状态
				if (res.meta.status !== 201) {
					this.$message.error('添加用户失败');
				}
				this.$message.success('添加用户成功');
				// 隐藏添加管理员的对话框
				this.addDialogVisible = false;
				// 重新获取管理员列表数据
				this.getAdminList();
			})
		},
		// 展示编辑用户的对话框
		async showEditDialog(row) {
			if (row.power > window.sessionStorage.getItem("power")) {
				return this.$message.error('没有权限访问')
			}
			const {data: res} = await this.$http.get
			('updateAdmin', {
				params: {
					"admin_id": row.admin_id
				}
			});
			if (res.meta.status !== 200) {
				return this.$message.error('查询管理员信息失败!')
			}
			this.$message.success('查询管理员信息成功')
			// 把数据赋值给修改管理员信息的表单
			this.editForm = res.admin;
			this.editDialogVisible = true;
		},
		// 点击确定按钮修改管理员信息
		editAdmin() {
			this.$refs.editFormRef.validate(async valid => {
				if (!valid) return;
				// 可以发起添加用户的网络请求
				const { data: res } = await this.$http.post
				('editAdmin', this.editForm);
				// 判断添加管理员的状态
				if (res.meta.status !== 201) {
					this.$message.error('添加用户失败');
				}
				this.$message.success('添加用户成功');
				// 隐藏添加管理员的对话框
				this.editDialogVisible = false;
				// 重新获取管理员列表数据
				this.getAdminList();
			})
		},
		// 监听修改管理员对话框的关闭事件
		editDialogClosed() {
			this.$refs.editFormRef.resetFields();
		},
		// 根据 Id删除对应的管理员账号
		async removeAdminById(row) {
			if (row.power > window.sessionStorage.getItem("power")) {
				return this.$message.error('没有权限访问')
			}
			const confirmResult = await this.$confirm('此操作将永久删除该管理员账号, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)

			// 如果用户确认删除，则返回值为字符串 confirm
			// 如果用户取消了删除，则返回值为字符串 cancel
			if (confirmResult !== 'confirm') {
				return this.$message.info('已取消删除');
			}
			const {data: res} = await this.$http.get('removeAdminById', {
				params: {
					"admin_id": row.admin_id
				}
			})
			if (res.meta.status !== 200) {
				return this.$message.error('删除失败');
			}
			this.$message.success('删除成功');
			this.getAdminList();
		}
  	},
}
</script>

<style lang="less" scoped>

</style>