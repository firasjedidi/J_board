"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabaseClient";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateCardOrder } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { items, boardId } = data;
  let updatedCard;

  try {
 // Step 1: Map through the items and build update promises
 const updatePromises = items.map(async (card) => {
  // Fetch the card and its list/board to ensure orgId matches
  const { data: cardData, error: fetchError } = await supabase
    .from("Card")
    .select(
      `
        id,
        listId,
        List (
          boardId,
          Board (
            orgId
          )
        )
      `
    )
    .eq("id", card.id)
    .single();

  if (fetchError) {
    console.error(`Error fetching card ${card.id}:`, fetchError.message);
    return { error: "Failed to fetch card." };
  }

  // Check if orgId matches
  const isAuthorized = cardData?.List?.Board?.orgId === orgId;
  if (!isAuthorized) {
    console.warn(`Authorization failed for card ${card.id}.`);
    return { error: "Failed to update due to authorization." };
  }

  // Perform the update if the check passes
  const { data: updatedCard, error: updateError } = await supabase
    .from("Card")
    .update({
      order: card.order,
      listId: card.listId, // If needed to change listId
    })
    .eq("id", card.id)
    .select(`
      *,
      List (
        boardId,
        Board (
          orgId
        )
      )
    `)
    .single();

  if (updateError) {
    console.error(`Error updating card ${card.id}:`, updateError.message);
    return null;
  }

  return updatedCard;
});

// Step 2: Execute all updates in parallel using Promise.all
const updatedCards = await Promise.all(updatePromises);

// Filter out any null results in case of errors
const successfulUpdates = updatedCards.filter((card) => card !== null);

updatedCard = successfulUpdates;

  } catch (error) {
    console.log(error,"err");
    return {
      error: "Failed to reorder.",
    };
  }
  revalidatePath(`/board/${boardId}`);
  return {
    data: updatedCard,
  };
};

export const updateCardOrder = createSafeAction(UpdateCardOrder, handler);
