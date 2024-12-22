import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { addProductService } from "@/services/products/productsServices";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";

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

export function AddProduct({ refetch }: { refetch: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast();

  const addProductMutation = useMutation({
    mutationFn: addProductService,
    onSuccess: () => {
      refetch();
      toast({
        title: "Product added successfully !",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add product",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addProductMutation.mutate(values);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Add Product
          <Toaster />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new product</DialogTitle>
          <DialogDescription>
            Add product information. Click confirm when you're done.
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
              <DialogClose asChild>
                <Button type="submit">Confirm</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
