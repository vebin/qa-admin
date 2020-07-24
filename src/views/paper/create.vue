<template>
  <div>
    <div style="margin-bottom: 15px;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="showDialog">新增</el-button>
    </div>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>卡片名称</span>
        <el-button style="float: right; padding: 3px 0;" type="text">编辑</el-button>
        <el-button style="float: right; padding: 3px 0;" type="text">删除</el-button>
      </div>
    </el-card>

    <el-dialog title="题目配置" top="5%" :visible.sync="visible" width="80%" :before-close="closeDialog" append-to-body>
      <el-form ref="dialogForm" :model="dialogForm" :rules="dialogRules" label-width="80px" label-suffix="：">
        <el-form-item label="题目" prop="name">
          <el-input
            type="textarea"
            placeholder="请输入题目"
            v-model="dialogForm.name"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="dialogForm.type">
            <el-radio label="RADIO">单选题</el-radio>
            <el-radio label="CHECKBOX">多选题</el-radio>
            <el-radio label="BOOLEAN">判断题</el-radio>
            <el-radio label="TEXTAREA">问答题</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选项" prop="options">
          <el-button type="text" icon="el-icon-plus" @click="addOption">新增</el-button>
          <el-table :data="dialogForm.options" border size="mini">
            <el-table-column label="选项">
              <template slot-scope="scope">
                <el-input type="textarea" v-model="scope.row.label" maxlength="200" show-word-limit />
              </template>
            </el-table-column>
            <el-table-column label="是否为答案" width="100">
              <template slot-scope="scope">
                <el-radio v-model="scope.row.isAnswer" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="removeOption(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="解释" prop="explain">
          <el-input type="textarea" maxlength="1000" placeholder="言简意赅的解释有助于学员纠错" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="onDialogOk">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request";
import { uuid } from "@/utils";

export default {
  name: "paper-create",
  data() {
    return {
      id: "",
      questions: [],

      visible: false,
      dialogForm: {
        id: -1,
        name: "",
        type: "RADIO",
        options: [],
        explain: "",
      },
      dialogRules: {
        name: [{ required: true, message: "必填项" }],
        type: [{ required: true, message: "必填项" }],
        options: [{ required: true, message: "必填项" }],
        explain: [{ required: true, message: "必填项" }],
      },
      dialogLoading: false,
    };
  },
  created() {
    this.id = this.$route.query.id;
    this.fetchQuestions();
  },
  methods: {
    async fetchQuestions() {
      const loading = this.$loading();
      try {
        const res = await request({
          method: "GET",
          url: `/api/paper/${this.id}/question`,
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        this.questions = res.data;
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },

    showDialog() {
      this.visible = true;
    },

    closeDialog() {
      this.$refs.dialogForm.resetFields();
      this.dialogForm = {
        name: "",
        status: "ENABLE",
      };
      this.visible = false;
    },

    onDialogOk() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (!valid) return;
        if (this.dialogForm.options.length === 0) {
          this.$message.warning("题目选项必填");
          return;
        }
        this.dialogLoading = true;
        try {
          const res = await request({
            method: "POST",
            url: `/api/paper/${this.id}/question`,
            data: this.dialogForm,
          });
          if (!res.success) {
            this.$message.error(res.message);
            return;
          }
          const created = res.data;
          this.questions.push(created);
        } catch (e) {
          this.$message.error(e.message);
        } finally {
          this.dialogLoading = false;
        }
      });
    },

    addOption() {
      const option = {
        value: uuid(),
        label: "",
        isAnswer: false,
      };
      const newOptions = [...this.dialogForm.options, option];
      this.$set(this.dialogForm, "options", newOptions);
    },

    removeOption(index) {
      this.dialogForm.options.splice(index, 1);
    },
  },
};
</script>
