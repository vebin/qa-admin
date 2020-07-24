<template>
  <div class="qa-bd">
    <el-form ref="form" :model="formData" inline label-suffix="：">
      <el-form-item prop="nickname">
        <el-input type="text" placeholder="请输入名称" :clearable="true" v-model="formData.nickname" />
      </el-form-item>
      <el-button size="medium" native-type="button">重置</el-button>
      <el-button type="primary" size="medium" icon="el-icon-search" native-type="button">搜索</el-button>
    </el-form>

    <el-button type="primary" size="small" icon="el-icon-plus" @click="showDialog">新增</el-button>

    <el-table size="medium" style="margin: 15px 0;" :loading="loading" :border="true" :stripe="true" :data="list">
      <el-table-column label="ID" :sortable="true" width="80" prop="id" />
      <el-table-column label="名称" prop="name" width="200" />
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'ENABLE'" type="success">启用</el-tag>
          <el-tag v-if="scope.row.status === 'DISABLE'" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdAt" />
      <el-table-column label="更新时间" prop="updatedAt" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text">编辑</el-button>
          <el-button type="text">删除</el-button>
        </template>
      </el-table-column>
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

    <el-dialog :visible.sync="visible" title="输入试卷名称" :before-close="closeDialog">
      <el-form ref="dialogForm" :model="dialogForm" :rules="dialogRules" label-width="120px" label-suffix="：">
        <el-form-item label="试卷名称" prop="name">
          <el-input type="textarea" v-model="dialogForm.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="dialogForm.type">
            <el-radio label="EXAM">考试</el-radio>
            <el-radio label="PRACTICE">练习册</el-radio>
          </el-radio-group>
          <div v-if="dialogForm.type === 'EXAM'">考试模式: 统一收卷, 统一批卷</div>
          <div v-if="dialogForm.type === 'PRACTICE'">练习模式: 学员可以随时答题, 随时查看结果</div>
        </el-form-item>
        <el-form-item v-if="dialogForm.type === 'EXAM'" label="考试时长(分钟)">
          <el-slider v-model="dialogForm.limit" :min="1" :max="120" />
          <div>{{ dialogForm.limit }} 分钟后收卷, 届时学员将无法提交</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="createPaper">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "paper-list",
  data() {
    return {
      formData: {
        name: "",
      },
      list: [],
      loading: false,
      total: 0,
      page: 1,
      size: 10,

      visible: false,
      dialogForm: {
        name: "",
        type: "PRACTICE",
        limit: 10,
      },
      dialogRules: {
        name: [{ required: true, message: "必填项" }],
        type: [{ required: true, message: "必填项" }],
      },
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
          url: "/api/paper",
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

    showDialog() {
      this.visible = true;
    },

    closeDialog() {
      this.$refs.dialogForm.resetFields();
      this.dialogForm = {
        name: "",
        type: "PRACTICE",
      };
      this.visible = false;
    },

    createPaper() {
      const { name, type, limit } = this.dialogForm;
      this.$refs.dialogForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const loading = this.$loading();
        // let endAt;
        // if (type === "EXAM") {
        //   const currentTS = +new Date();
        //   endAt = currentTS + limit * 60 * 1000;
        // }
        try {
          const res = await request({
            method: "POST",
            url: "/api/paper",
            data: { name, type, limit },
          });
          if (!res.success) {
            this.$message.error(res.message);
            return;
          }
          this.$router.push(`/paper/create?id=${res.data}`);
        } catch (e) {
          this.$message.error(e.message);
        } finally {
          loading.close();
        }
      });
    },
  },
};
</script>
