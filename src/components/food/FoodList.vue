<template>
	<div class="food-list-container">
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>菜单管理</el-breadcrumb-item>
			<el-breadcrumb-item>菜品列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="30">
				<el-col :span="9">
					<el-input placeholder="请输入想搜索的菜品" clearable v-model="queryInfo.query"  @clear="getFoodList">
						<el-button slot="append" icon="el-icon-search" @click="getFoodList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">添加菜品</el-button>
				</el-col>
			</el-row>

			<!-- 分类表格区域 -->
			<el-table :data="food_list" border stripe fit row-key>
				<el-table-column label="#" type="index" width="50" align="center"></el-table-column>
				<el-table-column label="菜品id" prop="food_id" align="center"></el-table-column>
				<el-table-column label="菜品名称" prop="food_name" align="center"></el-table-column>
				<el-table-column label="图片" align="center">
					<template slot-scope="scope">
						<el-image
						style="width: 85px; height: 85px"
						:src="require('../../assets/images/food/' + scope.row.food_pic)" v-if="scope.row.food_pic !== null">
						</el-image>
						<el-image
						style="width: 85px; height: 85px"
						:src="scope.row.food_pic" v-else>
						</el-image>
					</template>
				</el-table-column>
				<el-table-column label="价格（单位：￥）" prop="food_price" align="center"></el-table-column>
				<el-table-column label="所属分类" prop="type_name" align="center"></el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.food_id, scope.row.food_pic)"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeFoodById(scope.row.food_id)"></el-button>
						<!-- 原料等信息按钮 -->
						<el-tooltip effect="dark" content="菜品介绍" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini" @click="showIntroDialogVisible(scope.row.food_id, scope.row.food_name)"></el-button>
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

		<!-- 添加菜品的对话框 -->
		<el-dialog title="上架菜品" :visible.sync="addDialogVisible" width="40%"
			@close="addDialogClosed">
			<el-form :model="addForm" :rules="addFoodFormRules" ref="addFormRef" label-width="100px">
				<!-- 内容主体区域 -->
				<el-form-item label="菜品id">
					<el-input v-model="this.food_id" disabled></el-input>
				</el-form-item>
				<el-form-item label="菜品名称" prop="food_name">
					<el-input v-model="addForm.food_name"></el-input>
				</el-form-item>
				<el-form-item label="菜品图片" prop="food_pic">
					<el-upload class="upload-demo" action="#" multiple :headers="headers" :auto-upload="false"
						:file-list="fileList" list-type="picture" :before-remove="beforeRemove"
						:limit="1" :on-exceed="handleExceed" :on-change="handleChange">
						<el-button size="small" type="primary">点击上传</el-button>
					</el-upload>
				</el-form-item>
				<el-form-item label="菜品价格" prop="food_price">
					<el-input v-model="addForm.food_price"></el-input>
				</el-form-item>
				<el-form-item label="菜品分类">
					<el-select v-model="addForm.type_name" placeholder="请选择分类" prop="food_type">
						<el-option :label="item.type_name" :value="item.type_name" 
						v-for="(item, index) in JSON.parse(JSON.stringify(this.food_type))" 
						:key="index"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addFood">确 定</el-button>
			</div>
		</el-dialog>

	  	<!-- 修改菜品的对话框 -->
		<el-dialog title="修改菜品" :visible.sync="editDialogVisible" width="40%"
			@close="editDialogClosed">
			<!-- 内容主体 -->
			<el-form :model="editForm" :rules="editFoodFormRules" ref="editFormRef" label-width="100px">
				<el-form-item label="菜品名称">
					<el-input v-model="editForm.food_name" disabled></el-input>
				</el-form-item>
				<el-form-item label="修改图片" prop="food_pic">
					<el-upload class="upload-demo" action="#" multiple :headers="headers" :auto-upload="false"
						:file-list="fileList" list-type="picture" :before-remove="beforeRemove"
						:limit="1" :on-exceed="handleExceed" :on-change="handleChange">
						<el-button size="small" type="primary">点击上传</el-button>
					</el-upload>
				</el-form-item>
				<el-form-item label="修改价格" prop="food_price">
					<el-input v-model="editForm.food_price"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="updateFood">确 定</el-button>
			</div>
		</el-dialog>

		<!-- 菜品介绍信息的对话框 -->
		<el-dialog title="菜品信息" :visible.sync="introDialogVisible" width="40%"
			@close="introDialogClosed">
			<!-- 内容主体 -->
			<el-form :model="introForm" :rules="introFoodFormRules" ref="introFormRef" label-width="100px">
				<el-form-item label="菜品名称" prop="food_name">
					<el-input v-model="introForm.food_name" disabled></el-input>
				</el-form-item>
				<el-form-item label="菜品原料" prop="yuanliao">
					<el-input v-model="introForm.yuanliao"></el-input>
				</el-form-item>
				<el-form-item label="菜品份量" prop="fenliang">
					<el-input v-model="introForm.fenliang"></el-input>
				</el-form-item>
				<el-form-item label="菜品荤素" prop="hunsu">
					<el-select v-model="introForm.hunsu" placeholder="请选择荤素" prop="food_type">
						<el-option label="荤菜" value="荤菜"></el-option>
						<el-option label="素菜" value="素菜"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="菜品辅料" prop="fuliao">
					<el-input v-model="introForm.fuliao"></el-input>
				</el-form-item>
				<el-form-item label="菜品口味" prop="kouwei">
					<el-input v-model="introForm.kouwei"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="introDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="updateFoodIntro">确 定</el-button>
			</div>
		</el-dialog>
  	</div>
</template>

<script>
export default {
	data() {
		var priceRule = (rule, value, cb) => {
			// 验证菜品价格的正则表达式
			const regFoodPrice = /^\d+$/;
			if (regFoodPrice.test(value)) {
				return cb();
			}
			// 校验失败的提示
			cb(new Error('请输入数字'));
		}
		return {
			// 菜品列表数据
			food_list: [],
			// 总数量
			total: 0,
			// 菜品分类
			food_type: [],
			// 最新的菜品 id
			food_id: 0,
			queryInfo: {
				query: '',
				pageNum: 1,
				pageSize: 5
			},
			// 控制上架菜品的显示和隐藏
			addDialogVisible: false,
			// 上架菜品的表单
			addForm: {
				food_name: '',
				food_price: 1,
				type_name: ''
			},
			// 上架菜品的表单规则
			addFoodFormRules: {
				food_name: [
					// 必填项
					{ required: true, message: '请输入菜品名称', trigger: 'blur'},
				],
				food_price: [
					// 必填项
					{ required: true, message: '请输入价格', trigger: 'blur'},
					// 输入是否合法
					{ validator: priceRule, trigger: 'blur' }
				],
				food_type: [
					// 必填项
					{ required: true, message: '请选择分类', trigger: 'blur'},
				],
			},
			// 修改菜品的表单
			editForm: {},
			// 修改菜品的表单规则
			editFoodFormRules: {
				food_price: [
					// 必填项
					{ required: true, message: '请输入管理员账号', trigger: 'blur'},
					// 输入是否合法
					{ validator: priceRule, trigger: 'blur' }
				]
			},
			// 控制修改菜品的显示和隐藏
			editDialogVisible: false,
			// 文件上传列表
			fileList: [],
			// 文件上传请求头
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			// 控制菜品介绍的显示和隐藏
			introDialogVisible: false,
			// 菜品原料的表单
			introForm: {
				food_name: '',
				yuanliao: '',
				fenliang: '',
				hunsu: '',
				fuliao: '',
				kouwei: ''
			},
			// 菜品原料表单的校验规则
			introFoodFormRules: {
				yuanliao: [
					// 必填项
					{ required: true, message: '请输入菜品原料', trigger: 'blur'},
				]
			}
		}
	},
	created() {
		this.getFoodList();
	},
	methods: {
		// 获取菜品列表数据
		async getFoodList() {
			const {data: res} = await this.$http.get('getFoodList', {
				params: this.queryInfo
			});
			// console.log(res);
			if (res.meta.status !== 200) {
				return this.$message.error('获取菜品列表失败');
			}
			this.$message.success('获取菜品列表成功');
			this.total = res.total;
			this.food_list = res.foodList;
		},
		// 监听 pagesize改变的事件
        handleSizeChange(newSize) {
			this.queryInfo.pageSize = newSize;
			this.getFoodList();
        },
        // 监听 页码值 改变的事件 
        handleCurrentChange(newPage) {
          	this.queryInfo.pageNum = newPage;
          	this.getFoodList();
        },
		// 移除图片前的提示
		beforeRemove(file, fileList) {
        	return this.$confirm(`确定移除 ${ file.name }？`);
      	},
		// 超出上传的限制数的提示
		handleExceed(files, fileList) {
        	this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      	},
		// 文件数量改变
		handleChange(file, fileList) {
			this.fileList = fileList;
		},
		// 展示修改菜品的对话框
		async showEditDialog(food_id, food_pic) {
			this.fileList = [];
			const {data: res} = await this.$http.get
			('editFood', {
				params: {
					"food_id": food_id
				}
			});
			if (res.meta.status !== 200) {
				return this.$message.error('查询菜品信息失败!')
			}
			this.$message.success('查询菜品信息成功')
			// 把数据赋值给修改菜品信息的表单
			this.editForm = res.food;
			this.foodList = [{"name": res.food.food_name, "url": '../../assets/images/food/' + food_pic}]
			this.editDialogVisible = true;
			console.log(this.foodList);
		},
		// 监听修改管理员对话框的关闭事件
		editDialogClosed() {
			this.$refs.editFormRef.resetFields();
		},
		// 点击确定按钮修改菜品信息
		updateFood() {
			this.$refs.editFormRef.validate(async valid => {
				if (!valid) return;
				// 可以发起添加用户的网络请求
				const obj = {};
				obj["form"] = this.editForm
				obj["file"] = this.fileList[0].raw.name
				const { data: res } = await this.$http.post('updateFood', obj);
				console.log(res);
				// 判断修改菜品的返回状态
				if (res.meta.status !== 201) {
					this.$message.error('修改菜品信息失败');
				}
				this.$message.success('修改菜品信息成功');
				// 隐藏编辑菜品信息的对话框
				this.editDialogVisible = false;
				// 重新获取菜品列表数据
				this.getFoodList();
			})
		},
		// 点击添加菜品按钮获取菜品分类
		async showAddDialog() {
			this.addDialogVisible = true;
			const { data: res } = await this.$http.get('getFoodType');
			this.food_type = res.foodType
			this.food_id = res.food_id + 1
		},
		// 监听添加菜品对话框的关闭事件
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
		// 点击确定按钮添加新菜品
		addFood() {
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) return;
				// 可以发起添加新菜品的网络请求
				const obj = {};
				obj["form"] = this.addForm
				obj["food_id"] = this.food_id
				if (this.fileList[0]) {
					obj["file"] = this.fileList[0].raw.name
				}
				const { data: res } = await this.$http.post
				('addFormFood', obj);
				console.log(res);
				// 判断修改菜品的返回状态
				if (res.meta.status !== 201) {
					this.$message.error('修改菜品信息失败');
				}
				this.$message.success('修改菜品信息成功');
				// 隐藏添加管理员的对话框
				this.addDialogVisible = false;
				// 重新获取管理员列表数据
				this.getFoodList();
			})
		},
		// 点击删除按钮根据 id删除对应的菜品
		async removeFoodById(id) {
			const confirmResult = await this.$confirm('此操作将永久删除该菜品信息, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 如果用户确认删除，则返回值为字符串 confirm
			// 如果用户取消了删除，则返回值为字符串 cancel
			if (confirmResult !== 'confirm') {
				return this.$message.info('已取消删除');
			}
			const { data: res } = await this.$http.get('removeFoodById', {
				params: {
					"food_id": id
				}
			})
			if (res.meta.status !== 200) {
				return this.$message.error('删除失败');
			}
			this.$message.success('删除成功');
			this.getFoodList();
		},
		// 展示编辑原料的对话框
		async showIntroDialogVisible(food_id, food_name) {
			this.introDialogVisible = true;
			const { data: res } = await this.$http.get('getFoodMsg', {
				params: {
					"food_id": food_id
				}
			});
			this.introForm = res.result
			this.introForm.food_name = food_name
			console.log(res);
		},
		// 监听编辑原料对话框的关闭事件
		introDialogClosed() {
			this.$refs.introFormRef.resetFields()
		},
		// 更新菜品原料等信息
		async updateFoodIntro() {
			this.$refs.introFormRef.validate(async valid => {
				if (!valid) return;
				// 可以发起修改菜品信息的网络请求
				const { data: res } = await this.$http.post
				('updateFoodIntro', this.introForm)
				// 判断返回的修改菜品信息的状态
				console.log(res);
				if (res.meta.status !== 201) {
					this.$message.error('修改菜品信息失败');
				}
				this.$message.success('修改菜品信息成功');
				// 隐藏编辑菜品原料的对话框
				this.introDialogVisible = false;
				// 重新获取菜品列表数据
				this.getFoodList();
			})
		}
	},
}
</script>

<style>

</style>