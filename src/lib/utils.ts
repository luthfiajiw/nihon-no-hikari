import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WithElementRef, WithoutChildren } from "bits-ui";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithoutChild<T> = Omit<T, "child">;
export type WithoutChildrenOrChild<T> = Omit<T, "children" | "child">;

export type { WithElementRef, WithoutChildren };

