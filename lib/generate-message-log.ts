import { Auditlog, ACTION } from "@/lib/types";

export const generateMessageLog = (log: Auditlog) => {
  const { action, entityTitle, entityType } = log;

  switch (action) {
    case ACTION.CREATE:
      return `created ${entityType.toLocaleLowerCase()} "${entityTitle}"`;
    case ACTION.UPDATE:
      return `updated ${entityType.toLocaleLowerCase()} "${entityTitle}"`;
    case ACTION.DELETE:
      return `deleted ${entityType.toLocaleLowerCase()} "${entityTitle}"`;
    default:
      return `unknown action ${entityType.toLocaleLowerCase()} "${entityTitle}"`;
  }
};
