import { Compiler } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export interface FakeCompiler extends Pick<Compiler, 'outputFileSystem' | 'outputPath'> {
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

export type PluginOptions = BaseOptions & OverridesOptions & { enableBundleParsing?: boolean }
