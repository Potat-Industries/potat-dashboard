import type { Setting } from "$lib/components/settings";
import langauges from "$lib/langauges";

export const userSettingDefaults: Setting[] = [
  {
    id: 'language',
    value: 'English',
    type: 'choice',
    description: 'The language the bot will use to communicate with you in chat.',
    possibleValues: langauges,
  },
  {
    id: 'no_reply',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot won\'t mention you or reply in responses.',
  },
  {
    id: 'color_responses',
    value: true,
    type: 'boolean',
    description: 'If enabled, the bot will respond using /me responses.',
  },
  {
    id: 'ignore_dropped',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will not try a fallback whisper to you when a messsage fails to send.',
  },
];