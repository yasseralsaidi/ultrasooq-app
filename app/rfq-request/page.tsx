"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import TaskIcon from "@/public/images/task-icon.svg";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import RfqRequestChat from "@/components/modules/chat/rfqRequest/RfqRequestChat";

const RfqRequestPage = () => {
  const [rfqQuotesId, setRfqQuotesId] = useState<string | null>();
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    let rfqId = params.get("rfqQuotesId");
    setRfqQuotesId(rfqId);
  }, []);

  return (
    <section className="m-auto flex w-full max-w-[1400px] py-8">
      <div className="w-[15%]">
        <div className="w-full px-0 py-0 shadow-lg">
          <ul>
            <li className="w-full py-1">
              <Link
                href="#"
                className="flex items-center justify-start rounded-xl p-2"
              >
                <div className="flex h-[20px] w-[20px] items-center justify-center ">
                  <Image src={TaskIcon} alt="Task Icon" />
                </div>
                <div className="pl-1 text-sm font-medium text-[#828593]">
                  Ultrasooq
                </div>
              </Link>
            </li>
            <li
              className={cn(
                pathname?.includes("rfq-request") ? "bg-dark-orange" : "",
                "w-full py-1",
              )}
            >
              <Link
                href={`/rfq-request?rfqQuotesId=${rfqQuotesId}`}
                className="flex items-center justify-start rounded-xl p-2 text-white"
              >
                <div className="flex h-[20px] w-[20px] items-center justify-center ">
                  <Image
                    src={TaskIcon}
                    alt="Task Icon"
                    className="brightness-0 invert"
                  />
                </div>
                <div className="pl-1 text-sm font-medium text-white">RFQ</div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-[85%] px-2">
        <RfqRequestChat rfqQuoteId={rfqQuotesId} />
      </div>
    </section>
  );
};

export default RfqRequestPage;
