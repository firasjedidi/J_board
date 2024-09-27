"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabaseClient";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateListOrder } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unautherized",
    };
  }

  const { items, boardId } = data;
  let list;
  try {
    // Step 1: Map through the items and build update promises
    const updatePromises = items.map(async (list) => {
      // Fetch the list and its board to ensure orgId matches
      const { data: listData } = await supabase
        .from("List")
        .select(
          `
            id,
            boardId,
            Board (
              orgId
            )
          `
        )
        .eq("id", list.id)
        .single();

      // If the list or the associated board doesn't match the orgId, skip the update
      const isAuthorized = listData?.Board?.orgId === orgId;
      if (!isAuthorized) {
        return { error: "Failed to reorder." };
      }

      // Perform the update if the check passes
      const { data: updatedList, error: updateError } = await supabase
      .from("List")
      .update({ order: list.order })
      .eq("id", list.id)
      .select(`
        *,
        Board (
          orgId
        )
      `) 
      .single()
      ;

      if (updateError) {
        console.error(`Error updating list ${list.id}:`, updateError.message);
        return null;
      }

      return updatedList;
    });

    // Step 2: Execute all updates in parallel using Promise.all
    const updatedLists = await Promise.all(updatePromises);

    // Filter out any null results in case of errors
    const successfulUpdates = updatedLists.filter((list) => list !== null);

    list = successfulUpdates;
    
  } catch (error) {
    return {
      error: "Failed to reorder.",
    };
  }
  revalidatePath(`/board/${boardId}`);
  return {
    data: list,
  };
};

export const updateListOrder = createSafeAction(UpdateListOrder, handler);
