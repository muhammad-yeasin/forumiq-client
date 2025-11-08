import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface TextInputProps<T extends FieldValues> {
  name: Path<T>;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  control: Control<T>;
  description?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const TextInput = <T extends FieldValues>(props: TextInputProps<T>) => {
  const {
    name,
    type = "text",
    placeholder,
    control,
    description,
    label,
    className = "",
    disabled = false,
    readOnly = false,
  } = props;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                type={
                  type === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : type
                }
                placeholder={placeholder}
                className={cn({ "pr-8": type === "password" }, className)}
                {...field}
                disabled={disabled}
                readOnly={readOnly}
              />
              {type === "password" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-primary hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface TextAreaInputProps<T extends FieldValues> {
  name: Path<T>;
  placeholder?: string;
  control: Control<T>;
  description?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
}

export const TextAreaInput = <T extends FieldValues>(
  props: TextAreaInputProps<T>
) => {
  const {
    name,
    placeholder,
    control,
    description,
    label,
    className = "",
    disabled = false,
    readOnly = false,
    rows = 4,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={className}
              rows={rows}
              {...field}
              disabled={disabled}
              readOnly={readOnly}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
