<template>
  <div class="login-container">
    <div class="father">
        <div class="mountain1">
            <div class="mountain2">
                <div class="bear"></div>
            </div>
        </div>
    </div>
    <div class="login_box">
        <!-- 登录表单区域 -->
        <el-form :model="loginForm" label-width="100px">
            <!-- 用户名 -->
            <el-form-item label="管理员账号">
              <el-input v-model="loginForm.admin_id"></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item label="管理员密码">
                <el-input show-password v-model="loginForm.password"></el-input>
            </el-form-item>
            <!-- 按钮区域 -->
            <div class="btn-container">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="reset">重置</el-button>
            </div>
        </el-form>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            // 登录表单
            loginForm: {
                admin_id: '',
                password: ''
            }
        }
    },
    methods: {
        async login() {
            if (this.loginForm.admin_id !== "" && this.loginForm.password !== "") {
                const {data: res} = await this.$http.post('login', this.loginForm)
                if (res.meta.status !== 200) {
                    return this.$message.error('账号或密码错误')
                }
                if (res.state === 0) {
                    return this.$message.error('账号未启用')
                }
                if (res.state !== 0 && res.meta.status === 200) {
                    window.sessionStorage.setItem("token", res.token)
                    window.sessionStorage.setItem("power", res.power)
                    window.sessionStorage.setItem("admin_name", res.admin_name)
                    this.$router.push('/home');
                    this.$message.success('登录成功');
                }
            } else {
                return this.$message.error('账号或密码不能为空')
            }
        },
        reset() {
            console.log(document.querySelector('.login-container'));
            this.loginForm.admin_id = ''
            this.loginForm.password = ''
        }
    }
}
</script>

<style lang="less" scoped>

.login-container {
    background-color: #000;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.father {
    width: 100%;
    height: 300px;
    position: fixed;
    bottom: 11%;
    z-index: 1;
}

.mountain1 {
    position: absolute;
    width: 100%;
    height: 600px;
    background: url(../../../../../PC端案例/小熊奔跑/bg2.png);
    animation: mountain 45s linear infinite forwards;
}

.mountain2 {
    position: relative;
    top: 100px;
    width: 100%;
    height: 300px;
    background: url(../../../../../PC端案例/小熊奔跑/bg1.png);
    animation: mountain 40s linear infinite forwards;
}

@keyframes mountain {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 180% 0;
    }
}

.bear {
    position: absolute;
    top: 180px;
    width: 200px;
    height: 100px;
    transform: translateX(-200px);
    background: url(../../../../../PC端案例/小熊奔跑/bear.png) no-repeat;
    animation: bear 1s steps(8) infinite, move 5s forwards;
}

@keyframes bear {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: -1600px 0;
    }
}

@keyframes move {
    0% {
        left: 0;
    }

    100% {
        left: 50%;
        transform: translateX(-50%);
    }
}

.login {
    background-color: #CFECEC;
    margin: 0 auto;
    width: 450px;
    height: 300px;
    border: 1px solid #ccc;
    box-shadow: 0 0 20px rgb(255, 255, 255);
    transform: translateY(50%);
}

.up {
    text-align: center;
    margin: 50px 0 20px;
}

.up li {
    list-style: none;
    display: inline;
}

.up h1 {
    display: inline;
    cursor: pointer;
    padding: 0px 10px;
}

.up ul {
    padding: 0;
}

.down {
    text-align: center;
}

.down input {
    width: 200px;
    border: 1px solid #779a9b;
    padding-left: 10px;
    background-color: #CFECEC;
    margin: 0 auto;
    display: block;
    height: 30px;
    outline: none;
    margin-top: 10px;
    border-radius: 20px;
}

.down_login {
    transform: translateY(10%);
}

.down_login .psw {
    margin-left: 16px;
}

.down_register {
    display: none;
}

button {
    outline: none;
    margin-top: 20px;
    width: 100px;
    height: 40px;
    border-radius: 25px;
    border: 1px solid #736AFF;
    background-color: #357EC7;
    color: white;
    cursor: pointer;
}

.star {
    position: absolute;
    color: white;
    width: 0;
    height: 0;
    opacity: 0;
    border: 2px solid transparent;
    border-bottom: 4px solid #fff;
    animation: flash 2s linear infinite;
    transform: translateX(0);
    z-index: 1;
}

.star::before {
    content: "";
    position: absolute;
    left: -2px;
    top: 4px;
    border: 2px solid transparent;
    border-top: 4px solid #fff;
}

@keyframes flash {
    20% {
        opacity: 0;
        transform: translateX(-20px);
    }

    40% {
        opacity: .5;
        transform: translateX(-40px);
    }

    60% {
        opacity: 1;
        transform: translateX(-60px);
    }

    80% {
        opacity: .5;
        transform: translateX(-80px);
    }

    100% {
        opacity: 0;
        transform: translateX(-100px);
    }
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #CFECEC;
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 20px rgb(255, 255, 255);
    transform: translateY(-50%);
}
.btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>