import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "react-query";
import { updateProductService } from "@/services/products/productsServices";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";
import { useEffect, useState } from "react";
import { isEqual } from "lodash";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  category: z.string(),
  description: z.string(),
  price: z.number(),
});

const inputsTypes = {
  name: "text",
  category: "text",
  description: "text",
  price: "number",
};

interface UpdateProductProps {
  id: string;
  category: string;
  description: string;
  name: string;
  price: number;
  refetch: () => void;
}

export function UpdateProduct({
  refetch,
  id,
  category,
  description,
  name,
  price,
}: UpdateProductProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: category,
      description: description,
      name: name,
      price: price,
    },
  });
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      form.reset({
        category,
        description,
        name,
        price,
      });
    }
  }, [category, description, name, price, open, form]);

  const updateProductMutation = useMutation({
    mutationFn: (payload: { id: string; updateProductData: z.infer<typeof formSchema> }) =>
      updateProductService(payload.id, payload.updateProductData),
    onSuccess: () => {
      toast({
        title: "Product updated successfully !",
      });
      refetch();
      setOpen(false);
    },
    onError: (err_message: string) => {
      toast({
        title: err_message,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const initialValues = { category, description, name, price };

    if (isEqual(values, initialValues)) {
      setOpen(false);
      return;
    }

    updateProductMutation.mutate({ id, updateProductData: values });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Edit />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update {name}</DialogTitle>
            <DialogDescription>
              Update product information. Click confirm when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {Object.keys(formSchema.shape).map((val) => (
                <FormField
                  control={form.control}
                  name={val as keyof z.infer<typeof formSchema>}
                  key={val}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{val}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={val}
                          {...field}
                          type={inputsTypes[val as keyof typeof inputsTypes]}
                          onChange={(e) =>
                            field.onChange(
                              inputsTypes[val as keyof typeof inputsTypes] ===
                                "number"
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <DialogFooter>
                <Button type="submit">Confirm</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
