<template>
    <div class="chart-container">
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>图表统计</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-row type="flex" justify="space-between" class="score">
                <!-- 筛选区域 -->
                <el-radio-group class="radio" v-model="day">
                    <el-radio label="" @change="screenDay('')">全部</el-radio>
                    <el-radio label="week" @change="screenDay('week')">近七天</el-radio>
                    <el-radio label="month" @change="screenDay('month')">近一个月</el-radio>
                    <el-radio label="half-year" @change="screenDay('half-year')">近半年</el-radio>
                </el-radio-group>
                <!-- 评分 -->
                <div class="evaluation">
                    用户评分：
                    <el-rate v-model="value" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                </div>
            </el-row>
            
            <!-- 收入区域 -->
            <el-row type="flex" justify="space-around" class="price-row">
                <el-row :span="10">
                    <div>
                        <el-statistic group-separator="," :precision="2" :value="inPrice" :title="inTitle">
                            <template slot="prefix">
                                <i class="el-icon-s-flag" style="color: red"></i>
                            </template>
                        </el-statistic>
                    </div>
                </el-row>
                <el-row :span="10">
                    <div>
                        <el-statistic group-separator="," :precision="2" :value="outPrice" :title="outTitle">
                            <template slot="prefix">
                                <i class="el-icon-s-flag" style="color: blue"></i>
                            </template>
                        </el-statistic>
                    </div>
                </el-row>
            </el-row>
            <!-- 图表区域 -->
			<el-row type="flex" justify="space-around" class="chart-row">
				<el-col :span="6">
                    <div id="inChart" class="chart"></div>
				</el-col>
				<el-col :span="6">
                    <div id="outChart" class="chart"></div>
				</el-col>
			</el-row>
        </el-card>
    </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
    data() {
        return {
            // 店内就餐的信息
            inOrderFood: [],
            // 店内就餐的详细信息
            inFood: [],
            inTitle: '店内就餐的总收入',
            // 店内就餐的总收入
            inPrice: 0,
            // 打包带走的信息
            outOrderFood: [],
            // 打包带走的详细信息
            outFood: [],
            outTitle: '打包带走的总收入',
            // 打包带走的总收入
            outPrice: 0,
            // 筛选
            day: '',
            // 评分
            value: 0
        }
    },
    created() {
        this.getAllOrderFood(this.day)
        this.getScore()
    },
    methods: {
        // 获取数据
        async getAllOrderFood(day) {
            const {data: res} = await this.$http.get('getAllOrderFood', {
                params: {
                    date: day
                }
            })
            if (res.meta.status != 200) {
                return this.$message.error('信息获取失败')
            }
            this.$message.success('信息获取成功')
            for (let i = 0; i < res.orderFood.length; i++) {
                // method等于 1，代表店内就餐
                if (res.orderFood[i].method === 1) {
                    for (let index = 0; index < res.orderFood[i].foodList.length; index++) {
                        this.inOrderFood.push(res.orderFood[i].foodList[index])
                    }
                } else {
                    for (let index = 0; index < res.orderFood[i].foodList.length; index++) {
                        this.outOrderFood.push(res.orderFood[i].foodList[index])
                    }
                }
            }

            // 店内就餐的数据统计
            this.inFood = this.dataCount(this.inOrderFood, this.inFood);
            this.inPrice = this.priceCount(this.inOrderFood)

            // 打包带走的数据统计
            this.outFood = this.dataCount(this.outOrderFood, this.outFood);
            this.outPrice = this.priceCount(this.outOrderFood)

            this.drawLine(document.querySelector('#inChart'), '店内就餐的数据统计', this.inFood.map(i => i.food), this.inFood.map(i => i.number), 'red',)
            this.drawLine(document.querySelector('#outChart'), '打包带走的数据统计', this.outFood.map(i => i.food), this.outFood.map(i => i.number), 'blue')
        },
        // 获取评分
        async getScore() {
            const {data: res} = await this.$http.get('getScore');
            this.value = Number(res.score)
        },
        // 对输入数据进行统计
        // 输入未处理的数据，返回一个处理后的数据
        dataCount(unProcessArr, processArr) {
            // 根据名称对集合数组去重
            var nameArr = [...new Set(unProcessArr.map(i => i.food))];

            let list = [];
            // 对全部数组进行过滤，将名称相同的保存到数组 list 里
            nameArr.forEach(v => {
                let filterList = unProcessArr.filter(a => v == a.food);
                list.push(filterList)
            });

            let chartValues = [];
            // 对 list数组进行遍历
            list.forEach((item, index) => {
                // 对数组的每个元素进行求和，并返回总数
                let moneyAdd = item.reduce((total, g) => {
                    return total + Number(g.number)
                }, 0);
                chartValues.push(moneyAdd)
            })

            // 将两个数组的数据合并成一个数组对象
            processArr = nameArr.map((food, i) => ({
                // 取出 nameArr的每一项数据 food按照键值对的方式存入
                // 按照索引 i取出 chartValue的每一项数据，以键值对 number存入数组对象
                // 返回一个数组对象作为整个方法的 this的值赋值给处理后的 processArr数组
                food, number: chartValues[i]
            }))
            return processArr
        },
        // 总价格
        priceCount(unProcessArr) {
            var total = 0;
            unProcessArr.forEach(item => {
                return total += item.number * item.price
            });
            return total;
        },
        // 日期筛选
        screenDay(day) {
            if (day === '') {
                this.inOrderFood = []
                this.outOrderFood = []
                this.getAllOrderFood(day)
            }
            if (day === 'week') {
                // 一个月前的时间戳
                const date = new Date(new Date().toLocaleDateString()).getTime() - 7 * 24 * 3600 * 1000 + ''
                this.inOrderFood = []
                this.outOrderFood = []
                this.getAllOrderFood(date)
            }
            if (day === 'month') {
                // 一个月前的时间戳
                const date = new Date(new Date().toLocaleDateString()).getTime() - 31 * 24 * 3600 * 1000 + ''
                this.inOrderFood = []
                this.outOrderFood = []
                this.getAllOrderFood(date)
            }
            if (day === 'half-year') {
                // 半年前的时间戳
                const date = new Date(new Date().toLocaleDateString()).getTime() - 182 * 24 * 3600 * 1000 + ''
                this.inOrderFood = []
                this.outOrderFood = []
                this.getAllOrderFood(date)
            }
        },
        drawLine(id, text, x_data, s_data, color) {
            // 基于准备好的dom，初始化echarts实例
            let myChart = echarts.init(id)
            // 绘制图表
            myChart.setOption({
                title: { 
                    text: text,
                },
                legend: {
                    data: ['销量'],
                    x:'right'
                },
                tooltip: {},
                xAxis: {
                    data: x_data,
                    name: '菜名',
                    // 坐标轴轴线相关设置
                    axisLine: {
                        show: true, // 是否显示坐标轴轴线
                        symbol: ['none', 'arrow'], // 轴线两边的箭头，none表示没有箭头，arrow表示有箭头，可取值为字符串或长度为2的数组：默认不显示箭头 'none'。两端都显示箭头 'arrow'，只在末端显示箭头 ['none', 'arrow']
                        symbolSize: [10, 15], // 轴线两边的箭头的大小，第一个数字表示宽度（垂直坐标轴方向），第二个数字表示高度（平行坐标轴方向）,默认值[10, 15]。
                        symbolOffset: 10, // 轴线两边的箭头的偏移，如果是数组，第一个数字表示起始箭头的偏移，第二个数字表示末端箭头的偏移；如果是数字，表示这两个箭头使用同样的偏移。
                        // 坐标轴轴线样式设置
                        lineStyle: {
                            width: 1,
                            type: 'solid',
                        }
                    },
                },
                yAxis: {
                    name: '售出 / 道',
                    nameTextStyle: {
                        fontSize: '12px',
                    },
                    nameGap: '20',
                    // 坐标轴轴线相关设置
                    axisLine: {
                        show: true, // 是否显示坐标轴轴线
                        symbol: ['none', 'arrow'], // 轴线两边的箭头，none表示没有箭头，arrow表示有箭头，可取值为字符串或长度为2的数组：默认不显示箭头 'none'。两端都显示箭头 'arrow'，只在末端显示箭头 ['none', 'arrow']
                        symbolSize: [10, 15], // 轴线两边的箭头的大小，第一个数字表示宽度（垂直坐标轴方向），第二个数字表示高度（平行坐标轴方向）,默认值[10, 15]。
                        symbolOffset: 10, // 轴线两边的箭头的偏移，如果是数组，第一个数字表示起始箭头的偏移，第二个数字表示末端箭头的偏移；如果是数字，表示这两个箭头使用同样的偏移。
                        // 坐标轴轴线样式设置
                        lineStyle: {
                            width: 1,
                            type: 'solid',
                        }
                    },
                },
                series: [{
                    name: '销量',
                    type: 'bar',
                    data: s_data,
                    barWidth: '50%',
                    itemStyle: {
                        color: color,
                    }
                }],
                grid: {
                    top: '30%'
                },
            });
        }
    },
}
</script>

<style lang="less" scoped>
.radio {
    margin-bottom: 50px;
}
.score {
    margin: 0 50px;
}
.evaluation {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.price-row {
    margin-bottom: 20px;
}
.chart-row {
    padding-top: 30px;
}
.chart {
    width: 400px;
    height: 400px;
}
</style>