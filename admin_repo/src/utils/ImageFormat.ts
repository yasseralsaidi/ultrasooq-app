const ImageFormat = {
  imageCheck(str: string) {
    if (
      str === "png" ||
      str === "jpg" ||
      str === "jpeg" ||
      str === "PNG" ||
      str === "JPG" ||
      str === "JPEG"
    ) {
      return true;
    } else {
      return false;
    }
  },
  videoCheck(str: string) {
    if (
      str === "mp4" ||
      str === "mp3" ||
      str === "gif" ||
      str === "MP4" ||
      str === "MP3" ||
      str === "GIF"
    ) {
      return true;
    } else {
      return false;
    }
  },
  fileUploadExtentionCheck(str: string) {
    if (
      str === "png" ||
      str === "jpg" ||
      str === "jpeg" ||
      str === "pdf" ||
      str === "PNG" ||
      str === "JPG" ||
      str === "JPEG" ||
      str === "PDF"
    ) {
      return true;
    } else {
      return false;
    }
  },
  fileUploadSize(fileSize: any) {
    //5MB
    if (
      fileSize === "" ||
      fileSize === null ||
      fileSize === undefined ||
      fileSize > 5242880
    ) {
      return false;
    } else {
      return true;
    }
  },
  videoUploadSize(fileSize: any) {
    //50MB
    if (
      fileSize === "" ||
      fileSize === null ||
      fileSize === undefined ||
      fileSize > 52428800
    ) {
      return false;
    } else {
      return true;
    }
  },
  fileUploadSizeForProfilePhoto(fileSize: any) {
    //4MB
    if (
      fileSize === "" ||
      fileSize === null ||
      fileSize === undefined ||
      fileSize > 4194304
    ) {
      return false;
    } else {
      return true;
    }
  },
  fileForRoster(str: string) {
    //For Roster
    if (
      str === "xls" ||
      str === "xlsx" ||
      str === "csv" ||
      str === "XLS" ||
      str === "XLSX" ||
      str === "CSV"
    ) {
      return true;
    } else {
      return false;
    }
  },
  fileUploadSizeForRoster(fileSize: any) {
    //10MB //For Roster
    if (
      fileSize === "" ||
      fileSize === null ||
      fileSize === undefined ||
      fileSize > 10485760
    ) {
      return false;
    } else {
      return true;
    }
  },
};
export default ImageFormat;
