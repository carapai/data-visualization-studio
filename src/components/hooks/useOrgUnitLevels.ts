import { ILevel } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { getDHIS2Resources } from "../../utils";

export const useOrgUnitLevels = () => {
    return useQuery<ILevel[], Error>({
        queryKey: ["org-unit-levels"],
        queryFn: async () => {
            return getDHIS2Resources<ILevel>({
                resource: "organisationUnitLevels.json",
                resourceKey: "organisationUnitLevels",
                isCurrentDHIS2: true,
                params: {
                    fields: "id,name,level",
                },
            });
        },
    });
};
