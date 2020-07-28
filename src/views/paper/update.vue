<template>
  <div>
    <div style="margin-bottom: 15px;">
      <el-button type="text" icon="el-icon-plus" @click="showDialog()">添加题目</el-button>

      <el-button v-if="questions.length > 0" style="float: right;" type="primary" @click="showReleaseDialog">
        立即发布
      </el-button>
      <el-button style="float: right;" @click="showQrDialog">查看二维码</el-button>
    </div>

    <p v-if="questions.length === 0">暂无题目, 请点击 "添加题目"</p>

    <el-card v-for="(q, qIndex) in questions" :key="q.id">
      <div slot="header" class="card__hd">
        <span>
          第 <b>{{ qIndex + 1 }}</b> 题
          <span v-if="q.type === 'RADIO'" class="el-link el-link--warning">(单选题)</span>
          <span v-if="q.type === 'CHECKBOX'" class="el-link el-link--warning">(多选题)</span>
          <span v-if="q.type === 'BOOLEAN'" class="el-link el-link--warning">(判断题)</span>
        </span>
        <div>
          <span class="el-link el-link--primary" @click="showDialog(q)">编辑</span>
          <el-divider direction="vertical" />
          <el-popconfirm title="删除以后无法恢复, 是否继续？" @onConfirm="removeQuestion(q.id)">
            <span slot="reference" class="el-link el-link--danger">删除</span>
          </el-popconfirm>
        </div>
      </div>
      <div>
        <p style="margin-top: 0;">
          <b>{{ q.name }}</b>
        </p>
        <p>
          <el-radio-group v-if="q.type === 'RADIO'" v-model="q.tempAnswer">
            <el-radio v-for="(opt, optIndex) in q.options" :key="optIndex" :label="opt.value">
              {{ opt.value }}. {{ opt.label }}
            </el-radio>
          </el-radio-group>
          <el-radio-group v-if="q.type === 'BOOLEAN'" v-model="q.tempAnswer">
            <el-radio v-for="(opt, optIndex) in q.options" :key="optIndex" :label="opt.value">
              {{ opt.value }}. {{ opt.label }}
            </el-radio>
          </el-radio-group>
          <el-checkbox-group v-if="q.type === 'CHECKBOX'" v-model="q.tempAnswer">
            <el-checkbox v-for="(opt, optIndex) in q.options" :key="optIndex" :label="opt.value">
              {{ opt.value }}. {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
        </p>
        <el-alert
          :title="'答案: ' + q.answer"
          type="info"
          show-icon
          :description="'解析: ' + q.explain"
          :closable="false"
        />
      </div>
    </el-card>

    <el-dialog title="题目配置" top="5%" :visible.sync="visible" width="80%" :before-close="closeDialog" append-to-body>
      <el-form ref="dialogForm" :model="dialogForm" :rules="dialogRules" label-width="80px" label-suffix="：">
        <el-input-number v-model="dialogForm.id" style="display: none;" />
        <el-form-item label="排序" prop="index">
          <el-input-number v-model="dialogForm.index" :min="0" controls-position="right" />
          <div>值越小越靠前</div>
        </el-form-item>
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
          <el-radio-group v-model="dialogForm.type" @change="onChangeType">
            <el-radio label="RADIO">单选题</el-radio>
            <el-radio label="CHECKBOX">多选题</el-radio>
            <el-radio label="BOOLEAN">判断题</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选项" prop="options">
          <el-button type="text" icon="el-icon-plus" @click="addOption">添加选项</el-button>
          <el-table :data="dialogForm.options" border size="mini">
            <el-table-column label="是否为答案" width="90">
              <template slot-scope="scope">
                <el-radio v-if="dialogForm.type === 'RADIO'" v-model="dialogForm.answer" :label="scope.row.value" />
                <el-checkbox
                  v-if="dialogForm.type === 'CHECKBOX'"
                  :checked="dialogForm.answer.indexOf(scope.row.value) !== -1"
                  :label="scope.row.value"
                  @change="setCheckbox($event, scope.row.value)"
                />
                <el-radio v-if="dialogForm.type === 'BOOLEAN'" v-model="dialogForm.answer" :label="scope.row.value" />
              </template>
            </el-table-column>
            <el-table-column label="选项">
              <template slot-scope="scope">
                <el-input type="textarea" v-model="scope.row.label" maxlength="200" show-word-limit />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90">
              <template slot-scope="scope">
                <span class="el-link el-link--danger" @click="removeOption(scope.$index)">删除</span>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="解释" prop="explain">
          <el-input
            v-model="dialogForm.explain"
            type="textarea"
            maxlength="1000"
            placeholder="言简意赅的解释有助于学员纠错"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button :loading="dialogLoading" type="primary" @click="onDialogOk">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="是否继续?" :visible.sync="releaseConfirm" width="30%">
      <span>发布以后试卷将被标记为启用状态, 学员可以开始使用</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="releaseConfirm = false">取 消</el-button>
        <el-button type="primary" @click="releasePaper">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="扫描此二维码立即答题" :visible.sync="qrDialog" width="30%">
      <div style="text-align: center;">
        <vue-qr :text="qrUrl"></vue-qr>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="qrDialog = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import request from "@/utils/request";
import { sleep } from "@/utils";

export default {
  name: "paper-create",
  data() {
    return {
      id: "",
      questions: [],

      visible: false,
      dialogForm: {
        id: -1,
        index: 0,
        name: "",
        type: "RADIO",
        options: [],
        answer: "",
        explain: "",
      },
      dialogRules: {
        index: [{ required: true, message: "必填项" }],
        name: [{ required: true, message: "必填项" }],
        type: [{ required: true, message: "必填项" }],
        options: [{ required: true, message: "必填项" }],
        explain: [{ required: true, message: "必填项" }],
      },
      dialogLoading: false,
      releaseConfirm: false,
      qrDialog: false,
      qrUrl: ""
    };
  },
  created() {
    this.id = this.$route.params.id;
    this.qrUrl = `http://qa.util.city/web#/paper/${this.id}`;
    this.fetchQuestions();
  },
  methods: {
    async fetchQuestions() {
      const loading = this.$loading({ background: "transparent" });
      try {
        const res = await request({
          method: "GET",
          url: `/api/paper/${this.id}/question`,
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        let questions = res.data.map((item) => {
          if (item.type === "CHECKBOX") {
            item.tempAnswer = item.answer.split(",");
          } else {
            item.tempAnswer = item.answer;
          }
          return item;
        });
        questions = questions.sort((a, b) => a.index - b.index);
        this.questions = questions;
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },

    async removeQuestion(id) {
      const loading = this.$loading({ background: "transparent" });
      try {
        const res = await request({
          method: "DELETE",
          url: `/api/paper/${this.id}/question/${id}`,
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        await sleep(200);
        await this.fetchQuestions();
        loading.close();
        this.$message.success(res.message);
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },

    showReleaseDialog() {
      this.releaseConfirm = true;
    },

    async releasePaper() {
      const loading = this.$loading();
      try {
        const res = await request({
          method: "POST",
          url: `/api/paper/${this.id}/release`,
        });
      } catch (e) {
      } finally {
        loading.close();
      }
    },

    showDialog(question) {
      this.visible = true;
      if (question) {
        this.dialogForm = _.pick(question, ["id", "index", "name", "type", "options", "answer", "explain"]);
      }
    },

    closeDialog() {
      this.$refs.dialogForm.resetFields();
      this.dialogForm = {
        id: -1,
        index: 0,
        name: "",
        type: "RADIO",
        options: [],
        answer: "",
        explain: "",
      };
      this.visible = false;
    },

    onDialogOk() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (!valid) return;
        const { id, index, type, name, options, answer, explain } = this.dialogForm;
        if (options.length === 0) {
          this.$message.warning("请设置选项");
          return;
        }
        if (!answer) {
          this.$message.warning("请设置答案");
          return;
        }
        this.dialogLoading = true;
        try {
          let params;
          if (id === -1) {
            params = {
              method: "POST",
              url: `/api/paper/${this.id}/question`,
              data: { index, type, name, options, answer, explain },
            };
          } else {
            params = {
              method: "PUT",
              url: `/api/paper/${this.id}/question/${id}`,
              data: { id, index, type, name, options, answer, explain },
            };
          }
          const res = await request(params);
          if (!res.success) {
            this.$message.error(res.message);
            return;
          }
          await sleep(200);
          await this.fetchQuestions();
          this.$message.success(res.message);
          this.closeDialog();
        } catch (e) {
          this.$message.error(e.message);
        } finally {
          this.dialogLoading = false;
        }
      });
    },

    addOption() {
      if (this.dialogForm.options.length === 10) {
        this.$message.warn("最多10个选项");
        return;
      }
      this.dialogForm.options.push({ value: "", label: "" });
      this.resetOptionsWithIndex();
    },

    removeOption(index) {
      this.dialogForm.options.splice(index, 1);
      this.resetOptionsWithIndex();
    },

    resetOptionsWithIndex() {
      const newOptions = this.dialogForm.options.map((opt, index) => {
        if (index === 0) opt.value = "A";
        if (index === 1) opt.value = "B";
        if (index === 2) opt.value = "C";
        if (index === 3) opt.value = "D";
        if (index === 4) opt.value = "E";
        if (index === 5) opt.value = "F";
        if (index === 6) opt.value = "G";
        if (index === 7) opt.value = "H";
        if (index === 8) opt.value = "I";
        if (index === 9) opt.value = "J";
        return opt;
      });
      this.$set(this.dialogForm, "options", newOptions);
    },

    onChangeType(type) {
      if (type === "BOOLEAN") {
        const newOptions = [
          { value: "A", label: "是" },
          { value: "B", label: "否" },
        ];
        this.$set(this.dialogForm, "options", newOptions);
      }
    },

    setCheckbox(checked, answerId) {
      let answerIds = [];
      if (this.dialogForm.answer) {
        answerIds = this.dialogForm.answer.split(",");
      }
      if (checked) {
        answerIds.push(answerId);
      } else {
        answerIds = answerIds.filter((item) => item !== answerId);
      }
      this.dialogForm.answer = _.uniq(answerIds).join(",");
    },

    showQrDialog() {
      this.qrDialog = true;
    },
  },
};
</script>

<style lang="scss">
.card__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hide-label {
  .el-radio__label,
  .el-checkbox__label {
    display: none;
  }
}

.el-card {
  margin-bottom: 15px;
}
</style>
