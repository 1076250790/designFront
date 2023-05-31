<template>
    <div class="table-container">
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>餐桌设置</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加区域 -->
			<el-row :gutter="30">
				<el-col :span="8">
					<el-input placeholder="请输入餐桌号" clearable v-model="queryInfo.query" @clear="getTableList">
						<el-button slot="append" icon="el-icon-search" @click="getTableList"></el-button>
					</el-input>
				</el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="showAddTable">添加餐桌</el-button>
                </el-col>
			</el-row>

            <!-- 表单区域 -->
            <el-table :data="tableList" border stripe fit row-key>
                <el-table-column label="#" type="index" width="50" align="center"></el-table-column>
                <el-table-column label="餐桌编号" prop="table_id" align="center" min-width="120"></el-table-column>
                <el-table-column label="餐桌大小" prop="table_category" align="center" min-width="120"></el-table-column>
                <el-table-column label="人数（单位：人）" prop="person" align="center" min-width="100"></el-table-column>
                <el-table-column label="空位" align="center" min-width="100">
                    <!-- slot-scope属性可以通过 scope.row获取到这一行的所有数据 -->
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.state" 
                            @change="adminStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
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

        <!-- 添加管理员的对话框 -->
        <el-dialog title="添加管理员" :visible.sync="addDialogVisible" width="40%"
            @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item label="餐桌编号" prop="table_id">
                    <el-input v-model="addForm.table_id" disabled></el-input>
                </el-form-item>
                <el-form-item label="餐桌大小" prop="table_category">
                    <el-select v-model="addForm.table_category" placeholder="请选择餐桌大小">
						<el-option label="小桌" value="小桌"></el-option>
						<el-option label="中桌" value="中桌"></el-option>
						<el-option label="大桌" value="大桌"></el-option>
					</el-select>
                </el-form-item>
                <el-form-item label="餐桌人数" prop="person">
                    <el-select v-model="addForm.person" placeholder="请选择餐桌人数">
						<el-option label="1~4" value="1~4"></el-option>
						<el-option label="5~9" value="5~9"></el-option>
						<el-option label="10+" value="10+"></el-option>
					</el-select>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addTable">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        var personRule = (rule, value, cb) => {
			// 验证管理员账号的正则表达式
			const regPerson = /^\d{1}$/;
			if (regPerson.test(value)) {
				return cb();
			}
			// 校验失败的提示
			cb(new Error('请输入数字'));
		}
        return {
            // 查询条件
            queryInfo: {
                query: '',
                pageNum: 1,
                pageSize: 5
            },
            // 餐桌数据
            tableList: [],
            // 餐桌数
            total: 0,
            // 控制添加餐桌的对话框的显示与隐藏
            addDialogVisible: false,
            // 添加表单
            addForm: {
                table_id: '',
                table_category: '',
                person: '',
                state: true
            },
            // 添加餐桌的表单规则
            addFormRules: {
                
            }
        }
    },
    created() {
        this.getTableList()
    },
    methods: {
        async getTableList() {
            const {data: res} = await this.$http.get('getAllTable', {
                params: this.queryInfo
            })
            this.tableList = res.tableList
            this.total = res.total
            console.log(res);
        },
        // 监听 pagesize改变的事件
        handleSizeChange(newSize) {
			this.queryInfo.pageSize = newSize;
			this.getTableList();
        },
        // 监听 页码值 改变的事件 
        handleCurrentChange(newPage) {
          	this.queryInfo.pageNum = newPage;
          	this.getTableList();
        },
        // 删除餐桌信息
        async deleteReply(row) {
            const {data: res} = await this.$http.get('deleteTable', {
                params: {
                    "table_id": row.table_id
                }
            })
            if (res.meta.status != 200) {
                return this.$message.error('删除失败')
            }
            this.$message.success('删除成功')
            this.getTableList()
        },
        // 点击修改餐桌状态
        async adminStateChanged(row) {
            const {data: res} = await this.$http.get('changeTableState', {
                params: {
                    "table_id": row.table_id,
                    "state": row.state
                }
            })
            console.log(res);
        },
        // 点击添加餐桌按钮弹出对话框
        async showAddTable() {
            this.addDialogVisible = true
            const {data: res} = await this.$http.get('getLastTableId')
            this.addForm.table_id = res.table_id + 1
        },
        // 监听添加用户对话框的关闭事件
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
        // 添加餐桌
        async addTable() {
            const {data: res} = await this.$http.post('addTable', this.addForm)
            if (res.meta.status != 200) {
                return this.$message.error('添加失败')
            }
            this.$message.success('添加成功')
            this.addDialogVisible = false
        }
    },
}
</script>

<style>

</style>