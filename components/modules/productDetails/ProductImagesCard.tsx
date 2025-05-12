import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import validator from "validator";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PlaceholderImage from "@/public/images/product-placeholder.png";
// import WishlistIcon from "@/public/images/wishlist.svg";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import ReactPlayer from "react-player/lazy";
import { isImage, isVideo } from "@/utils/helper";
import ProductEditForm from "../factories/ProductEditForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMe } from "@/apis/queries/user.queries";
import AddToCustomizeForm from "../factories/AddToCustomizeForm";
import { useSellerRewards } from "@/apis/queries/seller-reward.queries";
import SellerRewardDetail from "./SellerRewardDetail";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ProductImagesCardProps = {
  productDetails: any;
  onAdd: () => void;
  onToCart: () => void;
  onToCheckout: () => void;
  hasItem: boolean;
  isLoading: boolean;
  onWishlist: () => void;
  haveAccessToken: boolean;
  inWishlist?: boolean;
  askForPrice?: string;
  openCartCard: () => void;
  onProductUpdateSuccess: () => void;
  isAddedToCart?: boolean;
  cartQuantity?: number;
};

const ProductImagesCard: React.FC<ProductImagesCardProps> = ({
  productDetails,
  onAdd,
  onToCart,
  onToCheckout,
  hasItem,
  isLoading,
  onWishlist,
  haveAccessToken,
  inWishlist,
  askForPrice,
  openCartCard,
  onProductUpdateSuccess,
  isAddedToCart,
  cartQuantity = 0,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productSellerImage =
    productDetails?.product_productPrice?.[0]?.productPrice_productSellerImage;

  useEffect(() => {
    const tempImages = productSellerImage?.length
      ? productSellerImage
      : productDetails?.productImages;

    if (!tempImages) return;

    setPreviewImages(
      tempImages?.map((item: any) =>
        item?.image && validator.isURL(item.image)
          ? item.image
          : item?.video && validator.isURL(item.video)
            ? item.video
            : PlaceholderImage,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSellerImage, productDetails?.productImages]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", (emblaApi) => {
      // Do something on select.
      const index = emblaApi.selectedScrollSnap();
      setCurrentImageIndex(index);
    });
  }, [api]);

  // For Edit Modal
  const wrapperRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleToggleEditModal = () => setIsEditModalOpen(!isEditModalOpen);

  const me = useMe();

  const loginUserId = me?.data?.data?.id;

  //  For Customize Modal

  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const handleToCustomizeModal = () =>
    setIsCustomizeModalOpen(!isCustomizeModalOpen);

  const [reward, setReward] = useState<{ [key: string]: string }>();

  const [isSellerRewardDetailModalOpen, setIsSellerRewardDetailModalOpen] =
    useState<boolean>(false);

  const handleSellerRewardDetailModal = () =>
    setIsSellerRewardDetailModalOpen(!isSellerRewardDetailModalOpen);

  const sellerRewardsQuery = useSellerRewards(
    {
      page: 1,
      limit: 1,
      productId: productDetails?.id,
      sortType: "desc",
    },
    !!productDetails?.id,
  );

  useEffect(() => {
    const reward = sellerRewardsQuery?.data?.data?.[0];
    if (reward && new Date(reward.endTime).getTime() > new Date().getTime())
      setReward(reward);
  }, [sellerRewardsQuery?.data?.data, productDetails]);

  return (
    <div className="product-view-s1-left">
      <div className="mb-3 flex flex-col-reverse md:mb-3 lg:mb-0 lg:grid lg:grid-cols-4 lg:gap-4">
        <div className="relative order-2 col-span-3 flex items-center space-y-4 bg-gray-100 md:max-h-[500px]">
          {!isLoading && haveAccessToken ? (
            <button
              type="button"
              className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white p-2"
              onClick={onWishlist}
            >
              {inWishlist ? <FaHeart color="red" /> : <FaRegHeart />}
            </button>
          ) : null}
          {!isLoading && previewImages?.length ? (
            <Carousel
              className="w-full"
              opts={{ align: "start", loop: true }}
              setApi={setApi}
            >
              <CarouselContent className="-ml-1">
                {previewImages?.map((item, index: number) => (
                  <CarouselItem key={index} className="basis pl-1">
                    <div className="p-1">
                      <div className="relative max-h-[250px] min-h-[250px] w-full">
                        {isImage(item) ? (
                          <Image
                            src={item}
                            alt="primary-image"
                            fill
                            className="object-contain"
                          />
                        ) : isVideo(item) ? (
                          <div className="player-wrapper !py-[30%]">
                            <ReactPlayer
                              url={item}
                              width="100%"
                              height="100%"
                              // playing
                              controls
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {previewImages?.length > 1 ? (
                <CarouselPrevious className="left-0" />
              ) : null}
              {previewImages?.length > 1 ? (
                <CarouselNext className="right-0" />
              ) : null}
            </Carousel>
          ) : null}

          {!isLoading && !previewImages?.length ? (
            <div className="relative min-h-[500px] w-full">
              <Image
                src={PlaceholderImage}
                alt="primary-image"
                fill
                className="object-contain"
              />
            </div>
          ) : null}

          {isLoading ? <Skeleton className="min-h-[250px] w-full" /> : null}
        </div>

        <div className="col-span-1 m-auto flex !h-full w-full flex-wrap gap-4 self-start sm:w-auto sm:flex-col">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="h-28 w-28" key={index} />
              ))
            : null}

          {productDetails?.productImages?.map((item: any, index: number) => (
            <Button
              variant="ghost"
              className={cn(
                previewImages[currentImageIndex] === item?.image ||
                  previewImages[currentImageIndex] === item?.video
                  ? "border-2 border-red-500"
                  : "",
                "relative h-28 w-28 rounded-none bg-gray-100",
              )}
              key={item?.id}
              onClick={() => api?.scrollTo(index)}
            >
              <Image
                src={
                  item?.image && validator.isURL(item.image)
                    ? item.image
                    : PlaceholderImage
                }
                alt="primary-image"
                fill
                className="rounded-none object-cover"
              />
            </Button>
          ))}
        </div>
      </div>

      {/* For factories type */}
      {!isLoading &&
      productDetails?.product_productPrice?.[0]?.isCustomProduct === "true" ? (
        <div className="my-2 flex w-full flex-wrap justify-end gap-3 self-end pb-2">
          {productDetails?.adminId !== loginUserId ? (
            <>
              <Button
                type="button"
                onClick={handleToCustomizeModal}
                className="h-14 max-w-[205px] flex-1 rounded-none bg-color-blue text-base"
                dir={langDir}
                translate="no"
              >
                {t("send_to_customize")}
              </Button>
              <Button
                type="button"
                // onClick={onToCheckout}
                onClick={onToCart}
                className="h-14 max-w-[205px] flex-1 rounded-none bg-color-blue text-base"
                dir={langDir}
                translate="no"
              >
                {t("message_vendor")}
              </Button>
            </>
          ) : null}
          {/* {productDetails?.adminId == loginUserId ? (
                <Button
                  type="button"
                  // onClick={onToCheckout}
                  onClick={handleToggleEditModal}
                  className="h-14 flex-1 rounded-none bg-color-yellow text-base"
                >
                  Edit Product
                </Button>
              ) : null} */}
        </div>
      ) : null}

      {!isLoading && askForPrice === "true" ? (
        <Link href={`/seller-rfq-request?product_id=${productDetails?.id}`}>
          <Button
            type="button"
            className="h-14 w-full flex-1 rounded-none bg-color-yellow text-base"
            dir={langDir}
            translate="no"
          >
            {t("ask_vendor_for_price")}
          </Button>
        </Link>
      ) : null}
      {!isLoading && askForPrice !== "true" ? (
        <div className="flex w-full flex-wrap justify-end gap-3 self-end">
          <Button
            type="button"
            onClick={onAdd}
            className="h-14 max-w-[205px] flex-1 rounded-none bg-color-yellow text-base"
            disabled={isAddedToCart || cartQuantity == 0}
            translate="no"
          >
            {isAddedToCart ? t("added_to_cart") : t("add_to_cart")}
          </Button>
          <Button
            type="button"
            onClick={onToCart}
            className="h-14 max-w-[205px] flex-1 rounded-none bg-dark-orange text-base"
            dir={langDir}
            translate="no"
          >
            {t("buy_now")}
          </Button>
          {reward && (
            <Button
              type="button"
              onClick={() => setIsSellerRewardDetailModalOpen(true)}
              className="h-14 flex-1 rounded-none bg-dark-orange text-base"
              dir={langDir}
              translate="no"
            >
              {t("generate_share_link")}
            </Button>
          )}
        </div>
      ) : null}

      {/* For Edit Dialog */}

      <Dialog open={isEditModalOpen} onOpenChange={handleToggleEditModal}>
        <DialogContent
          className="add-new-address-modal h-screen gap-0 overflow-y-scroll p-0 md:!max-w-2xl"
          ref={wrapperRef}
        >
          <ProductEditForm
            onClose={() => {
              setIsEditModalOpen(false);
            }}
            selectedProductId={productDetails?.id}
            onProductUpdateSuccess={onProductUpdateSuccess} // Pass to form
          />
        </DialogContent>
      </Dialog>

      {/* For Customize Dialog */}
      <Dialog open={isCustomizeModalOpen} onOpenChange={handleToCustomizeModal}>
        <DialogContent
          className="add-new-address-modal gap-0 p-0 md:!max-w-2xl"
          ref={wrapperRef}
        >
          <AddToCustomizeForm
            selectedProductId={productDetails?.id}
            onClose={() => {
              setIsCustomizeModalOpen(false);
            }}
            onAddToCart={() => router.push(`/factories-cart`)}
          />
        </DialogContent>
      </Dialog>

      {reward && (
        <Dialog
          open={isSellerRewardDetailModalOpen}
          onOpenChange={handleSellerRewardDetailModal}
        >
          <DialogContent
            className="add-new-address-modal gap-0 p-0 md:!max-w-2xl"
            ref={wrapperRef}
          >
            <SellerRewardDetail
              reward={reward}
              onClose={() => setIsSellerRewardDetailModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductImagesCard;
