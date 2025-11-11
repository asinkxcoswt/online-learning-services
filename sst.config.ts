import { SSTConfig } from 'sst';
import { MainStack } from './stacks/MainStack';

export default {
  config(_input) {
    return {
      name: 'online-learning-services',
      region: 'us-east-1'
    };
  },
  stacks(app) {
    app.stack(MainStack);
  }
} satisfies SSTConfig;
