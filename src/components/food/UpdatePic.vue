<template>
	<div class="pic-container">
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>菜品管理</el-breadcrumb-item>
			<el-breadcrumb-item>滚动图修改</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图 -->
		<el-card>
			<el-table :data="tableData" :show-header="false" 
			border :row-style="rowStyle">
				<el-table-column prop="title" width="150px" align="center"></el-table-column>
				<el-table-column prop="pic">
					<template slot-scope="scope">
						<span style="margin-right: 20px" v-for="(item, index) in scope.row.pic" :key="index">
							<el-image style="width: 200px;" :src="require('../../assets/images/index-banner/' + item)" v-if="scope.row.title === '首页'"></el-image>
							<el-image style="width: 200px;" :src="require('../../assets/images/list-banner/' + item)" v-if="scope.row.title === '列表'"></el-image>
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="btn" width="250px">
					<template slot-scope="scope">
						<el-button type="primary" size="mini" icon="el-icon-plus" @click="showDialog(scope.row.title)">上传</el-button>
						<el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 添加首页图片的对话框 -->
		<el-dialog title="上传首页图片" :visible.sync="addHomeDialogVisible" width="40%"
			@close="addHomeDialogClosed">
			<el-form ref="addHomeFormRef">
				<el-upload class="upload-demo" action="#" multiple :headers="headers" :auto-upload="false"
					list-type="picture" :before-remove="beforeRemove" :file-list="homeFileList" :on-remove="handleRemoveHome"
					:limit="5" :on-exceed="handleExceed" :on-change="handleChangeHome">
					<el-button size="small" type="primary">点击上传</el-button>
				</el-upload>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="addHomeDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addHomePic">确 定</el-button>
			</div>
		</el-dialog>

		<!-- 添加列表页图片的对话框 -->
		<el-dialog title="上传列表页图片" :visible.sync="addListDialogVisible" width="40%"
			@close="addListDialogClosed">
			<el-form ref="addListFormRef">
				<el-upload class="upload-demo" action="#" multiple :headers="headers" :auto-upload="false"
					list-type="picture" :before-remove="beforeRemove" :file-list="listFileList" :on-remove="handleRemoveList"
					:limit="5" :on-exceed="handleExceed" :on-change="handleChangeList">
					<el-button size="small" type="primary">点击上传</el-button>
				</el-upload>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="addListDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addListPic">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				dataForm: {
					home: [],
					list: [],
				},
				// 控制上传首页图片对话框的显示与隐藏
				addHomeDialogVisible: false,
				// 控制上传列表页图片对话框的显示与隐藏
				addListDialogVisible: false,
				// 文件上传请求头
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				// 上传的主页图片列表
				homeFileList: {},
				// 上传的列表图片列表
				listFileList: {},
			}
		},
		created() {
			this.getAllPicList()
		},
		computed: {
			//因为数据用到了 dataForm中的数据，所以写在了 computed中
			tableData() {
				return [{
						title: "首页",
						pic: this.dataForm.home,
						btn: ''
					},
					{
						title: "列表",
						pic: this.dataForm.list,
						btn: ''
					}
				]
			},
		},
		methods: {
			// 自定义列背景色
			rowStyle({
				row,
				rowIndex,
			}) {
				if (rowIndex == 0) {
					return "background:#f3f6fc;";
				} else {
					return "background:#ffffff;";
				}
			},
			getAllPicList() {
				this.getHomePicList()
				this.getListPicList()
			},
			// 获取主页轮播图图片
			async getHomePicList() {
				this.dataForm.home = []
				const {data: res} = await this.$http.get('getAllHomePic')
				for(let i = 0; i < res.homePicList.length; i++) {
					this.dataForm.home.push(res.homePicList[i].homePic)
				}
				// 根据状态输出结果
				if (res.meta.status !== 200) {
					return this.$message.error('获取首页轮播图失败')
				}
				this.$message.success('获取首页轮播图成功')
				// 存入数组数据，对话框展示会将页面对应的图片存入
				this.homeFileList = []
				this.homeFileList = this.dataForm.home.map(item => {
					return {
						name: item,
						url: require('../../assets/images/index-banner/' + item)
					}
				})
			},
			// 获取列表页轮播图图片
			async getListPicList() {
				this.dataForm.list = []
				const {data: res} = await this.$http.get('getAllListPic')
				for(let i = 0; i < res.listPicList.length; i++) {
					this.dataForm.list.push(res.listPicList[i].listPic)
				}
				// 根据状态输出结果
				if (res.meta.status !== 200) {
					return this.$message.error('获取列表页轮播图失败')
				}
				this.$message.success('获取列表页轮播图成功')
				// 存入数组数据，对话框展示会将页面对应的图片存入
				this.listFileList = []
				this.listFileList = this.dataForm.list.map(item => {
					return {
						name: item,
						url: require('../../assets/images/list-banner/' + item)
					}
				})
			},
			// 上传主页轮播图图片
			async addHomePic() {
				const homePic = []
				for (let i = 0; i < this.homeFileList.length; i++) {
					homePic.push(this.homeFileList[i].name)
				}
				// 
				const {data: res} = await this.$http.post('addHomePic', homePic)
				console.log(res);
				if (res.meta.status === 500) {
					return this.$message.error('添加失败')
				}
				this.$message.success('添加成功')
				// 获取主页数据
				this.getHomePicList()
				this.addHomeDialogVisible = false
			},
			// 上传列表页轮播图图片
			async addListPic() {
				const ListPic = []
				for (let i = 0; i < this.listFileList.length; i++) {
					ListPic.push(this.listFileList[i].name)
				}
				// 
				const {data: res} = await this.$http.post('addListPic', ListPic)
				console.log(res);
				if (res.meta.status === 500) {
					return this.$message.error('添加失败')
				}
				this.$message.success('添加成功')
				this.getListPicList()
				this.addListDialogVisible = false
			},
			// 移除首页图片后调用这个事件
			handleRemoveHome(file, fileList) {
				this.homeFileList = fileList.map(item => {
					return {
						name: item.name,
						url: item.url
					}
				})
			},
			// 移除列表页图片后调用这个事件
			handleRemoveList(file, fileList) {
				this.listFileList = fileList.map(item => {
					return {
						name: item.name,
						url: item.url
					}
				})
			},
			// 监听添加首页图片对话框的关闭事件
			addHomeDialogClosed() {
				this.$refs.addHomeFormRef.resetFields()
			},
			// 监听添加列表页图片对话框的关闭事件
			addListDialogClosed() {
				this.$refs.addListFormRef.resetFields()
			},
			// 移除图片前的提示
			beforeRemove(file, fileList) {
				return this.$confirm(`确定移除 ${ file.name }？`);
			},
			// 超出上传的限制数的提示
			handleExceed(files, fileList) {
				this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
			},
			// 首页图片文件数量改变
			handleChangeHome(file, fileList) {
				console.log(file);
				console.log(fileList);
				this.homeFileList = fileList.map(item => {
					return {
						name: item.name,
						url: item.url
					}
				})
			},
			// 列表页图片文件数量改变
			handleChangeList(file, fileList) {
				this.listFileList = fileList.map(item => {
					return {
						name: item.name,
						url: item.url
					}
				})
			},
			// 根据标题展示不同的对话框
			showDialog(title) {
				if (title === '首页') {
					this.addHomeDialogVisible = true
				} 
				if (title === '列表') {
					this.addListDialogVisible = true
				}
			}
		},
	}
</script>

