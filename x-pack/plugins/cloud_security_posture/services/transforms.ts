// /*
//  * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
//  * or more contributor license agreements. Licensed under the Elastic License
//  * 2.0; you may not use this file except in compliance with the Elastic License
//  * 2.0.
//  */

// import { KibanaServices } from '../../common/lib/kibana';

// export interface CreateTransforms {
//   signal: AbortSignal;
//   // TODO: Stronger types from the metrics_entities project
//   bodies: unknown[];
// }

// export interface CreateTransform {
//   signal: AbortSignal;
//   // TODO: Stronger types from the metrics_entities project
//   body: unknown;
// }
// type Func = () => Promise<void>;

// export interface ReturnTransform {
//   loading: boolean;
//   createTransforms: Func;
// }
// export const useCreateTransforms = (): ReturnTransform => {
//   const bodies = getTransformBodies(transformSettings);
//   try {
//     await createTransforms({ bodies, signal: abortCtrl.signal });
//   } catch (error) {
//     if (isSubscribed) {
//       if (error.body.statusCode !== 404 && error.body.status_code !== 404) {
//         errorToToaster({ title: i18n.TRANSFORM_CREATE_FAILURE, error, dispatchToaster });
//       } else {
//         // This means that the plugin is disabled and/or the user does not have permissions
//         // so we do not show an error toaster for this condition since this is a 404 error message
//       }
//     }
//   }
// };

// /**
//  * Creates transforms given a configuration
//  * @param signal AbortSignal for cancelling request
//  * @param bodies The bodies for the REST interface that is going to create them one at a time.
//  *
//  * TODO: Once there is a _bulk API, then we can do these all at once
//  * @throws An error if response is not OK
//  */
// export const createTransforms = async ({ bodies, signal }: CreateTransforms): Promise<void> => {
//   for (const body of bodies) {
//     await createTransform({ body, signal });
//   }
// };

// /**
//  * Creates a single transform given a configuration
//  * @param signal AbortSignal for cancelling request
//  * @param bodies The body for the REST interface that is going to it.
//  * @throws An error if response is not OK
//  */
// export const createTransform = async ({ body, signal }: CreateTransform): Promise<void> => {
//   // TODO: Use constants for the url here or from the metrics package.
//   return KibanaServices.get().http.fetch('/api/metrics_entities/transforms', {
//     method: 'POST',
//     body: JSON.stringify(body),
//     signal,
//   });
// };
