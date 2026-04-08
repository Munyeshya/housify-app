export function formatMoney(amount, currency = "USD") {
  const numericAmount = Number(amount || 0)

  try {
    return new Intl.NumberFormat("en-US", {
      currency,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(numericAmount)
  } catch {
    return `${currency} ${numericAmount.toLocaleString()}`
  }
}

export function formatLocation(property) {
  return [property?.neighborhood, property?.city, property?.country]
    .filter(Boolean)
    .join(", ")
}

export function getPropertyCover(property) {
  return (
    property?.cover_image?.image_url ||
    property?.images?.find((image) => image.is_cover)?.image_url ||
    property?.images?.[0]?.image_url ||
    ""
  )
}
