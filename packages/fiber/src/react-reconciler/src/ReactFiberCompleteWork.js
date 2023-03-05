import logger, { indent } from "shared/logger";

export function completeWork(current, workInProgress) {
    logger(" ".repeat(indent.number) + 'completeWork', workInProgress)
    indent.number -= 2;
}
