"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@/lib/types";

import { supabase } from "@/lib/supabaseClient";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CopyList } from "./schema";
import { InputType, ReturnType } from "./types";
import { Card } from "@/lib/types";
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { id, boardId } = data;

  let list;

  try {
    const { data: listToCopy } = await supabase
    .from('List')
    .select(`
      *,
      Card (
        title,
        description,
        "order"
      ),
      Board (
        orgId
      )
    `)
    .eq('id', id)
    .eq('boardId', boardId)
    .single();
 

    if (!listToCopy) {
      return {
        error: "List not found",
      };
    }

  const { data: lastList } = await supabase
  .from('List')
  .select('order')
  .eq('boardId', boardId)
  .order('order', { ascending: false })
  .limit(1)
  .single();

const newOrder = lastList ? lastList.order + 1 : 1;
const { data: newList } = await supabase
  .from('List')
  .insert({
    title: `${listToCopy.title}-Copy`,
    boardId,
    order: newOrder
  })
  .select()
  .single();

  if (listToCopy.Card.length > 0) {
    const cardsData = listToCopy.Card.map((card:Card) => ({
      title: card.title,
      description: card.description,
      order: card.order,
      listId: newList.id // Use the ID of the newly created list
    }));
  
    const { error: newCardsError } = await supabase
      .from('Card')
      .insert(cardsData);
  
    if (newCardsError) {
      console.error("Error creating cards for the new list:", newCardsError.message);
      return { error: "Failed to create cards for the new list" };
    }
  }
  
  // Fetch the newly created list including its cards
  const createdListWithCards= await supabase
    .from('List')
    .select(`
      *,
      Card (
        *
      )
    `)
    .eq('id', newList.id)
    .single();
    
    list = createdListWithCards.data

    await createAuditLog({
      entityID: list.id,
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.CREATE,
    });
  } catch (error) {
    return {
      error: "Failed to copy.",
    };
  }

  revalidatePath(`/board/${boardId}`);

  return {
    data: list,
  };
};

export const copyList = createSafeAction(CopyList, handler);
