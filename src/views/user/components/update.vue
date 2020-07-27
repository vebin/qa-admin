<template>
  <div>
    <el-row>
      <el-col :span="18">
        <el-form ref="form" :model="formData" :rules="formRules" label-width="100px" label-suffix="：">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="头像" prop="avatar">
            <span v-for="(item, index) in avatarList" :key="index" @click="chooseAvatar(item)">
              <el-avatar :class="{ active: formData.avatar === item }" :src="item" />
            </span>
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input
              type="number"
              v-model="formData.phone"
              placeholder="请输入手机号"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" placeholder="请输入密码" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="签名" prop="signature">
            <el-input
              type="textarea"
              v-model="formData.signature"
              placeholder="请输入签名"
              maxlength="255"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" type="primary" @click="submit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "update",
  props: ["level"],
  data() {
    return {
      id: "",
      formData: {
        nickname: "",
        phone: "",
        password: "",
        level: "",
        avatar: "",
        signature: "这个人很懒, 什么都没留下",
      },
      formRules: {
        nickname: [{ required: true, message: "必填项" }],
        phone: [{ required: true, message: "必填项" }],
        password: [{ required: true, message: "必填项" }],
      },
      avatarList: [
        "/public/img/avatar/default.png",
        "/public/img/avatar/1.png",
        "/public/img/avatar/2.png",
        "/public/img/avatar/3.png",
        "/public/img/avatar/4.png",
        "/public/img/avatar/5.png",
        "/public/img/avatar/6.png",
        "/public/img/avatar/7.png",
        "/public/img/avatar/8.png",
        "/public/img/avatar/9.png",
        "/public/img/avatar/10.png",
      ],
      loading: false,
    };
  },
  created() {
    this.formData.level = this.level;
  },
  methods: {
    chooseAvatar(avatar) {
      this.formData.avatar = avatar;
    },

    submit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.loading = true;
        try {
          const res = await request({
            method: "POST",
            url: "/api/user",
            data: this.formData,
          });
          if (!res.success) {
            this.$message.error(res.message);
            return;
          }
          this.$message.success(res.message);
          this.$router.go(-1);
        } catch (e) {
          this.$message.error(e.message);
        } finally {
          this.loading = false;
        }
      });
    },
  },
};
</script>
