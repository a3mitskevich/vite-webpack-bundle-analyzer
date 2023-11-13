import { Plugin, ResolvedConfig } from 'vite'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { Compiler, Stats } from 'webpack';
import transformBundleToWebpackStats from "./transform.ts";
import { usePromise } from "./usePromise.ts";

interface FakeCompiler extends Pick<Compiler, 'outputFileSystem' | 'outputPath'> {
    hooks: { done: { tapAsync: Function } };
    process: Promise<void>;
}

type ExcludeServerMod<T> = T extends 'server' ? never : T;

type ServerOptions =  'analyzerHost' | 'analyzerPort' | 'analyzerUrl';

type OverrideOptions = 'statsOptions' | 'analyzerMode';

type ExcludedOptions = OverrideOptions | ServerOptions;

type OverridesOptions = {
    analyzerMode?: ExcludeServerMod<BundleAnalyzerPlugin.Options['analyzerMode']>;
};
type BaseOptions = Omit<BundleAnalyzerPlugin.Options, ExcludedOptions>;

type PluginOptions = BaseOptions & OverridesOptions & { enableBundleParsing?: boolean }

const plugin = (opts: PluginOptions = {}): Plugin => {
    let config: ResolvedConfig;
    let fakeCompiler: FakeCompiler;
    return {
        name: 'vite-webpack-bundle-analyzer',
        apply: 'build',
        configResolved(_config) {
            config = _config;
        },
        generateBundle(_, bundle) {
            const { reject, resolve,  promise} = usePromise();
            const stats = transformBundleToWebpackStats(bundle);
            const tapAsync = (_: string, doneFn: (stats: object, callback: Function) => void) => {
                const statsWrapper: Pick<Stats, 'toJson'> = { toJson: () => stats };
                doneFn(statsWrapper, (error?: Error) => {
                    if (error) {
                        reject()
                        this.error(error);
                    }
                    resolve();
                })
            };
            fakeCompiler = {
                outputPath: opts.enableBundleParsing ? config.build.outDir : '',
                outputFileSystem: Object.create(null),
                hooks: { done: { tapAsync } },
                process: promise,
            };
        },
        async closeBundle() {
            opts.defaultSizes = opts.defaultSizes ?? 'stat';
            new BundleAnalyzerPlugin(opts).apply(fakeCompiler as any)
            await fakeCompiler.process;
        }
    }
}

plugin({
    analyzerMode: 'static',
})

export default plugin;
