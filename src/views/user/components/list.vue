<template>
  <div class="qa-bd">
    <el-form ref="form" :model="formData" inline size="medium" label-suffix="：">
      <el-form-item prop="nickname">
        <el-input type="text" placeholder="请输入昵称" :clearable="true" v-model="formData.nickname" />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input type="text" :minlength="11" placeholder="请输入手机号" :clearable="true" v-model="formData.phone" />
      </el-form-item>
      <el-button size="medium" native-type="button" @click="reset">重置</el-button>
      <el-button type="primary" size="medium" icon="el-icon-search" native-type="button" @click="search">
        搜索
      </el-button>
    </el-form>

    <router-link v-if="level === 'TEACHER'" to="/user/teacher/0">
      <el-button type="primary" size="small" icon="el-icon-plus" native-type="button">添加教师</el-button>
    </router-link>
    <router-link v-if="level === 'STUDENT'" to="/user/student/0">
      <el-button type="primary" size="small" icon="el-icon-plus" native-type="button">添加学员</el-button>
    </router-link>

    <el-table
      style="margin: 15px 0;"
      v-loading="loading"
      :border="true"
      :stripe="true"
      :show-header="true"
      :data="list"
    >
      <el-table-column label="ID" width="60" prop="id" />
      <el-table-column label="头像" width="80px" prop="avatar">
        <template slot-scope="scope">
          <el-avatar size="small" :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column label="昵称" prop="nickname" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch
            style="display: block;"
            :value="scope.row.status === 'ENABLE'"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="启用"
            inactive-text="停用"
            @change="switchStatus($event, scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170" prop="createdAt" />
      <el-table-column label="更新时间" width="170" prop="updatedAt" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-popconfirm title="删除以后无法恢复, 是否继续？" @onConfirm="deleteUser(scope.row.id)">
            <el-button slot="reference" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div style="text-align: right; margin: 15px 0;">
      <el-pagination
        background
        :page-size="size"
        :total="total"
        :current-page="page"
        :page-sizes="[10, 20, 30, 50, 100]"
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";
import { dateFormat } from "@/utils/filters";

export default {
  name: "list",
  props: ["level"],
  filters: {
    dateFormat,
  },
  data() {
    return {
      formData: {
        nickname: "",
        phone: "",
        level: "TEACHER",
      },
      list: [],
      loading: false,
      total: 0,
      page: 1,
      size: 10,
    };
  },
  mounted() {
    this.formData.level = this.level;
    this.fetchTableData();
  },
  methods: {
    /**
     * 查询
     */
    search() {
      this.formData.page = 1;
      this.fetchTableData();
    },

    /**
     * 重置
     */
    reset() {
      this.page = 1;
      this.size = 10;
      this.$refs.form.resetFields();
      this.fetchTableData();
    },

    /**
     * 获取表格数据
     * @returns {Promise<*[]>}
     */
    async fetchTableData() {
      this.loading = true;
      try {
        const res = await request({
          method: "GET",
          url: "/api/user",
          params: this.formData,
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        const { list, total, page, size } = res.data;
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * size 改变时会触发
     * @param {number} size 新的页长
     */
    onSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.fetchTableData();
    },

    /**
     * page 改变时会触发
     * @param {number} page 新的页码
     */
    onPageChange(page) {
      this.page = page;
      this.fetchTableData();
    },

    async switchStatus(bool, id) {
      const loading = this.$loading();
      try {
        const res = await request({
          method: "POST",
          url: `/api/user/${id}/status`,
          data: { status: bool ? "ENABLE" : "DISABLE" },
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        this.$message.success(res.message);
        this.fetchTableData();
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },

    /**
     * 删除用户
     * @param {number} id 用户ID
     */
    async deleteUser(id) {
      const loading = this.$loading();
      try {
        const res = await request({
          method: "DELETE",
          url: `/api/user/${id}`,
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        this.$message.success(res.message);
        this.fetchTableData();
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },
  },
};
</script>
