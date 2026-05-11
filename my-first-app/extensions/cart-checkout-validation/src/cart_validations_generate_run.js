// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

/**
 * @param {CartValidationsGenerateRunInput} input
 * @returns {CartValidationsGenerateRunResult}
 */
export function cartValidationsGenerateRun(input) {
  const operations = [];

  input.cart.lines.forEach((lineItem) => {
    const { quantity, merchandise } = lineItem;
    const max = parseInt(merchandise?.product?.max_orders?.value, 10);

    if (max && quantity > max) {
      operations.push({
        validationAdd: {
          message: `Can't order more than ${merchandise?.product?.max_orders?.value} of ${merchandise?.product?.handle}`,
          target: "cart", // or "cart.line" if you want it tied to the line
        },
      });
    }
  });

  return {
    operations,
  };
}
