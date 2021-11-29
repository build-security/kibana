/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  ConcreteTaskInstance,
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '../../task_manager/server';

import { RunContext } from '../../task_manager/server';

export interface ScoreTaskSetupContract {
  taskManager: TaskManagerSetupContract;
}

export interface ScoreTaskStartContract {
  taskManager: TaskManagerStartContract;
}

// export class ScoreTask {
//   constructor(setupContract: ScoreTaskSetupContract) {
//     // constructor() {
//     console.log('$$$$$$$$$$$$$$$$$$$');
//     // return;
//     setupContract.taskManager.registerTaskDefinitions({
//       ScoreTask: {
//         title: 'Cleanup failed action executions',
//         // createTaskRunner: taskRunner(taskRunnerOpts),
//         createTaskRunner: taskRunner(),
//         // createTaskRunner: { run: taskRunner },
//       },
//     });
//   }
//   public start = async () => {
//     // this.wasStarted = true;
//     console.log('GGGGGGGGGGGGGGGG');
//   };
// }
export class ScoreTask {
  constructor(setupContract: ScoreTaskSetupContract) {
    console.log('1111');
    setupContract.taskManager.registerTaskDefinitions({
      foo: {
        title: 'Security Solution Endpoint Exceptions Handler',
        createTaskRunner: ({ taskInstance }: { taskInstance: ConcreteTaskInstance }) => {
          return {
            run: async () => {
              console.log('%c FOOOOOOOOO', 'font-size:100px');

              return {
                state: {},
                // schedule: {
                //   interval: '10s',
                // },
              };
            },
            cancel: async () => {},
          };
        },
      },
    });
  }
}

// export function taskRunner(opts: TaskRunnerOpts) {
export function taskRunner() {
  return ({ taskInstance }: RunContext) => {
    const { state } = taskInstance;
    return {
      async run() {
        console.log('5555555');
        // const cleanupResult = await findAndCleanupTasks(opts);
        return {
          state: {
            runs: state.runs + 1,
            // total_cleaned_up: state.total_cleaned_up + cleanupResult.successCount,
          },
          schedule: {
            interval: '5s',
          },
        };
      },
    };
  };
}

// try {
// await startContract.ensureScheduled();
// await startContract.taskManager.ensureScheduled({
//   id: this.getTaskId(),
//   taskType: ManifestTaskConstants.TYPE,
//   scope: ['securitySolution'],
//   schedule: {
//     interval: (await this.endpointAppContext.config()).packagerTaskInterval,
//   },
//   state: {},
//   params: { version: ManifestTaskConstants.VERSION },
// });
// } catch (e) {
// this.logger.error(new EndpointError(`Error scheduling task, received ${e.message}`, e));
// }
// };
