import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './RootNavigator';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['dev.timothyw.patapp://', 'https://pat.timothyw.dev'],
  config: {
    screens: {
      AuthStack: {
        screens: {
          SignIn: 'sign-in',
          CreateAccount: 'create-account',
          Verify: 'verify',
        }
      },
      AppNavigator: {
        path: '',
        screens: {
          agenda: 'agenda',
          inbox: 'inbox',
          lists: 'lists',
          people: 'people',
          habits: 'habits',
          settings: 'settings',
          dev: 'dev',
        }
      },
      // Catch-all route for 404 - must be last
      NotFound: '*',
    }
  }
};
