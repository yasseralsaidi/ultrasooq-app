import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "../requests/upload.requests";

export const useUploadFile = () =>
  useMutation({
    mutationFn: async (payload: any) => {
      const res = await uploadFile(payload);
      return res.data;
    },
    onSuccess: () => {},
    onError: (err) => {
      console.log(err);
    },
  });
