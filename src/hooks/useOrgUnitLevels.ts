import axiosInstance from "@/axios-instance";
import { orgUnitLevelsOptions } from "@/query-options";
import { useQuery } from "@tanstack/react-query";

export const useOrgUnitLevels = () => {
    return useQuery(orgUnitLevelsOptions(axiosInstance));
};
