<template>
    <div>
        <el-form ref="loginInfo" :rules="rules" :model="loginInfo" class="loginContainer">
            <h3 class="loginTitle">Mini社区管理系统</h3>
            <el-form-item prop="account">
                <el-input
                    size="normal"
                    type="text"
                    v-model="loginInfo.account"
                    auto-complete="off"
                    placeholder="请输入用户名"
                ></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input
                    size="normal"
                    type="password"
                    v-model="loginInfo.password"
                    auto-complete="off"
                    placeholder="请输入密码"
                ></el-input>
            </el-form-item>
             <el-form-item prop="verifyCode">
                <el-input
                    size="normal"
                    type="text"
                    v-model="loginInfo.verifyCode"
                    auto-complete="off"
                    placeholder="请输入密验证码"
                    style="width:240px;margin-right: 10px;"
                ></el-input>
                 <img :src="verify" @click="refreshVerifyCode" alt="" style="cursor: pointer">
            </el-form-item>
            <!-- <el-checkbox size="normal" class="loginRemember" v-model="checked"></el-checkbox> -->
            <el-button size="normal" type="primary" style="width: 100%;" @click="login">登录</el-button>
        </el-form>
    </div>
</template>

<script>
export default {
    data: () => ({
        loginInfo: {
            account: "admin",
            password: "123",
            verifyCode: "",
        },
        verify:"/verify?time" + +new Date(), 
        checked: true,
        rules: {
            account: [
                { required: true, message: "请输入用户名", trigger: "blur" }
            ],
            password: [
                { required: true, message: "请输入密码", trigger: "blur" }
            ],
            verifyCode: [
                { required: true, message: "请输入验证码", trigger: "blur" }
            ]
        }
    }),
    computed: {},
    methods: {
        refreshVerifyCode() {
            this.verify = "/verify?time" + +new Date();
        },
        // 登录方法
        login() {
            this.$refs.loginInfo.validate(valid => {
                if (valid) {
                    this.postKeyValueRequest("/login", this.loginInfo).then(
                        response => {
                            console.log(response);
                            // 保存用户对象
                            window.sessionStorage.setItem(
                                "user",
                                JSON.stringify(response.object.data)
                            );
                            // 保存token
                            this.$store.commit(
                                "updateToken",
                                response.object.token
                            );
                            // 保存token到session
                            window.sessionStorage.setItem(
                                "token",
                                response.object.token
                            );

                            this.$router.replace("/index");
                        }
                    );
                } else {
                    return false;
                }
            });
        }
    }
};
</script>
<style>
.loginContainer {
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 30px 35px 30px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
}

.loginTitle {
    margin: 15px auto 20px auto;
    text-align: center;
    color: #409eff;
}

.loginRemember {
    text-align: left;
    margin: 0px 0px 15px 0px;
}
.el-form-item__content {
    display: flex;
    align-items: center;
}
</style>