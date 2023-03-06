import logger, { indent } from "shared/logger";
import { HostComponent, HostText } from "react-reconciler/src/ReactWorkTags";
import {
    createInstance,
    createTextInstance,
    appendInitialChild,
    finalizeInitialChildren,
} from "react-dom/src/client/ReactDOMHostConfig";
import { NoFlags } from "react-reconciler/src/ReactFiberFlags";

/**
 * 把当前完成的fiber所有子节点对应真实DOM都挂在到父parent真实DOM节点上
 * @param parent 当前完成的fiber真实DOM节点
 * @param workInProgress 完成的fiber
 */
function appendAllChildren(parent, workInProgress) {
    let node = workInProgress.child;
    while (node) {
        appendInitialChild(parent, node.stateNode);
        node = node.sibling;
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
        case HostComponent:
            // 暂时只处理初次创建或挂载的新节点逻辑
            // 创建真实的DOM节点
            const { type } = workInProgress;
            const instance = createInstance(type, newProps, workInProgress);
            // 把自己所有的儿子都添加到自己身上
            workInProgress.stateNode = instance;
            appendAllChildren(instance, workInProgress);
            break
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
