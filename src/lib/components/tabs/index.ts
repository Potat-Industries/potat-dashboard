import type { Component, ComponentType } from 'svelte';

export interface TabConfig {
  id: string;
  label: string;
  icon: ComponentType;
  component: Component;
  /** If true, tab is only shown when the logged in user is viewing their own page */
  ownerOnly?: boolean;
}