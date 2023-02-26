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
