import { useMutation, useQuery } from "@tanstack/react-query";
import type { GoldPrice, Product } from "../backend.d";
import { useActor } from "./useActor";

export function useActiveProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["activeProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveProducts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGoldPrices() {
  const { actor, isFetching } = useActor();
  return useQuery<GoldPrice[]>({
    queryKey: ["goldPrices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoldPrices();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubmitInquiry() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      productInterest,
      message,
    }: {
      name: string;
      phone: string;
      productInterest: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Backend not available");
      await actor.submitInquiry(name, phone, productInterest, message);
    },
  });
}
