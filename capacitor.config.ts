import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenith.utility',
  appName: 'Zenith Utility',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
