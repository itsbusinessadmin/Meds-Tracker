import React, { useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { useStore } from '@/store';
import { useSheets } from '@/sheets';
import { ThemePreference, radius, space, useTheme } from '@/theme';
import { Button, IconButton, Segmented, Stepper, Switch, Text } from '@/components/primitives';
import { ListGroup, ListRow, Screen, Section, SectionHeader } from '@/components/layout';

const LEGAL = {
  help: [
    'Help & Support',
    'Pillbox tracks the medicines you have been prescribed. Tap a dose on Today to record it, and Supply to see what needs reordering. Nothing you enter leaves this iPhone.',
  ],
  contact: [
    'Contact',
    'In the shipping app this opens Mail with a diagnostic report you can review before sending. Nothing is transmitted without your say-so.',
  ],
  privacy: [
    'Privacy Policy',
    'Pillbox stores your medicines, schedules and dose history on this device only. There is no account, no server and no analytics. Nothing is uploaded, sold or shared. Deleting the app deletes the data with it.',
  ],
  terms: [
    'Terms of Use',
    'Pillbox is provided as-is for personal medication tracking. You are responsible for the accuracy of what you enter. Reminders depend on iOS notification delivery and should not be your only safeguard for a critical medicine.',
  ],
  disclaimer: [
    'Medical Disclaimer',
    'Pillbox is a tracking tool, not a medical device. It does not give medical advice, recommend doses, or interpret your adherence as a measure of health. Never change how you take a medicine based on this app. Talk to your doctor or pharmacist about anything concerning a prescription.',
  ],
} as const;

export default function SettingsScreen() {
  const { c } = useTheme();
  const { meds, settings, updateSettings, deleteEverything, showToast } = useStore();
  const { confirm } = useSheets();
  const [info, setInfo] = useState<keyof typeof LEGAL | null>(null);
  const insets = useSafeAreaInsets();

  const version = Constants.expoConfig?.version ?? '2.0.0';

  return (
    <>
      <Screen
        title="Settings"
        actions={
          <IconButton name="close" label="Close settings" tone="default" onPress={() => router.back()} />
        }
      >
        <Section>
          <SectionHeader title="Notifications" />
          <ListGroup footer="Reminders and alerts are delivered by iOS. Pillbox never sends your data anywhere.">
            <ListRow
              title="Medication Reminders"
              subtitle="Notify at each scheduled dose time"
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.medicationReminders }}
              onPress={() => updateSettings({ medicationReminders: !settings.medicationReminders })}
              accessory={<Switch value={settings.medicationReminders} label="Medication Reminders" />}
            />
            <ListRow
              title="Low Supply Alerts"
              subtitle="Notify when a medicine reaches its warning level"
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.lowSupplyAlerts }}
              onPress={() => updateSettings({ lowSupplyAlerts: !settings.lowSupplyAlerts })}
              accessory={<Switch value={settings.lowSupplyAlerts} label="Low Supply Alerts" />}
            />
            <ListRow
              title="Default warning level"
              subtitle="Used when a medicine has no level of its own"
              accessory={
                <Stepper
                  label="default warning level"
                  value={settings.globalThreshold}
                  min={5}
                  max={60}
                  step={5}
                  onChange={(v) => updateSettings({ globalThreshold: v })}
                />
              }
            />
          </ListGroup>
        </Section>

        <Section>
          <SectionHeader title="Appearance" />
          <ListGroup footer="Text size and motion follow your system settings in Settings › Display & Brightness and Settings › Accessibility.">
            <View style={styles.stack}>
              <Text variant="body">Theme</Text>
              <Segmented<ThemePreference>
                label="Theme"
                value={settings.theme}
                onChange={(v) => updateSettings({ theme: v })}
                options={[
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
            </View>
          </ListGroup>
        </Section>

        <Section>
          <SectionHeader title="Data & Privacy" />
          <ListGroup>
            <ListRow
              title="Medication Data"
              value={`${meds.length}`}
              chevron
              icon="pill"
              onPress={() => router.replace('/supply')}
            />
            <ListRow
              title="Export Data"
              icon="share"
              chevron
              onPress={() =>
                showToast({
                  message: `Export prepared — ${meds.length} medicines`,
                })
              }
            />
          </ListGroup>

          {/* The most dangerous control in the app, in a group of its own. */}
          <ListGroup
            style={styles.destructiveGroup}
            footer="Deletes every medicine, schedule and history record on this iPhone. This cannot be undone."
          >
            <ListRow
              title="Delete All My Data"
              icon="trash"
              destructive
              onPress={() =>
                confirm({
                  title: 'Delete all data?',
                  body: 'This deletes every medicine, schedule and history record on this iPhone. This cannot be undone.',
                  confirmLabel: 'Delete Everything',
                  destructive: true,
                  onConfirm: () => {
                    deleteEverything();
                    router.replace('/');
                    showToast({ message: 'All data deleted' });
                  },
                })
              }
            />
          </ListGroup>
        </Section>

        <Section>
          <SectionHeader title="Help" />
          <ListGroup>
            <ListRow title="Help & Support" icon="help" chevron onPress={() => setInfo('help')} />
            <ListRow title="Contact" icon="mail" chevron onPress={() => setInfo('contact')} />
          </ListGroup>
        </Section>

        <Section>
          <SectionHeader title="Legal" />
          <ListGroup>
            <ListRow title="Privacy Policy" icon="shield" chevron onPress={() => setInfo('privacy')} />
            <ListRow title="Terms of Use" icon="doc" chevron onPress={() => setInfo('terms')} />
            <ListRow title="Medical Disclaimer" icon="info" chevron onPress={() => setInfo('disclaimer')} />
          </ListGroup>
        </Section>

        <Section>
          <SectionHeader title="About" />
          <ListGroup footer="Pillbox helps you track medicines you have been prescribed. It does not give medical advice.">
            <ListRow title="Pillbox" value="Medication tracker" />
            <ListRow title="Version" value={version} />
          </ListGroup>
        </Section>
      </Screen>

      <Modal
        visible={!!info}
        transparent
        animationType="slide"
        onRequestClose={() => setInfo(null)}
        accessibilityViewIsModal
      >
        <Pressable
          style={[styles.scrim, { backgroundColor: c.scrim }]}
          onPress={() => setInfo(null)}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={[styles.infoSheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + space.s5 }]}>
          <View style={[styles.grabber, { backgroundColor: c.separator }]} />
          <Text variant="headline" style={styles.infoTitle} accessibilityRole="header">
            {info ? LEGAL[info][0] : ''}
          </Text>
          <ScrollView style={styles.infoBody}>
            <Text variant="subhead" tone="secondary">{info ? LEGAL[info][1] : ''}</Text>
          </ScrollView>
          <Button title="Done" block onPress={() => setInfo(null)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  stack: { paddingHorizontal: space.s4, paddingVertical: space.s3, gap: space.s3 },
  destructiveGroup: { marginTop: space.s5 },
  scrim: { ...StyleSheet.absoluteFill },
  infoSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.s5,
  },
  grabber: { width: 36, height: 5, borderRadius: radius.full, alignSelf: 'center', marginVertical: space.s2 },
  infoTitle: { textAlign: 'center', marginBottom: space.s4 },
  infoBody: { flexGrow: 0, marginBottom: space.s4 },
});
