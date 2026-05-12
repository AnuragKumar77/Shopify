import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";

export default async () => {
  render(<App />, document.body);
};

function App() {
  const {
    applyExtensionMetafieldChange,
    i18n,
    config,
    initialConfig,
    onConfigChange,
    resetForm,
    loading,
    error,
    excludedProducts,
    excludedCollections,
    appliesTo,
    onAppliesToChange,
    onPickExcludedProducts,
    removeExcludedProduct,
    onPickExcludedCollections,
    removeExcludedCollection,
  } = useExtensionData();

  if (loading) {
    return <s-text>{i18n.translate("loading")}</s-text>;
  }

  return (
    <s-function-settings
      onSubmit={(event) => {
        event.waitUntil?.(applyExtensionMetafieldChange());
      }}
      onReset={resetForm}
    >
      {error ? (
        <s-section>
          <s-banner tone="critical">{error}</s-banner>
        </s-section>
      ) : null}

      {/* ── Discount value ───────────────────────────────────────── */}
      <s-section>
        <s-stack gap="base">
          <s-heading>{i18n.translate("discountValue.heading")}</s-heading>

          <s-number-field
            label={i18n.translate("discountValue.rateLabel")}
            name="ratePerUnique"
            value={String(config.ratePerUnique)}
            defaultValue={String(initialConfig.ratePerUnique)}
            min={1}
            max={25}
            step={1}
            suffix="%"
            onChange={(event) =>
              onConfigChange("ratePerUnique", Number(event.currentTarget.value))
            }
          />

          <s-number-field
            label={i18n.translate("discountValue.minUniqueLabel")}
            name="minUnique"
            value={String(config.minUnique)}
            defaultValue={String(initialConfig.minUnique)}
            min={1}
            max={10}
            step={1}
            onChange={(event) =>
              onConfigChange("minUnique", Number(event.currentTarget.value))
            }
          />

          <s-number-field
            label={i18n.translate("discountValue.maxDiscountLabel")}
            name="maxDiscount"
            value={String(config.maxDiscount)}
            defaultValue={String(initialConfig.maxDiscount)}
            min={1}
            max={100}
            step={1}
            suffix="%"
            onChange={(event) =>
              onConfigChange("maxDiscount", Number(event.currentTarget.value))
            }
          />
        </s-stack>
      </s-section>

      {/* ── Applies to ───────────────────────────────────────────── */}
      <s-section>
        <s-stack gap="base">
          <s-heading>{i18n.translate("appliesTo.heading")}</s-heading>

          {/* Hidden fields — carry IDs through form submit */}
          <s-box display="none">
            <s-text-field
              label=""
              name="excludedProductIds"
              value={excludedProducts.map((p) => p.id).join(",")}
              defaultValue={initialConfig.excludedProductIds.join(",")}
            />
            <s-text-field
              label=""
              name="excludedCollectionIds"
              value={excludedCollections.map((c) => c.id).join(",")}
              defaultValue={initialConfig.excludedCollectionIds.join(",")}
            />
          </s-box>

          <s-select
            label={i18n.translate("appliesTo.label")}
            name="appliesTo"
            value={appliesTo}
            onChange={(event) => onAppliesToChange(event.currentTarget.value)}
          >
            <s-option value="all">
              {i18n.translate("appliesTo.allProducts")}
            </s-option>
            <s-option value="products">
              {i18n.translate("appliesTo.excludeProducts")}
            </s-option>
            <s-option value="collections">
              {i18n.translate("appliesTo.excludeCollections")}
            </s-option>
          </s-select>

          {/* Excluded Products list */}
          {appliesTo === "products" ? (
            <s-stack gap="base">
              <s-button onClick={onPickExcludedProducts}>
                {i18n.translate("appliesTo.browseProducts")}
              </s-button>
              {excludedProducts.length === 0 ? (
                <s-text tone="subdued">
                  {i18n.translate("appliesTo.noProductsSelected")}
                </s-text>
              ) : (
                excludedProducts.map((product) => (
                  <s-stack
                    key={product.id}
                    direction="inline"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <s-link
                      href={`shopify://admin/products/${product.id.split("/").pop()}`}
                      target="_blank"
                    >
                      {product.title}
                    </s-link>
                    <s-button
                      variant="tertiary"
                      onClick={() => removeExcludedProduct(product.id)}
                    >
                      <s-icon type="x-circle" />
                    </s-button>
                  </s-stack>
                ))
              )}
            </s-stack>
          ) : null}

          {/* Excluded Collections list */}
          {appliesTo === "collections" ? (
            <s-stack gap="base">
              <s-button onClick={onPickExcludedCollections}>
                {i18n.translate("appliesTo.browseCollections")}
              </s-button>
              {excludedCollections.length === 0 ? (
                <s-text tone="subdued">
                  {i18n.translate("appliesTo.noCollectionsSelected")}
                </s-text>
              ) : (
                excludedCollections.map((col) => (
                  <s-stack
                    key={col.id}
                    direction="inline"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <s-link
                      href={`shopify://admin/collections/${col.id.split("/").pop()}`}
                      target="_blank"
                    >
                      {col.title}
                    </s-link>
                    <s-button
                      variant="tertiary"
                      onClick={() => removeExcludedCollection(col.id)}
                    >
                      <s-icon type="x-circle" />
                    </s-button>
                  </s-stack>
                ))
              )}
            </s-stack>
          ) : null}
        </s-stack>
      </s-section>
    </s-function-settings>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
function useExtensionData() {
  const { applyMetafieldChange, i18n, data, resourcePicker, query } = shopify;

  const initialConfig = useMemo(
    () =>
      parseMetafield(
        data?.metafields?.find((mf) => mf.key === "function-configuration")
          ?.value,
      ),
    [data?.metafields],
  );

  const [config, setConfig]                   = useState(initialConfig);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [excludedProducts, setExcludedProducts]         = useState([]);
  const [initialExcludedProducts, setInitialExcludedProducts] = useState([]);
  const [excludedCollections, setExcludedCollections]   = useState([]);
  const [initialExcludedCollections, setInitialExcludedCollections] = useState([]);
  const [appliesTo, setAppliesTo]             = useState("all");

  // Hydrate titles from saved GIDs on mount
  useEffect(() => {
    const hydrate = async () => {
      setLoading(true);
      try {
        const [products, collections] = await Promise.all([
          initialConfig.excludedProductIds.length
            ? fetchNodes(initialConfig.excludedProductIds, "Product", query)
            : [],
          initialConfig.excludedCollectionIds.length
            ? fetchNodes(initialConfig.excludedCollectionIds, "Collection", query)
            : [],
        ]);
        setExcludedProducts(products);
        setInitialExcludedProducts(products);
        setExcludedCollections(collections);
        setInitialExcludedCollections(collections);
        if (collections.length > 0) setAppliesTo("collections");
        else if (products.length > 0) setAppliesTo("products");
        else setAppliesTo("all");
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig.ratePerUnique, initialConfig.minUnique, initialConfig.maxDiscount]);

  const onConfigChange = (key, value) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const onAppliesToChange = (value) => {
    setAppliesTo(value);
    if (value === "all")         { setExcludedProducts([]); setExcludedCollections([]); }
    else if (value === "products")    { setExcludedCollections([]); }
    else if (value === "collections") { setExcludedProducts([]); }
  };

  const onPickExcludedProducts = async () => {
    const sel = await resourcePicker({
      type: "product",
      selectionIds: excludedProducts.map(({ id }) => ({ id })),
      action: "select",
      multiple: true,
      filter: { archived: false, variants: false },
    });
    if (sel) setExcludedProducts(sel.map(({ id, title }) => ({ id, title })));
  };

  const removeExcludedProduct = (id) =>
    setExcludedProducts((prev) => prev.filter((p) => p.id !== id));

  const onPickExcludedCollections = async () => {
    const sel = await resourcePicker({
      type: "collection",
      selectionIds: excludedCollections.map(({ id }) => ({ id })),
      action: "select",
      multiple: true,
    });
    if (sel) setExcludedCollections(sel.map(({ id, title }) => ({ id, title })));
  };

  const removeExcludedCollection = (id) =>
    setExcludedCollections((prev) => prev.filter((c) => c.id !== id));

  const applyExtensionMetafieldChange = async () => {
    setError(null);
    const result = await applyMetafieldChange({
      type: "updateMetafield",
      namespace: "$app",
      key: "function-configuration",
      valueType: "json",
      value: JSON.stringify({
        ratePerUnique:         config.ratePerUnique,
        minUnique:             config.minUnique,
        maxDiscount:           config.maxDiscount,
        excludedProductIds:    excludedProducts.map(({ id }) => id),
        excludedCollectionIds: excludedCollections.map(({ id }) => id),
      }),
    });
    if (result.type === "error") {
      setError(result.message || i18n.translate("error"));
      return;
    }
    setInitialExcludedProducts(excludedProducts);
    setInitialExcludedCollections(excludedCollections);
  };

  const resetForm = () => {
    setConfig(initialConfig);
    setExcludedProducts(initialExcludedProducts);
    setExcludedCollections(initialExcludedCollections);
    setError(null);
    if (initialExcludedCollections.length > 0) setAppliesTo("collections");
    else if (initialExcludedProducts.length > 0) setAppliesTo("products");
    else setAppliesTo("all");
  };

  return {
    applyExtensionMetafieldChange, i18n, config, initialConfig, onConfigChange,
    resetForm, loading, error, excludedProducts, excludedCollections, appliesTo,
    onAppliesToChange, onPickExcludedProducts, removeExcludedProduct,
    onPickExcludedCollections, removeExcludedCollection,
  };
}

// ─── Metafield parser ─────────────────────────────────────────────────────────
function parseMetafield(value) {
  try {
    const p = JSON.parse(value || "{}");
    return {
      ratePerUnique:         Number(p.ratePerUnique         ?? 5),
      minUnique:             Number(p.minUnique             ?? 2),
      maxDiscount:           Number(p.maxDiscount           ?? 20),
      excludedProductIds:    Array.isArray(p.excludedProductIds)    ? p.excludedProductIds    : [],
      excludedCollectionIds: Array.isArray(p.excludedCollectionIds) ? p.excludedCollectionIds : [],
    };
  } catch {
    return { ratePerUnique: 5, minUnique: 2, maxDiscount: 20, excludedProductIds: [], excludedCollectionIds: [] };
  }
}

// ─── Fetch node titles from Admin API ────────────────────────────────────────
async function fetchNodes(gids, typename, adminApiQuery) {
  if (!gids?.length) return [];
  const result = await adminApiQuery(
    `#graphql
      query GetNodes($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ${typename} { id title }
        }
      }`,
    { variables: { ids: gids } },
  );
  return (result?.data?.nodes ?? []).filter(Boolean);
}
