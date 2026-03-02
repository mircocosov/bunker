import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// проксируем API и swagger если нужно
			"/bunker/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
			"/bunker/swagger": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
})
