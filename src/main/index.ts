import NAME from '../common/common';
import __basedir from '../basepath';
import { ServerFactory } from './server/serverfactory';

console.log("NAMES is " + NAME);

export interface MainProcess {
  OnCreate(): void
  OnRun(): void
}

const factory = new ServerFactory()
const process: MainProcess = factory.GetMainProcess()

process.OnCreate()
process.OnRun()
