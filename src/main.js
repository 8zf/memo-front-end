// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import $ from "jquery";
import Vue from 'vue'
import App from './App'
import router from './router'
import VueMaterial from 'vue-material'
import axios from 'axios'
import VueAxios from 'vue-axios'
import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default-dark.css'
import './assets/style/global.css'
import './assets/style/animate.min.css'
import globalParams from './assets/js/global'
import {VueMasonryPlugin} from 'vue-masonry';

Vue.config.productionTip = false;
Vue.use(VueMaterial);
Vue.use(VueAxios, axios);
Vue.use(VueMasonryPlugin);
Vue.prototype.GLOBAL = globalParams;
// Vue.material.registerTheme({
//   default: {
//     primary: 'blue',
//     accent: 'red'
//   },
//   green: {
//     primary: 'green',
//     accent: 'pink'
//   },
//   orange: {
//     primary: 'orange',
//     accent: 'green'
//   },
// })
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

let eventBus = new Vue({});
