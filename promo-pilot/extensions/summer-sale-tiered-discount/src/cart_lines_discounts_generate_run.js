import {
  DiscountClass,
  ProductDiscountSelectionStrategy,
} from '../generated/api';


/**
  * @typedef {import("../generated/api").CartInput} RunInput
  * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartLinesDiscountsGenerateRunResult}
  */

export function cartLinesDiscountsGenerateRun(input) {
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product
  );

  if (!hasProductDiscountClass) {
    return { operations: [] };
  }

  const operations = [];

  input.cart.lines.forEach((line) => {
    const quantity = line.quantity;

    const isSummerSale =
      line.merchandise.product.inCollections?.[0]?.isMember;

    if (!isSummerSale) return;

    let discountValue = 0;

    if (quantity >= 5) {
      discountValue = 20;
    } else if (quantity >= 3) {
      discountValue = 10;
    }

    if (discountValue > 0) {
      operations.push({
        productDiscountsAdd: {
          candidates: [
            {
              message: `${discountValue}% OFF SUMMER SALE`,
              targets: [
                {
                  cartLine: { id: line.id },
                },
              ],
              value: {
                percentage: { value: discountValue },
              },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      });
    }
  });

  return { operations };
}
