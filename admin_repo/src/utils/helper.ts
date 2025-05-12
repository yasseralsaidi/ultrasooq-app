import { imageExtensions, videoExtensions } from "./constants";

export const handleDescriptionParse = (description: string) => {
  if (description) {
    try {
      const json = JSON.parse(description);
      return json;
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
};

export const isVideo = (path: string) => {
  if (typeof path === "string") {
    const extension = path.split(".").pop()?.toLowerCase();
    if (extension) {
      if (videoExtensions.includes(extension)) {
        return true;
      }
    }
    return false;
  } else if (typeof path === "object") {
    return true;
  }
};

export const isImage = (path: any) => {
  if (typeof path === "string") {
    const extension = path.split(".").pop()?.toLowerCase();
    if (extension) {
      if (imageExtensions.includes(extension)) {
        return true;
      }
    }
    return false;
  } else if (typeof path === "object" && path?.type?.includes("image")) {
    return true;
  }
};

export const convertDateTime = (dateString: string) => {
  if (!dateString) {
      return "-";
  }
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      minute: "numeric",
      hour: "numeric",
      hour12: true,
      second: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-GB", options);
  return formattedDate;
};
