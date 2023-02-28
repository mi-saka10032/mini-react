import { HostRoot } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";

/**
 *
 * @param tag fiber类型，函数组件0、类组件1、原生组件5、根元素3
 * @param pendingProps 新属性，等待处理或者生效的属性
 * @param key 唯一标识
 * @constructor
 */
export function FiberNode(tag, pendingProps, key) {
    this.tag = tag;
    this.key = key;
    this.type = null;   // fiber类型，来自于虚拟DOM节点的type span div a
    this.stateNode = null;  // 对应真实的DOM节点

    this.return = null; // 指向父节点
    this.child = null;  // 指向第一个子节点
    this.sibling = null; // 指向弟节点
    this.index = 0; // 索引初始为0

    // 虚拟DOM提供pendingProps用于创建fiber节点的属性
    this.pendingProps = pendingProps; // 等待生效的属性
    this.memoizedProps = null;  // 已经生效的属性

    // 每个fiber会有自己的状态，每一种fiber状态存的类型不一样
    // 类组件对应的fiber存的是类实例状态，HostRoot存的是待渲染元素
    this.memoizedState = null;
    // 每个fiber身上可能还有更新队列
    this.updateQueue = null;
    // 副作用的标识，表示要针对此Fiber节点进行何种操作
    this.flags = NoFlags;
    // 子节点对应的副作用标识
    this.subtreeFlags = NoFlags;
    // 轮替节点
    this.alternate = null;
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse.

    // This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allows us to
    // reclaim the extra memory if needed.
}

export function createFiber(tag, pendingProps, key) {
    return new FiberNode(tag, pendingProps, key);
}

export function createHostRootFiber() {
    return createFiber(HostRoot, null, null);
}

/**
 * 基于老fiber和新属性创建新的fiber
 * @param current 老fiber
 * @param pendingProps 新属性
 */
export function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;
    // 首次渲染时为null
    if (workInProgress === null) {
        workInProgress = createFiber(current.tag, pendingProps, current.key)
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        // 双向指针
        workInProgress.alternate = current;
        current.alternate = workInProgress
    } else {
        workInProgress.pendingProps = pendingProps;
        workInProgress.type = current.type;
        // 副作用清空
        workInProgress.flags = NoFlags;
        workInProgress.subtreeFlags = NoFlags;
    }
    workInProgress.child = current.child;
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;
    return workInProgress;
}
