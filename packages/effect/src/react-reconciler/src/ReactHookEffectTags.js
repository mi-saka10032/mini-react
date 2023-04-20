export const HasEffect = 0b0001; // 1
// 浏览器绘制之前执行的effect，UI绘制之前，类似微任务
export const Layout = 0b0100; // 4
// 浏览器绘制之后执行的effect，UI绘制之后，类似于宏任务
export const Passive = 0b1000; // 8
