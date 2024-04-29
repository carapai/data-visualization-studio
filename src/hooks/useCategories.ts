import { useQuery } from "@tanstack/react-query";
import { ICategory, IDashboard } from "../interfaces";
import { getDHIS2NamespaceData } from "../utils";

export const useCategoryList = () => {
    return useQuery<
        { dashboards: IDashboard[]; categories: ICategory[] },
        Error
    >({
        queryKey: ["i-dashboards-categories"],
        queryFn: async ({ signal }) => {
            const dashboards = await getDHIS2NamespaceData<IDashboard>(
                "i-dashboards",
                signal
            );
            const categories = await getDHIS2NamespaceData<ICategory>(
                "i-categories",
                signal
            );

            return { dashboards, categories };
        },
    });
};
