import logger from "shared/logger";
import { HostComponent, HostRoot, HostText } from "react-reconciler/src/ReactWorkTags";

function updateHostRoot(current, workInProgress) {
    // 需要知道的它的子虚拟DOM，知道它儿子的虚拟DOM信息
    processUpdateQueue(workInProgress); // workInProgress.memoizedState = { element  }
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;
    // 协调子节点，diff算法
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

function updateHostComponent(current, workInProgress) {

}

/**
 * 目标是根据虚拟DOM构建新的fiber子链表
 * @param current 老fiber
 * @param workInProgress 新fiber
 */
export function beginWork(current, workInProgress) {
    logger("beginWork", workInProgress);
    switch (workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(current, workInProgress);
        case HostComponent:
            return updateHostComponent(current, workInProgress);
        case HostText:
            return null;
        default:
            return null;
    }
}
