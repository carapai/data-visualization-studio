import { CategoryOption } from "@/interfaces";
import { Box, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useDHIS2CategoryCombo } from "../../hooks/useDHIS2CategoryCombo";
import LoadingIndicator from "../LoadingIndicator";

export default function Categories({
    id,
    direction,
    attribution,
    onChange,
}: {
    id: string;
    direction: "row" | "column";
    attribution: Record<string, string[]> | undefined;
    onChange: (category: string, values: string[]) => void;
}) {
    const { isLoading, isSuccess, isError, error, data } =
        useDHIS2CategoryCombo(id);

    if (isError) return <pre>{JSON.stringify(error)}</pre>;
    if (isLoading) return <LoadingIndicator />;

    if (isSuccess && data)
        return (
            <Stack direction={direction} w="100%" spacing="20px">
                {data.categories?.map(({ id, categoryOptions, shortName }) => {
                    return (
                        <Stack key={id} direction="row" alignItems="center">
                            <Text fontWeight="bold">{shortName}</Text>
                            <Box minW="200px">
                                <Select<
                                    CategoryOption,
                                    true,
                                    GroupBase<CategoryOption>
                                >
                                    isMulti
                                    options={categoryOptions}
                                    getOptionLabel={(d) => d.name ?? ""}
                                    getOptionValue={(d) => d.id}
                                    value={categoryOptions.filter(
                                        (a) =>
                                            attribution?.[id]?.indexOf(a.id) !==
                                            -1
                                    )}
                                    onChange={(e) =>
                                        onChange(
                                            id,
                                            e.map((e) => e.id)
                                        )
                                    }
                                />
                            </Box>
                        </Stack>
                    );
                })}
            </Stack>
        );

    return null;
}
