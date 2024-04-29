import axiosInstance from "@/axios-instance";
import { categoryComboOptions } from "@/query-options";
import { useQuery } from "@tanstack/react-query";

export const useDHIS2CategoryCombo = (id: string) => {
    return useQuery(categoryComboOptions(axiosInstance, id));
};
