import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.monuvista.app',
  appName: 'MonuVista',
  webDir: 'dist',
  server: {
    // During development, point to your local backend IP
    // Replace with your machine's local IP when testing on a real device
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
