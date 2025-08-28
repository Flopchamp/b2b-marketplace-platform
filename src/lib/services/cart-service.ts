export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName?: string;
  productImage?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export class CartService {
  private static CART_STORAGE_KEY = 'b2b_cart';

  // Get cart from localStorage
  static getCart(): Cart {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (!cartData) {
        return { items: [], totalItems: 0, totalAmount: 0 };
      }
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error getting cart:', error);
      return { items: [], totalItems: 0, totalAmount: 0 };
    }
  }

  // Save cart to localStorage
  private static saveCart(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Calculate cart totals
  private static calculateTotals(items: CartItem[]): { totalItems: number; totalAmount: number } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return { totalItems, totalAmount };
  }

  // Add item to cart
  static addToCart(item: CartItem): Cart {
    const cart = this.getCart();
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(cartItem => cartItem.productId === item.productId);
    
    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
    } else {
      // Add new item
      cart.items.push(item);
    }

    // Recalculate totals
    const totals = this.calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalAmount = totals.totalAmount;

    this.saveCart(cart);
    return cart;
  }

  // Update item quantity in cart
  static updateCartItem(productId: string, quantity: number): Cart {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity and total price
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].totalPrice = quantity * cart.items[itemIndex].unitPrice;
      }

      // Recalculate totals
      const totals = this.calculateTotals(cart.items);
      cart.totalItems = totals.totalItems;
      cart.totalAmount = totals.totalAmount;

      this.saveCart(cart);
    }

    return cart;
  }

  // Remove item from cart
  static removeFromCart(productId: string): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.productId !== productId);

    // Recalculate totals
    const totals = this.calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalAmount = totals.totalAmount;

    this.saveCart(cart);
    return cart;
  }

  // Clear entire cart
  static clearCart(): Cart {
    const emptyCart: Cart = { items: [], totalItems: 0, totalAmount: 0 };
    this.saveCart(emptyCart);
    return emptyCart;
  }

  // Get cart item count
  static getCartItemCount(): number {
    const cart = this.getCart();
    return cart.totalItems;
  }

  // Get cart total amount
  static getCartTotal(): number {
    const cart = this.getCart();
    return cart.totalAmount;
  }
}

export default CartService;
