import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { supabase } from "@/lib/supabaseClient";

import { ListContainer } from "./_compoents/list-container";

interface BoardIdPropqs {
  params: {
    boardId: string;
  };
}
const BoardIdPage = async ({ params }: BoardIdPropqs) => {
  const { orgId } = auth();
  if (!orgId) {
    redirect("/select-org");
  }

  const { data: listsWithBoard } = await supabase
    .from("List")
    .select(
      `
      *,
      Board (
        orgId
      ),
      Card (
        *
      ) 
    `
    )
    .eq("boardId", params.boardId) // Filter lists by the specific boardId
    .order("order", { ascending: true }) // Order lists by their 'order' field
    .order("order", { ascending: true, foreignTable: "Card" });

  if (!listsWithBoard) {
    console.error("Error: listsWithBoard is null");
    return { error: "Failed to fetch lists and cards" };
  }

  const filteredLists = listsWithBoard
    .filter((list) => list.Board?.orgId === orgId)
    .map((list) => {
      // Remove the Board data from each list
      const { Board, Card, ...rest } = list;
      const cards = Card; // Ensure cards is an array, empty if Card is null/undefined
      return { ...rest, cards };
    });
  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={params.boardId} data={filteredLists} />
    </div>
  );
};

export default BoardIdPage;
