import Vue from 'vue';
import App from './App.vue';
import Vuetify from "vuetify";
// HERE: first way to import fonts
// import 'material-design-icons-iconfont/dist/material-design-icons-no-codepoints.css';

Vue.use(Vuetify)

export function createApp() {
    const app = new Vue({
        vuetify: new Vuetify({
            icons: {
                iconfont: 'md',
            },
        }),
        render: (h) => h(App),
    });

    return { app };
}

createApp().app.$mount('#app');
