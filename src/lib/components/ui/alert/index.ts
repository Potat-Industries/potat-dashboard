import { type VariantProps, tv } from "tailwind-variants";

import Root from "./alert.svelte";
import Description from "./alert-description.svelte";
import Title from "./alert-title.svelte";

export const alertVariants = tv({
	base: "[&>svg]:text-foreground relative w-full border p-4 [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 text-center [&>svg]:top-4",

	variants: {
		variant: {
			default: "bg-background text-foreground",
			destructive:
				"border-destructive/50 text-destructive text-destructive dark:border-destructive [&>svg]:text-destructive",
			warning: 
				"bg-yellow-100 bg-opacity-50 border-yellow-400 text-yellow-900 shadow-md dark:bg-yellow-900 dark:bg-opacity-50 dark:text-yellow-100 dark:border-yellow-600 [&>svg]:text-yellow-700 dark:[&>svg]:text-yellow-300 backdrop-blur-sm",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type Variant = VariantProps<typeof alertVariants>["variant"];
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export {
	Root,
	Description,
	Title,
	//
	Root as Alert,
	Description as AlertDescription,
	Title as AlertTitle,
};
