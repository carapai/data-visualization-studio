import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    RouterProvider,
    createRouter,
    parseSearchWith,
    stringifySearchWith,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { stringify, parse } from "zipson";
import "@/index.css";
import { routeTree } from "@/routeTree.gen";
import { ChakraProvider } from "@chakra-ui/react";
import LoadingIndicator from "./components/LoadingIndicator";

const queryClient = new QueryClient();

function decodeFromBinary(str: string): string {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(str), function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );
}

function encodeToBinary(str: string): string {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );
}

const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    parseSearch: parseSearchWith((value) =>
        parse(decodeURIComponent(decodeFromBinary(value)))
    ),
    stringifySearch: stringifySearchWith((value) =>
        encodeToBinary(encodeURIComponent(stringify(value)))
    ),
    defaultPendingComponent: () => <LoadingIndicator />,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <ChakraProvider>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ChakraProvider>
    );
}
