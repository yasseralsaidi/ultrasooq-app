import React, { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import SecurePaymentIcon from "@/public/images/securePaymenticon.svg";
import SupportIcon from "@/public/images/support-24hr.svg";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const ServiceDescriptionCard: React.FC<any> = ({
    selectedFeatures,
    decrementQuantity,
    incrementQuantity,
    updateQuantity,
    toggleFeature,
    allDetailsService,
    productId,
    productName,
    productPrice,
    offerPrice,
    skuNo,
    productTags,
    category,
    productQuantity = 0, // Default to 1 if undefined
    productReview,
    onAdd,
    isLoading,
    userId,
}) => {
    const t = useTranslations();
    const { user, langDir, currency } = useAuth();

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
            const stars: Array<React.ReactNode> = [];
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

    return (
        <div className="product-view-s1-right">
            {isLoading ? <Skeleton className="mb-2 h-10 w-full" /> : null}
            <div className="info-col">
                <h2>{productName}</h2>
            </div>
            {isLoading ? (
                <Skeleton className="mb-2 h-28 w-full" />
            ) : (
                <div className="info-col mb-2">
                    <div className="space-y-4">
                        <h5 className="text-lg font-semibold" translate="no">{t("select_services")}</h5>
                        {
                            allDetailsService?.serviceFeatures?.map((feature: any) => {
                                const selectedFeature = selectedFeatures.find(
                                    (item: any) => item.id === feature.id
                                );
                                const isSelected = !!selectedFeature;
                                const quantity = selectedFeature ? selectedFeature.quantity : 1;

                                return (
                                    <div
                                        key={feature.id}
                                        className="import-pickup-type-selector-item"
                                        style={{ maxWidth: "100%" }}
                                    >
                                        <div
                                            className={`import-pickup-type-selector-box flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${isSelected
                                                ? "bg-green-50 border-green-500"
                                                : "bg-white border-gray-200"
                                                }`}
                                            style={{
                                                minHeight: "0px",
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "start",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) =>
                                                    toggleFeature(feature.id, quantity, e.target.checked)
                                                }
                                                className="h-5 w-5 text-green-600 focus:ring-green-500"
                                            />
                                            <div className="text-container flex-1">
                                                <h5 dir={langDir} className="text-sm text-gray-800">
                                                    {feature.name}
                                                </h5>
                                                <p className="text-xs text-gray-500" dir={langDir}>
                                                    {feature.serviceCostType.toLowerCase()} —
                                                    <span translate="no">
                                                        {currency.symbol}
                                                        {feature.serviceCost}
                                                    </span>
                                                </p>
                                            </div>
                                            {isSelected ? (
                                                <div className="quantity-container flex items-center gap-2">
                                                    <label className="text-sm text-gray-600">Qty:</label>
                                                    <button
                                                        onClick={() => decrementQuantity(feature.id)}
                                                        className="w-8 h-8 flex items-center justify-center border rounded-md text-gray-600 hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                feature.id,
                                                                parseInt(e.target.value) || 1
                                                            )
                                                        }
                                                        className="w-16 p-1 border rounded-md text-center"
                                                    />
                                                    <button
                                                        onClick={() => incrementQuantity(feature.id)}
                                                        className="w-8 h-8 flex items-center justify-center border rounded-md text-gray-600 hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            )}

            <div className="info-col top-btm-border">
                <div className="form-group mb-0">
                    <div className="quantity-with-right-payment-info">
                        <div className="right-payment-info">
                            <ul>
                                <li>
                                    <Image
                                        src={SecurePaymentIcon}
                                        alt="secure-payment-icon"
                                        width={28}
                                        height={22}
                                    />
                                    <span dir={langDir} translate="no">{t("secure_payment")}</span>
                                </li>
                                <li>
                                    <Image
                                        src={SupportIcon}
                                        alt="support-24hr-icon"
                                        width={28}
                                        height={28}
                                    />
                                    <span dir={langDir} translate="no">{t("secure_payment")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDescriptionCard;
