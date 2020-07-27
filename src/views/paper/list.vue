<template>
  <div class="qa-bd">
    <el-form ref="form" :model="formData" inline label-suffix="：">
      <el-form-item prop="nickname">
        <el-input type="text" placeholder="请输入名称" :clearable="true" v-model="formData.nickname" />
      </el-form-item>
      <el-button size="medium" native-type="button">重置</el-button>
      <el-button type="primary" size="medium" icon="el-icon-search" native-type="button">搜索</el-button>
    </el-form>

    <el-button type="text" icon="el-icon-plus" @click="showDialog()">添加试卷</el-button>

    <el-table size="medium" style="margin: 15px 0;" v-loading="loading" :border="true" :stripe="true" :data="list">
      <el-table-column label="ID" :sortable="true" width="80" prop="id" />
      <el-table-column label="名称" width="200">
        <template slot-scope="scope">
          <router-link :to="'/paper/update/' + scope.row.id" class="el-link el-link--primary">
            {{ scope.row.name }}
          </router-link>
        </template>
      </el-table-column>
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
      <el-table-column label="创建时间" prop="createdAt" />
      <el-table-column label="更新时间" prop="updatedAt" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <router-link :to="'/paper/update/' + scope.row.id" class="el-link el-link--primary">
            查看
          </router-link>
          <el-divider direction="vertical" />
          <span class="el-link el-link--primary" @click="showDialog(scope.row)">编辑</span>
          <el-divider direction="vertical" />
          <el-popconfirm title="删除以后无法恢复, 是否继续？" @onConfirm="removePaper(scope.row.id)">
            <span slot="reference" class="el-link el-link--danger">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div style="text-align: right; margin: 15px 0;">
      <el-pagination
        :page-size="size"
        background
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
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="dialogForm.desc" placeholder="描述信息" maxlength="255" show-word-limit />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button :loading="dialogLoading" type="primary" @click="onDialogOk">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import request from "@/utils/request";
import { sleep } from "@/utils";

export default {
  name: "paper-list",
  data() {
    return {
      formData: {
        name: "",
        type: "",
      },
      list: [],
      loading: false,
      total: 0,
      page: 1,
      size: 10,

      visible: false,
      dialogForm: {
        id: -1,
        name: "",
        type: "PRACTICE",
        limit: 10,
        desc: "",
      },
      dialogRules: {
        name: [{ required: true, message: "必填项" }],
        type: [{ required: true, message: "必填项" }],
      },
      dialogLoading: false,
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
      this.formData = {
        name: "",
        type: "",
      };
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

    showDialog(paper) {
      if (paper) {
        this.dialogForm = _.pick(paper, ["id", "name", "type", "limit", "desc"]);
      }
      this.visible = true;
    },

    closeDialog() {
      this.$refs.dialogForm.resetFields();
      this.dialogForm = {
        id: -1,
        name: "",
        type: "PRACTICE",
        limit: 10,
        desc: "",
      };
      this.visible = false;
    },

    onDialogOk() {
      const { id, name, type, limit, desc } = this.dialogForm;
      this.$refs.dialogForm.validate(async (valid) => {
        if (!valid) return;
        this.dialogLoading = true;
        try {
          let params;
          if (id === -1) {
            params = {
              method: "POST",
              url: `/api/paper`,
              data: { name, type, limit, desc },
            };
          } else {
            params = {
              method: "PUT",
              url: `/api/paper/${id}`,
              data: { id, name, type, limit, desc },
            };
          }
          const res = await request(params);
          if (!res.success) {
            this.$message.error(res.message);
            return;
          }
          if (id === -1) {
            this.$router.push(`/paper/update/${res.data}`);
          } else {
            this.$message.success(res.message);
            await this.fetchTableData();
          }
          this.closeDialog();
        } catch (e) {
          this.$message.error(e.message);
        } finally {
          this.dialogLoading = false;
        }
      });
    },

    async switchStatus(bool, id) {
      const loading = this.$loading();
      try {
        const res = await request({
          method: "POST",
          url: `/api/paper/${id}/status`,
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

    async removePaper(id) {
      const loading = this.$loading({ background: "transparent" });
      try {
        const res = await request({
          method: "DELETE",
          url: `/api/paper/${id}`,
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        await sleep(200);
        await this.fetchTableData();
        loading.close();
        this.$message.success(res.message);
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },
  },
};
</script>
