import axiosInstance from "@/axios-instance";
import { userOrgUnitsOptions } from "@/query-options";
import { useQuery } from "@tanstack/react-query";

export const useUserOrganisations = () => {
    return useQuery(userOrgUnitsOptions(axiosInstance));
};
