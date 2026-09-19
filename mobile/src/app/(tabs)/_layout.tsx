import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '@/theme';

/**
 * Three destinations. "Add" is deliberately NOT a tab — a tab switches where
 * you are, it does not open a modal, and the previous build spent a quarter of
 * the tab bar on a button that did.
 *
 * NativeTabs renders a real platform tab bar, so selection, haptics, blur and
 * VoiceOver ordering come from the OS rather than from an approximation of it.
 * SF Symbols carry a filled variant when selected, so the active tab is marked
 * by shape as well as colour.
 */
export default function TabsLayout() {
  const { c } = useTheme();

  return (
    <NativeTabs backgroundColor={c.material} labelStyle={{ selected: { color: c.primaryText } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'checkmark.circle', selected: 'checkmark.circle.fill' }}
          md="check_circle"
          selectedColor={c.primaryText}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="supply">
        <NativeTabs.Trigger.Label>Supply</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'shippingbox', selected: 'shippingbox.fill' }}
          md="inventory_2"
          selectedColor={c.primaryText}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          md="calendar_month"
          selectedColor={c.primaryText}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
