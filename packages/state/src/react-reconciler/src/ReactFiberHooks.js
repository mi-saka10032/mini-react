import ReactSharedInternals from "shared/ReactSharedInternals";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import is from "shared/objectIs";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

function mountWorkInProgressHook() {
    const hook = {
        memoizedState: null,
        queue: null,
        next: null,
    };
    if (workInProgressHook === null) {
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}

function dispatchReducerAction(fiber, queue, action) {
    const update = {
        action,
        next: null,
    };
    const root = enqueueConcurrentHookUpdate(fiber, queue, update);
    scheduleUpdateOnFiber(root);
}

function dispatchSetState(fiber, queue, action) {
    const update = {
        action,
        hasEagerState: false, // 是否有急切的更新
        eagerState: null, // 急切的更新状态
        next: null,
    };
    // 派发动作后，立刻用上一次的状态和上一次的reducer计算新状态
    const { lastRenderedReducer, lastRenderedState } = queue;
    const eagerState = lastRenderedReducer(lastRenderedState, action);
    update.hasEagerState = true;
    update.eagerState = eagerState;
    if (is(eagerState, lastRenderedState)) {
        return;
    }
    // 入队更新，调度更新逻辑
    const root = enqueueConcurrentHookUpdate(fiber, queue, update);
    scheduleUpdateOnFiber(root);
}

const HooksDispatcherOnMountInDEV = {
    useReducer: mountReducer,
    useState: mountState,
};

function mountState(initialState) {
    const hook = mountWorkInProgressHook();
    hook.memoizedState = initialState;
    const queue = {
        pending: null,
        dispatch: null,
        lastRenderedReducer: baseStateReducer, // 上一个reducer
        lastRenderedState: initialState, // 上一个state
    };
    hook.queue = queue;
    const dispatch = (queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue));
    return [hook.memoizedState, dispatch];
}

function mountReducer(reducer, initialArg) {
    const hook = mountWorkInProgressHook();
    hook.memoizedState = initialArg;
    const queue = {
        pending: null,
        dispatch: null,
    };
    hook.queue = queue;
    const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue));
    return [hook.memoizedState, dispatch];
}

// 更新当前fiber的hook链表
function updateWorkInProgressHook() {
    if (currentHook === null) {
        const current = currentlyRenderingFiber.alternate;
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
        currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
        workInProgressHook = workInProgressHook.next = newHook;
    }
    return workInProgressHook;
}

const HooksDispatcherOnUpdateInDEV = {
    useReducer: updateReducer,
    useState: updateState,
};

// useState就是一个内置了reducer的useReducer
function baseStateReducer(state, action) {
    return typeof action === "function" ? action(state) : action;
}

function updateState() {
    return updateReducer(baseStateReducer);
}

function updateReducer(reducer) {
    const hook = updateWorkInProgressHook();
    const queue = hook.queue;
    queue.lastRenderedReducer = reducer;
    const current = currentHook;
    const pendingQueue = queue.pending;
    let newState = current.memoizedState;
    if (pendingQueue !== null) {
        queue.pending = null;
        const first = pendingQueue.next;
        let update = first;
        do {
            if (update.hasEagerState) {
                newState = update.eagerState;
            } else {
                const action = update.action;
                newState = reducer(newState, action);
            }
            update = update.next;
        } while (update !== null && update !== first);
    }
    hook.memoizedState = queue.lastRenderedState = newState;
    return [hook.memoizedState, queue.dispatch];
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
    currentlyRenderingFiber = workInProgress;
    if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
    } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    }
    const children = Component(props);
    workInProgressHook = null;
    currentHook = null;
    currentlyRenderingFiber = null;
    return children;
}
