import * as _ from 'lodash-es'
import React from 'react'

export function makeContextHook<T>(): [React.Context<T | null>, () => T] {
  const context = React.createContext<T | null>(null)

  const hook = () => {
    const value = React.useContext(context)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return value!
  }

  return [context, hook]
}

export function makeDataCreator<T extends object>(
  defaultValue: T
): (...defaultValues: Partial<T>[]) => T {
  return (...defaultValues: Partial<T>[]): T => {
    return _.mergeWith({}, defaultValue, ...defaultValues)
  }
}
