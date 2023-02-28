import { scheduleCallback } from "scheduler/index";
import { createWorkInProgress } from './ReactFiber'

let workInProgress = null;

/**
 * 计划更新root
 * 源码中此处有一个调度任务的功能
 * @param {*}root
 */
export function scheduleUpdateOnFiber(root) {
    // 确保调度执行root上的更新
    ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
    // 告诉浏览器要执行performConcurrentWorkOnRoot函数，参数为root
    scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 开始根据fiber构建fiber树，要创建真实的DOM节点，再把真实的DOM节点插入容器
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
    // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步执行
    renderRootSync(root);
}

function prepareFreshStack(root) {
    workInProgress = createWorkInProgress(root.current, null);
    console.log(workInProgress);
}

function renderRootSync(root) {
    // 开始构建fiber树
    // 双缓冲技术，页面显示区域为current映射，对应真实DOM，代表当前已经渲染完成的Fiber
    // 内存中的Fiber构建、比较、更新为workInProgress映射，表示还未生效，没有更新的DOM上的Fiber树
    // 1. current的HostRootFiber在构建过程中不作变化
    // 2. workInProgress在内存中顺序构建Fiber树
    prepareFreshStack(root);
}
