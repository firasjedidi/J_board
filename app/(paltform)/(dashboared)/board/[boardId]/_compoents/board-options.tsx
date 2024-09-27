"use client";
import { MoreHorizontal, X } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { deleteBoard } from "@/actions/delete-board";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface BoardOptionsProps {
  id: number;
}

export const BoardOptions = ({ id }: BoardOptionsProps) => {
  const { execute, isLoading, fieldErrors } = useAction(deleteBoard, {
    onError(error) {
      toast.error(error);
    },
  });

  const onDelete = () => {
    execute({ id });
  };
  return (
    <Popover>
      <PopoverTrigger>
        <Button className="h-auto w-auto p-2" variant="transparent">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pt-3 pb-3 " side="bottom" align="start">
        <div className="text-sm fornt-medium text-center text-neutral-600 pb-4">
          Boared actions
        </div>
        <PopoverClose asChild>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          className="rounded-sm w-full h-auto p-2 px-5 justify-start"
          variant="ghost"
          disabled={isLoading}
          onClick={onDelete}
        >
          Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  );
};
