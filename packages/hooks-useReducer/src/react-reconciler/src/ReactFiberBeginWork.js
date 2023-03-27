import logger, { indent } from "shared/logger";
import {
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText,
    IndeterminateComponent,
} from "react-reconciler/src/ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom/src/client/ReactDOMHostConfig";
import { renderWithHooks } from "react-reconciler/src/ReactFiberHooks";

/**
 * 根据新的虚拟DOM生成新的Fiber链表
 * @param current 老的父Fiber
 * @param workInProgress 新的父Fiber
 * @param nextChildren 新的子虚拟DOM
 */
function reconcileChildren(current, workInProgress, nextChildren) {
    if (current === null) {
        // 新fiber没有老fiber，说明为首次创建挂载
        // 虚拟DOM首次创建时走这里
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    } else {
        // 有老Fiber，需要做DOM-DIFF，拿老的子fiber链表和新的子虚拟DOM进行最小量更新
        // root节点首次创建时走这里
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}

function updateHostRoot(current, workInProgress) {
    // 需要知道的它的子虚拟DOM，知道它儿子的虚拟DOM信息
    processUpdateQueue(workInProgress); // workInProgress.memoizedState = { element  }
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;
    // 协调子节点，diff算法
    // 根据新的虚拟DOM生成子fiber链表
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

/**
 * 构建原生组件的子fiber链表
 * @param current 老fiber
 * @param workInProgress 新fiber
 */
function updateHostComponent(current, workInProgress) {
    const { type, pendingProps: nextProps } = workInProgress;
    let nextChildren = nextProps.children;
    // 是否直接设置文本节点，如果是则直接启动优化，不再判断children
    const isDirectTextChildren = shouldSetTextContent(type, nextProps);
    if (isDirectTextChildren) {
        nextChildren = null;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

/**
 * 挂载函数组件
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param Component 组件类型，函数组件的定义
 */
export function mountIndeterminateComponent(current, workInProgress, Component) {
    const props = workInProgress.pendingProps;
    // 执行函数拿到返回值
    // const value = Component(props);
    const value = renderWithHooks(current, workInProgress, Component, props);
    workInProgress.tag = FunctionComponent;
    reconcileChildren(null, workInProgress, value);
    return workInProgress.child;
}

export function updateFunctionComponent(current, workInProgress, Component, nextProps) {
    const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps);
    reconcileChildren(null, workInProgress, nextChildren);
    return workInProgress.child;
}

/**
 * 目标是根据虚拟DOM构建新的fiber子链表
 * @param current 老fiber
 * @param workInProgress 新fiber
 */
export function beginWork(current, workInProgress) {
    logger(" ".repeat(indent.number) + "beginWork", workInProgress);
    indent.number += 2;
    switch (workInProgress.tag) {
        case IndeterminateComponent:
            return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
        case FunctionComponent:
            const Component = workInProgress.type;
            const nextProps = workInProgress.pendingProps;
            return updateFunctionComponent(current, workInProgress, Component, nextProps);
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
