import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";

import { supabase } from '@/lib/supabaseClient';

import { BoradNavbar } from "./_compoents/borard-navbar";

export async function generateMetadata({
  params,
}: {
  params: { boardId: string };
}) {
  const { orgId } = auth();
  if (!orgId) {
    return {
      title: "Board",
    };
  }
  const {data:board} = await supabase
  .from('Board')
  .select('*')
  .eq('id', params.boardId)
  .eq('orgId', orgId)
  .single();
 
  return {
    title: board?.title || "Board",
  };
}

const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { boardId: string };
}) => {
  const { orgId } = auth();

  if (!orgId) {
    return redirect("/select-org");
  }

  const {data:board} = await supabase
  .from('Board')
  .select('*')
  .eq('id', params.boardId)
  .eq('orgId', orgId)
  .single();

  if (!board) {
    notFound();
  }
  return (
    <div
      style={{ backgroundImage: `url(${board.imageFullUrl})` }}
      className="relative h-full bg-no-repeat bg-cover bg-center "
    >
      <BoradNavbar data={board}/>
      <div className="absolute inset-0 bg-black/30"/>
      <main className="relative pt-28 h-full">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
