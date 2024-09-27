"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateList } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { title, boardId } = data;
  let list;
  try {
    const { data: board } = await supabase
      .from("Board")
      .select("*")
      .eq("id", boardId)
      .eq("orgId", orgId)
      .single(); // Ensure only one record is fetched

    // Step 2: Check if the board exists
    if (!board) {
      return { error: "Board not found" };
    }

    // Step 3: Find the last list ordered by 'order' in descending order
    const { data: lastList, error } = await supabase
      .from("List")
      .select("order")
      .eq("boardId", boardId)
      .order("order", { ascending: false })
      .limit(1) // Fetch only the first record
      .single(); // Ensure only one record is fetched


    // Step 4: Determine the new order for the new list
    const newOrder = lastList ? lastList.order + 1 : 1;

    // Step 5: Create the new list with the calculated order
    const ListData = await supabase
      .from("List")
      .insert({
        title,
        boardId,
        order: newOrder,
      })
      .select("*")
      .single();

    list = ListData?.data;

    await createAuditLog({
      entityID: list.id,
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.CREATE,
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }
  revalidatePath(`/board/${boardId}`);
  return {
    data: list,
  };
};

export const createList = createSafeAction(CreateList, handler);
