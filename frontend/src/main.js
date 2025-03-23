import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import VueApexCharts from "vue3-apexcharts";

import 'bootstrap/dist/css/bootstrap.css' 
import 'bootstrap/dist/js/bootstrap.js'

const app = createApp(App)

app.use(router) // Használjuk a routert
app.use(VueApexCharts);
app.mount('#app')