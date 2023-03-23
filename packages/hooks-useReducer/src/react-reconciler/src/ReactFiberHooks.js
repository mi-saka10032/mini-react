import ReactSharedInternals from "shared/ReactSharedInternals";
import { scheduleUpdateOnFiber } from "react-reconciler/src/ReactFiberWorkLoop";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdate";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentRenderingFiber = null;
let workInProgressHook = null;

const HooksDispatcherOnMount = {
    useReducer: mountReducer,
};

function mountReducer(reducer, initialArg) {
    const hook = mountWorkInProgressHook();
    hook.memoizedState = initialArg;
    const queue = {
        pending: null,
    };
    hook.queue = queue;
    const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentRenderingFiber, queue));
    return [hook.memoizedState, dispatch];
}

/**
 * 执行派发动作的方法，它要更新状态，并且让界面重新更新
 * @param fiber function对应的fiber
 * @param queue hook对应的更新队列
 * @param action 派发的动作
 */
function dispatchReducerAction(fiber, queue, action) {
    // 创建更新对象，在每个hook里存放一个更新队列，更新队列是一个更新对象的循环链表
    const update = {
        action, // { type: 'add', payload: 1 }
        next: null,
    };
    // 把当前最新的更新添加到更新队列中，并且返回当前的根fiber
    const root = enqueueConcurrentHookUpdate(fiber, queue, update);
    scheduleUpdateOnFiber(root);
}

/**
 * 挂载构建中的hook
 */
function mountWorkInProgressHook() {
    const hook = {
        memoizedState: null, // hook的状态 0
        queue: null, // 存放hook的更新队列 queue.pending = update的循环链表
        next: null, // 指向下一个hook，一个函数里可能会有多个hook，它们会组成一个循环链表
    };
    if (workInProgressHook === null) {
        // 当前函数对应的fiber的状态等于第一个hook对象，永远指向第一个hook，代表hook头部
        currentRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}

/**
 * 渲染函数组件
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param Component 组件定义
 * @param props 组件属性
 * @returns 虚拟DOM或者React元素
 */
export function renderWithHooks(current, workInProgress, Component, props) {
    currentRenderingFiber = workInProgress; // Function组件对应的Fiber
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
    // 需要函数组件执行前给 ReactCurrentDispatcher.current 赋值
    const children = Component(props);
    return children;
}
