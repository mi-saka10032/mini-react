import ReactSharedInternals from "shared/ReactSharedInternals";
import { scheduleUpdateOnFiber } from "react-reconciler/src/ReactFiberWorkLoop";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdate";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

const HooksDispatcherOnMount = {
    useReducer: mountReducer,
};

const HooksDispatchOnUpdate = {
    useReducer: updateReducer,
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

function updateReducer(reducer) {
    const hook = updateWorkInProgressHook();
    // 获取新hook的更新队列
    const queue = hook.queue;
    // 获取老的hook
    const current = currentHook;
    // 获取将要生效的更新队列
    const pendingQueue = queue.pending;
    // 初始化一个新的状态，取值为当前状态
    let newState = current.memoizedState;
    if (pendingQueue !== null) {
        queue.pending = null;
        const firstUpdate = pendingQueue.next;
        let update = firstUpdate;
        do {
            const action = update.action;
            newState = reducer(newState, action);
            update = update.next;
        } while (update !== null && update !== firstUpdate);
    }
    hook.memoizedState = newState;
    return [hook.memoizedState, queue.dispatch];
}

/**
 * 构建新的hook
 */
function updateWorkInProgressHook() {
    // 获取将要构建的新的hook的老hook
    if (currentHook === null) {
        const current = currentRenderingFiber.alternate;
        currentHook = current.memoizedState;
    } else {
        currentHook = currentHook.next;
    }
    const newHook = {
        memoizedState: currentHook.memoizedState,
        queue: currentHook.queue,
        next: null,
    };
    if (workInProgressHook === null) {
        currentRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
        workInProgressHook = workInProgressHook.next = newHook;
    }
    return workInProgressHook;
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
        action, // { type: 'add', payload: 1 } 派发的动作
        next: null, // 指向下一个更新
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
    // 如果有老fiber，并且有老的hook链表，才进入更新逻辑，否则仍执行hook挂载
    if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher.current = HooksDispatchOnUpdate;
    } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMount;
    }
    // 需要函数组件执行前给 ReactCurrentDispatcher.current 赋值
    const children = Component(props);
    currentRenderingFiber = null;
    workInProgressHook = null;
    return children;
}
