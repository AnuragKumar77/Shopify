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
  const errors = input.cart.lines
    .filter(({ quantity }) => quantity > 6)
    .map(({ merchandise }) => ({
      message: `You can only order a maximum of 6 units per product. Please reduce the quantity for "${merchandise.title}".`,
      target: "$.cart",
    }));

  const operations = [
    {
      validationAdd: {
        errors,
      },
    },
  ];

  return { operations };
}
