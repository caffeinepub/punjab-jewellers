import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GoldPrice {
    lastUpdated: Time;
    pricePerGram: bigint;
    purity: string;
}
export interface Inquiry {
    name: string;
    message: string;
    timestamp: Time;
    productInterest: string;
    phone: string;
}
export type Time = bigint;
export interface Product {
    id: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    isActive: boolean;
    category: string;
    price: bigint;
}
export interface backendInterface {
    addProduct(name: string, category: string, price: bigint, description: string, tags: Array<string>): Promise<void>;
    getActiveProducts(): Promise<Array<Product>>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getGoldPrices(): Promise<Array<GoldPrice>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    submitInquiry(name: string, phone: string, productInterest: string, message: string): Promise<void>;
    updateGoldPrice(purity: string, pricePerGram: bigint): Promise<void>;
}
