import React, { useMemo, useState } from "react";
import Image from "next/image";
import UserRatingCard from "./UserRatingCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import ReviewForm from "./ReviewForm";
import { useReviews } from "@/apis/queries/review.queries";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { useMe } from "@/apis/queries/user.queries";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type ReviewSectionProps = {
  productId?: string;
  hasAccessToken?: boolean;
  productReview: { rating: number }[];
  isCreator: boolean;
};

const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  hasAccessToken,
  productReview,
  isCreator,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [sortType, setSortType] = useState<"highest" | "lowest" | "newest">(
    "newest",
  );
  const [reviewId, setReviewId] = useState<number>();
  const me = useMe();
  const handleToggleReviewModal = () =>
    setIsReviewModalOpen(!isReviewModalOpen);

  const reviewsQuery = useReviews(
    { page: 1, limit: 20, productId: productId ?? "", sortType },
    !!productId,
  );

  const calculateAvgRating = useMemo(() => {
    const totalRating = productReview?.reduce(
      (acc: number, item: { rating: number }) => {
        return acc + item.rating;
      },
      0,
    );

    const result = totalRating / productReview?.length;
    return !isNaN(result) ? Math.floor(result) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productReview?.length]);

  const calculateRatings = useMemo(
    () => (rating: number) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          stars.push(<FaStar key={i} color="#FFC107" size={20} />);
        } else {
          stars.push(<FaRegStar key={i} color="#FFC107" size={20} />);
        }
      }
      return stars;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productReview?.length],
  );

  const reviewExists = useMemo(() => {
    return reviewsQuery?.data?.data?.some(
      (item: { userId: string }) => item.userId === me?.data?.data?.id,
    );
  }, [me?.data?.data?.id, reviewsQuery?.data?.data]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex w-auto flex-wrap items-start justify-start">
          <h2
            className="mb-0 mr-7 text-2xl font-semibold leading-7 text-color-dark"
            dir={langDir}
            translate="no"
          >
            {t("ratings_n_reviews")}
          </h2>
          <div className="flex w-auto flex-col">
            <div className="flex w-auto items-center justify-start">
              <h4 className="mb-0 mr-2.5 text-2xl font-medium leading-7 text-color-dark">
                {calculateAvgRating ? `${calculateAvgRating}.0` : "0"}
              </h4>
              {calculateRatings(calculateAvgRating)}
            </div>
            <div
              className="mt-1.5 w-auto text-sm font-medium leading-5 text-gray-500"
              dir={langDir}
              translate="no"
            >
              <p>
                {t("based_on_n_reviews", {
                  n: reviewsQuery.data?.data?.length,
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="w-auto">
          {hasAccessToken && !isCreator && !reviewExists ? (
            <button
              type="button"
              onClick={handleToggleReviewModal}
              className="flex rounded-sm bg-dark-orange p-3 text-sm font-bold leading-5 text-white"
              translate="no"
            >
              <Image
                src="/images/pen-icon.svg"
                height={20}
                width={20}
                className="mr-2"
                alt="pen-icon"
              />
              <span dir={langDir}>{t("write_a_review")}</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex w-full items-center justify-end py-5">
        <ul className="flex items-center justify-end">
          <li className="ml-2 text-sm font-medium text-color-dark">Sort By:</li>
          <li className="ml-2">
            <Button
              variant={sortType === "newest" ? "secondary" : "ghost"}
              onClick={() => setSortType("newest")}
              className="block rounded-full border border-solid border-gray-300 px-2 text-sm font-medium text-gray-500"
              dir={langDir}
              translate="no"
            >
              {t("newest")}
            </Button>
          </li>
          <li className="ml-2">
            <Button
              variant={sortType === "highest" ? "secondary" : "ghost"}
              onClick={() => setSortType("highest")}
              className="block rounded-full border border-solid border-gray-300 px-2 text-sm font-medium text-gray-500"
              dir={langDir}
              translate="no"
            >
              {t("highest")}
            </Button>
          </li>
          <li className="ml-2">
            <Button
              variant={sortType === "lowest" ? "secondary" : "ghost"}
              onClick={() => setSortType("lowest")}
              className="block rounded-full border border-solid border-gray-300 px-2 text-sm font-medium text-gray-500"
              dir={langDir}
              translate="no"
            >
              {t("lowest")}
            </Button>
          </li>
        </ul>
      </div>
      <div className="flex w-full border-t-2 border-dashed border-gray-300 py-5">
        {!reviewsQuery?.data?.data?.length ? (
          <div
            className="w-full text-center text-sm font-bold text-dark-orange"
            dir={langDir}
            translate="no"
          >
            {t("no_reviews_found")}
          </div>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviewsQuery.data?.data?.length
            ? reviewsQuery.data?.data.map(
                (review: {
                  id: number;
                  rating: number;
                  title: string;
                  description: string;
                  createdAt: string;
                  reviewByUserDetail: {
                    firstName: string;
                    lastName: string;
                    profilePicture: string;
                  };
                  userId: number;
                }) => (
                  <UserRatingCard
                    key={review?.id}
                    rating={review?.rating}
                    name={`${review?.reviewByUserDetail?.firstName} ${review?.reviewByUserDetail?.lastName}`}
                    title={review.title}
                    review={review.description}
                    date={review.createdAt}
                    profilePicture={review?.reviewByUserDetail?.profilePicture}
                    isBuyer={
                      me.data?.data?.tradeRole === "BUYER" &&
                      me.data?.data?.id === review?.userId
                    }
                    onEdit={() => {
                      setReviewId(review?.id);
                      handleToggleReviewModal();
                    }}
                  />
                ),
              )
            : null}
        </div>
      </div>
      {/* <div className="flex w-full items-center justify-center text-center text-sm font-bold text-dark-orange">
        <span className="flex">
          <Image
            src="/images/loader.png"
            className="mr-1.5"
            height={20}
            width={20}
            alt="loader-icon"
          />
          Load More
        </span>
      </div> */}

      <Dialog open={isReviewModalOpen} onOpenChange={handleToggleReviewModal}>
        <DialogContent>
          <ReviewForm
            onClose={() => {
              setReviewId(undefined);
              handleToggleReviewModal();
            }}
            reviewId={reviewId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewSection;
