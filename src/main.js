import Vue from "vue";
import VueQr from "vue-qr";

import "normalize.css/normalize.css";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import "@/styles/index.scss";

import App from "./App";
import store from "./store";
import router from "./router";

import "@/icons"; // icon
import "@/permission"; // permission control

Vue.use(ElementUI);
Vue.use(VueQr);

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
