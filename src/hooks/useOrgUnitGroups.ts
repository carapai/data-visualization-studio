import axiosInstance from "@/axios-instance";
import { orgUnitGroupsOptions } from "@/query-options";
import { useQuery } from "@tanstack/react-query";

export const useOrgUnitGroups = () => {
    return useQuery(orgUnitGroupsOptions(axiosInstance));
};
