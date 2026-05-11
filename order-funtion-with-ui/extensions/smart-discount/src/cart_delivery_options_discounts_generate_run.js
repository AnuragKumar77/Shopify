// import {
//   DeliveryDiscountSelectionStrategy,
//   DiscountClass,
// } from "../generated/api";

// /**
//   * @typedef {import("../generated/api").DeliveryInput} RunInput
//   * @typedef {import("../generated/api").CartDeliveryOptionsDiscountsGenerateRunResult} CartDeliveryOptionsDiscountsGenerateRunResult
//   */

// /**
//   * @param {RunInput} input
//   * @returns {CartDeliveryOptionsDiscountsGenerateRunResult}
//   */

// export function cartDeliveryOptionsDiscountsGenerateRun(input) {
//   const firstDeliveryGroup = input.cart.deliveryGroups[0];
//   if (!firstDeliveryGroup) {
//     return {operations: []};
//   }

//   const hasShippingDiscountClass = input.discount.discountClasses.includes(
//     DiscountClass.Shipping,
//   );

//   if (!hasShippingDiscountClass) {
//     return {operations: []};
//   }

//   return {
//     operations: [
//       {
//         deliveryDiscountsAdd: {
//           candidates: [
//             {
//               message: "FREE DELIVERY",
//               targets: [
//                 {
//                   deliveryGroup: {
//                     id: firstDeliveryGroup.id,
//                   },
//                 },
//               ],
//               value: {
//                 percentage: {
//                   value: 100,
//                 },
//               },
//             },
//           ],
//           selectionStrategy: DeliveryDiscountSelectionStrategy.All,
//         },
//       },
//     ],
//   };
// }

// @ts-check
import {
  DiscountClass,
} from "../generated/api";

/**
 * @typedef {import("../generated/api").DeliveryInput} RunInput
 * @typedef {import("../generated/api").CartDeliveryOptionsDiscountsGenerateRunResult} CartDeliveryOptionsDiscountsGenerateRunResult
 */

/**
 * Delivery discount target.
 *
 * This file handles the `cart.delivery.options.discounts.generate.run` target.
 * It is separate from the cart lines target above — Shopify calls each target
 * independently at checkout.
 *
 * Current behaviour: no shipping discount is applied.
 * The Shipping Discount Function API is deprecated (since 2025-04).
 * If you want to add free shipping in the future, add your logic here
 * using deliveryDiscountsAdd (part of the unified Discount Function API).
 *
 * @param {RunInput} input
 * @returns {CartDeliveryOptionsDiscountsGenerateRunResult}
 */
export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  // ── Guard: no delivery groups ───────────────────────────────────
  const firstDeliveryGroup = input.cart.deliveryGroups[0];
  if (!firstDeliveryGroup) {
    return { operations: [] };
  }

  // ── Guard: discount class check ─────────────────────────────────
  const hasShippingDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Shipping,
  );

  if (!hasShippingDiscountClass) {
    return { operations: [] };
  }

  // ── No shipping discount active for this feature ────────────────
  // Return empty operations. When you are ready to add shipping discounts,
  // replace this return with a deliveryDiscountsAdd operation block:
  //
  // return {
  //   operations: [
  //     {
  //       deliveryDiscountsAdd: {
  //         selectionStrategy: DeliveryDiscountSelectionStrategy.All,
  //         candidates: [
  //           {
  //             message: "Free shipping",
  //             targets: [{ deliveryGroup: { id: firstDeliveryGroup.id } }],
  //             value: { percentage: { value: 100 } },
  //           },
  //         ],
  //       },
  //     },
  //   ],
  // };

  return { operations: [] };
}
