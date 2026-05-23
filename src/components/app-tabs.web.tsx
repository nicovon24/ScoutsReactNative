import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList style={{ display: 'none', height: 0, width: 0, overflow: 'hidden' }}>
        <TabTrigger name="home" href="/">
          <View />
        </TabTrigger>
        <TabTrigger name="explore" href="/explore">
          <View />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
