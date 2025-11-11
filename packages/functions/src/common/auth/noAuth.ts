import { Authorizer } from '.';

export const noAuth: Authorizer = async () => {
  console.log('In noAuth');
};
