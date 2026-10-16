export type OrderStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled';

export interface OrderItem {
  id?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'CREDIT_CARD' | 'PIX' | 'DEBIT_CARD' | 'BOLETO';
  createdAt: string;
  updatedAt: string;
  riskEvaluationId?: string;
  riskScore?: number;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  paymentMethod: 'CREDIT_CARD' | 'PIX' | 'DEBIT_CARD' | 'BOLETO';
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}
