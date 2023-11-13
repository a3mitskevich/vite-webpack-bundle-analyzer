import { relative, sep } from 'node:path';
import { OutputBundle, OutputChunk } from "rollup";
import { StatsAsset, StatsChunk, StatsChunkGroup, StatsCompilation, StatsModule } from 'webpack';
import { existed, getByteSize } from "./utils.ts";

type RequiredBy<T, K extends keyof T> = Partial<StatsAsset> & Required<Pick<T, K>>

type InternalStatAssets = RequiredBy<StatsAsset, 'name' | 'size' | 'chunks'>
type InternalStatsChunk = RequiredBy<StatsChunk, 'id' | 'modules' | 'entry' | 'size'>
type InternalStatsChunkGroup = RequiredBy<StatsChunkGroup, 'name' | 'chunks' | 'assets'>
type InternalStatsModule = RequiredBy<StatsModule, 'id' | 'name' | 'chunks' | 'size'>

const transformBundleToWebpackStats = (bundle: OutputBundle): StatsCompilation => {
    const options = {
        moduleOriginalSize: false,
    }
    const normalizeModulePath = (modulePath: string) => {
        // Remove unexpected rollup null prefix
        const normalizedModulePath = modulePath.replace('\u0000', '');
        const relativeModulePath = relative(process.cwd(), normalizedModulePath);
        // Match webpack output - add current directory prefix for child modules
        return relativeModulePath.match(/^\.\./)
            ? relativeModulePath
            : `.${sep}${relativeModulePath}`;
    }

    const moduleByFileName: Map<string, InternalStatsModule> = new Map();

    const extractModules = (chunk: OutputChunk) => Object.entries(chunk.modules).forEach(([modulePath, moduleInfo]) => {
        const chunkId = chunk.name;
        const relativeModulePathWithPrefix = normalizeModulePath(modulePath);
        if (!moduleByFileName.has(relativeModulePathWithPrefix)) {
            moduleByFileName.set(relativeModulePathWithPrefix, {
                id: relativeModulePathWithPrefix,
                name: relativeModulePathWithPrefix,
                size: options.moduleOriginalSize
                    ? moduleInfo.originalLength
                    : moduleInfo.renderedLength,
                chunks: [],
            })
        }
        moduleByFileName.get(relativeModulePathWithPrefix)?.chunks!.push(chunkId)
    });

    const getViteMetadataAssets = (chunk: OutputChunk): string[] => {
        return [
            Array.from(chunk.viteMetadata?.importedCss ?? []),
            Array.from(chunk.viteMetadata?.importedAssets ?? []),
        ].flat()
    }

    const getAssetsByImports = (chunk: OutputChunk): string[] => {
        const internalImports = chunk.imports
            .flatMap(facadeId => {
                const item = bundle[facadeId];
                if (item.type === 'chunk') {
                    return getAssetsByImports(item);
                }
                return null;
            })
            .filter(existed);
        return internalImports.concat(chunk.imports);
    }

    const assets: Set<InternalStatAssets> = new Set();
    const entrypoints: Map<string | number, InternalStatsChunkGroup> = new Map();
    const chunks: Set<InternalStatsChunk> = new Set();

    for (const output of Object.values(bundle)) {
        const size = getByteSize(output.type === 'asset' ? output.source : output.code);
        const asset: InternalStatAssets = {
            name: output.fileName,
            size,
            chunks: [],
        }
        if (output.type === 'chunk') {
            extractModules(output);
            const chunkId = output.name;
            const modules = Array.from(moduleByFileName.values())
                .filter(module => module.chunks.includes(chunkId));
            const entry = output.isEntry;
            chunks.add({
                id: chunkId,
                entry,
                size,
                modules,
            })
            asset.chunks.push(chunkId);
            if (entry) {
                entrypoints.set(
                    chunkId,
                    {
                        name: chunkId,
                        chunks: [chunkId],
                        assets: [
                            getAssetsByImports(output),
                            getViteMetadataAssets(output)
                        ].flat().map(name => ({name}))
                    }
                )
            }
        }
        assets.add(asset);
    }

    return {
        builtAt: Date.now(),
        assets: Array.from(assets) as StatsAsset[],
        chunks: Array.from(chunks) as StatsChunk[],
        entrypoints: Object.fromEntries(entrypoints.entries()),
        modules: Array.from(moduleByFileName.values()),
    };
};

export default transformBundleToWebpackStats;
