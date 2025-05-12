import React, { useEffect, useState } from "react";
import Products from "@/components/modules/vendorOperations/Products";
import Operations from "@/components/modules/vendorOperations/Operations";
import QuestionAndAnswers from "./QuestionAndComments";

const VendorOperations = () => {
  const [selectedOperation, setSelectedOperation] = useState<string>(
    "questions_n_comments",
  );
  const [selectedProduct, setSelectedProduct] = useState<{[key: string]: any}>();

  return (
    <>
      <div className="flex w-full flex-wrap rounded-sm border border-solid border-gray-300">
        <Operations onSelect={(operation) => setSelectedOperation(operation)} />

        <Products onSelect={(product) => setSelectedProduct(product)} />

        {selectedOperation == "admin_n_support" && selectedProduct ? (
          <div className="w-full border-r border-solid border-gray-300 lg:w-[67%]">
            <div className="flex min-h-[55px] w-full items-center justify-between border-b border-solid border-gray-300 px-[10px] py-[10px] text-base font-normal text-[#333333]">
              <span>Admin & Support</span>
            </div>
          </div>
        ) : null}

        {selectedOperation == "questions_n_comments" && selectedProduct ? (
          <QuestionAndAnswers 
            productId={selectedProduct.productId} 
            productAddedBy={selectedProduct.userId} 
          />
        ) : null}

        {selectedOperation == "rate_n_review" && selectedProduct ? (
          <div className="w-full border-r border-solid border-gray-300 lg:w-[67%]">
            <div className="flex min-h-[55px] w-full items-center justify-between border-b border-solid border-gray-300 px-[10px] py-[10px] text-base font-normal text-[#333333]">
              <span>Rate & Review</span>
            </div>
          </div>
        ) : null}

        {selectedOperation == "complains" && selectedProduct ? (
          <div className="w-full border-r border-solid border-gray-300 lg:w-[67%]">
            <div className="flex min-h-[55px] w-full items-center justify-between border-b border-solid border-gray-300 px-[10px] py-[10px] text-base font-normal text-[#333333]">
              <span>Complains</span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default VendorOperations;
