import type { Component, ComponentType } from "svelte";

export interface TabConfig {
  id: string;
  label: string;
  icon: ComponentType;
  component: Component;
}