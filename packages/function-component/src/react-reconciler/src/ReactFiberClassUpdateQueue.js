import { markUpdateLaneFromFiberToRoot } from "react-reconciler/src/ReactFiberConcurrentUpdate";
import assign from 'shared/assign';

export const UpdateState = 0;

export function initialUpdateQueue(fiber) {
    // 创建一个新的更新队列
    const queue = {
        shared: {
            // pending是一个循环链表
            pending: null,
        },
    };
    fiber.updateQueue = queue;
}

export function createUpdate() {
    const update = { tag: UpdateState };
    return update;
}

export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    // 取出fiber上已有的老的更新链表pending
    const pending = updateQueue.shared.pending;
    if (pending === null) {
        // pending不存在则直接将新的更新链表挂载上去
        update.next = update;
    } else {
        // pending存在，注意pending为循环链表
        // 新链表update的尾部next指向老pending链表的头部（尾部的next即指向头部）
        update.next = pending.next;
        // 老pending链表尾部next指向新链表update的头部
        pending.next = update;
    }
    // 最终结果：pending要指向最后一个更新，最后一个更新next指向第一个更新，构成单向循环链表
    updateQueue.shared.pending = update;
    // 返回根节点 从当前的fiber到根节点（涉及到优先级队列，此处暂时不考虑优先级）
    return markUpdateLaneFromFiberToRoot(fiber);
}

/**
 * 根据老状态和更新队列中的更新计算最新状态
 * @param workInProgress 要计算的fiber
 */
export function processUpdateQueue(workInProgress) {
    const queue = workInProgress.updateQueue;
    const pendingQueue = queue.shared.pending;
    // 如果有更新，或者更新队列里有内容
    if (pendingQueue !== null) {
        // 清除等待生效的更新
        queue.shared.pending = null;
        // 拿到最后一个等待生效的更新 update = { payload: { element: 'h1' } }
        const lastPendingUpdate = pendingQueue;
        // 指向第一个更新
        const firstPendingUpdate = lastPendingUpdate.next;
        // 剪开更新链表，变成单链表
        lastPendingUpdate.next = null;
        // 获取老状态 null
        let newState = workInProgress.memoizedState;
        let update = firstPendingUpdate;
        while (update) {
            // 根据老状态和更新，计算新状态
            newState = getStateFromUpdate(update, newState);
            update = update.next;
        }
        // 把最终计算到的状态赋值给memoizedState
        workInProgress.memoizedState = newState;
    }
}

/**
 * 根据老状态和更新计算新状态
 * @param update 更新时的对象，含多种类型
 * @param prevState
 */
function getStateFromUpdate(update, prevState) {
    switch (update.tag) {
        case UpdateState:
            const { payload } = update;
            return assign({}, prevState, payload);
    }
}
