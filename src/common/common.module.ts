import { Global, Module } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';
const pubSub = new PubSub();

@Module({
  providers: [{ provide: PUB_SUB, useValue: pubSub }],
  exports: [PUB_SUB],
})
@Global()
export class CommonModule {}
