// @ts-check
import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
} from "../generated/api";

/**
 * @typedef {import("../generated/api").CartInput} RunInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * @param {RunInput} input
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  // ── 1. Guard: only run if this discount has ORDER class ──────────
  const hasOrderClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );
  if (!hasOrderClass) {
    return { operations: [] };
  }

  // ── 2. Empty cart ────────────────────────────────────────────────
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  // ── 3. Read config from metafield ────────────────────────────────
  const cfg = input.discount.metafield?.jsonValue ?? {};

  const RATE = Number(cfg.ratePerUnique ?? 5);
  const MIN  = Number(cfg.minUnique     ?? 2);
  const CAP  = Number(cfg.maxDiscount   ?? 20);

  const EXCLUDED_PRODUCTS = new Set(
    Array.isArray(cfg.excludedProductIds) ? cfg.excludedProductIds : [],
  );

  // ── 4. Walk cart lines ───────────────────────────────────────────
  const uniqueProductIds = new Set();
  const excludedLineIds  = [];

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;

    const productId = line.merchandise.product?.id;
    if (!productId) continue;

    if (EXCLUDED_PRODUCTS.has(productId)) {
      excludedLineIds.push(line.id);
    } else {
      uniqueProductIds.add(productId);
    }
  }

  const uniqueCount = uniqueProductIds.size;

  // ── 5. Not enough unique products ───────────────────────────────
  if (uniqueCount < MIN) {
    return { operations: [] };
  }

  // ── 6. Calculate discount ────────────────────────────────────────
  // value must be a NUMBER — not a string
  const pct = Math.min(uniqueCount * RATE, CAP);

  return {
    operations: [
      {
        orderDiscountsAdd: {
          selectionStrategy: OrderDiscountSelectionStrategy.First,
          candidates: [
            {
              message: `${pct}% off (${uniqueCount} unique products)`,
              targets: [
                {
                  orderSubtotal: {
                    excludedCartLineIds: excludedLineIds,
                  },
                },
              ],
              value: {
                percentage: {
                  value: pct,   // ✅ number, NOT pct.toString()
                },
              },
            },
          ],
        },
      },
    ],
  };
}
