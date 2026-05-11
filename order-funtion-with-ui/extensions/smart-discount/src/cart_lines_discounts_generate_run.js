// import {
//   DiscountClass,
//   OrderDiscountSelectionStrategy,
//   ProductDiscountSelectionStrategy,
// } from '../generated/api';


// /**
//   * @typedef {import("../generated/api").CartInput} RunInput
//   * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
//   */

// /**
//   * @param {RunInput} input
//   * @returns {CartLinesDiscountsGenerateRunResult}
//   */

// export function cartLinesDiscountsGenerateRun(input) {
//   if (!input.cart.lines.length) {
//     return {operations: []};
//   }

//   const hasOrderDiscountClass = input.discount.discountClasses.includes(
//     DiscountClass.Order,
//   );
//   const hasProductDiscountClass = input.discount.discountClasses.includes(
//     DiscountClass.Product,
//   );

//   if (!hasOrderDiscountClass && !hasProductDiscountClass) {
//     return {operations: []};
//   }

//   const maxCartLine = input.cart.lines.reduce((maxLine, line) => {
//     if (line.cost.subtotalAmount.amount > maxLine.cost.subtotalAmount.amount) {
//       return line;
//     }
//     return maxLine;
//   }, input.cart.lines[0]);

//   const operations = [];

//   if (hasOrderDiscountClass) {
//     operations.push({
//       orderDiscountsAdd: {
//         candidates: [
//           {
//             message: '10% OFF ORDER',
//             targets: [
//               {
//                 orderSubtotal: {
//                   excludedCartLineIds: [],
//                 },
//               },
//             ],
//             value: {
//               percentage: {
//                 value: 10,
//               },
//             },
//           },
//         ],
//         selectionStrategy: OrderDiscountSelectionStrategy.First,
//       },
//     });
//   }

//   if (hasProductDiscountClass) {
//     operations.push({
//       productDiscountsAdd: {
//         candidates: [
//           {
//             message: '20% OFF PRODUCT',
//             targets: [
//               {
//                 cartLine: {
//                   id: maxCartLine.id,
//                 },
//               },
//             ],
//             value: {
//               percentage: {
//                 value: 20,
//               },
//             },
//           },
//         ],
//         selectionStrategy: ProductDiscountSelectionStrategy.First,
//       },
//     });
//   }

//   return {
//     operations,
//   };
// }


// @ts-check
import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
} from '../generated/api';

/**
 * @typedef {import("../generated/api").CartInput} RunInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * Tiered order discount based on UNIQUE products in cart:
 *
 *   < 2 unique products  → NO discount (minimum threshold not met)
 *   2 unique products    → 10% off  (2 × 5%)
 *   3 unique products    → 15% off  (3 × 5%)
 *   4+ unique products   → 20% off  (capped at max)
 *
 * Rule: 5% per unique product, minimum 2 unique products, maximum 20%.
 *
 * @param {RunInput} input
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  // ── Guard: empty cart ───────────────────────────────────────────
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  // ── Guard: discount class check ─────────────────────────────────
  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );

  if (!hasOrderDiscountClass) {
    return { operations: [] };
  }

  // ── Count unique products ───────────────────────────────────────
  // Use a Set on product.id — same product in qty 3 still counts as 1 unique.
  const uniqueProductIds = new Set();

  for (const line of input.cart.lines) {
    // __typename guard tells TypeScript this is a ProductVariant (not a custom product)
    if (line.merchandise.__typename !== 'ProductVariant') continue;
    const productId = line.merchandise.product?.id;
    if (productId) {
      uniqueProductIds.add(productId);
    }
  }

  const uniqueCount = uniqueProductIds.size;

  // ── Minimum threshold check ─────────────────────────────────────
  // At least 2 unique products required for any discount to apply.
  if (uniqueCount < 2) {
    return { operations: [] };
  }

  // ── Calculate discount ──────────────────────────────────────────
  // 5% per unique product, capped at 20%
  const RATE_PER_UNIQUE = 5;
  const MAX_DISCOUNT    = 20;

  const discountPercentage = Math.min(uniqueCount * RATE_PER_UNIQUE, MAX_DISCOUNT);

  // ── Build operation ─────────────────────────────────────────────
  return {
    operations: [
      {
        orderDiscountsAdd: {
          // FIRST: apply the single best candidate (there is only one here)
          selectionStrategy: OrderDiscountSelectionStrategy.First,
          candidates: [
            {
              message: `${discountPercentage}% off — ${uniqueCount} unique product${uniqueCount > 1 ? 's' : ''} in cart`,
              targets: [
                {
                  orderSubtotal: {
                    // Empty array = discount applies to ALL cart lines.
                    // Add variant GIDs here if you ever need to exclude specific lines.
                    excludedCartLineIds: [],
                  },
                },
              ],
              value: {
                percentage: {
                  // Percentage.value is Decimal! scalar — must be a string per schema
                  value: discountPercentage.toString(),
                },
              },
            },
          ],
        },
      },
    ],
  };
}
