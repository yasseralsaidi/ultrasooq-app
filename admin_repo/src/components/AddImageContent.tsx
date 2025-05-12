import React from "react";

type AddImageContentProps = {
  description: string;
};

const AddImageContent: React.FC<AddImageContentProps> = ({ description }) => {
  return (
    <div className="absolute my-auto h-full w-full text-center text-sm font-medium leading-4 text-color-dark">
      <div className="flex h-full flex-col items-center justify-center">
        <img
          src="/images/upload.png"
          className="mb-3"
          width={30}
          height={30}
          alt="camera"
        />
        <span>{description}</span>
        <span className="text-blue-500">browse</span>
        <p className="text-normal mt-3 text-xs leading-4 text-gray-300">
          (.jpg or .png only. Up to 1mb)
        </p>
      </div>
    </div>
  );
};

export default AddImageContent;
