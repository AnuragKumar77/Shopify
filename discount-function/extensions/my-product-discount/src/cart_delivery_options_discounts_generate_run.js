import {
  DeliveryDiscountSelectionStrategy,
  DiscountClass,
} from "../generated/api";

/**
  * @typedef {import("../generated/api").DeliveryInput} RunInput
  * @typedef {import("../generated/api").CartDeliveryOptionsDiscountsGenerateRunResult} CartDeliveryOptionsDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartDeliveryOptionsDiscountsGenerateRunResult}
  */

export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  const deliveryGroup = input.cart.deliveryGroups[0];
  if (!deliveryGroup) return { operations: [] };

  const hasShippingDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Shipping
  );

  if (!hasShippingDiscountClass) return { operations: [] };

  const subtotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  const totalQty = input.cart.lines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  const candidates = [];

  // ✅ Free standard shipping (2+ items)
  if (totalQty >= 2) {
    const standardOption = deliveryGroup.deliveryOptions.find((opt) =>
      opt.title.toLowerCase().includes("standard")
    );

    if (standardOption) {
      candidates.push({
        message: "FREE STANDARD SHIPPING",
        targets: [
          {
            deliveryOption: {
              handle: standardOption.handle,
            },
          },
        ],
        value: {
          percentage: { value: 100 },
        },
      });
    }
  }

  // ✅ Free express shipping ($200+)
  if (subtotal >= 200) {
    const expressOption = deliveryGroup.deliveryOptions.find((opt) =>
      opt.title.toLowerCase().includes("express")
    );

    if (expressOption) {
      candidates.push({
        message: "FREE EXPRESS SHIPPING",
        targets: [
          {
            deliveryOption: {
              handle: expressOption.handle,
            },
          },
        ],
        value: {
          percentage: { value: 100 },
        },
      });
    }
  }

  if (!candidates.length) return { operations: [] };

  return {
    operations: [
      {
        deliveryDiscountsAdd: {
          candidates,
          selectionStrategy: DeliveryDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}
