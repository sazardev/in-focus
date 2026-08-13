/// <reference types="vite/client" />

declare module "*.yarn?raw" {
	const content: string;
	export default content;
}
