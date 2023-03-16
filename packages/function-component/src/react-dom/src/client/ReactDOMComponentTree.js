const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = "__reactFiber$" + randomKey;

/**
 * 从真实的DOM节点上获取它对应的Fiber节点
 * @param targetNode
 */
export function getClosestInstanceFromNode(targetNode) {
    const targetInst = targetNode[internalInstanceKey];
    return targetInst;
}

/**
 * 提前缓存Fiber节点的实例到DOM节点上
 * @param hostInst
 * @param node
 */
export function precacheFiberNode(hostInst, node) {
    node[internalInstanceKey] = hostInst;
}
