/**
 * 此文件本来还需要考虑处理优先级问题
 * 现在只实现找到根节点的功能
 */
import { HostRoot } from "react-reconciler/src/ReactWorkTags";

export function markUpdateLaneFromFiberToRoot(sourceFiber) {
    let node = sourceFiber; // 当前fiber
    let parent = sourceFiber.return;    // 当前fiber的父fiber
    while (parent !== null) {
        node = parent;
        parent = parent.return;
    }
    // 一直找到parent为null：根节点Fiber(HostRootFiber)
    if (node.tag === HostRoot) {
        // 返回根节点的stateNode: FiberRootNode
        return node.stateNode;
    }
    return null;
}
