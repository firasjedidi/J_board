"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateCard } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { title, boardId, listId } = data;

  let card;
  try {
    const { data: list } = await supabase
      .from("List")
      .select(
        `
        *,
        Board (
          orgId
        )
      `
      )
      .eq("id", listId)
      .eq("Board.orgId", orgId)
      .single();

    if (!list) {
      console.error("List not found");
      return { error: "List not found" };
    }

    const { data: lastCard } = await supabase
      .from("Card")
      .select("order")
      .eq("listId", listId)
      .order("order", { ascending: false }) 
      .limit(1) // Fetch only the first record
      .single(); 
      
    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const createdCard = await supabase
      .from("Card")
      .insert({
        title,
        listId,
        order: newOrder,
      })
      .select("*")
      .single();

    card = createdCard.data;

    await createAuditLog({
      entityID: card.id,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.CREATE,
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }
  revalidatePath(`/board/${boardId}`);
  return {
    data: card,
  };
};

export const createCard = createSafeAction(CreateCard, handler);
