import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const pathResolve = (dir) => resolve(__dirname, dir);

export default defineConfig({
    plugins: [tailwindcss()],
    base: "/",
    build: {
        rollupOptions: {
            input: {
                main: pathResolve("index.html"),
                destination: pathResolve("destination.html"),
                crew: pathResolve("crew.html"),
                technology: pathResolve("technology.html"),
            },
            output: {},
        },
        emptyOutDir: true,
    },
});
