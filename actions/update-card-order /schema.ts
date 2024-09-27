import { z } from "zod";

export const UpdateCardOrder = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      order: z.number(),
      listId: z.string(),
      createdAt: z.string().transform((str) => new Date(str)), // Transform string to Date
      updatedAt: z.string().transform((str) => new Date(str)), // Transform string to Date
    })
  ),
  boardId: z.string(),
});