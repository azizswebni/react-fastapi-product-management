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
import {
  addProductService,
  uploadProductImageService,
} from "@/services/products/productsServices";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

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
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // State for the uploaded file
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast();

  const uploadProductImageMutation = useMutation({
    mutationFn: (data: { file: File; id: string }) =>
      uploadProductImageService(data.id, data.file),
    onSuccess: () => {
      toast({
        title: "Product added successfully!",
      });
      resetComponent();
    },
    onError: (err_message: string) => {
      toast({
        title: err_message,
      });
    },
  });
  const resetComponent = () => {
    refetch();
    setOpen(false);
    form.reset();
    setUploadedFile(null);
  };

  const addProductMutation = useMutation({
    mutationFn: addProductService,
    onSuccess: ({ id }) => {
      if (uploadedFile && id) {
        uploadProductImageMutation.mutate({ file: uploadedFile, id });
      } else {
        toast({
          title: "Product added successfully!",
        });
        resetComponent();
      }
    },
    onError: (err_message: string) => {
      toast({
        title: err_message,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addProductMutation.mutate(values);
  }

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]); // Save the first file
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Accept only image files
    maxFiles: 1,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <div>
              <FormLabel>Product Image</FormLabel>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-4 ${
                  isDragActive ? "bg-gray-100" : ""
                }`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <p>{uploadedFile.name}</p>
                ) : isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <p>Drag & drop an image here, or click to select one</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
