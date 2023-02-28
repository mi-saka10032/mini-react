import { createFiberRoot } from "./ReactFiberRoot";
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue";

export function createContainer(containerInfo) {
    return createFiberRoot(containerInfo);
}

/**
 * 更新容易，把虚拟DOM Element变成真实DOM插入到container容器中
 * @param element 虚拟DOM
 * @param container DOM容器 FiberRootNode containerInfo div#root
 */
export function updateContainer(element, container) {
    // 获取当前的根fiber
    const current = container.current;
    // 创建更新
    const update = createUpdate();
    // 要更新的虚拟DOM
    update.payload = { element };
    // 添加至current根Fiber的更新队列
    const root = enqueueUpdate(current, update);
    console.log(root);
}
