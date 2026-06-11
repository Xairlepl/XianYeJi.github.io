export const formatPrice = (price: number, fixed = 1): string => {
  return `¥${price.toFixed(fixed)}`;
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const formatSalesCount = (sales: number): string => {
  return sales > 1000 ? `${(sales / 1000).toFixed(1)}k` : String(sales);
};

export const formatOrderNo = (orderNo: string): string => {
  return `订单号：${orderNo}`;
};
