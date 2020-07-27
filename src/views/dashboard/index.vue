<template>
  <div>
    <el-card header="统计数据">
      <p>试卷数: {{ count.paperCount }} 张；</p>
      <p>题目数: {{ count.questionCount }} 道；</p>
      <p>教师总数: {{ count.teacherCount }} 人；</p>
      <p>学生总数: {{ count.studentCount }} 人；</p>

      <br />
      <p>今日登录用户: 0 人；总计登录用户: 0 人；</p>
      <p>今日答题学员: 0 人；总计答题学员: 0 人；</p>
    </el-card>
  </div>
</template>

<script>
import request from "@/utils/request";
import { mapGetters } from "vuex";

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["name"]),
  },
  data() {
    return {
      count: {
        paperCount: 0,
        questionCount: 0,
        teacherCount: 0,
        studentCount: 0,
      },
    };
  },
  mounted() {
    this.fetchAnalysis();
  },
  methods: {
    async fetchAnalysis() {
      const loading = this.$loading({ background: "transparent" });
      try {
        const res = await request({
          method: "GET",
          url: "/api/analysis",
        });
        if (!res.success) {
          this.$message.error(res.message);
          return;
        }
        this.count = res.data;
      } catch (e) {
        this.$message.error(e.message);
      } finally {
        loading.close();
      }
    },
  },
};
</script>
