import logger, { indent } from "shared/logger";
import { HostComponent, HostRoot, HostText } from "react-reconciler/src/ReactWorkTags";
import {
    createInstance,
    createTextInstance,
    appendInitialChild,
    finalizeInitialChildren,
} from "react-dom/src/client/ReactDOMHostConfig";
import { NoFlags, Update } from "react-reconciler/src/ReactFiberFlags";

/**
 * 把当前完成的fiber所有子节点对应真实DOM都挂在到父parent真实DOM节点上
 * @param parent 当前完成的fiber真实DOM节点
 * @param workInProgress 完成的fiber
 */
function appendAllChildren(parent, workInProgress) {
    let node = workInProgress.child;
    while (node) {
        if (node.tag === HostComponent || node.tag === HostText) {
            // 如果子节点是原生节点或文本节点
            appendInitialChild(parent, node.stateNode);
        } else if (node.child !== null) {
            // 如果第一个儿子不是原生节点，说明它可能是一个函数组件节点
            node = node.child;
            continue;
        }
        // 如果当前的节点没有弟弟
        while (node.sibling === null) {
            if (node.return === null || node.return === workInProgress) {
                return;
            }
            // 回到父节点
            node = node.return;
        }
        node = node.sibling;
    }
}

// 给当前的fiber添加更新副作用
function markUpdate(workInProgress) {
    workInProgress.flags |= Update;
}

/**
 * 在fiber的完成阶段，准备更新DOM
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param type 类型
 * @param newProps 新属性
 */
function updateHostComponent(current, workInProgress, type, newProps) {
    const oldProps = current.memoizedProps; // 老属性
    const instance = workInProgress.stateNode; // 老DOM节点
    // 比较新老属性，收集属性差异
    // const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
    updatePayload = ['id', 'btn2', children, '2'];
    // 让原生组件的新fiber更新队列等于[]
    workInProgress.updateQueue = updatePayload;
    if (updatePayload) {
        markUpdate(workInProgress);
    }
}

/**
 * 完成一个fiber节点
 * @param current 老fiber
 * @param workInProgress 新的构建fiber
 */
export function completeWork(current, workInProgress) {
    logger(" ".repeat(indent.number) + "completeWork", workInProgress);
    indent.number -= 2;
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case HostRoot:
            bubbleProperties(workInProgress);
            break;
        case HostComponent:
            // 暂时只处理初次创建或挂载的新节点逻辑
            // 创建真实的DOM节点
            const { type } = workInProgress;
            // 如果老fiber存在，并且老fiber上存在真实DOM节点，走节点更新
            if (current !== null && workInProgress.stateNode !== null) {
                updateHostComponent(current, workInProgress, type, newProps);
            } else {
                const instance = createInstance(type, newProps, workInProgress);
                // 把自己所有的儿子都添加到自己身上
                appendAllChildren(instance, workInProgress);
                workInProgress.stateNode = instance;
                finalizeInitialChildren(instance, type, newProps);
            }
            bubbleProperties(workInProgress);
            break;
        case HostText:
            // 文本节点的props就是文本内容，直接创建真实的文本节点
            const newText = newProps;
            // 创建真实的DOM节点，并传入stateNode
            workInProgress.stateNode = createTextInstance(newText);
            // 向上冒泡属性
            bubbleProperties(workInProgress);
            break;
    }
}

/**
 * 属性冒泡，旨在向上收集子孙节点的更新副作用，当子节点不存在副作用时说明无需更新，便于diff优化
 * @param completedWork
 */
function bubbleProperties(completedWork) {
    let subtreeFlags = NoFlags;
    let child = completedWork.child;
    // 遍历当前fiber的所有子节点，把所有子节点的副作用及子节点的子节点副作用合并收集起来
    while (child !== null) {
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;
        child = child.sibling;
    }
    // 收集子节点的副作用，注意flags才是节点自己的副作用
    completedWork.subtreeFlags = subtreeFlags;
}
