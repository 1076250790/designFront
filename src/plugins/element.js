import Vue from 'vue'
import {
    Button,
    Form,
    FormItem,
    Input,
    Message,
    Header,
    Aside,
    Container,
    Main,
    Menu,
    Submenu,
    MenuItem,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    Row,
    Col,
    Table,
    TableColumn,
    Image,
    Tag,
    Switch,
    Tooltip,
    Pagination,
    Dialog,
    Select,
    Option,
    MessageBox,
    Upload,
    Statistic,
    RadioGroup,
    Radio,
    Rate
} from 'element-ui'


// 表单
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 布局
Vue.use(Header)
Vue.use(Aside)
Vue.use(Container)
Vue.use(Main)

// 侧边栏菜单
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)

// 面包屑
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)

// 卡片视图
Vue.use(Card)

// 栅格
Vue.use(Row)
Vue.use(Col)

// 表格
Vue.use(Table)
Vue.use(TableColumn)

// 图片
Vue.use(Image)

// 标签
Vue.use(Tag)

// 开关
Vue.use(Switch)

// 文字提示
Vue.use(Tooltip)

// 分页
Vue.use(Pagination)

// 对话框
Vue.use(Dialog)

// 选择框
Vue.use(Select)
Vue.use(Option)

// 图片上传
Vue.use(Upload)

// 统计数值
Vue.use(Statistic)

// 单选框
Vue.use(RadioGroup)
Vue.use(Radio)

// 评分
Vue.use(Rate)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm