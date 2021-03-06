import type { Worker } from 'cluster'
import { isMaster, worker } from 'cluster'
import type { JSONValue, MessageValue } from '../utility-types'
import { AbstractWorker } from './abstract-worker'
import type { WorkerOptions } from './worker-options'

/**
 * A cluster worker used by a poolifier `ClusterPool`.
 *
 * When this worker is inactive for more than the given `maxInactiveTime`,
 * it will send a termination request to its main worker.
 *
 * If you use a `DynamicClusterPool` the extra workers that were created will be terminated,
 * but the minimum number of workers will be guaranteed.
 *
 * @template Data Type of data this worker receives from pool's execution.
 * @template Response Type of response the worker sends back to the main worker.
 *
 * @author [Christopher Quadflieg](https://github.com/Shinigami92)
 * @since 2.0.0
 */
export class ClusterWorker<
  Data extends JSONValue = JSONValue,
  Response extends JSONValue = JSONValue
> extends AbstractWorker<Worker, Data, Response> {
  /**
   * Constructs a new poolifier cluster worker.
   *
   * @param fn Function processed by the worker when the pool's `execution` function is invoked.
   * @param opts Options for the worker.
   */
  public constructor (fn: (data: Data) => Response, opts: WorkerOptions = {}) {
    super('worker-cluster-pool:pioardi', isMaster, fn, opts)

    worker.on('message', (value: MessageValue<Data>) => {
      if (value?.data && value.id) {
        // here you will receive messages
        // console.log('This is the main worker ' + isMaster)
        if (this.async) {
          this.runInAsyncScope(this.runAsync.bind(this), this, fn, value)
        } else {
          this.runInAsyncScope(this.run.bind(this), this, fn, value)
        }
      } else if (value.kill) {
        // here is time to kill this worker, just clearing the interval
        if (this.interval) clearInterval(this.interval)
        this.emitDestroy()
      }
    })
  }

  protected getMainWorker (): Worker {
    return worker
  }

  protected sendToMainWorker (message: MessageValue<Response>): void {
    this.getMainWorker().send(message)
  }

  protected handleError (e: Error | string): string {
    return e instanceof Error ? e.message : e
  }
}
