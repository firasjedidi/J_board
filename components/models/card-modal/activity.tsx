"use client";

import { ActivityIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Auditlog } from "@/lib/types";
import { ActivityItem } from "@/components/activity-item";

interface ActivitProps {
    data: Auditlog[];
}
  
export const Activity = ({data}:ActivitProps) => {
    
    return (
        <div className="flex items-start gap-x-3 w-full">
            <ActivityIcon className="h-5 w-5 mt-0.5 text-neutral-700 "/>
            <div className="w-full">
                <p className="font-semibold text-neutral-700 mb-2">
                    Actitviy
                </p>
                <ol className="mt-2 space-y-4">
                    {data.map((item)=>(
                        <ActivityItem key={item.id} item={item}  />
                    ))}
                </ol>
            </div>
        </div>
    )
}

Activity.Skeleton = function ActivitySkeleton() {
    return (
        <div className="flex items-start gap-x-3 w-full">
            <Skeleton className="h-6 w-6 bg-neutral-200"/>
            <div className="w-full">
                <Skeleton className="w-24 h-6 mb-2 bg-neutral-200"/>
                <Skeleton className="w-full h-10  bg-neutral-200"/>
            </div>
        </div>
    )
}