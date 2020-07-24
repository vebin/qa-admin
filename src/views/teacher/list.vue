<template>
  <div class="qa-bd">
    <el-form ref="form" :model="formData" :inline="true" size="medium" label-suffix="：">
      <el-form-item prop="nickname">
        <el-input type="text" placeholder="请输入昵称" :clearable="true" v-model="formData.nickname" />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input type="text" :minlength="11" placeholder="请输入手机号" :clearable="true" v-model="formData.phone" />
      </el-form-item>
      <el-button size="medium" native-type="button">重置</el-button>
      <el-button type="primary" size="medium" icon="el-icon-search" native-type="button">搜索</el-button>
    </el-form>
    <el-button type="primary" size="small" icon="el-icon-plus" native-type="button">新增</el-button>

    <el-table style="margin: 15px 0;" :loading="loading" :border="true" :stripe="true" :show-header="true" :data="list">
      <el-table-column label="ID" :sortable="true" prop="id" />
      <el-table-column label="用户名" prop="name" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="操作" prop="action" />
    </el-table>

    <div v-if="0" style="text-align: right; margin: 15px 0;">
      <el-pagination
        :page-size="10"
        :background="true"
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

export default {
  name: "ListPage",
  data() {
    return {
      formData: {
        nickname: "",
        phone: "",
        type: "TEACHER"
      },
      list: [],
      loading: false,
      total: 0,
      page: 1,
      size: 10,
    };
  },
  mounted() {
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
  },
};
</script>
