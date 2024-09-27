import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const ActivityList = async () => {
  const { orgId } = auth();

  if (!orgId) {
    redirect("/select-org");
  }

  const { data: auditLogs, } = await supabase
  .from('Auditlog')
  .select('*')  // Select all columns, or specify the ones you need
  .eq('orgId', orgId);  // Filtering by orgId

  return (
    <ol className="space-y-4 mt-4">
      <p className="hidden last:block text-center text-xs ">
        No activity found inside this organization
      </p>
      {auditLogs && auditLogs.map((log) => (
        <ActivityItem key={log.id} item={log} />
      ))}
    </ol>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="space-y-4 mt-4">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[60%] h-14" />
      <Skeleton className="w-[70%] h-14" />
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[50%] h-14" />
      <Skeleton className="w-[80%] h-14" />
    </ol>
  );
};
