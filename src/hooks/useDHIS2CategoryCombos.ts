import axiosInstance from "@/axios-instance";
import { categoryCombosOptions } from "@/query-options";
import { useQuery } from "@tanstack/react-query";

export const useDHIS2CategoryCombos = () => {
    return useQuery(categoryCombosOptions(axiosInstance));
};
