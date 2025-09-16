import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderData {
  retailerId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface Order {
  id: string;
  retailerId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  createdAt: string;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  byStatus: Record<string, { count: number; amount: number }>;
}

interface PrismaOrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PrismaOrder {
  id: string;
  retailerId: string;
  status: string;
  totalAmount: number;
  shippingAddress: any;
  createdAt: Date;
  notes?: string;
  items: PrismaOrderItem[];
}

interface OrderGroupStat {
  status: string;
  _count: { id: number };
  _sum: { totalAmount: number | null };
}

export class OrderService {
  // Create a new order
  static async createOrder(orderData: OrderData): Promise<Order> {
    try {
      // Validate retailer exists
      const retailer = await prisma.user.findUnique({
        where: { 
          id: orderData.retailerId,
          role: 'retailer'
        }
      });

      if (!retailer) {
        throw new Error('Retailer not found');
      }

      // Calculate total amount
      const totalAmount = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Create order in database
      const order = await prisma.order.create({
        data: {
          retailerId: orderData.retailerId,
          status: 'pending',
          totalAmount,
          currency: 'USD',
          deliveryAddress: orderData.shippingAddress,
          notes: orderData.notes,
          items: {
            create: orderData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            }))
          }
        },
        include: {
          items: true
        }
      });

      return {
        id: order.id,
        retailerId: order.retailerId,
        status: order.status as Order['status'],
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        shippingAddress: order.deliveryAddress as ShippingAddress,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Get orders for a retailer
  static async getRetailerOrders(retailerId: string, page = 1, limit = 20): Promise<Order[]> {
    try {
      const offset = (page - 1) * limit;

      const orders = await prisma.order.findMany({
        where: { retailerId },
        include: {
          items: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });

      return orders.map((order) => ({
        id: order.id,
        retailerId: order.retailerId,
        status: order.status as Order['status'],
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        shippingAddress: order.deliveryAddress as ShippingAddress,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));
    } catch (error) {
      console.error('Get retailer orders error:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      });

      if (!order) return null;

      return {
        id: order.id,
        retailerId: order.retailerId,
        status: order.status as Order['status'],
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        shippingAddress: order.deliveryAddress as ShippingAddress,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status,
          updatedAt: new Date()
        },
        include: {
          items: true
        }
      });

      return {
        id: order.id,
        retailerId: order.retailerId,
        status: order.status as Order['status'],
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        shippingAddress: order.deliveryAddress as ShippingAddress,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string): Promise<Order> {
    try {
      return await this.updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  // Get order statistics for a retailer
  static async getOrderStats(retailerId: string): Promise<OrderStats> {
    try {
      const stats = await prisma.order.groupBy({
        by: ['status'],
        where: { retailerId },
        _count: {
          id: true
        },
        _sum: {
          totalAmount: true
        }
      });

      const totalOrders = await prisma.order.count({
        where: { retailerId }
      });

      const totalSpent = await prisma.order.aggregate({
        where: { 
          retailerId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: {
          totalAmount: true
        }
      });

      const byStatus = stats.reduce((acc: Record<string, { count: number; amount: number }>, stat) => {
        acc[stat.status] = {
          count: stat._count.id,
          amount: Number(stat._sum.totalAmount || 0)
        };
        return acc;
      }, {});

      return {
        totalOrders,
        totalSpent: Number(totalSpent._sum.totalAmount || 0),
        byStatus
      };
    } catch (error) {
      console.error('Get order stats error:', error);
      throw error;
    }
  }
}

export default OrderService;
