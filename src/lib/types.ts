export type User = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string | { secureUrl?: string };
  onboardingCompleted?: boolean;
};
export type Product = {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  stock?: number;
  status?: string;
  image?: string;
  images?: string[];
  category?: string;
  categoryId?: string;
  supplierId?: string;
  brand?: string;
  material?: string;
  color?: string;
  description?: string;
  styleTags?: string[];
  rating?: number;
  reviews?: number;
};
export type Category = {
  id: string;
  name: string;
  isActive: boolean;
  children?: Category[];
};
export type Board = {
  _id?: string;
  id?: string;
  roomId?: string;
  title?: string;
  description?: string;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  roomType: string;
  tags?: string[];
  likes?: number;
  views?: number;
  productPoints?: {
    _id?: string;
    x: number;
    y: number;
    productId: string | Product;
    product?: Product;
  }[];
};
export type Post = {
  _id: string;
  userId: User;
  description: string;
  roomType: string;
  hashtags: string[];
  media: { url: string; type: string; thumbnailUrl?: string }[];
  likeCount: number;
  commentCount: number;
  saved: boolean;
  myReaction?: string;
  createdAt: string;
};
export type Comment = {
  _id: string;
  userId: User;
  content: string;
  createdAt: string;
  parentId?: string;
  replyCount?: number;
};
export type Feed<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};
export type Order = {
  _id: string;
  orderCode: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee?: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    image?: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  statusHistory?: {
    status: string;
    at?: string;
    timestamp?: string;
    note?: string;
  }[];
};
export type Review = {
  _id: string;
  userId?: User;
  rating: number;
  content: string;
  createdAt: string;
};
export type Ticket = {
  _id: string;
  ticketCode: string;
  title: string;
  status: string;
  messages: { content: string; createdAt: string }[];
};
export type Showroom = {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  environmentModelUrl?: string;
  items: {
    _id: string;
    productId: string | Product;
    modelUrl: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }[];
};
export const idOf = (item: Board) => item._id ?? item.id ?? item.roomId ?? "";
export const priceOf = (p: Product) =>
  Math.round(p.price * (1 - Math.min(100, Math.max(0, p.discount ?? 0)) / 100));
export const money = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;
export const avatarOf = (user?: User) =>
  typeof user?.avatar === "string" ? user.avatar : user?.avatar?.secureUrl;
export const rooms: Record<string, string> = {
  living_room: "Phòng khách",
  bedroom: "Phòng ngủ",
  kitchen: "Nhà bếp",
  bathroom: "Phòng tắm",
  office: "Góc làm việc",
  dining_room: "Phòng ăn",
  other: "Khác",
};
export const statuses: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang chuẩn bị",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  SUCCESS: "Đã thanh toán",
  FAILED: "Thất bại",
  OPEN: "Đang mở",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
};
