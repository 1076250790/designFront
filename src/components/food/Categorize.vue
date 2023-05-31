<template>
  <div class="categorize-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
        <el-breadcrumb-item>菜品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
        <el-row>
            <el-col>
                <!-- 添加区域 -->
                <el-button type="primary" @click="showAddCategorize">添加分类</el-button>
            </el-col>
        </el-row>

        <!-- 分类表格区域 -->
        <tree-table class="treeTable" :data="categorize" :columns="columns" 
        :selection-type="false" :expand-type="false" 
        show-index index-text="#" border :show-row-hover="false">
            <template slot="isok">
                <i class="el-icon-success" style="color: seagreen;"></i>
            </template>
            <template slot="order" slot-scope="scope">
                <el-tag type="primary" v-if="scope.row.type">分类</el-tag>
                <el-tag type="success" v-else>菜色</el-tag>
            </template>
            <template slot="opt" slot-scope="scope">
                <!-- 分类的编辑按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editType(scope.row)" v-if="scope.row.type">编辑</el-button>
                <!-- 菜品的移动到其他分类按钮 -->
                <el-button type="warning" icon="el-icon-rank" size="mini" @click="moveFood(scope.row.food_id)" v-else>移动</el-button>
                <!-- 分类的删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteType(scope.row)" v-if="scope.row.type">删除</el-button>
            </template>
        </tree-table>

        <!-- 分页区域 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pageNum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="40%"
        @close="addDialogClosed">
        <!-- 内容主体 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item label="id">
                <el-input v-model="addForm.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="分类id"  prop="type_pinyin">
                <el-input v-model="addForm.type_pinyin"></el-input>
            </el-form-item>
            <el-form-item label="分类名" prop="type_name">
                <el-input v-model="addForm.type_name"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
		<span slot="footer" class="dialog-footer">
			<el-button @click="addDialogVisible = false">取 消</el-button>
			<el-button type="primary" @click="addFoodType">确 定</el-button>
		</span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="editDialogVisible" width="40%"
        @close="editDialogClosed">
        <!-- 内容主体 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="id">
                <el-input v-model="editForm.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="分类id"  prop="type_pinyin">
                <el-input v-model="editForm.type_pinyin"></el-input>
            </el-form-item>
            <el-form-item label="分类名" prop="type_name">
                <el-input v-model="editForm.type_name"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
		<span slot="footer" class="dialog-footer">
			<el-button @click="addDialogVisible = false">取 消</el-button>
			<el-button type="primary" @click="editFoodType">确 定</el-button>
		</span>
    </el-dialog>

    <!-- 移动菜品的对话框 -->
    <el-dialog title="移动的分类" :visible.sync="moveDialogVisible" width="40%"
		@close="moveDialogClosed">
		<!-- 内容主体 -->
		<el-form :model="moveForm" :rules="moveFormRules" ref="moveFormRef" label-width="100px">
			<el-form-item label="菜品名">
                <el-input v-model="moveForm.food_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="分类" prop="categorize">
				<el-select v-model="moveForm.type_name" placeholder="请选择分类">
                    <el-option :label="item.type_name" :value="item.type_name" 
						v-for="(item, index) in JSON.parse(JSON.stringify(this.food_type))" 
						:key="index"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
		<!-- 底部区域 -->
		<span slot="footer" class="dialog-footer">
			<el-button @click="moveDialogVisible = false">取 消</el-button>
			<el-button type="primary" @click="moveFoodType">确 定</el-button>
		</span>
	</el-dialog>
  </div>
</template>

<script>
export default {
    data() {
        var typePinYinRule = (rule, value, cb) => {
            // 验证分类 id的正则表达式
            const regTypePinYin = /^[A-Za-z]+$/;
            if (regTypePinYin.test(value)) {
                return cb();
            }
            cb(new Error('请输入大小写字母'))
        }
        var typeNameRule = (rule, value, cb) => {
            // 验证分类名的正则表达式
            const regTypeName = /^[\u4e00-\u9fa5]/;
            if (regTypeName.test(value)) {
                return cb();
            }
            cb(new Error('请输入汉字'))
        }
        return {
            // 查询条件
            queryInfo: {
                query: '',
                pageNum: 1,
                pageSize: 5
            },
            // 分类数据
            categorize: [],
            // 菜品分类
			food_type: [],
            // 总条数
            total: 0,
            // 表格各项的配置
            columns: [
                {
                    // 列标题名称
                    label: '分类名称',
                    minWidth: 200,
                    // 列内容属性名
                    // 获取的数据的字列表需要用 children:[]包裹，并且属性名内外都要一致
                    prop: 'food_name'
                }, {
                    label: '是否有效',
                    // 表示: 将当前列定义为模板列
                    type: 'template',
                    template: 'isok'
                }, {
                    label: '菜单',
                    // 表示: 将当前列定义为模板列
                    type: 'template',
                    template: 'order'
                }, {
                    label: '操作',
                    minWidth: 200,
                    // 表示: 将当前列定义为模板列
                    type: 'template',
                    template: 'opt'
                }
            ],
            // 控制移动菜品对话框的显示与隐藏
            moveDialogVisible: false,
            // 移动菜品表单
            moveForm: {},
            // 移动菜品表单提交的规则
            moveFormRules: {
                food_type: [
					// 必填项
					{ required: true, message: '请选择分类', trigger: 'blur'},
				],
            },
            // 控制添加分类对话框的显示与隐藏
            addDialogVisible: false,
            // 添加分类表单
            addForm: {
                id: 0,
                type_name: '',
                type_pinyin: ''
            },
            // 添加分类表单的规则
            addFormRules: {
                type_pinyin: [
                    // 必填项
					{ required: true, message: '请输入分类id', trigger: 'blur'},
                    // 名称是否合法
					{ validator: typePinYinRule, trigger: 'blur' }
                ],
                type_name: [
                    // 必填项
                    { required: true, message: '请选择分类名', trigger: 'blur'},
                    // 名称是否合法
                    { validator: typeNameRule, trigger: 'blur' }
                ]
            },
            // 编辑分类表单
            editForm: {
                id: '',
                type_pinyin: '',
                type_name: ''
            },
            // 编辑分类表单的规则
            editFormRules: {
                type_pinyin: [
                    // 必填项
					{ required: true, message: '请输入分类id', trigger: 'blur'},
                    // 名称是否合法
					{ validator: typePinYinRule, trigger: 'blur' }
                ],
                type_name: [
                    // 必填项
                    { required: true, message: '请选择分类名', trigger: 'blur'},
                    // 名称是否合法
                    { validator: typeNameRule, trigger: 'blur' }
                ]
            },
            // 控制编辑分类对话框的显示和隐藏
            editDialogVisible: false
        }
    },
    created() {
        this.getCateList();
    },
    methods: {
        // 获取分类
        async getCateList() {
			const {data: res} = await this.$http.get('getCateList', {
				params: this.queryInfo
			});
			console.log(res);
            if (res === '') {
                return this.$message.error('分类获取失败');
            }
            this.$message.success('分类获取成功');
            // 把分类数据和总条数进行赋值
            this.categorize = res.msg
            this.total = res.total
		},
        // 监听 pageSize的改变
        handleSizeChange(newSize) {
            this.queryInfo.pageSize = newSize
            this.getCateList()
        },
        // 监听 pageNum的改变
        handleCurrentChange(newPage) {
            this.queryInfo.pageNum = newPage
            this.getCateList()
        },
        // 点击移动按钮显示提示框
        async moveFood(id) {
            console.log(id);
            const confirmResult = await this.$confirm('是否移动此道菜的分类', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)

			// 如果用户确认删除，则返回值为字符串 confirm
			// 如果用户取消了删除，则返回值为字符串 cancel
            if (confirmResult !== 'confirm') {
				return this.$message.info('已取消移动');
			}
			this.moveDialogVisible = true
			const { data: res } = await this.$http.get('getFoodType');
            console.log(res);
            this.food_type = res.foodType
            const { data: res2 } = await this.$http.get
			('editFood', {
				params: {
					"food_id": id
				}
			});
            // 把值赋给移动表单
            this.moveForm = res2.food
        },
        // 监听移动菜品分类对话框的关闭事件
		moveDialogClosed() {
			this.$refs.moveFormRef.resetFields();
		},
        // 移动菜品到指定的分类
        moveFoodType() {
            this.$refs.moveFormRef.validate(async valid => {
                if (!valid) return;
                // 可以发起添加新菜品的网络请求
				const {data: res} = await this.$http.get('moveFoodType', {
                    params: {
                        "food_id": this.moveForm.food_id,
                        "type_name": this.moveForm.type_name
                    }
                });
                console.log(res);
                if(res.meta.status !== 201) {
                    return this.$message.error('移动失败');
                }
                this.moveDialogVisible = false
                this.$message.success('移动成功')
                this.getCateList()
            })
        },
        // 点击添加分类显示添加分类框
        async showAddCategorize() {
            this.addDialogVisible = true
            const {data: res} = await this.$http.get('getLastFoodTypeId')
            console.log(res);
            if (res.meta.status !== 200) {
                return this.$message.error('获取id失败')
            }
            this.$message.success('获取id成功')
            this.addForm.id = res.type_id + 1
        },
        // 监听添加菜品分类对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击确定添加分类
        addFoodType() {
            this.$refs.addFormRef.validate(async valid => {
				if (!valid) return;
                // 可以发起添加新分类的网络请求
                const {data: res} = await this.$http.post('addFoodType', this.addForm)
                if (res.meta.status !== 200) {
                    this.addDialogVisible = false
                    return this.$message.error('添加失败')
                }
                this.addDialogVisible = false
                this.$message.success('添加成功')
                this.getCateList()
            })
        },
        // 删除分类
        async deleteType(row) {
            if (row.children.length === 0) {
                const confirmResult = await this.$confirm('是否删除此分类', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                // 如果用户确认删除，则返回值为字符串 confirm
                // 如果用户取消了删除，则返回值为字符串 cancel
                if (confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除');
                }
                const {data: res} = await this.$http.get('deleteType', {
                    params: {
                        "type_pinyin": row.id
                    }
                })
                if (res.meta.status !== 201) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getCateList()
            } else {
                const confirmResult = await this.$confirm('请先确保分类内部没有菜品', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
            }
        },
        // 编辑分类
        async editType(row) {
            console.log(row);
            this.editDialogVisible = true
            const {data: res} = await this.$http.get('getTypeIdByTypePinYin', {
                params: {
                    "type_pinyin": row.id
                }
            })
            console.log(res);
            this.editForm.id = res.type_id
        },
        // 监听编辑菜品分类对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 发送编辑分类表单数据
        editFoodType() {
            console.log(this.editForm);
            this.$refs.editFormRef.validate(async valid => {
				if (!valid) return;
                // 可以发起添加新分类的网络请求
                const {data: res} = await this.$http.post('editTypeMsg', this.editForm)
                console.log(res);
                if (res.meta.status != 200) {
                    this.editDialogVisible = false
                    return this.$message.error('修改失败')
                }
                this.editDialogVisible = false
                this.$message.success('修改成功')
                this.getCateList()
            })
        }
    },
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
</style>