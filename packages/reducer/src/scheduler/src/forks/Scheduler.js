// 后面再考虑实现优先队列
export function scheduleCallback(callback) {
    // 告诉浏览器在空余时间调用回调
    requestIdleCallback(callback);
}
