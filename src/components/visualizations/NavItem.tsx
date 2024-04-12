import { Box, Flex, Text } from "@chakra-ui/react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ICategory, IDashboard } from "../../interfaces";

interface NavItemProps {
    option: ICategory & { dashboards: IDashboard[] };
}

const routeApi = getRouteApi("/$templateId/$dashboardId");

const NavItem = ({ option: { name, id, dashboards } }: NavItemProps) => {
    const navigate = useNavigate({ from: "/$templateId/$dashboardId" });
    const search = routeApi.useSearch();
    return (
        <Box key={id}>
            <Text
                color="gray.600"
                m="1"
                mt="2"
                fontSize="lg"
                fontWeight="bold"
                textTransform="uppercase"
            >
                {name}
            </Text>

            {dashboards.map((d) => (
                <Flex
                    alignItems="center"
                    key={d.id}
                    gap="5"
                    pt="1"
                    pl="2"
                    borderRadius="lg"
                    fontSize="lg"
                    m="2"
                    cursor="pointer"
                    _hover={{
                        bgColor: "teal",
                        color: "white",
                        transform: "scale(1.1)",
                    }}
                    _active={{ bgColor: "teal", color: "white" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate({
                            to: "/$templateId/$dashboardId",
                            params: (prev) => ({ ...prev, dashboardId: d.id }),
                            search,
                        });
                    }}
                >
                    {d.name}
                </Flex>
            ))}
        </Box>
    );
};

export default NavItem;
