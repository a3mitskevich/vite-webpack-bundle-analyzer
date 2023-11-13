export const usePromise = (): {
    promise: Promise<void>,
    resolve: () => void,
    reject: (error?: Error) => void,
} => {
    let resolve: any, reject: any, promise: any;
    promise = new Promise((_resolve, _reject) =>  {
        resolve = _resolve;
        reject = _reject;
    })
    return {
        reject,
        resolve,
        promise,
    }
}
