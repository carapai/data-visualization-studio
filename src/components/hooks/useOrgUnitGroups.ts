import { INamed } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { getDHIS2Resources } from "../../utils";

export const useOrgUnitGroups = () => {
    return useQuery<INamed[], Error>({
        queryKey: ["org-unit-groups"],
        queryFn: async () => {
            return getDHIS2Resources<INamed>({
                resource: "organisationUnitGroups.json",
                resourceKey: "organisationUnitGroups",
                isCurrentDHIS2: true,
                params: {
                    fields: "id,name",
                },
            });
        },
    });
};
