import { z } from "zod";

export const UpdateListOrder = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      order: z.number(),
      createdAt: z.string().transform((str) => new Date(str)), // Transform string to Date
      updatedAt: z.string().transform((str) => new Date(str)), // Transform string to Date
    })
  ),
  boardId: z.string(),
});