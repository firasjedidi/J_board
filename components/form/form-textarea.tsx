"use client";

import { useFormStatus } from "react-dom";
import { KeyboardEventHandler, forwardRef } from "react";

import { cn } from "@/lib/utils";

import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FormErrors } from "./form-errors";

interface FormTextareaProps {
  id: string;
  label?: string;
  palceholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement | undefined>;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      label,
      palceholder,
      required,
      disabled,
      errors,
      className,
      defaultValue,
      onBlur,
      onClick,
      onKeyDown,
    },
    ref
  ) => {
    const { pending } = useFormStatus();

    return (
      <div className="space-y-2 w-full">
        <div className="space-y-1 w-full">
          {label ? (
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-700"
            >
              {label}
            </Label>
          ) : null}
          <Textarea
            id={id}
            name={id}
            ref={ref}
            onBlur={onBlur}
            onClick={onClick}
            onKeyDown={onKeyDown}
            required={required}
            disabled={disabled || pending}
            placeholder={palceholder}
            defaultValue={defaultValue}
            className={cn("resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 outline-none shadow-sm", className)}
            aria-describedby={`${id}-error`}
          />
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
