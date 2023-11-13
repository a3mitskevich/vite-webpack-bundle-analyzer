import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import Vue2 from '@vitejs/plugin-vue2';
import Components from "unplugin-vue-components/vite";
import {VuetifyResolver} from "unplugin-vue-components/resolvers";
import {ViteWebpackBundleAnalyzer} from "../src";
export default defineConfig({
    plugins: [
        Vue2(),
        Components({resolvers: [VuetifyResolver()],}),
        ViteWebpackBundleAnalyzer({
            analyzerMode: 'static',
            openAnalyzer: false,
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '~vuetify': fileURLToPath(new URL('./node_modules/vuetify', import.meta.url)),
        },
    },
    build: {
        manifest: true,
    }
})
