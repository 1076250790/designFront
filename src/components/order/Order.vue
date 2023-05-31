<template>
    <div class="order-container">
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单展示</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加区域 -->
			<el-row :gutter="30">
				<el-col :span="9">
					<el-input placeholder="请输入用户id" clearable v-model="queryInfo.query"  @clear="getOrderList">
						<el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
					</el-input>
				</el-col>
			</el-row>

            <!-- 分类表格区域 -->
            <tree-table class="treeTable" :data="orderList" :columns="columns" 
            :selection-type="false" :expand-type="false" 
            show-index index-text="#" border :show-row-hover="false">
                <template slot="state" slot-scope="scope">
                    <i class="el-icon-success" style="color: seagreen;" v-if="scope.row.state === true"></i>
                    <i class="el-icon-error" style="color: red;" v-if="scope.row.state === false"></i>
                </template>
                <template slot="method" slot-scope="scope">
                    <el-tag type="primary" v-if="scope.row.method === 1">店内就餐</el-tag>
                    <el-tag type="success" v-if="scope.row.method === 2">打包带走</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <!-- 分类的编辑按钮 -->
                    <el-button type="primary" icon="el-icon-check" size="mini" @click="editOrder(scope.row)" v-if="scope.row.state" disabled>出餐</el-button>
                    <el-button type="primary" icon="el-icon-check" size="mini" @click="editOrder(scope.row)" v-if="scope.row.state === false">出餐</el-button>
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
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 订单列表
            orderList: [],
            // 查询条件
            queryInfo: {
                query: '',
                pageNum: 1,
                pageSize: 5
            },
            // 订单总数
            total: 0,
            // 表格各项的配置
            columns: [
                {
                    // 列标题名称
                    label: '用户 id',
                    minWidth: 200,
                    // 列内容属性名
                    // 获取的数据的字列表需要用 children:[]包裹，并且属性名内外都要一致
                    prop: 'food'
                }, {
                    label: '桌号',
                    prop: 'table_id'
                }, {
                    label: '下单时间',
                    minWidth: 200,
                    prop: 'place_time'
                }, {
                    label: '总数（单位：道）',
                    minWidth: 130,
                    prop: 'number'
                }, {
                    label: '总价（单位：￥）',
                    minWidth: 130,
                    prop: 'price'
                }, {
                    label: '是否出餐',
                    minWidth: 100,
                    // 表示: 将当前列定义为模板列
                    type: 'template',
                    template: 'state'
                }, {
                    label: '出餐时间',
                    minWidth: 200,
                    prop: 'complete_time'
                }, {
                    label: '就餐方式',
                    minWidth: 130,
                    // 表示: 将当前列定义为模板列
                    type: 'template',
                    template: 'method'
                },{
                    label: '操作',
                    minWidth: 200,
                    // 表示: 将当前列定义为模板列
                    type: 'template',
                    template: 'opt'
                }
            ],
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        // 获取订单
        async getOrderList() {
            const {data: res} = await this.$http.get('getAllOrder', {
				params: this.queryInfo
			})
            if (res.meta.status != 200) {
                return this.$message.error('获取订单数据失败')
            }
            this.$message.success('获取订单数据成功')
            console.log(res);
            this.orderList = res.orderList
            this.total = res.total
        },
        // 出餐
        async editOrder(row) {
            const {data: res} = await this.$http.get('editOrderState', {
                params: {
                    "user_id": row.food,
                    "place_time": row.place_time,
                    "state": row.state
                }
            })
            if (res.meta.status == 500) {
                return this.$message.error('出餐失败')
            }
            if (res.meta.status == 405) {
                return this.$message.warning('已经出餐')
            }
            this.$message.success('出餐成功')
            this.getOrderList();
        },
        // 监听 pageSize的改变
        handleSizeChange(newSize) {
            this.queryInfo.pageSize = newSize
            this.getOrderList()
        },
        // 监听 pageNum的改变
        handleCurrentChange(newPage) {
            this.queryInfo.pageNum = newPage
            this.getOrderList()
        },
    },
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
</style>