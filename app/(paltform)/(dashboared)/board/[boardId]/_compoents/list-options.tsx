"use client";

import { useAction } from "@/hooks/use-action";
import { List } from "@/lib/types";
import { deleteList } from "@/actions/delete-list ";
import { copyList } from "@/actions/copy-list";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, X } from "lucide-react";
import { FormButton } from "@/components/form/form-button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRef, ElementRef } from "react";

interface ListOptionsProps {
  data: List;
  onAddCard: () => void;
}

export const ListOptions = ({ data, onAddCard }: ListOptionsProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);

  const { execute: executeDelete } = useAction(deleteList, {
    onSuccess(data) {
      toast.success(`List "${data.title}" deleted`);
      closeRef?.current?.click();
    },
    onError(error) {
      toast.error(error);
    },
  });

  const { execute: executeCopy } = useAction(copyList, {
    onSuccess(data) {
      toast.success(`List "${data.title}" copied`);
      closeRef?.current?.click();
    },
    onError(error) {
      toast.error(error);
    },
  });

  const onDelete = (formData: FormData) => {
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;

    executeDelete({ id, boardId });
  };

  const onCopy = (formData: FormData) => {
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;

    executeCopy({ id, boardId });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2 " variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pt-3 pb-3 " side="bottom" align="start">
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          List actions
        </div>
        <PopoverClose ref={closeRef}>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          onClick={onAddCard}
          variant="ghost"
          className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm "
        >
          Add card...
        </Button>
        <form action={onCopy}>
          <input hidden name="id" defaultValue={data.id} />
          <input hidden name="boardId" defaultValue={data.boardId} />
          <FormButton
            variant="ghost"
            className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm "
          >
            Copy list...
          </FormButton>
        </form>
        <Separator />
        <form action={onDelete}>
          <input hidden name="id" defaultValue={data.id} />
          <input hidden name="boardId" defaultValue={data.boardId} />
          <FormButton
            variant="ghost"
            className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm "
            
          >
            Delete this list...
          </FormButton>
        </form>
      </PopoverContent>
    </Popover>
  );
};
