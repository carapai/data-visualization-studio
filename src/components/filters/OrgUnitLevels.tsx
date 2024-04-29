import { Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useOrgUnitLevels } from "../../hooks/useOrgUnitLevels";
import LoadingIndicator from "../LoadingIndicator";
import { ILevel } from "@/interfaces";

export default function OrgUnitLevels({
    value,
    onChange,
}: {
    value: number | undefined;
    onChange: (value: number | undefined) => void;
}) {
    const { error, isError, isLoading, data, isSuccess } = useOrgUnitLevels();
    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <LoadingIndicator />;
    if (isSuccess)
        return (
            <Stack>
                <Text>OrganisationUnit Level</Text>
                <Select<ILevel, false, GroupBase<ILevel>>
                    value={data.organisationUnitLevels.find(
                        (pt) => pt.level === value
                    )}
                    onChange={(e) => onChange(e?.level)}
                    options={data.organisationUnitLevels}
                    isClearable
                    getOptionValue={(x) => String(x.level)}
                    getOptionLabel={(x) => x.name}
                />
            </Stack>
        );

    return null;
}
